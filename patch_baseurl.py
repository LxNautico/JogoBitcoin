from pathlib import Path
path = Path('script.js')
text = path.read_text(encoding='utf-8')
old = """    const defaultBase = 'http://localhost:4000';\n    const baseUrl = window.location.origin.startsWith('http://localhost:4000') ? window.location.origin : defaultBase;"""
new = """    const defaultBase = 'http://localhost:4000';\n    const baseUrl = defaultBase;"""
if old not in text:
    raise SystemExit('baseUrl block not found')
path.write_text(text.replace(old, new), encoding='utf-8')
print('ok')
