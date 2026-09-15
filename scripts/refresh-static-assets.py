"""Refresh content-addressed assets in static entry pages before deployment.
Run from any directory: python scripts/refresh-static-assets.py
Canonical editable files remain site.js, site.css, and data/site.js.
"""
from pathlib import Path
import hashlib
import re

root = Path(__file__).resolve().parents[1]
assets = ('site.js', 'site.css', 'data/site.js')
for name in assets:
    source = root / name
    content = source.read_bytes().replace(b'\r\n', b'\n')
    digest = hashlib.sha256(content).hexdigest()[:12]
    versioned = source.with_name(f'{source.stem}.{digest}{source.suffix}')
    versioned.write_bytes(content)
    # Entry shells are at the project root or one route directory below it.
    for page in list(root.glob('*.html')) + list(root.glob('*/index.html')):
        text = page.read_text(encoding='utf-8')
        path = Path(name)
        pattern = re.escape(path.stem) + r'(?:\.[0-9a-f]{12})?' + re.escape(path.suffix)
        prefix = re.escape(str(path.parent).replace('\\', '/') + '/') if path.parent != Path('.') else ''
        text = re.sub(r'((?:src|href)="(?:\./|\.\./)?' + prefix + ')' + pattern + r'(")',
                      lambda m: m[1] + versioned.name + m[2], text)
        page.write_bytes(text.encode('utf-8'))
    print(versioned.relative_to(root))
