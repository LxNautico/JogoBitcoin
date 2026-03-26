from pathlib import Path
path = Path('server/index.js')
text = path.read_text(encoding='utf-8')
needle = """app.get('/', (_req, res) => {\n  res.sendFile(path.join(staticRoot, 'index.html'));\n});"""
insert = """app.get('/', (_req, res) => {\n  res.sendFile(path.join(staticRoot, 'index.html'));\n});\n\n// Error handler\napp.use((err, _req, res, _next) => {\n  console.error('API error:', err);\n  res.status(500).json({ error: 'internal', detail: err?.message });\n});"""
if needle not in text:
    raise SystemExit('needle not found')
text = text.replace(needle, insert)
path.write_text(text, encoding='utf-8')
print('ok')
