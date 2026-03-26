from pathlib import Path
path = Path('script.js')
text = path.read_text(encoding='utf-8').splitlines()
out = []
inserted = False
for line in text:
    out.append(line)
    if not inserted and line.strip() == "let apiSession = null; // sessão remota":
        out.append("let apiStatus = { online: false, source: 'local' };")
        out.append("")
        out.append("function setStatusBadge({ online, text }) {")
        out.append("    let badge = document.getElementById('api-status-badge');")
        out.append("    if (!badge) {")
        out.append("        badge = document.createElement('div');")
        out.append("        badge.id = 'api-status-badge';")
        out.append("        badge.style.cssText = `position:fixed; top:10px; right:10px; padding:8px 12px; border-radius:999px; font-size:12px; font-weight:600; z-index:20000; backdrop-filter: blur(6px); box-shadow:0 4px 12px rgba(0,0,0,0.25);`;" )
        out.append("        document.body.appendChild(badge);")
        out.append("    }")
        out.append("    badge.textContent = text;")
        out.append("    badge.style.background = online ? 'rgba(0,180,90,0.9)' : 'rgba(140,140,140,0.8)';")
        out.append("    badge.style.color = 'white';")
        out.append("}")
        inserted = True
path.write_text('\n'.join(out)+'\n', encoding='utf-8')
print('ok')
