#!/usr/bin/env bash
# Default: standalone document for GitHub Pages. Optional third argument: artifact.
set -euo pipefail
SRC=${1:-robotutor.html}
OUT=${2:-docs/index.html}
MODE=${3:-pages}
python3 - "$SRC" "$OUT" "$MODE" <<'PY'
from pathlib import Path
import re, sys
src, out, mode = sys.argv[1:]
if mode not in ('pages', 'artifact'):
    raise SystemExit('Mode must be pages or artifact')
html = Path(src).read_text(encoding='utf-8-sig')
# Remove only a transport-injected Cloudflare script, when present.
html = re.sub(r'<script\b[^>]*>(?:(?!</script>)[\s\S])*?__CF\$cv\$params(?:(?!</script>)[\s\S])*?</script>', '', html, flags=re.I)
if not re.search(r'<!doctype\s+html', html, re.I) or '</body>' not in html.lower():
    raise SystemExit('The source must be a complete HTML document')
if mode == 'artifact':
    # Only document-level lines: script strings also contain SVG <title> tags.
    html = re.sub(r'^[ \t]*<title>[^\n]*</title>[ \t]*\r?\n', '', html, count=1, flags=re.I | re.M)
    wrapper = re.compile(r'\s*(?:<!doctype[^>]*>|</?(?:html|head|body)\b[^>]*>)\s*', re.I)
    html = '\n'.join(line for line in html.splitlines() if not wrapper.fullmatch(line))
    html = '<title>RoboTutor Laboratorio Visual</title>\n' + html
Path(out).parent.mkdir(parents=True, exist_ok=True)
Path(out).write_text(html, encoding='utf-8')
print(f'{out}: {len(html.encode("utf-8"))} bytes ({mode})')
PY
