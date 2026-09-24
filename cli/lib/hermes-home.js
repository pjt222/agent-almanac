/**
 * hermes-home.js — Resolve the Hermes home directory (#604).
 *
 * Resolution order:
 *   1. $HERMES_HOME when set — authoritative for Hermes itself on every
 *      platform (docs + source). Normalized with resolve() here so that this
 *      tier returns the same SHAPE as the other two (#611); it previously
 *      returned the environment value raw while tiers 2 and 3 returned
 *      absolute paths. Only the de facto shape differed — the documented type
 *      was `{string}`, which every tier satisfied — so absoluteness is a
 *      contract this change INTRODUCES rather than one it restores.
 *
 *      Every call site JOINS a subpath onto the result: resolve(home,
 *      'config.yaml'), resolve(home, 'skills'), resolve(home, 'agents') in
 *      cli/adapters/hermes.js, and resolve(home, 'config.yaml') in the hermes
 *      rule of cli/lib/detector.js. Those calls are load-bearing and must not
 *      be deleted as newly redundant: what became redundant is only their
 *      incidental re-anchoring of a relative value, never the join itself.
 *
 *      What this fixes is the INCONSISTENCY, not the relativity. A relative
 *      $HERMES_HOME is still resolved against the process's working directory
 *      — now once, here, instead of once per call site — so two CLI
 *      invocations launched from different directories generally still see
 *      different Hermes homes. That is inherent to a relative path and is the
 *      user's choice to make; what is no longer possible is one function
 *      returning two different kinds of value depending on which tier
 *      answered.
 *
 *      "Generally" because win32 has one exception: a drive-relative value
 *      such as `C:foo` is anchored by that drive's own working directory
 *      rather than by process.cwd(), so it can stay stable while the cwd moves
 *      around another drive. The result is absolute either way, which is all
 *      this contract promises.
 *   2. Windows-native default: %LOCALAPPDATA%\hermes, accepted only when its
 *      config.yaml exists. The marker check keeps an empty default directory
 *      (or a leftover from an uninstall) from claiming detection, and keeps
 *      the fallback reachable for a junction-style ~/.hermes setup.
 *   3. ~/.hermes — the Unix default, and the legitimate home when Hermes runs
 *      inside WSL on a Windows box (the repo already tracks WSL usage:
 *      #210, #415, #416). This path must keep working.
 *
 * The adapter previously hardcoded homedir()/.hermes in detect() and both
 * base paths, so a Windows-native install (home at %LOCALAPPDATA%\hermes)
 * was invisible to `detect` and required a manual directory junction before
 * anything fired.
 */
import { existsSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';

/**
 * @returns {string} The Hermes home directory to detect against and install
 *   into, ALWAYS as an absolute path — every tier normalizes before returning,
 *   so no caller has to know which tier answered (#611). Normalized as well as
 *   absolute: the value is resolve() output, on which resolve() is idempotent.
 *
 *   $HERMES_HOME counts as unset when it is empty OR entirely whitespace,
 *   where "whitespace" is exactly what String.prototype.trim() removes —
 *   Unicode WhiteSpace plus LineTerminator. So NBSP (U+00A0), BOM (U+FEFF) and
 *   U+2000–200A all count, which is the useful direction for a value that
 *   arrived by copy-paste. U+200B ZERO WIDTH SPACE does NOT count and is still
 *   treated as a path; that hole is known and unclosed.
 *
 *   The value that is USED is never trimmed. That is a trade rather than a free
 *   win, and the case it loses is worth naming: HERMES_HOME=" /opt/hermes" does
 *   not begin with a separator, so it is RELATIVE and resolves to
 *   "<cwd>/ /opt/hermes" — a near-invisible directory — where trimming the used
 *   value would have given the caller the /opt/hermes they meant. It is kept
 *   anyway, because trimming would silently rewrite a POSIX-legal path with a
 *   leading or trailing space and leave no way to address one. Only the
 *   is-it-set test ignores whitespace.
 *
 *   Tier 2 deliberately keeps a plain truthiness test on %LOCALAPPDATA% rather
 *   than this one. The asymmetry is harmless — that tier probes for config.yaml
 *   before accepting its candidate, so a whitespace directory is rejected on
 *   the evidence — and it is left narrow rather than widened to match, because
 *   this tier has no such probe and must decide from the string alone.
 */
export function resolveHermesHome() {
  const fromEnv = process.env.HERMES_HOME;
  if (fromEnv && fromEnv.trim() !== '') return resolve(fromEnv);

  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      const winHome = resolve(localAppData, 'hermes');
      if (existsSync(resolve(winHome, 'config.yaml'))) return winHome;
    }
  }

  return resolve(homedir(), '.hermes');
}
