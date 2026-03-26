from pathlib import Path
path = Path('script.js')
text = path.read_text(encoding='utf-8')
old = """        ApiClient.fetchRanking()
            .then(remote => {
                if (remote && Array.isArray(remote) && remote.length > 0) {
                    this.ranking = remote.map(entry => ({
                        ...entry,
                        score: Number(entry.points ?? entry.score ?? 0),
                        bitcoin: Number(entry.btc ?? entry.bitcoin ?? 0),
                        blocks: entry.blocks ?? 0,
                        difficulty: entry.difficulty || 'facil',
                        date: entry.ts ? new Date(entry.ts).toISOString() : new Date().toISOString(),
                    }));
                    this.ranking.sort((a, b) => b.score - a.score);
                    this.renderRanking();
                    return;
                }
                this.loadRankingLocal();
            })
            .catch(() => {
                this.loadRankingLocal();
            });"""
new = """        ApiClient.fetchRanking()
            .then(remote => {
                if (remote && Array.isArray(remote) && remote.length > 0) {
                    this.ranking = remote.map(entry => ({
                        ...entry,
                        score: Number(entry.points ?? entry.score ?? 0),
                        bitcoin: Number(entry.btc ?? entry.bitcoin ?? 0),
                        blocks: entry.blocks ?? 0,
                        difficulty: entry.difficulty || 'facil',
                        date: entry.ts ? new Date(entry.ts).toISOString() : new Date().toISOString(),
                    }));
                    this.ranking.sort((a, b) => b.score - a.score);
                    setStatusBadge({ online: true, text: 'Online · ranking sincronizado' });
                    this.renderRanking();
                    return;
                }
                setStatusBadge({ online: false, text: 'Offline · ranking local' });
                this.loadRankingLocal();
            })
            .catch(() => {
                setStatusBadge({ online: false, text: 'Offline · ranking local' });
                this.loadRankingLocal();
            });"""
if old not in text:
    raise SystemExit('ranking block not found')
path.write_text(text.replace(old, new), encoding='utf-8')
print('ok')
