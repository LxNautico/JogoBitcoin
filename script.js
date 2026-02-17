// ============================================
// VARIÁVEIS GLOBAIS DO JOGO
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

// Variáveis para o sistema de criptografia
let problemaAtual = null;
let errosConsecutivos = 0;
let dificuldadeAtual = 'facil';

// ============================================
// ENCICLOPÉDIA CRIPTO EXPANDIDA
// ============================================

const CryptoEncyclopedia = {
    // Dados expandidos da enciclopédia (100+ entradas)
    entries: {
        // Criptomoedas Principais (20)
        'Bitcoin': {
            description: 'A primeira e mais valiosa criptomoeda, criada por Satoshi Nakamoto em 2008. Blockchain proof-of-work, limite de 21 milhões.',
            link: 'https://pt.wikipedia.org/wiki/Bitcoin',
            category: 'Criptomoeda'
        },
        'Ethereum': {
            description: 'Plataforma para contratos inteligentes e aplicações descentralizadas (dApps). Criada por Vitalik Buterin em 2015.',
            link: 'https://pt.wikipedia.org/wiki/Ethereum',
            category: 'Plataforma'
        },
        'Binance Coin': {
            description: 'Token nativo da exchange Binance, usado para pagar taxas e participar do ecossistema Binance.',
            link: 'https://pt.wikipedia.org/wiki/Binance',
            category: 'Exchange Token'
        },
        'Solana': {
            description: 'Blockchain de alta performance com consenso proof-of-history, conhecida por transações rápidas e baixo custo.',
            link: 'https://en.wikipedia.org/wiki/Solana_(blockchain_platform)',
            category: 'Blockchain'
        },
        'Cardano': {
            description: 'Plataforma blockchain com foco em segurança e sustentabilidade, desenvolvida com métodos científicos.',
            link: 'https://pt.wikipedia.org/wiki/Cardano_(blockchain)',
            category: 'Plataforma'
        },
        'Ripple': {
            description: 'Tecnologia de pagamento e rede de câmbio digital, focada em transações financeiras internacionais.',
            link: 'https://pt.wikipedia.org/wiki/Ripple',
            category: 'Pagamentos'
        },
        'Polkadot': {
            description: 'Protocolo multi-chain que permite interoperabilidade entre diferentes blockchains.',
            link: 'https://en.wikipedia.org/wiki/Polkadot_(cryptocurrency)',
            category: 'Interoperabilidade'
        },
        'Dogecoin': {
            description: 'Criptomoeda baseada no meme Doge, inicialmente criada como piada, ganhou popularidade significativa.',
            link: 'https://pt.wikipedia.org/wiki/Dogecoin',
            category: 'Memecoin'
        },
        'Shiba Inu': {
            description: 'Token inspirado no Dogecoin, conhecido como "Dogecoin Killer", com ecossistema DeFi próprio.',
            link: 'https://en.wikipedia.org/wiki/Shiba_Inu_(cryptocurrency)',
            category: 'Memecoin'
        },
        'Avalanche': {
            description: 'Plataforma blockchain com consenso inovador, focada em escalabilidade e customização.',
            link: 'https://en.wikipedia.org/wiki/Avalanche_(blockchain_platform)',
            category: 'Plataforma'
        },
        
        // Tecnologias e Conceitos (30)
        'Blockchain': {
            description: 'Tecnologia de registro distribuído e descentralizado que armazena transações em blocos encadeados.',
            link: 'https://pt.wikipedia.org/wiki/Blockchain',
            category: 'Tecnologia'
        },
        'Smart Contract': {
            description: 'Contrato auto-executável com termos escritos em código, executado automaticamente na blockchain.',
            link: 'https://pt.wikipedia.org/wiki/Contrato_inteligente',
            category: 'Tecnologia'
        },
        'Proof of Work': {
            description: 'Mecanismo de consenso que requer poder computacional para validar transações e criar novos blocos.',
            link: 'https://pt.wikipedia.org/wiki/Proof-of-work',
            category: 'Consenso'
        },
        'Proof of Stake': {
            description: 'Mecanismo de consenso onde validadores são escolhidos com base na quantidade de moedas mantidas.',
            link: 'https://pt.wikipedia.org/wiki/Proof-of-stake',
            category: 'Consenso'
        },
        'Halving': {
            description: 'Evento periódico que reduz pela metade a recompensa por mineração de novos blocos.',
            link: 'https://pt.wikipedia.org/wiki/Halving',
            category: 'Evento'
        },
        'Wallet': {
            description: 'Software ou hardware que armazena chaves públicas e privadas para transacionar criptomoedas.',
            link: 'https://pt.wikipedia.org/wiki/Carteira_de_criptomoeda',
            category: 'Ferramenta'
        },
        'Miner': {
            description: 'Equipamento especializado que realiza o processo de mineração, validando transações na blockchain.',
            link: 'https://pt.wikipedia.org/wiki/Minerador_de_bitcoin',
            category: 'Hardware'
        },
        'Hash': {
            description: 'Função criptográfica que transforma dados de qualquer tamanho em uma string de tamanho fixo.',
            link: 'https://pt.wikipedia.org/wiki/Fun%C3%A7%C3%A3o_hash_criptogr%C3%A1fica',
            category: 'Criptografia'
        },
        'Token': {
            description: 'Representação digital de um ativo ou utilidade que existe em uma blockchain específica.',
            link: 'https://pt.wikipedia.org/wiki/Token_(ci%C3%AAncia_da_computa%C3%A7%C3%A3o)',
            category: 'Conceito'
        },
        'NFT': {
            description: 'Token não-fungível que representa propriedade única de um item digital ou físico na blockchain.',
            link: 'https://pt.wikipedia.org/wiki/Token_n%C3%A3o_fung%C3%ADvel',
            category: 'Token'
        },
        
        // DeFi e Finanças (20)
        'DeFi': {
            description: 'Sistema financeiro descentralizado que opera sem intermediários usando smart contracts.',
            link: 'https://pt.wikipedia.org/wiki/Finan%C3%A7as_descentralizadas',
            category: 'Ecossistema'
        },
        'Yield Farming': {
            description: 'Prática de obter retornos emprestando ou fornecendo liquidez a protocolos DeFi.',
            link: 'https://en.wikipedia.org/wiki/Yield_farming',
            category: 'DeFi'
        },
        'Liquidity Pool': {
            description: 'Pools de tokens bloqueados em smart contracts que facilitam negociação em exchanges descentralizadas.',
            link: 'https://en.wikipedia.org/wiki/Liquidity_pool',
            category: 'DeFi'
        },
        'Stablecoin': {
            description: 'Criptomoeda com valor estável, geralmente atrelada a uma moeda fiduciária como o dólar.',
            link: 'https://pt.wikipedia.org/wiki/Stablecoin',
            category: 'Criptomoeda'
        },
        'DAO': {
            description: 'Organização Autônoma Descentralizada, gerida por regras codificadas em smart contracts.',
            link: 'https://pt.wikipedia.org/wiki/Organiza%C3%A7%C3%A3o_aut%C3%B4noma_descentralizada',
            category: 'Governança'
        },
        
        // Exchanges (15)
        'Coinbase': {
            description: 'Uma das maiores exchanges de criptomoedas do mundo, fundada em 2012, com sede nos EUA.',
            link: 'https://pt.wikipedia.org/wiki/Coinbase',
            category: 'Exchange'
        },
        'Kraken': {
            description: 'Exchange americana fundada em 2011, conhecida por segurança e variedade de criptomoedas.',
            link: 'https://en.wikipedia.org/wiki/Kraken_(company)',
            category: 'Exchange'
        },
        'FTX': {
            description: 'Exchange fundada por Sam Bankman-Fried que faliu em 2022 após crise de liquidez.',
            link: 'https://pt.wikipedia.org/wiki/FTX',
            category: 'Exchange'
        },
        
        // Pessoas Importantes (15)
        'Satoshi Nakamoto': {
            description: 'Pseudônimo do criador (ou criadores) do Bitcoin, identidade desconhecida até hoje.',
            link: 'https://pt.wikipedia.org/wiki/Satoshi_Nakamoto',
            category: 'Pessoa'
        },
        'Vitalik Buterin': {
            description: 'Programador russo-canadense, co-fundador da Ethereum e da Bitcoin Magazine.',
            link: 'https://pt.wikipedia.org/wiki/Vitalik_Buterin',
            category: 'Pessoa'
        },
        'CZ': {
            description: 'Changpeng Zhao, fundador e ex-CEO da Binance, maior exchange de criptomoedas do mundo.',
            link: 'https://pt.wikipedia.org/wiki/Changpeng_Zhao',
            category: 'Pessoa'
        }
    },
    
    // Inicializar
    init: function() {
        this.createEncyclopedia();
        this.populateSelector();
        this.createSearchBar();
    },
    
    // Criar interface melhorada
    createEncyclopedia: function() {
        const container = document.createElement('div');
        container.id = 'crypto-encyclopedia';
        container.style.cssText = `
            position: fixed;
            left: 20px;
            bottom: 20px;
            width: 450px;
            height: 500px;
            background: linear-gradient(135deg, rgba(26, 26, 46, 0.98), rgba(40, 40, 60, 0.98));
            border: 2px solid #2196f3;
            border-radius: 15px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.6);
            z-index: 9998;
            display: none;
            backdrop-filter: blur(10px);
            font-family: 'Exo 2', sans-serif;
            overflow: hidden;
            flex-direction: column;
        `;
        
        container.innerHTML = `
            <!-- Cabeçalho -->
            <div style="
                padding: 20px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                background: rgba(0,0,0,0.2);
            ">
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 15px;
                ">
                    <h3 style="color: #2196f3; margin: 0; font-size: 1.4em;">
                        📚 Enciclopédia Cripto
                    </h3>
                    <button onclick="document.getElementById('crypto-encyclopedia').style.display='none'" 
                            style="
                                background: rgba(255,255,255,0.1);
                                border: none;
                                color: #aaa;
                                font-size: 1.5em;
                                cursor: pointer;
                                width: 40px;
                                height: 40px;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                transition: all 0.3s ease;
                            "
                            onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.color='white'"
                            onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.color='#aaa'">
                        ×
                    </button>
                </div>
                
                <!-- Barra de busca -->
                <div style="position: relative;">
                    <input type="text" id="crypto-search" placeholder="Buscar conceito..." style="
                        width: 100%;
                        padding: 12px 15px;
                        padding-left: 45px;
                        border-radius: 25px;
                        background: rgba(255,255,255,0.1);
                        border: 1px solid rgba(255,255,255,0.2);
                        color: white;
                        font-size: 1em;
                        outline: none;
                    ">
                    <div style="
                        position: absolute;
                        left: 15px;
                        top: 50%;
                        transform: translateY(-50%);
                        color: #888;
                    ">
                        🔍
                    </div>
                </div>
            </div>
            
            <!-- Corpo -->
            <div style="
                flex: 1;
                display: flex;
                overflow: hidden;
            ">
                <!-- Lista de conceitos -->
                <div id="crypto-list" style="
                    width: 200px;
                    border-right: 1px solid rgba(255,255,255,0.1);
                    overflow-y: auto;
                    background: rgba(0,0,0,0.1);
                ">
                    <!-- Lista será populada por JavaScript -->
                </div>
                
                <!-- Detalhes do conceito -->
                <div style="flex: 1; padding: 20px; overflow-y: auto;">
                    <div id="crypto-info" style="
                        min-height: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    ">
                        <div style="text-align: center; color: #888; padding: 40px 20px;">
                            <div style="font-size: 3em; margin-bottom: 20px; opacity: 0.3;">📖</div>
                            <div>Selecione um conceito da lista para aprender mais sobre criptomoedas e blockchain</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Rodapé -->
            <div style="
                padding: 15px 20px;
                border-top: 1px solid rgba(255,255,255,0.1);
                background: rgba(0,0,0,0.2);
                font-size: 0.9em;
                color: #888;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div id="entry-count">${Object.keys(this.entries).length} conceitos disponíveis</div>
                <a id="wiki-link" target="_blank" style="
                    color: #2196f3;
                    text-decoration: none;
                    display: none;
                    align-items: center;
                    gap: 8px;
                ">
                    📖 Wikipedia
                </a>
            </div>
        `;
        
        document.body.appendChild(container);
        
        // Botão de toggle melhorado
        this.createToggleButton();
        
        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && container.style.display === 'flex') {
                container.style.display = 'none';
                document.getElementById('encyclopedia-toggle').style.transform = 'scale(1)';
            }
        });
    },
    
    // Criar botão de toggle melhorado
    createToggleButton: function() {
        const button = document.createElement('button');
        button.id = 'encyclopedia-toggle';
        button.innerHTML = '📚';
        button.title = 'Enciclopédia Cripto';
        button.style.cssText = `
            position: fixed;
            left: 20px;
            bottom: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2196f3, #1976d2);
            color: white;
            border: 2px solid #64b5f6;
            font-size: 1.8em;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 6px 20px rgba(33, 150, 243, 0.5);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        button.onclick = () => {
            const encyclopedia = document.getElementById('crypto-encyclopedia');
            if (encyclopedia.style.display === 'flex') {
                encyclopedia.style.display = 'none';
                button.style.transform = 'scale(1)';
                button.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.5)';
            } else {
                encyclopedia.style.display = 'flex';
                button.style.transform = 'scale(1.1)';
                button.style.boxShadow = '0 10px 30px rgba(33, 150, 243, 0.7)';
                SoundSystem.click();
            }
        };
        
        button.onmouseover = () => {
            if (document.getElementById('crypto-encyclopedia').style.display !== 'flex') {
                button.style.transform = 'scale(1.1)';
                button.style.boxShadow = '0 10px 30px rgba(33, 150, 243, 0.7)';
            }
        };
        
        button.onmouseout = () => {
            if (document.getElementById('crypto-encyclopedia').style.display !== 'flex') {
                button.style.transform = 'scale(1)';
                button.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.5)';
            }
        };
        
        document.body.appendChild(button);
    },
    
    // Criar barra de busca
    createSearchBar: function() {
        const searchInput = document.getElementById('crypto-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterEntries(e.target.value.toLowerCase());
            });
        }
    },
    
    // Popular lista de conceitos
    populateSelector: function() {
        const listContainer = document.getElementById('crypto-list');
        if (!listContainer) return;
        
        // Ordenar entradas alfabeticamente
        const sortedEntries = Object.keys(this.entries).sort();
        
        // Agrupar por categoria
        const entriesByCategory = {};
        sortedEntries.forEach(key => {
            const category = this.entries[key].category;
            if (!entriesByCategory[category]) {
                entriesByCategory[category] = [];
            }
            entriesByCategory[category].push(key);
        });
        
        // Criar lista agrupada
        listContainer.innerHTML = '';
        
        Object.keys(entriesByCategory).sort().forEach(category => {
            // Cabeçalho da categoria
            const categoryHeader = document.createElement('div');
            categoryHeader.style.cssText = `
                padding: 12px 15px;
                background: rgba(0,0,0,0.2);
                color: #64b5f6;
                font-weight: bold;
                font-size: 0.9em;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                text-transform: uppercase;
                letter-spacing: 1px;
            `;
            categoryHeader.textContent = category;
            listContainer.appendChild(categoryHeader);
            
            // Itens da categoria
            entriesByCategory[category].forEach(key => {
                const item = document.createElement('div');
                item.style.cssText = `
                    padding: 12px 15px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: #ddd;
                    font-size: 0.95em;
                `;
                
                item.textContent = key;
                item.title = `Clique para ver detalhes sobre ${key}`;
                
                item.onmouseover = () => {
                    item.style.background = 'rgba(33, 150, 243, 0.1)';
                    item.style.color = '#fff';
                };
                
                item.onmouseout = () => {
                    item.style.background = 'transparent';
                    item.style.color = '#ddd';
                };
                
                item.onclick = () => {
                    // Remover seleção anterior
                    Array.from(listContainer.querySelectorAll('div')).forEach(el => {
                        el.style.background = 'transparent';
                        el.style.color = '#ddd';
                    });
                    
                    // Selecionar atual
                    item.style.background = 'rgba(33, 150, 243, 0.2)';
                    item.style.color = '#fff';
                    
                    this.showEntry(key);
                    SoundSystem.click();
                };
                
                listContainer.appendChild(item);
            });
        });
    },
    
    // Filtrar entradas
    filterEntries: function(searchTerm) {
        const listContainer = document.getElementById('crypto-list');
        const items = listContainer.querySelectorAll('div');
        
        items.forEach(item => {
            if (item.style.padding === '12px 15px') { // Apenas itens, não cabeçalhos
                const text = item.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            }
        });
    },
    
    // Mostrar entrada selecionada
    showEntry: function(key) {
        const entry = this.entries[key];
        const infoDiv = document.getElementById('crypto-info');
        const wikiLink = document.getElementById('wiki-link');
        const searchInput = document.getElementById('crypto-search');
        
        if (!entry || !infoDiv || !wikiLink) return;
        
        // Limpar busca
        if (searchInput) searchInput.value = '';
        
        // Mostrar informações
        infoDiv.innerHTML = `
            <div style="margin-bottom: 25px;">
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 20px;
                ">
                    <div style="
                        width: 60px;
                        height: 60px;
                        background: linear-gradient(135deg, rgba(33, 150, 243, 0.2), rgba(33, 150, 243, 0.1));
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 2em;
                    ">
                        ${this.getIconForCategory(entry.category)}
                    </div>
                    <div>
                        <div style="font-size: 1.8em; font-weight: bold; color: #fff;">
                            ${key}
                        </div>
                        <div style="
                            background: rgba(33, 150, 243, 0.15);
                            color: #64b5f6;
                            padding: 5px 15px;
                            border-radius: 20px;
                            font-size: 0.9em;
                            display: inline-block;
                            margin-top: 5px;
                        ">
                            ${entry.category}
                        </div>
                    </div>
                </div>
                
                <div style="
                    background: rgba(255,255,255,0.05);
                    padding: 20px;
                    border-radius: 10px;
                    border-left: 4px solid #2196f3;
                    margin-bottom: 25px;
                ">
                    <p style="margin: 0; line-height: 1.6; color: #ddd; font-size: 1.1em;">
                        ${entry.description}
                    </p>
                </div>
            </div>
        `;
        
        // Configurar link Wikipedia
        wikiLink.href = entry.link;
        wikiLink.textContent = `📖 Ver "${key}" na Wikipedia`;
        wikiLink.style.display = 'flex';
        
        // Rolar para o topo
        infoDiv.parentElement.scrollTop = 0;
    },
    
    // Obter ícone baseado na categoria
    getIconForCategory: function(category) {
        const icons = {
            'Criptomoeda': '₿',
            'Plataforma': '⚙️',
            'Blockchain': '⛓️',
            'Tecnologia': '🔧',
            'Consenso': '🤝',
            'Evento': '📅',
            'Ferramenta': '🛠️',
            'Hardware': '💻',
            'Criptografia': '🔐',
            'Conceito': '💡',
            'Token': '🎫',
            'Ecossistema': '🌐',
            'DeFi': '🏦',
            'Exchange': '💱',
            'Exchange Token': '🎟️',
            'Pagamentos': '💳',
            'Interoperabilidade': '🔄',
            'Memecoin': '🐕',
            'Governança': '🏛️',
            'Pessoa': '👤'
        };
        
        return icons[category] || '📖';
    },
    
    // Adicionar mais entradas programaticamente
    addMoreEntries: function() {
        // Você pode adicionar mais entradas aqui conforme necessário
        const moreEntries = {
            'Lightning Network': {
                description: 'Solução de segunda camada para Bitcoin que permite transações rápidas e de baixo custo.',
                link: 'https://pt.wikipedia.org/wiki/Lightning_Network',
                category: 'Tecnologia'
            },
            'Metamask': {
                description: 'Carteira digital popular para Ethereum e outras EVM-compatible blockchains, disponível como extensão de navegador.',
                link: 'https://en.wikipedia.org/wiki/MetaMask',
                category: 'Ferramenta'
            },
            'Web3': {
                description: 'Visão de uma internet descentralizada baseada em blockchain, onde usuários controlam seus dados.',
                link: 'https://pt.wikipedia.org/wiki/Web3',
                category: 'Conceito'
            }
        };
        
        // Adicionar novas entradas
        Object.assign(this.entries, moreEntries);
        
        // Atualizar contador
        const countElement = document.getElementById('entry-count');
        if (countElement) {
            countElement.textContent = `${Object.keys(this.entries).length} conceitos disponíveis`;
        }
        
        // Re-popular lista
        this.populateSelector();
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Criar a enciclopédia sem a função init()
    CryptoEncyclopedia.createEncyclopedia();
    CryptoEncyclopedia.populateSelector();
    CryptoEncyclopedia.createSearchBar();
    
    // Garantir que comece 100% fechado
    const encyclopediaContainer = document.getElementById('crypto-encyclopedia');
    if (encyclopediaContainer) {
        encyclopediaContainer.style.display = 'none !important';
    }
    
    // Adicionar mais entradas após inicialização
    setTimeout(() => {
        CryptoEncyclopedia.addMoreEntries();
        // Reforçar que fica fechado
        if (encyclopediaContainer) {
            encyclopediaContainer.style.display = 'none !important';
        }
    }, 1000);
});


// ============================================
// WIDGET DE PREÇO DO BITCOIN
// ============================================

const BitcoinPriceWidget = {
    // Inicializar
    init: function() {
        this.createWidget();
        this.fetchBitcoinPrice();
        // Atualizar a cada 5 minutos
        setInterval(() => this.fetchBitcoinPrice(), 300000);
    },
    
    // Criar widget na interface
    createWidget: function() {
        const widget = document.createElement('div');
        widget.id = 'bitcoin-price-widget';
        widget.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, rgba(247, 147, 26, 0.9), rgba(255, 193, 7, 0.9));
            color: white;
            padding: 15px 25px;
            border-radius: 15px;
            border: 2px solid gold;
            box-shadow: 0 8px 25px rgba(247, 147, 26, 0.4);
            z-index: 9999;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            min-width: 250px;
            backdrop-filter: blur(10px);
            display: none;
        `;
        
        widget.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <div style="font-size: 1.5em;">₿</div>
                <div style="flex: 1;">
                    <div style="font-size: 1.2em;">BITCOIN AGORA</div>
                    <div style="font-size: 0.8em; opacity: 0.8;">Preço em tempo real</div>
                </div>
            </div>
            <div id="btc-price-display" style="text-align: center; font-size: 1.5em;">
                Carregando...
            </div>
            <div id="btc-change-display" style="text-align: center; font-size: 0.9em; margin-top: 5px;">
                Atualizado: --
            </div>
        `;
        
        document.body.appendChild(widget);
        
        // Botão para mostrar/esconder
        this.createToggleButton();
    },
    
    // Botão para mostrar/esconder o widget
    createToggleButton: function() {
        const button = document.createElement('button');
        button.id = 'btc-widget-toggle';
        button.innerHTML = '₿';
        button.title = 'Mostrar/Ocultar preço do Bitcoin';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #f7931a;
            color: white;
            border: 2px solid gold;
            font-size: 1.5em;
            font-weight: bold;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(247, 147, 26, 0.4);
            transition: all 0.3s ease;
        `;
        
        button.onclick = () => {
            const widget = document.getElementById('bitcoin-price-widget');
            if (widget.style.display === 'block') {
                widget.style.display = 'none';
                button.style.transform = 'scale(1)';
            } else {
                widget.style.display = 'block';
                button.style.transform = 'scale(1.1)';
                SoundSystem.click();
            }
        };
        
        button.onmouseover = () => button.style.transform = 'scale(1.1)';
        button.onmouseout = () => {
            if (document.getElementById('bitcoin-price-widget').style.display !== 'block') {
                button.style.transform = 'scale(1)';
            }
        };
        
        document.body.appendChild(button);
    },
    
    // Buscar preço do Bitcoin
    fetchBitcoinPrice: async function() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl%2Cusd&include_24hr_change=true');
            const data = await response.json();
            
            if (data.bitcoin) {
                this.updateDisplay(data.bitcoin);
            }
        } catch (error) {
            console.log('⚠️ Não foi possível obter o preço do Bitcoin');
            this.updateDisplay({
                brl: 350000,
                usd: 65000,
                brl_24h_change: 0,
                usd_24h_change: 0
            });
        }
    },
    
    // Atualizar display
    updateDisplay: function(data) {
        const priceDisplay = document.getElementById('btc-price-display');
        const changeDisplay = document.getElementById('btc-change-display');
        
        if (priceDisplay && changeDisplay) {
            const brlPrice = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(data.brl);
            
            const usdPrice = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(data.usd);
            
            const change = data.brl_24h_change || data.usd_24h_change || 0;
            const changeColor = change >= 0 ? '#4CAF50' : '#f44336';
            const changeIcon = change >= 0 ? '📈' : '📉';
            
            priceDisplay.innerHTML = `
                <div>${brlPrice}</div>
                <div style="font-size: 0.7em; opacity: 0.8;">${usdPrice}</div>
            `;
            
            changeDisplay.innerHTML = `
                <span style="color: ${changeColor}">
                    ${changeIcon} ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                </span>
                <div style="font-size: 0.8em; opacity: 0.7;">
                    Atualizado: ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                </div>
            `;
            
            // Efeito de atualização
            priceDisplay.style.animation = 'pulse 0.5s ease';
            setTimeout(() => priceDisplay.style.animation = '', 500);
        }
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    BitcoinPriceWidget.init();
});

// ============================================
// SISTEMA DE RANKING
// ============================================

const RankingSystem = {
    // Configuração
    maxEntries: 10,
    storageKey: 'jogobitcoin_ranking',
    
    // Inicializar
    init: function() {
        console.log('🏆 Inicializando sistema de ranking...');
        this.loadRanking();
        this.createRankingButton();
    },
    
    // Carregar ranking do localStorage
    loadRanking: function() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            this.ranking = saved ? JSON.parse(saved) : [];
            console.log(`📊 Ranking carregado: ${this.ranking.length} entradas`);
        } catch (error) {
            console.error('❌ Erro ao carregar ranking:', error);
            this.ranking = [];
        }
    },
    
    // Salvar ranking no localStorage
    saveRanking: function() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.ranking));
        } catch (error) {
            console.error('❌ Erro ao salvar ranking:', error);
        }
    },
    
    // Adicionar nova pontuação
    addScore: function(playerName, score, bitcoin, blocks, difficulty, time) {
        const newEntry = {
            id: Date.now(),
            name: playerName || 'Anônimo',
            score: score,
            bitcoin: bitcoin,
            blocks: blocks,
            difficulty: difficulty,
            date: new Date().toISOString(),
            time: time || Math.floor(Date.now() / 1000)
        };
        
        // Adicionar ao ranking
        this.ranking.push(newEntry);
        
        // Ordenar por pontuação (maior primeiro)
        this.ranking.sort((a, b) => b.score - a.score);
        
        // Manter apenas os melhores
        if (this.ranking.length > this.maxEntries) {
            this.ranking = this.ranking.slice(0, this.maxEntries);
        }
        
        // Salvar
        this.saveRanking();
        
        // Mostrar feedback
        this.showRankingFeedback(newEntry.position);
        
        return newEntry;
    },
    
    // Mostrar feedback de posição no ranking
    showRankingFeedback: function(position) {
        if (position <= 3) {
            const messages = [
                "🥇 NOVO RECORDE! 1º LUGAR!",
                "🥈 INCRÍVEL! 2º LUGAR!",
                "🥉 EXCELENTE! 3º LUGAR!"
            ];
            alert(messages[position - 1]);
        }
    },
    
    // Obter posição atual no ranking
    getPosition: function(score) {
        const scores = this.ranking.map(entry => entry.score);
        scores.push(score);
        scores.sort((a, b) => b - a);
        return scores.indexOf(score) + 1;
    },
    
    // Exibir ranking
    showRanking: function() {
        // Criar overlay
        const overlay = document.createElement('div');
        overlay.id = 'ranking-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: fadeIn 0.3s ease;
        `;
        
        // Criar container do ranking
        const container = document.createElement('div');
        container.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: white;
            padding: 30px;
            border-radius: 20px;
            border: 3px solid #f7931a;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            animation: popIn 0.5s ease;
        `;
        
        // Cabeçalho
        const header = document.createElement('div');
        header.innerHTML = `
            <h2 style="color: #f7931a; text-align: center; margin-bottom: 20px;">
                🏆 RANKING JOGOBITCOIN 🏆
            </h2>
            <p style="text-align: center; opacity: 0.8; margin-bottom: 30px;">
                Top ${this.maxEntries} melhores mineradores
            </p>
        `;
        
        // Tabela de ranking
        const table = document.createElement('table');
        table.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        `;
        
        // Cabeçalho da tabela
        table.innerHTML = `
            <thead>
                <tr style="background: rgba(247, 147, 26, 0.2);">
                    <th style="padding: 12px; text-align: center; width: 20%;">Posição</th>
                    <th style="padding: 12px; text-align: left; width: 30%;">Jogador</th>
                    <th style="padding: 12px; text-align: right; width: 25%;">Pontos</th>
                    <th style="padding: 12px; text-align: right; width: 25%;">Bitcoin</th>
                </tr>
            </thead>
            <tbody id="ranking-body">
                ${this.generateRankingRows()}
            </tbody>
        `;
        
        // Botão de fechar
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Fechar';
        closeButton.style.cssText = `
            display: block;
            margin: 20px auto 0;
            padding: 12px 40px;
            background: #f7931a;
            color: white;
            border: none;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        closeButton.onmouseover = () => closeButton.style.transform = 'scale(1.05)';
        closeButton.onmouseout = () => closeButton.style.transform = 'scale(1)';
        closeButton.onclick = () => overlay.remove();
        
        // Montar estrutura
        container.appendChild(header);
        container.appendChild(table);
        container.appendChild(closeButton);
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        // Fechar ao clicar fora
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };
        
        // Fechar com ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') overlay.remove();
        };
        document.addEventListener('keydown', handleEsc);
        overlay.dataset.escHandler = handleEsc;
    },
    
    // Gerar linhas da tabela de ranking
    generateRankingRows: function() {
        if (this.ranking.length === 0) {
            return `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 30px; color: #aaa;">
                        Nenhuma pontuação ainda. Seja o primeiro!
                    </td>
                </tr>
            `;
        }
        
        let rows = '';
        const medals = ['🥇', '🥈', '🥉'];
        
        this.ranking.forEach((entry, index) => {
            const medal = index < 3 ? medals[index] : `${index + 1}º`;
            const date = new Date(entry.date).toLocaleDateString('pt-BR');
            
            rows += `
                <tr style="
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255,255,255,0.05)'" 
                 onmouseout="this.style.background='transparent'">
                    <td style="padding: 15px; text-align: center; font-weight: bold; font-size: 1.2em;">
                        ${medal}
                    </td>
                    <td style="padding: 15px;">
                        <div style="font-weight: bold;">${entry.name}</div>
                        <div style="font-size: 0.8em; opacity: 0.7;">
                            ${entry.difficulty} • ${date}
                        </div>
                    </td>
                    <td style="padding: 15px; text-align: right; font-weight: bold;">
                        ${entry.score.toLocaleString()}
                    </td>
                    <td style="padding: 15px; text-align: right; color: #f7931a; font-weight: bold;">
                        ${entry.bitcoin.toFixed(8)} BTC
                    </td>
                </tr>
            `;
        });
        
        return rows;
    },
    
    // Criar botão para ver ranking
    createRankingButton: function() {
        if (document.getElementById('ranking-button')) return;
        
        const button = document.createElement('button');
        button.id = 'ranking-button';
        button.innerHTML = '🏆 Ranking';
        button.title = 'Ver ranking';
        button.style.cssText = `
            position: fixed;
            top: 10px;
            left: 70px;
            padding: 10px 20px;
            background: rgba(33, 150, 243, 0.9);
            color: white;
            border: none;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        button.onmouseover = () => {
            button.style.transform = 'scale(1.05)';
            button.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
        };
        
        button.onmouseout = () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        };
        
        button.onclick = () => {
            SoundSystem.click();
            this.showRanking();
        };
        
        document.body.appendChild(button);
    },
    
    // Salvar pontuação ao final do jogo
    saveGameScore: function(isVictory) {
        // Pedir nome do jogador
        const playerName = prompt(
            `🎮 ${isVictory ? 'PARABÉNS!' : 'GAME OVER'}\n\n` +
            `Digite seu nome para o ranking:\n` +
            `(Deixe em branco para "Anônimo")`,
            localStorage.getItem('jogobitcoin_lastname') || ''
        );
        
        if (playerName !== null) {
            // Salvar nome para uso futuro
            if (playerName.trim()) {
                localStorage.setItem('jogobitcoin_lastname', playerName.trim());
            }
            
            // Calcular tempo de jogo (aproximado)
            const gameTime = Math.floor((Date.now() - window.gameStartTime) / 1000);
            
            // Adicionar ao ranking
            const entry = this.addScore(
                playerName.trim(),
                score,
                bitcoinQuantity,
                brokenBlocks,
                dificuldadeAtual,
                gameTime
            );
            
            // Mostrar posição alcançada
            const position = this.getPosition(score);
            alert(
                `🏅 POSIÇÃO NO RANKING: ${position}º LUGAR!\n\n` +
                `Pontuação: ${score.toLocaleString()}\n` +
                `Bitcoin: ${bitcoinQuantity.toFixed(8)} BTC\n` +
                `Blocos: ${brokenBlocks}\n` +
                `Dificuldade: ${dificuldadeAtual}\n` +
                `Tempo: ${Math.floor(gameTime / 60)}:${(gameTime % 60).toString().padStart(2, '0')}`
            );
            
            // Mostrar ranking
            setTimeout(() => this.showRanking(), 1000);
        }
    }
};

// Inicializar ranking quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    RankingSystem.init();
});

// Variável para tempo de início do jogo
let gameStartTime = Date.now();

// ============================================
// SISTEMA DE SONS
// ============================================

// Configuração de sons (com fallbacks)
const SoundSystem = {
    // URLs dos sons (coloque seus arquivos MP3 na pasta sounds/)
    urls: {
        correct: 'sounds/correct.mp3',
        wrong: 'sounds/wrong.mp3',
        click: 'sounds/click.mp3',
        block: 'sounds/block.mp3',
        gameover: 'sounds/gameover.mp3',
        win: 'sounds/win.mp3'
    },
    
    // Objeto para armazenar os áudios
    audios: {},
    
    // Flag para controle de som
    enabled: true,
    
    // Inicializar sistema de som
    init: function() {
        console.log('🎵 Inicializando sistema de sons...');
        
        // Criar objetos de áudio para cada som
        for (const [key, url] of Object.entries(this.urls)) {
            try {
                this.audios[key] = new Audio(url);
                this.audios[key].volume = 0.7; // Volume padrão (70%)
                
                // Configurar pré-carregamento
                this.audios[key].preload = 'auto';
                
                // Adicionar tratamento de erro
                this.audios[key].onerror = () => {
                    console.warn(`⚠️ Som não encontrado: ${url}`);
                    // Criar fallback (som gerado por código)
                    this.createFallbackSound(key);
                };
                
            } catch (error) {
                console.warn(`⚠️ Erro ao carregar som ${key}:`, error);
                this.createFallbackSound(key);
            }
        }
        
        // Botão de controle de som no HTML
        this.createSoundToggle();
    },
    
    // Criar som de fallback (caso arquivo MP3 não exista)
    createFallbackSound: function(type) {
        console.log(`🎵 Criando fallback para: ${type}`);
        
        // Usar Web Audio API para gerar sons simples
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Diferentes frequências para diferentes sons
            switch(type) {
                case 'correct':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    break;
                case 'wrong':
                    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                    break;
                case 'click':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    break;
                default:
                    oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
            }
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
            
        } catch (error) {
            console.log('⚠️ Web Audio API não suportada, sons desabilitados');
        }
    },
    
    // Tocar um som
    play: function(soundName) {
        if (!this.enabled) return;
        
        try {
            if (this.audios[soundName]) {
                // Resetar o áudio para poder tocar novamente
                this.audios[soundName].currentTime = 0;
                this.audios[soundName].play().catch(e => {
                    console.warn(`⚠️ Erro ao tocar som ${soundName}:`, e);
                });
            }
        } catch (error) {
            console.warn(`⚠️ Erro no sistema de som:`, error);
        }
    },
    
    // Criar botão de controle de som
    createSoundToggle: function() {
        // Verificar se já existe o botão
        if (document.getElementById('sound-toggle')) return;
        
        const toggleButton = document.createElement('button');
        toggleButton.id = 'sound-toggle';
        toggleButton.innerHTML = '🔊';
        toggleButton.title = 'Alternar som';
        toggleButton.style.cssText = `
            position: fixed;
            top: 10px;
            left: 30px; 
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(247, 147, 26, 0.9);
            color: white;
            border: none;
            font-size: 1.2em;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;
        
        toggleButton.onclick = () => {
            this.enabled = !this.enabled;
            toggleButton.innerHTML = this.enabled ? '🔊' : '🔇';
            toggleButton.style.background = this.enabled ? 
                'rgba(247, 147, 26, 0.9)' : 'rgba(100, 100, 100, 0.9)';
            
            // Salvar preferência
            localStorage.setItem('jogobitcoin_sound', this.enabled);
        };
        
        // Carregar preferência salva
        const savedSound = localStorage.getItem('jogobitcoin_sound');
        if (savedSound !== null) {
            this.enabled = savedSound === 'true';
            toggleButton.innerHTML = this.enabled ? '🔊' : '🔇';
        }
        
        document.body.appendChild(toggleButton);
    },
    
    // Métodos curtos para sons específicos
    correct: function() { this.play('correct'); },
    wrong: function() { this.play('wrong'); },
    click: function() { this.play('click'); },
    block: function() { this.play('block'); },
    gameover: function() { this.play('gameover'); },
    win: function() { this.play('win'); }
};

// Inicializar sons quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    SoundSystem.init();
});


// ============================================
// LISTA DE CRIPTOATIVOS (1000+ NOMES)
// ============================================
const cryptoNomes = [
    // Criptomoedas principais
    "Bitcoin", "Ethereum", "Binance", "Solana", "Cardano", 
    "Ripple", "Polkadot", "Dogecoin", "Shiba", "Avalanche",
    "Chainlink", "Litecoin", "Polygon", "Uniswap", "Monero",
    
    // Termos técnicos
    "Blockchain", "Hash", "Miner", "Node", "Wallet",
    "PrivateKey", "PublicKey", "SeedPhrase", "Nonce", "Merkle",
    "ProofOfWork", "ProofOfStake", "SmartContract", "GasFee", 
    "Fork", "Halving", "Difficulty", "Timestamp", "Consensus",
    
    // Exchanges
    "Coinbase", "Kraken", "Gemini", "FTX", "CryptoCom",
    "KuCoin", "Huobi", "Bybit", "GateIO", "OKX",
    
    // Projetos e fundadores
    "Satoshi", "Nakamoto", "Vitalik", "Buterin", "CZ",
    "Zhao", "Gavin", "Wood", "Charles", "Hoskinson",
    "DoKwon", "Silbert", "Armstrong", "Novogratz", "Musk",
    
    // Altcoins
    "Tron", "Algorand", "Tezos", "EOS", "NEO",
    "Stellar", "Cosmos", "Fantom", "Harmony", "Kusama",
    "Filecoin", "Arweave", "Helium", "Theta", "Flow",
    
    // Tokens DeFi
    "Aave", "Compound", "Maker", "Curve", "Sushi",
    "PancakeSwap", "Yearn", "Synthetix", "Balancer", "Convex",
    
    // NFTs e Metaverso
    "OpenSea", "BoredApe", "CryptoPunks", "Axie", "Sandbox",
    "Decentraland", "ENS", "ArtBlocks", "LooksRare", "X2Y2",
    
    // Layer 2 e scaling
    "Optimism", "Arbitrum", "zkSync", "Starknet", "Loopring",
    "PolygonZK", "ImmutableX", "Boba", "Metis", "Aztec",
    
    // Segurança e privacidade
    "Tornado", "Cash", "Zcash", "Dash", "Zooko",
    "Grin", "Beam", "Secret", "Oasis", "Aleo",
    
    // Stablecoins
    "Tether", "USDC", "DAI", "BUSD", "UST",
    "FRAX", "MIM", "USDD", "FEI", "GUSD",
    
    // Infraestrutura
    "Infura", "Alchemy", "QuickNode", "Moralis", "TheGraph",
    "IPFS", "Pinata", "Fleek", "Ceramic", "Livepeer",
    
    // DAOs
    "UniswapDAO", "MakerDAO", "Aragon", "Moloch", "FriendsWithBenefits",
    
    // Jogos e Play-to-Earn
    "StepN", "DeFiKingdoms", "GodsUnchained", "Illuvium", "StarAtlas",
    "GuildFi", "YieldGuild", "MeritCircle", "Rainmaker", "CryptoBlades",
    
    // Regulatórios
    "SEC", "CFTC", "FATF", "FinCEN", "MiCA",
    "IRS", "FCA", "ASIC", "MAS", "FSA",
    
    // Termos de mercado
    "Bull", "Bear", "Whale", "DiamondHands", "PaperHands",
    "FOMO", "FUD", "HODL", "ReKT", "WAGMI",
    "NGMI", "GM", "GN", "Ser", "Wen",
    "Airdrop", "RugPull", "DYOR", "ATH", "ATL",
    
    // Hardware e mining
    "Bitmain", "Antminer", "Whatsminer", "Innosilicon", "Canaan",
    "ASIC", "GPU", "FPGA", "Hashrate", "MiningRig",
    
    // Educação e mídia
    "CoinDesk", "Cointelegraph", "Messari", "Decrypt", "Bankless",
    "LexFridman", "Pomp", "BitcoinMagazine", "TheBlock", "CryptoTwitter"
];

// Adicionar mais nomes combinando prefixos e sufixos
const cryptoPrefixes = ["Crypto", "Block", "Chain", "DeFi", "Web3", "Meta", "Smart", "Digital", "Token", "Coin"];
const cryptoSuffixes = ["Swap", "Fi", "Chain", "Verse", "Vault", "Pool", "Farm", "Bank", "Node", "Labs"];

for (let i = 0; i < 950; i++) {
    const prefix = cryptoPrefixes[Math.floor(Math.random() * cryptoPrefixes.length)];
    const suffix = cryptoSuffixes[Math.floor(Math.random() * cryptoSuffixes.length)];
    const randomWord = ["Alpha", "Beta", "Gamma", "Delta", "Sigma", "Omega", "Nova", "Quant", "Zen", "Nexus"][Math.floor(Math.random() * 10)];
    
    const newName = prefix + suffix + randomWord;
    if (!cryptoNomes.includes(newName)) {
        cryptoNomes.push(newName);
    }
}

// ============================================
// SISTEMA DE CRIPTOGRAFIA - VERSÃO CORRIGIDA
// ============================================
const Criptografia = {
    // Cifra de César CORRIGIDA
    cifraDeCesar: (texto, chave) => {
        return texto.split('').map(char => {
            if (char.match(/[a-zA-Z]/)) {
                const code = char.charCodeAt(0);
                const isUpperCase = code >= 65 && code <= 90;
                const base = isUpperCase ? 65 : 97;
                
                // Calcular nova posição (garantindo que fique entre 0-25)
                let novaPosicao = (code - base + chave) % 26;
                if (novaPosicao < 0) novaPosicao += 26;
                
                return String.fromCharCode(base + novaPosicao);
            }
            return char; // Mantém caracteres não-alfabéticos (espaços, números, etc.)
        }).join('');
    },
    
    // Função de teste para verificar
    testarCifra: (texto, chave) => {
        const cifrado = Criptografia.cifraDeCesar(texto, chave);
        const decifrado = Criptografia.cifraDeCesar(cifrado, -chave);
        console.log(`Teste: "${texto}" → "${cifrado}" → "${decifrado}"`);
        return decifrado === texto;
    },
    
    // Tabela ASCII
    paraASCII: (texto) => {
        return texto.split('').map(char => 
            char.charCodeAt(0).toString().padStart(3, '0')
        ).join(' ');
    },
    
    // Base64
    paraBase64: (texto) => {
        try {
            return btoa(texto);
        } catch (e) {
            console.error('Erro Base64:', e);
            return texto;
        }
    },
    
    // Funções de descriptografia
    decifrarDeCesar: (texto, chave) => {
        return Criptografia.cifraDeCesar(texto, -chave);
    },
    
    deASCII: (textoCodificado) => {
        try {
            return textoCodificado.split(' ').map(code => 
                String.fromCharCode(parseInt(code))
            ).join('');
        } catch (e) {
            console.error('Erro ASCII:', e);
            return '';
        }
    },
    
    deBase64: (textoBase64) => {
        try {
            return atob(textoBase64);
        } catch (e) {
            console.error('Erro Base64:', e);
            return '';
        }
    }
};
// ============================================
// FUNÇÃO PARA TESTAR A CIFRA DE CÉSAR
// ============================================
function testarCifra() {
    console.log('🔧 TESTANDO CIFRA DE CÉSAR');
    
    const palavras = ['Bitcoin', 'Ethereum', 'Crypto', 'Blockchain', 'Miner'];
    const chaves = [3, -3, 5, -5, 7, -7];
    
    palavras.forEach(palavra => {
        chaves.forEach(chave => {
            const cifrado = Criptografia.cifraDeCesar(palavra, chave);
            const decifrado = Criptografia.cifraDeCesar(cifrado, -chave);
            const funcionou = decifrado === palavra;
            
            console.log(`${funcionou ? '✅' : '❌'} "${palavra}" (chave ${chave}) → "${cifrado}" → "${decifrado}"`);
        });
    });
}

// Chamar no console: testarCifra()
// ============================================
// SISTEMA DE PROBLEMAS
// ============================================
// ============================================
// SISTEMA DE PROBLEMAS - VERSÃO CORRIGIDA
// ============================================
const SistemaProblemas = {
    // Nível Fácil: APENAS Cifra de César (CORRIGIDO)
    facil: () => {
        const nomeOriginal = cryptoNomes[Math.floor(Math.random() * cryptoNomes.length)];
        // Garantir que a chave seja entre 1-5 (positiva ou negativa)
        const chave = Math.random() > 0.5 ? 
            Math.floor(Math.random() * 5) + 1 : // 1-5 positivas
            -(Math.floor(Math.random() * 5) + 1); // -1 a -5 negativas
        
        const nomeCifrado = Criptografia.cifraDeCesar(nomeOriginal, chave);
        
        // Debug
        console.log('🔧 FÁCIL - Gerado:', { 
            original: nomeOriginal, 
            cifrado: nomeCifrado, 
            chave: chave,
            resposta: nomeOriginal.toLowerCase()
        });
        
        return {
            pergunta: `🔐 Descriptografe esta mensagem (Cifra de César, chave: ${Math.abs(chave)}${chave > 0 ? ' →' : ' ←'}):`,
            textoCifrado: nomeCifrado,
            respostaCorreta: nomeOriginal.toLowerCase(),
            tipo: 'cesar',
            chave: chave,
            dica: `Dica: Desloque ${Math.abs(chave)} letras ${chave > 0 ? 'para frente' : 'para trás'} no alfabeto`
        };
    },
    
    // Nível Médio: APENAS Cifra de César e ASCII (SEM Base64!)
    medio: () => {
        const nomeOriginal = cryptoNomes[Math.floor(Math.random() * cryptoNomes.length)];
        // 50% Cifra de César, 50% ASCII (NUNCA Base64)
        const tipo = Math.random() > 0.5 ? 'cesar' : 'ascii';
        
        if (tipo === 'cesar') {
            // Chaves entre 3-7 para médio (sempre mostrar a chave!)
            const chave = Math.random() > 0.5 ? 
                Math.floor(Math.random() * 5) + 3 : // 3-7
                -(Math.floor(Math.random() * 5) + 3); // -3 a -7
            
            const nomeCifrado = Criptografia.cifraDeCesar(nomeOriginal, chave);
            
            return {
                pergunta: `🔐 Descriptografe (Cifra de César, chave: ${Math.abs(chave)}${chave > 0 ? ' →' : ' ←'}):`,
                textoCifrado: nomeCifrado,
                respostaCorreta: nomeOriginal.toLowerCase(),
                tipo: 'cesar',
                chave: chave,
                dica: `Dica: Desloque ${Math.abs(chave)} posições ${chave > 0 ? 'à direita' : 'à esquerda'}`
            };
        } else {
            const nomeASCII = Criptografia.paraASCII(nomeOriginal);
            
            return {
                pergunta: `🔢 Converta este código ASCII para texto:`,
                textoCifrado: nomeASCII,
                respostaCorreta: nomeOriginal.toLowerCase(),
                tipo: 'ascii',
                dica: `Dica: Cada grupo de 3 números é um caractere (ex: 065 = A)`
            };
        }
    },
    
    // Nível Difícil: TODOS os tipos (César, ASCII e Base64)
    dificil: () => {
        const nomeOriginal = cryptoNomes[Math.floor(Math.random() * cryptoNomes.length)];
        const tipos = ['cesar', 'ascii', 'base64'];
        const tipo = tipos[Math.floor(Math.random() * tipos.length)];
        
        switch(tipo) {
            case 'cesar':
                const chave = Math.random() > 0.5 ? 
                    Math.floor(Math.random() * 8) + 3 : // 3-10
                    -(Math.floor(Math.random() * 8) + 3); // -3 a -10
                
                const nomeCifrado = Criptografia.cifraDeCesar(nomeOriginal, chave);
                
                return {
                    pergunta: `🔐 Descriptografe (Cifra de César, chave: ${Math.abs(chave)}${chave > 0 ? ' →' : ' ←'}):`,
                    textoCifrado: nomeCifrado,
                    respostaCorreta: nomeOriginal.toLowerCase(),
                    tipo: 'cesar',
                    chave: chave,
                    dica: `Dica: Cifra de César com deslocamento ${chave > 0 ? '+' : ''}${chave}`
                };
                
            case 'ascii':
                const nomeASCII = Criptografia.paraASCII(nomeOriginal);
                
                return {
                    pergunta: `🔢 Decodifique ASCII:`,
                    textoCifrado: nomeASCII,
                    respostaCorreta: nomeOriginal.toLowerCase(),
                    tipo: 'ascii',
                    dica: `Dica: Use tabela ASCII (065=A, 066=B...)`
                };
                
            case 'base64':
                const nomeBase64 = Criptografia.paraBase64(nomeOriginal);
                
                return {
                    pergunta: `🔄 Decodifique Base64:`,
                    textoCifrado: nomeBase64,
                    respostaCorreta: nomeOriginal.toLowerCase(),
                    tipo: 'base64',
                    dica: `Dica: Base64 termina com = ou ==`
                };
        }
    }
};

// ============================================
// OUTRAS CONFIGURAÇÕES
// ============================================
const mensagensDeIncentivo = [
    "Você está indo muito bem!",
    "Ótimo trabalho! Continue assim!",
    "Você é incrível!",
    "Quase lá, continue minerando!",
    "Parabéns, você está se superando!",
    "Sua determinação é inspiradora!"
];

// ============================================
// INICIALIZAÇÃO DO JOGO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const answerInput = document.getElementById('answer');
    document.getElementById('problem-container').style.display = 'none';
    document.getElementById('hash-log').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('tipo-indicador').style.display = 'none';

    if (answerInput) {
        answerInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                if (typeof submitAnswer === 'function') {
                    submitAnswer();
                } else {
                    console.error('A função submitAnswer não está definida.');
                }
            }
        });
    }
    
    // Inicializar vidas
    updateVidasDisplay();
});

// ============================================
// FUNÇÕES PRINCIPAIS DO JOGO
// ============================================

function startGame(difficulty) {
    console.log('Iniciando jogo com dificuldade:', difficulty);
    
    // Definir dificuldade inicial
    dificuldadeAtual = difficulty;
    
    // Configurar tempo baseado na dificuldade escolhida
    switch(difficulty) {
        case 'facil':
            timeLimit = 60; // 1 minuto
            break;
        case 'medio':
            timeLimit = 45; // 45 segundos
            break;
        case 'dificil':
            timeLimit = 30; // 30 segundos (aumentado de 20)
            break;
        default:
            timeLimit = 60;
            dificuldadeAtual = 'facil';
    }
    
    remainingTime = timeLimit;
    
    // Esconder elementos iniciais
    document.getElementById('info-container').style.display = 'none';
    document.getElementById('difficulty-selection').style.display = 'none';
    
    // Mostrar elementos do jogo
    document.getElementById('problem-container').style.display = 'flex';
    document.getElementById('game-container').style.display = 'flex';
    document.getElementById('hash-log').style.display = 'flex';
    
    // Esconder imagens decorativas
    const imagens = [
        "img-Bitcoin.esquerda", "img-esquerda", "img-logo.esquerda",
        "img-Bitcoin.direita", "img-direita", "img-logo.direita"
    ];
    imagens.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.style.display = 'none';
    });

    // Habilitar campo de resposta
    document.getElementById('answer').disabled = false;

    // Inicializar componentes do jogo
    initializeBlocks();
    updateBitcoinValue();
    updateScoreDisplay(score);
    updateVidasDisplay();
    
    // Definir tempo de início do jogo
    gameStartTime = Date.now();
    
    // Som de início (opcional)
    SoundSystem.click();

    // Mostrar indicador de dificuldade
    const tipoElement = document.getElementById('tipo-indicador');
    if (tipoElement) {
        tipoElement.textContent = `Dificuldade: ${dificuldadeAtual.toUpperCase()}`;
        tipoElement.className = `tipo-${dificuldadeAtual}`;
        tipoElement.style.display = 'inline-block';
    }
    
    // Iniciar primeiro problema
    displayNextProblem();
}

function resetGame() {
    // Esconder mensagens finais
    document.getElementById('mensagem-final').style.display = 'none';
    document.getElementById('restart-button').style.display = 'none';
    
    // Mostrar tela inicial
    document.getElementById('difficulty-selection').style.display = 'block';
    document.getElementById('info-container').style.display = 'flex';   
    document.getElementById('problem-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('hash-log').style.display = 'none';
    document.getElementById('history-container').style.display = 'none';
    document.getElementById('mensagem-container').style.display = 'none';

    // Reiniciar variáveis
    bitcoinQuantity = 0;
    score = 0;
    currentProblem = 1;
    vidas = 3;
    jogoConcluido = false;
    brokenBlocks = 0;
    problemaAtual = null;
    errosConsecutivos = 0;
    
    // Parar temporizador
    clearInterval(timerInterval);
    
    // Atualizar displays
    updateScoreDisplay(score);
    updateBitcoinValue();
    updateVidasDisplay();
    document.getElementById('timer').textContent = '';
    document.getElementById('result').textContent = '';
    document.getElementById('hash-display').innerHTML = 'Nenhum bloco quebrado ainda.';
    
    // Mostrar imagens decorativas novamente
    const imagens = [
        "img-Bitcoin.esquerda", "img-esquerda", "img-logo.esquerda",
        "img-Bitcoin.direita", "img-direita", "img-logo.direita"
    ];
    imagens.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.style.display = 'block';
    });

    // Som de clique
    SoundSystem.click();

    // Recriar blocos
    initializeBlocks();
}

function initializeBlocks() {
    const container = document.getElementById('blocks-container');
    container.innerHTML = '';
    blocks = [];
    
    // Para 100 blocos, manter grid de 10 colunas
    const numColunas = 10;

    // Criar 5 blocos (para teste - altere TamMax se quiser mais)
    for (let i = 0; i < TamMax; i++) {
        const block = document.createElement('div');
        block.className = 'block';
        block.textContent = i + 1;
        block.setAttribute('data-stage', '0');
        
        // Adicionar indicador de progresso
        const progress = document.createElement('div');
        progress.className = 'block-progress';
        progress.textContent = '0%';
        block.appendChild(progress);
        
        blocks.push(block);
        container.appendChild(block);
    }
    
    // Configurar grid
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(10, 1fr)';
    container.style.gap = '1px';
    container.style.justifyContent = 'center';
}

function generateCryptoProblem() {
    console.log('Gerando problema para dificuldade:', dificuldadeAtual);
    
    // Usar dificuldade atual do jogo
    let dificuldadeParaUsar = dificuldadeAtual;
    
      
    // Gerar problema
        try {
        problemaAtual = SistemaProblemas[dificuldadeParaUsar]();
        console.log('✅ Problema gerado:', problemaAtual);
    } catch (error) {
        console.error('❌ Erro ao gerar problema:', error);
        // Fallback para nível fácil em caso de erro
        problemaAtual = SistemaProblemas['facil']();
    }
    
    // Resetar erros consecutivos
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
    
    const problema = generateCryptoProblem();
    document.getElementById('problem-number').textContent = `Bloco Nº: ${currentProblem}`;
    document.getElementById('problem-question').innerHTML = problema.texto;
    
    // Atualizar indicador de dificuldade
    const tipoElement = document.getElementById('tipo-indicador');
    if (tipoElement) {
        tipoElement.textContent = `Dificuldade: ${dificuldadeAtual.toUpperCase()}`;
        tipoElement.className = `tipo-${dificuldadeAtual}`;
    }
    
    // Limpar e focar no campo de resposta
    const answerInput = document.getElementById('answer');
    answerInput.value = '';
    answerInput.disabled = false;
    answerInput.focus();
    document.getElementById('result').textContent = '';
    
    // Iniciar temporizador
    startTimer();
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
        
        // Mudar cor quando o tempo estiver acabando
        const timerElement = document.getElementById('timer');
        if (remainingTime <= 10) {
            timerElement.style.color = '#ff4444';
            timerElement.classList.add('pulse');
        }
        
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            document.getElementById('result').textContent = '⏰ Tempo esgotado!';
            perderVida();
            setTimeout(() => {
                if (!jogoConcluido && vidas > 0) {
                    displayNextProblem();
                }
            }, 1500);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.textContent = `⏱️ ${remainingTime}s`;
        
        // Remover efeito pulse se tempo não estiver crítico
        if (remainingTime > 10) {
            timerElement.style.color = '';
            timerElement.classList.remove('pulse');
        }
    }
}

function submitAnswer() {
    if (jogoConcluido || vidas <= 0) return;
    
    const answerInput = document.getElementById('answer');
    const answer = answerInput.value.trim().toLowerCase();
    
    if (!answer) {
        document.getElementById('result').textContent = 'Digite uma resposta!';
        document.getElementById('result').style.color = '#ff9800';
        return;
    }
    
    if (!problemaAtual) {
        document.getElementById('result').textContent = 'Erro: problema não carregado';
        return;
    }
    
    // Verificar resposta
    if (answer === problemaAtual.respostaCorreta) {
        clearInterval(timerInterval);
        document.getElementById('result').textContent = '✅ Correto! Hash validado!';
        document.getElementById('result').style.color = '#4CAF50';
        
        // Efeito visual
        const questionElement = document.getElementById('problem-question');
        questionElement.classList.add('mining-success');
        setTimeout(() => {
            questionElement.classList.remove('mining-success');
        }, 1000);
        
        // Atualizar jogo
        updateBitcoinValue();
        updateBlocks();
        SoundSystem.correct();

    } else {
        document.getElementById('result').textContent = '❌ Hash inválido! Tente novamente.';
        document.getElementById('result').style.color = '#f44336';
        errosConsecutivos++;
        
        // Dar dica após 2 erros
        if (errosConsecutivos >= 2 && problemaAtual.dica) {
            const resultElement = document.getElementById('result');
            const dicaElement = document.createElement('div');
            dicaElement.className = 'dica-box';
            dicaElement.innerHTML = `<small>💡 ${problemaAtual.dica}</small>`;
            resultElement.appendChild(dicaElement);
        }
        
        perderVida();
        SoundSystem.wrong();
    }
}

function updateBitcoinValue() {
    if (jogoConcluido) return;
    
    // Adicionar bitcoin baseado na dificuldade
    let bitcoinToAdd = 0;
    switch(dificuldadeAtual) {
        case 'facil':
            bitcoinToAdd = 0.00000010;
            break;
        case 'medio':
            bitcoinToAdd = 0.00000020;
            break;
        case 'dificil':
            bitcoinToAdd = 0.00000050;
            break;
    }
    
    bitcoinQuantity += bitcoinToAdd;
    
    // Atualizar display
    const bitcoinDisplay = document.getElementById('bitcoin-value');
    if (bitcoinDisplay) {
        bitcoinDisplay.textContent = `${bitcoinQuantity.toFixed(8)} BTC`;
    }
}

function updateBlocks() {
    const blockIndex = currentProblem - 1;
    
    if (blockIndex >= 0 && blockIndex < blocks.length) {
        const block = blocks[blockIndex];
        const currentStage = parseInt(block.getAttribute('data-stage'), 10);
        
        if (currentStage < 3) {
            // Avançar estágio
            const nextStage = currentStage + 1;
            block.setAttribute('data-stage', nextStage);
            
            // Atualizar aparência baseada no estágio
            switch(nextStage) {
                case 1:
                    block.style.backgroundColor = '#f1c40f';
                    updateBlockProgress(blockIndex, 33);
                    updateScore(100);
                    break;
                case 2:
                    block.style.backgroundColor = '#95a5a6';
                    updateBlockProgress(blockIndex, 66);
                    updateScore(200);
                    break;
                case 3:
                    block.style.backgroundColor = '#2ecc71';
                    updateBlockProgress(blockIndex, 100);
                    updateScore(300);
                    brokenBlocks++;
                    updateHashLog(currentProblem);
                    
                    // Mostrar mensagem de incentivo a cada 5 blocos
                    if (brokenBlocks % 1 === 0) { //alterado para 1 para teste 01/02/2026
                        const mensagemIndex = (brokenBlocks / 1 - 1) % mensagensDeIncentivo.length;
                        setTimeout(() => {
                            mostrarMensagemIncentivo(mensagemIndex);
                        }, 500);
                    }
                    
                    // Mostrar histórico a cada 5 blocos
                    if (brokenBlocks % 6 === 0) { //alterado para 1 para teste 01/02/2026
                         setTimeout(() => {
                            showHistory(Math.floor(brokenBlocks / 6)); //alterado para 1 para teste 01/02/2026
                        }, 2000); // 2 segundos depois da mensagem
                    }
                    
                    // Avançar para próximo bloco
                    currentProblem++;
                    
                    // Verificar se completou todos os blocos
                   if (currentProblem > TamMax) {
                        setTimeout(() => endGame(true), 1000);
                        return;
                    }
                    break;
            }
            
            // Mostrar próximo problema (exceto no último estágio)
            if (nextStage < 3) {
                setTimeout(() => displayNextProblem(), 1000);
            } else {
                setTimeout(() => displayNextProblem(), 1500);
                // Som de bloco quebrado
                SoundSystem.block();
            }
        }
    }
}

function updateBlockProgress(blockIndex, progress) {
    const block = blocks[blockIndex];
    const progressElement = block.querySelector('.block-progress');
    if (progressElement) {
        progressElement.textContent = `${progress}%`;
    }
}

function updateScore(points) {
    if (jogoConcluido) return;
    
    // Bônus baseado no tipo de criptografia
    let bonus = 0;
    if (problemaAtual) {
        switch(problemaAtual.tipo) {
            case 'cesar': bonus = 50; break;
            case 'ascii': bonus = 75; break;
            case 'base64': bonus = 100; break;
        }
        
        // Bônus por tempo restante
        bonus += Math.floor(remainingTime * 2);
    }
    
    const previousScore = score;
    score += points + bonus;
    
    // Animar score
    animateScore(previousScore, score);
    
    // Mostrar breakdown (opcional)
    if (bonus > 0) {
        const resultElement = document.getElementById('result');
        if (resultElement) {
            const bonusText = document.createElement('div');
            bonusText.innerHTML = `<small>+${bonus} pontos (bônus)</small>`;
            resultElement.appendChild(bonusText);
        }
    }
}

function animateScore(currentScore, targetScore) {
    const scoreDisplay = document.getElementById('score-display');
    if (!scoreDisplay) return;
    
    const interval = setInterval(() => {
        if (currentScore < targetScore) {
            currentScore += Math.max(1, Math.floor((targetScore - currentScore) / 10));
            updateScoreDisplay(currentScore);
        } else {
            clearInterval(interval);
            updateScoreDisplay(targetScore);
        }
    }, 50);
}

function updateScoreDisplay(scoreValue) {
    const scoreDisplay = document.getElementById('score-display');
    if (!scoreDisplay) return;
    
    const scoreString = scoreValue.toString().padStart(4, '0');
    scoreDisplay.innerHTML = '';
    
    for (const digit of scoreString) {
        const digitBox = document.createElement('span');
        digitBox.className = 'score-box';
        digitBox.textContent = digit;
        scoreDisplay.appendChild(digitBox);
    }
}

function updateVidasDisplay() {
    const vidasContainer = document.getElementById('vidas-container');
    if (!vidasContainer) return;
    
    // Limpar container
    vidasContainer.innerHTML = '<span class="vidas-label">Vidas:</span>';
    
    // Array com os nomes das imagens (correspondendo às 3 vidas)
    const imagensVidas = ['a.png', 'b.png', 'c.png'];
    
    for (let i = 0; i < 3; i++) { // Sempre mostrar 3 slots
        const vida = document.createElement('img');
        vida.className = 'vida';
        
        // Usar a imagem correspondente
        const imagemSrc = imagensVidas[i] || 'a.png';
        vida.src = imagemSrc;
        vida.alt = `Vida ${i + 1}`;
        
        // Estilos básicos
        vida.style.width = '35px';
        vida.style.height = '35px';
        vida.style.margin = '0 8px';
        vida.style.transition = 'all 0.3s ease';
        vida.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
        
        // Se a vida foi perdida, aplicar efeito visual
        if (i >= vidas) {
            vida.style.opacity = '0.3';
            vida.style.filter = 'grayscale(100%) brightness(0.5)';
            vida.style.transform = 'scale(0.9)';
        } else {
            // Vida ativa - adicionar animação
            vida.style.opacity = '1';
            vida.style.filter = 'drop-shadow(0 0 8px rgba(247, 147, 26, 0.7))';
            
            // Adicionar animação de pulsação leve
            vida.style.animation = 'bitcoinPulse 2s infinite ease-in-out';
        }
        
        vidasContainer.appendChild(vida);
    }
}

function perderVida() {
    if (vidas > 0) {
        vidas--;
        
        // Efeito visual na vida perdida
        const vidasContainer = document.getElementById('vidas-container');
        const vidasElements = vidasContainer.querySelectorAll('.vida');
        
        if (vidasElements[vidas]) {
            // Adicionar classe de animação
            vidasElements[vidas].classList.add('perdida');
            
            // Remover animação após um tempo
            setTimeout(() => {
                vidasElements[vidas].classList.remove('perdida');
            }, 500);
        }
        
        // Atualizar display
        updateVidasDisplay();
        
        // Efeito shake no container
        vidasContainer.classList.add('shake');
        setTimeout(() => {
            vidasContainer.classList.remove('shake');
        }, 500);
        
        // Som de vida perdida (opcional)
        playSound('perderVida');
    }
    
    if (vidas === 0) {
        setTimeout(() => gameOver(), 1000);
    }
}

// Função para tocar sons (opcional)
function playSound(soundType) {
    // Você pode adicionar sons depois
    console.log(`Som: ${soundType}`);
}

function gameOver() {
    jogoConcluido = true;
    clearInterval(timerInterval);
    
    const answerInput = document.getElementById('answer');
    if (answerInput) answerInput.disabled = true;
    
    // Mostrar mensagem de game over
    const mensagemFinal = document.getElementById('mensagem-final');
    const mensagemTexto = document.getElementById('mensagem-texto');
    const restartButton = document.getElementById('restart-button');
    
    if (mensagemFinal && mensagemTexto) {
        mensagemTexto.innerHTML = `
            <h2>💀 Game Over! 💀</h2>
            <p>Você perdeu todas as vidas.</p>
            <p>BTC minerados: ${bitcoinQuantity.toFixed(8)}</p>
            <p>Pontuação final: ${score}</p>
            <p>Blocos quebrados: ${brokenBlocks}</p>
        `;
        mensagemFinal.style.display = 'block';
    }
    // Som de game over
    SoundSystem.gameover();
    
    // Salvar no ranking
    setTimeout(() => {
        RankingSystem.saveGameScore(false);
    }, 1500);


    if (restartButton) {
        restartButton.style.display = 'inline-block';
    }
}

function endGame(isVictory = true) {
    jogoConcluido = true;
    clearInterval(timerInterval);
    
    const answerInput = document.getElementById('answer');
    if (answerInput) answerInput.disabled = true;
    
    // Mostrar mensagem final
    const mensagemFinal = document.getElementById('mensagem-final');
    const mensagemTexto = document.getElementById('mensagem-texto');
    const restartButton = document.getElementById('restart-button');
    
    if (mensagemFinal && mensagemTexto) {
        if (isVictory) {
            SoundSystem.win();
            mensagemTexto.innerHTML = `
                <h2>🎉 Parabéns! 🎉</h2>
                <p>Você completou todos os blocos!</p>
                <p>BTC minerados: ${bitcoinQuantity.toFixed(8)}</p>
                <p>Pontuação final: ${score}</p>
                <p>Blocos quebrados: ${brokenBlocks}</p>
                <p>Você é um verdadeiro minerador!</p>
            `;
        } else {
            SoundSystem.gameover();
            mensagemTexto.innerHTML = `
                <h2>💀 Game Over! 💀</h2>
                <p>Você perdeu todas as vidas.</p>
                <p>BTC minerados: ${bitcoinQuantity.toFixed(8)}</p>
                <p>Pontuação final: ${score}</p>
            `;
        }
        // Salvar no ranking
        setTimeout(() => {
            RankingSystem.saveGameScore(isVictory);
        }, 1500);
        mensagemFinal.style.display = 'block';
    }
    
    if (restartButton) {
        restartButton.style.display = 'inline-block';
    }
}

function mostrarMensagemIncentivo(index) {
    const mensagemContainer = document.getElementById('mensagem-container');
    if (!mensagemContainer) return;
    
    // Verificar se o índice é válido
    if (index >= 0 && index < mensagensDeIncentivo.length) {
        const mensagem = mensagensDeIncentivo[index];
        
        // Criar mensagem estilizada
        mensagemContainer.innerHTML = `
            <div style="
                background: linear-gradient(135deg, rgba(247, 147, 26, 0.95), rgba(255, 193, 7, 0.95));
                color: white;
                padding: 20px;
                border-radius: 15px;
                border: 3px solid gold;
                box-shadow: 0 10px 30px rgba(247, 147, 26, 0.4);
                text-align: center;
                font-size: 1.2em;
                font-weight: bold;
                animation: popIn 0.5s ease;
                max-width: 400px;
                margin: 0 auto;
            ">
                <div style="font-size: 2em; margin-bottom: 10px;">🎉</div>
                <div>${mensagem}</div>
                <div style="margin-top: 10px; font-size: 0.8em; opacity: 0.8;">
                    Bloco ${brokenBlocks} quebrado!
                </div>
            </div>
        `;
        
        mensagemContainer.style.display = 'block';
        mensagemContainer.style.position = 'fixed';
        mensagemContainer.style.top = '50%';
        mensagemContainer.style.left = '50%';
        mensagemContainer.style.transform = 'translate(-50%, -50%)';
        mensagemContainer.style.zIndex = '10000';
        mensagemContainer.style.width = '100%';
        mensagemContainer.style.maxWidth = '500px';
        
        // Auto-esconder após 3 segundos
        setTimeout(() => {
            mensagemContainer.style.opacity = '0';
            mensagemContainer.style.transform = 'translate(-50%, -50%) scale(0.9)';
            mensagemContainer.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                mensagemContainer.style.display = 'none';
                mensagemContainer.style.opacity = '1';
                mensagemContainer.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 500);
        }, 3000);
    }
}

function showHistory(chapter) {
    const historyText = [
        "2009: Criação do Bitcoin por Satoshi Nakamoto. O whitepaper 'Bitcoin: A Peer-to-Peer Electronic Cash System' é publicado.",
        "2010: Primeira transação comercial - Laszlo Hanyecz compra 2 pizzas por 10.000 BTC (valor hoje: milhões de dólares!).",
        "2012: Primeiro halving - recompensa de bloco reduzida de 50 para 25 BTC. Bitcoin Foundation é estabelecida.",
        "2013: Bitcoin atinge $1.000 pela primeira vez. O FBI fecha o Silk Road e apreende 144.000 BTC.",
        "2014: Maior exchange da época, Mt. Gox, declara falência após perder 850.000 BTC. Preço cai para $300.",
        "2015: Ethereum é lançado, trazendo smart contracts. Coinbase se torna a primeira exchange unicórnio.",
        "2016: Segundo halving - recompensa cai para 12.5 BTC. Bitcoin é reconhecido como moeda no Japão.",
        "2017: Bitcoin atinge $20.000. ICOs se tornam populares. CME lança futuros de Bitcoin.",
        "2018: Grande correção - Bitcoin cai para $3.200. Início do 'Crypto Winter'.",
        "2019: Facebook anuncia Libra (Diem). China anuncia blockchain como prioridade nacional.",
        "2020: Terceiro halving - recompensa reduzida para 6.25 BTC. PayPal permite compra de Bitcoin.",
        "2021: Bitcoin atinge ATH de $69.000. El Salvador adota Bitcoin como moeda legal.",
        "2022: 'Crypto Winter' retorna após colapso de LUNA/UST. FTX entra em colapso.",
        "2023: Bitcoin sobe 150% no ano. Aprovação do primeiro ETF de Bitcoin spot nos EUA.",
        "2024: Quarto halving - recompensa cai para 3.125 BTC. Bitcoin supera $80.000."
    ];

    const historyContainer = document.getElementById("history-container");
    if (!historyContainer) return;
    
    // Garantir que o capítulo seja válido
    const chapterIndex = Math.min(Math.max(1, chapter), historyText.length);
    
    historyContainer.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: white;
            padding: 25px;
            border-radius: 15px;
            border: 2px solid #f7931a;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            margin: 20px auto;
            max-width: 600px;
            text-align: center;
            animation: slideIn 0.5s ease;
        ">
            <h3 style="color: #f7931a; margin-bottom: 20px; font-size: 1.8em;">
                📖 História do Bitcoin - Capítulo ${chapterIndex}
            </h3>
            <div style="
                background: rgba(255,255,255,0.05);
                padding: 20px;
                border-radius: 10px;
                border-left: 4px solid #f7931a;
                text-align: left;
                line-height: 1.6;
                font-size: 1.1em;
            ">
                ${historyText[chapterIndex - 1]}
            </div>
            <div style="margin-top: 20px; font-size: 0.9em; color: #aaa;">
                ⚡ Continue minerando para desbloquear o próximo capítulo!
            </div>
            <button onclick="this.parentElement.style.display='none'" style="
                margin-top: 20px;
                padding: 10px 25px;
                background: #f7931a;
                color: white;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            ">
                Fechar
            </button>
        </div>
    `;
    
    historyContainer.style.display = 'block';
    historyContainer.style.position = 'fixed';
    historyContainer.style.top = '50%';
    historyContainer.style.left = '50%';
    historyContainer.style.transform = 'translate(-50%, -50%)';
    historyContainer.style.zIndex = '10001';
    historyContainer.style.width = '90%';
    historyContainer.style.maxWidth = '700px';
    
    // Adicionar overlay escuro
    let overlay = document.getElementById('history-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'history-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.01);
            z-index: 10000;
            display: none;
        `;
        overlay.onclick = () => {
            historyContainer.style.display = 'none';
            overlay.style.display = 'none';
        };
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'block';
}

function generateHash(blockNumber) {
    const date = new Date();
    const randomPart = Math.random().toString(36).substring(2, 15);
    const hash = `000000${randomPart}${blockNumber.toString().padStart(6, '0')}`;
    const timestamp = date.toLocaleString('pt-BR');
    return `Bloco #${blockNumber} | Hash: ${hash} | Minerado em: ${timestamp}`;
}

function updateHashLog(blockNumber) {
    const hash = generateHash(blockNumber);
    const hashDisplay = document.getElementById('hash-display');
    
    if (!hashDisplay) return;
    
    // Remover texto inicial
    if (hashDisplay.textContent.trim() === "Nenhum bloco quebrado ainda.") {
        hashDisplay.innerHTML = '';
    }
    
    const newHashElement = document.createElement('div');
    newHashElement.className = 'hash-box';
    newHashElement.textContent = hash;
    
    // Adicionar no topo
    hashDisplay.prepend(newHashElement);
    
    // Manter apenas os últimos 5 hashes
    const hashes = hashDisplay.children;
    while (hashes.length > 5) {
        hashes[hashes.length - 1].remove();
    }
}

function showHelp() {
    alert(`🎮 AJUDA DO JOGOBITCOIN 🎮

📋 COMO JOGAR:
1. Escolha uma dificuldade (Fácil/Médio/Difícil)
2. Descriptografe o texto apresentado
3. Digite a resposta em MINÚSCULAS
4. Pressione ENTER ou clique em "Validar Resposta"

🔐 TIPOS DE CRIPTOGRAFIA:

1. CIFRA DE CÉSAR:
   • Cada letra é deslocada por uma chave
   • Ex: Chave +3: A → D, B → E, C → F
   • Dica: Tente todas as letras do alfabeto

2. CÓDIGO ASCII:
   • Cada grupo de 3 números é um caractere
   • Ex: 065 = A, 066 = B, 067 = C
   • Use uma tabela ASCII se necessário

3. BASE64:
   • Texto codificado em formato web
   • Ex: "Qml0Y29pbg==" = "Bitcoin"
   • Pode usar atob() no console para testar

💡 DICAS:
• Respostas são sempre em minúsculas
• Sem espaços extras ou pontuação
• Use o timer como guia
• A cada 5 blocos, história do Bitcoin!

⏰ TEMPO:
• Fácil: 60 segundos
• Médio: 40 segundos  
• Difícil: 20 segundos

💰 RECOMPENSAS:
• + Bitcoin por bloco quebrado
• + Pontos por velocidade
• História a cada 5 blocos

Boa mineração! ⛏️🚀`);
}

// ============================================
// ANIMAÇÕES E EFEITOS CSS (via JavaScript)
// ============================================
document.head.insertAdjacentHTML('beforeend', `
<style>
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    
    .pulse {
        animation: pulse 1s infinite;
    }
    
    .dica-box {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 5px;
        padding: 8px;
        margin-top: 10px;
        color: #856404;
        font-size: 0.9em;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
</style>
`);

// ============================================
// LOG INICIAL
// ============================================
console.log('JogoBitcoin carregado com sucesso!');
console.log(`Total de nomes de criptoativos: ${cryptoNomes.length}`);

// Função para recuperar vida (opcional - para power-ups futuros)
function recuperarVida() {
    if (vidas < 3 && !jogoConcluido) {
        const vidaAnterior = vidas;
        vidas++;
        
        // Efeito visual na vida recuperada
        const vidasContainer = document.getElementById('vidas-container');
        const vidasElements = vidasContainer.querySelectorAll('.vida');
        
        if (vidasElements[vidaAnterior]) {
            vidasElements[vidaAnterior].classList.add('recuperada');
            
            setTimeout(() => {
                vidasElements[vidaAnterior].classList.remove('recuperada');
            }, 700);
        }
        
        // Atualizar display
        updateVidasDisplay();
        
        // Mensagem de feedback
        mostrarMensagemTemporaria('+1 Vida Recuperada!', '#4CAF50');
    }
}

// Função para mostrar mensagem temporária
function mostrarMensagemTemporaria(texto, cor) {
    const mensagem = document.createElement('div');
    mensagem.textContent = texto;
    mensagem.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${cor};
        color: white;
        padding: 10px 20px;
        border-radius: 25px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: slideDown 0.5s ease, fadeOut 1s ease 2s forwards;
    `;
    
    document.body.appendChild(mensagem);
    
    setTimeout(() => {
        mensagem.remove();
    }, 3000);
}
// Função de teste rápido para histórico
function testarHistoricoSimples() {
    console.log('🧪 Testando histórico...');
    
    // Mostrar capítulo 1
    showHistory(1);
    
    // Após 3 segundos, mostrar capítulo 2
    setTimeout(() => {
        // Primeiro remover o anterior (se existir)
        const modalAnterior = document.getElementById('history-modal');
        if (modalAnterior) modalAnterior.remove();
        
        // Mostrar novo
        showHistory(2);
    }, 4000);
    
    console.log('✅ Teste iniciado!');
}

// No Console (F12), digite: testarHistoricoSimples()

// ============================================
// SISTEMA DE MENU, CONTATO E AVALIAÇÃO - VERSÃO CORRIGIDA
// ============================================

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Criar menu apenas se não existir
    if (!document.getElementById('main-menu')) {
        criarMenu();
    }
    
    // Inicializar contador de visitas
    inicializarContadorVisitas();
});

// ============================================
// FUNÇÃO PARA CRIAR O MENU
// ============================================
function criarMenu() {
    // Criar botão do menu
    const menuButton = document.createElement('button');
    menuButton.id = 'menu-button';
    menuButton.innerHTML = '☰';
    menuButton.title = 'Menu';
    menuButton.style.cssText = `
        position: fixed;
        top: 7px;
        left: 185px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #9c27b0, #673ab7);
        color: white;
        border: 2px solid #ba68c8;
        font-size: 1.5em;
        cursor: pointer;
        z-index: 10001;
        box-shadow: 0 4px 15px rgba(156, 39, 176, 0.5);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    menuButton.onmouseover = () => {
        menuButton.style.transform = 'scale(1.1)';
        menuButton.style.boxShadow = '0 8px 25px rgba(156, 39, 176, 0.7)';
    };
    
    menuButton.onmouseout = () => {
        menuButton.style.transform = 'scale(1)';
        menuButton.style.boxShadow = '0 4px 15px rgba(156, 39, 176, 0.5)';
    };
    
    menuButton.onclick = toggleMenu;
    
    document.body.appendChild(menuButton);
    
    // Criar estrutura do menu
    const menuHTML = `
        <div id="main-menu" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 20000;">
            <div id="menu-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(3px);"></div>
            <div id="menu-content" style="position: absolute; top: 0; right: 0; width: 350px; height: 100%; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-left: 3px solid #f7931a; box-shadow: -10px 0 40px rgba(0,0,0,0.5); display: flex; flex-direction: column;">
                
                <!-- Cabeçalho -->
                <div style="padding: 25px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: #f7931a; margin: 0; font-size: 1.4em;">⚙️ MENU</h3>
                    <button onclick="fecharMenu()" style="background: rgba(255,255,255,0.1); border: none; color: #aaa; font-size: 2em; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">×</button>
                </div>
                
                <!-- Itens do Menu -->
                <div style="flex: 1; padding: 20px 0; overflow-y: auto;">
                    <div onclick="abrirContato()" style="padding: 18px 25px; display: flex; align-items: center; gap: 15px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); transition: all 0.3s ease;" onmouseover="this.style.background='rgba(247,147,26,0.1)'; this.style.paddingLeft='30px'" onmouseout="this.style.background='transparent'; this.style.paddingLeft='25px'">
                        <span style="font-size: 1.8em; width: 40px;">📧</span>
                        <div>
                            <div style="color: white; font-weight: bold;">Contato</div>
                            <div style="color: #aaa; font-size: 0.9em;">Envie sua mensagem</div>
                        </div>
                    </div>
                    
                    <div onclick="mostrarCriador()" style="padding: 18px 25px; display: flex; align-items: center; gap: 15px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); transition: all 0.3s ease;" onmouseover="this.style.background='rgba(247,147,26,0.1)'; this.style.paddingLeft='30px'" onmouseout="this.style.background='transparent'; this.style.paddingLeft='25px'">
                        <span style="font-size: 1.8em; width: 40px;">👨‍💻</span>
                        <div>
                            <div style="color: white; font-weight: bold;">Criador</div>
                            <div style="color: #aaa; font-size: 0.9em;">Alex A.G. Ramos</div>
                            <br>
                            <div style="color: white; font-weight: bold;">Colaborador</div>
                            <div style="color: #aaa; font-size: 0.9em;">Junior</div>

                        </div>
                    </div>
                    
                    <div onclick="abrirCadastro()" style="padding: 18px 25px; display: flex; align-items: center; gap: 15px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); transition: all 0.3s ease;" onmouseover="this.style.background='rgba(247,147,26,0.1)'; this.style.paddingLeft='30px'" onmouseout="this.style.background='transparent'; this.style.paddingLeft='25px'">
                        <span style="font-size: 1.8em; width: 40px;">📰</span>
                        <div>
                            <div style="color: white; font-weight: bold;">Novidades</div>
                            <div style="color: #aaa; font-size: 0.9em;">Cadastre-se</div>
                        </div>
                    </div>
                    
                    <div onclick="abrirAvaliacao()" style="padding: 18px 25px; display: flex; align-items: center; gap: 15px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); transition: all 0.3s ease;" onmouseover="this.style.background='rgba(247,147,26,0.1)'; this.style.paddingLeft='30px'" onmouseout="this.style.background='transparent'; this.style.paddingLeft='25px'">
                        <span style="font-size: 1.8em; width: 40px;">⭐</span>
                        <div>
                            <div style="color: white; font-weight: bold;">Avaliar Jogo</div>
                            <div style="color: #aaa; font-size: 0.9em;">Dê sua opinião</div>
                        </div>
                    </div>
                    
                    <div onclick="abrirDashboard()" style="padding: 18px 25px; display: flex; align-items: center; gap: 15px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); transition: all 0.3s ease;" onmouseover="this.style.background='rgba(247,147,26,0.1)'; this.style.paddingLeft='30px'" onmouseout="this.style.background='transparent'; this.style.paddingLeft='25px'">
                        <span style="font-size: 1.8em; width: 40px;">📊</span>
                        <div>
                            <div style="color: white; font-weight: bold;">Dashboard</div>
                            <div style="color: #aaa; font-size: 0.9em;">Ver dados coletados</div>
                        </div>
                    </div>
                    
                    <div onclick="abrirSobre()" style="padding: 18px 25px; display: flex; align-items: center; gap: 15px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); transition: all 0.3s ease;" onmouseover="this.style.background='rgba(247,147,26,0.1)'; this.style.paddingLeft='30px'" onmouseout="this.style.background='transparent'; this.style.paddingLeft='25px'">
                        <span style="font-size: 1.8em; width: 40px;">ℹ️</span>
                        <div>
                            <div style="color: white; font-weight: bold;">Sobre</div>
                            <div style="color: #aaa; font-size: 0.9em;">Versão 1.0</div>
                        </div>
                    </div>
                </div>
                
                <!-- Rodapé -->
                <div style="padding: 20px 25px; border-top: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); display: flex; justify-content: space-between; align-items: center;">
                    <div style="color: #64b5f6; display: flex; align-items: center; gap: 8px;">
                        <span>👁️</span>
                        <span id="visit-count">0</span> visitas
                    </div>
                    <div style="color: #888;">JogoBitcoin v1.0</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', menuHTML);
    
    // Evento para fechar ao clicar no overlay
    document.getElementById('menu-overlay').onclick = fecharMenu;
    
}

// ============================================
// FUNÇÕES DO MENU
// ============================================

function toggleMenu() {
    const menu = document.getElementById('main-menu');
    if (menu.style.display === 'flex' || menu.style.display === 'block') {
        fecharMenu();
    } else {
        abrirMenu();
    }
}

function abrirMenu() {
    const menu = document.getElementById('main-menu');
    menu.style.display = 'block';
    
    // Atualizar contador
    atualizarContadorVisitas();
    
    // Efeito no botão
    const btn = document.getElementById('menu-button');
    btn.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
    btn.style.borderColor = '#81c784';
    
    if (SoundSystem && SoundSystem.click) SoundSystem.click();
}

function fecharMenu() {
    const menu = document.getElementById('main-menu');
    menu.style.display = 'none';
    
    // Efeito no botão
    const btn = document.getElementById('menu-button');
    btn.style.background = 'linear-gradient(135deg, #9c27b0, #673ab7)';
    btn.style.borderColor = '#ba68c8';
    
    if (SoundSystem && SoundSystem.click) SoundSystem.click();
}

// ============================================
// FUNÇÃO PARA FECHAR TODOS OS MODAIS
// ============================================
function fecharTodosModais() {
    // Fechar todos os modais
    const modais = document.querySelectorAll('.modal-contato, .modal-cadastro, .modal-avaliacao, .modal-dashboard');
    modais.forEach(modal => {
        if (modal && modal.parentElement) {
            modal.parentElement.remove();
        }
    });
    
    // Restaurar scroll da página
    document.body.style.overflow = 'none';
}

// ============================================
// CONTADOR DE VISITAS
// ============================================

function inicializarContadorVisitas() {
    let visitas = localStorage.getItem('jogobitcoin_visitas');
    if (!visitas) {
        visitas = 1;
    } else {
        visitas = parseInt(visitas) + 1;
    }
    localStorage.setItem('jogobitcoin_visitas', visitas);
    atualizarContadorVisitas();
}

function atualizarContadorVisitas() {
    const visitas = localStorage.getItem('jogobitcoin_visitas') || 0;
    const contador = document.getElementById('visit-count');
    if (contador) {
        contador.textContent = visitas;
    }
}

// ============================================
// CONTATO - VERSÃO CORRIGIDA
// ============================================

// ATUALIZAR: abrirContato()
function abrirContato() {
    fecharMenu();
    fecharTodosModais();
    
    const email = 'guedes_ramos@hotmail.com';
    const assunto = 'Contato sobre JogoBitcoin';
    const corpo = `Olá Alex,\n\nEstou entrando em contato através do JogoBitcoin.\n\nMinha mensagem:\n\n\nAtenciosamente,\n[Jogador do JogoBitcoin]`;
    
    const modal = document.createElement('div');
    modal.className = 'modal-contato';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 30000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; border-radius: 20px; border: 3px solid #2196f3; max-width: 500px; width: 90%; text-align: center; color: white; box-shadow: 0 20px 60px rgba(0,0,0,0.8);">
            <h3 style="color: #2196f3; margin-bottom: 20px; font-size: 1.5em;">📧 Contato</h3>
            <p style="margin-bottom: 20px; color: #ddd;">Envie sua mensagem diretamente:</p>
            
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <div style="font-size: 1.1em; margin-bottom: 15px;">
                    <strong style="color: #2196f3;">Email:</strong> ${email}
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <a href="mailto:${email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}" 
                       target="_blank" 
                       style="flex: 1; background: #2196f3; color: white; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: bold; transition: all 0.3s ease; cursor: pointer;"
                       onmouseover="this.style.background='#1976d2'"
                       onmouseout="this.style.background='#2196f3'">
                        ✉️ Enviar Email
                    </a>
                    
                    <button onclick="copiarEmail('${email}')" style="background: #4CAF50; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.3s ease;"
                        onmouseover="this.style.background='#45a049'"
                        onmouseout="this.style.background='#4CAF50'">
                        📋 Copiar
                    </button>
                </div>
            </div>
            
            <div style="background: rgba(255,193,7,0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: left; border-left: 4px solid #FFC107;">
                <p style="margin: 0; color: #FFC107; font-weight: bold;">ℹ️ Informação:</p>
                <p style="margin: 5px 0 0; color: #ddd; font-size: 0.9em;">
                    Ao enviar email, o assunto virá como "Contato sobre JogoBitcoin" para fácil identificação.
                </p>
            </div>
            
            <button onclick="fecharModal(this)" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 12px 30px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.3s ease;"
                onmouseover="this.style.background='rgba(255,0,0,0.3)'"
                onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                Fechar
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'auto';
    
    if (SoundSystem && SoundSystem.click) SoundSystem.click();
}

function copiarEmail(email) {
    navigator.clipboard.writeText(email).then(() => {
        // Mostrar notificação
        const notificacao = document.createElement('div');
        notificacao.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #4CAF50;
            color: white;
            padding: 12px 25px;
            border-radius: 50px;
            z-index: 40000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease;
        `;
        notificacao.textContent = '📋 Email copiado para área de transferência!';
        document.body.appendChild(notificacao);
        
        setTimeout(() => {
            notificacao.remove();
        }, 3000);
    });
}

function mostrarCriador() {
    fecharMenu();
    fecharTodosModais();
    
    const modal = document.createElement('div');
    modal.className = 'modal-contato';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 30000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; border-radius: 20px; border: 3px solid #9c27b0; max-width: 400px; width: 90%; text-align: center; color: white;">
            <div style="font-size: 4em; margin-bottom: 20px;">👨‍💻</div>
            <h3 style="color: #9c27b0; margin-bottom: 15px;">Criador do Jogo</h3>
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <p style="margin: 10px 0;"><strong style="color: #9c27b0;">Nome:</strong> Alex A.G. Ramos</p>
                <p style="margin: 10px 0;"><strong style="color: #9c27b0;">Email:</strong> guedes_ramos@hotmail.com</p>
                <p style="margin: 10px 0;"><strong style="color: #9c27b0;">Jogo:</strong> JogoBitcoin v1.0</p>
                <p style="margin: 10px 0;"><strong style="color: #9c27b0;">Ano:</strong> ${new Date().getFullYear()}</p>
            </div>
            <br>
            <h3 style="color: #9c27b0; margin-bottom: 15px;">Colaborador do Jogo</h3>
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <p style="margin: 10px 0;"><strong style="color: #9c27b0;">Nome:</strong> Junior</p>
            </div>
            <p style="color: #aaa; font-style: italic; margin-bottom: 20px;">
                "Desenvolvido com paixão por criptografia e educação"
            </p>
            <button onclick="fecharModal(this)" style="background: linear-gradient(135deg, #9c27b0, #7b1fa2); color: white; border: none; padding: 12px 40px; border-radius: 25px; cursor: pointer; font-weight: bold;">Fechar</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'auto';
    if (SoundSystem && SoundSystem.click) SoundSystem.click();
}

// ============================================
// CADASTRO PARA NOVIDADES - VERSÃO CORRIGIDA
// ============================================

function abrirCadastro() {
    fecharMenu();
    fecharTodosModais();
    
    const modal = document.createElement('div');
    modal.className = 'modal-cadastro';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 30000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; border-radius: 20px; border: 3px solid #f7931a; max-width: 450px; width: 90%; color: white;">
            <h3 style="color: #f7931a; text-align: center; margin-bottom: 20px; font-size: 1.5em;">📰 Cadastro de Novidades</h3>
            <p style="text-align: center; margin-bottom: 25px; color: #ddd;">Receba atualizações sobre o JogoBitcoin</p>
            
            <form onsubmit="enviarCadastro(event, this)">
                <div style="margin-bottom: 15px;">
                    <input type="text" id="nome-cadastro" placeholder="Seu nome completo" required style="width: 100%; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(247,147,26,0.3); color: white; font-size: 1em;">
                </div>
                <div style="margin-bottom: 15px;">
                    <input type="email" id="email-cadastro" placeholder="Seu melhor email" required style="width: 100%; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(247,147,26,0.3); color: white; font-size: 1em;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: flex; align-items: center; gap: 10px; color: #aaa; cursor: pointer;">
                        <input type="checkbox" id="termos-cadastro" required style="width: 18px; height: 18px;">
                        <span>Aceito receber novidades por email</span>
                    </label>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button type="submit" style="flex: 2; background: linear-gradient(135deg, #f7931a, #e68200); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.3s ease;">📝 Cadastrar</button>
                    <button type="button" onclick="fecharModal(this)" style="flex: 1; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 12px; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;">Cancelar</button>
                </div>
            </form>
            
            <div style="margin-top: 20px; color: #888; font-size: 0.8em; text-align: center;">
                Seus dados não serão compartilhados. Apenas para novidades do jogo.
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'auto';
    if (SoundSystem && SoundSystem.click) SoundSystem.click();
}

function enviarCadastro(event, form) {
    event.preventDefault();
    
    const nome = document.getElementById('nome-cadastro').value;
    const email = document.getElementById('email-cadastro').value;
    
    // Salvar no localStorage
    const cadastros = JSON.parse(localStorage.getItem('jogobitcoin_cadastros') || '[]');
    
    // Verificar se já existe
    const existe = cadastros.find(c => c.email === email);
    if (existe) {
        alert('❌ Este email já está cadastrado!');
        return;
    }
    
    cadastros.push({ 
        nome, 
        email, 
        data: new Date().toLocaleString('pt-BR'),
        timestamp: Date.now()
    });
    localStorage.setItem('jogobitcoin_cadastros', JSON.stringify(cadastros));
    
    // Mensagem de sucesso
    alert(`✅ Cadastro realizado com sucesso!\n\nObrigado, ${nome}! Você receberá novidades sobre o JogoBitcoin em:\n${email}`);
    
    fecharModal(form);
    if (SoundSystem && SoundSystem.correct) SoundSystem.correct();
}

// ============================================
// SISTEMA DE AVALIAÇÃO - VERSÃO CORRIGIDA
// ============================================

function abrirAvaliacao() {
    fecharMenu();
    fecharTodosModais();
    
    const modal = document.createElement('div');
    modal.className = 'modal-avaliacao';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 30000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; border-radius: 20px; border: 3px solid #ffcc00; max-width: 450px; width: 90%; color: white;">
            <h3 style="color: #ffcc00; text-align: center; margin-bottom: 20px; font-size: 1.5em;">⭐ Avalie o JogoBitcoin</h3>
            <p style="text-align: center; margin-bottom: 25px; color: #ddd;">Sua opinião é muito importante para nós!</p>
            
            <!-- Estrelas -->
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: flex; justify-content: center; gap: 15px; font-size: 3em;">
                    ${[1,2,3,4,5].map(i => `<span onclick="selecionarNota(${i})" class="estrela-${i}" style="cursor: pointer; color: #666; transition: all 0.2s; display: inline-block;">★</span>`).join('')}
                </div>
                <div id="texto-avaliacao" style="margin-top: 10px; color: #ffcc00; font-weight: bold; min-height: 25px;"></div>
            </div>
            
            <!-- Comentário -->
            <div style="margin-bottom: 20px;">
                <textarea id="comentario-avaliacao" placeholder="Deixe seu comentário (opcional)..." style="width: 100%; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,204,0,0.3); color: white; margin-bottom: 20px; resize: vertical; min-height: 100px; font-family: inherit;"></textarea>
            </div>
            
            <!-- Botões -->
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <button onclick="enviarAvaliacao()" style="flex: 2; background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer;">📤 Enviar Avaliação</button>
                <button onclick="fecharModal(this)" style="flex: 1; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 12px; border-radius: 8px; cursor: pointer;">Cancelar</button>
            </div>
            
            <!-- Estatísticas -->
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; color: #aaa; font-size: 0.9em; margin-bottom: 10px;">
                    <span>⭐ Média:</span>
                    <span id="media-avaliacao"><strong>${calcularMediaAvaliacoes()}</strong>/5</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: #aaa; font-size: 0.9em;">
                    <span>📊 Total de avaliações:</span>
                    <span id="total-avaliacoes"><strong>${getTotalAvaliacoes()}</strong></span>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'auto';
    
    // Resetar nota
    window.notaSelecionada = 0;
    atualizarTextoAvaliacao(0);
    
    if (SoundSystem && SoundSystem.click) SoundSystem.click();
}

// Variável global para nota selecionada
window.notaSelecionada = 0;

function selecionarNota(nota) {
    window.notaSelecionada = nota;
    
    // Atualizar cores das estrelas
    for (let i = 1; i <= 5; i++) {
        const estrela = document.querySelector(`.estrela-${i}`);
        if (estrela) {
            if (i <= nota) {
                estrela.style.color = '#ffcc00';
                estrela.style.textShadow = '0 0 15px rgba(255, 204, 0, 0.7)';
                estrela.style.transform = 'scale(1.1)';
            } else {
                estrela.style.color = '#666';
                estrela.style.textShadow = 'none';
                estrela.style.transform = 'scale(1)';
            }
        }
    }
    
    atualizarTextoAvaliacao(nota);
    if (SoundSystem && SoundSystem.click) SoundSystem.click();
}

function atualizarTextoAvaliacao(nota) {
    const textos = ['', '😕 Péssimo', '😐 Ruim', '🙂 Regular', '😊 Bom', '🤩 Excelente!'];
    const textoElement = document.getElementById('texto-avaliacao');
    if (textoElement) {
        textoElement.textContent = textos[nota] || '';
    }
}

function enviarAvaliacao() {
    try {
        if (window.notaSelecionada === 0) {
            alert('❌ Por favor, selecione uma avaliação com as estrelas!');
            return;
        }
        
        const comentario = document.getElementById('comentario-avaliacao')?.value || '';
        
        // Salvar avaliação
        const avaliacoes = JSON.parse(localStorage.getItem('jogobitcoin_avaliacoes') || '[]');
        avaliacoes.push({
            nota: window.notaSelecionada,
            comentario: comentario,
            data: new Date().toLocaleString('pt-BR'),
            timestamp: Date.now()
        });
        localStorage.setItem('jogobitcoin_avaliacoes', JSON.stringify(avaliacoes));
        
        // Mensagem de agradecimento
        const mensagens = ['😐', '🙂', '😊', '🤩', '🥳'];
        alert(`${mensagens[window.notaSelecionada-1]} Obrigado pela avaliação!\n\nNota: ${window.notaSelecionada} estrelas\n${comentario ? 'Comentário: "' + comentario + '"' : 'Sem comentário'}`);
        
        // Fechar todos os modais
        const modaisAbertos = document.querySelectorAll('.modal-contato, .modal-cadastro, .modal-avaliacao, .modal-dashboard, .modal-dashboard-publico, .modal-admin');
        modaisAbertos.forEach(modal => {
            try {
                if (modal && modal.parentElement) {
                    modal.parentElement.remove();
                }
            } catch (e) {
                console.warn('Erro ao remover modal:', e);
            }
        });
        
        // 🔴 RESTAURAR SCROLL - VERSÃO ULTRA SEGURA
        try {
            if (document && document.body) {
                document.body.style.overflow = 'auto';
                document.body.style.height = 'auto';
                console.log('✅ Scroll restaurado');
            }
        } catch (e) {
            console.warn('Não foi possível restaurar scroll:', e);
            // Se falhar, tentar novamente após 100ms
            setTimeout(() => {
                if (document && document.body) {
                    document.body.style.overflow = 'auto';
                }
            }, 100);
        }
        
        // Restaurar visibilidade da tela principal (COM VERIFICAÇÕES)
        const restaurarElementos = () => {
            try {
                if (jogoConcluido) {
                    setStyle('mensagem-final', 'display', 'block');
                    setStyle('restart-button', 'display', 'inline-block');
                } 
                else if (currentProblem > 1 && vidas > 0) {
                    setStyle('difficulty-selection', 'display', 'none');
                    setStyle('info-container', 'display', 'none');
                    setStyle('problem-container', 'display', 'flex');
                    setStyle('game-container', 'display', 'flex');
                    setStyle('hash-log', 'display', 'flex');
                } 
                else {
                    setStyle('difficulty-selection', 'display', 'block');
                    setStyle('info-container', 'display', 'flex');
                    setStyle('problem-container', 'display', 'none');
                    setStyle('game-container', 'display', 'none');
                    setStyle('hash-log', 'display', 'none');
                }
            } catch (e) {
                console.warn('Erro ao restaurar elementos:', e);
            }
        };
        
        restaurarElementos();
        
        if (SoundSystem && SoundSystem.correct) SoundSystem.correct();
        
    } catch (erro) {
        console.error('❌ Erro geral em enviarAvaliacao:', erro);
        // Em caso de erro grave, recarregar a página
        setTimeout(() => window.location.reload(), 500);
    }
}

// Função auxiliar para setar estilo com segurança
function setStyle(id, prop, value) {
    try {
        const el = document.getElementById(id);
        if (el) {
            el.style[prop] = value;
        }
    } catch (e) {
        console.warn(`Erro ao setar ${prop} em ${id}:`, e);
    }
}

// 🔴 CORREÇÃO 4: Função calcularMediaAvaliacoes corrigida
function calcularMediaAvaliacoes() {
    const avaliacoes = JSON.parse(localStorage.getItem('jogobitcoin_avaliacoes') || '[]');
    if (avaliacoes.length === 0) return '0.0';
    const soma = avaliacoes.reduce((sum, a) => sum + a.nota, 0);
    return (soma / avaliacoes.length).toFixed(1);
}

function calcularMediaAvaliacoes() {
    const avaliacoes = JSON.parse(localStorage.getItem('jogobitcoin_avaliacoes') || '[]');
    if (avaliacoes.length === 0) return '0.0';
    const soma = avaliacoes.reduce((sum, a) => sum + a.nota, 0);
    return (soma / avaliacoes.length).toFixed(1);
}

function getTotalAvaliacoes() {
    const avaliacoes = JSON.parse(localStorage.getItem('jogobitcoin_avaliacoes') || '[]');
    return avaliacoes.length;
}

// ============================================
// DASHBOARD - VER DADOS COLETADOS
// ============================================

function abrirDashboard() {
    fecharMenu();
    fecharTodosModais();
    
    const cadastros = JSON.parse(localStorage.getItem('jogobitcoin_cadastros') || '[]');
    const avaliacoes = JSON.parse(localStorage.getItem('jogobitcoin_avaliacoes') || '[]');
    
    const modal = document.createElement('div');
    modal.className = 'modal-dashboard';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 30000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    // Gerar lista de cadastros
    const listaCadastros = cadastros.length > 0 
        ? cadastros.map(c => `<li>📧 ${c.nome} - ${c.email} (${c.data})</li>`).join('')
        : '<li style="color: #888;">Nenhum cadastro ainda</li>';
    
    // Gerar lista de avaliações
    const listaAvaliacoes = avaliacoes.length > 0
        ? avaliacoes.map(a => `<li>⭐ ${a.nota} estrelas - ${a.comentario || 'Sem comentário'} (${a.data})</li>`).join('')
        : '<li style="color: #888;">Nenhuma avaliação ainda</li>';
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; border-radius: 20px; border: 3px solid #2196f3; max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto; color: white;">
            <h3 style="color: #2196f3; text-align: center; margin-bottom: 20px; font-size: 1.5em;">📊 Dashboard</h3>
            
            <!-- Estatísticas Gerais -->
            <div style="display: flex; gap: 20px; margin-bottom: 30px; background: rgba(33,150,243,0.1); padding: 20px; border-radius: 10px;">
                <div style="flex: 1; text-align: center;">
                    <div style="font-size: 2em; color: #ffcc00;">👁️</div>
                    <div style="font-size: 1.5em; font-weight: bold;">${localStorage.getItem('jogobitcoin_visitas') || 0}</div>
                    <div style="color: #aaa;">Visitas</div>
                </div>
                <div style="flex: 1; text-align: center;">
                    <div style="font-size: 2em; color: #4CAF50;">📰</div>
                    <div style="font-size: 1.5em; font-weight: bold;">${cadastros.length}</div>
                    <div style="color: #aaa;">Cadastros</div>
                </div>
                <div style="flex: 1; text-align: center;">
                    <div style="font-size: 2em; color: #ffcc00;">⭐</div>
                    <div style="font-size: 1.5em; font-weight: bold;">${avaliacoes.length}</div>
                    <div style="color: #aaa;">Avaliações</div>
                </div>
            </div>
            
            <!-- Abas -->
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <button onclick="mostrarAba('cadastros')" id="aba-cadastros-btn" style="flex: 1; padding: 10px; background: #2196f3; color: white; border: none; border-radius: 5px; cursor: pointer;">📰 Cadastros</button>
                <button onclick="mostrarAba('avaliacoes')" id="aba-avaliacoes-btn" style="flex: 1; padding: 10px; background: rgba(255,255,255,0.1); color: white; border: none; border-radius: 5px; cursor: pointer;">⭐ Avaliações</button>
            </div>
            
            <!-- Lista de Cadastros -->
            <div id="lista-cadastros" style="display: block; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; max-height: 300px; overflow-y: auto;">
                <h4 style="color: #4CAF50; margin-bottom: 15px;">📰 Cadastros para Novidades</h4>
                <ul style="list-style: none; padding: 0;">
                    ${listaCadastros}
                </ul>
            </div>
            
            <!-- Lista de Avaliações (inicialmente oculta) -->
            <div id="lista-avaliacoes" style="display: none; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; max-height: 300px; overflow-y: auto;">
                <h4 style="color: #ffcc00; margin-bottom: 15px;">⭐ Avaliações dos Jogadores</h4>
                <ul style="list-style: none; padding: 0;">
                    ${listaAvaliacoes}
                </ul>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="fecharModal(this)" style="background: #f44336; color: white; border: none; padding: 12px 40px; border-radius: 25px; cursor: pointer; font-weight: bold;">Fechar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'auto';
    if (SoundSystem && SoundSystem.click) SoundSystem.click();
}

// ============================================
// FUNÇÃO MOSTRAR ABA CORRIGIDA (COM VERIFICAÇÕES)
// ============================================
function mostrarAba(aba) {
    console.log('📊 Mostrando aba:', aba);
    
    const cadastros = document.getElementById('lista-cadastros');
    const avaliacoes = document.getElementById('lista-avaliacoes');
    const btnCadastros = document.getElementById('aba-cadastros-btn');
    const btnAvaliacoes = document.getElementById('aba-avaliacoes-btn');
    
    // VERIFICAR SE OS ELEMENTOS EXISTEM ANTES DE USAR
    if (!cadastros || !avaliacoes || !btnCadastros || !btnAvaliacoes) {
        console.log('⚠️ Elementos do dashboard não encontrados - ignorando chamada');
        return; // Sai da função sem fazer nada
    }
    
    if (aba === 'cadastros') {
        cadastros.style.display = 'block';
        avaliacoes.style.display = 'none';
        btnCadastros.style.background = '#2196f3';
        btnAvaliacoes.style.background = 'rgba(255,255,255,0.1)';
    } else {
        cadastros.style.display = 'none';
        avaliacoes.style.display = 'block';
        btnCadastros.style.background = 'rgba(255,255,255,0.1)';
        btnAvaliacoes.style.background = '#2196f3';
    }
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function abrirSobre() {
    fecharMenu();
    fecharTodosModais();
    
    const modal = document.createElement('div');
    modal.className = 'modal-contato';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 30000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; border-radius: 20px; border: 3px solid #f7931a; max-width: 400px; width: 90%; text-align: center; color: white;">
            <div style="font-size: 4em; margin-bottom: 20px;">🎮</div>
            <h3 style="color: #f7931a; margin-bottom: 15px;">JogoBitcoin v1.0</h3>
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <p style="margin: 10px 0;">Um jogo educativo sobre criptografia e Bitcoin</p>
                <p style="margin: 10px 0;">Aprenda enquanto se diverte minerando!</p>
                <p style="margin: 20px 0; color: #aaa;">© ${new Date().getFullYear()} - Todos os direitos reservados</p>
            </div>
            <button onclick="fecharModal(this)" style="background: linear-gradient(135deg, #f7931a, #e68200); color: white; border: none; padding: 12px 40px; border-radius: 25px; cursor: pointer; font-weight: bold;">OK</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'auto';
    if (SoundSystem && SoundSystem.click) SoundSystem.click();
}

// ============================================
// FUNÇÕES AUXILIARES - VERSÃO CORRIGIDA
// ============================================

// ============================================
// FUNÇÃO FECHAR MODAL - VERSÃO SEGURA (SEM IDs FIXOS)
// ============================================
function fecharModal(elemento) {
    console.log('🔽 Fechando modal...');
    
    // Encontrar o modal mais próximo e remover
    let modal = elemento;
    let encontrou = false;
    
    while (modal && modal.parentElement) {
        // Verificar se é um modal (qualquer div com classe que contenha 'modal')
        if (modal.classList && modal.classList.length > 0) {
            for (let i = 0; i < modal.classList.length; i++) {
                if (modal.classList[i].includes('modal')) {
                    modal.parentElement.remove();
                    encontrou = true;
                    break;
                }
            }
        }
        if (encontrou) break;
        modal = modal.parentElement;
    }
    
    // Se não encontrou nenhum modal, tentar remover o elemento diretamente
    if (!encontrou && elemento && elemento.parentElement) {
        elemento.parentElement.remove();
    }
    
    // RESTAURAR A TELA PRINCIPAL
    restaurarTelaPrincipal();
    
    if (SoundSystem && SoundSystem.click) SoundSystem.click();
}

// ============================================
// FUNÇÃO PARA RESTAURAR A TELA PRINCIPAL
// ============================================
function restaurarTelaPrincipal() {
    console.log('🔄 Restaurando tela principal...');
    
    // Verificar cada elemento antes de acessar
    const elements = {
        'difficulty-selection': document.getElementById('difficulty-selection'),
        'info-container': document.getElementById('info-container'),
        'problem-container': document.getElementById('problem-container'),
        'game-container': document.getElementById('game-container'),
        'hash-log': document.getElementById('hash-log'),
        'mensagem-final': document.getElementById('mensagem-final'),
        'restart-button': document.getElementById('restart-button')
    };
    
    // Verificar se os elementos principais existem
    if (!elements['difficulty-selection']) {
        console.error('❌ Elemento difficulty-selection não encontrado!');
        // Se não existir, recriar a página
        window.location.reload();
        return;
    }
    
    // Restaurar baseado no estado do jogo
    if (jogoConcluido) {
        // Jogo terminado
        if (elements['mensagem-final']) elements['mensagem-final'].style.display = 'block';
        if (elements['restart-button']) elements['restart-button'].style.display = 'inline-block';
        if (elements['difficulty-selection']) elements['difficulty-selection'].style.display = 'none';
        if (elements['info-container']) elements['info-container'].style.display = 'none';
        if (elements['problem-container']) elements['problem-container'].style.display = 'none';
        if (elements['game-container']) elements['game-container'].style.display = 'none';
        if (elements['hash-log']) elements['hash-log'].style.display = 'none';
    } 
    else if (currentProblem > 1 && vidas > 0 && !jogoConcluido) {
        // Jogo em andamento
        if (elements['difficulty-selection']) elements['difficulty-selection'].style.display = 'none';
        if (elements['info-container']) elements['info-container'].style.display = 'none';
        if (elements['problem-container']) elements['problem-container'].style.display = 'flex';
        if (elements['game-container']) elements['game-container'].style.display = 'flex';
        if (elements['hash-log']) elements['hash-log'].style.display = 'flex';
        if (elements['mensagem-final']) elements['mensagem-final'].style.display = 'none';
        
        // Restaurar timer se necessário
        if (remainingTime > 0 && !timerInterval && !jogoConcluido) {
            startTimer();
        }
    } 
    else {
        // Tela inicial
        if (elements['difficulty-selection']) elements['difficulty-selection'].style.display = 'block';
        if (elements['info-container']) elements['info-container'].style.display = 'flex';
        if (elements['problem-container']) elements['problem-container'].style.display = 'none';
        if (elements['game-container']) elements['game-container'].style.display = 'none';
        if (elements['hash-log']) elements['hash-log'].style.display = 'none';
        if (elements['mensagem-final']) elements['mensagem-final'].style.display = 'none';
    }
    
    // Restaurar scroll
    document.body.style.overflow = 'auto';
}

// Função auxiliar para abrir modais com melhor controle
function abrirModalComControle(elemento) {
    // Desabilitar scroll de forma segura
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
}

// Função auxiliar para restaurar scroll
function restaurarScroll() {
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    
    if (scrollY) {
        window.scrollTo(0, -parseInt(scrollY));
    }
}

// Fechar com ESC - VERSÃO CORRIGIDA
/*document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
         Contar modais abertos
        const modaisAbertos = document.querySelectorAll('.modal-contato, .modal-cadastro, .modal-avaliacao, .modal-dashboard');
        
        if (modaisAbertos.length > 0) {
            // Fechar o modal mais recente
            const ultimoModal = modaisAbertos[modaisAbertos.length - 1];
            fecharModal(ultimoModal);
        } else {
            // Fechar menu se nenhum modal aberto
            const menu = document.getElementById('main-menu');
            if (menu && menu.style.display === 'block') {
                fecharMenu();
            }
        }
    }
});*/

console.log('✅ Sistema de Menu, Contato e Avaliação carregado!');
