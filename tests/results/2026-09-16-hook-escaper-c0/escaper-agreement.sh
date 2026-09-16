#!/usr/bin/env bash
# Does the proposed awk escaper agree with `jq -Rsa .` on every input, including C0 bytes?
# Run under bash deliberately: the published hook is #!/usr/bin/env bash.
set -uo pipefail

AWK_PROG='
  BEGIN {
    ORS = ""
    for (i = 1; i < 32; i++) esc[sprintf("%c", i)] = sprintf("\\u%04x", i)
    esc["\t"] = "\\t"
    print "\""
  }
  {
    line = $0
    gsub(/\\/, "\\\\", line)
    gsub(/"/, "\\\"", line)
    if (line ~ /[\001-\037]/) {
      out = ""
      n = length(line)
      for (i = 1; i <= n; i++) {
        ch = substr(line, i, 1)
        out = out (ch in esc ? esc[ch] : ch)
      }
      line = out
    }
    if (NR > 1) print "\\n"
    print line
  }
  END { print "\"" }
'

# name : printf format producing the input
cases=(
  'plain:hello world\n'
  'quote:say "hi"\n'
  'backslash:a\\\\b\n'
  'tab:a\tb\n'
  'twolines:one\ntwo\n'
  'literal-backslash-n:a\\\\nb\n'
  'crlf:line\r\n'
  'cr-midline:progress: 50%%\rprogress: 100%%\n'
  'esc-ansi:\033[32mPASS\033[0m 16/16\n'
  'bs-vt-ff:a\010b\013c\014d\n'
  'soh:\001start\n'
  'utf8:M\303\274nchen \344\270\255\346\226\207 \360\237\232\200\n'
  'empty:\n'
  'backslash-then-quote:a\\\\"b\n'
  'all-controls:\001\002\003\004\005\006\007\010\013\014\016\017\n'
)

compare_one() { # $1 = awk binary
  local AWKBIN="$1" fails=0 total=0
  printf '  %-22s %-9s %-9s %s\n' CASE AWK JQ AGREE
  for entry in "${cases[@]}"; do
    local name="${entry%%:*}" fmt="${entry#*:}"
    printf "$fmt" > "$TMP/in"
    local a j av jv
    a=$("$AWKBIN" "$AWK_PROG" < "$TMP/in")
    j=$(jq -Rsa . < "$TMP/in")
    av=$(printf '%s' "$a" | python3 -c 'import sys,json
try:
    json.loads(sys.stdin.read()); print("VALID")
except Exception: print("INVALID")')
    jv=$(printf '%s' "$j" | python3 -c 'import sys,json
try:
    json.loads(sys.stdin.read()); print("VALID")
except Exception: print("INVALID")')
    # semantic agreement: both parse AND decode to the same string
    local agree=NO
    if [ "$av" = VALID ] && [ "$jv" = VALID ]; then
      if printf '%s\n%s' "$a" "$j" | python3 -c '
import sys, json
a, b = sys.stdin.read().split("\n", 1)
av, jv = json.loads(a), json.loads(b)
# The published hook calls emit "$(sed ... file)", and command substitution strips
# trailing newlines, so the real input never carries one. Feeding the file straight
# to jq here does, and that difference is the harness, not the escaper.
if jv.endswith("\n"): jv = jv[:-1]
sys.exit(0 if av == jv else 1)'; then agree=YES; else agree="DIFFERS"; fi
    fi
    total=$((total+1))
    [ "$agree" = YES ] || fails=$((fails+1))
    printf '  %-22s %-9s %-9s %s\n' "$name" "$av" "$jv" "$agree"
  done
  echo "  --> $AWKBIN: $((total-fails))/$total agree with jq"
  return $fails
}

TMP="$(mktemp -d)" || exit 1
trap 'rm -rf "$TMP"' EXIT

rc=0
for bin in gawk mawk awk busybox; do
  if [ "$bin" = busybox ]; then command -v busybox >/dev/null 2>&1 || continue; fi
  command -v "$bin" >/dev/null 2>&1 || { echo "== $bin: not installed, skipped"; continue; }
  echo "== $bin ($("$bin" --version 2>&1 | head -1 | cut -c1-48))"
  compare_one "$bin" || rc=1
  echo
done
exit $rc
