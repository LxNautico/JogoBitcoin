from pathlib import Path
p = Path('script.js')
text = p.read_text(encoding='utf-8')
old = "    // Chat interativo local\n    initGameChat();\n    // Chat online simples\n    ChatOnline.bindUI();\n    ChatOnline.connect();\n    console.log('ChatOnline inicializado');\n    const cp = document.getElementById('chat-panel');\n    if (cp) cp.style.display = 'flex';"
new = "    // Chat interativo local\n    initGameChat();\n    // Chat online desativado temporariamente" 
if old not in text:
    raise SystemExit('block not found')
p.write_text(text.replace(old,new), encoding='utf-8')
print('ok')
