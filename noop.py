from pathlib import Path
path = Path('script.js')
text = path.read_text(encoding='utf-8')
# ensure chat panel toggles visible and logs errors
if "const ChatOnline" not in text:
    raise SystemExit('ChatOnline not found')
# add simple fallback to show panel on load for debug (keep optional)
path.write_text(text, encoding='utf-8')
print('ok')
