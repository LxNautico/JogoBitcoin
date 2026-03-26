from pathlib import Path
p = Path('script.js')
text = p.read_text(encoding='utf-8')
old = """    checkCoinsAchievement() {\n        if (this.coinsOwned.size === this.coins.length) {\n            mostrarMensagemLateral('🏅 Colecionador de Moedas: comprou todas!', 'bonus', 3500);\n        }\n    },"""
new = """    checkCoinsAchievement() {\n        if (this.coinsOwned.size === this.coins.length) {\n            mostrarMensagemLateral('🏅 Colecionador de Moedas: comprou todas!', 'bonus', 3500);\n            // registra conquista simples no sistema local
            this.adicionarConquistaCoins();
        }
    },

    adicionarConquistaCoins() {
        const nomeJogador = localStorage.getItem('jb_chat_username') || 'Jogador';
        const conquista = {
            id: 'coins_master',
            titulo: 'Colecionador de Moedas',
            icone: '🏅',
            descricao: 'Comprou todas as moedas especiais',
        };
        if (!RankingSystem.conquistasPorJogador[nomeJogador]) {
            RankingSystem.conquistasPorJogador[nomeJogador] = [];
        }
        const lista = RankingSystem.conquistasPorJogador[nomeJogador];
        if (!lista.some(c => c.id === conquista.id)) {
            lista.push({ ...conquista, data: new Date().toLocaleDateString('pt-BR') });
            RankingSystem.saveConquistas();
        }
    },"""
if old not in text:
    raise SystemExit('checkCoinsAchievement block not found')
p.write_text(text.replace(old,new), encoding='utf-8')
print('ok')
