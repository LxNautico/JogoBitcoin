from pathlib import Path
path = Path('server/index.js')
text = path.read_text(encoding='utf-8')
old = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.coingecko.com; img-src 'self' data:; media-src 'self' data:;"
new = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws: wss: https://api.coingecko.com; img-src 'self' data:; media-src 'self' data:;"
if old not in text:
    raise SystemExit('old string not found')
path.write_text(text.replace(old, new), encoding='utf-8')
print('updated')
