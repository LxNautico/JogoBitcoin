from pathlib import Path
path = Path('script.js')
text = path.read_text(encoding='utf-8')
old = """    const ensureSession = async (nickname) => {
        const cached = readSession();
        if (cached) {
            apiSession = cached;
            return cached;
        }
        try {
            const res = await fetch(`${baseUrl}/api/session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname }),
            });
            if (!res.ok) throw new Error('session failed');
            const data = await res.json();
            apiSession = data;
            saveSession(data);
            return data;
        } catch (err) {
            console.warn('Sessão remota indisponível, usando fallback local.', err);
            apiSession = null;
            return null;
        }
    };"""
new = """    const ensureSession = async (nickname) => {
        const cached = readSession();
        if (cached) {
            apiSession = cached;
            apiStatus = { online: true, source: 'cache' };
            setStatusBadge({ online: true, text: 'Online · sessão cache' });
            return cached;
        }
        try {
            const res = await fetch(`${baseUrl}/api/session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname }),
            });
            if (!res.ok) throw new Error('session failed');
            const data = await res.json();
            apiSession = data;
            apiStatus = { online: true, source: 'remote' };
            setStatusBadge({ online: true, text: 'Online · sessão ativa' });
            saveSession(data);
            return data;
        } catch (err) {
            console.warn('Sessão remota indisponível, usando fallback local.', err);
            apiSession = null;
            apiStatus = { online: false, source: 'local' };
            setStatusBadge({ online: false, text: 'Offline · modo local' });
            return null;
        }
    };"""
if old not in text:
    raise SystemExit('ensureSession block not found')
path.write_text(text.replace(old, new), encoding='utf-8')
print('ok')
