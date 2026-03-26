from pathlib import Path
path = Path('script.js')
text = path.read_text(encoding='utf-8')
old = """    document.getElementById('problem-container').style.display = 'none';
    document.getElementById('hash-log').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('tipo-indicador').style.display = 'none';"""
new = """    document.getElementById('problem-container').style.display = 'none';
    document.getElementById('hash-log').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('tipo-indicador').style.display = 'none';
    setStatusBadge({ online: false, text: 'Checando conexão...' });"""
if old not in text:
    raise SystemExit('DOMContentLoaded block not found')
path.write_text(text.replace(old, new), encoding='utf-8')
print('ok')
