from pathlib import Path
p = Path('server/index.js')
text = p.read_text(encoding='utf-8')
old = """app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', \"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws: wss: https://api.coingecko.com; img-src 'self' data:; media-src 'self' data:;\");
  next();
});"""
new = """app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', \"default-src 'self' http: https:; script-src 'self' 'unsafe-inline' http: https:; style-src 'self' 'unsafe-inline' http: https:; connect-src 'self' http: https: ws: wss: https://api.coingecko.com; img-src 'self' data:; media-src 'self' data:;\");
  next();
});"""
if old not in text:
    raise SystemExit('CSP block not found')
p.write_text(text.replace(old, new), encoding='utf-8')
print('ok')
