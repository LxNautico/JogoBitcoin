from pathlib import Path
path = Path('server/index.js')
text = path.read_text(encoding='utf-8').splitlines()
needle = "app.set('trust proxy', 1);"
out = []
inserted = False
for line in text:
    out.append(line)
    if line.strip() == needle.strip() and not inserted:
        out.append("// Relaxed CSP for game (allow inline handlers and CoinGecko)")
        out.append("app.use((req, res, next) => {")
        out.append("  res.setHeader('Content-Security-Policy', \"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.coingecko.com; img-src 'self' data:; media-src 'self' data:;\");")
        out.append("  next();")
        out.append("});")
        inserted = True
if not inserted:
    raise SystemExit('needle not found')
path.write_text('\n'.join(out)+'\n', encoding='utf-8')
print('ok')
