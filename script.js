// ============================================
// JOGOBITCOIN - SCRIPT PRINCIPAL
// ============================================
// Versão completa com salvamento e botão encerrar
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
let bubbleInterval = null;
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
let enciclopediaVisitados = new Set();
let enciclopediaPausada = false;
let pausaInicioTimestamp = null;
let chatUsername = null;
let soundTipShown = false;
let skinsOwned = new Set();
let skinAtiva = null;
let coinsOwned = new Set();
let activeCoinId = 'btc';
let activeCoinSymbol = 'BTC';
let currentUser = null;
let blockchainHistory = [];
let coinBalances = {}; // saldo por moeda
let clear100Progress = { facil: false, medio: false, dificil: false }; // progresso 100 blocos por dificuldade
let satoshiUnlocked = false;

function saveSpecialProgress() {
    try {
        localStorage.setItem(nsKey('clear100_progress'), JSON.stringify(clear100Progress));
        localStorage.setItem(nsKey('satoshi_unlocked'), satoshiUnlocked ? '1' : '0');
    } catch { }
}

function saveSpecialProgress() {
    try {
        localStorage.setItem(nsKey('clear100_progress'), JSON.stringify(clear100Progress));
        localStorage.setItem(nsKey('satoshi_unlocked'), satoshiUnlocked ? '1' : '0');
    } catch { }
}

function getCurrentUserId() {
    return currentUser?.username || 'guest';
}
function nsKey(key) {
    return `jb:${getCurrentUserId()}:${key}`;
}
function clearCurrentUserSession(full = true) {
    currentUser = null;
    if (Auth && Auth.currentKey) {
        localStorage.removeItem(Auth.currentKey);
    }
    const walletBtn = document.getElementById('wallet-toggle');
    if (walletBtn) walletBtn.style.display = 'none';
    try { pararTimerGlobal(); } catch { }
    if (typeof timerInterval !== 'undefined' && timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    if (full) jogoConcluido = true;
    updateProfileUI();
    clear100Progress = { facil: false, medio: false, dificil: false };
    satoshiUnlocked = false;
}

// ============================================
// 2. CONFIGURAÇÕES E CONSTANTES
// ============================================
const ENC_BTC_REWARD = 0.00000100;
const ENC_SCORE_REWARD = 50;
function getActiveBalance() {
    return coinBalances[activeCoinId] || 0;
}
function syncActiveBalance() {
    bitcoinQuantity = getActiveBalance();
}

// ============================================
// METAS DE DESEMPENHO - VERSÃO REALISTA
// ============================================
const metasDisponiveis = [
    {
        id: 'velocidade_5',
        nome: '⚡ Minerador Relâmpago',
        descricao: 'Quebrar 5 blocos em menos de 2 minutos',
        icone: '⚡',
        blocos: 5,
        tempoMax: 120,
        recompensa: { pontos: 500, bitcoin: 0.00000200, titulo: 'Minerador Relâmpago' }
    },
    {
        id: 'velocidade_10',
        nome: '🌪️ Cripto Ninja',
        descricao: 'Quebrar 10 blocos em menos de 4 minutos',
        icone: '🥷',
        blocos: 10,
        tempoMax: 240,
        recompensa: { pontos: 1000, bitcoin: 0.00000500, titulo: 'Cripto Ninja' }
    },
    {
        id: 'velocidade_20',
        nome: '🔥 Mestre dos Blocos',
        descricao: 'Quebrar 20 blocos em menos de 8 minutos',
        icone: '🔥',
        blocos: 20,
        tempoMax: 480,
        recompensa: { pontos: 2500, bitcoin: 0.00001000, titulo: 'Mestre dos Blocos' }
    },
    {
        id: 'velocidade_50',
        nome: '💎 Lenda da Mineração',
        descricao: 'Quebrar 50 blocos em menos de 20 minutos',
        icone: '💎',
        blocos: 50,
        tempoMax: 1200,
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
        descricao: 'Completar o nível fácil em menos de 15 minutos',
        icone: '🏃',
        dificuldade: 'facil',
        tempoMax: 900,
        recompensa: { pontos: 3000, bitcoin: 0.00001500, titulo: 'Speedrunner' }
    },
    {
        id: 'speedrun_medio',
        nome: '🏃‍♂️ Speedrunner Médio',
        descricao: 'Completar o nível médio em menos de 20 minutos',
        icone: '🏃‍♂️',
        dificuldade: 'medio',
        tempoMax: 1200,
        recompensa: { pontos: 5000, bitcoin: 0.00002500, titulo: 'Speedrunner Pro' }
    },
    {
        id: 'speedrun_dificil',
        nome: '🏃‍♀️ Speedrunner Difícil',
        descricao: 'Completar o nível difícil em menos de 25 minutos',
        icone: '🏃‍♀️',
        dificuldade: 'dificil',
        tempoMax: 1500,
        recompensa: { pontos: 10000, bitcoin: 0.00005000, titulo: 'Speedrunner Lendário' }
    },
    {
        id: 'enciclopedia_completa',
        nome: '📚 Mente Enciclopédica',
        descricao: 'Visitar todas as entradas da enciclopédia cripto',
        icone: '📚',
        condicao: 'todasEntradas',
        recompensa: { pontos: 1200, bitcoin: 0.00001000, titulo: 'Curador Cripto' }
    }
];

// ============================================
// AUTENTICAÇÃO LOCAL (USUÁRIO/SENHA SIMPLES)
// ============================================
const Auth = {
    usersKey: 'jb_users',
    currentKey: 'jb_current_user',
    users: [],

    load() {
        try {
            this.users = JSON.parse(localStorage.getItem(this.usersKey) || '[]');
        } catch { this.users = []; }
        try {
            const saved = JSON.parse(localStorage.getItem(this.currentKey) || 'null');
            if (saved && saved.username) currentUser = saved;
        } catch { currentUser = null; }
    },

    saveUsers() {
        localStorage.setItem(this.usersKey, JSON.stringify(this.users));
    },

    setCurrent(user) {
        currentUser = user;
        localStorage.setItem(this.currentKey, JSON.stringify(user));
        updateProfileUI();
        chatUsername = null; // força ressincronizar com usuário logado
        location.reload();
    },

    register(username, password) {
        if (!username || !password) { alert('Informe usuário e senha.'); return; }
        if (this.users.some(u => u.username === username)) { alert('Usuário já existe.'); return; }
        this.users.push({ username, password });
        this.saveUsers();
        this.setCurrent({ username });
    },

    login(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        if (!user) { alert('Usuário ou senha inválidos.'); return; }
        this.setCurrent({ username });
    },

    logout() {
        currentUser = null;
        localStorage.removeItem(this.currentKey);
        updateProfileUI();
        chatUsername = null;
        location.reload();
    },

    useGuest() {
        this.setCurrent({ username: 'Convidado' });
    }
};

function updateProfileUI() {
    const profileCurrent = document.getElementById('profile-current');
    if (profileCurrent) {
        profileCurrent.textContent = currentUser?.username ? `Logado como: ${currentUser.username}` : 'Modo convidado';
    }
    const profileUser = document.getElementById('profile-username');
    const profilePass = document.getElementById('profile-password');
    if (profileUser) profileUser.value = '';
    if (profilePass) profilePass.value = '';
}

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

function iniciarTimerGlobal(resetStart = true) {
    if (timerGlobalInterval) {
        clearInterval(timerGlobalInterval);
        timerGlobalInterval = null;
    }
    if (resetStart || !tempoInicioPartida) {
        tempoInicioPartida = Date.now();
        tempoTotalPartida = 0;
    }

    startGlobalInterval();

    console.log('⏱️ Timer global iniciado em', new Date().toLocaleTimeString());
}

function startGlobalInterval() {
    timerGlobalInterval = setInterval(() => {
        if (!jogoConcluido) {
            tempoTotalPartida = Math.floor((Date.now() - tempoInicioPartida) / 1000);
            atualizarDisplayTempo();

            const tempoModern = document.getElementById('tempo-modern');
            if (tempoModern) {
                const mins = Math.floor(tempoTotalPartida / 60);
                const secs = tempoTotalPartida % 60;
                tempoModern.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
        }
    }, 1000);
}

function pararTimerGlobal() {
    if (timerGlobalInterval) {
        clearInterval(timerGlobalInterval);
        timerGlobalInterval = null;
        console.log('⏱️ Timer global parado em', tempoTotalPartida, 'segundos');
    }
}

function resetTimerGlobal() {
    pararTimerGlobal();
    tempoTotalPartida = 0;
    tempoInicioPartida = null;
    atualizarDisplayTempo();
}

function atualizarDisplayTempo() {
    const tempoDisplay = document.getElementById('tempo-global');
    if (!tempoDisplay) return;

    const minutos = Math.floor(tempoTotalPartida / 60);
    const segundos = tempoTotalPartida % 60;
    tempoDisplay.innerHTML = `⏱️ ${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

// ============================================
// 4. SISTEMA DE CONQUISTAS E METAS
// ============================================

function verificarMetasTempo() {
    console.log('⏱️ Verificando metas...', { brokenBlocks, tempoTotalPartida });

    metasDisponiveis.forEach(meta => {
        if (metasAlcancadas.includes(meta.id)) return;

        if (meta.blocos && !isNaN(meta.blocos)) {
            if (brokenBlocks >= meta.blocos && tempoTotalPartida <= meta.tempoMax) {
                console.log('🏆 Meta atingida:', meta.nome);
                alcançarMeta(meta);
            }
        }

        if (meta.dificuldade && meta.dificuldade === dificuldadeAtual) {
            if (brokenBlocks >= TamMax && tempoTotalPartida <= meta.tempoMax) {
                console.log('🏆 Meta speedrun atingida:', meta.nome);
                alcançarMeta(meta);
            }
        }

        if (meta.id === 'precisao_total' && brokenBlocks >= TamMax && vidas === 3) {
            console.log('🏆 Meta perfeição atingida:', meta.nome);
            alcançarMeta(meta);
        }
    });
}

// ============================================
// SISTEMA DE CONQUISTAS - VERSÃO CORRIGIDA
// ============================================

function alcançarMeta(meta) {
    if (metasAlcancadas.includes(meta.id)) return;

    metasAlcancadas.push(meta.id);
    console.log('🏆 META ALCANÇADA:', meta.nome);

    // Aplicar recompensas
    if (meta.recompensa.pontos) {
        score += meta.recompensa.pontos;
        updateScoreDisplay(score);
    }

    if (meta.recompensa.bitcoin) {
        bitcoinQuantity += meta.recompensa.bitcoin;
        updateBitcoinValue(false);
    }

    // Registrar conquista
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

    // Salvar no ranking
    const ultimoJogador = RankingSystem.getCurrentPlayerName() || localStorage.getItem(nsKey('jogobitcoin_lastname'));
    if (ultimoJogador && ultimoJogador !== 'Anônimo') {
        RankingSystem.adicionarConquista(ultimoJogador, conquista);
    }

    // ✅ MOSTrar CONQUISTA NA LATERAL (como mensagem de 5 segundos)
    mostrarConquistaNaLateral(meta);
}

// ============================================
// MOSTRAR CONQUISTA NA LATERAL (NOVA FUNÇÃO)
// ============================================
function mostrarConquistaNaLateral(meta) {
    // Formatar mensagem baseado no tipo de conquista
    let mensagem = '';
    let icone = meta.icone || '🏆';

    // Personalizar mensagem por tipo de conquista
    if (meta.id.includes('velocidade')) {
        const blocos = meta.blocos;
        const minutos = Math.floor(meta.tempoMax / 60);
        mensagem = `${icone} CONQUISTA: ${meta.nome} - ${blocos} blocos em menos de ${minutos} minutos! +${meta.recompensa.pontos} pts, +${meta.recompensa.bitcoin.toFixed(8)} BTC`;
    }
    else if (meta.id.includes('speedrun')) {
        const minutos = Math.floor(meta.tempoMax / 60);
        mensagem = `${icone} CONQUISTA: ${meta.nome} - Completou o nível em menos de ${minutos} minutos! +${meta.recompensa.pontos} pts, +${meta.recompensa.bitcoin.toFixed(8)} BTC`;
    }
    else if (meta.id === 'precisao_total') {
        mensagem = `${icone} CONQUISTA: ${meta.nome} - Completou o jogo sem perder vidas! +${meta.recompensa.pontos} pts, +${meta.recompensa.bitcoin.toFixed(8)} BTC`;
    }
    else {
        mensagem = `${icone} CONQUISTA: ${meta.nome} - ${meta.descricao} +${meta.recompensa.pontos} pts, +${meta.recompensa.bitcoin.toFixed(8)} BTC`;
    }

    // Mostrar na lateral (mesmo local das mensagens de incentivo)
    mostrarMensagemLateral(mensagem, 'conquista', 5000);

    // Também mostrar um popup temporário no centro (opcional, para dar mais destaque)
    mostrarPopupConquista(meta);

    // Tocar som de conquista
    if (SoundSystem && SoundSystem.win) SoundSystem.win();
}

// ============================================
// POPUP DE CONQUISTA (OPCIONAL - PARA DAR DESTAQUE)
// ============================================
function mostrarPopupConquista(meta) {
    // Criar popup temporário
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, gold, #ffaa00);
        color: black;
        padding: 25px 40px;
        border-radius: 60px;
        border: 4px solid white;
        box-shadow: 0 0 50px rgba(255,215,0,0.8);
        z-index: 50000;
        font-family: 'Exo 2', sans-serif;
        text-align: center;
        animation: conquistaPop 0.5s ease-out;
        pointer-events: none;
    `;

    popup.innerHTML = `
        <div style="font-size: 4em; margin-bottom: 10px;">${meta.icone || '🏆'}</div>
        <div style="font-size: 1.8em; font-weight: bold; margin-bottom: 5px;">CONQUISTA!</div>
        <div style="font-size: 1.3em; font-weight: bold; background: rgba(0,0,0,0.1); padding: 10px 20px; border-radius: 40px;">${meta.nome}</div>
        <div style="font-size: 1em; margin-top: 10px; color: #333;">${meta.descricao}</div>
        <div style="display: flex; gap: 20px; justify-content: center; margin-top: 15px;">
            <div style="background: rgba(0,0,0,0.2); padding: 5px 15px; border-radius: 20px;">+${meta.recompensa.pontos} pts</div>
            <div style="background: rgba(0,0,0,0.2); padding: 5px 15px; border-radius: 20px;">+${meta.recompensa.bitcoin.toFixed(8)} BTC</div>
        </div>
    `;

    document.body.appendChild(popup);

    // Remover após 3 segundos
    setTimeout(() => {
        popup.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => popup.remove(), 500);
    }, 3000);
}

// ============================================
// GARANTIR QUE AS METAS SÃO VERIFICADAS REGULARMENTE
// ============================================

// Adicionar verificação periódica durante o jogo
setInterval(() => {
    // Só verificar se o jogo está ativo
    if (!jogoConcluido && vidas > 0 && brokenBlocks > 0) {
        verificarMetasTempo();
    }
}, 5000);

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
        'Vitalik Buterin': { description: 'Criador do Ethereum.', link: 'https://pt.wikipedia.org/wiki/Vitalik_Buterin', category: 'Pessoa' },
        'Lightning Network': { description: 'Rede de pagamentos de segunda camada para Bitcoin.', link: 'https://pt.wikipedia.org/wiki/Lightning_Network', category: 'Escalabilidade' },
        'Taproot': { description: 'Atualização do Bitcoin que melhora privacidade e scripts.', link: 'https://en.wikipedia.org/wiki/Taproot', category: 'Protocolo' },
        'Layer 2': { description: 'Soluções de segunda camada para escalar blockchains.', link: 'https://en.wikipedia.org/wiki/Layer-2_scaling', category: 'Escalabilidade' },
        'Rollup': { description: 'Agrupa transações off-chain e publica na camada base.', link: 'https://en.wikipedia.org/wiki/Rollup_(blockchain)', category: 'Escalabilidade' },
        'Zero-Knowledge Proof': { description: 'Prova criptográfica sem revelar o segredo.', link: 'https://pt.wikipedia.org/wiki/Prova_de_conhecimento_zero', category: 'Criptografia' },
        'Merkle Tree': { description: 'Estrutura de dados para verificar integridade em blocos.', link: 'https://pt.wikipedia.org/wiki/%C3%81rvore_de_Merkle', category: 'Estrutura de Dados' },
        'Cold Wallet': { description: 'Carteira offline para maior segurança.', link: 'https://pt.wikipedia.org/wiki/Carteira_de_criptomoeda', category: 'Seguranca' },
        'Hot Wallet': { description: 'Carteira conectada à internet, prática porém mais exposta.', link: 'https://pt.wikipedia.org/wiki/Carteira_de_criptomoeda', category: 'Seguranca' },
        'Seed Phrase': { description: 'Frase mnemônica usada para recuperar a carteira.', link: 'https://en.wikipedia.org/wiki/Seed_phrase', category: 'Seguranca' },
        'Rug Pull': { description: 'Golpe onde o criador some com a liquidez do projeto.', link: 'https://en.wikipedia.org/wiki/Rug_pull', category: 'Risco' },
        'Airdrop': { description: 'Distribuição gratuita de tokens para usuários.', link: 'https://en.wikipedia.org/wiki/Airdrop_(cryptocurrency)', category: 'Marketing' },
        'Gas Fee': { description: 'Taxa paga para executar transações em rede.', link: 'https://en.wikipedia.org/wiki/Gas_(Ethereum)', category: 'Economia' },
        'MEV': { description: 'Valor extra capturado por validadores ao ordenar transações.', link: 'https://en.wikipedia.org/wiki/Maximal_extractable_value', category: 'Economia' },
        'DApp': { description: 'Aplicativo descentralizado executado em blockchain.', link: 'https://en.wikipedia.org/wiki/Decentralized_application', category: 'Aplicacao' },
        'Metamask': { description: 'Carteira e gateway Web3 popular para Ethereum.', link: 'https://en.wikipedia.org/wiki/MetaMask', category: 'Ferramenta' },
        'Ledger': { description: 'Carteira hardware para custódia segura.', link: 'https://en.wikipedia.org/wiki/Ledger_(cryptocurrency_hardware_wallet)', category: 'Hardware' },
        'DePIN': { description: 'Redes físicas descentralizadas que tokenizam infraestrutura.', link: 'https://en.wikipedia.org/wiki/Decentralized_physical_infrastructure_network', category: 'Ecossistema' },
        'RWA': { description: 'Tokenização de ativos do mundo real.', link: 'https://en.wikipedia.org/wiki/Real-world_asset_tokenization', category: 'Ecossistema' },
        'Oracle': { description: 'Serviço que leva dados externos para contratos inteligentes.', link: 'https://en.wikipedia.org/wiki/Oracle_(blockchain)', category: 'Infraestrutura' },
        'Stablecoin Algorítmica': { description: 'Stablecoin que mantém paridade via algoritmos.', link: 'https://en.wikipedia.org/wiki/Algorithmic_stablecoin', category: 'Criptomoeda' }
    },

    init: function () {
        this.createEncyclopedia();
        this.populateSelector();
        this.createSearchBar();
        this.syncWithGameList();
    },

    // Garante que toda palavra do jogo esteja na enciclopédia
    syncWithGameList: function () {
        if (!this.entries || !Array.isArray(cryptoNomes)) return;

        const seen = new Set(Object.keys(this.entries));
        cryptoNomes.forEach(raw => {
            if (!raw) return;
            const keyExact = raw;
            const keyLower = raw.toLowerCase();

            // Verifica entradas case-insensitive
            const existing = Object.keys(this.entries).find(k => k.toLowerCase() === keyLower);
            if (existing) return;

            const info = getQuickInfo(raw) || {};
            const desc = info.desc || `Termo do jogo: ${raw}.`;
            const category = info.category || 'Jogo';

            this.entries[keyExact] = {
                description: desc,
                link: info.link || '',
                category
            };
            seen.add(keyExact);
        });

        // Atualiza contador se o popup já estiver renderizado
        const counter = document.getElementById('entry-count');
        if (counter) counter.textContent = `${Object.keys(this.entries).length} conceitos`;

        // Repopula lista se estiver aberta
        this.populateSelector();
    },

    createEncyclopedia: function () {
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

    createToggleButton: function () {
        const button = document.createElement('button');
        button.id = 'encyclopedia-toggle';
        button.innerHTML = '📚';
        button.title = 'Enciclopédia Cripto';
        button.style.cssText = `position:fixed; left:20px; bottom:20px; width:60px; height:60px; border-radius:50%; background:linear-gradient(135deg,#2196f3,#1976d2); color:white; border:2px solid #64b5f6; font-size:1.8em; cursor:pointer; z-index:9999; box-shadow:0 6px 20px rgba(33,150,243,0.5); transition:all 0.3s ease; display:flex; align-items:center; justify-content:center;`;

        button.onclick = () => {
            const enc = document.getElementById('crypto-encyclopedia');
            const allVisitados = enciclopediaVisitados.size >= Object.keys(CryptoEncyclopedia.entries || {}).length;

            if (enc.style.display === 'flex') {
                enc.style.display = 'none';
                button.style.transform = 'scale(1)';
                if (enciclopediaPausada) retomarTimersPorEnciclopedia();
            } else {
                enc.style.display = 'flex';
                button.style.transform = 'scale(1.1)';
                if (!allVisitados) pausarTimersPorEnciclopedia();
                if (SoundSystem) SoundSystem.click();
            }
        };
        document.body.appendChild(button);
    },

    createSearchBar: function () {
        const searchInput = document.getElementById('crypto-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterEntries(e.target.value.toLowerCase()));
        }
    },

    populateSelector: function () {
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

    filterEntries: function (term) {
        document.querySelectorAll('#crypto-list div').forEach(item => {
            if (item.textContent.toLowerCase().includes(term)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    },

    showEntry: function (key) {
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

        // Recompensa por entrada inédita
        if (!enciclopediaVisitados.has(key) && enciclopediaVisitados.size < Object.keys(this.entries || {}).length) {
            enciclopediaVisitados.add(key);
            
            // ✅ CORREÇÃO: Atualizar o saldo real na moeda ativa e a variável global
            if (typeof coinBalances !== 'undefined') {
                coinBalances[activeCoinId] = (coinBalances[activeCoinId] || 0) + ENC_BTC_REWARD;
            }
            bitcoinQuantity = getActiveBalance(); // Garante que bitcoinQuantity reflita o novo saldo
            
            score += ENC_SCORE_REWARD;
            updateBitcoinValue(false); // Atualiza os displays na tela
            updateScoreDisplay(score);

            // Conquista: todas as entradas visitadas
            const totalEntries = Object.keys(this.entries || {}).length;
            if (enciclopediaVisitados.size === totalEntries) {
                const meta = metasDisponiveis.find(m => m.id === 'enciclopedia_completa');
                if (meta) {
                    alcançarMeta(meta);
                    if (SoundSystem) SoundSystem.play('conquest');
                }
            }
        }
    }
};

// ============================================
// COLECIONÁVEIS: MOEDAS
// ============================================
const coinIcons = {
    BTC: '₿',
    ETH: 'Ξ',
    LTC: 'Ł',
    ADA: '₳',
    DOT: '⦿',
    SOL: '◎',
    STH: '🛡️'
};
function coinIcon(symbol) {
    return coinIcons[symbol] || '🪙';
}

const cryptoLogos = {
    BTC: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg',
    ETH: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/eth.svg',
    LTC: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/ltc.svg',
    ADA: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/ada.svg',
    DOT: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/dot.svg',
    SOL: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/sol.svg',
    STH: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg'
};

function getCryptoLogoUrl(symbol) {
    return cryptoLogos[symbol] || cryptoLogos['BTC'];
}

const CoinStore = {
    coins: [
        { id: 'btc', nome: 'Bitcoin', symbol: 'BTC', precoBtc: 0.03000000, desc: 'A primeira e mais valiosa.', info: 'Bitcoin é a primeira moeda digital descentralizada criada em 2009 por Satoshi Nakamoto.' },
        { id: 'eth', nome: 'Ethereum', symbol: 'ETH', precoBtc: 0.01800000, desc: 'Plataforma de contratos.', info: 'Ethereum suporta smart contracts e dApps, criado por Vitalik Buterin.' },
        { id: 'ltc', nome: 'Litecoin', symbol: 'LTC', precoBtc: 0.01000000, desc: 'Prata digital.', info: 'Litecoin é um fork do Bitcoin com confirmações mais rápidas.' },
        { id: 'ada', nome: 'Cardano', symbol: 'ADA', precoBtc: 0.00900000, desc: 'Pesquisa acadêmica.', info: 'Cardano usa prova de participação e tem foco em revisão acadêmica.' },
        { id: 'dot', nome: 'Polkadot', symbol: 'DOT', precoBtc: 0.01100000, desc: 'Multichain.', info: 'Polkadot conecta blockchains distintas por parachains.' },
        { id: 'sol', nome: 'Solana', symbol: 'SOL', precoBtc: 0.01400000, desc: 'Alta performance.', info: 'Solana prioriza throughput alto com prova de histórico.' }
    ],

    load() {
        try {
            const o = JSON.parse(localStorage.getItem(nsKey('coins_owned')) || '[]');
            coinsOwned = new Set(o);
        } catch { coinsOwned = new Set(); }
        // Garantir BTC sempre disponível
        coinsOwned.add('btc');
        try {
            const bal = JSON.parse(localStorage.getItem(nsKey('coin_balances')) || '{}');
            coinBalances = bal && typeof bal === 'object' ? bal : {};
        } catch { coinBalances = {}; }
        this.coins.forEach(c => { if (coinBalances[c.id] == null) coinBalances[c.id] = 0; });
        // desbloqueio especial
        try {
            satoshiUnlocked = localStorage.getItem(nsKey('satoshi_unlocked')) === '1';
            clear100Progress = JSON.parse(localStorage.getItem(nsKey('clear100_progress')) || '{}') || {};
        } catch { satoshiUnlocked = false; clear100Progress = { facil: false, medio: false, dificil: false }; }
        if (satoshiUnlocked) {
            coinsOwned.add('satoshi');
        }
        // Carregar moeda ativa
        try {
            const savedActive = localStorage.getItem(nsKey('active_coin'));
            if (savedActive && this.coins.some(c => c.id === savedActive)) {
                activeCoinId = savedActive;
            }
        } catch { }
        this.syncActiveSymbol();
        syncActiveBalance();
    },

    save() {
        localStorage.setItem(nsKey('coins_owned'), JSON.stringify(Array.from(coinsOwned)));
        localStorage.setItem(nsKey('coin_balances'), JSON.stringify(coinBalances));
        saveSpecialProgress();
    },

    syncActiveSymbol() {
        const c = this.coins.find(x => x.id === activeCoinId) || this.coins[0];
        activeCoinSymbol = c ? c.symbol : 'BTC';
        localStorage.setItem(nsKey('active_coin'), activeCoinId);
        syncActiveBalance();
        updateBitcoinValue(false);
        if (typeof Wallet !== 'undefined' && Wallet.render) Wallet.render();
    },

    render() {
        const list = document.getElementById('coins-list');
        if (!list) return;
        list.innerHTML = '';
        this.coins.forEach(c => {
            const owned = coinsOwned.has(c.id);
            const active = activeCoinId === c.id;
            const lockedSatoshi = (c.id === 'satoshi' && !satoshiUnlocked);
            if (c.id === 'satoshi' && !lockedSatoshi) {
                // Não exibir na lista de compra; será mostrada via conquistas
                return;
            }
            const card = document.createElement('div');
            card.className = 'skin-card';
            card.innerHTML = `
                <div class="skin-preview" style="background:#1b2735; display:flex; align-items:center; justify-content:center; font-size:1.4em;">💰</div>
                <div class="skin-info">
                    <h4>${c.nome} ${owned ? '✅' : ''}</h4>
                    <div style="font-size:0.9em; opacity:0.9;">${c.desc}</div>
                    <div style="margin-top:6px; color:#ffd180;">Preço: ${c.precoBtc.toFixed(8)} BTC</div>
                </div>
                <div class="skin-actions" style="gap:6px;">
                    <button class="coin-info" data-info="${c.id}">ℹ️</button>
                    ${lockedSatoshi ? `<button class="skin-apply" disabled>Conquista necessária</button>` :
                    owned ? (active ? `<button disabled class="skin-apply">Ativa</button>` : `<button class="skin-apply" data-activate="${c.id}">Usar</button>`) :
                        `<button class="skin-buy" data-coin="${c.id}">Comprar</button>`
                }
                </div>
            `;
            list.appendChild(card);
        });

        list.querySelectorAll('[data-coin]').forEach(btn => {
            btn.onclick = () => this.buy(btn.getAttribute('data-coin'));
        });
        list.querySelectorAll('[data-info]').forEach(btn => {
            btn.onclick = () => this.showInfo(btn.getAttribute('data-info'));
        });
        list.querySelectorAll('[data-activate]').forEach(btn => {
            btn.onclick = () => this.setActive(btn.getAttribute('data-activate'));
        });
    },

    showInfo(id) {
        const coin = this.coins.find(c => c.id === id);
        if (!coin) return;
        alert(`${coin.nome}\n\n${coin.info}`);
    },

    setActive(id) {
        if (!coinsOwned.has(id)) { alert('Compre a moeda para ativá-la como mineração.'); return; }
        activeCoinId = id;
        this.syncActiveSymbol();
        this.render();
        mostrarMensagemLateral(`🚀 Mineração agora em ${activeCoinSymbol}.`, 'bonus', 2200);
    },

    checkCoinsAchievement() {
        if (!RankingSystem || !RankingSystem.getCurrentPlayerName) return;
        if (coinsOwned.size !== this.coins.length) return;
        const nome = RankingSystem.getCurrentPlayerName();
        const conquista = {
            id: 'coins_master',
            titulo: 'Colecionador de Moedas',
            icone: '🪙',
            descricao: 'Comprou todas as moedas colecionáveis'
        };
        const added = RankingSystem.adicionarConquista(nome, conquista);
        if (added) {
            mostrarMensagemLateral('🪙 Colecionador de Moedas: comprou todas!', 'bonus', 3500);
        }
    },

    buy(id) {
        const coin = this.coins.find(c => c.id === id);
        if (!coin) return;
        if (coinsOwned.has(id)) return;
        if (getActiveBalance() < coin.precoBtc) {
            alert(`${activeCoinSymbol} insuficiente para comprar esta moeda.`);
            return;
        }
        coinBalances[activeCoinId] = (coinBalances[activeCoinId] || 0) - coin.precoBtc;
        syncActiveBalance();
        updateBitcoinValue(false);
        coinsOwned.add(id);
        this.save();
        this.render();
        if (SoundSystem) SoundSystem.play('conquest');
        mostrarMensagemLateral(`🪙 Moeda comprada: ${coin.nome}`, 'bonus', 2500);
        this.checkCoinsAchievement();
    }
};

// ============================================
// CARTEIRA BTC COM RENDIMENTO
// ============================================
const Wallet = {
    storageKey: 'wallet',
    hourlyRate: 0.01, // 1% por hora (ajustado para sessões < 1h)
    data: { balances: {}, lastAccrual: Date.now() },

    load() {
        try {
            const saved = JSON.parse(localStorage.getItem(nsKey(this.storageKey)) || '{}');
            const bal = saved.balances && typeof saved.balances === 'object' ? saved.balances : {};
            this.data = {
                balances: bal,
                lastAccrual: saved.lastAccrual || Date.now()
            };
            this.accrue(); // aplica rendimento pendente
        } catch {
            this.data = { balances: {}, lastAccrual: Date.now() };
        }
        // garantir todas as moedas
        CoinStore.coins.forEach(c => {
            if (this.data.balances[c.id] == null) this.data.balances[c.id] = 0;
        });
        if (satoshiUnlocked) {
            coinsOwned.add('satoshi');
            if (coinBalances['satoshi'] == null) coinBalances['satoshi'] = 0;
        }
    },

    save() {
        localStorage.setItem(nsKey(this.storageKey), JSON.stringify(this.data));
    },

    accrue() {
        const now = Date.now();
        const elapsedMs = now - (this.data.lastAccrual || now);
        if (elapsedMs <= 0) return 0;
        const elapsedHours = elapsedMs / (1000 * 60 * 60);
        Object.keys(this.data.balances).forEach(k => {
            const interest = this.data.balances[k] * this.hourlyRate * elapsedHours;
            if (interest > 0) this.data.balances[k] += interest;
        });
        this.data.lastAccrual = now;
        this.save();
        return true;
    },

    deposit(amount) {
        const v = Number(amount);
        if (!v || v <= 0) { alert('Informe um valor válido.'); return; }
        const saldo = getActiveBalance();
        if (saldo < v) { alert(`${activeCoinSymbol} insuficiente para depositar.`); return; }
        this.accrue();
        coinBalances[activeCoinId] = saldo - v;
        this.data.balances[activeCoinId] = (this.data.balances[activeCoinId] || 0) + v;
        syncActiveBalance();
        updateBitcoinValue(false);
        this.save();
        this.render();
        mostrarMensagemLateral(`💼 Depositou ${v.toFixed(8)} ${activeCoinSymbol} na carteira.`, 'bonus', 2500);
    },

    withdraw(amount) {
        const v = Number(amount);
        if (!v || v <= 0) { alert('Informe um valor válido.'); return; }
        this.accrue();
        if ((this.data.balances[activeCoinId] || 0) < v) { alert('Saldo insuficiente na carteira.'); return; }
        this.data.balances[activeCoinId] -= v;
        coinBalances[activeCoinId] = getActiveBalance() + v;
        syncActiveBalance();
        updateBitcoinValue(false);
        this.save();
        this.render();
        mostrarMensagemLateral(`💰 Sacou ${v.toFixed(8)} ${activeCoinSymbol} da carteira.`, 'bonus', 2500);
        checkCoinsMasterAchievement();
    },

    open() {
        this.accrue();
        this.render();
        const modal = document.getElementById('wallet-modal');
        if (modal) modal.style.display = 'flex';
    },

    close() {
        const modal = document.getElementById('wallet-modal');
        if (modal) modal.style.display = 'none';
    },

    render() {
        const bal = document.getElementById('wallet-balance');
        const rate = document.getElementById('wallet-rate');
        if (bal) {
            bal.innerHTML = '';
            Object.entries(this.data.balances).forEach(([id, val]) => {
                const div = document.createElement('div');
                const coin = CoinStore.coins.find(c => c.id === id);
                const sym = coin ? coin.symbol : id.toUpperCase();
                const livre = coinBalances[id] || 0;
                div.textContent = `${coinIcon(sym)} ${sym}: carteira ${Number(val || 0).toFixed(8)} | livre ${livre.toFixed(8)}${id === activeCoinId ? ' ← ativa' : ''}`;
                bal.appendChild(div);
            });
        }
        if (rate) rate.textContent = `${(this.hourlyRate * 100).toFixed(2)}% por hora`;
    }
};

// ============================================
// LISTA VISUAL DE CONQUISTAS
// ============================================
const achievementCatalog = () => {
    const base = metasDisponiveis.map(meta => ({
        id: meta.id,
        titulo: meta.nome,
        icone: meta.icone || '🏆',
        requisito: meta.descricao || 'Complete o desafio especificado.'
    }));
    base.push(
        { id: 'skins_master', titulo: 'Colecionador de Skins', icone: '🎨', requisito: 'Compre todas as skins disponíveis.' },
        { id: 'coins_master', titulo: 'Colecionador de Moedas', icone: '🪙', requisito: 'Compre todas as moedas colecionáveis.' },
        { id: 'all_coins_1000', titulo: 'Maestro das Criptos', icone: '🌐', requisito: 'Alcance pelo menos 0.05 unidades em cada moeda.' },
        { id: 'satoshi_medal', titulo: 'Medalha Satoshi', icone: '🪙', requisito: 'Quebre 100 blocos em cada dificuldade (Fácil, Médio, Difícil).' }
    );
    return base;
};

const AchievementsUI = {
    open() {
        this.render();
        const modal = document.getElementById('achievements-modal');
        if (modal) modal.style.display = 'flex';
    },
    close() {
        const modal = document.getElementById('achievements-modal');
        if (modal) modal.style.display = 'none';
    },
    render() {
        const list = document.getElementById('achievements-list');
        if (!list) return;
        const jogador = RankingSystem.getCurrentPlayerName();
        const conquistas = RankingSystem.getConquistasDoJogador(jogador);
        const idsConquistados = new Set(conquistas.map(c => c.id));
        list.innerHTML = '';
        achievementCatalog().forEach(item => {
            const ok = idsConquistados.has(item.id);
            const card = document.createElement('div');
            card.className = 'achievement-card' + (ok ? '' : ' disabled');
            card.innerHTML = `
                <div class="achievement-icon">${item.icone}</div>
                <div class="achievement-info">
                    <strong>${item.titulo}</strong>
                    <small>${item.requisito}</small>
                </div>
            `;
            list.appendChild(card);
        });
    }
};

function checkCoinsMasterAchievement() {
    if (!CoinStore || !CoinStore.coins) return;
    const totalOk = CoinStore.coins.every(c => {
        if (c.id === 'satoshi') return true; // não conta na meta de 0.05
        const livre = coinBalances[c.id] || 0;
        const carteira = (Wallet.data?.balances || {})[c.id] || 0;
        return (livre + carteira) >= 0.05;
    });
    if (!totalOk) return;
    const nome = RankingSystem.getCurrentPlayerName();
    const conquista = { id: 'all_coins_1000', titulo: 'Maestro das Criptos', icone: '🌐', descricao: 'Alcance 0.05 de cada moeda.' };
    if (RankingSystem.adicionarConquista(nome, conquista)) {
        mostrarMensagemLateral('🌐 Conquista: Maestro das Criptos (0.05 de cada moeda)', 'bonus', 4000);
    }
}

function checkSatoshiUnlock() {
    if (satoshiUnlocked) return;
    if (clear100Progress.facil && clear100Progress.medio && clear100Progress.dificil) {
        satoshiUnlocked = true;
        const nome = RankingSystem.getCurrentPlayerName();
        const conquista = { id: 'satoshi_medal', titulo: 'Medalha Satoshi', icone: '🪙', descricao: 'Quebre 100 blocos em cada dificuldade.' };
        RankingSystem.adicionarConquista(nome, conquista);
        mostrarMensagemLateral('🪙 Medalha Satoshi desbloqueada! (100 blocos em cada nível)', 'bonus', 4500);
        console.log('Medalha Satoshi desbloqueada');
        saveSpecialProgress();
    }
}

// Log helper para debug da medalha
window.logMedalha = function () {
    console.log('Medalha Satoshi debug', {
        satoshiUnlocked,
        clear100Progress,
        coinBalances: coinBalances['satoshi'],
        wallet: Wallet?.data?.balances?.satoshi
    });
};


// ============================================
// 6. WIDGET DE PREÇO DO BITCOIN
// ============================================
const BitcoinPriceWidget = {
    currentIndex: 0,
    intervalId: null,

    getCoins: function () {
        if (typeof CoinStore !== 'undefined' && CoinStore.coins) {
            return CoinStore.coins;
        }
        return [{ nome: 'Bitcoin', symbol: 'BTC' }];
    },

    getIcon: function (symbol) {
        if (typeof coinIcon === 'function') {
            return coinIcon(symbol);
        }
        return '₿';
    },

    getColor: function (symbol) {
        const colors = { BTC: '#f7931a', ETH: '#627eea', LTC: '#bfbbbb', ADA: '#0033ad', DOT: '#e6007a', SOL: '#14f195' };
        return colors[symbol] || '#f7931a';
    },

    init: function () {
        this.createWidget();
        this.fetchPrice();
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = setInterval(() => this.fetchPrice(), 300000);
    },

    createWidget: function () {
        const widget = document.createElement('div');
        widget.id = 'bitcoin-price-widget';
        widget.style.cssText = `position:fixed; bottom:20px; right:20px; background:linear-gradient(135deg, rgba(20,20,40,0.95), rgba(30,30,50,0.95)); color:white; padding:15px 25px; border-radius:15px; border:2px solid #f7931a; box-shadow:0 8px 25px rgba(247,147,26,0.4); z-index:9999; font-family:'Courier New', monospace; font-weight:bold; min-width:260px; backdrop-filter:blur(10px); display:none; user-select:none; transition: all 0.3s ease;`;

        widget.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <button id="widget-prev-btn" style="background:transparent; border:none; color:inherit; font-size:1.5em; cursor:pointer; padding:0 5px; opacity: 0.7; transition: opacity 0.2s;">◀</button>
                <div style="display:flex; align-items:center; gap:10px;">
                    <div id="widget-coin-icon" style="font-size:1.5em; color:#f7931a; text-shadow: 0 0 10px currentColor;">₿</div>
                    <div style="text-align:center;">
                        <div id="widget-coin-name" style="font-size:1.2em; text-transform:uppercase;">BITCOIN</div>
                        <div style="font-size:0.7em; color:#aaa;">Preço em tempo real</div>
                    </div>
                </div>
                <button id="widget-next-btn" style="background:transparent; border:none; color:inherit; font-size:1.5em; cursor:pointer; padding:0 5px; opacity: 0.7; transition: opacity 0.2s;">▶</button>
            </div>
            <div id="btc-price-display" style="text-align:center; font-size:1.5em; margin-top:5px;">Carregando...</div>
            <div id="btc-change-display" style="text-align:center; font-size:0.9em; margin-top:5px;">Atualizado: --</div>
        `;
        document.body.appendChild(widget);

        const prevRow = document.getElementById('widget-prev-btn');
        const nextRow = document.getElementById('widget-next-btn');
        prevRow.onmouseover = () => prevRow.style.opacity = '1';
        prevRow.onmouseout = () => prevRow.style.opacity = '0.7';
        nextRow.onmouseover = () => nextRow.style.opacity = '1';
        nextRow.onmouseout = () => nextRow.style.opacity = '0.7';

        prevRow.onclick = (e) => { e.stopPropagation(); this.changeCoin(-1); };
        nextRow.onclick = (e) => { e.stopPropagation(); this.changeCoin(1); };

        this.createToggleButton();
        this.updateColors();
    },

    changeCoin: function (dir) {
        const coins = this.getCoins();
        this.currentIndex += dir;
        if (this.currentIndex < 0) this.currentIndex = coins.length - 1;
        if (this.currentIndex >= coins.length) this.currentIndex = 0;

        const coin = coins[this.currentIndex];

        document.getElementById('widget-coin-icon').textContent = this.getIcon(coin.symbol);
        document.getElementById('widget-coin-name').textContent = coin.nome;
        document.getElementById('btc-price-display').innerHTML = 'Carregando...';
        document.getElementById('btc-change-display').innerHTML = 'Atualizado: --';

        this.updateColors();

        if (typeof SoundSystem !== 'undefined' && SoundSystem.click) SoundSystem.click();

        this.fetchPrice();
    },

    updateColors: function () {
        const coins = this.getCoins();
        const coin = coins[this.currentIndex];
        const color = this.getColor(coin.symbol);

        const iconEl = document.getElementById('widget-coin-icon');
        const modal = document.getElementById('bitcoin-price-widget');
        const btn = document.getElementById('btc-widget-toggle');

        if (iconEl) iconEl.style.color = color;
        if (modal) {
            modal.style.border = `2px solid ${color}`;
            modal.style.boxShadow = `0 8px 25px ${color}66`;
        }
        if (btn) {
            btn.innerHTML = this.getIcon(coin.symbol);
            btn.style.background = `linear-gradient(135deg, ${color}, ${color}dd)`;
            btn.style.border = `2px solid ${color}`;
            btn.style.boxShadow = `0 4px 15px ${color}66`;
        }
    },

    createToggleButton: function () {
        const btn = document.createElement('button');
        btn.id = 'btc-widget-toggle';
        btn.title = 'Mostrar/Ocultar preço';
        btn.style.cssText = `position:fixed; bottom:20px; right:20px; width:50px; height:50px; border-radius:50%; background:#f7931a; color:white; border:2px solid #f7931a; font-size:1.5em; font-weight:bold; cursor:pointer; z-index:10000; box-shadow:0 4px 15px rgba(247,147,26,0.4); transition:all 0.3s ease; display:flex; justify-content:center; align-items:center;`;
        btn.onclick = () => {
            const w = document.getElementById('bitcoin-price-widget');
            if (w.style.display === 'block') {
                w.style.display = 'none';
                btn.style.transform = 'scale(1)';
            } else {
                w.style.display = 'block';
                btn.style.transform = 'scale(1.1)';
                if (typeof SoundSystem !== 'undefined' && SoundSystem.click) SoundSystem.click();
            }
        };
        document.body.appendChild(btn);
    },

    fetchPrice: async function () {
        const coins = this.getCoins();
        const coin = coins[this.currentIndex];
        const cgId = coin.nome.toLowerCase();

        try {
            const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=brl%2Cusd&include_24hr_change=true`);
            const d = await r.json();
            if (d[cgId]) {
                this.updateDisplay(d[cgId]);
            } else {
                this.updateDisplay({ brl: 0, usd: 0, brl_24h_change: 0, usd_24h_change: 0 });
            }
        } catch (error) {
            this.updateDisplay({ brl: 0, usd: 0, brl_24h_change: 0, usd_24h_change: 0 });
        }
    },

    updateDisplay: function (data) {
        const price = document.getElementById('btc-price-display');
        const change = document.getElementById('btc-change-display');
        if (!price || !change) return;
        const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.brl);
        const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.usd);
        const chg = data.brl_24h_change || data.usd_24h_change || 0;
        price.innerHTML = `<div>${brl}</div><div style="font-size:0.7em; margin-top: 3px;">${usd}</div>`;
        change.innerHTML = `<span style="color:${chg >= 0 ? '#4CAF50' : '#f44336'}">${chg >= 0 ? '📈' : '📉'} ${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%</span>`;
    }
};

// ============================================
// 7. SISTEMA DE RANKING
// ============================================
const RankingSystem = {
    getCurrentPlayerName: function () {
        if (currentUser?.username) return currentUser.username;
        try {
            const n = localStorage.getItem(nsKey('jb_last_player_name'));
            if (n && n.trim().length > 0) return n;
        } catch { }
        if (chatUsername) return chatUsername;
        return 'Jogador';
    },
    maxEntries: 10,
    storageKey: 'jogobitcoin_ranking',
    conquistasKey: 'jogobitcoin_conquistas',
    ranking: [],
    conquistasPorJogador: {},

    init: function () {
        this.loadRanking();
        this.loadConquistas();
        this.createRankingButton();
    },

    loadRanking: function () {
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

    loadConquistas: function () {
        try {
            const saved = localStorage.getItem(this.conquistasKey);
            this.conquistasPorJogador = saved ? JSON.parse(saved) : {};
        } catch (error) {
            this.conquistasPorJogador = {};
        }
    },

    saveRanking: function () {
        try {
            this.ranking.sort((a, b) => b.score - a.score);
            localStorage.setItem(this.storageKey, JSON.stringify(this.ranking));
        } catch (error) { }
    },

    saveConquistas: function () {
        try {
            localStorage.setItem(this.conquistasKey, JSON.stringify(this.conquistasPorJogador));
        } catch (error) { }
    },

    addScore: function (playerName, score, bitcoin, blocks, difficulty, time) {
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
        try {
            localStorage.setItem(nsKey('jb_last_player_name'), newEntry.name);
        } catch { }
        this.ranking.sort((a, b) => b.score - a.score);
        if (this.ranking.length > this.maxEntries) {
            this.ranking = this.ranking.slice(0, this.maxEntries);
        }
        this.saveRanking();
        return newEntry;
    },

    getConquistasDoJogador: function (jogador) {
        if (!jogador || jogador === 'Anônimo') return [];
        return this.conquistasPorJogador[jogador] || [];
    },

    adicionarConquista: function (jogador, conquista) {
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
                const modal = document.getElementById('achievements-modal');
                if (modal && modal.style.display === 'flex' && typeof AchievementsUI !== 'undefined') {
                    AchievementsUI.render();
                }
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    },

    verConquistasDe: function (jogador) {
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

    buscarJogador: function () {
        const nome = document.getElementById('busca-jogador-ranking')?.value;
        if (nome && nome.trim()) {
            this.verConquistasDe(nome.trim());
        } else {
            alert('Digite um nome para buscar');
        }
    },

    showRanking: function () {
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
                const medal = i < 3 ? ['🥇', '🥈', '🥉'][i] : `${i + 1}º`;
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

    createRankingButton: function () {
        if (document.getElementById('ranking-button')) return;

        const btn = document.createElement('button');
        btn.id = 'ranking-button';
        btn.innerHTML = '🏆 Ranking';
        btn.style.cssText = `
            position: fixed;
            top: 12px;
            left: 20px;
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

    saveGameScore: function (isVictory) {
        let nomeFinal = RankingSystem.getCurrentPlayerName();
        if (!currentUser || currentUser.username === 'Convidado') {
            const entrada = prompt(`🎮 ${isVictory ? 'PARABÉNS!' : 'GAME OVER'}\n\nDigite seu nome (ou deixe Convidado):`, localStorage.getItem(nsKey('jogobitcoin_lastname')) || 'Convidado');
            if (entrada !== null && entrada.trim()) nomeFinal = entrada.trim();
        }
        localStorage.setItem(nsKey('jogobitcoin_lastname'), nomeFinal);

        if (selosConquistados.length > 0 && nomeFinal) {
            selosConquistados.forEach(conquista => {
                const conquistaFormatada = {
                    id: conquista.id,
                    titulo: conquista.titulo,
                    icone: conquista.icone,
                    descricao: ''
                };
                this.adicionarConquista(nomeFinal, conquistaFormatada);
            });
        }

        this.addScore(
            nomeFinal || 'Anônimo',
            score,
            bitcoinQuantity,
            brokenBlocks,
            dificuldadeAtual,
            tempoTotalPartida
        );

        setTimeout(() => this.showRanking(), 1000);

        setTimeout(() => {
            try {
                abrirAvaliacao(() => abrirCompartilharFinal(nomeFinal || 'Jogador'));
            } catch (e) {
                console.warn('Avaliação/compartilhar não pôde ser aberta:', e);
            }
        }, 800);
    },

    debug: function () {
        console.log('🔍 Ranking:', this.ranking);
        console.log('🔍 Conquistas:', this.conquistasPorJogador);
    }
};

// Migração de rankings/conquistas antigos (por usuário) para o global
function migrateLegacyData() {
    const FLAG = 'jb_migrated_rank_v1';
    if (localStorage.getItem(FLAG)) return;

    // Carregar ranking global existente
    let globalRanking = [];
    try {
        const saved = localStorage.getItem(RankingSystem.storageKey);
        globalRanking = saved ? JSON.parse(saved) : [];
    } catch { globalRanking = []; }

    // Carregar conquistas globais existentes
    let globalConquistas = {};
    try {
        const savedC = localStorage.getItem(RankingSystem.conquistasKey);
        globalConquistas = savedC ? JSON.parse(savedC) : {};
    } catch { globalConquistas = {}; }

    // Percorrer chaves antigas com namespace jb:<user>:...
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (key.endsWith(':jogobitcoin_ranking')) {
            try {
                const arr = JSON.parse(localStorage.getItem(key) || '[]');
                if (Array.isArray(arr)) {
                    globalRanking = globalRanking.concat(arr);
                }
            } catch { }
        }
        if (key.endsWith(':jogobitcoin_conquistas')) {
            try {
                const map = JSON.parse(localStorage.getItem(key) || '{}');
                if (map && typeof map === 'object') {
                    Object.entries(map).forEach(([jogador, conquistas]) => {
                        if (!globalConquistas[jogador]) globalConquistas[jogador] = [];
                        const existentes = new Set((globalConquistas[jogador] || []).map(c => c.id));
                        (conquistas || []).forEach(c => {
                            if (c && c.id && !existentes.has(c.id)) {
                                globalConquistas[jogador].push(c);
                            }
                        });
                    });
                }
            } catch { }
        }
    }

    // Ordenar e salvar o ranking global
    try {
        globalRanking.sort((a, b) => (b.score || 0) - (a.score || 0));
        localStorage.setItem(RankingSystem.storageKey, JSON.stringify(globalRanking));
    } catch { }
    // Salvar conquistas globais
    try {
        localStorage.setItem(RankingSystem.conquistasKey, JSON.stringify(globalConquistas));
    } catch { }

    localStorage.setItem(FLAG, '1');
}

// ============================================
// 8. SISTEMA DE SONS
// ============================================
const SoundSystem = {
    urls: {
        correct: 'sounds/correct.mp3',
        wrong: 'sounds/wrong.mp3',
        click: 'sounds/click.mp3',
        block: 'sounds/block.mp3',
        gameover: 'sounds/gameover.mp3',
        win: 'sounds/win.mp3',
        chapter: 'sounds/chapter.mp3',
        chapterVoice: 'sounds/chapter_voice.mp3',
        conquest: 'sounds/conquest.mp3',
        life: 'sounds/life.mp3'
    },
    audios: {}, enabled: true,
    ambientCtx: null, ambientGain: null, ambientInterval: null, ambientEnabled: true,

    init: function () {
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
        this.setupAmbient();
    },

    setupAmbient: function () {
        try {
            this.ambientEnabled = true;

            this.ambientCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.ambientGain = this.ambientCtx.createGain();
            this.ambientGain.gain.value = this.ambientEnabled ? 0.18 : 0;
            this.ambientGain.connect(this.ambientCtx.destination);

            document.addEventListener('click', () => this.unlockAmbient(), { once: true });
            this.createAmbientToggle();
            if (this.ambientEnabled) this.startAmbient();
        } catch { }
    },

    unlockAmbient: function () {
        if (this.ambientCtx && this.ambientCtx.state === 'suspended') {
            this.ambientCtx.resume().catch(() => { });
        }
    },

    createFallbackSound: function (t) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            const freq = {
                correct: 820, wrong: 310, click: 620, block: 520,
                gameover: 210, win: 760, chapter: 450, conquest: 980, life: 280
            }[t] || 500;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
            osc.start(); osc.stop(ctx.currentTime + 0.35);
        } catch { }
    },

    play: function (n) {
        if (!this.enabled) return;
        if (this.audios[n]) {
            this.audios[n].currentTime = 0;
            const rate = (n === 'click' || n === 'block') ? (0.95 + Math.random() * 0.1) : 1;
            this.audios[n].playbackRate = rate;
            this.audios[n].play().catch(() => { });
        }
    },

    playUrl: function (id, url, volume = 0.85) {
        if (!this.enabled) return;
        if (!this.audios[id]) {
            try {
                const a = new Audio(url);
                a.volume = volume;
                a.preload = 'auto';
                this.audios[id] = a;
            } catch {
                return;
            }
        }
        const a = this.audios[id];
        a.currentTime = 0;
        a.play().catch(() => { });
    },

    playChapterVoice: function (chapterNumber) {
        const num = String(chapterNumber).padStart(2, '0');
        const specificId = `chapterVoice_${num}`;
        const specificUrl = `sounds/chapter${num}_voice.m4a`;
        this.playUrl(specificId, specificUrl, 0.9);
        // fallback genérico se existir
        if (this.audios[specificId]?.error || (!this.audios[specificId] && this.urls.chapterVoice)) {
            this.play('chapterVoice');
        }
    },

    createSoundToggle: function () {
        this.enabled = true;
    },

    createAmbientToggle: function () {
        this.ambientEnabled = true;
    },

    chipNote: function (freq, start, duration = 0.18, volume = 0.18, type = 'square') {
        if (!this.ambientCtx || !this.ambientGain) return;
        const osc = this.ambientCtx.createOscillator();
        const gain = this.ambientCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain); gain.connect(this.ambientGain);
        osc.start(start);
        osc.stop(start + duration + 0.05);
    },

    noiseTap: function (start, duration = 0.08, volume = 0.05) {
        if (!this.ambientCtx || !this.ambientGain) return;
        const ctx = this.ambientCtx;
        const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            const decay = 1 - i / data.length;
            data[i] = (Math.random() * 2 - 1) * decay * decay;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        noise.connect(gain); gain.connect(this.ambientGain);
        noise.start(start);
        noise.stop(start + duration + 0.05);
    },

    playAmbientBar: function () {
        if (!this.ambientCtx || !this.ambientGain || !this.ambientEnabled) return;
        const ctx = this.ambientCtx;
        const now = ctx.currentTime + 0.05;
        const roots = [196, 220, 247]; // G3, A3, B3
        const root = roots[Math.floor(Math.random() * roots.length)];
        const pattern = [0, 7, 12, 7, 3, 10, 14, 7];

        pattern.forEach((step, i) => {
            const start = now + i * 0.32;
            const freq = root * Math.pow(2, step / 12);
            this.chipNote(freq, start, 0.18, 0.16 + (i % 4 === 0 ? 0.05 : 0));
            if (i % 2 === 0) this.noiseTap(start, 0.08, 0.04);
        });

        const padOsc = ctx.createOscillator();
        padOsc.type = 'triangle';
        padOsc.frequency.setValueAtTime(root / 2, now);
        const padGain = ctx.createGain();
        padGain.gain.setValueAtTime(0.08, now);
        padGain.gain.linearRampToValueAtTime(0.02, now + 3);
        padOsc.connect(padGain); padGain.connect(this.ambientGain);
        padOsc.start(now);
        padOsc.stop(now + 3.2);
    },

    startAmbient: function () {
        if (!this.ambientCtx || !this.ambientGain) return;
        this.unlockAmbient();
        if (this.ambientInterval) clearInterval(this.ambientInterval);
        this.ambientGain.gain.setTargetAtTime(0.18, this.ambientCtx.currentTime, 0.2);
        this.playAmbientBar();
        this.ambientInterval = setInterval(() => this.playAmbientBar(), 3200);
    },

    stopAmbient: function () {
        if (!this.ambientCtx || !this.ambientGain) return;
        if (this.ambientInterval) clearInterval(this.ambientInterval);
        this.ambientInterval = null;
        this.ambientGain.gain.setTargetAtTime(0.0001, this.ambientCtx.currentTime, 0.2);
    },

    correct: function () { this.play('correct'); },
    wrong: function () { this.play('wrong'); },
    click: function () { this.play('click'); },
    block: function () { this.play('block'); },
    gameover: function () { this.play('gameover'); },
    win: function () { this.play('win'); }
};

// ============================================
// 9. LISTA DE CRIPTOATIVOS
// ============================================
const cryptoNomes = [
    "Bitcoin", "Ethereum", "Solana", "Cardano", "Binance", "Ripple", "Polkadot", "Avalanche", "Tron", "Algorand",
    "Tezos", "NEO", "Stellar", "Cosmos", "Fantom", "Harmony", "Kusama", "Aptos", "Sui", "Celestia",
    "Monad", "Sei", "Linea", "Base", "Scroll", "Blast", "Mantle", "Polygon", "Arbitrum", "Optimism",
    "zkSync", "Starknet", "Loopring", "ImmutableX", "Boba", "Metis", "Stargate", "LayerZero", "Axelar", "Wormhole",
    "Monero", "Zcash", "Dash", "Grin", "Beam", "Secret", "Oasis", "Aleo", "Aztec", "Railgun",
    "ProofOfWork", "ProofOfStake", "ProofOfHistory", "ProofOfSpace", "ProofOfAuthority", "Halving", "Difficulty", "Hashrate", "Blocktime", "Nonce",
    "Merkle", "Block", "Fork", "Timestamp", "Consensus", "GasFee", "FeeMarket", "MEV", "Slippage", "Liquidity",
    "ImpermanentLoss", "FrontRun", "Sandwich", "SmartContract", "Multisig", "ColdStorage", "HotWallet", "HardwareWallet", "SeedPhrase", "PrivateKey",
    "PublicKey", "Wallet", "Node", "Miner", "MiningRig", "ASIC", "GPU", "FPGA", "Bitmain", "Antminer",
    "Whatsminer", "Hash", "Lightning", "Taproot", "SegWit", "Ordinals", "BRC20", "RGB", "Runes", "StateChannels",
    "Chainlink", "TheGraph", "Infura", "Alchemy", "QuickNode", "Ankr", "Moralis", "Pinata", "Fleek", "Ceramic",
    "Livepeer", "IPFS", "Filecoin", "Arweave", "Helium", "Theta", "Render", "Akash", "Storj", "FrenPet",
    "Uniswap", "Sushi", "PancakeSwap", "Curve", "Balancer", "Aave", "Compound", "Maker", "Yearn", "Synthetix",
    "dYdX", "Lido", "RocketPool", "EigenLayer", "Pendle", "Jito", "Marinade", "Jupiter", "Raydium", "Orca",
    "OpenSea", "Rarible", "Blur", "MagicEden", "Tensor", "Zora", "BAYC", "CryptoPunks", "Azuki", "DeGods",
    "Doodles", "CloneX", "Mocaverse", "OrdinalsArt", "BoredApe", "Sandbox", "Decentraland", "Axie", "StepN", "Illuvium",
    "ENS", "Lens", "Farcaster", "FriendTech", "FrenPet", "DePIN", "RWA", "Stablecoin", "Tether", "USDC",
    "DAI", "BUSD", "FRAX", "LUSD", "GHO", "PayPalUSD", "Circle", "MakerDAO", "UniswapDAO", "Aragon",
    "Moloch", "Airdrop", "Retrodrop", "RugPull", "Pump", "Dump", "Whale", "Bull", "Bear", "HODL",
    "FOMO", "FUD", "ReKT", "WAGMI", "NGMI", "GM", "DYOR", "ATH", "ATL", "ROI",
    "PEPE", "WIF", "BONK", "FLOKI", "BABYDOGE", "MOG", "TURBO", "MEME", "DOGE", "Shiba",
    "LUNC", "CELO", "MKR", "CRV", "SNX", "COMP", "YFI", "UNI", "CAKE", "SAND",
    "MANA", "FLOW", "GALA", "IMX", "PYTH", "APT", "SUI", "TIA", "FIL", "AR",
    "RUNE", "KAVA", "GMX", "RPL", "LPT", "INJ", "LINK", "MINA", "OP", "ARB",
    "Satoshi", "Nakamoto", "Vitalik", "Buterin", "CZ", "Zhao", "Gavin", "Wood", "Charles", "Hoskinson",
    "Anatoly", "Toly", "DoKwon", "Hayes", "Bankless", "Pomp", "LexFridman", "CoinDesk", "Cointelegraph", "Messari",
    "Decrypt", "BitcoinMagazine", "TheBlock", "BloombergCrypto", "Coinbase", "BinanceUS", "Kraken", "Gemini", "FTX", "OKX",
    "Bybit", "Bitfinex", "Bitget", "KuCoin", "CryptoCom", "Ledger", "Trezor", "Metamask", "Phantom", "Keplr",
    "Sparrow", "Wasabi", "MuSig", "TaprootAssets", "LightningPool", "LNURL", "Liquid", "RGBProtocol", "CoinJoin", "Mixnet",
    "SEC", "CFTC", "FATF", "FinCEN", "MiCA", "IRS", "FCA", "ANBIMA", "CVM", "BACEN",
    "ERC20", "ERC721", "ERC1155", "BEP20", "SPL", "CosmWasm", "Move", "Rust", "Solidity", "Vyper"
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
            const chave = Math.random() > 0.5 ?
                Math.floor(Math.random() * 8) + 3 :
                -(Math.floor(Math.random() * 8) + 3);

            const nomeCifrado = Criptografia.cifraDeCesar(nome, chave);

            return {
                pergunta: `🔐 Descriptografe (Cifra de César, chave: ${Math.abs(chave)}${chave > 0 ? ' →' : ' ←'}):`,
                textoCifrado: nomeCifrado,
                respostaCorreta: nome.toLowerCase(),
                tipo: 'cesar',
                chave: chave,
                dica: `Chave: ${chave > 0 ? '+' : ''}${chave} (desloque ${Math.abs(chave)} posições ${chave > 0 ? 'para frente' : 'para trás'})`
            };
        }
        else if (tipo === 'ascii') {
            return {
                pergunta: `🔢 Decodifique ASCII:`,
                textoCifrado: Criptografia.paraASCII(nome),
                respostaCorreta: nome.toLowerCase(),
                tipo: 'ascii',
                dica: `Use tabela ASCII (cada 3 números = 1 caractere)`
            };
        }
        else {
            return {
                pergunta: `🔄 Decodifique Base64:`,
                textoCifrado: Criptografia.paraBase64(nome),
                respostaCorreta: nome.toLowerCase(),
                tipo: 'base64',
                dica: `Base64 termina com = ou ==`
            };
        }
    }
};

// ============================================
// 12. FUNÇÕES PRINCIPAIS DO JOGO
// ============================================

function startGame(difficulty) {
    if (!currentUser) {
        const profileModal = document.getElementById('profile-modal');
        if (profileModal) profileModal.style.display = 'flex';
        alert('Faça login ou entre como Convidado antes de iniciar.');
        pararTimerGlobal();
        tempoTotalPartida = 0;
        const tempoModern = document.getElementById('tempo-modern');
        if (tempoModern) tempoModern.textContent = '00:00';
        return;
    }
    jogoConcluido = false;
    dificuldadeAtual = difficulty;
    switch (difficulty) {
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
    const decod = document.getElementById('decodificador-modal');
    const cir = document.getElementById('decoded-info-circulo');
    if (decod) decod.style.display = 'flex';
    if (cir) cir.style.display = 'block';
    const toggleIds = ['skins-toggle', 'achievements-toggle', 'wallet-toggle', 'chat-toggle'];
    toggleIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'block';
    });
    document.body.classList.remove('show-crypto');
    stopHomeBubbles();
    enciclopediaVisitados = new Set();
    enciclopediaPausada = false;
    pausaInicioTimestamp = null;
    showSoundToast();

    ['img-Bitcoin.esquerda', 'img-esquerda', 'img-logo.esquerda', 'img-Bitcoin.direita', 'img-direita', 'img-logo.direita'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    document.getElementById('answer').disabled = false;
    initializeBlocks();
    updateBitcoinValue(false);
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

    // Mostrar botão de encerrar
    const btnEncerrar = document.getElementById('btn-encerrar');
    if (btnEncerrar) {
        btnEncerrar.style.display = 'block';
    }

    // Se havia save anterior e o usuário optou por novo jogo, sobrescreveremos assim que salvar

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
    document.body.classList.add('show-crypto');
    startHomeBubbles();

    const tempoDisplay = document.getElementById('tempo-global');
    if (tempoDisplay) {
        tempoDisplay.style.display = 'none';
    }

    // Esconder botão de encerrar
    const btnEncerrar = document.getElementById('btn-encerrar');
    if (btnEncerrar) {
        btnEncerrar.style.display = 'none';
    }

    const toggleIds = ['skins-toggle', 'achievements-toggle', 'wallet-toggle', 'chat-toggle'];
    toggleIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

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
    updateBitcoinValue(false);
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

    // Limpar save
    localStorage.removeItem(getSaveKey());
}

function initializeBlocks() {
    const container = document.getElementById('blocks-container');
    container.innerHTML = '';
    ensureChapterCountdown(container);

    const grid = document.createElement('div');
    grid.id = 'blocks-grid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(10, 1fr)';
    grid.style.gap = '1px';
    grid.style.justifyContent = 'center';
    grid.style.width = '100%';

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
        grid.appendChild(block);
    }

    container.appendChild(grid);
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';

    updateChapterCountdown();
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
    ensureDecodedInfoSlot();
    clearDecodedInfo();
    clearDecodedInfo('decoded-info-decod');
    clearDecodedInfo('decoded-info-circulo');

    fecharCirculo();

    const botoesDivAntigo = document.getElementById('botoes-ajuda-container');
    if (botoesDivAntigo) botoesDivAntigo.remove();

    const container = document.getElementById('problem-container');

    const botoesDiv = document.createElement('div');
    botoesDiv.id = 'botoes-ajuda-container';
    botoesDiv.style.cssText = `
        display: flex;
        gap: 15px;
        margin: 20px auto;
        justify-content: center;
        flex-wrap: wrap;
    `;

    const btnDecode = document.createElement('button');
    btnDecode.id = 'btn-decode-rapido';
    btnDecode.innerHTML = '🔧 Decodificador';
    btnDecode.style.cssText = `
        padding: 12px 25px;
        background: linear-gradient(135deg, #2196f3, #1976d2);
        color: white;
        border: none;
        border-radius: 30px;
        font-weight: bold;
        font-size: 1em;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);
        transition: all 0.3s ease;
        flex: 1;
        min-width: 180px;
    `;
    btnDecode.onmouseover = () => {
        btnDecode.style.transform = 'scale(1.05)';
        btnDecode.style.boxShadow = '0 8px 25px rgba(33, 150, 243, 0.6)';
    };
    btnDecode.onmouseout = () => {
        btnDecode.style.transform = 'scale(1)';
        btnDecode.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.4)';
    };
    btnDecode.onclick = abrirDecodificador;

    botoesDiv.appendChild(btnDecode);

    if (problemaAtual && problemaAtual.tipo === 'cesar') {
        const btnCirculo = document.createElement('button');
        btnCirculo.id = 'btn-circulo-cesar';
        btnCirculo.innerHTML = '🔄 Círculo de César';
        btnCirculo.style.cssText = `
            padding: 12px 25px;
            background: linear-gradient(135deg, #9c27b0, #673ab7);
            color: white;
            border: none;
            border-radius: 30px;
            font-weight: bold;
            font-size: 1em;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(156, 39, 176, 0.4);
            transition: all 0.3s ease;
            flex: 1;
            min-width: 180px;
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

        botoesDiv.appendChild(btnCirculo);
    }

    container.appendChild(botoesDiv);

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

    if (typeof atualizarDecodificadorComProblema === 'function') {
        atualizarDecodificadorComProblema();
    }
}

function startTimer(reset = true) {
    if (reset) remainingTime = timeLimit;
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

function pausarTimersPorEnciclopedia() {
    if (jogoConcluido || vidas <= 0 || enciclopediaPausada) return;
    pausaInicioTimestamp = Date.now();
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    enciclopediaPausada = true;
    console.log('⏸️ Timers pausados pela enciclopédia');
}

function retomarTimersPorEnciclopedia() {
    if (!enciclopediaPausada) return;
    pausaInicioTimestamp = null;
    enciclopediaPausada = false;
    if (!jogoConcluido && vidas > 0) {
        startTimer(false);
    }
    console.log('▶️ Timers retomados após enciclopédia');
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

function submitAnswer() {
    if (jogoConcluido || vidas <= 0) return;

    const answerInput = document.getElementById('answer');
    const answer = answerInput.value.trim().toLowerCase();

    if (!answer) {
        document.getElementById('result').textContent = '❌ Digite uma resposta!';
        document.getElementById('result').style.color = '#ff9800';

        answerInput.style.borderColor = '#ff9800';
        answerInput.style.boxShadow = '0 0 10px rgba(255,152,0,0.5)';
        setTimeout(() => {
            answerInput.style.borderColor = '';
            answerInput.style.boxShadow = '';
        }, 1000);
        return;
    }

    if (!problemaAtual) {
        document.getElementById('result').textContent = '❌ Erro: problema não carregado';
        document.getElementById('result').style.color = '#f44336';
        return;
    }

    if (answer === problemaAtual.respostaCorreta) {
        clearInterval(timerInterval);

        document.getElementById('result').textContent = '✅ CORRETO! Bloco minerado!';
        document.getElementById('result').style.color = '#4CAF50';
        answerInput.style.borderColor = '#4CAF50';
        answerInput.style.boxShadow = '0 0 15px rgba(76,175,80,0.5)';

        const questionElement = document.getElementById('problem-question');
        questionElement.classList.add('mining-success');
        setTimeout(() => {
            questionElement.classList.remove('mining-success');
        }, 1000);

        setTimeout(() => {
            answerInput.style.borderColor = '';
            answerInput.style.boxShadow = '';
        }, 1000);

        updateBitcoinValue();
        updateBlocks();
        showDecodedInfo(problemaAtual.respostaCorreta);

        if (SoundSystem) SoundSystem.correct();

    } else {
        errosConsecutivos++;

        document.getElementById('result').textContent = '❌ RESPOSTA ERRADA! Tente novamente.';
        document.getElementById('result').style.color = '#f44336';
        answerInput.style.borderColor = '#f44336';
        answerInput.style.boxShadow = '0 0 15px rgba(244,67,54,0.5)';

        setTimeout(() => {
            answerInput.style.borderColor = '';
            answerInput.style.boxShadow = '';
        }, 1000);

        if (errosConsecutivos >= 2 && problemaAtual.dica) {
            const dicaElement = document.createElement('div');
            dicaElement.className = 'dica-box';
            dicaElement.innerHTML = `<small>💡 DICA: ${problemaAtual.dica}</small>`;
            document.getElementById('result').appendChild(dicaElement);

            setTimeout(() => {
                if (dicaElement.parentElement) dicaElement.remove();
            }, 5000);
        }

        perderVida();

        if (SoundSystem) SoundSystem.wrong();
    }
}

function updateBitcoinValue(shouldAdd = true) {
    if (jogoConcluido) return;
    if (shouldAdd) {
        let add = 0;
        switch (dificuldadeAtual) {
            case 'facil': add = 0.01000000; break;
            case 'medio': add = 0.01200000; break;
            case 'dificil': add = 0.01500000; break;
        }
        coinBalances[activeCoinId] = (coinBalances[activeCoinId] || 0) + add;
        bitcoinQuantity = coinBalances[activeCoinId];
    }
    syncActiveBalance();
    const disp = document.getElementById('bitcoin-value');
    if (disp) disp.innerHTML = `${bitcoinQuantity.toFixed(8)} ${activeCoinSymbol}`;
    
    // Atualizar logo da moeda
    const logoDisp = document.getElementById('bitcoin-logo');
    if (logoDisp) {
        logoDisp.src = getCryptoLogoUrl(activeCoinSymbol);
        logoDisp.alt = activeCoinSymbol;
    }
    
    // Atualizar label dinâmico
    const labelDisp = document.getElementById('minerados-label');
    if (labelDisp) {
        const cinfo = CoinStore.coins.find(c => c.symbol === activeCoinSymbol);
        const cnome = cinfo ? cinfo.nome : (activeCoinId === 'satoshi' ? 'Satoshi' : activeCoinSymbol);
        labelDisp.innerHTML = `💰 ${cnome} Minerados:`;
    }

    const badge = document.getElementById('coin-badge');
    if (badge) {
        badge.textContent = coinIcon(activeCoinSymbol);
        const cls = `coin-badge coin-${activeCoinId || 'generic'}`;
        badge.className = cls;
    }
    checkCoinsMasterAchievement();
}

function updateBlocks() {
    const idx = currentProblem - 1;
    if (idx < 0 || idx >= blocks.length) return;
    const block = blocks[idx];
    const stage = parseInt(block.getAttribute('data-stage'), 10);
    if (stage >= 3) return;

    const next = stage + 1;
    block.setAttribute('data-stage', next);

    switch (next) {
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
            triggerBlockExplosion(block);
            brokenBlocks++;
            if (brokenBlocks >= 100) {
                clear100Progress[dificuldadeAtual] = true;
                saveSpecialProgress();
                checkSatoshiUnlock();
            }

            if (brokenBlocks === 100) bitcoinQuantity += 0.00050000;

            verificarBonusDeBlocos();
            updateHashLog(currentProblem);

            // Fechar o decodificador para o jogador ver o centro (hash/log) após concluir um bloco
            if (typeof fecharDecodificador === 'function') fecharDecodificador();

            if (brokenBlocks % 5 === 0) {
                const idxMsg = (brokenBlocks / 5 - 1) % mensagensDeIncentivo.length;
                setTimeout(() => mostrarMensagemIncentivo(idxMsg), 500);
            }

            if (brokenBlocks % 6 === 0) {
                const cap = Math.floor(brokenBlocks / 6);
                setTimeout(() => showHistory(cap), 2000);
            }

            updateChapterCountdown();

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

    // Salvar após quebrar bloco
    setTimeout(() => {
        if (!jogoConcluido && vidas > 0) {
            salvarJogo();
        }
    }, 500);

    // Verificar metas após quebrar bloco
    setTimeout(() => {
        verificarMetasTempo();
    }, 100);
}

// Cria uma pequena animação de explosão e depois deixa o espaço negro
function triggerBlockExplosion(block) {
    if (!block || block.classList.contains('broken')) return;

    block.classList.add('exploding');

    // Partículas simples saindo do bloco
    for (let i = 0; i < 16; i++) {
        const particle = document.createElement('span');
        particle.className = 'particle';

        const ang = Math.random() * Math.PI * 2;
        const dist = 26 + Math.random() * 40; // ampliar alcance
        particle.style.setProperty('--dx', `${Math.cos(ang) * dist}px`);
        particle.style.setProperty('--dy', `${Math.sin(ang) * dist}px`);
        particle.style.background = `hsl(${20 + Math.random() * 30}, 85%, ${50 + Math.random() * 15}%)`;

        block.appendChild(particle);
        setTimeout(() => particle.remove(), 700);
    }

    // Fumaça rápida
    for (let i = 0; i < 8; i++) {
        const smoke = document.createElement('span');
        smoke.className = 'smoke';
        const ang = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 18;
        smoke.style.setProperty('--dx', `${Math.cos(ang) * dist}px`);
        smoke.style.setProperty('--dy', `${Math.sin(ang) * dist}px`);
        smoke.style.setProperty('--scale', `${0.9 + Math.random() * 0.6}`);
        block.appendChild(smoke);
        setTimeout(() => smoke.remove(), 900);
    }

    // Após o flash, deixar o espaço vazio/negro
    setTimeout(() => {
        block.classList.remove('exploding');
        block.classList.add('broken');
        block.style.background = '#000';
        block.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        const prog = block.querySelector('.block-progress');
        if (prog) prog.remove();
        block.textContent = '';
    }, 350);
}

function ensureChapterCountdown(container) {
    const existing = document.getElementById('chapter-countdown');
    if (existing) return;

    const banner = document.createElement('div');
    banner.id = 'chapter-countdown';
    banner.textContent = '';
    container.parentElement.insertBefore(banner, container);
}

function updateChapterCountdown() {
    const banner = document.getElementById('chapter-countdown');
    if (!banner) return;

    const capSize = 6;
    const nextChapter = Math.floor(brokenBlocks / capSize) + 1;
    const blocksToNext = nextChapter * capSize - brokenBlocks;

    if (brokenBlocks >= TamMax) {
        banner.textContent = 'Todos os capítulos do bitcoin foram concluídos!';
        return;
    }

    banner.textContent = `Faltam ${blocksToNext} blocos para o ${nextChapter}º Capítulo do bitcoin`;
}

function updateBlockProgress(idx, pct) {
    const prog = blocks[idx].querySelector('.block-progress');
    if (prog) prog.textContent = `${pct}%`;
}

// Exibe info somente quando o termo for o correto
function showDecodedInfoIfCorrect(termRaw, targetId = 'decoded-info') {
    if (!termRaw || !problemaAtual || !problemaAtual.respostaCorreta) return;
    if (termRaw.trim().toLowerCase() === problemaAtual.respostaCorreta.trim().toLowerCase()) {
        showDecodedInfo(termRaw, targetId);
    } else {
        clearDecodedInfo(targetId);
    }
}

// ===============================
// INFO RÁPIDA DO TERMO DESCRIPTOGRAFADO
// ===============================
const cryptoQuickInfo = {
    bitcoin: { desc: 'Primeira criptomoeda, criada por Satoshi Nakamoto em 2008.', icon: '₿' },
    ethereum: { desc: 'Plataforma de contratos inteligentes lançada em 2015.', icon: '◆' },
    solana: { desc: 'Blockchain de alta performance focada em throughput.', icon: '◎' },
    cardano: { desc: 'Blockchain em camadas, pesquisa acadêmica e prova de participação.', icon: '◈' },
    binance: { desc: 'Ecossistema da maior exchange; BNB é o token nativo.', icon: '⚡' },
    ripple: { desc: 'Rede de pagamentos e token XRP para liquidação rápida.', icon: '✕' },
    polkadot: { desc: 'Rede de parachains interoperáveis criada por Gavin Wood.', icon: '🕸️' },
    avalanche: { desc: 'Plataforma multi-chain com consenso Avalanche rápido.', icon: '🗻' },
    tron: { desc: 'Blockchain voltada a conteúdo e DeFi; alta TPS.', icon: '🚀' },
    algorand: { desc: 'Prova de participação pura criada por Silvio Micali.', icon: '🧠' },
    polygon: { desc: 'Rede de sidechains e soluções L2 para Ethereum.', icon: '⬢' },
    arbitrum: { desc: 'Rollup otimista para escalar Ethereum.', icon: '🌀' },
    optimism: { desc: 'Outro rollup otimista para Ethereum.', icon: '🔴' },
    zksync: { desc: 'Rollup zk para transações baratas e rápidas.', icon: '⚛️' },
    starknet: { desc: 'Rollup zk-STARK de alta segurança.', icon: '⭐' },
    chainlink: { desc: 'Oráculos descentralizados que conectam smart contracts a dados externos.', icon: '🔗' },
    uniswap: { desc: 'AMM pioneiro em Ethereum para swaps sem custódia.', icon: '🦄' },
    aave: { desc: 'Protocolo de empréstimos descentralizado.', icon: '👻' },
    curve: { desc: 'AMM otimizado para stablecoins.', icon: '💧' },
    maker: { desc: 'Emissor do DAI e sistema de crédito colateralizado.', icon: '🏛️' },
    tether: { desc: 'Stablecoin pareada ao USD (USDT).', icon: '💵' },
    usdc: { desc: 'Stablecoin emitida pela Circle, lastreada em USD.', icon: '💲' },
    dai: { desc: 'Stablecoin descentralizada colateralizada on-chain.', icon: '◉' },
    doge: { desc: 'Meme-coin lançada em 2013 inspirada no cachorro Shiba.', icon: '🐕' },
    shiba: { desc: 'Meme-coin ERC-20 conhecida como SHIB.', icon: '🐕‍🦺' },
    pepe: { desc: 'Meme-coin baseada no meme Pepe the Frog.', icon: '🐸' },
    litecoin: { desc: '“Prata digital”, fork do Bitcoin com blocos de 2,5 min.', icon: 'Ł' },
    monero: { desc: 'Criptomoeda focada em privacidade e fungibilidade.', icon: '🕶️' },
    zcash: { desc: 'Criptomoeda com provas zk-SNARK para privacidade.', icon: '🔒' },
    filecoin: { desc: 'Rede de armazenamento descentralizado com incentivos.', icon: '📦' },
    arweave: { desc: 'Armazenamento permanente em “permaweb”.', icon: '🧱' },
    render: { desc: 'Rede para renderização GPU descentralizada (RNDR).', icon: '🎨' },
    chain: { desc: 'Conceito genérico de cadeia de blocos.', icon: '⛓️' }
};

// Ícones extras por nome (minúsculo)
const cryptoIconMap = {
    btc: '₿', bitcoin: '₿',
    eth: '◆', ethereum: '◆',
    sol: '◎', solana: '◎',
    ada: '◈', cardano: '◈',
    bnb: '⚡', binance: '⚡',
    xrp: '✕', ripple: '✕',
    dot: '🕸️', polkadot: '🕸️',
    avax: '🗻', avalanche: '🗻',
    matic: '⬢', polygon: '⬢',
    ltc: 'Ł', litecoin: 'Ł',
    doge: '🐕', shiba: '🐕‍🦺',
    link: '🔗', uni: '🦄', aave: '👻', crv: '💧', dai: '◉', usdt: '💵', usdc: '💲',
    fil: '📦', ar: '🧱', rndr: '🎨', op: '🔴', arb: '🌀', inj: '💉', mina: '〽️'
};

function getQuickInfo(termRaw) {
    const term = termRaw?.trim();
    if (!term) return null;
    const key = term.toLowerCase();

    // 1) Mapa manual
    if (cryptoQuickInfo[key]) return cryptoQuickInfo[key];

    // 2) Enciclopédia já carregada (usa descrição oficial)
    try {
        if (CryptoEncyclopedia?.entries && CryptoEncyclopedia.entries[term]) {
            const entry = CryptoEncyclopedia.entries[term];
            const icon = cryptoIconMap[key] || '🪙';
            return { desc: entry.description, icon };
        }
        // Busca case-insensitive
        const found = Object.keys(CryptoEncyclopedia?.entries || {}).find(k => k.toLowerCase() === key);
        if (found) {
            const entry = CryptoEncyclopedia.entries[found];
            const icon = cryptoIconMap[key] || '🪙';
            return { desc: entry.description, icon };
        }
    } catch (e) {
        console.warn('⚠️ Não consegui consultar a enciclopédia:', e);
    }

    // 3) Se o termo está na lista do jogo, dá uma descrição genérica
    if (cryptoNomes?.some(n => n.toLowerCase() === key)) {
        return { desc: `Termo do jogo: ${term}.`, icon: cryptoIconMap[key] || '🪙', category: 'Jogo' };
    }

    // 4) Fallback final
    return { desc: 'Descrição não cadastrada ainda.', icon: cryptoIconMap[key] || '🪙' };
}

function ensureDecodedInfoSlot() {
    const container = document.getElementById('problem-container');
    if (!container) return;
    let slot = document.getElementById('decoded-info');
    if (!slot) {
        slot = document.createElement('div');
        slot.id = 'decoded-info';
        slot.className = 'decoded-info';
        const resultEl = document.getElementById('result');
        container.insertBefore(slot, resultEl);
    }
}

function clearDecodedInfo(targetId = 'decoded-info') {
    const slot = document.getElementById(targetId);
    if (slot) {
        slot.innerHTML = '';
        slot.style.display = 'none';
    }
}

function showDecodedInfo(termRaw, targetId = 'decoded-info', isPreview = false) {
    const slot = document.getElementById(targetId);
    if (!slot || !termRaw) return;

    const term = termRaw.trim();
    const info = getQuickInfo(term);
    const icon = info?.icon || '🪙';
    const badge = isPreview ? '<span class="decoded-badge">prévia</span>' : '';

    slot.innerHTML = `
        <div class="decoded-chip">
            <span class="decoded-icon">${icon}</span>
            <div class="decoded-text">
                <div class="decoded-title">${term} ${badge}</div>
                <div class="decoded-desc">${info.desc}</div>
            </div>
        </div>
    `;
    slot.style.display = 'block';
}

function updateScore(points) {
    if (jogoConcluido) return;
    let bonus = 0;
    if (problemaAtual) {
        switch (problemaAtual.tipo) {
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
        vida.alt = `Vida ${i + 1}`;
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
        if (SoundSystem) SoundSystem.play('life');
        const cont = document.getElementById('vidas-container');
        cont.classList.add('shake');
        setTimeout(() => cont.classList.remove('shake'), 500);
    }
    if (vidas === 0) setTimeout(() => gameOver(), 1000);
}

function gameOver() {
    salvarJogo(true);
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
    setTimeout(() => { RankingSystem.saveGameScore(false); clearCurrentUserSession(false); }, 1500);
    if (btn) btn.style.display = 'inline-block';

    // Esconder botão de encerrar
    const btnEncerrar = document.getElementById('btn-encerrar');
    if (btnEncerrar) btnEncerrar.style.display = 'none';

    // Manter save para permitir retomada
    clearCurrentUserSession(false);
}

function endGame(isVictory = true) {
    salvarJogo(true);
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
    setTimeout(() => { RankingSystem.saveGameScore(isVictory); clearCurrentUserSession(false); }, 1500);
    if (btn) btn.style.display = 'inline-block';

    // Esconder botão de encerrar
    const btnEncerrar = document.getElementById('btn-encerrar');
    if (btnEncerrar) btnEncerrar.style.display = 'none';

    // Manter save para retomar progresso
}

function formatarTempo(segundos) {
    const hrs = Math.floor(segundos / 3600);
    const mins = Math.floor((segundos % 3600) / 60);
    const secs = segundos % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function mostrarMensagemIncentivo(idx) {
    if (idx >= 0 && idx < mensagensDeIncentivo.length) {
        mostrarMensagemLateral(mensagensDeIncentivo[idx], 'incentivo', 3000);
        console.log(`💬 Mensagem: ${mensagensDeIncentivo[idx]}`);
    }
}

function mostrarMensagemLateral(texto, tipo = 'incentivo', duracao = 3000) {
    const container = document.getElementById('mensagens-laterais');
    if (!container) return;

    const cores = {
        incentivo: 'linear-gradient(135deg, #f7931a, #ffaa33)',
        conquista: 'linear-gradient(135deg, gold, #ffcc00)',
        bonus: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
        info: 'linear-gradient(135deg, #2196f3, #1976d2)'
    };

    const icones = {
        incentivo: '💪',
        conquista: '🏆',
        bonus: '🎁',
        info: 'ℹ️'
    };

    const mensagem = document.createElement('div');
    mensagem.style.cssText = `
        background: ${cores[tipo] || cores.incentivo};
        color: black;
        padding: 12px 18px;
        border-radius: 10px;
        margin-bottom: 10px;
        border-left: 5px solid gold;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        animation: slideInLeft 0.3s ease;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        font-size: 1em;
    `;

    mensagem.innerHTML = `
        <span style="font-size: 1.5em;">${icones[tipo]}</span>
        <span style="flex: 1;">${texto}</span>
        <span style="font-size: 0.8em; opacity: 0.7;">agora</span>
    `;

    container.prepend(mensagem);

    setTimeout(() => {
        mensagem.style.animation = 'slideOutLeft 0.3s ease';
        setTimeout(() => mensagem.remove(), 300);
    }, duracao);

    while (container.children.length > 5) {
        container.removeChild(container.lastChild);
    }
}

function showHistory(chapter) {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    if (SoundSystem) {
        SoundSystem.play('chapter');
        setTimeout(() => SoundSystem.playChapterVoice(chapter), 250);
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
            <div style="background:rgba(255,255,255,0.05); padding:20px; border-left:4px solid #f7931a; text-align:left;">${textos[idx - 1]}</div>
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

function verificarBonusDeBlocos() {
    if (brokenBlocks > 0 && brokenBlocks % 20 === 0) {
        let pts = 1000, btc = 0.00000100, vidasBonus = 0;
        switch (dificuldadeAtual) {
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
        updateBitcoinValue(false);
        SoundSystem.win();
    }
}

function mostrarBonusMessage(p, b, v) {
    const c = document.getElementById('mensagem-container');
    if (!c) return;
    const div = document.createElement('div');
    div.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:linear-gradient(135deg,#FFD700,#FFA500); color:#000; padding:30px; border-radius:20px; border:5px solid gold; text-align:center; z-index:10000;';
    div.innerHTML = `<div style="font-size:4em;">🏆</div><h2>BÔNUS!</h2><p>+${p} pontos</p><p>+${b.toFixed(8)} BTC</p>${v > 0 ? '<p>+1 vida</p>' : ''}<button onclick="this.parentElement.remove()">OK</button>`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}

function generateHash(n) {
    const d = new Date();
    return `Bloco #${n} | Hash: 000000${Math.random().toString(36).substring(2, 15)}${n} | ${d.toLocaleString('pt-BR')}`;
}

function updateHashLog(blockNumber) {
    const bloco = gerarBlocoRealista(blockNumber, problemaAtual?.textoCifrado || '');

    adicionarBlocoRealista(bloco);

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

        if (hashDisplay.firstChild) {
            hashDisplay.insertBefore(el, hashDisplay.firstChild);
        } else {
            hashDisplay.appendChild(el);
        }

        while (hashDisplay.children.length > 5) {
            hashDisplay.removeChild(hashDisplay.lastChild);
        }
    }
}

function showHelp() {
    alert(`🎮 AJUDA DO JOGOBITCOIN

1) Faça login ou Convidado (nome do perfil aparece no chat e ranking).
2) Escolha a dificuldade e quebre blocos descriptografando (César/ASCII/Base64).
3) Ferramentas: Circulo de César e Decode ficam acessíveis no jogo.
4) Carteira 💼 guarda saldos de todas as moedas; rendimento por hora.
5) Skins e Moedas colecionáveis (🎨/Moedas). Troque a moeda ativa para minerar outro ativo.
6) Conquistas: veja no 🏆; especiais:
   • Maestro das Criptos: 0.05 de cada moeda.
   • Medalha Satoshi: 100 blocos em Fácil, Médio e Difícil.
7) Chat: usa o nome do perfil logado, sincroniza entre abas.
8) Save automático: retoma blocos quebrados, tempo e cadeia.
9) Ajuda rápida: ?texto no chat para falar com o bot.

Bons blocos!`);
}

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
    btn.style.cssText = 'position:fixed; top:12px; right:140px; width:50px; height:50px; border-radius:50%; background:linear-gradient(135deg,#9c27b0,#673ab7); color:white; border:2px solid #ba68c8; font-size:1.5em; cursor:pointer; z-index:10001;';
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
                    <div onclick="ativarCirculoCesar(); fecharMenu();" style="padding:15px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.1);">
                        🔄 Círculo de César
                    </div>
                    <div onclick="abrirDecodificador()" style="padding:15px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.1);">
                        🔧 Ferramentas de Decodificação
                    </div>
                    <div onclick="abrirSobre()" style="padding:15px; cursor:pointer;">ℹ️ Sobre</div>
                </div>
                <div style="padding:20px; border-top:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between;">
                    <span>👁️ <span id="visit-count">0</span> visitas</span>
                    <span style="color:#888;">v2.0</span>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('menu-overlay').onclick = fecharMenu;
}

// ============================================
// BOLHAS NA TELA INICIAL
// ============================================
function createBubble() {
    if (!document.body.classList.contains('show-crypto')) return;
    const b = document.createElement('div');
    b.className = 'bubble';
    const size = 40 + Math.random() * 50;
    b.style.width = `${size}px`;
    b.style.height = `${size}px`;
    b.style.left = `${Math.random() * 100}%`;
    const dur = 12 + Math.random() * 12;
    b.style.animationDuration = `${dur}s`;
    b.onclick = () => {
        b.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
        b.style.transform = 'scale(0)';
        b.style.opacity = '0';
        setTimeout(() => b.remove(), 200);
    };
    b.addEventListener('animationend', () => b.remove());
    document.body.appendChild(b);
}

function startHomeBubbles() {
    if (bubbleInterval) return;
    createBubble();
    bubbleInterval = setInterval(createBubble, 5000);
}

function stopHomeBubbles() {
    if (bubbleInterval) {
        clearInterval(bubbleInterval);
        bubbleInterval = null;
    }
    document.querySelectorAll('.bubble').forEach(b => b.remove());
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

function abrirAvaliacao(onDone = null) {
    fecharMenu();

    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:40000;
        display:flex; align-items:center; justify-content:center; padding:20px;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border: 2px solid #00ffff;
        border-radius: 16px;
        padding: 24px;
        max-width: 420px; width: 90%;
        color: white; text-align: center; box-shadow: 0 12px 40px rgba(0,0,0,0.6);
    `;

    box.innerHTML = `
        <h3 style="margin-top:0; color:#00ffff;">Avalie o jogo</h3>
        <p style="margin:8px 0 16px 0; color:#ccc;">Clique nas estrelas para dar sua nota.</p>
        <div id="star-row" style="display:flex; gap:10px; justify-content:center; margin:14px 0 18px 0;"></div>
        <button id="aval-cancel" style="padding:10px 16px; border:none; border-radius:10px; background:rgba(255,255,255,0.1); color:white; cursor:pointer;">Fechar</button>
    `;

    const starRow = box.querySelector('#star-row');
    let current = 0;
    for (let i = 1; i <= 5; i++) {
        const s = document.createElement('span');
        s.textContent = '★';
        s.dataset.val = i;
        s.style.cssText = `
            font-size: 2.2em;
            cursor: pointer;
            color: #555;
            transition: transform 0.15s ease, color 0.15s ease;
        `;
        s.onmouseenter = () => highlight(i);
        s.onmouseleave = () => highlight(current);
        s.onclick = () => {
            current = i;
            highlight(current);
        };
        starRow.appendChild(s);
    }

    function highlight(n) {
        starRow.querySelectorAll('span').forEach(st => {
            const val = parseInt(st.dataset.val, 10);
            if (val <= n) {
                st.style.color = '#f1c40f';
                st.style.transform = 'scale(1.1)';
            } else {
                st.style.color = '#555';
                st.style.transform = 'scale(1)';
            }
        });
    }

    box.querySelector('#aval-cancel').onclick = () => {
        overlay.remove();
        if (current > 0) {
            salvarAvaliacao(current);
            alert(`⭐ Obrigado! Você avaliou com ${current} estrela${current > 1 ? 's' : ''}.`);
        }
        if (typeof onDone === 'function') onDone();
    };
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

function salvarAvaliacao(nota) {
    if (!nota || nota < 1 || nota > 5) return;
    const a = JSON.parse(localStorage.getItem('jogobitcoin_avaliacoes') || '[]');
    a.push({ nota, data: new Date().toLocaleString() });
    localStorage.setItem('jogobitcoin_avaliacoes', JSON.stringify(a));
}

function abrirCompartilharFinal(nomeJogador = 'Jogador') {
    // Mensagem curta de convite
    const mensagem = `Joguei JogoBitcoin, quebrei ${brokenBlocks} blocos e somei ${score} pontos! Aprenda criptografia e Bitcoin brincando.`;
    const url = window.location.href.split('#')[0];
    const text = encodeURIComponent(`${mensagem} Venha jogar: ${url}`);

    const redes = {
        x: { label: 'X', icon: '🐦', url: `https://twitter.com/intent/tweet?text=${text}` },
        linkedin: { label: 'LinkedIn', icon: 'in', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&mini=true&summary=${text}` },
        facebook: { label: 'Facebook', icon: 'f', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${text}` },
        whatsapp: { label: 'WhatsApp', icon: '🟢', url: `https://wa.me/?text=${text}` },
        telegram: { label: 'Telegram', icon: '✈️', url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}` }
    };

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; inset: 0; z-index: 40000; background: rgba(0,0,0,0.8);
        display: flex; align-items: center; justify-content: center; padding: 20px;
    `;
    const box = document.createElement('div');
    box.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border: 2px solid #00ffff;
        border-radius: 16px;
        padding: 24px;
        max-width: 420px; width: 90%;
        color: white; text-align: center; box-shadow: 0 12px 40px rgba(0,0,0,0.6);
    `;
    box.innerHTML = `
        <h3 style="margin-top:0; color:#00ffff;">Compartilhar sua partida</h3>
        <p style="margin:8px 0 16px 0; color:#ccc;">${nomeJogador}, escolha uma rede para convidar seus amigos:</p>
        <div id="share-buttons" style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center; margin-bottom:16px;"></div>
        <button id="share-close" style="padding:10px 16px; border:none; border-radius:10px; background:rgba(255,255,255,0.1); color:white; cursor:pointer;">Fechar</button>
    `;
    modal.appendChild(box);
    document.body.appendChild(modal);

    const btns = box.querySelector('#share-buttons');
    Object.entries(redes).forEach(([key, data]) => {
        const b = document.createElement('button');
        b.innerHTML = `${data.icon} ${data.label}`;
        b.style.cssText = `
            padding: 10px 14px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            background: linear-gradient(135deg,#00ffff,#0088aa);
            color: #0b1b2c;
            font-weight: 700;
            min-width: 120px;
            box-shadow: 0 6px 16px rgba(0,0,0,0.3);
        `;
        b.onclick = () => window.open(data.url, '_blank', 'noopener,noreferrer');
        btns.appendChild(b);
    });

    box.querySelector('#share-close').onclick = () => modal.remove();
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
    alert('🎮 JogoBitcoin v2.0\n\nUm jogo educativo sobre criptografia e Bitcoin.\n\n© 2026 - Todos os direitos reservados');
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
    const ultimoJogador = RankingSystem.getCurrentPlayerName() || localStorage.getItem(nsKey('jogobitcoin_lastname'));

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
            texto += `${index + 1}. ${c.icone} ${c.titulo}\n   📅 ${c.data}\n\n`;
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
            texto += `${index + 1}. ${c.icone} ${c.titulo}\n   📅 ${c.data}\n\n`;
        });
        alert(texto);
    }
}

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

            const chaveElement = document.getElementById('circulo-cesar-chave');
            const chaveValorElement = document.getElementById('circulo-cesar-chave-valor');
            if (chaveElement && chaveValorElement && problemaAtual && problemaAtual.chave !== undefined) {
                chaveValorElement.textContent = `${Math.abs(problemaAtual.chave)}${problemaAtual.chave > 0 ? ' →' : ' ←'}`;
                chaveElement.style.display = 'block';
            }
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

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        girarLetraAtual(-1);
    }
    if (event.key === 'ArrowRight') {
        girarLetraAtual(1);
    }
});

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
        showDecodedInfoIfCorrect(resposta, 'decoded-info-circulo');

        if (SoundSystem && SoundSystem.win) SoundSystem.win();
    } else {
        container.style.color = '#ffaa00';
        container.style.textShadow = '0 0 15px rgba(255,170,0,0.5)';
        clearDecodedInfo('decoded-info-circulo');
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
// NOVO: SISTEMA DE SALVAMENTO DO JOGO
// ============================================

// Chave para localStorage
const SAVE_KEY_BASE = 'jogobitcoin_save';
const getSaveKey = () => nsKey(SAVE_KEY_BASE);

// ============================================
// SALVAR ESTADO DO JOGO
// ============================================
function salvarJogo(force = false) {
    // Só salvar se o jogo estiver ativo, a menos que seja forçado
    if (!force && (jogoConcluido || vidas <= 0)) return;

    const estado = {
        // Progresso básico
        currentProblem: currentProblem,
        score: score,
        vidas: vidas,
        bitcoinQuantity: bitcoinQuantity,
        coinBalances: coinBalances,
        brokenBlocks: brokenBlocks,
        dificuldadeAtual: dificuldadeAtual,
        timeLimit: timeLimit,
        remainingTime: remainingTime,

        // Timestamp para saber quando foi salvo
        timestamp: Date.now(),

        // Blocos quebrados (estado dos blocos)
        blocksStage: blocks.map(block => parseInt(block.getAttribute('data-stage') || '0')),

        // Problema atual
        problemaAtual: problemaAtual ? {
            pergunta: problemaAtual.pergunta,
            textoCifrado: problemaAtual.textoCifrado,
            respostaCorreta: problemaAtual.respostaCorreta,
            tipo: problemaAtual.tipo,
            chave: problemaAtual.chave,
            dica: problemaAtual.dica
        } : null,

        // Metas e conquistas da sessão atual
        metasAlcancadas: metasAlcancadas,
        selosConquistados: selosConquistados,

        // Tempo
        tempoTotalPartida: tempoTotalPartida,
        tempoInicioPartida: tempoInicioPartida
        ,
        // Blockchain visual
        cadeiaHTML: (document.getElementById('blockchain-cadeia') || {}).innerHTML || '',
        ultimosHashes: ultimosHashes,
        blockchainHistory: blockchainHistory
    };

    try {
        localStorage.setItem(getSaveKey(), JSON.stringify(estado));
        console.log('💾 Jogo salvo automaticamente:', new Date().toLocaleTimeString());

        // Mostrar indicador de salvamento
        mostrarIndicadorSalvamento();
    } catch (e) {
        console.error('Erro ao salvar jogo:', e);
    }
}

// ============================================
// MOSTRAR INDICADOR DE SALVAMENTO
// ============================================
function mostrarIndicadorSalvamento() {
    let indicador = document.getElementById('save-indicator');

    if (!indicador) {
        indicador = document.createElement('div');
        indicador.id = 'save-indicator';
        indicador.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 8px 20px;
            border-radius: 30px;
            font-size: 0.9em;
            font-weight: bold;
            z-index: 100000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            border: 2px solid gold;
            transition: opacity 0.5s;
            pointer-events: none;
        `;
        document.body.appendChild(indicador);
    }

    indicador.innerHTML = '💾 Jogo salvo ✓';
    indicador.style.opacity = '1';

    // Esconder após 2 segundos
    setTimeout(() => {
        indicador.style.opacity = '0';
    }, 2000);
}

// ============================================
// CARREGAR JOGO SALVO
// ============================================
function carregarJogoSalvo() {
    try {
        const saved = localStorage.getItem(getSaveKey());
        if (!saved) return false;

        const estado = JSON.parse(saved);

        // Verificar se o save é recente (menos de 24 horas)
        const idade = Date.now() - estado.timestamp;
        const UM_DIA = 24 * 60 * 60 * 1000;

        if (idade > UM_DIA) {
            console.log('⌛ Save expirado (mais de 24 horas)');
            localStorage.removeItem(getSaveKey());
            return false;
        }

        console.log('📂 Carregando jogo salvo de', new Date(estado.timestamp).toLocaleString());

        // Restaurar variáveis básicas
        currentProblem = estado.currentProblem;
        score = estado.score;
        vidas = estado.vidas;
        bitcoinQuantity = estado.bitcoinQuantity;
        coinBalances = estado.coinBalances || {};
        CoinStore.coins.forEach(c => { if (coinBalances[c.id] == null) coinBalances[c.id] = 0; });
        brokenBlocks = estado.brokenBlocks;
        dificuldadeAtual = estado.dificuldadeAtual;
        timeLimit = estado.timeLimit;
        remainingTime = estado.remainingTime;
        metasAlcancadas = estado.metasAlcancadas || [];
        selosConquistados = estado.selosConquistados || [];
        tempoTotalPartida = estado.tempoTotalPartida || 0;
        tempoInicioPartida = Date.now() - (tempoTotalPartida * 1000);
        if (estado.ultimosHashes) ultimosHashes = estado.ultimosHashes;
        blockchainHistory = estado.blockchainHistory || [];

        // Restaurar problema atual
        if (estado.problemaAtual) {
            problemaAtual = estado.problemaAtual;
        }

        // Inicializar jogo com a dificuldade salva
        document.getElementById('info-container').style.display = 'none';
        document.getElementById('difficulty-selection').style.display = 'none';
        document.getElementById('problem-container').style.display = 'flex';
        document.getElementById('game-container').style.display = 'flex';
        document.getElementById('hash-log').style.display = 'flex';

        // Esconder imagens
        ['img-Bitcoin.esquerda', 'img-esquerda', 'img-logo.esquerda', 'img-Bitcoin.direita', 'img-direita', 'img-logo.direita'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        // Recriar blocos com estágios salvos
        initializeBlocks();
        if (estado.blocksStage) {
            estado.blocksStage.forEach((stage, index) => {
                if (index < blocks.length && stage > 0) {
                    const block = blocks[index];
                    block.setAttribute('data-stage', stage);

                    // Aplicar cor baseada no estágio
                    if (stage === 1) {
                        block.style.backgroundColor = '#f1c40f';
                    } else if (stage === 2) {
                        block.style.backgroundColor = '#95a5a6';
                    } else if (stage === 3) {
                        block.style.backgroundColor = '#2ecc71';
                    }

                    const progress = block.querySelector('.block-progress');
                    if (progress) {
                        progress.textContent = stage === 1 ? '33%' : stage === 2 ? '66%' : '100%';
                    }
                }
            });
        }

        // Atualizar displays
        updateBitcoinValue(false);
        updateScoreDisplay(score);
        updateVidasDisplay();

        // Mostrar problema atual
        if (problemaAtual) {
            document.getElementById('problem-number').textContent = `Bloco Nº: ${currentProblem}`;
            document.getElementById('problem-question').innerHTML = `${problemaAtual.pergunta}<br><div class="texto-cifrado">${problemaAtual.textoCifrado}</div>`;
        } else {
            displayNextProblem();
        }

        // Reiniciar timer
        startTimer();
        iniciarTimerGlobal(false); // retoma do tempo salvo
        const tempoDisplay = document.getElementById('tempo-global');
        if (tempoDisplay) tempoDisplay.style.display = 'flex';
        syncActiveBalance();

        // Restaurar blockchain visual
        const cadeia = document.getElementById('blockchain-cadeia');
        if (cadeia) {
            cadeia.innerHTML = '';
            const historico = estado.blockchainHistory || [];
            if (historico.length > 0) {
                historico.forEach(b => adicionarBlocoRealista(b));
            } else if (estado.cadeiaHTML) {
                cadeia.innerHTML = estado.cadeiaHTML; // fallback
            }
            cadeia.style.display = 'flex';
        }

        // Mostrar mensagem de boas-vindas
        mostrarMensagemLateral('🔄 Jogo carregado! Continue de onde parou.', 'info', 3000);

        return true;
    } catch (e) {
        console.error('Erro ao carregar jogo:', e);
        return false;
    }
}

// ============================================
// NOVO: BOTÃO DE ENCERRAR PARTIDA
// ============================================
function criarBotaoEncerrar() {
    const btn = document.createElement('button');
    btn.id = 'btn-encerrar';
    btn.innerHTML = '⏹️ Encerrar Partida';
    btn.style.cssText = `
        position: fixed;
        top: 12px;
        right: 220px;
        padding: 10px 20px;
        background: linear-gradient(135deg, #f44336, #d32f2f);
        color: white;
        border: none;
        border-radius: 25px;
        font-weight: bold;
        font-size: 0.9em;
        cursor: pointer;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);
        transition: all 0.3s ease;
        border: 2px solid #ff9800;
        display: none; /* Só aparece durante o jogo */
    `;

    btn.onmouseover = () => {
        btn.style.transform = 'scale(1.05)';
        btn.style.boxShadow = '0 8px 25px rgba(244, 67, 54, 0.6)';
    };

    btn.onmouseout = () => {
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = '0 4px 15px rgba(244, 67, 54, 0.4)';
    };

    btn.onclick = encerrarPartida;

    document.body.appendChild(btn);
}

// ============================================
// NOVO: FUNÇÃO PARA ENCERRAR PARTIDA
// ============================================
function encerrarPartida() {
    // Confirmar se realmente quer encerrar
    if (!confirm('⚠️ Deseja realmente encerrar esta partida?\n\nSeu progresso será registrado no ranking e você poderá começar uma nova partida.')) {
        return;
    }

    console.log('⏹️ Encerrando partida voluntariamente...');

    // Parar timers
    clearInterval(timerInterval);
    pararTimerGlobal();

    // Marcar como concluído para não continuar
    jogoConcluido = true;

    // Mostrar mensagem de encerramento
    const msg = document.getElementById('mensagem-final');
    const txt = document.getElementById('mensagem-texto');
    const btn = document.getElementById('restart-button');

    if (msg && txt) {
        // Mostrar resumo da partida
        let conquistasTexto = '';
        if (selosConquistados.length > 0) {
            conquistasTexto = '<div style="margin-top: 15px; background: rgba(255,215,0,0.2); padding: 10px; border-radius: 10px;">';
            conquistasTexto += '<p style="color: gold; margin-bottom: 5px;">🏆 Conquistas:</p>';
            selosConquistados.forEach(c => {
                conquistasTexto += `<p style="margin: 3px 0;">${c.icone} ${c.titulo}</p>`;
            });
            conquistasTexto += '</div>';
        }

        txt.innerHTML = `
            <h2 style="color: #ff9800;">⏹️ Partida Encerrada</h2>
            <p><strong>BTC:</strong> ${bitcoinQuantity.toFixed(8)}</p>
            <p><strong>Pontos:</strong> ${score.toLocaleString()}</p>
            <p><strong>Blocos:</strong> ${brokenBlocks}/100</p>
            <p><strong>Tempo total:</strong> ${formatarTempo(tempoTotalPartida)}</p>
            <p><strong>Dificuldade:</strong> ${dificuldadeAtual.toUpperCase()}</p>
            ${conquistasTexto}
        `;

        msg.style.display = 'block';
    }

    // Salvar no ranking (com todas as conquistas)
    setTimeout(() => {
        RankingSystem.saveGameScore(false); // false = não é vitória, mas encerrou

        clearCurrentUserSession(false);
    }, 500);

    if (btn) btn.style.display = 'inline-block';

    // Esconder botão de encerrar
    const btnEncerrar = document.getElementById('btn-encerrar');
    if (btnEncerrar) btnEncerrar.style.display = 'none';

    // Tocar som
    if (SoundSystem) SoundSystem.click();
}

// ============================================
// SALVAMENTO AUTOMÁTICO PERIÓDICO
// ============================================
setInterval(() => {
    // Salvar a cada 30 segundos se o jogo estiver ativo
    if (!jogoConcluido && vidas > 0 && currentProblem > 1) {
        salvarJogo();
    }
}, 30000);

// ============================================
// PREVENIR PERDA ACIDENTAL
// ============================================
window.addEventListener('beforeunload', (e) => {
    // Se o jogo estiver ativo, avisar antes de sair
    if (!jogoConcluido && vidas > 0 && currentProblem > 1) {
        // Salvar automaticamente antes de sair
        salvarJogo();

        // Mostrar aviso (opcional)
        e.preventDefault();
        e.returnValue = 'Tem certeza que deseja sair? Seu progresso foi salvo.';
    }
});

// ============================================
// DECODIFICADOR - FERRAMENTAS DE APOIO
// ============================================

function abrirDecodificador() {
    console.log('🔧 Abrindo decodificador - Dificuldade atual:', dificuldadeAtual);

    fecharMenu();
    const modal = document.getElementById('decodificador-modal');
    if (modal) {
        modal.style.display = 'flex';

        atualizarEstadosDecodificador();

        setTimeout(() => {
            abrirDecodNivel(dificuldadeAtual);
            forcarPreenchimentoDecodificador();
        }, 200);

        if (SoundSystem) SoundSystem.click();
    }
}

function fecharDecodificador() {
    const modal = document.getElementById('decodificador-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    if (SoundSystem) SoundSystem.click();
}

// ============================================
// SISTEMA DE HABILITAÇÃO DOS NÍVEIS DO DECODIFICADOR
// ============================================

function atualizarEstadosDecodificador() {
    console.log('🎮 Atualizando estados do decodificador - Dificuldade atual:', dificuldadeAtual);

    const botoesNivel = document.querySelectorAll('.decod-nivel');

    botoesNivel.forEach(btn => {
        const nivel = btn.getAttribute('data-nivel');

        if (nivel === dificuldadeAtual) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.style.pointerEvents = 'auto';

            if (nivel === 'facil') btn.style.background = 'linear-gradient(135deg,#00aa00,#006600)';
            if (nivel === 'medio') btn.style.background = 'linear-gradient(135deg,#ffaa00,#cc8800)';
            if (nivel === 'dificil') btn.style.background = 'linear-gradient(135deg,#ff4400,#aa2200)';
        } else {
            btn.disabled = true;
            btn.style.opacity = '0.4';
            btn.style.cursor = 'not-allowed';
            btn.style.pointerEvents = 'none';
            btn.style.background = 'rgba(255,255,255,0.1)';
        }
    });

    const nivelAtualDiv = document.getElementById(`decod-${dificuldadeAtual}`);
    if (nivelAtualDiv && nivelAtualDiv.style.display !== 'block') {
        abrirDecodNivel(dificuldadeAtual);
    }
}

function abrirDecodNivel(nivel) {
    console.log('📂 Tentando abrir nível:', nivel, 'Dificuldade atual:', dificuldadeAtual);

    if (nivel !== dificuldadeAtual) {
        console.log('🚫 Nível', nivel, 'não permitido - dificuldade atual é', dificuldadeAtual);

        mostrarMensagemLateral(`🚫 Nível ${nivel.toUpperCase()} bloqueado! Complete o nível ${dificuldadeAtual.toUpperCase()} primeiro.`, 'info', 3000);

        setTimeout(() => {
            abrirDecodNivel(dificuldadeAtual);
        }, 100);
        return;
    }

    document.querySelectorAll('.decod-conteudo').forEach(el => {
        el.style.display = 'none';
    });

    const nivelDiv = document.getElementById(`decod-${nivel}`);
    if (nivelDiv) {
        nivelDiv.style.display = 'block';
    } else {
        console.error(`❌ Nível ${nivel} não encontrado`);
        return;
    }

    document.querySelectorAll('.decod-nivel').forEach(btn => {
        const btnNivel = btn.getAttribute('data-nivel');

        if (btnNivel === dificuldadeAtual) {
            btn.style.background = 'rgba(255,255,255,0.1)';
            btn.style.color = 'white';
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.style.pointerEvents = 'auto';
        } else {
            btn.disabled = true;
            btn.style.opacity = '0.4';
            btn.style.cursor = 'not-allowed';
            btn.style.pointerEvents = 'none';
            btn.style.background = 'rgba(255,255,255,0.1)';
        }
    });

    const btnAtivo = document.querySelector(`.decod-nivel[data-nivel="${nivel}"]`);
    if (btnAtivo && nivel === dificuldadeAtual) {
        if (nivel === 'facil') btnAtivo.style.background = 'linear-gradient(135deg,#00aa00,#006600)';
        if (nivel === 'medio') btnAtivo.style.background = 'linear-gradient(135deg,#ffaa00,#cc8800)';
        if (nivel === 'dificil') btnAtivo.style.background = 'linear-gradient(135deg,#ff4400,#aa2200)';
        btnAtivo.style.color = 'white';
    }

    const resultado = document.getElementById('decod-resultado');
    if (resultado) resultado.innerHTML = 'Aguardando decodificação...';

    setTimeout(() => {
        forcarPreenchimentoDecodificador();
    }, 100);
}

function selecionarDecodMetodo(nivel, metodo) {
    console.log(`📂 Selecionando método ${metodo} no nível ${nivel}`);

    document.querySelectorAll(`#decod-${nivel} .decod-metodo`).forEach(el => {
        el.style.display = 'none';
    });

    const metodoDiv = document.getElementById(`decod-${nivel}-${metodo}`);
    if (metodoDiv) {
        metodoDiv.style.display = 'block';
    }

    document.querySelectorAll(`#decod-${nivel} .btn-metodo`).forEach(btn => {
        btn.style.background = 'rgba(255,255,255,0.1)';
    });

    const btnAtivo = document.getElementById(`decod-${nivel}-${metodo}-btn`);
    if (btnAtivo) {
        if (nivel === 'medio') btnAtivo.style.background = 'linear-gradient(135deg, #ffaa00, #cc8800)';
        if (nivel === 'dificil') btnAtivo.style.background = 'linear-gradient(135deg, #ff4400, #aa2200)';
    }

    setTimeout(() => {
        forcarPreenchimentoDecodificador();
    }, 100);
}

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

    atualizarDecodificadorComProblema();
}

function decodificarFacil() {
    const input = document.getElementById('decod-facil-input')?.value;
    const shift = parseInt(document.getElementById('decod-facil-shift')?.value || 0);
    const resultado = document.getElementById('decod-resultado');

    if (!input) {
        resultado.innerHTML = '⚠️ Digite uma mensagem para decodificar!';
        return;
    }

    const decoded = decodificarCesar(input, shift);
    resultado.innerHTML = decoded;
    showDecodedInfoIfCorrect(decoded, 'decoded-info-decod');
    if (SoundSystem) SoundSystem.click();
}

function decodificarMedio() {
    const metodoCesar = document.getElementById('decod-medio-cesar')?.style.display !== 'none';
    const metodoAscii = document.getElementById('decod-medio-ascii')?.style.display !== 'none';
    const resultado = document.getElementById('decod-resultado');

    if (metodoCesar) {
        const input = document.getElementById('decod-medio-cesar-input')?.value;
        const shift = parseInt(document.getElementById('decod-medio-shift')?.value || 0);

        if (!input) {
            resultado.innerHTML = '⚠️ Digite uma mensagem!';
            return;
        }
        const decoded = decodificarCesar(input, shift);
        resultado.innerHTML = decoded;
        showDecodedInfoIfCorrect(decoded, 'decoded-info-decod');
    }
    else if (metodoAscii) {
        const input = document.getElementById('decod-medio-ascii-input')?.value;
        if (!input) {
            resultado.innerHTML = '⚠️ Digite códigos ASCII!';
            return;
        }
        const decoded = decodificarASCII(input);
        resultado.innerHTML = decoded;
        showDecodedInfoIfCorrect(decoded, 'decoded-info-decod');
    }
    else {
        resultado.innerHTML = '❌ Selecione um método primeiro!';
    }

    if (SoundSystem) SoundSystem.click();
}

function decodificarDificil() {
    const metodoCesar = document.getElementById('decod-dificil-cesar')?.style.display !== 'none';
    const metodoAscii = document.getElementById('decod-dificil-ascii')?.style.display !== 'none';
    const metodoBase64 = document.getElementById('decod-dificil-base64')?.style.display !== 'none';
    const resultado = document.getElementById('decod-resultado');

    if (metodoCesar) {
        const input = document.getElementById('decod-dificil-cesar-input')?.value;
        const shift = parseInt(document.getElementById('decod-dificil-shift')?.value || 0);
        if (!input) {
            resultado.innerHTML = '⚠️ Digite uma mensagem!';
            return;
        }
        const decoded = decodificarCesar(input, shift);
        resultado.innerHTML = decoded;
        showDecodedInfoIfCorrect(decoded, 'decoded-info-decod');
    }
    else if (metodoAscii) {
        const input = document.getElementById('decod-dificil-ascii-input')?.value;
        if (!input) {
            resultado.innerHTML = '⚠️ Digite códigos ASCII!';
            return;
        }
        const decoded = decodificarASCII(input);
        resultado.innerHTML = decoded;
        showDecodedInfoIfCorrect(decoded, 'decoded-info-decod');
    }
    else if (metodoBase64) {
        const input = document.getElementById('decod-dificil-base64-input')?.value;
        if (!input) {
            resultado.innerHTML = '⚠️ Digite um texto Base64!';
            return;
        }
        const decoded = decodificarBase64(input);
        resultado.innerHTML = decoded;
        showDecodedInfoIfCorrect(decoded, 'decoded-info-decod');
    }
    else {
        resultado.innerHTML = '❌ Selecione um método primeiro!';
    }

    if (SoundSystem) SoundSystem.click();
}

function decodificarCesar(texto, shift) {
    try {
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
        return resultado;
    } catch (e) {
        return '❌ Erro na decodificação';
    }
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

// ============================================
// RÉGUA PRECISA ALINHADA AO SLIDER
// ============================================
function buildAlignedRulers() {
    document.querySelectorAll('.shift-ruler[data-slider]').forEach(ruler => {
        const sliderId = ruler.getAttribute('data-slider');
        const slider = document.getElementById(sliderId);
        ruler.innerHTML = '';
        for (let i = -25; i <= 25; i++) {
            const tick = document.createElement('span');
            const isMajor = i === 0 || i % 5 === 0 || i === -25 || i === 25;
            tick.className = 'tick' + (i === 0 ? ' zero' : '') + (isMajor ? '' : ' minor');
            tick.dataset.value = i;
            // posição percentual proporcional (0 -> -25, 50% -> 0, 100% -> +25)
            const pct = ((i + 25) / 50) * 100;
            tick.style.left = `${pct}%`;
            tick.textContent = isMajor ? i : '';
            ruler.appendChild(tick);
        }
        highlightRulerTick(slider, ruler);
        if (slider) {
            slider.addEventListener('input', () => highlightRulerTick(slider, ruler));
        }
    });
}

function highlightRulerTick(slider, ruler) {
    if (!slider || !ruler) return;
    const val = parseInt(slider.value || 0, 10);
    ruler.querySelectorAll('.tick').forEach(t => {
        const tickVal = parseInt(t.dataset.value, 10);
        t.classList.toggle('active', tickVal === val);
    });
}

// ============================================
// AVISO RÁPIDO DE SOM
// ============================================
function showSoundToast() {
    const KEY = nsKey('jb_sound_tip_v3');
    if (soundTipShown || localStorage.getItem(KEY)) return;
    soundTipShown = true;
    localStorage.setItem(KEY, '1');

    const toast = document.createElement('div');
    toast.id = 'sound-toast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: rgba(0,0,0,0.8);
        color: #00ffff;
        padding: 12px 16px;
        border-radius: 10px;
        border: 2px solid #00ffff;
        box-shadow: 0 8px 20px rgba(0,0,0,0.4);
        z-index: 20000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
    `;
    toast.innerHTML = `
        🔊 Som ligado! <button id="sound-toast-btn" style="
            background:#00ffff; color:black; border:none;
            padding:4px 10px; border-radius:8px; cursor:pointer; font-weight:700;
        ">Entendi</button>
    `;
    document.body.appendChild(toast);

    const close = () => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    };
    document.getElementById('sound-toast-btn').onclick = close;
    setTimeout(close, 3000);
}

// ============================================
// LOJA / ECONOMIA DE SKINS
// ============================================
const SkinStore = {
    skins: [
        { id: 'neon', nome: 'Neon Grid', precoBtc: 0.02000000, desc: 'Ciano e magenta pulsando em grade futurista.' },
        { id: 'midnight', nome: 'Midnight Blue', precoBtc: 0.01500000, desc: 'Azul profundo com bordas frias.' },
        { id: 'sunset', nome: 'Sunset', precoBtc: 0.01800000, desc: 'Gradiente quente laranja/dourado.' },
        { id: 'matrix', nome: 'Matrix Code', precoBtc: 0.02200000, desc: 'Verde neon com faixas de código caindo.' },
        { id: 'lava', nome: 'Lava Core', precoBtc: 0.02100000, desc: 'Vermelho/âmbar incandescente com glow.' },
        { id: 'ice', nome: 'Ice Shards', precoBtc: 0.01900000, desc: 'Azul-gelo translúcido com brilho cristal.' },
        { id: 'aurora', nome: 'Aurora Rose', precoBtc: 0.02050000, desc: 'Lilas com rosa neon e brilho boreal.' },
        { id: 'cyberpink', nome: 'Cyber Pink', precoBtc: 0.02150000, desc: 'Rosa choque com linhas ciano.' },
        { id: 'galaxy', nome: 'Galaxy Glow', precoBtc: 0.02250000, desc: 'Roxo profundo com estrelas cintilantes.' },
        { id: 'goldpulse', nome: 'Gold Pulse', precoBtc: 0.02300000, desc: 'Ouro vibrante com pulso luminoso.' },
        { id: 'grafite', nome: 'Grafite', precoBtc: 0.02400000, desc: 'Design minimalista, metálico e grafite escuro.' },
        // Skins lendárias: só liberam em cadeia bronze -> prata -> ouro após comprar todas as anteriores
        { id: 'bronze', nome: 'Bronze Prime', precoBtc: 0.03000000, desc: 'Tom metálico âmbar, brilho quente em todo o jogo.' },
        { id: 'silver', nome: 'Silver Nova', precoBtc: 0.03300000, desc: 'Prata cintilante com reflexos frios cobrindo toda a interface.' },
        { id: 'goldultimate', nome: 'Aurum Supreme', precoBtc: 0.03800000, desc: 'Ouro profundo e luminoso que tinge todos os elementos.' }
    ],

    load() {
        try {
            const o = JSON.parse(localStorage.getItem(nsKey('skins_owned')) || '[]');
            skinsOwned = new Set(o);
        } catch { skinsOwned = new Set(); }
        skinAtiva = localStorage.getItem(nsKey('skin_active'));
        if (skinAtiva) this.apply(skinAtiva, false);
        CoinStore.load();
        this.initTabs();
    },

    save() {
        localStorage.setItem(nsKey('skins_owned'), JSON.stringify(Array.from(skinsOwned)));
        if (skinAtiva) localStorage.setItem(nsKey('skin_active'), skinAtiva);
    },

    open() {
        const modal = document.getElementById('skins-modal');
        if (!modal) return;
        this.render();
        CoinStore.render();
        modal.style.display = 'flex';
    },

    close() {
        const modal = document.getElementById('skins-modal');
        if (modal) modal.style.display = 'none';
    },

    render() {
        const list = document.getElementById('skins-list');
        if (!list) return;
        list.innerHTML = '';
        this.skins.forEach(s => {
            const owned = skinsOwned.has(s.id);
            const active = skinAtiva === s.id;
            const unlocked = this.isUnlocked(s.id);
            const card = document.createElement('div');
            card.className = 'skin-card';
            card.innerHTML = `
                <div class="skin-preview" data-skin-prev="${s.id}" style="background:${this.previewColor(s.id)};"></div>
                <div class="skin-info">
                    <h4>${s.nome} ${active ? '✅' : ''}</h4>
                    <div style="font-size:0.9em; opacity:0.9;">${s.desc}</div>
                    <div style="margin-top:6px; color:#ffd180;">Preço: ${s.precoBtc.toFixed(8)} BTC</div>
                    ${!unlocked ? `<div style="color:#ffcccb;font-size:0.9em;margin-top:4px;">Bloqueada: compre todas as skins anteriores.</div>` : ''}
                </div>
                <div class="skin-actions">
                    ${owned ? `<button class="skin-apply" data-apply="${s.id}">Usar</button>` :
                    unlocked ? `<button class="skin-buy" data-buy="${s.id}">Comprar</button>` :
                        `<button class="skin-locked" disabled>Bloqueada</button>`}
                </div>
            `;
            list.appendChild(card);
        });

        list.querySelectorAll('[data-buy]').forEach(btn => {
            btn.onclick = () => this.buy(btn.getAttribute('data-buy'));
        });
        list.querySelectorAll('[data-apply]').forEach(btn => {
            btn.onclick = () => this.apply(btn.getAttribute('data-apply'));
        });
    },

    previewColor(id) {
        if (id === 'neon') return 'linear-gradient(135deg, #00ffff, #ff00ff)';
        if (id === 'midnight') return 'linear-gradient(135deg, #071423, #0d2337 60%, #040b13)';
        if (id === 'sunset') return 'linear-gradient(135deg, #ff9966 0%, #ff5e62 50%, #ffa751 100%)';
        if (id === 'matrix') return 'linear-gradient(180deg, rgba(0,26,15,0.95), rgba(0,41,25,0.95)), repeating-linear-gradient(180deg, rgba(0,255,128,0.35) 0 6px, transparent 6px 12px)';
        if (id === 'lava') return 'linear-gradient(135deg, #ff1f00 0%, #ff6a00 45%, #ffd200 100%)';
        if (id === 'ice') return 'linear-gradient(135deg, #a8f0ff 0%, #d7f5ff 45%, #8fe4ff 100%)';
        if (id === 'aurora') return 'linear-gradient(135deg, #b832fa, #ff6ec7)';
        if (id === 'cyberpink') return 'linear-gradient(135deg, #ff3cac 0%, #784ba0 50%, #2b86c5 100%)';
        if (id === 'galaxy') return 'radial-gradient(circle at 30% 30%, #ffe1ff, #7a1fa2 40%, #0b1021)';
        if (id === 'goldpulse') return 'linear-gradient(135deg, #ffdd55, #ff8800)';
        if (id === 'grafite') return 'linear-gradient(135deg, #3a3f47, #1b1d22)';
        if (id === 'bronze') return 'linear-gradient(135deg, #8c6239, #d6a36a)';
        if (id === 'silver') return 'linear-gradient(135deg, #b9c4d9, #e8ecf5)';
        if (id === 'goldultimate') return 'linear-gradient(135deg, #c4952f, #f8d775)';
        return '#888';
    },

    isUnlocked(id) {
        // Ordem: comprar todas as skins comuns -> libera Bronze -> libera Silver -> libera Gold Ultimate
        if (id === 'bronze') {
            const comuns = this.skins.filter(s => !['bronze', 'silver', 'goldultimate'].includes(s.id));
            return comuns.every(s => skinsOwned.has(s.id));
        }
        if (id === 'silver') return skinsOwned.has('bronze');
        if (id === 'goldultimate') return skinsOwned.has('silver');
        return true;
    },

    initTabs() {
        if (this.tabsReady) return;
        this.tabsReady = true;
        const tabs = document.querySelectorAll('#skins-tabs button');
        const skinsList = document.getElementById('skins-list');
        const coinsList = document.getElementById('coins-list');
        tabs.forEach(btn => {
            btn.onclick = () => {
                tabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const tab = btn.getAttribute('data-tab');
                if (tab === 'skins') {
                    if (skinsList) skinsList.style.display = 'block';
                    if (coinsList) coinsList.style.display = 'none';
                    this.render();
                } else {
                    if (skinsList) skinsList.style.display = 'none';
                    if (coinsList) coinsList.style.display = 'block';
                    CoinStore.render();
                }
            };
        });
    },

    checkSkinsAchievement() {
        if (!RankingSystem || !RankingSystem.getCurrentPlayerName) return;
        if (skinsOwned.size !== this.skins.length) return;
        const nome = RankingSystem.getCurrentPlayerName();
        const conquista = {
            id: 'skins_master',
            titulo: 'Colecionador de Skins',
            icone: '🎖️',
            descricao: 'Comprou todas as skins'
        };
        const adicionou = RankingSystem.adicionarConquista(nome, conquista);
        if (adicionou) {
            mostrarMensagemLateral('🎖️ Colecionador de Skins: comprou todas!', 'bonus', 3500);
        }
    },

    buy(id) {
        const skin = this.skins.find(s => s.id === id);
        if (!skin) return;
        if (!this.isUnlocked(id)) {
            alert('Esta skin só libera após comprar todas as anteriores na ordem bronze → prata → ouro.');
            return;
        }
        if (skinsOwned.has(id)) { this.apply(id); return; }
        if (bitcoinQuantity < skin.precoBtc) {
            alert('BTC insuficiente para comprar esta skin.');
            return;
        }
        bitcoinQuantity -= skin.precoBtc;
        updateBitcoinValue(false);
        skinsOwned.add(id);
        this.apply(id);
        this.save();
        this.render();
        if (SoundSystem) SoundSystem.play('conquest');
        mostrarMensagemLateral(`🎨 Skin comprada: ${skin.nome}`, 'bonus', 2500);
        this.checkSkinsAchievement();
    },

    apply(id, persist = true) {
        document.body.setAttribute('data-skin', id);
        skinAtiva = id;
        if (persist) this.save();
    }
};
// ============================================
// CHAT INTERATIVO LOCAL + ENTRE JOGADORES (MESMO NAVEGADOR)
// ============================================
const CHAT_STORAGE_KEY = 'jb_chat_messages';

function loadChatMessages() {
    try {
        return JSON.parse(localStorage.getItem(nsKey(CHAT_STORAGE_KEY)) || '[]');
    } catch {
        return [];
    }
}

function saveChatMessages(msgs) {
    localStorage.setItem(nsKey(CHAT_STORAGE_KEY), JSON.stringify(msgs.slice(-100))); // limita a 100
}

function ensureChatUsername() {
    if (chatUsername) return chatUsername;
    if (currentUser?.username) {
        chatUsername = currentUser.username;
        localStorage.setItem(nsKey('jb_chat_username'), chatUsername);
        return chatUsername;
    }
    const saved = localStorage.getItem(nsKey('jb_chat_username'));
    if (saved) {
        chatUsername = saved;
        return chatUsername;
    }
    const random = Math.floor(Math.random() * 900) + 100;
    chatUsername = `Jogador-${random}`;
    localStorage.setItem(nsKey('jb_chat_username'), chatUsername);
    return chatUsername;
}

function initGameChat() {
    const toggle = document.getElementById('chat-toggle');
    const box = document.getElementById('chat-box');
    const closeBtn = document.getElementById('chat-close');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const list = document.getElementById('chat-messages');
    const hint = document.getElementById('chat-hint');
    const header = document.getElementById('chat-header');
    if (!toggle || !box || !closeBtn || !input || !sendBtn || !list) return;

    const name = ensureChatUsername();
    if (header) header.querySelector('span').textContent = `Chat do Jogo (Você: ${name})`;
    if (hint) hint.textContent = 'Digite ? para dicas automáticas; mensagens comuns são vistas por quem estiver em outras abas/janela.';

    const addMsg = (text, from = 'bot') => {
        const div = document.createElement('div');
        div.className = `chat-msg ${from}`;
        div.innerHTML = text;
        list.appendChild(div);
        list.scrollTop = list.scrollHeight;
    };

    const dicasRapidas = [
        'Use “Usar e Enviar” no decodificador para copiar direto para a resposta.',
        'Se errar duas vezes, o jogo mostra uma dica automática no campo de resultado.',
        'Quer pausar o tempo? Abra a Enciclopédia; os timers ficam pausados até fechá-la.',
        'No fácil, a chave de César está entre -25 e 25. Teste 3, 13 e 5 primeiro.',
        'Blocos quebrados aparecem no “Simulador Blockchain” com hash, nonce e minerador.',
        'Lives baixas? Priorize problemas tipo ASCII ou Base64, costumam ser mais curtos.',
        'Complete todos os verbetes da enciclopédia para ganhar a conquista 📚 Mente Enciclopédica.'
    ];

    const quickReply = (text) => {
        const lower = text.toLowerCase();
        const difLabel = dificuldadeAtual?.toUpperCase?.() || 'FÁCIL';
        const tempo = typeof remainingTime === 'number' ? `${remainingTime}s restantes` : 'tempo n/d';
        const blocoInfo = `${currentProblem}/${TamMax}`;
        const vidasInfo = `${vidas}/3`;
        const tipo = problemaAtual?.tipo || 'cesar/ascii/base64';
        const erros = errosConsecutivos || 0;
        const contexto = `Dificuldade: ${difLabel} | Vidas: ${vidasInfo} | Bloco: ${blocoInfo} | Tempo: ${tempo} | Tipo atual: ${tipo}`;

        if (lower.includes('regra') || lower.includes('como joga') || lower.includes('objetivo')) {
            return `Objetivo: quebrar ${TamMax} blocos resolvendo o enigma criptográfico. Use o decodificador (César, ASCII ou Base64) para achar a resposta, clique “Usar e Enviar” e valide. Cada acerto minera um bloco e registra hash. ${contexto}`;
        }
        if (lower.includes('dica') || lower.includes('ajuda') || lower === '?' || lower.includes('help')) {
            return `Me diga o tema (tempo, vidas, chave, ASCII, Base64, hash, enciclopédia) ou pergunte “passo a passo”. ${contexto}`;
        }
        if (lower.includes('passo a passo')) {
            return `1) Abra o decodificador. 2) Preencha com o texto cifrado já mostrado no problema. 3) Escolha o método do nível (César/ASCII/Base64). 4) Ajuste a chave/slider (tente 3, 5 ou 13 em César). 5) Clique “Usar e Enviar” para colar no campo de resposta. 6) Validar. ${contexto}`;
        }
        if (lower.includes('tempo') || lower.includes('cron')) {
            return `Tempo: ${tempo}. No fácil é mais folgado; no médio/difícil acelera. Precisa pausar? Abra a Enciclopédia que os timers param.`;
        }
        if (lower.includes('vida')) {
            return `Vidas: ${vidasInfo}. Após 2 erros aparece dica automática. Se estiver com 1 vida, foque nos enigmas ASCII/Base64 (normalmente curtos).`;
        }
        if (lower.includes('hash')) {
            return `Cada bloco minerado aparece no “Simulador Blockchain” com hash, nonce, merkle e minerador. Quebre blocos para ver novos hashes.`;
        }
        if (lower.includes('chave') || lower.includes('cesar')) {
            return `César: tente shifts clássicos 3 (ROT3), 5 ou 13. Use o slider e veja o resultado no painel. O zero está centralizado na régua.`;
        }
        if (lower.includes('ascii')) {
            return `ASCII: cole números separados por espaço ou vírgula (ex: 66 105 116 99 111 105 110). Clique decodificar e depois “Usar e Enviar”.`;
        }
        if (lower.includes('base64')) {
            return `Base64: cole a string no nível difícil > método Base64, clique decodificar. Evite quebras de linha.`;
        }
        if (lower.includes('enciclop') || lower.includes('verbet')) {
            return `Abra a enciclopédia (botão 📚). Cada clique em verbete dá pontos/bitcoin e conta para a conquista 📚 Mente Enciclopédica ao visitar todos.`;
        }
        if (lower.includes('dificuldade')) {
            return `Fácil: 60s por bloco e apenas César. Médio: 45s, César/ASCII. Difícil: 30s, César/ASCII/Base64. ${contexto}`;
        }
        if (lower.includes('erro') || lower.includes('difícil')) {
            return `Erros seguidos (${erros})? Reveja o tipo do enigma: se o texto tem números separados por espaço, é ASCII; se tem letras misturadas, tente César; se parecer embaralhado com maiúsc/minúsc e “=”, teste Base64. ${contexto}`;
        }
        if (lower.includes('bloco') || lower.includes('progresso')) {
            return `Bloco atual: ${blocoInfo}. Cada acerto minera e aparece no simulador blockchain; a cada 6 blocos abre um capítulo da história do Bitcoin.`;
        }
        if (lower.includes('som') || lower.includes('audio')) {
            return `Sons: acerto, erro, vitória e blocos. Se quiser, podemos adicionar um botão de mute rápido; por enquanto use o volume do navegador.`;
        }
        if (lower.includes('ranking') || lower.includes('score')) {
            return `Score atual: ${score}. O ranking salva no final da partida; visite a enciclopédia e conclua metas para ganhar pontos extras.`;
        }
        if (lower.includes('capitulo') || lower.includes('historia')) {
            return `A cada 6 blocos liberamos um capítulo da história do Bitcoin. Falta pouco? Blocos: ${blocoInfo}.`;
        }
        if (lower.includes('conquista') || lower.includes('meta') || lower.includes('selo')) {
            return `Conquistas: metas de velocidade/speedrun/perfeição, 📚 Mente Enciclopédica (visite todos verbetes), Maestro das Criptos (0.05 de cada moeda) e Medalha Satoshi (100 blocos em Fácil, Médio e Difícil). Veja todas em 🏆.`;
        }
        if (lower.includes('moeda') || lower.includes('minera') || lower.includes('trocar')) {
            return `Moedas: escolha a ativa na aba Moedas. Minerar dá saldo nessa moeda. A carteira mostra todas (livre + carteira). Troque a ativa para minerar outro ativo.`;
        }
        if (lower.includes('carteira') || lower.includes('juros')) {
            return `Carteira 💼: guarda saldos por moeda, rende ~1% por hora. Deposite/saque na moeda ativa. Conquista “Maestro das Criptos” exige 0.05 de cada (livre+carteira).`;
        }
        if (lower.includes('skin')) {
            return `Skins: botão 🎨 abre a loja. Compre com BTC do jogo; conquista “Colecionador de Skins” ao comprar todas.`;
        }
        if (lower.includes('decode') || lower.includes('ferramenta') || lower.includes('circulo')) {
            return `Ferramentas de decode: Circulo de César e painel Decode (César/ASCII/Base64). Se não aparecerem, abra pelo menu “Ferramentas de Decodificação”.`;
        }
        if (lower.includes('chat')) {
            return `Chat: usa seu nome de perfil. “?texto” fala direto com o bot; sincroniza entre abas.`;
        }
        // fallback contextual com dica sorteada
        return 'Precisa de ajuda? Exemplos: regras, passo a passo, tempo, vidas, hash, chave/cesar, ASCII, Base64, enciclopédia, dificuldade, erro, bloco, som, ranking/score, capítulos, conquistas, moedas, carteira, skins, decode, chat. Prefixe com "?" para falar direto comigo.';
    };

    const renderMessages = () => {
        list.innerHTML = '';
        const msgs = loadChatMessages();
        msgs.forEach(m => {
            const cls = m.from === 'bot' ? 'bot' : (m.from === name ? 'user' : 'player');
            const label = m.from === 'bot' ? 'BOT' : m.from;
            addMsg(`<strong>${label}:</strong> ${m.text}`, cls);
        });
    };

    const sendPlayerMessage = (text) => {
        const msgs = loadChatMessages();
        msgs.push({ from: name, text, ts: Date.now() });
        saveChatMessages(msgs);
        renderMessages();
    };

    const handleSend = () => {
        const text = input.value.trim();
        if (!text) return;
        input.value = '';

        // Se começar com ?, trata como pedido ao bot
        if (text.startsWith('?')) {
            addMsg(`<strong>${name}:</strong> ${text.slice(1)}`, 'user');
            setTimeout(() => {
                addMsg(`<strong>BOT:</strong> ${quickReply(text)}`, 'bot');
            }, 200);
            return;
        }

        sendPlayerMessage(text);
        // Mesmo sem '?', o BOT responde com orientação contextual
        setTimeout(() => {
            addMsg(`<strong>BOT:</strong> ${quickReply(text)}`, 'bot');
        }, 180);
    };

    toggle.onclick = () => {
        const open = box.style.display === 'flex';
        box.style.display = open ? 'none' : 'flex';
        if (!open) input.focus();
    };

    closeBtn.onclick = () => box.style.display = 'none';
    sendBtn.onclick = handleSend;
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    addMsg('Bem-vindo ao chat! Digite normalmente para falar com outros jogadores (outras abas). Use ?texto para falar com o BOT.', 'bot');
    renderMessages();

    window.addEventListener('storage', (e) => {
        if (e.key && e.key.endsWith(CHAT_STORAGE_KEY)) renderMessages();
    });
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

document.addEventListener('DOMContentLoaded', function () {
    Auth.load();
    updateProfileUI();
    migrateLegacyData();

    // Configurações iniciais
    document.getElementById('problem-container').style.display = 'none';
    document.getElementById('hash-log').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('tipo-indicador').style.display = 'none';

    // Event listener para Enter
    const answerInput = document.getElementById('answer');
    if (answerInput) {
        answerInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && typeof submitAnswer === 'function') submitAnswer();
        });
    }

    // Inicializar sistemas
    updateVidasDisplay();
    CryptoEncyclopedia.init();
    BitcoinPriceWidget.init();
    RankingSystem.init();
    SoundSystem.init();

    // Sliders do decodificador
    buildAlignedRulers();

    const sliderFacil = document.getElementById('decod-facil-shift');
    if (sliderFacil) {
        sliderFacil.addEventListener('input', function (e) {
            document.getElementById('decod-facil-shift-value').textContent = e.target.value;
        });
    }

    const sliderMedio = document.getElementById('decod-medio-shift');
    if (sliderMedio) {
        sliderMedio.addEventListener('input', function (e) {
            document.getElementById('decod-medio-shift-value').textContent = e.target.value;
        });
    }

    const sliderDificil = document.getElementById('decod-dificil-shift');
    if (sliderDificil) {
        sliderDificil.addEventListener('input', function (e) {
            document.getElementById('decod-dificil-shift-value').textContent = e.target.value;
        });
    }

    // Chat interativo local
    initGameChat();

    // Loja de skins
    SkinStore.load();
    const skinsBtn = document.getElementById('skins-toggle');
    if (skinsBtn) skinsBtn.onclick = () => SkinStore.open();
    const skinsClose = document.getElementById('skins-close');
    if (skinsClose) skinsClose.onclick = () => SkinStore.close();

    // Carteira BTC
    Wallet.load();
    const walletBtn = document.getElementById('wallet-toggle');
    if (walletBtn) { walletBtn.onclick = () => Wallet.open(); walletBtn.style.display = 'none'; }
    const walletClose = document.getElementById('wallet-close');
    if (walletClose) walletClose.onclick = () => Wallet.close();
    const walletDeposit = document.getElementById('wallet-deposit');
    const walletWithdraw = document.getElementById('wallet-withdraw');
    const walletAccrue = document.getElementById('wallet-accrue');
    const walletInput = document.getElementById('wallet-amount');
    if (walletDeposit && walletInput) walletDeposit.onclick = () => Wallet.deposit(walletInput.value);
    if (walletWithdraw && walletInput) walletWithdraw.onclick = () => Wallet.withdraw(walletInput.value);
    if (walletAccrue) walletAccrue.onclick = () => { Wallet.accrue(); Wallet.render(); mostrarMensagemLateral('Rendimento atualizado!', 'bonus', 1800); };

    // Conquistas (visual)
    const achBtn = document.getElementById('achievements-toggle');
    const achClose = document.getElementById('achievements-close');
    if (achBtn) achBtn.onclick = () => AchievementsUI.open();
    if (achClose) achClose.onclick = () => AchievementsUI.close();

    // Perfil/Login
    const profileBtn = document.getElementById('profile-toggle');
    const profileModal = document.getElementById('profile-modal');
    const profileClose = document.getElementById('profile-close');
    const profileLogin = document.getElementById('profile-login');
    const profileRegister = document.getElementById('profile-register');
    const profileGuest = document.getElementById('profile-guest');
    const profileLogout = document.getElementById('profile-logout');
    const profileUser = document.getElementById('profile-username');
    const profilePass = document.getElementById('profile-password');
    const profileCurrent = document.getElementById('profile-current');
    const openProfile = () => {
        if (profileModal) profileModal.style.display = 'flex';
        if (profileCurrent) profileCurrent.textContent = currentUser?.username ? `Logado como: ${currentUser.username}` : 'Modo convidado';
    };
    if (profileBtn) profileBtn.onclick = openProfile;
    if (profileClose) profileClose.onclick = () => profileModal && (profileModal.style.display = 'none');
    if (profileLogin) profileLogin.onclick = () => Auth.login(profileUser.value.trim(), profilePass.value.trim());
    if (profileRegister) profileRegister.onclick = () => Auth.register(profileUser.value.trim(), profilePass.value.trim());
    if (profileGuest) profileGuest.onclick = () => Auth.useGuest();
    if (profileLogout) profileLogout.onclick = () => Auth.logout();
    // Se não houver usuário logado, sugere abrir o modal
    if (!currentUser && profileModal) {
        setTimeout(() => { profileModal.style.display = 'flex'; }, 600);
    }

    // Aviso rápido de som (exibe uma vez)
    setTimeout(showSoundToast, 400);

    // Esconder enciclopédia após 500ms
    setTimeout(() => {
        const enc = document.getElementById('crypto-encyclopedia');
        if (enc) enc.style.display = 'none';
    }, 500);

    startHomeBubbles();

    // Criar menu se não existir
    if (!document.getElementById('main-menu')) criarMenu();

    // Inicializar contador de visitas
    inicializarContadorVisitas();

    // NOVO: Criar botão de encerrar
    criarBotaoEncerrar();

    // NOVO: Verificar se há jogo salvo
    setTimeout(() => {
        const temSave = localStorage.getItem(getSaveKey());

        if (temSave) {
            // Perguntar se quer continuar
            const continuar = confirm('🔄 Há um jogo em andamento salvo!\n\nDeseja continuar de onde parou?');

            if (continuar) {
                carregarJogoSalvo();

                // Mostrar botão de encerrar
                const btnEncerrar = document.getElementById('btn-encerrar');
                if (btnEncerrar) btnEncerrar.style.display = 'block';
            } else {
                // Remover save se não quiser continuar
                localStorage.removeItem(getSaveKey());
            }
        }
    }, 1000);
});

function preencherTextoAtual() {
    if (!problemaAtual) {
        alert('⚠️ Nenhum problema ativo no momento. Inicie uma partida primeiro!');
        return false;
    }

    const textoCifrado = problemaAtual.textoCifrado;

    const nivelAtivo = document.querySelector('.decod-conteudo[style*="display: block"]')?.id;

    if (!nivelAtivo) return false;

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

    return true;
}

function usarResultadoNoJogo() {
    const resultado = document.getElementById('decod-resultado').innerText;

    if (!resultado || resultado.includes('Aguardando') || resultado.includes('⚠️') || resultado.includes('❌')) {
        alert('❌ Nenhum resultado válido para usar!');
        return;
    }

    if (jogoConcluido || vidas <= 0) {
        alert('❌ O jogo não está ativo no momento!');
        return;
    }

    const answerInput = document.getElementById('answer');
    if (answerInput) {
        answerInput.value = resultado;

        answerInput.style.borderColor = '#4CAF50';
        answerInput.style.boxShadow = '0 0 20px rgba(76,175,80,0.5)';
        setTimeout(() => {
            answerInput.style.borderColor = '';
            answerInput.style.boxShadow = '';
        }, 1500);

        answerInput.focus();

        if (SoundSystem) SoundSystem.correct();

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

        setTimeout(() => {
            if (msgSucesso.parentElement) msgSucesso.remove();
        }, 2000);
    }
}

function atualizarDecodificadorComProblema() {
    const modal = document.getElementById('decodificador-modal');
    if (!modal || modal.style.display !== 'flex') return;

    if (!problemaAtual) {
        document.getElementById('decod-resultado').innerHTML = '⚠️ Nenhum problema ativo. Inicie uma partida!';
        return;
    }

    document.getElementById('decod-resultado').innerHTML = 'Aguardando decodificação...';

    const chaveElement = document.getElementById('decodificador-chave');
    const chaveValorElement = document.getElementById('decodificador-chave-valor');
    if (chaveElement && chaveValorElement) {
        if (problemaAtual.tipo === 'cesar' && problemaAtual.chave !== undefined) {
            chaveValorElement.textContent = `${Math.abs(problemaAtual.chave)}${problemaAtual.chave > 0 ? ' →' : ' ←'}`;
            chaveElement.style.display = 'block';
        } else {
            chaveElement.style.display = 'none';
        }
    }

    const textoCifrado = problemaAtual.textoCifrado;

    const nivelAtivo = document.querySelector('.decod-conteudo[style*="display: block"]')?.id;

    if (!nivelAtivo) return;

    console.log(`🔄 Atualizando decodificador com: ${textoCifrado}`);

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

function onProblemaMudou() {
    atualizarDecodificadorComProblema();
}

let modoTesteAtivo = false;

function toggleModoTeste() {
    modoTesteAtivo = !modoTesteAtivo;

    const status = modoTesteAtivo ? 'ATIVADO' : 'DESATIVADO';
    const cor = modoTesteAtivo ? '#4CAF50' : '#f44336';

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

    if (SoundSystem) SoundSystem.click();
}

// ============================================
// GERADOR DE BLOCOS REALISTAS - VERSÃO CORRIGIDA (HEXADECIMAL)
// ============================================

let ultimosHashes = [];

function gerarBlocoRealista(numeroBloco, texto = '') {
    // Hash anterior (do último bloco, ou genesis se for o primeiro)
    const hashAnterior = ultimosHashes.length > 0
        ? ultimosHashes[ultimosHashes.length - 1].hash
        : '0000000000000000000000000000000000000000'; // Genesis hash (64 chars)

    // Gerar nonce aleatório (entre 0 e 4294967295 - 32 bits)
    const nonce = Math.floor(Math.random() * 4294967295);

    // Timestamp atual em segundos (Unix timestamp)
    const timestamp = Math.floor(Date.now() / 1000);

    // Dificuldade simulada (número de zeros à esquerda no hash)
    const dificuldade = 4; // 4 zeros = dificuldade baixa

    // Simular mineração: encontrar um hash com zeros à esquerda
    let hash = '';
    let tentativas = 0;
    const maxTentativas = 5000; // Evitar loop infinito

    const gerarHexAleatorio = (len) => {
        let s = '';
        for (let i = 0; i < len; i++) {
            s += Math.floor(Math.random() * 16).toString(16);
        }
        return s;
    };

    do {
        tentativas++;
        // Gera um hash pseudo-aleatório de 64 chars hex
        const base = gerarHexAleatorio(64);
        // Garante zeros à esquerda conforme dificuldade
        hash = '0'.repeat(dificuldade) + base.slice(dificuldade, 64);
    } while (hash.substring(0, dificuldade) !== '0'.repeat(dificuldade) && tentativas < maxTentativas);

    // Formatar hash em grupos de 2 caracteres para melhor visualização
    const hashFormatado = hash.match(/.{1,2}/g).join(' ');

    // Calcular merkle root (simulado)
    const merkleRoot = Array(8).fill(0).map(() =>
        Math.floor(Math.random() * 65536).toString(16).padStart(4, '0')
    ).join(' ');

    const bloco = {
        numero: numeroBloco,
        hashAnterior: hashAnterior,
        merkleRoot: merkleRoot,
        nonce: nonce + tentativas,
        timestamp: timestamp,
        hash: hashFormatado,
        dataHora: new Date(timestamp * 1000).toLocaleString('pt-BR'),
        tamanho: Math.floor(Math.random() * 500000) + 1000000, // 1MB a 1.5MB
        transacoes: Math.floor(Math.random() * 1000) + 500, // 500 a 1500 transações
        minerador: ['AntPool', 'F2Pool', 'ViaBTC', 'Binance Pool', 'Foundry USA'][Math.floor(Math.random() * 5)]
    };

    // Armazenar para próximo bloco (apenas o hash, sem formatação)
    ultimosHashes.push({
        numero: numeroBloco,
        hash: hash // hash sem formatação
    });

    // Manter apenas últimos 20 hashes na memória
    if (ultimosHashes.length > 20) {
        ultimosHashes.shift();
    }

    // Registrar no histórico completo (para recriar a cadeia ao retomar)
    blockchainHistory.push(bloco);

    return bloco;
}

// ============================================
// ADICIONAR BLOCO REALISTA - VERSÃO MELHORADA
// ============================================
function adicionarBlocoRealista(bloco) {
    const cadeia = document.getElementById('blockchain-cadeia');
    if (!cadeia) return;

    const blocoDiv = document.createElement('div');
    blocoDiv.className = 'bloco-blockchain';
    blocoDiv.setAttribute('data-numero', bloco.numero);
    blocoDiv.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border: 2px solid #f7931a;
        border-radius: 12px;
        padding: 18px;
        margin-bottom: 15px;
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
        color: #00ff00;
        box-shadow: 0 8px 25px rgba(247, 147, 26, 0.3);
        transition: all 0.3s ease;
        width: 100%;
        animation: novoBloco 0.5s ease-out;
        border-left: 6px solid #f7931a;
    `;

    // Determinar cor baseada na dificuldade
    const corDestaque = dificuldadeAtual === 'facil' ? '#4CAF50' :
        dificuldadeAtual === 'medio' ? '#FF9800' : '#f44336';

    blocoDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid rgba(255,255,255,0.1);">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="color: #f7931a; font-weight: bold; font-size: 1.3em;">⛓️ BLOCO #${bloco.numero}</span>
                <span style="background: ${corDestaque}; color: black; padding: 3px 10px; border-radius: 15px; font-size: 0.7em; font-weight: bold;">${dificuldadeAtual.toUpperCase()}</span>
            </div>
            <span style="color: #888; font-size: 0.8em;">⏱️ ${bloco.dataHora}</span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px;">
                <div style="color: #4CAF50; font-size: 0.8em; margin-bottom: 5px;">📦 HASH ANTERIOR</div>
                <div style="color: #00ff00; font-family: monospace; font-size: 0.8em; word-break: break-all;">${bloco.hashAnterior}</div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px;">
                <div style="color: #FF9800; font-size: 0.8em; margin-bottom: 5px;">🌳 MERKLE ROOT</div>
                <div style="color: #ffaa00; font-family: monospace; font-size: 0.8em; word-break: break-all;">${bloco.merkleRoot}</div>
            </div>
        </div>
        
        <div style="display: flex; gap: 20px; margin: 15px 0; padding: 10px; background: rgba(247,147,26,0.1); border-radius: 8px;">
            <div>
                <div style="color: #888; font-size: 0.7em;">⚡ NONCE</div>
                <div style="color: #f7931a; font-weight: bold;">${bloco.nonce.toLocaleString()}</div>
            </div>
            <div>
                <div style="color: #888; font-size: 0.7em;">📅 TIMESTAMP</div>
                <div style="color: white;">${bloco.timestamp}</div>
            </div>
            <div>
                <div style="color: #888; font-size: 0.7em;">📊 TAMANHO</div>
                <div style="color: white;">${(bloco.tamanho / 1000000).toFixed(2)} MB</div>
            </div>
            <div>
                <div style="color: #888; font-size: 0.7em;">🔄 TRANSAÇÕES</div>
                <div style="color: white;">${bloco.transacoes.toLocaleString()}</div>
            </div>
        </div>
        
        <div style="border-left: 4px solid ${corDestaque}; padding-left: 15px; margin-top: 10px;">
            <div style="color: ${corDestaque}; font-size: 0.9em; margin-bottom: 5px; display: flex; justify-content: space-between;">
                <span>🔑 HASH DO BLOCO</span>
                <span style="color: #888; font-size: 0.7em;">⛏️ ${bloco.minerador}</span>
            </div>
            <div style="color: #00ff00; font-weight: bold; font-family: monospace; font-size: 1em; word-break: break-all; background: rgba(0,255,0,0.05); padding: 10px; border-radius: 5px;">
                ${bloco.hash}
            </div>
        </div>
        
        <div style="margin-top: 15px; font-size: 0.7em; color: #666; text-align: right;">
            🔒 ${bloco.hash.substring(0, 10)}... ${bloco.hash.substring(bloco.hash.length - 10)}
        </div>
    `;

    // Inserir no TOPO (bloco mais recente primeiro)
    if (cadeia.firstChild) {
        cadeia.insertBefore(blocoDiv, cadeia.firstChild);
    } else {
        cadeia.appendChild(blocoDiv);
    }

    // Manter apenas os 15 blocos mais recentes
    while (cadeia.children.length > 15) {
        cadeia.removeChild(cadeia.lastChild);
    }

    // Debug
    console.log(`✅ Bloco #${bloco.numero} minerado:`, {
        hash: bloco.hash,
        nonce: bloco.nonce,
        minerador: bloco.minerador
    });
}

// ============================================
// FUNÇÃO PARA GERAR HASH SHA-256 REAL (OPCIONAL)
// ============================================
async function gerarHashSHA256(dados) {
    if (window.crypto && window.crypto.subtle) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(dados);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        } catch (e) {
            console.warn('Crypto API falhou, usando simulação');
            return null;
        }
    }
    return null;
}

// ============================================
// MODIFICAR updateHashLog PARA USAR O NOVO SISTEMA
// ============================================
function updateHashLog(blockNumber) {
    // Gerar bloco realista com hash hexadecimal
    const bloco = gerarBlocoRealista(blockNumber, problemaAtual?.textoCifrado || '');

    // Adicionar à blockchain visual
    adicionarBlocoRealista(bloco);

    // Também manter o log simples (opcional)
    const hashDisplay = document.getElementById('hash-display');
    if (hashDisplay) {
        if (hashDisplay.textContent.trim() === "Nenhum bloco quebrado ainda.") {
            hashDisplay.innerHTML = '';
        }

        const el = document.createElement('div');
        el.className = 'hash-box';
        el.style.cssText = `
            background: rgba(0,0,0,0.7);
            border-left: 4px solid #f7931a;
            padding: 10px 15px;
            margin: 8px 0;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 0.85em;
            color: #00ff00;
            box-shadow: 0 2px 10px rgba(247,147,26,0.2);
        `;

        // Mostrar informações resumidas
        el.innerHTML = `
            <div style="display: flex; justify-content: space-between;">
                <span>⛓️ BLOCO #${blockNumber}</span>
                <span style="color: #888;">${bloco.minerador}</span>
            </div>
            <div style="font-size: 0.8em; color: #4CAF50;">${bloco.hash}</div>
        `;

        // Inserir no topo
        if (hashDisplay.firstChild) {
            hashDisplay.insertBefore(el, hashDisplay.firstChild);
        } else {
            hashDisplay.appendChild(el);
        }

        // Manter apenas últimos 8
        while (hashDisplay.children.length > 8) {
            hashDisplay.removeChild(hashDisplay.lastChild);
        }
    }
}

const startGameOriginal = startGame;
startGame = function (difficulty) {
    const wasLogged = !!currentUser;
    startGameOriginal(difficulty);
    if (!currentUser || !wasLogged) return; // não iniciar timers se não logou

    setTimeout(() => {
        if (!currentUser) return;
        if (typeof iniciarTimerGlobal === 'function') {
            iniciarTimerGlobal(true); // reseta para novo jogo
            console.log('⏱️ Timer reiniciado após startGame');
        }

        const tempoDisplay = document.getElementById('tempo-global');
        if (tempoDisplay) {
            tempoDisplay.style.display = 'flex';
        }
    }, 500);
};

if (typeof iniciarTimerGlobal !== 'function') {
    iniciarTimerGlobal = function () {
        if (timerGlobalInterval) clearInterval(timerGlobalInterval);

        tempoInicioPartida = Date.now();

        timerGlobalInterval = setInterval(() => {
            if (!jogoConcluido) {
                tempoTotalPartida = Math.floor((Date.now() - tempoInicioPartida) / 1000);

                const tempoDisplay = document.getElementById('tempo-global');
                if (tempoDisplay) {
                    const mins = Math.floor(tempoTotalPartida / 60);
                    const secs = tempoTotalPartida % 60;
                    tempoDisplay.innerHTML = `⏱️ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                }
            }
        }, 1000);
    };
}

setInterval(() => {
    const tempoDisplay = document.getElementById('tempo-global');
    if (tempoDisplay && tempoDisplay.style.display !== 'none' && tempoTotalPartida > 0) {
        const mins = Math.floor(tempoTotalPartida / 60);
        const secs = tempoTotalPartida % 60;
        tempoDisplay.innerHTML = `⏱️ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}, 1000);

setInterval(() => {
    if (jogoConcluido) return;
    console.log('⏱️ Status:', {
        tempo: tempoTotalPartida,
        ativo: !!timerGlobalInterval,
        inicio: tempoInicioPartida ? new Date(tempoInicioPartida).toLocaleTimeString() : 'null',
        jogo: jogoConcluido ? 'concluído' : 'ativo'
    });
}, 2000);

function forcarPreenchimentoDecodificador() {
    if (!problemaAtual) return;

    const textoCifrado = problemaAtual.textoCifrado;
    if (!textoCifrado) return;

    console.log('🔄 Forçando preenchimento do decodificador com:', textoCifrado);

    const chaveElement = document.getElementById('decodificador-chave');
    const chaveValorElement = document.getElementById('decodificador-chave-valor');
    if (chaveElement && chaveValorElement) {
        if (problemaAtual.tipo === 'cesar' && problemaAtual.chave !== undefined) {
            chaveValorElement.textContent = `${Math.abs(problemaAtual.chave)}${problemaAtual.chave > 0 ? ' →' : ' ←'}`;
            chaveElement.style.display = 'block';
        } else {
            chaveElement.style.display = 'none';
        }
    }

    const facilInput = document.getElementById('decod-facil-input');
    if (facilInput) facilInput.value = textoCifrado;

    const medioCesarInput = document.getElementById('decod-medio-cesar-input');
    if (medioCesarInput) medioCesarInput.value = textoCifrado;

    const medioAsciiInput = document.getElementById('decod-medio-ascii-input');
    if (medioAsciiInput && problemaAtual.tipo === 'ascii') {
        medioAsciiInput.value = textoCifrado;
    }

    const dificilCesarInput = document.getElementById('decod-dificil-cesar-input');
    if (dificilCesarInput) dificilCesarInput.value = textoCifrado;

    const dificilAsciiInput = document.getElementById('decod-dificil-ascii-input');
    if (dificilAsciiInput && problemaAtual.tipo === 'ascii') {
        dificilAsciiInput.value = textoCifrado;
    }

    const dificilBase64Input = document.getElementById('decod-dificil-base64-input');
    if (dificilBase64Input && problemaAtual.tipo === 'base64') {
        dificilBase64Input.value = textoCifrado;
    }
}

const displayNextProblemOriginal = displayNextProblem;
displayNextProblem = function () {
    if (displayNextProblemOriginal) displayNextProblemOriginal();

    const modal = document.getElementById('decodificador-modal');
    if (modal && modal.style.display === 'flex') {
        setTimeout(() => {
            forcarPreenchimentoDecodificador();
        }, 300);
    }
};

function usarResultadoEEnviar() {
    const resultado = document.getElementById('decod-resultado').innerText;

    if (!resultado || resultado.includes('Aguardando') || resultado.includes('⚠️') || resultado.includes('❌')) {
        alert('❌ Nenhum resultado válido para usar!');
        return;
    }

    if (jogoConcluido || vidas <= 0) {
        alert('❌ O jogo não está ativo no momento!');
        return;
    }

    const answerInput = document.getElementById('answer');
    if (answerInput) {
        answerInput.value = resultado;

        answerInput.style.borderColor = '#4CAF50';
        answerInput.style.boxShadow = '0 0 20px rgba(76,175,80,0.5)';

        const msgSucesso = document.createElement('div');
        msgSucesso.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #4CAF50;
            color: white;
            padding: 20px 40px;
            border-radius: 50px;
            font-size: 1.5em;
            font-weight: bold;
            z-index: 40000;
            box-shadow: 0 0 50px rgba(76,175,80,0.8);
            animation: fadeOut 2s forwards;
        `;
        msgSucesso.textContent = '✅ RESPOSTA ENVIADA!';
        document.body.appendChild(msgSucesso);

        setTimeout(() => msgSucesso.remove(), 1500);

        setTimeout(() => {
            submitAnswer();
        }, 300);

        if (SoundSystem) SoundSystem.correct();
    }
}

console.log('✅ JogoBitcoin carregado com sucesso!');
console.log('✅ Sistema de salvamento ativado!');
console.log('✅ Botão de encerrar partida criado!');
console.log(`💰 Bitcoin atual: ${bitcoinQuantity.toFixed(8)} BTC`);

function testarConquista() {
    console.log('🧪 Testando conquista...');

    const metaTeste = {
        id: 'velocidade_5',
        nome: '⚡ Minerador Relâmpago (Teste)',
        icone: '⚡',
        descricao: 'Teste de conquista',
        recompensa: { pontos: 500, bitcoin: 0.00000200, titulo: 'Minerador Relâmpago' }
    };

    alcançarMeta(metaTeste);
}
// Intercepte o evento de teclado
document.addEventListener("keydown", (e) => {
    if (e.key === "F5") {
        e.preventDefault(); // Impede o recarregamento
        //alert("Use o botão de salvar do jogo!");
    }
});
