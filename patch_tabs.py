from pathlib import Path
p = Path('script.js')
text = p.read_text(encoding='utf-8')
old = """        list.querySelectorAll('[data-apply]').forEach(btn => {\n            btn.onclick = () => this.apply(btn.getAttribute('data-apply'));\n        });\n\n        this.coins.forEach(c => {"""
new = """        list.querySelectorAll('[data-apply]').forEach(btn => {\n            btn.onclick = () => this.apply(btn.getAttribute('data-apply'));\n        });\n\n        const tabSkins = document.querySelector('[data-tab="skins"]');\n        const tabCoins = document.querySelector('[data-tab="coins"]');\n        const sections = { skins: list, coins: coins };
        const activate = (key) => {
            if (tabSkins) tabSkins.classList.toggle('active', key === 'skins');
            if (tabCoins) tabCoins.classList.toggle('active', key === 'coins');
            sections.skins.style.display = key === 'skins' ? 'grid' : 'none';
            sections.coins.style.display = key === 'coins' ? 'grid' : 'none';
        };
        if (tabSkins) tabSkins.onclick = () => activate('skins');
        if (tabCoins) tabCoins.onclick = () => activate('coins');
        activate('skins');\n\n        this.coins.forEach(c => {"""
if old not in text:
    raise SystemExit('block not found')
p.write_text(text.replace(old,new), encoding='utf-8')
print('ok')
