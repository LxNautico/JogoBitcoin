// ============================================
// JOGOBITCOIN - SCRIPT PRINCIPAL
// ============================================
// Versão organizada e comentada
// ============================================

// ============================================
// 1. VARIÁVEIS GLOBAIS
// ============================================
let blocks = [];
let currentProblem = 1;
let score = 0;
let vidas = 3;
let bitcoinQuantity = 0;
let timeLimit = 60;
let remainingTime = timeLimit;
let timerInterval;
let TamMax = 100;
let jogoConcluido = false;
let brokenBlocks = 0;

// Variáveis do sistema de criptografia
let problemaAtual = null;
let errosConsecutivos = 0;
let dificuldadeAtual = 'facil';

// Variáveis do sistema de tempo e conquistas
let tempoInicioPartida = null;
let tempoTotalPartida = 0;
let timerGlobalInterval = null;
let metasAlcancadas = [];
let selosConquistados = [];

// ============================================
// 2. CONFIGURAÇÕES E CONSTANTES
// ============================================

// Metas de desempenho
const metasDisponiveis = [
    {
        id: 'velocidade_5',
        nome: '⚡ Minerador Relâmpago',
        descricao: 'Quebrar 5 blocos em menos de 60 segundos',
        icone: '⚡',
        blocos: 5,
        tempoMax: 60,
        recompensa: { pontos: 500, bitcoin: 0.00000200, titulo: 'Minerador Relâmpago' }
    },
    {
        id: 'velocidade_10',
        nome: '🌪️ Cripto Ninja',
        descricao: 'Quebrar 10 blocos em menos de 120 segundos',
        icone: '🥷',
        blocos: 10,
        tempoMax: 120,
        recompensa: { pontos: 1000, bitcoin: 0.00000500, titulo: 'Cripto Ninja' }
    },
    {
        id: 'velocidade_20',
        nome: '🔥 Mestre dos Blocos',
        descricao: 'Quebrar 20 blocos em menos de 240 segundos',
        icone: '🔥',
        blocos: 20,
        tempoMax: 240,
        recompensa: { pontos: 2500, bitcoin: 0.00001000, titulo: 'Mestre dos Blocos' }
    },
    {
        id: 'velocidade_50',
        nome: '💎 Lenda da Mineração',
        descricao: 'Quebrar 50 blocos em menos de 600 segundos',
        icone: '💎',
        blocos: 50,
        tempoMax: 600,
        recompensa: { pontos: 5000, bitcoin: 0.00002500, titulo: 'Lenda da Mineração' }
    },
    {
        id: 'precisao_total',
        nome: '🎯 Perfeição',
        descricao: 'Completar o jogo sem perder nenhuma vida',
        icone: '🎯',
        blocos: 'todos',
        condicao: 'semPerderVidas',
        recompensa: { pontos: 10000, bitcoin: 0.00005000, titulo: 'Mestre Perfeito' }
    },
    {
        id: 'speedrun_facil',
        nome: '🏃 Speedrunner Fácil',
        descricao: 'Completar o jogo no nível fácil em menos de 5 minutos',
        icone: '🏃',
        dificuldade: 'facil',
        tempoMax: 300,
        recompensa: { pontos: 3000, bitcoin: 0.00001500, titulo: 'Speedrunner' }
    },
    {
        id: 'speedrun_medio',
        nome: '🏃‍♂️ Speedrunner Médio',
        descricao: 'Completar o jogo no nível médio em menos de 8 minutos',
        icone: '🏃‍♂️',
        dificuldade: 'medio',
        tempoMax: 480,
        recompensa: { pontos: 5000, bitcoin: 0.00002500, titulo: 'Speedrunner Pro' }
    },
    {
        id: 'speedrun_dificil',
        nome: '🏃‍♀️ Speedrunner Difícil',
        descricao: 'Completar o jogo no nível difícil em menos de 10 minutos',
        icone: '🏃‍♀️',
        dificuldade: 'dificil',
        tempoMax: 600,
        recompensa: { pontos: 10000, bitcoin: 0.00005000, titulo: 'Speedrunner Lendário' }
    }
];

// Mensagens de incentivo
const mensagensDeIncentivo = [
    "Você está indo muito bem!",
    "Ótimo trabalho! Continue assim!",
    "Você é incrível!",
    "Quase lá, continue minerando!",
    "Parabéns, você está se superando!",
    "Sua determinação é inspiradora!"
];

// ============================================
// 3. FUNÇÕES DO SISTEMA DE TEMPO
// ============================================

function iniciarTimerGlobal() {
    if (timerGlobalInterval) {
        clearInterval(timerGlobalInterval);
        timerGlobalInterval = null;
    }
    
    tempoInicioPartida = Date.now();
    
    timerGlobalInterval = setInterval(() => {
        if (!jogoConcluido) {
            tempoTotalPartida = Math.floor((Date.now() - tempoInicioPartida) / 1000);
            atualizarDisplayTempo();
            
            if (vidas > 0) {
                verificarMetasTempo();
            }
        }
    }, 1000);
}

function pararTimerGlobal() {
    if (timerGlobalInterval) {
        clearInterval(timerGlobalInterval);
        timerGlobalInterval = null;
    }
}

function resetTimerGlobal() {
    pararTimerGlobal();
    tempoTotalPartida = 0;
    tempoInicioPartida = null;
    atualizarDisplayTempo();
}

function atualizarDisplayTempo() {
    let tempoDisplay = document.getElementById('tempo-global');
    if (!tempoDisplay) {
        tempoDisplay = document.createElement('div');
        tempoDisplay.id = 'tempo-global';
        tempoDisplay.style.cssText = `
            position: fixed;
            top: 0px;
            left: 260px;
            background: rgba(0,0,0,0.7);
            color: #4CAF50;
            padding: 8px 15px;
            border-radius: 20px;
            font-family: 'Courier New', monospace;
            font-size: 1.1em;
            border: 1px solid #4CAF50;
            z-index: 9999;
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            gap: 5px;
        `;
        tempoDisplay.innerHTML = '⏱️ <span id="tempo-valor">00:00</span>';
        document.body.appendChild(tempoDisplay);
    }
    
    const minutos = Math.floor(tempoTotalPartida / 60);
    const segundos = tempoTotalPartida % 60;
    const tempoFormatado = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    
    const tempoValor = document.getElementById('tempo-valor');
    if (tempoValor) tempoValor.textContent = tempoFormatado;
}

// ============================================
// 4. SISTEMA DE CONQUISTAS E METAS
// ============================================

function verificarMetasTempo() {
    metasDisponiveis.forEach(meta => {
        if (metasAlcancadas.includes(meta.id)) return;
        
        if (meta.blocos && !isNaN(meta.blocos)) {
            if (brokenBlocks >= meta.blocos && tempoTotalPartida <= meta.tempoMax) {
                alcançarMeta(meta);
            }
        }
        
        if (meta.dificuldade && meta.dificuldade === dificuldadeAtual) {
            if (brokenBlocks >= TamMax && tempoTotalPartida <= meta.tempoMax) {
                alcançarMeta(meta);
            }
        }
        
        if (meta.id === 'precisao_total' && brokenBlocks >= TamMax && vidas === 3) {
            alcançarMeta(meta);
        }
    });
}

function alcançarMeta(meta) {
    if (metasAlcancadas.includes(meta.id)) return;
    
    metasAlcancadas.push(meta.id);
    
    if (meta.recompensa.pontos) {
        score += meta.recompensa.pontos;
        updateScoreDisplay(score);
    }
    
    if (meta.recompensa.bitcoin) {
        bitcoinQuantity += meta.recompensa.bitcoin;
        updateBitcoinValue();
    }
    
    const conquista = {
        id: meta.id,
        titulo: meta.recompensa.titulo || meta.nome,
        icone: meta.icone,
        descricao: meta.descricao
    };
    
    if (meta.recompensa.titulo) {
        selosConquistados.push({
            id: meta.id,
            titulo: meta.recompensa.titulo,
            icone: meta.icone,
            data: new Date().toLocaleDateString()
        });
    }
    
    const ultimoJogador = localStorage.getItem('jogobitcoin_lastname');
    if (ultimoJogador && ultimoJogador !== 'Anônimo') {
        RankingSystem.adicionarConquista(ultimoJogador, conquista);
    }
    
    mostrarConquista(meta);
}

function mostrarConquista(meta) {
    const conquistaDiv = document.createElement('div');
    conquistaDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #FFD700, #FFA500);
        color: #000;
        padding: 30px;
        border-radius: 20px;
        border: 5px solid gold;
        box-shadow: 0 0 70px rgba(255, 215, 0, 0.9);
        text-align: center;
        z-index: 20000;
        animation: conquistaPop 0.8s ease;
        max-width: 400px;
        width: 90%;
    `;
    
    conquistaDiv.innerHTML = `
        <div style="font-size: 5em; margin-bottom: 15px;">${meta.icone}</div>
        <h2 style="color: #000; margin-bottom: 10px;">🏆 CONQUISTA!</h2>
        <h3 style="color: #000; margin-bottom: 15px;">${meta.nome}</h3>
        <p style="margin-bottom: 15px;">${meta.descricao}</p>
        <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px; margin: 15px 0;">
            <p style="margin: 5px 0;">💰 <strong>+${meta.recompensa.pontos} pontos</strong></p>
            <p style="margin: 5px 0;">₿ <strong>+${meta.recompensa.bitcoin.toFixed(8)} BTC</strong></p>
            ${meta.recompensa.titulo ? `<p style="margin: 5px 0;">🏅 Título: <strong>${meta.recompensa.titulo}</strong></p>` : ''}
        </div>
        <button onclick="this.parentElement.remove()" style="
            background: #000;
            color: gold;
            border: none;
            padding: 12px 35px;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            font-size: 1.1em;
            margin-top: 10px;
        ">INCRÍVEL! 🎉</button>
    `;
    
    document.body.appendChild(conquistaDiv);
    
    if (SoundSystem && SoundSystem.win) SoundSystem.win();
    
    setTimeout(() => {
        if (conquistaDiv.parentElement) conquistaDiv.remove();
    }, 8000);
}

// ============================================
// 5. ENCICLOPÉDIA CRIPTO
// ============================================
const CryptoEncyclopedia = {
    entries: {
        'Bitcoin': { description: 'Primeira criptomoeda, criada por Satoshi Nakamoto em 2008.', link: 'https://pt.wikipedia.org/wiki/Bitcoin', category: 'Criptomoeda' },
        'Ethereum': { description: 'Plataforma para contratos inteligentes.', link: 'https://pt.wikipedia.org/wiki/Ethereum', category: 'Plataforma' },
        'Blockchain': { description: 'Tecnologia de registro distribuído.', link: 'https://pt.wikipedia.org/wiki/Blockchain', category: 'Tecnologia' },
        'Smart Contract': { description: 'Contrato auto-executável.', link: 'https://pt.wikipedia.org/wiki/Contrato_inteligente', category: 'Tecnologia' },
        'Proof of Work': { description: 'Mecanismo de consenso.', link: 'https://pt.wikipedia.org/wiki/Proof-of-work', category: 'Consenso' },
        'Proof of Stake': { description: 'Mecanismo de consenso.', link: 'https://pt.wikipedia.org/wiki/Proof-of-stake', category: 'Consenso' },
        'Halving': { description: 'Redução da recompensa.', link: 'https://pt.wikipedia.org/wiki/Halving', category: 'Evento' },
        'Wallet': { description: 'Carteira digital.', link: 'https://pt.wikipedia.org/wiki/Carteira_de_criptomoeda', category: 'Ferramenta' },
        'Miner': { description: 'Equipamento de mineração.', link: 'https://pt.wikipedia.org/wiki/Minerador_de_bitcoin', category: 'Hardware' },
        'Hash': { description: 'Função criptográfica.', link: 'https://pt.wikipedia.org/wiki/Fun%C3%A7%C3%A3o_hash_criptogr%C3%A1fica', category: 'Criptografia' },
        'Token': { description: 'Representação digital.', link: 'https://pt.wikipedia.org/wiki/Token_(ci%C3%AAncia_da_computa%C3%A7%C3%A3o)', category: 'Conceito' },
        'NFT': { description: 'Token não-fungível.', link: 'https://pt.wikipedia.org/wiki/Token_n%C3%A3o_fung%C3%ADvel', category: 'Token' },
        'DeFi': { description: 'Finanças descentralizadas.', link: 'https://pt.wikipedia.org/wiki/Finan%C3%A7as_descentralizadas', category: 'Ecossistema' },
        'Stablecoin': { description: 'Criptomoeda estável.', link: 'https://pt.wikipedia.org/wiki/Stablecoin', category: 'Criptomoeda' },
        'DAO': { description: 'Organização autônoma.', link: 'https://pt.wikipedia.org/wiki/Organiza%C3%A7%C3%A3o_aut%C3%B4noma_descentralizada', category: 'Governança' },
        'Coinbase': { description: 'Exchange americana.', link: 'https://pt.wikipedia.org/wiki/Coinbase', category: 'Exchange' },
        'Satoshi Nakamoto': { description: 'Criador do Bitcoin.', link: 'https://pt.wikipedia.org/wiki/Satoshi_Nakamoto', category: 'Pessoa' },
        'Vitalik Buterin': { description: 'Criador do Ethereum.', link: 'https://pt.wikipedia.org/wiki/Vitalik_Buterin', category: 'Pessoa' }
    },
    
    init: function() {
        this.createEncyclopedia();
        this.populateSelector();
        this.createSearchBar();
    },
    
    createEncyclopedia: function() {
        if (document.getElementById('crypto-encyclopedia')) return;
        const container = document.createElement('div');
        container.id = 'crypto-encyclopedia';
        container.style.cssText = `position: fixed; left: 20px; bottom: 20px; width: 450px; height: 500px; background: linear-gradient(135deg, rgba(26,26,46,0.98), rgba(40,40,60,0.98)); border: 2px solid #2196f3; border-radius: 15px; box-shadow: 0 15px 40px rgba(0,0,0,0.6); z-index: 9998; display: none; backdrop-filter: blur(10px); font-family: 'Exo 2', sans-serif; overflow: hidden; flex-direction: column;`;
        
        container.innerHTML = `
            <div style="padding:20px; border-bottom:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2);">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:15px;">
                    <h3 style="color:#2196f3; margin:0; font-size:1.4em;">📚 Enciclopédia Cripto</h3>
                    <button onclick="document.getElementById('crypto-encyclopedia').style.display='none'" style="background:rgba(255,255,255,0.1); border:none; color:#aaa; font-size:1.5em; cursor:pointer; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">×</button>
                </div>
                <div style="position:relative;">
                    <input type="text" id="crypto-search" placeholder="Buscar conceito..." style="width:100%; padding:12px 15px; padding-left:45px; border-radius:25px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:white; font-size:1em; outline:none;">
                    <div style="position:absolute; left:15px; top:50%; transform:translateY(-50%); color:#888;">🔍</div>
                </div>
            </div>
            <div style="flex:1; display:flex; overflow:hidden;">
                <div id="crypto-list" style="width:200px; border-right:1px solid rgba(255,255,255,0.1); overflow-y:auto; background:rgba(0,0,0,0.1);"></div>
                <div style="flex:1; padding:20px; overflow-y:auto;">
                    <div id="crypto-info" style="min-height:100%; display:flex; flex-direction:column; justify-content:center;">
                        <div style="text-align:center; color:#888; padding:40px 20px;">
                            <div style="font-size:3em; margin-bottom:20px; opacity:0.3;">📖</div>
                            <div>Selecione um conceito</div>
                        </div>
                    </div>
                </div>
            </div>
            <div style="padding:15px 20px; border-top:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); font-size:0.9em; color:#888; display:flex; justify-content:space-between;">
                <div id="entry-count">${Object.keys(this.entries).length} conceitos</div>
                <a id="wiki-link" target="_blank" style="color:#2196f3; text-decoration:none; display:none;">📖 Wikipedia</a>
            </div>
        `;
        document.body.appendChild(container);
        this.createToggleButton();
    },
    
    createToggleButton: function() {
        const button = document.createElement('button');
        button.id = 'encyclopedia-toggle';
        button.innerHTML = '📚';
        button.title = 'Enciclopédia Cripto';
        button.style.cssText = `position:fixed; left:20px; bottom:20px; width:60px; height:60px; border-radius:50%; background:linear-gradient(135deg,#2196f3,#1976d2); color:white; border:2px solid #64b5f6; font-size:1.8em; cursor:pointer; z-index:9999; box-shadow:0 6px 20px rgba(33,150,243,0.5); transition:all 0.3s ease; display:flex; align-items:center; justify-content:center;`;
        
        button.onclick = () => {
            const enc = document.getElementById('crypto-encyclopedia');
            if (enc.style.display === 'flex') {
                enc.style.display = 'none';
                button.style.transform = 'scale(1)';
            } else {
                enc.style.display = 'flex';
                button.style.transform = 'scale(1.1)';
                if (SoundSystem) SoundSystem.click();
            }
        };
        document.body.appendChild(button);
    },
    
    createSearchBar: function() {
        const searchInput = document.getElementById('crypto-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterEntries(e.target.value.toLowerCase()));
        }
    },
    
    populateSelector: function() {
        const list = document.getElementById('crypto-list');
        if (!list) return;
        const sorted = Object.keys(this.entries).sort();
        list.innerHTML = '';
        sorted.forEach(key => {
            const item = document.createElement('div');
            item.style.cssText = `padding:12px 15px; border-bottom:1px solid rgba(255,255,255,0.05); cursor:pointer; color:#ddd;`;
            item.textContent = key;
            item.onclick = () => {
                document.querySelectorAll('#crypto-list div').forEach(el => el.style.background = 'transparent');
                item.style.background = 'rgba(33,150,243,0.2)';
                this.showEntry(key);
                if (SoundSystem) SoundSystem.click();
            };
            list.appendChild(item);
        });
    },
    
    filterEntries: function(term) {
        document.querySelectorAll('#crypto-list div').forEach(item => {
            if (item.textContent.toLowerCase().includes(term)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    },
    
    showEntry: function(key) {
        const entry = this.entries[key];
        const info = document.getElementById('crypto-info');
        const wiki = document.getElementById('wiki-link');
        if (!entry || !info) return;
        
        info.innerHTML = `
            <div style="margin-bottom:25px;">
                <div style="font-size:1.8em; font-weight:bold; color:#fff; margin-bottom:10px;">${key}</div>
                <div style="background:rgba(33,150,243,0.15); color:#64b5f6; padding:5px 15px; border-radius:20px; display:inline-block; margin-bottom:15px;">${entry.category}</div>
                <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:10px; border-left:4px solid #2196f3;">
                    <p style="color:#ddd; line-height:1.6;">${entry.description}</p>
                </div>
            </div>
        `;
        if (wiki) {
            wiki.href = entry.link;
            wiki.style.display = 'flex';
            wiki.textContent = `📖 Ver "${key}" na Wikipedia`;
        }
    }
};

// ============================================
// 6. WIDGET DE PREÇO DO BITCOIN
// ============================================
const BitcoinPriceWidget = {
    init: function() {
        this.createWidget();
        this.fetchBitcoinPrice();
        setInterval(() => this.fetchBitcoinPrice(), 300000);
    },
    
    createWidget: function() {
        const widget = document.createElement('div');
        widget.id = 'bitcoin-price-widget';
        widget.style.cssText = `position:fixed; bottom:20px; right:20px; background:linear-gradient(135deg, rgba(247,147,26,0.9), rgba(255,193,7,0.9)); color:white; padding:15px 25px; border-radius:15px; border:2px solid gold; box-shadow:0 8px 25px rgba(247,147,26,0.4); z-index:9999; font-family:'Courier New', monospace; font-weight:bold; min-width:250px; backdrop-filter:blur(10px); display:none;`;
        widget.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;"><div style="font-size:1.5em;">₿</div><div><div style="font-size:1.2em;">BITCOIN AGORA</div><div style="font-size:0.8em;">Preço em tempo real</div></div></div>
            <div id="btc-price-display" style="text-align:center; font-size:1.5em;">Carregando...</div>
            <div id="btc-change-display" style="text-align:center; font-size:0.9em; margin-top:5px;">Atualizado: --</div>
        `;
        document.body.appendChild(widget);
        this.createToggleButton();
    },
    
    createToggleButton: function() {
        const btn = document.createElement('button');
        btn.id = 'btc-widget-toggle';
        btn.innerHTML = '₿';
        btn.title = 'Mostrar/Ocultar preço';
        btn.style.cssText = `position:fixed; bottom:20px; right:20px; width:50px; height:50px; border-radius:50%; background:#f7931a; color:white; border:2px solid gold; font-size:1.5em; font-weight:bold; cursor:pointer; z-index:10000; box-shadow:0 4px 15px rgba(247,147,26,0.4); transition:all 0.3s ease;`;
        btn.onclick = () => {
            const w = document.getElementById('bitcoin-price-widget');
            if (w.style.display === 'block') {
                w.style.display = 'none';
                btn.style.transform = 'scale(1)';
            } else {
                w.style.display = 'block';
                btn.style.transform = 'scale(1.1)';
                if (SoundSystem) SoundSystem.click();
            }
        };
        document.body.appendChild(btn);
    },
    
    fetchBitcoinPrice: async function() {
        try {
            const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl%2Cusd&include_24hr_change=true');
            const d = await r.json();
            if (d.bitcoin) this.updateDisplay(d.bitcoin);
        } catch (error) {
            this.updateDisplay({ brl: 350000, usd: 65000, brl_24h_change: 0, usd_24h_change: 0 });
        }
    },
    
    updateDisplay: function(data) {
        const price = document.getElementById('btc-price-display');
        const change = document.getElementById('btc-change-display');
        if (!price || !change) return;
        const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.brl);
        const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.usd);
        const chg = data.brl_24h_change || data.usd_24h_change || 0;
        price.innerHTML = `<div>${brl}</div><div style="font-size:0.7em;">${usd}</div>`;
        change.innerHTML = `<span style="color:${chg >= 0 ? '#4CAF50' : '#f44336'}">${chg >= 0 ? '📈' : '📉'} ${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%</span>`;
    }
};

// ============================================
// 7. SISTEMA DE RANKING
// ============================================
const RankingSystem = {
    maxEntries: 10,
    storageKey: 'jogobitcoin_ranking',
    conquistasKey: 'jogobitcoin_conquistas',
    ranking: [],
    conquistasPorJogador: {},
    
    init: function() {
        this.loadRanking();
        this.loadConquistas();
        this.createRankingButton();
    },
    
    loadRanking: function() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            this.ranking = saved ? JSON.parse(saved) : [];
            this.ranking = this.ranking.map(entry => ({
                ...entry,
                score: Number(entry.score) || 0,
                bitcoin: Number(entry.bitcoin) || 0
            }));
            this.ranking.sort((a, b) => b.score - a.score);
        } catch (error) {
            this.ranking = [];
        }
    },
    
    loadConquistas: function() {
        try {
            const saved = localStorage.getItem(this.conquistasKey);
            this.conquistasPorJogador = saved ? JSON.parse(saved) : {};
        } catch (error) {
            this.conquistasPorJogador = {};
        }
    },
    
    saveRanking: function() {
        try {
            this.ranking.sort((a, b) => b.score - a.score);
            localStorage.setItem(this.storageKey, JSON.stringify(this.ranking));
        } catch (error) {}
    },
    
    saveConquistas: function() {
        try {
            localStorage.setItem(this.conquistasKey, JSON.stringify(this.conquistasPorJogador));
        } catch (error) {}
    },
    
    addScore: function(playerName, score, bitcoin, blocks, difficulty, time) {
        const newEntry = {
            id: Date.now(),
            name: playerName || 'Anônimo',
            score: Number(score) || 0,
            bitcoin: Number(bitcoin) || 0,
            blocks: blocks || 0,
            difficulty: difficulty || 'facil',
            date: new Date().toISOString(),
            time: time || 0
        };
        this.ranking.push(newEntry);
        this.ranking.sort((a, b) => b.score - a.score);
        if (this.ranking.length > this.maxEntries) {
            this.ranking = this.ranking.slice(0, this.maxEntries);
        }
        this.saveRanking();
        return newEntry;
    },
    
    getConquistasDoJogador: function(jogador) {
        if (!jogador || jogador === 'Anônimo') return [];
        return this.conquistasPorJogador[jogador] || [];
    },
    
    adicionarConquista: function(jogador, conquista) {
        if (!jogador || jogador === 'Anônimo') return false;
        try {
            if (!this.conquistasPorJogador[jogador]) {
                this.conquistasPorJogador[jogador] = [];
            }
            const existe = this.conquistasPorJogador[jogador].some(c => c.id === conquista.id);
            if (!existe) {
                this.conquistasPorJogador[jogador].push({
                    ...conquista,
                    data: new Date().toLocaleDateString('pt-BR')
                });
                this.saveConquistas();
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    },
    
    verConquistasDe: function(jogador) {
        const conquistas = this.getConquistasDoJogador(jogador);
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            z-index: 20000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        const container = document.createElement('div');
        container.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: white;
            padding: 30px;
            border-radius: 20px;
            border: 3px solid gold;
            max-width: 500px;
            width: 90%;
            max-height: 70vh;
            overflow-y: auto;
        `;
        
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="color: gold; margin: 0;">🏆 CONQUISTAS DE ${jogador.toUpperCase()}</h3>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: #aaa;
                    font-size: 2em;
                    cursor: pointer;
                ">×</button>
            </div>
        `;
        
        if (conquistas.length === 0) {
            html += `<p style="text-align: center; color: #888; padding: 40px;">Nenhuma conquista encontrada para ${jogador}.</p>`;
        } else {
            conquistas.forEach((c) => {
                html += `
                    <div style="
                        background: rgba(255,255,255,0.05);
                        border-left: 4px solid gold;
                        padding: 15px;
                        border-radius: 10px;
                        margin-bottom: 15px;
                    ">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <span style="font-size: 2em;">${c.icone}</span>
                            <span style="font-weight: bold; color: gold;">${c.titulo}</span>
                        </div>
                        <p style="color: #aaa; margin: 5px 0;">${c.descricao || ''}</p>
                        <p style="color: #666; font-size: 0.8em; margin: 5px 0 0;">📅 ${c.data}</p>
                    </div>
                `;
            });
        }
        
        html += `
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                    padding: 10px 30px;
                    background: gold;
                    color: black;
                    border: none;
                    border-radius: 25px;
                    font-weight: bold;
                    cursor: pointer;
                ">Fechar</button>
            </div>
        `;
        
        container.innerHTML = html;
        overlay.appendChild(container);
        document.body.appendChild(overlay);
    },
    
    buscarJogador: function() {
        const nome = document.getElementById('busca-jogador-ranking')?.value;
        if (nome && nome.trim()) {
            this.verConquistasDe(nome.trim());
        } else {
            alert('Digite um nome para buscar');
        }
    },
    
    showRanking: function() {
        this.ranking.sort((a, b) => b.score - a.score);
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        const container = document.createElement('div');
        container.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: white;
            padding: 30px;
            border-radius: 20px;
            border: 3px solid #f7931a;
            max-width: 800px;
            width: 95%;
            max-height: 85vh;
            overflow-y: auto;
        `;
        
        let html = `<h2 style="color: #f7931a; text-align: center; margin-bottom: 20px; font-size: 2em;">🏆 RANKING E CONQUISTAS</h2>`;
        
        if (this.ranking.length === 0) {
            html += `<p style="text-align: center; color: #aaa; padding: 40px;">Nenhuma pontuação ainda. Seja o primeiro!</p>`;
        } else {
            html += `<table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                    <tr style="background: rgba(247,147,26,0.2);">
                        <th style="padding: 12px;">Pos</th>
                        <th style="padding: 12px;">Jogador</th>
                        <th style="padding: 12px;">Pontos</th>
                        <th style="padding: 12px;">Bitcoin</th>
                        <th style="padding: 12px;">Conquistas</th>
                    </tr>
                </thead>
                <tbody>`;
            
            this.ranking.forEach((e, i) => {
                const medal = i < 3 ? ['🥇','🥈','🥉'][i] : `${i+1}º`;
                const totalConquistas = this.getConquistasDoJogador(e.name).length;
                
                html += `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <td style="padding: 15px; text-align: center; font-weight: bold;">${medal}</td>
                        <td style="padding: 15px; font-weight: bold;">${e.name}</td>
                        <td style="padding: 15px; text-align: right;">${Number(e.score).toLocaleString()}</td>
                        <td style="padding: 15px; text-align: right; color: #f7931a;">${Number(e.bitcoin).toFixed(8)} BTC</td>
                        <td style="padding: 15px; text-align: center;">
                            <button onclick="RankingSystem.verConquistasDe('${e.name}')" style="
                                background: ${totalConquistas > 0 ? '#4CAF50' : 'rgba(255,255,255,0.1)'};
                                color: white;
                                border: none;
                                border-radius: 20px;
                                padding: 5px 15px;
                                cursor: pointer;
                                font-size: 0.9em;
                            ">${totalConquistas > 0 ? `🏆 ${totalConquistas}` : '0'}</button>
                        </td>
                    </tr>
                `;
            });
            
            html += `</tbody></table>`;
        }
        
        html += `
            <div style="margin: 20px 0; text-align: center;">
                <input type="text" id="busca-jogador-ranking" placeholder="Digite o nome do jogador..." style="
                    padding: 12px 20px;
                    width: 60%;
                    max-width: 300px;
                    border-radius: 30px;
                    border: 2px solid #f7931a;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    font-size: 1em;
                ">
                <button onclick="RankingSystem.buscarJogador()" style="
                    padding: 12px 25px;
                    background: linear-gradient(135deg, #f7931a, #e68200);
                    color: white;
                    border: none;
                    border-radius: 30px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-left: 10px;
                ">🔍 Buscar</button>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                    flex: 2;
                    padding: 12px;
                    background: #f7931a;
                    color: white;
                    border: none;
                    border-radius: 25px;
                    font-weight: bold;
                    cursor: pointer;
                ">Fechar</button>
            </div>
        `;
        
        container.innerHTML = html;
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            const busca = document.getElementById('busca-jogador-ranking');
            if (busca) busca.focus();
        }, 500);
    },
    
    
    
    createRankingButton: function() {
        if (document.getElementById('ranking-button')) return;
        
        const btn = document.createElement('button');
        btn.id = 'ranking-button';
        btn.innerHTML = '🏆 Ranking';
        btn.style.cssText = `
            position: fixed;
            top: 0px;
            left: 130px;
            padding: 10px 20px;
            background: rgba(33,150,243,0.9);
            color: white;
            border: none;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;
        
        btn.onmouseover = () => {
            btn.style.transform = 'scale(1.05)';
            btn.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
        };
        
        btn.onmouseout = () => {
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        };
        
        btn.onclick = () => {
            if (SoundSystem) SoundSystem.click();
            this.showRanking();
        };
        
        document.body.appendChild(btn);
    },
    
    saveGameScore: function(isVictory) {
        const playerName = prompt(
            `🎮 ${isVictory ? 'PARABÉNS!' : 'GAME OVER'}\n\nDigite seu nome para o ranking:`,
            localStorage.getItem('jogobitcoin_lastname') || ''
        );
        
        if (playerName !== null) {
            const nomeLimpo = playerName.trim();
            if (nomeLimpo) {
                localStorage.setItem('jogobitcoin_lastname', nomeLimpo);
            }
            
            // Salvar conquistas da sessão atual para este jogador
            if (selosConquistados.length > 0 && nomeLimpo) {
                console.log(`🏆 Salvando ${selosConquistados.length} conquistas da sessão para ${nomeLimpo}`);
                selosConquistados.forEach(conquista => {
                    const conquistaFormatada = {
                        id: conquista.id,
                        titulo: conquista.titulo,
                        icone: conquista.icone,
                        descricao: ''
                    };
                    this.adicionarConquista(nomeLimpo, conquistaFormatada);
                });
            }
            
            this.addScore(
                nomeLimpo || 'Anônimo',
                score,
                bitcoinQuantity,
                brokenBlocks,
                dificuldadeAtual,
                tempoTotalPartida
            );
            
            setTimeout(() => this.showRanking(), 1000);
        }
    },
    
    debug: function() {
        console.log('🔍 Ranking:', this.ranking);
        console.log('🔍 Conquistas:', this.conquistasPorJogador);
    }
};

// ============================================
// 8. SISTEMA DE SONS
// ============================================
const SoundSystem = {
    urls: { correct: 'sounds/correct.mp3', wrong: 'sounds/wrong.mp3', click: 'sounds/click.mp3', block: 'sounds/block.mp3', gameover: 'sounds/gameover.mp3', win: 'sounds/win.mp3' },
    audios: {}, enabled: true,
    
    init: function() {
        for (const [k, u] of Object.entries(this.urls)) {
            try { 
                this.audios[k] = new Audio(u); 
                this.audios[k].volume = 0.7; 
                this.audios[k].preload = 'auto'; 
            } catch { 
                this.createFallbackSound(k); 
            }
        }
        this.createSoundToggle();
    },
    
    createFallbackSound: function(t) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            const freq = { correct:800, wrong:300, click:600, block:500, gameover:200, win:700 }[t] || 500;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start(); osc.stop(ctx.currentTime + 0.3);
        } catch {}
    },
    
    play: function(n) { 
        if (!this.enabled) return; 
        if (this.audios[n]) { 
            this.audios[n].currentTime = 0; 
            this.audios[n].play().catch(() => {}); 
        } 
    },
    
    createSoundToggle: function() {
        if (document.getElementById('sound-toggle')) return;
        const btn = document.createElement('button');
        btn.id = 'sound-toggle'; btn.innerHTML = '🔊';
        btn.style.cssText = 'position:fixed; top:0px; left:75px; width:40px; height:40px; border-radius:50%; background:#f7931a; color:white; border:none; font-size:1.2em; cursor:pointer; z-index:10000;';
        btn.onclick = () => { 
            this.enabled = !this.enabled; 
            btn.innerHTML = this.enabled ? '🔊' : '🔇'; 
            localStorage.setItem('jogobitcoin_sound', this.enabled); 
        };
        const saved = localStorage.getItem('jogobitcoin_sound');
        if (saved !== null) { 
            this.enabled = saved === 'true'; 
            btn.innerHTML = this.enabled ? '🔊' : '🔇'; 
        }
        document.body.appendChild(btn);
    },
    
    correct: function() { this.play('correct'); },
    wrong: function() { this.play('wrong'); },
    click: function() { this.play('click'); },
    block: function() { this.play('block'); },
    gameover: function() { this.play('gameover'); },
    win: function() { this.play('win'); }
};

// ============================================
// 9. LISTA DE CRIPTOATIVOS
// ============================================
const cryptoNomes = [
    "Bitcoin", "Ethereum", "Binance", "Solana", "Cardano", "Ripple", "Polkadot", "Dogecoin", "Shiba", "Avalanche",
    "Chainlink", "Litecoin", "Polygon", "Uniswap", "Monero", "Blockchain", "Hash", "Miner", "Node", "Wallet",
    "PrivateKey", "PublicKey", "SeedPhrase", "Nonce", "Merkle", "ProofOfWork", "ProofOfStake", "SmartContract", "GasFee", "Fork",
    "Halving", "Difficulty", "Timestamp", "Consensus", "Coinbase", "Kraken", "Gemini", "FTX", "CryptoCom", "KuCoin",
    "Satoshi", "Nakamoto", "Vitalik", "Buterin", "CZ", "Zhao", "Gavin", "Wood", "Charles", "Hoskinson",
    "Tron", "Algorand", "Tezos", "EOS", "NEO", "Stellar", "Cosmos", "Fantom", "Harmony", "Kusama",
    "Filecoin", "Arweave", "Helium", "Theta", "Flow", "Aave", "Compound", "Maker", "Curve", "Sushi",
    "PancakeSwap", "Yearn", "Synthetix", "Balancer", "Convex", "OpenSea", "BoredApe", "CryptoPunks", "Axie", "Sandbox",
    "Decentraland", "ENS", "Optimism", "Arbitrum", "zkSync", "Starknet", "Loopring", "ImmutableX", "Boba", "Metis",
    "Tornado", "Cash", "Zcash", "Dash", "Zooko", "Grin", "Beam", "Secret", "Oasis", "Aleo",
    "Tether", "USDC", "DAI", "BUSD", "FRAX", "Infura", "Alchemy", "QuickNode", "Moralis", "TheGraph",
    "IPFS", "Pinata", "Fleek", "Ceramic", "Livepeer", "UniswapDAO", "MakerDAO", "Aragon", "Moloch", "StepN",
    "SEC", "CFTC", "FATF", "FinCEN", "MiCA", "IRS", "FCA", "ASIC", "Bull", "Bear",
    "Whale", "HODL", "FOMO", "FUD", "ReKT", "WAGMI", "NGMI", "GM", "Airdrop", "RugPull",
    "DYOR", "ATH", "ATL", "Bitmain", "Antminer", "Whatsminer", "ASIC", "GPU", "Hashrate", "MiningRig",
    "CoinDesk", "Cointelegraph", "Messari", "Decrypt", "Bankless", "LexFridman", "Pomp", "BitcoinMagazine", "TheBlock"
];

// ============================================
// 10. SISTEMA DE CRIPTOGRAFIA
// ============================================
const Criptografia = {
    cifraDeCesar: (texto, chave) => {
        return texto.split('').map(char => {
            if (char.match(/[a-zA-Z]/)) {
                const code = char.charCodeAt(0);
                const base = code >= 65 && code <= 90 ? 65 : 97;
                let nova = (code - base + chave) % 26;
                if (nova < 0) nova += 26;
                return String.fromCharCode(base + nova);
            }
            return char;
        }).join('');
    },
    paraASCII: (texto) => texto.split('').map(c => c.charCodeAt(0).toString().padStart(3, '0')).join(' '),
    paraBase64: (texto) => { try { return btoa(texto); } catch { return texto; } },
    decifrarDeCesar: (texto, chave) => Criptografia.cifraDeCesar(texto, -chave),
    deASCII: (texto) => texto.split(' ').map(c => String.fromCharCode(parseInt(c))).join(''),
    deBase64: (texto) => { try { return atob(texto); } catch { return ''; } }
};

// ============================================
// 11. SISTEMA DE PROBLEMAS
// ============================================
const SistemaProblemas = {
    facil: () => {
        const nome = cryptoNomes[Math.floor(Math.random() * cryptoNomes.length)];
        const chave = Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : -(Math.floor(Math.random() * 5) + 1);
        return {
            pergunta: `🔐 Descriptografe (Cifra de César, chave: ${Math.abs(chave)}${chave > 0 ? ' →' : ' ←'}):`,
            textoCifrado: Criptografia.cifraDeCesar(nome, chave),
            respostaCorreta: nome.toLowerCase(),
            tipo: 'cesar', chave, dica: `Dica: Desloque ${Math.abs(chave)} letras`
        };
    },
    medio: () => {
        const nome = cryptoNomes[Math.floor(Math.random() * cryptoNomes.length)];
        if (Math.random() > 0.5) {
            const chave = Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 3 : -(Math.floor(Math.random() * 5) + 3);
            return {
                pergunta: `🔐 Descriptografe (Cifra de César, chave: ${Math.abs(chave)}${chave > 0 ? ' →' : ' ←'}):`,
                textoCifrado: Criptografia.cifraDeCesar(nome, chave),
                respostaCorreta: nome.toLowerCase(),
                tipo: 'cesar', chave, dica: `Dica: Desloque ${Math.abs(chave)} posições`
            };
        } else {
            return {
                pergunta: `🔢 Converta ASCII para texto:`,
                textoCifrado: Criptografia.paraASCII(nome),
                respostaCorreta: nome.toLowerCase(),
                tipo: 'ascii', dica: `Dica: Cada 3 números = 1 caractere`
            };
        }
    },
    dificil: () => {
        const nome = cryptoNomes[Math.floor(Math.random() * cryptoNomes.length)];
        const tipo = ['cesar', 'ascii', 'base64'][Math.floor(Math.random() * 3)];
        if (tipo === 'cesar') {
            const chave = Math.random() > 0.5 ? Math.floor(Math.random() * 8) + 3 : -(Math.floor(Math.random() * 8) + 3);
            return {
                pergunta: `🔐 Descriptografe (Cifra de César):`,
                textoCifrado: Criptografia.cifraDeCesar(nome, chave),
                respostaCorreta: nome.toLowerCase(),
                tipo: 'cesar', chave, dica: `Chave: ${chave > 0 ? '+' : ''}${chave}`
            };
        } else if (tipo === 'ascii') {
            return {
                pergunta: `🔢 Decodifique ASCII:`,
                textoCifrado: Criptografia.paraASCII(nome),
                respostaCorreta: nome.toLowerCase(),
                tipo: 'ascii', dica: `Use tabela ASCII`
            };
        } else {
            return {
                pergunta: `🔄 Decodifique Base64:`,
                textoCifrado: Criptografia.paraBase64(nome),
                respostaCorreta: nome.toLowerCase(),
                tipo: 'base64', dica: `Termina com = ou ==`
            };
        }
    }
};

// ============================================
// 12. FUNÇÕES PRINCIPAIS DO JOGO
// ============================================

function startGame(difficulty) {
    dificuldadeAtual = difficulty;
    switch(difficulty) {
        case 'facil': timeLimit = 60; break;
        case 'medio': timeLimit = 45; break;
        case 'dificil': timeLimit = 30; break;
        default: timeLimit = 60; dificuldadeAtual = 'facil';
    }
    remainingTime = timeLimit;
    
    resetTimerGlobal();
    iniciarTimerGlobal();
    
    document.getElementById('info-container').style.display = 'none';
    document.getElementById('difficulty-selection').style.display = 'none';
    document.getElementById('problem-container').style.display = 'flex';
    document.getElementById('game-container').style.display = 'flex';
    document.getElementById('hash-log').style.display = 'flex';
    
    ['img-Bitcoin.esquerda', 'img-esquerda', 'img-logo.esquerda', 'img-Bitcoin.direita', 'img-direita', 'img-logo.direita'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    document.getElementById('answer').disabled = false;
    initializeBlocks();
    updateBitcoinValue();
    updateScoreDisplay(score);
    updateVidasDisplay();
    gameStartTime = Date.now();
    SoundSystem.click();
    
    const tipo = document.getElementById('tipo-indicador');
    if (tipo) {
        tipo.textContent = `Dificuldade: ${dificuldadeAtual.toUpperCase()}`;
        tipo.className = `tipo-${dificuldadeAtual}`;
        tipo.style.display = 'inline-block';
    }
    
    displayNextProblem();
}

function resetGame() {
    document.getElementById('mensagem-final').style.display = 'none';
    document.getElementById('restart-button').style.display = 'none';
    document.getElementById('difficulty-selection').style.display = 'block';
    document.getElementById('info-container').style.display = 'flex';
    document.getElementById('problem-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('hash-log').style.display = 'none';
    document.getElementById('history-container').style.display = 'none';
    document.getElementById('mensagem-container').style.display = 'none';
    
    // 🆕 OCULTAR O TIMER GLOBAL NA TELA INICIAL
    const tempoDisplay = document.getElementById('tempo-global');
    if (tempoDisplay) {
        tempoDisplay.style.display = 'none';
    }

    // Reiniciar variáveis
    bitcoinQuantity = 0; 
    score = 0; 
    currentProblem = 1; 
    vidas = 3; 
    jogoConcluido = false; 
    brokenBlocks = 0;
    problemaAtual = null; 
    errosConsecutivos = 0;
    
    clearInterval(timerInterval);
    resetTimerGlobal();
    
    pararTimerGlobal();
    metasAlcancadas = []; 
    selosConquistados = [];
    
    updateScoreDisplay(score);
    updateBitcoinValue();
    updateVidasDisplay();
    document.getElementById('timer').textContent = '';
    document.getElementById('result').textContent = '';
    document.getElementById('hash-display').innerHTML = 'Nenhum bloco quebrado ainda.';
    
    ['img-Bitcoin.esquerda', 'img-esquerda', 'img-logo.esquerda', 'img-Bitcoin.direita', 'img-direita', 'img-logo.direita'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'block';
    });
    
    SoundSystem.click();
    initializeBlocks();
}

function initializeBlocks() {
    const container = document.getElementById('blocks-container');
    container.innerHTML = '';
    blocks = [];
    for (let i = 0; i < TamMax; i++) {
        const block = document.createElement('div');
        block.className = 'block';
        block.textContent = i + 1;
        block.setAttribute('data-stage', '0');
        const progress = document.createElement('div');
        progress.className = 'block-progress';
        progress.textContent = '0%';
        block.appendChild(progress);
        blocks.push(block);
        container.appendChild(block);
    }
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(10, 1fr)';
    container.style.gap = '1px';
    container.style.justifyContent = 'center';
}

function generateCryptoProblem() {
    try {
        problemaAtual = SistemaProblemas[dificuldadeAtual]();
    } catch {
        problemaAtual = SistemaProblemas['facil']();
    }
    errosConsecutivos = 0;
    return {
        texto: `${problemaAtual.pergunta}<br><div class="texto-cifrado">${problemaAtual.textoCifrado}</div>`,
        dados: problemaAtual
    };
}

function displayNextProblem() {
    if (jogoConcluido || vidas <= 0) {
        if (vidas <= 0) gameOver();
        return;
    }
    
    const p = generateCryptoProblem();
    document.getElementById('problem-number').textContent = `Bloco Nº: ${currentProblem}`;
    document.getElementById('problem-question').innerHTML = p.texto;
    
    fecharCirculo();
    
    const btnAntigo = document.getElementById('btn-circulo-cesar');
    if (btnAntigo) btnAntigo.remove();
    
    if (problemaAtual && problemaAtual.tipo === 'cesar') {
        const container = document.getElementById('problem-container');
        const btnCirculo = document.createElement('button');
        btnCirculo.id = 'btn-circulo-cesar';
        btnCirculo.innerHTML = '🔄 Abrir Círculo de César';
        btnCirculo.style.cssText = `
            margin: 15px auto;
            padding: 12px 25px;
            background: linear-gradient(135deg, #9c27b0, #673ab7);
            color: white;
            border: none;
            border-radius: 30px;
            font-weight: bold;
            font-size: 1.1em;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(156, 39, 176, 0.4);
            transition: all 0.3s ease;
            display: block;
            width: fit-content;
        `;
        btnCirculo.onmouseover = () => {
            btnCirculo.style.transform = 'scale(1.05)';
            btnCirculo.style.boxShadow = '0 8px 25px rgba(156, 39, 176, 0.6)';
        };
        btnCirculo.onmouseout = () => {
            btnCirculo.style.transform = 'scale(1)';
            btnCirculo.style.boxShadow = '0 4px 15px rgba(156, 39, 176, 0.4)';
        };
        btnCirculo.onclick = ativarCirculoCesar;
        container.appendChild(btnCirculo);
    }
    
    const tipo = document.getElementById('tipo-indicador');
    if (tipo) {
        tipo.textContent = `Dificuldade: ${dificuldadeAtual.toUpperCase()}`;
        tipo.className = `tipo-${dificuldadeAtual}`;
    }
    
    const input = document.getElementById('answer');
    input.value = ''; 
    input.disabled = false; 
    input.focus();
    
    document.getElementById('result').textContent = '';
    startTimer();

    // 🆕 ATUALIZAR DECODIFICADOR SE ESTIVER ABERTO
    setTimeout(() => {
        atualizarDecodificadorComProblema();
    }, 500);
}

function startTimer() {
    remainingTime = timeLimit;
    updateTimerDisplay();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (jogoConcluido || vidas <= 0) {
            clearInterval(timerInterval);
            return;
        }
        remainingTime--;
        updateTimerDisplay();
        if (remainingTime <= 10) {
            document.getElementById('timer').style.color = '#ff4444';
            document.getElementById('timer').classList.add('pulse');
        }
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            document.getElementById('result').textContent = '⏰ Tempo esgotado!';
            perderVida();
            setTimeout(() => {
                if (!jogoConcluido && vidas > 0) displayNextProblem();
            }, 1500);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const t = document.getElementById('timer');
    if (t) {
        t.textContent = `⏱️ ${remainingTime}s`;
        if (remainingTime > 10) {
            t.style.color = '';
            t.classList.remove('pulse');
        }
    }
}

// ============================================
// FUNÇÃO SUBMIT ANSWER - VERIFICAÇÃO ATIVADA
// ============================================
function submitAnswer() {
    if (jogoConcluido || vidas <= 0) return;
    
    const answerInput = document.getElementById('answer');
    const answer = answerInput.value.trim().toLowerCase();
    
    // Verificar se resposta está vazia
    if (!answer) {
        document.getElementById('result').textContent = '❌ Digite uma resposta!';
        document.getElementById('result').style.color = '#ff9800';
        
        // Feedback visual
        answerInput.style.borderColor = '#ff9800';
        answerInput.style.boxShadow = '0 0 10px rgba(255,152,0,0.5)';
        setTimeout(() => {
            answerInput.style.borderColor = '';
            answerInput.style.boxShadow = '';
        }, 1000);
        return;
    }
    
    // Verificar se há problema atual
    if (!problemaAtual) {
        document.getElementById('result').textContent = '❌ Erro: problema não carregado';
        document.getElementById('result').style.color = '#f44336';
        return;
    }
    
    // COMPARAÇÃO DA RESPOSTA
    if (answer === problemaAtual.respostaCorreta) {
        // ✅ RESPOSTA CORRETA
        clearInterval(timerInterval);
        
        // Feedback visual de acerto
        document.getElementById('result').textContent = '✅ CORRETO! Bloco minerado!';
        document.getElementById('result').style.color = '#4CAF50';
        answerInput.style.borderColor = '#4CAF50';
        answerInput.style.boxShadow = '0 0 15px rgba(76,175,80,0.5)';
        
        // Efeito visual na pergunta
        const questionElement = document.getElementById('problem-question');
        questionElement.classList.add('mining-success');
        setTimeout(() => {
            questionElement.classList.remove('mining-success');
        }, 1000);
        
        // Resetar borda após 1 segundo
        setTimeout(() => {
            answerInput.style.borderColor = '';
            answerInput.style.boxShadow = '';
        }, 1000);
        
        // Atualizar jogo (Bitcoin, blocos, etc)
        updateBitcoinValue();
        updateBlocks();
        
        // Som de acerto
        if (SoundSystem) SoundSystem.correct();
        
    } else {
        // ❌ RESPOSTA ERRADA
        errosConsecutivos++;
        
        // Feedback visual de erro
        document.getElementById('result').textContent = '❌ RESPOSTA ERRADA! Tente novamente.';
        document.getElementById('result').style.color = '#f44336';
        answerInput.style.borderColor = '#f44336';
        answerInput.style.boxShadow = '0 0 15px rgba(244,67,54,0.5)';
        
        // Resetar borda após 1 segundo
        setTimeout(() => {
            answerInput.style.borderColor = '';
            answerInput.style.boxShadow = '';
        }, 1000);
        
        // Dar dica após 2 erros consecutivos
        if (errosConsecutivos >= 2 && problemaAtual.dica) {
            const dicaElement = document.createElement('div');
            dicaElement.className = 'dica-box';
            dicaElement.innerHTML = `<small>💡 DICA: ${problemaAtual.dica}</small>`;
            document.getElementById('result').appendChild(dicaElement);
            
            // Remover dica após 5 segundos
            setTimeout(() => {
                if (dicaElement.parentElement) dicaElement.remove();
            }, 5000);
        }
        
        // Perder uma vida
        perderVida();
        
        // Som de erro
        if (SoundSystem) SoundSystem.wrong();
    }
}

function updateBitcoinValue() {
    if (jogoConcluido) return;
    let add = 0;
    switch(dificuldadeAtual) {
        case 'facil': add = 0.01000000; break;
        case 'medio': add = 0.01200000; break;
        case 'dificil': add = 0.01500000; break;
    }
    bitcoinQuantity += add;
    const disp = document.getElementById('bitcoin-value');
    if (disp) disp.textContent = `${bitcoinQuantity.toFixed(8)} BTC`;
}

function updateBlocks() {
    const idx = currentProblem - 1;
    if (idx < 0 || idx >= blocks.length) return;
    const block = blocks[idx];
    const stage = parseInt(block.getAttribute('data-stage'), 10);
    if (stage >= 3) return;
    
    const next = stage + 1;
    block.setAttribute('data-stage', next);
    
    switch(next) {
        case 1:
            block.style.backgroundColor = '#f1c40f';
            updateBlockProgress(idx, 33);
            updateScore(100);
            break;
        case 2:
            block.style.backgroundColor = '#95a5a6';
            updateBlockProgress(idx, 66);
            updateScore(200);
            break;
        case 3:
            block.style.backgroundColor = '#2ecc71';
            updateBlockProgress(idx, 100);
            updateScore(300);
            brokenBlocks++;
            
            if (brokenBlocks === 100) bitcoinQuantity += 0.00050000;
            
            verificarBonusDeBlocos();
            updateHashLog(currentProblem);
            
            if (brokenBlocks % 5 === 0) {
                const idxMsg = (brokenBlocks / 5 - 1) % mensagensDeIncentivo.length;
                setTimeout(() => mostrarMensagemIncentivo(idxMsg), 500);
            }
            
            if (brokenBlocks % 6 === 0) {
                const cap = Math.floor(brokenBlocks / 6);
                setTimeout(() => showHistory(cap), 2000);
            }
            
            currentProblem++;
            if (currentProblem > TamMax) {
                setTimeout(() => endGame(true), 1000);
                return;
            }
            break;
    }
    
    if (next < 3) {
        setTimeout(() => displayNextProblem(), 1000);
    } else {
        setTimeout(() => displayNextProblem(), 1500);
        SoundSystem.block();
    }
}

function updateBlockProgress(idx, pct) {
    const prog = blocks[idx].querySelector('.block-progress');
    if (prog) prog.textContent = `${pct}%`;
}

function updateScore(points) {
    if (jogoConcluido) return;
    let bonus = 0;
    if (problemaAtual) {
        switch(problemaAtual.tipo) {
            case 'cesar': bonus = 50; break;
            case 'ascii': bonus = 75; break;
            case 'base64': bonus = 100; break;
        }
        bonus += Math.floor(remainingTime * 2);
    }
    const old = score;
    score += points + bonus;
    animateScore(old, score);
}

function animateScore(old, target) {
    const disp = document.getElementById('score-display');
    if (!disp) return;
    const int = setInterval(() => {
        if (old < target) {
            old += Math.max(1, Math.floor((target - old) / 10));
            updateScoreDisplay(old);
        } else {
            clearInterval(int);
            updateScoreDisplay(target);
        }
    }, 50);
}

function updateScoreDisplay(val) {
    const disp = document.getElementById('score-display');
    if (!disp) return;
    const s = val.toString().padStart(4, '0');
    disp.innerHTML = '';
    for (let d of s) {
        const box = document.createElement('span');
        box.className = 'score-box';
        box.textContent = d;
        disp.appendChild(box);
    }
}

function updateVidasDisplay() {
    const cont = document.getElementById('vidas-container');
    if (!cont) return;
    cont.innerHTML = '<span class="vidas-label">Vidas:</span>';
    for (let i = 0; i < 3; i++) {
        const vida = document.createElement('img');
        vida.className = 'vida';
        vida.src = ['a.png', 'b.png', 'c.png'][i];
        vida.alt = `Vida ${i+1}`;
        vida.style.cssText = 'width:35px; height:35px; margin:0 8px; transition:all 0.3s ease;';
        if (i >= vidas) {
            vida.style.opacity = '0.3';
            vida.style.filter = 'grayscale(100%) brightness(0.5)';
        } else {
            vida.style.opacity = '1';
            vida.style.filter = 'drop-shadow(0 0 8px rgba(247,147,26,0.7))';
            vida.style.animation = 'bitcoinPulse 2s infinite ease-in-out';
        }
        cont.appendChild(vida);
    }
}

function perderVida() {
    if (vidas > 0) {
        vidas--;
        updateVidasDisplay();
        const cont = document.getElementById('vidas-container');
        cont.classList.add('shake');
        setTimeout(() => cont.classList.remove('shake'), 500);
    }
    if (vidas === 0) setTimeout(() => gameOver(), 1000);
}

function gameOver() {
    jogoConcluido = true;
    clearInterval(timerInterval);
    pararTimerGlobal();
    
    document.getElementById('answer').disabled = true;
    const msg = document.getElementById('mensagem-final');
    const txt = document.getElementById('mensagem-texto');
    const btn = document.getElementById('restart-button');
    if (msg && txt) {
        txt.innerHTML = `<h2>💀 Game Over!</h2><p>BTC: ${bitcoinQuantity.toFixed(8)}</p><p>Pontos: ${score}</p><p>Blocos: ${brokenBlocks}</p><p>Tempo total: ${formatarTempo(tempoTotalPartida)}</p>`;
        msg.style.display = 'block';
    }
    SoundSystem.gameover();
    setTimeout(() => RankingSystem.saveGameScore(false), 1500);
    if (btn) btn.style.display = 'inline-block';
}

function endGame(isVictory = true) {
    jogoConcluido = true;
    clearInterval(timerInterval);
    pararTimerGlobal();
    
    document.getElementById('answer').disabled = true;
    const msg = document.getElementById('mensagem-final');
    const txt = document.getElementById('mensagem-texto');
    const btn = document.getElementById('restart-button');
    if (msg && txt) {
        if (isVictory) {
            SoundSystem.win();
            txt.innerHTML = `<h2>🎉 Parabéns!</h2><p>BTC: ${bitcoinQuantity.toFixed(8)}</p><p>Pontos: ${score}</p><p>Blocos: ${brokenBlocks}</p><p>Tempo total: ${formatarTempo(tempoTotalPartida)}</p>`;
        } else {
            SoundSystem.gameover();
            txt.innerHTML = `<h2>💀 Game Over!</h2><p>BTC: ${bitcoinQuantity.toFixed(8)}</p><p>Pontos: ${score}</p><p>Tempo total: ${formatarTempo(tempoTotalPartida)}</p>`;
        }
        msg.style.display = 'block';
    }
    setTimeout(() => RankingSystem.saveGameScore(isVictory), 1500);
    if (btn) btn.style.display = 'inline-block';
}

function formatarTempo(segundos) {
    const hrs = Math.floor(segundos / 3600);
    const mins = Math.floor((segundos % 3600) / 60);
    const secs = segundos % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function mostrarMensagemIncentivo(idx) {
    const c = document.getElementById('mensagem-container');
    if (!c) return;
    if (idx >= 0 && idx < mensagensDeIncentivo.length) {
        c.innerHTML = `<div style="background:linear-gradient(135deg,#f7931a,#ffb347); color:white; padding:20px; border-radius:15px; border:3px solid gold; text-align:center; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:10000; max-width:400px;">${mensagensDeIncentivo[idx]}<br><small>Bloco ${brokenBlocks}</small></div>`;
        c.style.display = 'block';
        setTimeout(() => { c.style.display = 'none'; }, 3000);
    }
}

// ============================================
// 13. FUNÇÃO SHOWHISTORY
// ============================================
function showHistory(chapter) {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    const textos = [
    "2009: Criação do Bitcoin por Satoshi Nakamoto. O bloco gênese é minerado em 3 de janeiro, marcando o início da era das criptomoedas.",
    
    "2010: Primeira transação comercial - Laszlo Hanyecz compra 2 pizzas por 10.000 BTC (valor hoje: bilhões de dólares!).",
    
    "2012: Primeiro halving - recompensa cai de 50 para 25 BTC. Bitcoin Foundation é estabelecida para padronizar e proteger o protocolo.",
    
    "2013: Bitcoin atinge $1.000 pela primeira vez. O FBI fecha o Silk Road e apreende 144.000 BTC.",
    
    "2014: Falência da Mt. Gox - maior exchange da época perde 850.000 BTC. Preço cai para $300.",
    
    "2015: Ethereum é lançado, trazendo smart contracts. Coinbase se torna a primeira exchange unicórnio.",
    
    "2016: Segundo halving - recompensa cai para 12.5 BTC. Bitcoin é reconhecido como moeda no Japão.",
    
    "2017: Bitcoin atinge $20.000. ICOs explodem. CME lança futuros de Bitcoin.",
    
    "2018: Grande correção - Bitcoin cai para $3.200. Início do 'Crypto Winter'.",
    
    "2019: Facebook anuncia Libra (Diem). China anuncia blockchain como prioridade nacional.",
    
    "2020: Terceiro halving - recompensa reduzida para 6.25 BTC. PayPal permite compra de Bitcoin. MicroStrategy começa a comprar BTC para tesouraria.",
    
    "2021: Bitcoin atinge ATH de $69.000. El Salvador adota Bitcoin como moeda legal. Taproot é ativado.",
    
    "2022: 'Crypto Winter' com colapso de LUNA/UST e FTX. Mercado perde US$ 2 trilhões em valor.",
    
    "2023: Bitcoin sobe mais de 150% no ano. Aprovação do primeiro ETF de Bitcoin futuro nos EUA.",
    
    "2024: Quarto halving - recompensa cai para 3.125 BTC. ETFs de Bitcoin à vista são aprovados nos EUA, com fluxo bilionário.",
    
    "2025: Bitcoin atinge novo recorde de US$ 126.000 em outubro, impulsionado por ETFs e adoção institucional. Presidente Trump cria Reserva Estratégica de Bitcoin dos EUA. Maior liquidação da história: US$ 19 bilhões em posições são zeradas em outubro. Congresso aprova GENIUS Act, marco regulatório para stablecoins. Paquistão e outros países anunciam reservas nacionais de Bitcoin.",
    
    "2026: Bitcoin enfrenta correção após euforia, oscilando entre US$ 60.000 e US$ 70.000. Saídas de ETFs ultrapassam US$ 9 bilhões. Mercado amadurece com maior institucionalização e correlação com ativos tradicionais. Debate sobre o fim do ciclo de 4 anos do Bitcoin ganha força."
];
    
    const idx = Math.min(Math.max(1, chapter), textos.length);
    const hist = document.getElementById('history-container');
    if (!hist) return;
    
    hist.innerHTML = `
        <div style="background:linear-gradient(135deg,#1a1a2e,#16213e); color:white; padding:25px; border-radius:15px; border:2px solid #f7931a; max-width:600px; text-align:center;">
            <h3 style="color:#f7931a;">📖 Capítulo ${idx}</h3>
            <div style="background:rgba(255,255,255,0.05); padding:20px; border-left:4px solid #f7931a; text-align:left;">${textos[idx-1]}</div>
            <button onclick="fecharHistoriaEVoltar()" style="margin-top:20px; padding:10px 25px; background:#f7931a; color:white; border:none; border-radius:25px; cursor:pointer;">Fechar</button>
        </div>
    `;
    
    hist.style.display = 'block';
    hist.style.position = 'fixed';
    hist.style.top = '50%';
    hist.style.left = '50%';
    hist.style.transform = 'translate(-50%, -50%)';
    hist.style.zIndex = '10001';
    
    let overlay = document.getElementById('history-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'history-overlay';
        overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:10000; display:block;';
        overlay.onclick = fecharHistoriaEVoltar;
        document.body.appendChild(overlay);
    } else {
        overlay.style.display = 'block';
    }
}

function fecharHistoriaEVoltar() {
    const hist = document.getElementById('history-container');
    if (hist) {
        hist.style.display = 'none';
        hist.innerHTML = '';
    }
    const overlay = document.getElementById('history-overlay');
    if (overlay) overlay.style.display = 'none';
    
    if (!jogoConcluido && vidas > 0) {
        if (remainingTime <= 0) {
            remainingTime = timeLimit;
            updateTimerDisplay();
        }
        if (timerInterval) clearInterval(timerInterval);
        startTimer();
    }
    
    SoundSystem.click();
}

// ============================================
// 14. SISTEMA DE BÔNUS
// ============================================
function verificarBonusDeBlocos() {
    if (brokenBlocks > 0 && brokenBlocks % 20 === 0) {
        let pts = 1000, btc = 0.00000100, vidasBonus = 0;
        switch(dificuldadeAtual) {
            case 'medio': pts = 2000; btc = 0.00000200; break;
            case 'dificil': pts = 3000; btc = 0.00000500; vidasBonus = 1; break;
        }
        score += pts;
        bitcoinQuantity += btc;
        if (vidasBonus && vidas < 3) {
            vidas = Math.min(3, vidas + 1);
            updateVidasDisplay();
        }
        if (brokenBlocks === 100) {
            score += 5000;
            bitcoinQuantity += 0.00001000;
            const metaBonus = metasDisponiveis.find(m => m.id === 'velocidade_50');
            if (metaBonus && !metasAlcancadas.includes('velocidade_50')) {
                alcançarMeta(metaBonus);
            }
            alert('🏆 100 BLOCOS! BÔNUS EXTRA!');
        }
        updateScoreDisplay(score);
        updateBitcoinValue();
        SoundSystem.win();
    }
}

function mostrarBonusMessage(p, b, v) {
    const c = document.getElementById('mensagem-container');
    if (!c) return;
    const div = document.createElement('div');
    div.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:linear-gradient(135deg,#FFD700,#FFA500); color:#000; padding:30px; border-radius:20px; border:5px solid gold; text-align:center; z-index:10000;';
    div.innerHTML = `<div style="font-size:4em;">🏆</div><h2>BÔNUS!</h2><p>+${p} pontos</p><p>+${b.toFixed(8)} BTC</p>${v>0?'<p>+1 vida</p>':''}<button onclick="this.parentElement.remove()">OK</button>`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}

// ============================================
// 15. FUNÇÕES AUXILIARES
// ============================================
function generateHash(n) {
    const d = new Date();
    return `Bloco #${n} | Hash: 000000${Math.random().toString(36).substring(2,15)}${n} | ${d.toLocaleString('pt-BR')}`;
}

function updateHashLog(n) {
    const h = document.getElementById('hash-display');
    if (!h) return;
    if (h.textContent.trim() === "Nenhum bloco quebrado ainda.") h.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'hash-box';
    el.textContent = generateHash(n);
    h.prepend(el);
    while (h.children.length > 5) h.children[h.children.length-1].remove();
}

function showHelp() {
    alert(`🎮 AJUDA DO JOGOBITCOIN\n\n1. Escolha dificuldade\n2. Descriptografe\n3. Digite resposta\n4. Enter\n\nTipos: Cifra de César, ASCII, Base64`);
}

// ============================================
// 16. SISTEMA DE MENU COMPLETO
// ============================================
let gameStartTime = Date.now();

function inicializarContadorVisitas() {
    let v = localStorage.getItem('jogobitcoin_visitas');
    v = v ? parseInt(v) + 1 : 1;
    localStorage.setItem('jogobitcoin_visitas', v);
    const c = document.getElementById('visit-count');
    if (c) c.textContent = v;
}

function criarMenu() {
    const btn = document.createElement('button');
    btn.id = 'menu-button';
    btn.innerHTML = '☰';
    btn.style.cssText = 'position:fixed; bottom:600px; right:20px; width:50px; height:50px; border-radius:50%; background:linear-gradient(135deg,#9c27b0,#673ab7); color:white; border:2px solid #ba68c8; font-size:1.5em; cursor:pointer; z-index:10001;';
    btn.onclick = toggleMenu;
    document.body.appendChild(btn);
    
    const html = `
        <div id="main-menu" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; z-index:20000;">
            <div id="menu-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5);"></div>
            <div style="position:absolute; top:0; right:0; width:350px; height:100%; background:linear-gradient(135deg,#1a1a2e,#16213e); border-left:3px solid #f7931a;">
                <div style="padding:25px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between;">
                    <h3 style="color:#f7931a;">⚙️ MENU</h3>
                    <button onclick="fecharMenu()" style="background:none; border:none; color:#aaa; font-size:2em;">×</button>
                </div>
                <div style="padding:20px;">
                    <div onclick="abrirContato()" style="padding:15px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.1);">📧 Contato</div>
                    <div onclick="mostrarCriador()" style="padding:15px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.1);">👨‍💻 Criador</div>
                    <div onclick="abrirCadastro()" style="padding:15px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.1);">📰 Novidades</div>
                    <div onclick="abrirAvaliacao()" style="padding:15px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.1);">⭐ Avaliar</div>
                    <div onclick="abrirDashboard()" style="padding:15px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.1);">📊 Dashboard</div>
                    <div onclick="mostrarConquistas()" style="padding:15px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.1);">🏆 Conquistas</div>
                    <div onclick="verMinhasConquistas()" style="padding:15px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.1);">👤 Minhas Conquistas</div>
                    <div onclick="verConquistasDeJogador()" style="padding:15px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.1);">🔍 Buscar Conquistas</div>
                    <div onclick="abrirDecodificador()" style="padding:15px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.1);">
                        🔧 Ferramentas de Decodificação
                    </div>
                    <div onclick="abrirSobre()" style="padding:15px; cursor:pointer;">ℹ️ Sobre</div>
                </div>
                <div style="padding:20px; border-top:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between;">
                    <span>👁️ <span id="visit-count">0</span> visitas</span>
                    <span style="color:#888;">v1.0</span>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('menu-overlay').onclick = fecharMenu;
}

function toggleMenu() {
    const m = document.getElementById('main-menu');
    m.style.display = m.style.display === 'block' ? 'none' : 'block';
    if (m.style.display === 'block') {
        const visitas = localStorage.getItem('jogobitcoin_visitas') || 0;
        const contador = document.getElementById('visit-count');
        if (contador) contador.textContent = visitas;
    }
}

function fecharMenu() {
    document.getElementById('main-menu').style.display = 'none';
}

function abrirContato() {
    fecharMenu();
    alert('📧 Contato: guedes_ramos@hotmail.com\n\nClique em OK para copiar o email.');
    navigator.clipboard.writeText('guedes_ramos@hotmail.com').then(() => alert('📋 Email copiado!'));
}

function mostrarCriador() {
    fecharMenu();
    alert('👨‍💻 CRIADOR: Alex A.G. Ramos\n👥 COLABORADOR: Junior\n📧 guedes_ramos@hotmail.com');
}

function abrirCadastro() {
    fecharMenu();
    const nome = prompt('Digite seu nome:');
    const email = prompt('Digite seu email:');
    if (nome && email) {
        const c = JSON.parse(localStorage.getItem('jogobitcoin_cadastros') || '[]');
        c.push({ nome, email, data: new Date().toLocaleString() });
        localStorage.setItem('jogobitcoin_cadastros', JSON.stringify(c));
        alert('✅ Cadastrado com sucesso!');
    }
}

function abrirAvaliacao() {
    fecharMenu();
    const nota = parseInt(prompt('Avalie o jogo (1 a 5 estrelas):'));
    if (nota && nota >= 1 && nota <= 5) {
        const a = JSON.parse(localStorage.getItem('jogobitcoin_avaliacoes') || '[]');
        a.push({ nota, data: new Date().toLocaleString() });
        localStorage.setItem('jogobitcoin_avaliacoes', JSON.stringify(a));
        alert(`⭐ Obrigado! Você avaliou com ${nota} estrelas.`);
    }
}

function abrirDashboard() {
    fecharMenu();
    const visitas = localStorage.getItem('jogobitcoin_visitas') || 0;
    const cadastros = JSON.parse(localStorage.getItem('jogobitcoin_cadastros') || '[]');
    const avaliacoes = JSON.parse(localStorage.getItem('jogobitcoin_avaliacoes') || '[]');
    
    let soma = 0;
    avaliacoes.forEach(a => soma += a.nota);
    const media = avaliacoes.length > 0 ? (soma / avaliacoes.length).toFixed(1) : 0;
    
    alert(`📊 DASHBOARD\n\n👁️ Visitas: ${visitas}\n📰 Cadastros: ${cadastros.length}\n⭐ Avaliações: ${avaliacoes.length}\n📈 Média: ${media}/5`);
}

function abrirSobre() {
    fecharMenu();
    alert('🎮 JogoBitcoin v1.0\n\nUm jogo educativo sobre criptografia e Bitcoin.\n\n© 2026 - Todos os direitos reservados');
}

function mostrarConquistas() {
    fecharMenu();
    if (selosConquistados.length === 0) {
        alert('🏆 Nenhuma conquista ainda. Continue minerando!');
    } else {
        let texto = '🏆 MINHAS CONQUISTAS\n\n';
        selosConquistados.forEach(s => {
            texto += `${s.icone} ${s.titulo} - ${s.data}\n`;
        });
        alert(texto);
    }
}

function verMinhasConquistas() {
    fecharMenu();
    const ultimoJogador = localStorage.getItem('jogobitcoin_lastname');
    
    if (!ultimoJogador) {
        alert('👤 Você ainda não tem um nome registrado. Jogue uma partida primeiro!');
        return;
    }
    
    const conquistas = RankingSystem.getConquistasDoJogador(ultimoJogador);
    
    if (conquistas.length === 0) {
        alert(`🏆 ${ultimoJogador} ainda não tem conquistas. Continue minerando!`);
    } else {
        let texto = `🏆 CONQUISTAS DE ${ultimoJogador.toUpperCase()} 🏆\n\n`;
        conquistas.forEach((c, index) => {
            texto += `${index+1}. ${c.icone} ${c.titulo}\n   📅 ${c.data}\n\n`;
        });
        alert(texto);
    }
}

function verConquistasDeJogador() {
    fecharMenu();
    const nome = prompt('🔍 Digite o nome do jogador:');
    
    if (!nome) return;
    
    const nomeLimpo = nome.trim();
    if (nomeLimpo === '') return;
    
    const conquistas = RankingSystem.getConquistasDoJogador(nomeLimpo);
    
    if (conquistas.length === 0) {
        alert(`🏆 ${nomeLimpo} ainda não tem conquistas registradas.`);
    } else {
        let texto = `🏆 CONQUISTAS DE ${nomeLimpo.toUpperCase()} 🏆\n\n`;
        conquistas.forEach((c, index) => {
            texto += `${index+1}. ${c.icone} ${c.titulo}\n   📅 ${c.data}\n\n`;
        });
        alert(texto);
    }
}

// ============================================
// 17. CÍRCULO DE CÉSAR
// ============================================
let circuloAtivo = false;
let letrasCifradas = [];
let letrasDecifradas = [];
let letraSelecionada = 0;
let rotacoesPorLetra = [];

function ativarCirculoCesar() {
    if (problemaAtual && problemaAtual.tipo === 'cesar') {
        circuloAtivo = true;
        
        const textoOriginal = problemaAtual.textoCifrado;
        const textoDecifrado = problemaAtual.respostaCorreta;
        
        letrasCifradas = textoOriginal.split('').filter(c => c.match(/[a-zA-Z]/));
        letrasDecifradas = textoDecifrado.split('').filter(c => c.match(/[a-zA-Z]/));
        
        rotacoesPorLetra = new Array(letrasCifradas.length).fill(0);
        letraSelecionada = 0;
        
        const circulo = document.getElementById('circulo-cesar');
        if (circulo) {
            circulo.style.display = 'flex';
            criarAlfabetoFixo();
            criarLetrasCifradas();
            atualizarLetraSelecionada();
            atualizarRespostaConstruida();
            
            if (SoundSystem) SoundSystem.click();
        }
    }
}

function criarAlfabetoFixo() {
    const container = document.getElementById('circulo-externo-letras');
    if (!container) return;
    
    container.innerHTML = '';
    const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const raio = 160;
    const centroX = 175;
    const centroY = 175;
    
    alfabeto.forEach((letra, index) => {
        const angulo = (index * 360 / 26) * Math.PI / 180;
        const x = centroX + raio * Math.sin(angulo) - 15;
        const y = centroY - raio * Math.cos(angulo) - 15;
        
        const div = document.createElement('div');
        div.className = 'letra-alfabeto';
        div.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2em;
            font-weight: bold;
            color: gold;
            text-shadow: 0 0 10px rgba(255,215,0,0.5);
        `;
        div.textContent = letra;
        container.appendChild(div);
    });
}

function criarLetrasCifradas() {
    const container = document.getElementById('texto-cifrado-destaque');
    if (!container) return;
    
    container.innerHTML = '';
    
    letrasCifradas.forEach((letra, index) => {
        const btn = document.createElement('button');
        btn.className = 'letra-cifrada-btn';
        btn.style.cssText = `
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: ${index === letraSelecionada ? 'linear-gradient(135deg,#f7931a,#e68200)' : 'rgba(255,255,255,0.1)'};
            border: ${index === letraSelecionada ? '3px solid gold' : '2px solid #f7931a'};
            color: ${index === letraSelecionada ? 'white' : '#f7931a'};
            font-size: 1.5em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: ${index === letraSelecionada ? '0 0 20px rgba(247,147,26,0.7)' : 'none'};
        `;
        btn.textContent = letra.toUpperCase();
        btn.onclick = () => selecionarLetra(index);
        btn.onmouseover = () => {
            if (index !== letraSelecionada) {
                btn.style.transform = 'scale(1.1)';
                btn.style.background = 'rgba(247,147,26,0.3)';
            }
        };
        btn.onmouseout = () => {
            if (index !== letraSelecionada) {
                btn.style.transform = 'scale(1)';
                btn.style.background = 'rgba(255,255,255,0.1)';
            }
        };
        container.appendChild(btn);
    });
}

function selecionarLetra(index) {
    letraSelecionada = index;
    atualizarLetraSelecionada();
    
    const botoes = document.querySelectorAll('.letra-cifrada-btn');
    botoes.forEach((btn, i) => {
        if (i === index) {
            btn.style.background = 'linear-gradient(135deg,#f7931a,#e68200)';
            btn.style.border = '3px solid gold';
            btn.style.color = 'white';
            btn.style.boxShadow = '0 0 20px rgba(247,147,26,0.7)';
        } else {
            btn.style.background = 'rgba(255,255,255,0.1)';
            btn.style.border = '2px solid #f7931a';
            btn.style.color = '#f7931a';
            btn.style.boxShadow = 'none';
        }
    });
    
    if (SoundSystem) SoundSystem.click();
}

function girarLetraAtual(direcao) {
    rotacoesPorLetra[letraSelecionada] += direcao;
    atualizarLetraSelecionada();
    atualizarRespostaConstruida();
    
    const circuloInterno = document.getElementById('circulo-interno');
    if (circuloInterno) {
        circuloInterno.style.transform = `rotate(${rotacoesPorLetra[letraSelecionada] * 5}deg)`;
        setTimeout(() => {
            circuloInterno.style.transform = 'rotate(0deg)';
        }, 200);
    }
    
    if (SoundSystem) SoundSystem.click();
}

function atualizarLetraSelecionada() {
    const letraAtual = document.getElementById('letra-atual');
    if (!letraAtual) return;
    
    const letraOriginal = letrasCifradas[letraSelecionada];
    const rotacao = rotacoesPorLetra[letraSelecionada];
    
    if (letraOriginal && letraOriginal.match(/[a-zA-Z]/)) {
        const code = letraOriginal.charCodeAt(0);
        const base = code >= 97 ? 97 : 65;
        const pos = (code - base - rotacao + 26) % 26;
        const letraDecifrada = String.fromCharCode(base + pos);
        letraAtual.textContent = letraDecifrada.toUpperCase();
        
        const letraEsperada = letrasDecifradas[letraSelecionada];
        if (letraDecifrada.toLowerCase() === letraEsperada.toLowerCase()) {
            letraAtual.style.color = '#4CAF50';
            letraAtual.style.textShadow = '0 0 20px rgba(76,175,80,0.7)';
        } else {
            letraAtual.style.color = '#ffaa00';
            letraAtual.style.textShadow = '0 0 20px rgba(255,170,0,0.7)';
        }
    }
}

function atualizarRespostaConstruida() {
    const container = document.getElementById('resposta-construida');
    if (!container) return;
    
    let resposta = '';
    for (let i = 0; i < letrasCifradas.length; i++) {
        const letra = letrasCifradas[i];
        if (letra.match(/[a-zA-Z]/)) {
            const code = letra.charCodeAt(0);
            const base = code >= 97 ? 97 : 65;
            const pos = (code - base - rotacoesPorLetra[i] + 26) % 26;
            resposta += String.fromCharCode(base + pos);
        } else {
            resposta += letra;
        }
    }
    
    container.textContent = resposta.toLowerCase();
    
    if (resposta.toLowerCase() === letrasDecifradas.join('').toLowerCase()) {
        container.style.color = '#4CAF50';
        container.style.textShadow = '0 0 20px rgba(76,175,80,0.7)';
        
        if (SoundSystem && SoundSystem.win) SoundSystem.win();
    } else {
        container.style.color = '#ffaa00';
        container.style.textShadow = '0 0 15px rgba(255,170,0,0.5)';
    }
}

function usarRespostaConstruida() {
    const resposta = document.getElementById('resposta-construida');
    if (resposta) {
        document.getElementById('answer').value = resposta.textContent;
        fecharCirculo();
        submitAnswer();
    }
}

function fecharCirculo() {
    circuloAtivo = false;
    const circulo = document.getElementById('circulo-cesar');
    if (circulo) {
        circulo.style.display = 'none';
    }
    if (SoundSystem) SoundSystem.click();
}

// ============================================
// 18. CSS ADICIONAL (inserido via JS)
// ============================================
document.head.insertAdjacentHTML('beforeend', `
<style>
    .shake { animation: shake 0.5s ease-in-out; }
    .pulse { animation: pulse 1s infinite; }
    @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
    @keyframes conquistaPop { 0%{transform:translate(-50%,-50%) scale(0.5); opacity:0} 100%{transform:translate(-50%,-50%) scale(1); opacity:1} }
    @keyframes bitcoinPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
</style>
`);

// ============================================
// 19. INICIALIZAÇÃO DO JOGO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('problem-container').style.display = 'none';
    document.getElementById('hash-log').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('tipo-indicador').style.display = 'none';
    
    const answerInput = document.getElementById('answer');
    if (answerInput) {
        answerInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && typeof submitAnswer === 'function') submitAnswer();
        });
    }
    
    updateVidasDisplay();
    CryptoEncyclopedia.init();
    BitcoinPriceWidget.init();
    RankingSystem.init();
    SoundSystem.init();
    
    setTimeout(() => {
        const enc = document.getElementById('crypto-encyclopedia');
        if (enc) enc.style.display = 'none';
    }, 500);
    
    // Inicializar menu
    if (!document.getElementById('main-menu')) criarMenu();
    inicializarContadorVisitas();
});
// ============================================
// DECODIFICADOR - FERRAMENTAS DE APOIO
// ============================================

// Abrir decodificador
function abrirDecodificador() {
    fecharMenu();
    const modal = document.getElementById('decodificador-modal');
    if (modal) {
        modal.style.display = 'flex';
        // Reset para nível fácil
        abrirDecodNivel('facil');
        
        // 🆕 ATUALIZAR COM PROBLEMA ATUAL
        setTimeout(() => {
            atualizarDecodificadorComProblema();
        }, 100);
        
        if (SoundSystem) SoundSystem.click();
    }
}

// Fechar decodificador
function fecharDecodificador() {
    const modal = document.getElementById('decodificador-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    if (SoundSystem) SoundSystem.click();
}

// Abrir nível no decodificador
function abrirDecodNivel(nivel) {
    // Esconder todos os conteúdos
    document.querySelectorAll('.decod-conteudo').forEach(el => el.style.display = 'none');
    
    // Mostrar o nível selecionado
    document.getElementById(`decod-${nivel}`).style.display = 'block';
    
    // Atualizar botões
    document.querySelectorAll('.decod-nivel').forEach(btn => {
        btn.style.background = 'rgba(255,255,255,0.1)';
    });
    
    const btnAtivo = document.querySelector(`.decod-nivel[data-nivel="${nivel}"]`);
    if (btnAtivo) {
        if (nivel === 'facil') btnAtivo.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
        if (nivel === 'medio') btnAtivo.style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
        if (nivel === 'dificil') btnAtivo.style.background = 'linear-gradient(135deg, #f44336, #c62828)';
    }
    
    // Resetar resultado
    document.getElementById('decod-resultado').innerHTML = 'Aguardando decodificação...';
}

// Selecionar método (para médio e difícil)
function selecionarDecodMetodo(nivel, metodo) {
    // Esconder todos os métodos deste nível
    document.querySelectorAll(`#decod-${nivel} .decod-metodo`).forEach(el => el.style.display = 'none');
    
    // Mostrar método selecionado
    document.getElementById(`decod-${nivel}-${metodo}`).style.display = 'block';
    
    // Atualizar botões
    const botoes = document.querySelectorAll(`#decod-${nivel} .btn-metodo`);
    botoes.forEach(btn => btn.style.background = 'rgba(255,255,255,0.1)');
    
    const btnAtivo = event.target;
    if (btnAtivo) {
        if (nivel === 'medio') btnAtivo.style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
        if (nivel === 'dificil') btnAtivo.style.background = 'linear-gradient(135deg, #f44336, #c62828)';
    }
    
    // 🆕 ATUALIZAR COM PROBLEMA ATUAL
    atualizarDecodificadorComProblema();
}

// Função para o nível fácil
function selecionarDecodFacil(tipo) {
    const btnSimples = document.getElementById('decod-facil-simples-btn');
    const btnCirculo = document.getElementById('decod-facil-circulo-btn');
    
    if (tipo === 'simples') {
        document.getElementById('decod-facil-simples').style.display = 'block';
        document.getElementById('decod-facil-circulo').style.display = 'none';
        btnSimples.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
        btnCirculo.style.background = 'rgba(255,255,255,0.1)';
    } else {
        document.getElementById('decod-facil-simples').style.display = 'none';
        document.getElementById('decod-facil-circulo').style.display = 'block';
        btnCirculo.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
        btnSimples.style.background = 'rgba(255,255,255,0.1)';
    }
    
    // 🆕 ATUALIZAR COM PROBLEMA ATUAL
    atualizarDecodificadorComProblema();
}

// Decodificar nível fácil
function decodificarFacil() {
    const input = document.getElementById('decod-facil-input').value;
    const shift = parseInt(document.getElementById('decod-facil-shift').value);
    const resultado = document.getElementById('decod-resultado');
    
    if (!input) {
        resultado.innerHTML = '⚠️ Digite uma mensagem para decodificar!';
        return;
    }
    
    resultado.innerHTML = decodificarCesar(input, shift);
    if (SoundSystem) SoundSystem.click();
}

// Decodificar nível médio
function decodificarMedio() {
    const metodoCesar = document.getElementById('decod-medio-cesar').style.display !== 'none';
    const resultado = document.getElementById('decod-resultado');
    
    if (metodoCesar) {
        const input = document.getElementById('decod-medio-cesar-input').value;
        const shift = parseInt(document.getElementById('decod-medio-shift').value);
        
        if (!input) {
            resultado.innerHTML = '⚠️ Digite uma mensagem!';
            return;
        }
        resultado.innerHTML = decodificarCesar(input, shift);
    } else {
        const input = document.getElementById('decod-medio-ascii-input').value;
        if (!input) {
            resultado.innerHTML = '⚠️ Digite códigos ASCII!';
            return;
        }
        resultado.innerHTML = decodificarASCII(input);
    }
    if (SoundSystem) SoundSystem.click();
}

// Decodificar nível difícil
function decodificarDificil() {
    const metodoCesar = document.getElementById('decod-dificil-cesar').style.display !== 'none';
    const metodoAscii = document.getElementById('decod-dificil-ascii').style.display !== 'none';
    const metodoBase64 = document.getElementById('decod-dificil-base64').style.display !== 'none';
    const resultado = document.getElementById('decod-resultado');
    
    if (metodoCesar) {
        const input = document.getElementById('decod-dificil-cesar-input').value;
        const shift = parseInt(document.getElementById('decod-dificil-shift').value);
        if (!input) {
            resultado.innerHTML = '⚠️ Digite uma mensagem!';
            return;
        }
        resultado.innerHTML = decodificarCesar(input, shift);
    } 
    else if (metodoAscii) {
        const input = document.getElementById('decod-dificil-ascii-input').value;
        if (!input) {
            resultado.innerHTML = '⚠️ Digite códigos ASCII!';
            return;
        }
        resultado.innerHTML = decodificarASCII(input);
    } 
    else if (metodoBase64) {
        const input = document.getElementById('decod-dificil-base64-input').value;
        if (!input) {
            resultado.innerHTML = '⚠️ Digite um texto Base64!';
            return;
        }
        resultado.innerHTML = decodificarBase64(input);
    }
    if (SoundSystem) SoundSystem.click();
}

// Funções auxiliares de decodificação
function decodificarCesar(texto, shift) {
    let resultado = '';
    for (let i = 0; i < texto.length; i++) {
        let char = texto[i];
        if (char.match(/[a-z]/i)) {
            let code = texto.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                char = String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
            } else if (code >= 97 && code <= 122) {
                char = String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
            }
        }
        resultado += char;
    }
    return resultado || '❌ Erro ao decodificar';
}

function decodificarASCII(texto) {
    try {
        const codes = texto.split(/[,\s]+/);
        let resultado = '';
        for (let code of codes) {
            if (code === '') continue;
            const num = parseInt(code);
            if (isNaN(num) || num < 0 || num > 255) {
                return `❌ Código inválido: ${code}`;
            }
            resultado += String.fromCharCode(num);
        }
        return resultado;
    } catch (e) {
        return '❌ Erro ao decodificar ASCII';
    }
}

function decodificarBase64(texto) {
    try {
        return atob(texto.replace(/\s/g, ''));
    } catch (e) {
        return '❌ Erro: Texto Base64 inválido!';
    }
}

function copiarResultadoDecod() {
    const resultado = document.getElementById('decod-resultado').innerText;
    if (resultado && !resultado.includes('Aguardando') && !resultado.includes('⚠️') && !resultado.includes('❌')) {
        navigator.clipboard.writeText(resultado).then(() => {
            alert('✅ Copiado para área de transferência!');
        });
    } else {
        alert('❌ Nada para copiar!');
    }
}

// Atualizar valores dos sliders
document.addEventListener('DOMContentLoaded', function() {
    // Slider fácil
    const sliderFacil = document.getElementById('decod-facil-shift');
    if (sliderFacil) {
        sliderFacil.addEventListener('input', function(e) {
            document.getElementById('decod-facil-shift-value').textContent = e.target.value;
        });
    }
    
    // Slider médio
    const sliderMedio = document.getElementById('decod-medio-shift');
    if (sliderMedio) {
        sliderMedio.addEventListener('input', function(e) {
            document.getElementById('decod-medio-shift-value').textContent = e.target.value;
        });
    }
    
    // Slider difícil
    const sliderDificil = document.getElementById('decod-dificil-shift');
    if (sliderDificil) {
        sliderDificil.addEventListener('input', function(e) {
            document.getElementById('decod-dificil-shift-value').textContent = e.target.value;
        });
    }
});
// ============================================
// FUNÇÃO PARA PREENCHER TEXTO CIFRADO AUTOMATICAMENTE
// ============================================
function preencherTextoAtual() {
    // Verificar se há um problema atual
    if (!problemaAtual) {
        alert('⚠️ Nenhum problema ativo no momento. Inicie uma partida primeiro!');
        return false;
    }
    
    // Pegar o texto cifrado do problema atual
    const textoCifrado = problemaAtual.textoCifrado;
    
    // Determinar qual nível está ativo no decodificador
    const nivelAtivo = document.querySelector('.decod-conteudo[style*="display: block"]')?.id;
    
    if (!nivelAtivo) return false;
    
    // Preencher o campo apropriado baseado no nível e método ativo
    if (nivelAtivo === 'decod-facil') {
        document.getElementById('decod-facil-input').value = textoCifrado;
        
    } else if (nivelAtivo === 'decod-medio') {
        // Verificar qual método está ativo no médio
        const metodoCesar = document.getElementById('decod-medio-cesar').style.display !== 'none';
        const metodoAscii = document.getElementById('decod-medio-ascii').style.display !== 'none';
        
        if (metodoCesar) {
            document.getElementById('decod-medio-cesar-input').value = textoCifrado;
        } else if (metodoAscii && problemaAtual.tipo === 'ascii') {
            document.getElementById('decod-medio-ascii-input').value = textoCifrado;
        }
        
    } else if (nivelAtivo === 'decod-dificil') {
        const metodoCesar = document.getElementById('decod-dificil-cesar').style.display !== 'none';
        const metodoAscii = document.getElementById('decod-dificil-ascii').style.display !== 'none';
        const metodoBase64 = document.getElementById('decod-dificil-base64').style.display !== 'none';
        
        if (metodoCesar) {
            document.getElementById('decod-dificil-cesar-input').value = textoCifrado;
        } else if (metodoAscii && problemaAtual.tipo === 'ascii') {
            document.getElementById('decod-dificil-ascii-input').value = textoCifrado;
        } else if (metodoBase64 && problemaAtual.tipo === 'base64') {
            document.getElementById('decod-dificil-base64-input').value = textoCifrado;
        }
    }
    
    return true;
}

// Modificar a função abrirDecodificador para preencher automaticamente
function abrirDecodificador() {
    fecharMenu();
    const modal = document.getElementById('decodificador-modal');
    if (modal) {
        modal.style.display = 'flex';
        // Reset para nível fácil
        abrirDecodNivel('facil');
        
        // 🆕 PREENCHER TEXTO ATUAL AUTOMATICAMENTE
        setTimeout(() => {
            if (!preencherTextoAtual()) {
                // Se não houver problema atual, mostrar mensagem
                document.getElementById('decod-resultado').innerHTML = '⚠️ Nenhum problema ativo. Inicie uma partida primeiro!';
            }
        }, 100);
        
        if (SoundSystem) SoundSystem.click();
    }
}
// ============================================
// FUNÇÃO PARA USAR RESPOSTA NO JOGO (NÃO FECHA MAIS)
// ============================================
function usarResultadoNoJogo() {
    const resultado = document.getElementById('decod-resultado').innerText;
    
    // Verificações
    if (!resultado || resultado.includes('Aguardando') || resultado.includes('⚠️') || resultado.includes('❌')) {
        alert('❌ Nenhum resultado válido para usar!');
        return;
    }
    
    // Verificar se o jogo está ativo
    if (jogoConcluido || vidas <= 0) {
        alert('❌ O jogo não está ativo no momento!');
        return;
    }
    
    // Preencher a resposta no campo do jogo
    const answerInput = document.getElementById('answer');
    if (answerInput) {
        answerInput.value = resultado;
        
        // Feedback visual
        answerInput.style.borderColor = '#4CAF50';
        answerInput.style.boxShadow = '0 0 20px rgba(76,175,80,0.5)';
        setTimeout(() => {
            answerInput.style.borderColor = '';
            answerInput.style.boxShadow = '';
        }, 1500);
        
        // ✅ REMOVIDO: Não pergunta mais se quer fechar
        // A ferramenta continua aberta
        
        // Focar no campo de resposta (opcional)
        answerInput.focus();
        
        if (SoundSystem) SoundSystem.correct();
        
        // Opcional: Mostrar mensagem de confirmação
        const resultadoDiv = document.getElementById('decod-resultado');
        const msgSucesso = document.createElement('div');
        msgSucesso.style.cssText = `
            background: #4CAF50;
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            margin-top: 10px;
            font-size: 0.9em;
            text-align: center;
        `;
        msgSucesso.textContent = '✅ Resposta copiada para o jogo!';
        resultadoDiv.parentElement.appendChild(msgSucesso);
        
        // Remover mensagem após 2 segundos
        setTimeout(() => {
            if (msgSucesso.parentElement) msgSucesso.remove();
        }, 2000);
    }
}
// ============================================
// ATUALIZAR DECODIFICADOR COM PROBLEMA ATUAL
// ============================================
function atualizarDecodificadorComProblema() {
    // Verificar se o decodificador está aberto
    const modal = document.getElementById('decodificador-modal');
    if (!modal || modal.style.display !== 'flex') return;
    
    // Verificar se há problema atual
    if (!problemaAtual) {
        document.getElementById('decod-resultado').innerHTML = '⚠️ Nenhum problema ativo. Inicie uma partida!';
        return;
    }
    
    // Limpar resultados anteriores
    document.getElementById('decod-resultado').innerHTML = 'Aguardando decodificação...';
    
    // Pegar o texto cifrado
    const textoCifrado = problemaAtual.textoCifrado;
    
    // Determinar qual nível está ativo
    const nivelAtivo = document.querySelector('.decod-conteudo[style*="display: block"]')?.id;
    
    if (!nivelAtivo) return;
    
    console.log(`🔄 Atualizando decodificador com: ${textoCifrado}`);
    
    // Preencher o campo apropriado
    if (nivelAtivo === 'decod-facil') {
        document.getElementById('decod-facil-input').value = textoCifrado;
        
    } else if (nivelAtivo === 'decod-medio') {
        const metodoCesar = document.getElementById('decod-medio-cesar').style.display !== 'none';
        const metodoAscii = document.getElementById('decod-medio-ascii').style.display !== 'none';
        
        if (metodoCesar) {
            document.getElementById('decod-medio-cesar-input').value = textoCifrado;
        } else if (metodoAscii && problemaAtual.tipo === 'ascii') {
            document.getElementById('decod-medio-ascii-input').value = textoCifrado;
        }
        
    } else if (nivelAtivo === 'decod-dificil') {
        const metodoCesar = document.getElementById('decod-dificil-cesar').style.display !== 'none';
        const metodoAscii = document.getElementById('decod-dificil-ascii').style.display !== 'none';
        const metodoBase64 = document.getElementById('decod-dificil-base64').style.display !== 'none';
        
        if (metodoCesar) {
            document.getElementById('decod-dificil-cesar-input').value = textoCifrado;
        } else if (metodoAscii && problemaAtual.tipo === 'ascii') {
            document.getElementById('decod-dificil-ascii-input').value = textoCifrado;
        } else if (metodoBase64 && problemaAtual.tipo === 'base64') {
            document.getElementById('decod-dificil-base64-input').value = textoCifrado;
        }
    }
}
// ============================================
// FUNÇÃO PARA SER CHAMADA QUANDO O PROBLEMA MUDAR
// ============================================
function onProblemaMudou() {
    // Atualizar o decodificador se estiver aberto
    atualizarDecodificadorComProblema();
}

// ============================================
// MODO TESTE - PAUSAR VERIFICAÇÃO
// ============================================
let modoTesteAtivo = false;

function toggleModoTeste() {
    modoTesteAtivo = !modoTesteAtivo;
    
    // Feedback visual
    const status = modoTesteAtivo ? 'ATIVADO' : 'DESATIVADO';
    const cor = modoTesteAtivo ? '#4CAF50' : '#f44336';
    
    // Criar ou atualizar indicador
    let indicador = document.getElementById('modo-teste-indicador');
    if (!indicador) {
        indicador = document.createElement('div');
        indicador.id = 'modo-teste-indicador';
        indicador.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: ${cor};
            color: white;
            padding: 8px 20px;
            border-radius: 30px;
            font-weight: bold;
            z-index: 100000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            border: 2px solid gold;
            cursor: pointer;
        `;
        indicador.onclick = toggleModoTeste;
        document.body.appendChild(indicador);
    }
    
    indicador.style.background = cor;
    indicador.innerHTML = `🧪 MODO TESTE ${status}`;
    
    console.log(`🧪 Modo teste ${status}`);
    
    // Beep de feedback
    if (SoundSystem) SoundSystem.click();
}

// ============================================
// GERADOR DE BLOCOS REALISTAS
// ============================================

// Histórico de hashes para criar a cadeia
let ultimosHashes = [];

function gerarBlocoRealista(numeroBloco, texto = '') {
    // Hash anterior (do último bloco, ou genesis se for o primeiro)
    const hashAnterior = ultimosHashes.length > 0 
        ? ultimosHashes[ultimosHashes.length - 1].hash 
        : '00000000000000000000000000000000';
    
    // Gerar nonce aleatório (entre 0 e 999999)
    const nonce = Math.floor(Math.random() * 1000000);
    
    // Dados do bloco
    const timestamp = Date.now();
    const dados = `${numeroBloco}${nonce}${timestamp}${texto}`;
    
    // Gerar hash (simulação)
    let hash = '';
    for (let i = 0; i < dados.length; i++) {
        hash += dados.charCodeAt(i).toString(16);
    }
    hash = hash.substring(0, 32).padStart(32, '0');
    
    // Formatar hash como 8 grupos de 4 caracteres
    const hashFormatado = hash.match(/.{1,4}/g).join(' ');
    
    const bloco = {
        numero: numeroBloco,
        hashAnterior: hashAnterior,
        nonce: nonce,
        hash: hashFormatado,
        timestamp: new Date().toLocaleString('pt-BR')
    };
    
    // Armazenar para próximo bloco
    ultimosHashes.push({ numero: numeroBloco, hash: hashFormatado });
    
    // Manter apenas últimos 20 hashes na memória
    if (ultimosHashes.length > 20) {
        ultimosHashes.shift();
    }
    
    return bloco;
}

function adicionarBlocoRealista(bloco) {
    const cadeia = document.getElementById('blockchain-cadeia');
    if (!cadeia) return;
    
    const blocoDiv = document.createElement('div');
    blocoDiv.className = 'bloco-blockchain';
    blocoDiv.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border: 2px solid #f7931a;
        border-radius: 12px;
        padding: 18px;
        margin-bottom: 12px;
        font-family: 'Courier New', monospace;
        font-size: 0.95em;
        color: #00ff00;
        box-shadow: 0 6px 20px rgba(247, 147, 26, 0.3);
        transition: all 0.3s ease;
        width: 100%;
    `;
    
    blocoDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(255,255,255,0.1);">
            <span style="color: #f7931a; font-weight: bold; font-size: 1.2em;">⛏️ BLOCO #${bloco.numero}</span>
            <span style="color: #888; font-size: 0.85em;">${bloco.timestamp}</span>
        </div>
        <div style="border-left: 4px solid #4CAF50; padding-left: 12px; margin: 10px 0;">
            <div style="color: #4CAF50; font-size: 0.9em; margin-bottom: 3px;">🔗 HASH ANTERIOR</div>
            <div style="color: #00ff00; word-break: break-all; font-family: monospace;">${bloco.hashAnterior}</div>
        </div>
        <div style="display: flex; gap: 25px; margin: 12px 0; color: #ffaa00; font-size: 1.1em;">
            <span>⚡ NONCE: ${bloco.nonce}</span>
        </div>
        <div style="border-left: 4px solid #f7931a; padding-left: 12px; margin-top: 10px;">
            <div style="color: #f7931a; font-size: 0.9em; margin-bottom: 3px;">📦 HASH ATUAL</div>
            <div style="color: #00ff00; font-weight: bold; word-break: break-all; font-family: monospace;">${bloco.hash}</div>
        </div>
    `;
    
    cadeia.prepend(blocoDiv);
    
    // Manter apenas últimos 8 blocos na visualização
    while (cadeia.children.length > 8) {
        cadeia.removeChild(cadeia.lastChild);
    }
}

// Modificar updateHashLog para usar o novo sistema
function updateHashLog(blockNumber) {
    // Gerar bloco realista
    const bloco = gerarBlocoRealista(blockNumber, problemaAtual?.textoCifrado || '');
    adicionarBlocoRealista(bloco);
    
    // Manter também o formato antigo (opcional)
    const hashDisplay = document.getElementById('hash-display');
    if (hashDisplay) {
        if (hashDisplay.textContent.trim() === "Nenhum bloco quebrado ainda.") {
            hashDisplay.innerHTML = '';
        }
        const el = document.createElement('div');
        el.className = 'hash-box';
        el.style.cssText = `
            background: rgba(0,0,0,0.5);
            border-left: 4px solid #f7931a;
            padding: 10px 15px;
            margin: 8px 0;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #00ff00;
        `;
        el.textContent = `Bloco #${blockNumber} | ${bloco.timestamp} | Hash: ${bloco.hash}`;
        hashDisplay.prepend(el);
        
        while (hashDisplay.children.length > 5) {
            hashDisplay.removeChild(hashDisplay.lastChild);
        }
    }
}

// ============================================
// 20. LOG INICIAL
// ============================================
console.log('✅ JogoBitcoin carregado com sucesso!');
console.log(`💰 Bitcoin atual: ${bitcoinQuantity.toFixed(8)} BTC`);
