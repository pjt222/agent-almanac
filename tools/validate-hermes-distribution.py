#!/usr/bin/env python3
"""validate-hermes-distribution.py — install a distribution with Hermes's OWN code, in a sandbox.

The generator's build-gates (`scripts/build-hermes-distribution.js`) are this repository's
reading of what Hermes does on install. This tool is the other half of the evidence: it runs the
real `hermes_cli/profile_distribution.py` — `plan_install` and then `_copy_dist_payload`, the two
functions `hermes profile install` calls — against a generated distribution, into a temporary
profile root, and checks what actually landed. Companion issue #78's validation plan, verbatim:
"execute the pin's own plan_install / _copy_dist_payload against a candidate repo in a local temp
dir. No install on the VPS."

Nothing here touches `~/.hermes`, and that is asserted, not assumed: after loading, the harness
checks that the `hermes_cli` the module imported is the stub it wrote (by file path) and reports
the version that stub declares; before copying, it checks the resolved profile directory is
inside its own sandbox. The module's imports of `hermes_cli.profiles`, `hermes_cli.__version__`,
`hermes_cli._subprocess_compat`, `agent.skill_utils` and `utils` are satisfied by stubs written
into a temp dir and put first on `sys.path`. The stubs carry Hermes's REAL name rule
(`_PROFILE_ID_RE`, `_RESERVED_NAMES`) and its REAL skill-path exclusions (`EXCLUDED_SKILL_DIRS`,
`SKILL_SUPPORT_DIRS`), copied from upstream main on 2026-09-02 — a permissive stub would prove
nothing about the name.

The Hermes module itself is NOT in this repository (it is upstream code, and the operator's copy
came off the VPS). Point `--module` at one:

    gh api repos/NousResearch/hermes-agent/contents/hermes_cli/profile_distribution.py \\
        --jq .content | base64 -d > /tmp/profile_distribution.py          # upstream main
    # or: the deployed pin, copied read-only from the host that runs it (scp; never executed there)

Usage:

    python3 tools/validate-hermes-distribution.py --module /tmp/profile_distribution.py \\
        --dist /path/to/generated-dir-or-git-url --almanac /path/to/agent-almanac
    python3 tools/validate-hermes-distribution.py --module /tmp/profile_distribution.py --verify

`--almanac ROOT` derives the expectations (version from package.json, skill count from
skills/_registry.yml, SOUL.md bytes); `--expect-version`, `--expect-skills` and `--expect-soul`
set or override them one by one (`--expect-skills 0` is refused: it would make check (b)
vacuous). `--hermes-version` (default 0.13.0, the pin the operator's VPS ran until 2026-09-02; it now runs
v2026.8.31, so pass that when handing in that module) is what the stubbed `hermes_cli.__version__`
reports, so `hermes_requires` is checked against it. A `--dist` that is
a local directory is staged AS IS by Hermes — a clone's `.git/` would be copied into the profile
too — so hand it the generator's output, not a clone.

The sixteen checks, lettered as in the companion's done-criteria for #78:

  install              plan_install and _copy_dist_payload ran. Once the source has resolved
                       (a git URL by the module's own rule, or an existing directory — checked
                       first, exit 2 otherwise), a refusal here is Hermes rejecting the
                       distribution: a finding, exit 1, the same verdict --verify gives the two
                       plants that depend on it.
  a.version            manifest version == expected, through the module's own DistributionManifest.
  a.env_requires       empty.        a.distribution_owned  empty.        a.name  the expected id.
  a.hermes_requires    non-empty AND re-checked with the module's own check_hermes_requires
                       against the stubbed version.
  b.module_count       the module's `_count_skills(staged)` == expected — the pin's ruler.
  b.landed_count       SKILL.md files that actually arrived in the profile == expected — the
                       consumer's ruler. Two counts because the two differ between versions.
  c.soul               the installed SOUL.md is byte-identical to the expected one.
  d.root               the profile root holds only distribution content: a subset of the five
                       entries the generator emits (plus `.env.EXAMPLE`, which Hermes may add),
                       AND nothing of the staged root minus Hermes's user-owned names is missing.
                       (An entry beyond the staged root is also refused, but _copy_dist_payload
                       writes none, so that arm is unreachable through it — stated, not claimed.)
  d.user_owned_set     the module's USER_OWNED_EXCLUDE equals the generator's: read from
                       scripts/build-hermes-distribution.js through node when --almanac is given,
                       from this file's own pinned copy otherwise — the detail says which. A
                       module with a different set would be measuring with a different ruler.
  d.excluded_set       the stubbed EXCLUDED_SKILL_DIRS equals the generator's, the same way; it is
                       what decides upstream's _count_skills, so the stub and the gate must agree.
  d.user_owned_nested  zero directories below the profile root named in USER_OWNED_EXCLUDE.
  d.symlinks           zero symlinks in the staged tree or the profile.
  e.nothing_dropped    every regular file under the staged tree reached the profile with equal
                       bytes — the install's ignore filter dropped nothing.
  e.manifest_stamped   the installed manifest carries `source` and `installed_at`, which is how
                       `hermes profile update` finds its way back.

`--verify` runs the checks against a synthetic distribution that must pass — and stops, exit 1,
if it does not, so a module refusing every install for an unrelated reason cannot read as a
row of detections — then plants fourteen defects, each required to redden one of ITS named
checks: a nested `cache/x.md` (dropped by the pin's depth filter, a name collision upstream),
a root-level `cache/x.md` (skipped at the root by every version), a `cache/SKILL.md` that only
the count sees, a preserved `references/SKILL.md`, a symlink (dereferenced by the pin, refused
outright upstream), an edited SOUL.md, a wrong version, a `distribution_owned:` block, an
`env_requires:` block, a wrong expected name, a root `package.json`, a root `agents/`, an empty
`hermes_requires`, and a `hermes_requires` the module must refuse. That covers thirteen of the
sixteen checks; the three it cannot plant are stated rather than hidden — `d.user_owned_set`
and `d.excluded_set` assert constants (the module's and the stub's against the generator's),
and `e.manifest_stamped` asserts the module's own write — so a module that changes those turns
something red without a plant. Under `--verify` the two set checks run against this file's
pinned copies, since there is no `--almanac` to read the generator from.

Exit codes: 0 every check passed; 1 at least one failed, including Hermes refusing the
distribution at install; 2 usage, a `--dist` that is neither a git URL nor a directory, an
unreadable module, a stub the module did not actually import, a profile directory outside the
sandbox, or PyYAML absent.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import os
import sys
import tempfile
import textwrap
from pathlib import Path

DEFAULT_NAME = "agent-almanac"
DEFAULT_HERMES_VERSION = "0.13.0"

# What the generator emits at the root, and the one entry Hermes itself may add on install.
GENERATOR_ROOT_ENTRIES = frozenset({"distribution.yaml", "SOUL.md", "README.md", "LICENSE", "skills"})
HERMES_MAY_ADD = frozenset({".env.EXAMPLE"})

# hermes_cli/profile_distribution.py USER_OWNED_EXCLUDE — the 37 names the generator gates on,
# identical at the v0.13.0 pin and upstream main (2026-09-02). Check d.user_owned_set compares
# the module handed in against this, so a different ruler is a red row, not a silent re-scope.
EXPECTED_USER_OWNED = frozenset({
    "auth.json", ".env",
    "state.db", "state.db-shm", "state.db-wal",
    "hermes_state.db", "response_store.db",
    "response_store.db-shm", "response_store.db-wal",
    "gateway.pid", "gateway_state.json", "processes.json",
    "auth.lock", "active_profile", ".update_check",
    "errors.log", ".hermes_history",
    "memories", "sessions", "logs", "plans", "workspace", "home",
    "image_cache", "audio_cache", "document_cache",
    "browser_screenshots", "checkpoints", "sandboxes",
    "backups", "cache",
    "hermes-agent", ".worktrees", "profiles", "bin", "node_modules",
    "local",
})

# hermes_cli/profiles.py, upstream main 2026-09-02. Copied so the stub validates like Hermes does.
STUB_PROFILES = r'''
import re
from pathlib import Path
import os

_PROFILE_ID_RE = re.compile(r"^[a-z0-9][a-z0-9_-]{0,63}$")
_RESERVED_NAMES = frozenset({"hermes", "default", "test", "tmp", "root", "sudo"})
PROFILES_ROOT = Path(os.environ["VALIDATE_HERMES_PROFILES_ROOT"])


def normalize_profile_name(name):
    if not isinstance(name, str):
        name = str(name)
    stripped = name.strip()
    if not stripped:
        raise ValueError("profile name cannot be empty")
    if stripped.casefold() == "default":
        return "default"
    return stripped.lower()


def validate_profile_name(name):
    if name == "default":
        return
    if not _PROFILE_ID_RE.match(name):
        raise ValueError(f"Invalid profile name {name!r}. Must match [a-z0-9][a-z0-9_-]{{0,63}}")
    if name in _RESERVED_NAMES:
        raise ValueError(f"Profile name {name!r} is reserved")


def get_profile_dir(name):
    canon = normalize_profile_name(name)
    if canon == "default":
        raise RuntimeError("stub: the default profile is never a target here")
    return PROFILES_ROOT / canon


def check_alias_collision(name):
    return "stub: aliases are not created by this harness"


def create_wrapper_script(name):
    raise RuntimeError("stub: create_wrapper_script must not be reached")
'''

# agent/skill_utils.py, upstream main 2026-09-02 — only the pieces profile_distribution imports.
STUB_SKILL_UTILS = r'''
from pathlib import Path, PurePath

EXCLUDED_SKILL_DIRS = frozenset((
    ".git", ".github", ".hub", ".archive", ".venv", "venv", "node_modules", "site-packages",
    "__pycache__", ".tox", ".nox", ".pytest_cache", ".mypy_cache", ".ruff_cache",
))
SKILL_SUPPORT_DIRS = frozenset(("references", "templates", "assets", "scripts"))


def is_skill_support_path(path, *, root=None):
    path_obj = path if isinstance(path, Path) else Path(str(path))
    parts = path_obj.parts
    for idx, part in enumerate(parts[:-1]):
        if part not in SKILL_SUPPORT_DIRS or idx == 0:
            continue
        skill_root = Path(*parts[:idx])
        if root is not None and not path_obj.is_absolute():
            skill_root = root / skill_root
        if (skill_root / "SKILL.md").exists():
            return True
    return False


def is_excluded_skill_path(path, *, root=None):
    try:
        parts = path.parts
    except AttributeError:
        parts = PurePath(str(path)).parts
    return any(part in EXCLUDED_SKILL_DIRS for part in parts) or is_skill_support_path(path, root=root)
'''

# hermes_cli/_subprocess_compat.py: upstream's returns a copy of the environment with the git
# prompt disabled. Only the git-URL arm reaches it; a local-directory install never does.
STUB_SUBPROCESS_COMPAT = r'''
import os


def noninteractive_git_env():
    env = dict(os.environ)
    env["GIT_TERMINAL_PROMPT"] = "0"
    return env
'''

# utils.atomic_yaml_write, imported lazily by upstream's write_manifest since the pin. The real
# one writes via a temp file and rename; a plain write is equivalent for a check that only reads
# the result back.
STUB_UTILS = r'''
import os
import yaml


def atomic_yaml_write(path, data, sort_keys=False, default_flow_style=False, create_mode=None, **_ignored):
    text = yaml.safe_dump(data, sort_keys=sort_keys, default_flow_style=default_flow_style)
    existed = os.path.exists(path)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(text)
    if create_mode is not None and not existed:
        os.chmod(path, create_mode)
'''

# agent/skill_utils.py EXCLUDED_SKILL_DIRS, pinned here for --verify; with --almanac the generator's
# own export is read instead, so the stub above and the gate cannot drift apart unnoticed.
EXPECTED_EXCLUDED_SKILL_DIRS = frozenset((
    ".git", ".github", ".hub", ".archive", ".venv", "venv", "node_modules", "site-packages",
    "__pycache__", ".tox", ".nox", ".pytest_cache", ".mypy_cache", ".ruff_cache",
))


def generator_sets(almanac_root):
    """The two Hermes name sets as the GENERATOR exports them, read through node.

    Returns {"user_owned": frozenset, "excluded": frozenset, "source": str}. With no almanac root,
    or when node cannot run the generator, the harness's pinned copies are returned and `source`
    says so — the check detail names which ruler was used, so a fallback is never silent.
    """
    if almanac_root is None:
        return {"user_owned": EXPECTED_USER_OWNED, "excluded": EXPECTED_EXCLUDED_SKILL_DIRS, "source": "the harness's pinned copies (no --almanac)"}
    script = Path(almanac_root) / "scripts" / "build-hermes-distribution.js"
    # The path travels in the environment, not argv: with `node -e`, an extra argument becomes
    # process.argv[1], which the generator's own entry guard would take as "run main()".
    probe = (
        "import(require('node:url').pathToFileURL(process.env.HERMES_GENERATOR).href)"
        ".then(m => console.log(JSON.stringify({u: m.USER_OWNED_EXCLUDE, e: m.EXCLUDED_SKILL_DIRS})))"
        ".catch(e => { console.error(String(e)); process.exit(3); })"
    )
    try:
        import subprocess  # noqa: PLC0415

        out = subprocess.run(["node", "-e", probe], capture_output=True, text=True, timeout=60, check=False,
                             env={**os.environ, "HERMES_GENERATOR": str(script.resolve())})
    except (OSError, subprocess.SubprocessError) as exc:
        raise Usage(f"could not run node to read the generator's constants from {script}: {exc}") from exc
    if out.returncode != 0:
        raise Usage(f"reading the generator's constants failed (exit {out.returncode}): {out.stderr.strip()} — run npm ci in {almanac_root}?")
    data = json.loads(out.stdout)
    return {"user_owned": frozenset(data["u"]), "excluded": frozenset(data["e"]), "source": f"the generator at {script}"}


REQUIRED_MODULE_ATTRS = (
    "plan_install", "_copy_dist_payload", "_count_skills", "USER_OWNED_EXCLUDE", "read_manifest",
    "MANIFEST_FILENAME", "check_hermes_requires",
)


class Usage(Exception):
    """Exit 2."""


def write_stubs(stub_dir: Path, hermes_version: str) -> None:
    (stub_dir / "hermes_cli").mkdir(parents=True)
    (stub_dir / "hermes_cli" / "__init__.py").write_text(f'__version__ = "{hermes_version}"\n', encoding="utf-8")
    (stub_dir / "hermes_cli" / "profiles.py").write_text(STUB_PROFILES, encoding="utf-8")
    (stub_dir / "hermes_cli" / "_subprocess_compat.py").write_text(STUB_SUBPROCESS_COMPAT, encoding="utf-8")
    (stub_dir / "agent").mkdir()
    (stub_dir / "agent" / "__init__.py").write_text("", encoding="utf-8")
    (stub_dir / "agent" / "skill_utils.py").write_text(STUB_SKILL_UTILS, encoding="utf-8")
    (stub_dir / "utils.py").write_text(STUB_UTILS, encoding="utf-8")


def _forget_stub_modules() -> None:
    for name in [n for n in sys.modules if n in ("hermes_cli", "agent", "utils") or n.startswith(("hermes_cli.", "agent."))]:
        del sys.modules[name]


def load_module(module_path: Path, stub_dir: Path, hermes_version: str):
    if not module_path.is_file():
        raise Usage(f"--module {module_path} is not a file")
    sys.path.insert(0, str(stub_dir))
    _forget_stub_modules()
    spec = importlib.util.spec_from_file_location("hermes_profile_distribution", str(module_path))
    if spec is None or spec.loader is None:
        raise Usage(f"cannot load {module_path} as a Python module")
    mod = importlib.util.module_from_spec(spec)
    # Registered BEFORE execution: with `from __future__ import annotations`, `@dataclass` resolves
    # its field annotations through `sys.modules[cls.__module__].__dict__`, and an unregistered
    # module fails there with "'NoneType' object has no attribute '__dict__'".
    sys.modules[spec.name] = mod
    try:
        spec.loader.exec_module(mod)
    except Exception as exc:  # noqa: BLE001 — report and exit 2, whatever it was
        raise Usage(f"importing {module_path} failed: {type(exc).__name__}: {exc}") from exc
    for required in REQUIRED_MODULE_ATTRS:
        if not hasattr(mod, required):
            raise Usage(f"{module_path} has no {required}; is this hermes_cli/profile_distribution.py?")
    # The positive control behind "nothing here touches ~/.hermes" and "as Hermes <version>":
    # every stub the module can import must be OURS — hermes_cli (and through its __path__,
    # profiles and _subprocess_compat), agent.skill_utils (which decides upstream's count) and
    # utils — and the version stub must say what we told it to say.
    for stub_name in ("hermes_cli", "agent.skill_utils", "utils"):
        try:
            stub = importlib.import_module(stub_name)
        except ImportError as exc:
            raise Usage(f"stub {stub_name} did not import: {exc}") from exc
        stub_file = Path(stub.__file__).resolve()
        if not stub_file.is_relative_to(stub_dir.resolve()):
            raise Usage(f"{stub_name} resolved to {stub_file}, not to the harness stub — a real installation shadows it; refusing to run")
    hermes_cli = sys.modules["hermes_cli"]
    if getattr(hermes_cli, "__version__", None) != hermes_version:
        raise Usage(f"stub hermes_cli reports version {getattr(hermes_cli, '__version__', None)!r}, expected {hermes_version!r}")
    return mod


# ── Expectations ───────────────────────────────────────────────────────────────────────────


def expectations_from_almanac(root: Path) -> dict:
    pkg = json.loads((root / "package.json").read_text(encoding="utf-8"))
    registry_text = (root / "skills" / "_registry.yml").read_text(encoding="utf-8")
    total = None
    for line in registry_text.splitlines():
        if line.startswith("total_skills:"):
            total = int(line.split(":", 1)[1].strip())
            break
    if total is None:
        raise Usage(f"{root / 'skills' / '_registry.yml'} has no total_skills line")
    return {
        "version": str(pkg["version"]),
        "skills": total,
        "soul": (root / "SOUL.md").read_bytes(),
    }


# ── The checks ─────────────────────────────────────────────────────────────────────────────


def _walk(base: Path, *, skip_git: bool):
    for p in sorted(base.rglob("*")):
        if skip_git and ".git" in p.relative_to(base).parts:
            continue
        yield p


def run_checks(mod, dist_source: str, expect: dict, hermes_version: str, sandbox: Path, name: str = DEFAULT_NAME, rulers: dict | None = None) -> dict:
    """Install `dist_source` with the module into `sandbox` and evaluate the sixteen checks."""
    rulers = rulers or generator_sets(None)
    sandbox = sandbox.resolve()
    profiles_root = sandbox / "profiles"
    profiles_root.mkdir(parents=True, exist_ok=True)
    os.environ["VALIDATE_HERMES_PROFILES_ROOT"] = str(profiles_root)
    # plan_install imports hermes_cli.profiles lazily and the stub reads the env var at import,
    # so drop any earlier import: every call gets its own profile root, not the first one's.
    sys.modules.pop("hermes_cli.profiles", None)
    workdir = sandbox / "work"
    workdir.mkdir(parents=True, exist_ok=True)

    results = []

    def record(key, ok, detail):
        results.append({"check": key, "ok": bool(ok), "detail": detail})

    try:
        plan = mod.plan_install(dist_source, workdir)
    except Exception as exc:  # noqa: BLE001 — the install refusing IS a result
        record("install", False, f"plan_install raised {type(exc).__name__}: {exc}")
        return {"hermes_version": hermes_version, "installed": False, "results": results}

    staged = Path(plan.staged_dir)
    target = Path(plan.target_dir).resolve()
    manifest = plan.manifest
    if not target.is_relative_to(sandbox):
        raise Usage(f"the module resolved the profile directory to {target}, outside the sandbox {sandbox}; refusing to copy")
    try:
        mod._copy_dist_payload(staged, target, manifest, preserve_config=False)
    except Exception as exc:  # noqa: BLE001
        record("install", False, f"_copy_dist_payload raised {type(exc).__name__}: {exc}")
        return {"hermes_version": hermes_version, "installed": False, "results": results}
    record("install", True, f"installed into {target}")

    # (a) manifest
    record("a.version", manifest.version == expect["version"], f"manifest version {manifest.version!r}, expected {expect['version']!r}")
    record("a.env_requires", not manifest.env_requires, f"env_requires has {len(manifest.env_requires)} entries")
    record("a.distribution_owned", not manifest.distribution_owned, f"distribution_owned has {len(manifest.distribution_owned)} entries")
    record("a.name", manifest.name == name, f"resolved name {manifest.name!r}, expected {name!r}")
    requires_ok = bool(manifest.hermes_requires)
    requires_detail = f"hermes_requires {manifest.hermes_requires!r}"
    if requires_ok:
        try:
            mod.check_hermes_requires(manifest.hermes_requires, hermes_version)
            requires_detail += f" re-checked with the module's own comparator against Hermes {hermes_version}"
        except Exception as exc:  # noqa: BLE001
            requires_ok = False
            requires_detail += f" rejected by the module's comparator: {exc}"
    else:
        requires_detail += " is empty — no floor is stated"
    record("a.hermes_requires", requires_ok, requires_detail)

    # (b) counts, two rulers
    module_count = mod._count_skills(staged)
    landed = sum(1 for p in _walk(target / "skills", skip_git=True) if p.name == "SKILL.md" and p.is_file()) if (target / "skills").is_dir() else 0
    record("b.module_count", module_count == expect["skills"], f"module _count_skills(staged) = {module_count}, expected {expect['skills']}")
    record("b.landed_count", landed == expect["skills"], f"SKILL.md files in the installed profile = {landed}, expected {expect['skills']}")

    # (c) soul bytes
    soul_path = target / "SOUL.md"
    soul_ok = soul_path.is_file() and soul_path.read_bytes() == expect["soul"]
    record("c.soul", soul_ok, "installed SOUL.md is byte-identical to the expected one" if soul_ok else "installed SOUL.md missing or differs")

    # (d) root hygiene, the module's ruler, nested user-owned names, symlinks
    user_owned = set(mod.USER_OWNED_EXCLUDE)
    root_entries = {p.name for p in target.iterdir()}
    staged_root = {p.name for p in staged.iterdir()}
    expected_root = {(".env.EXAMPLE" if n == ".env.template" else n) for n in staged_root if n not in user_owned}
    not_allowed = sorted(root_entries - GENERATOR_ROOT_ENTRIES - HERMES_MAY_ADD)
    # `.env.EXAMPLE` is also synthesised from env_requires when no template was staged, so it
    # may appear without a staged counterpart; a.env_requires is the check that reddens on that.
    extra = sorted(root_entries - expected_root - HERMES_MAY_ADD)
    missing = sorted(expected_root - root_entries)
    record("d.root", not not_allowed and not extra and not missing,
           f"profile root {sorted(root_entries)}; not distribution content: {not_allowed or 'none'}; "
           f"beyond the staged root minus user-owned names: {extra or 'none'}; missing from it: {missing or 'none'}")
    ruler_diff = sorted(user_owned ^ rulers["user_owned"])
    record("d.user_owned_set", not ruler_diff, f"module USER_OWNED_EXCLUDE has {len(user_owned)} names; symmetric difference with {rulers['source']} ({len(rulers['user_owned'])}): {ruler_diff or 'none'}")
    stub_excluded = frozenset(sys.modules["agent.skill_utils"].EXCLUDED_SKILL_DIRS)
    excluded_diff = sorted(stub_excluded ^ rulers["excluded"])
    record("d.excluded_set", not excluded_diff, f"stub EXCLUDED_SKILL_DIRS has {len(stub_excluded)} names; symmetric difference with {rulers['source']} ({len(rulers['excluded'])}): {excluded_diff or 'none'}")
    nested = sorted(str(p.relative_to(target)) for p in _walk(target, skip_git=True) if p.is_dir() and p.name in user_owned and len(p.relative_to(target).parts) > 1)
    record("d.user_owned_nested", not nested, f"nested user-owned directory names: {nested or 'none'}")
    staged_links = sorted(str(p.relative_to(staged)) for p in _walk(staged, skip_git=True) if p.is_symlink())
    target_links = sorted(str(p.relative_to(target)) for p in _walk(target, skip_git=False) if p.is_symlink())
    record("d.symlinks", not staged_links and not target_links, f"symlinks staged={staged_links or 'none'} installed={target_links or 'none'}")

    # (e) nothing dropped, manifest stamped
    dropped = []
    differing = []
    for p in _walk(staged, skip_git=True):
        if not p.is_file() or p.is_symlink():
            continue
        rel = p.relative_to(staged)
        if rel.name == mod.MANIFEST_FILENAME and len(rel.parts) == 1:
            continue  # rewritten by write_manifest, checked below
        q = target / rel
        if not q.is_file():
            dropped.append(str(rel))
        elif q.read_bytes() != p.read_bytes():
            differing.append(str(rel))
    record("e.nothing_dropped", not dropped and not differing, f"dropped={dropped or 'none'} differing={differing or 'none'}")
    installed_manifest = mod.read_manifest(target)
    stamped = installed_manifest is not None and bool(installed_manifest.source) and bool(installed_manifest.installed_at)
    record("e.manifest_stamped", stamped, "installed manifest carries source and installed_at" if stamped else "installed manifest lacks source/installed_at")

    return {"hermes_version": hermes_version, "installed": True, "results": results}


# ── --verify ───────────────────────────────────────────────────────────────────────────────


def synthetic_distribution(base: Path, *, version="1.2.3", soul=b"# Soul\n", skills=("alpha", "beta"), extra_manifest="") -> Path:
    base.mkdir(parents=True)
    (base / "distribution.yaml").write_text(
        textwrap.dedent(f"""\
        name: {DEFAULT_NAME}
        version: {version}
        description: "synthetic"
        hermes_requires: ">=0.13.0"
        license: MIT
        """) + extra_manifest,
        encoding="utf-8",
    )
    (base / "SOUL.md").write_bytes(soul)
    (base / "README.md").write_text("generated\n", encoding="utf-8")
    (base / "LICENSE").write_text("MIT\n", encoding="utf-8")
    for s in skills:
        (base / "skills" / s).mkdir(parents=True)
        (base / "skills" / s / "SKILL.md").write_text(f"# {s}\n", encoding="utf-8")
    (base / "skills" / skills[-1] / "references").mkdir()
    (base / "skills" / skills[-1] / "references" / "notes.md").write_text("notes\n", encoding="utf-8")
    return base


def verify(mod, hermes_version: str, tmp: Path) -> int:
    expect = {"version": "1.2.3", "skills": 2, "soul": b"# Soul\n"}
    failures = 0
    counter = 0

    def sandbox() -> Path:
        nonlocal counter
        counter += 1
        return tmp / f"s{counter}"

    def outcome(label, report, expected_red: tuple[str, ...]):
        """A planted case passes only if one of ITS named checks went red. `install` counts only
        where it is named — a module refusing every install for an unrelated reason must not read
        as a row of detections."""
        nonlocal failures
        failed = [r["check"] for r in report["results"] if not r["ok"]]
        ok = any(f in expected_red for f in failed)
        print(f"  {'ok' if ok else 'FAIL'}  {label}: red = {failed or 'NONE'}; expected one of {list(expected_red)}")
        if not ok:
            failures += 1

    print(f"verify: module {mod.__file__}, Hermes {hermes_version}")

    clean_report = run_checks(mod, str(synthetic_distribution(tmp / "clean")), expect, hermes_version, sandbox())
    clean_failed = [r for r in clean_report["results"] if not r["ok"]]
    if clean_failed:
        # Without a green baseline the planted cases cannot mean anything — stop here, loudly.
        print("  FAIL  clean synthetic distribution: unexpected red")
        for r in clean_failed:
            print(f"        {r['check']}: {r['detail']}")
        print("verify: baseline is red; planted cases not run")
        return 1
    print("  ok    clean synthetic distribution: all checks passed")

    d = synthetic_distribution(tmp / "nested-cache")
    (d / "skills" / "alpha" / "cache").mkdir()
    (d / "skills" / "alpha" / "cache" / "x.md").write_text("x\n", encoding="utf-8")
    # The pin filters at depth (e goes red); upstream copies it and only the name collision
    # remains (d goes red). Either is the defect detected.
    outcome("planted skills/alpha/cache/x.md (nested user-owned name)", run_checks(mod, str(d), expect, hermes_version, sandbox()), ("e.nothing_dropped", "d.user_owned_nested"))

    d = synthetic_distribution(tmp / "root-cache")
    (d / "cache").mkdir()
    (d / "cache" / "x.md").write_text("x\n", encoding="utf-8")
    # Every version skips a user-owned name at the staged root, so only e can see it.
    outcome("planted root-level cache/x.md (dropped at the root by every version)", run_checks(mod, str(d), expect, hermes_version, sandbox()), ("e.nothing_dropped",))

    d = synthetic_distribution(tmp / "count-only")
    (d / "skills" / "alpha" / "cache").mkdir()
    (d / "skills" / "alpha" / "cache" / "SKILL.md").write_text("# extra\n", encoding="utf-8")
    outcome("planted skills/alpha/cache/SKILL.md (the module's own count moves)", run_checks(mod, str(d), expect, hermes_version, sandbox()), ("b.module_count",))

    d = synthetic_distribution(tmp / "nested-skill")
    (d / "skills" / "beta" / "references" / "SKILL.md").write_text("# preserved\n", encoding="utf-8")
    outcome("planted skills/beta/references/SKILL.md (a preserved package)", run_checks(mod, str(d), expect, hermes_version, sandbox()), ("b.module_count", "b.landed_count"))

    d = synthetic_distribution(tmp / "symlink")
    os.symlink("SKILL.md", d / "skills" / "alpha" / "link.md")
    # The pin dereferences symlinks on copy, so the harness's own check must catch it; upstream
    # refuses the tree in plan_install, which is also a detection.
    outcome("planted symlink skills/alpha/link.md", run_checks(mod, str(d), expect, hermes_version, sandbox()), ("d.symlinks", "install"))

    d = synthetic_distribution(tmp / "soul", soul=b"# Other\n")
    outcome("planted differing SOUL.md", run_checks(mod, str(d), expect, hermes_version, sandbox()), ("c.soul",))

    d = synthetic_distribution(tmp / "version", version="0.0.1")
    outcome("planted version 0.0.1", run_checks(mod, str(d), expect, hermes_version, sandbox()), ("a.version",))

    d = synthetic_distribution(tmp / "owned", extra_manifest="distribution_owned:\n  - skills\n")
    outcome("planted distribution_owned block", run_checks(mod, str(d), expect, hermes_version, sandbox()), ("a.distribution_owned",))

    d = synthetic_distribution(tmp / "env", extra_manifest="env_requires:\n  - name: FOO\n    description: planted\n")
    outcome("planted env_requires block", run_checks(mod, str(d), expect, hermes_version, sandbox()), ("a.env_requires",))

    d = synthetic_distribution(tmp / "name")
    outcome("planted expectation --name other against a manifest named agent-almanac", run_checks(mod, str(d), expect, hermes_version, sandbox(), name="other"), ("a.name",))

    d = synthetic_distribution(tmp / "root-file")
    (d / "package.json").write_text("{}\n", encoding="utf-8")
    outcome("planted root package.json (repository content at the profile root)", run_checks(mod, str(d), expect, hermes_version, sandbox()), ("d.root",))

    d = synthetic_distribution(tmp / "root-dir")
    (d / "agents").mkdir()
    (d / "agents" / "x.md").write_text("x\n", encoding="utf-8")
    outcome("planted root agents/ (an entry the generator never emits)", run_checks(mod, str(d), expect, hermes_version, sandbox()), ("d.root",))

    # An EMPTY floor installs anywhere and states nothing — the check's own red path, distinct
    # from the module refusing a floor it cannot satisfy (next plant).
    d = synthetic_distribution(tmp / "no-requires")
    text = (d / "distribution.yaml").read_text(encoding="utf-8").replace('hermes_requires: ">=0.13.0"\n', "")
    (d / "distribution.yaml").write_text(text, encoding="utf-8")
    outcome("planted empty hermes_requires (no floor stated)", run_checks(mod, str(d), expect, hermes_version, sandbox()), ("a.hermes_requires",))

    # Five digits, because upstream versions are date-based (2026.8.18 satisfies >=99.0.0) and a
    # plant the module accepts is not a plant.
    d = synthetic_distribution(tmp / "requires")
    text = (d / "distribution.yaml").read_text(encoding="utf-8").replace('">=0.13.0"', '">=99999.0.0"')
    (d / "distribution.yaml").write_text(text, encoding="utf-8")
    outcome("planted hermes_requires >=99999.0.0 (install must refuse)", run_checks(mod, str(d), expect, hermes_version, sandbox()), ("install",))

    print(f"verify: {failures} failure(s) across 14 plants")
    return 1 if failures else 0


# ── CLI ────────────────────────────────────────────────────────────────────────────────────


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter, epilog=__doc__)
    ap.add_argument("--module", required=True, help="path to Hermes's hermes_cli/profile_distribution.py")
    ap.add_argument("--dist", help="generated distribution: a local directory (the generator's output, not a clone) or a git URL")
    ap.add_argument("--almanac", help="agent-almanac checkout to derive version, skill count and SOUL.md from")
    ap.add_argument("--expect-version")
    ap.add_argument("--expect-skills", type=int)
    ap.add_argument("--expect-soul", help="path to the SOUL.md the install must reproduce byte for byte")
    ap.add_argument("--name", default=DEFAULT_NAME, help=f"expected resolved profile name (default {DEFAULT_NAME})")
    ap.add_argument("--hermes-version", default=DEFAULT_HERMES_VERSION, help=f"what the stubbed hermes_cli reports (default {DEFAULT_HERMES_VERSION})")
    ap.add_argument("--json", action="store_true", help="print the report as JSON")
    ap.add_argument("--verify", action="store_true", help="self-test: a clean synthetic distribution must pass, thirteen planted defects must each fail")
    args = ap.parse_args(argv)

    try:
        try:
            import yaml  # noqa: F401,PLC0415 — the module and the utils stub both need it
        except ImportError as exc:
            raise Usage("PyYAML is not installed; the Hermes module imports it (pip install pyyaml)") from exc
        with tempfile.TemporaryDirectory(prefix="validate-hermes-dist-") as tmp_str:
            tmp = Path(tmp_str)
            stub_dir = tmp / "stubs"
            write_stubs(stub_dir, args.hermes_version)
            mod = load_module(Path(args.module).expanduser().resolve(), stub_dir, args.hermes_version)

            if args.verify:
                if args.dist or args.almanac:
                    raise Usage("--verify takes no --dist or --almanac")
                return verify(mod, args.hermes_version, tmp / "verify")

            if not args.dist:
                raise Usage("--dist is required (or --verify)")
            # The source must resolve BEFORE anything is a finding: validated with the module's own
            # predicate (a git URL by its rule, or an existing directory), never a proxy for it.
            looks_like_url = getattr(mod, "_looks_like_git_url", None)
            is_url = bool(looks_like_url(args.dist)) if callable(looks_like_url) else False
            if not is_url and not Path(args.dist).expanduser().is_dir():
                raise Usage(f"--dist {args.dist!r} is neither a git URL by the module's own rule nor an existing directory")
            almanac_root = Path(args.almanac).expanduser().resolve() if args.almanac else None
            expect = expectations_from_almanac(almanac_root) if almanac_root else {}
            if args.expect_version:
                expect["version"] = args.expect_version
            if args.expect_skills is not None:
                expect["skills"] = args.expect_skills
            if args.expect_soul:
                expect["soul"] = Path(args.expect_soul).expanduser().read_bytes()
            missing = [k for k in ("version", "skills", "soul") if k not in expect]
            if missing:
                raise Usage(f"no expectation for {', '.join(missing)}: pass --almanac ROOT or the --expect-* flags")
            if expect["skills"] <= 0:
                raise Usage("an expected skill count of 0 would make check (b) vacuous; refusing")

            report = run_checks(mod, args.dist, expect, args.hermes_version, tmp / "sandbox", name=args.name, rulers=generator_sets(almanac_root))
            report["module"] = str(Path(args.module).resolve())
            report["dist"] = args.dist
            failed = [r for r in report["results"] if not r["ok"]]
            if args.json:
                print(json.dumps(report, indent=2))
            else:
                print(f"module {report['module']} as Hermes {args.hermes_version} (stub asserted); dist {args.dist}")
                for r in report["results"]:
                    print(f"  {'ok  ' if r['ok'] else 'FAIL'} {r['check']}: {r['detail']}")
                if not report["installed"]:
                    print("FAIL: Hermes refused the distribution — the install itself raised; no further check ran")
                else:
                    print("OK: every check passed" if not failed else f"FAIL: {len(failed)} check(s) failed")
            # The source resolved above, so an install that raises here is Hermes refusing the
            # distribution — a finding about the distribution, exit 1, the same verdict --verify
            # gives the two plants that depend on it. Exit 2 is for what could not be measured.
            return 1 if (failed or not report["installed"]) else 0
    except Usage as exc:
        print(f"validate-hermes-distribution: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
