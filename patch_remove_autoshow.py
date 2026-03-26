from pathlib import Path
p = Path('script.js')
text = p.read_text(encoding='utf-8')
old = """    // Chat online simples\n    ChatOnline.bindUI();\n    ChatOnline.connect();\n    console.log('ChatOnline inicializado');\n    const cp = document.getElementById('chat-panel');\n    if (cp) cp.style.display = 'flex';\n\n    // Loja de skins"""
new = """    // Chat online simples\n    ChatOnline.bindUI();\n    ChatOnline.connect();\n    console.log('ChatOnline inicializado');\n\n    // Loja de skins"""
if old not in text:
    raise SystemExit('block not found')
p.write_text(text.replace(old, new), encoding='utf-8')
print('ok')
