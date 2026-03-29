# 🪙 Roteiro — JogoBitcoin

Este documento apresenta todas as melhorias implementadas e planejadas para o JogoBitcoin, organizadas por prioridade e estágio de desenvolvimento.

---

## 📋 Sumário
- [✅ Concluído](#-concluído)
- [🟢 Prioridade Alta](#-1-prioridade-alta-em-andamento)
- [🟡 Melhorias de Experiência](#-2-melhorias-de-experiência)
- [🔵 Novos Recursos](#-3-novos-recursos-planejados)
- [🟣 Melhorias Futuras](#-4-melhorias-futuras-em-avaliação)
- [📊 Progresso Geral](#-progresso-geral)
- [🚀 Próximos Passos](#-próximos-passos-2-semanas)
- [📝 Issues para Contribuição](#-issues-abertas-para-contribuição)
- [🎯 Meta Principal](#-meta-principal)

---

## ✅ **CONCLUÍDO**

### 🏗️ Estrutura Inicial
- ✅ Publicação inicial do repositório
- ✅ Adição de README, LICENSE e Código de Conduta
- ✅ Documentação completa do projeto
- ✅ Organização de assets na pasta `/assets`
- ✅ Criação de `ROADMAP.md` com visão completa do projeto

### 🎨 Design e Identidade Visual
- ✅ **Modernização completa da tela inicial** (Fixes #5)
  - Google Fonts: Poppins, Inter e Orbitron
  - Título com gradiente e efeito glow
  - Cards interativos com sombras e hover effects
  - Paleta de cores otimizada (laranja Bitcoin + tons escuros)
  - Animações suaves de entrada
- ✅ **Implementação de Múltiplas Moedas no Tracker** (Fixes #21)
  - Adição dinâmica de logos SVG oficiais (cryptocurrency-icons) integrados na mineração
- ✅ **Limpeza do Design da Tela Inicial** (Fixes #22)
  - Ocultação de menus flutuantes dinâmicos no estado ocioso e integração do Círculo de César na Sidebar

### 📱 Responsividade Mobile
- ✅ **Layout e Adaptação Completa para Dispositivos Móveis** (Fixes #15)
  - Conversão inteligente de 3 colunas para empilhamento vertical
  - Reordenação (Flex Order) para melhor navegação antes do início da partida
  - Botões flutuantes realocados em formato "Bottom Navigation Bar"
  - Telas e Modais (Skins, Chat, César) redimensionados à largura da tela

### 🏆 Sistema de Conquistas
- ✅ **Sistema persistente de conquistas por jogador** (Fixes #7)
  - localStorage com chave `jogobitcoin_conquistas`
  - Associação de conquistas ao nome do jogador
  - Painel de Conquistas (modal interativo)
  - Notificações em tempo real ao desbloquear conquistas

### 🛠️ Ferramentas de Apoio e Meta-Game
- ✅ **Ferramentas de decodificação** (Fixes #12)
  - Modal com 3 níveis de dificuldade (Slider -25 a +25, ASCII, Base64)
- ✅ **Simulador Visual de Blockchain e Hash Log**
  - Nova interface mostrando a cadeia de blocos estruturada e histórico
- ✅ **Sistema de Chat do Jogo**
  - Janela interativa para dicas e interação no jogo
- ✅ **Adição de Áudios Narrativos**
  - Integração de locuções completas para a progressão dos capítulos

### 👤 Perfil, Loja e Economia
- ✅ **Perfil do Jogador e Carteira (Wallet)**
  - Criação de avatar/login de usuário e cofre de saldo BTC ganho
- ✅ **Loja Virtual (Skins e Coins)**
  - Mercado para aquisição de cosméticos com moeda baseada no desempenho e mineração

### 🔧 Correções e Ajustes
- ✅ Renomeação da pasta `Stage` para `assets` normalizando as telas no GitHub Pages
- ✅ Ajuste na navegação (Avaliar, Cadastrar, Contato, Finalizar)
- ✅ **Atualização no nível Difícil** - Nova mecânica (Fixes #8)

---

## 🟢 **1. PRIORIDADE ALTA** (Em andamento)

### 📚 Expansão da Enciclopédia
- [ ] Adicionar novos termos:
  - [ ] Blockchain
  - [ ] Hash
  - [ ] Satoshi Nakamoto
  - [ ] Proof of Work
  - [ ] Proof of Stake
  - [ ] Halving
  - [ ] Mining Pool
  - [ ] Nonce
  - [ ] Merkle Tree
- [ ] Criar estrutura para contribuição da comunidade
- [ ] Busca de termos na enciclopédia
- [ ] Links para referências externas

---

## 🟡 **2. MELHORIAS DE EXPERIÊNCIA**

### ✨ Animações e Efeitos Visuais
- [ ] Animação no processo de mineração
- [ ] Feedback visual ao ganhar pontos
- [ ] Efeitos de partículas ao quebrar blocos
- [ ] Transições suaves entre telas
- [ ] Animação de "descoberta" ao desbloquear conquistas
- [ ] Loading states para carregamento

### 🔊 Efeitos Sonoros
- [x] Áudio narrativo completo para capítulos
- [ ] Som ao minerar um bloco
- [ ] Som ao desbloquear conquista
- [ ] Efeitos sonoros para erros/acertos
- [ ] Música de fundo / Controle de volume

### ♿ Acessibilidade
- [ ] Alto contraste
- [ ] Suporte a leitores de tela
- [ ] Navegação por teclado
- [ ] Opção de reduzir animações

---

## 🔵 **3. NOVOS RECURSOS** (Planejados)

### ⏱️ Sistema de Tempo e Recompensas por Desempenho
- [ ] Registrar tempo total da partida
- [ ] Criar metas combinadas (blocos + tempo)
  - ⚡ **Minerador Relâmpago:** 10 blocos em < 2 minutos
  - 🎯 **Cripto Ninja:** 20 blocos sem erros
  - 🔥 **Sequência Perfeita:** 5 blocos em < 30 segundos cada
  - 💨 **Velocidade da Luz:** 3 blocos em < 10 segundos
- [ ] Recompensas especiais (Selos, Títulos e Bônus de Moedas)

### 📊 Ranking Avançado
- [ ] Ranking por tempo
- [ ] Ranking por conquistas
- [ ] Ranking por satoshis acumulados
- [ ] Filtros e busca avançada
- [ ] Estatísticas detalhadas por jogador
- [ ] Gráficos de desempenho

---

## 🟣 **4. MELHORIAS FUTURAS** (Em avaliação)

### 🌐 Modo Multiplayer
- [x] Chat integrado do jogo base
- [ ] Desafios em tempo real
- [ ] Competições diárias e sazonais
- [ ] Torneios semanais
- [ ] Salas privadas com amigos

### 🎮 Novos Modos de Jogo
- [ ] **Modo Sobrevivência:** desafios infinitos com dificuldade crescente
- [ ] **Modo Contra o Relógio:** corrida contra o tempo
- [ ] **Modo Puzzle:** desafios especiais com pistas
- [ ] **Modo História Avançado:** progressão profunda com NPCs e quests
- [ ] **Modo Treino:** mecânicas sem pressão

### 🔐 Novos Tipos de Criptografia
- [ ] Cifra de Vigenère
- [ ] ROT13
- [ ] Binário e Hexadecimal
- [ ] Cifra de transposição

### 📈 Integração com Redes Sociais
- [ ] Compartilhar conquistas e recordes
- [ ] Desafiar amigos no ranking social
- [ ] Convites de gameplay e Login social

---

## 📊 **PROGRESSO GERAL**

| Categoria | Progresso | Status |
|-----------|-----------|--------|
| ✅ Concluído | 80% | 🟢 |
| 🟢 Alta Prioridade | 12% | 🟡 |
| 🟡 Melhorias | 10% | 🟡 |
| 🔵 Novos Recursos | 5% | 🔵 |
| 🟣 Futuro | 2% | ⚪ |

**Meta atual:** Alcançar 90% de conclusão até Junho/2026

---

## 🚀 **PRÓXIMOS PASSOS** (Próximas 2 semanas)

| Prioridade | Tarefa | Responsável | Previsão |
|------------|--------|-------------|----------|
| 🟡 Média | Expandir enciclopédia | Junior | 1 semana |
| 🟡 Média | Implementar animações básicas | Alex | 2 semanas |
| 🟢 Baixa | Testes automatizados | Ambos | Contínuo |

---

## 📝 **Issues Abertas para Contribuição**

| Issue | Descrição | Dificuldade | Tags |
|-------|-----------|-------------|------|
| ~~#15~~ | ~~Implementar versão mobile responsiva~~ | ✅ **Concluído** | `mobile`, `css` |
| #16 | Adicionar novos termos à enciclopédia | 🟢 Fácil | `documentação`, `conteúdo` |
| #17 | Criar animação de mineração | 🟡 Médio | `css`, `animação` |
| #18 | Implementar sistema de tempo | 🔴 Difícil | `js`, `feature` |
| #19 | Adicionar efeitos sonoros de ação | 🟡 Médio | `áudio`, `js` |
| #20 | Melhorar acessibilidade | 🟡 Médio | `a11y`, `ux` |
| ~~#21~~ | ~~Implementar widget multi-moeda e logos SVGs~~ | ✅ **Concluído** | `ui`, `feature` |
| ~~#22~~ | ~~Limpeza de UI (menus fantasma) e Tracker César~~ | ✅ **Concluído** | `ui`, `bugfix` |

**Contribua!** Veja o [CONTRIBUTING.md](CONTRIBUTING.md) para mais detalhes.

---

## 📅 **Histórico de Versões**

| Versão | Data | Principais Mudanças |
|--------|------|---------------------|
| 1.0.0 | Fev/2026 | Lançamento inicial |
| 2.0.0 | Mar/2026 | Nova interface, sistema de conquistas, ferramentas de decodificação |
| 2.1.0 | Mar/2026 | Loja de skins, carteira, simulador blockchain, perfil de jogador, chat e áudios narrativos |
| 2.2.0 | Mar/2026 | Responsividade Mobile e adaptação layout celular (App UI) |
| 2.2.1 | Mar/2026 | Suporte multi-moedas, Logos SVGs Oficiais, Correção UI Inicial e Círculo de César Integrado |
| 2.3.0 | Mai/2026 | (Planejado) Sistema de tempo e recompensas |

---

**Última atualização:** Março 2026  
**Versão atual:** 2.2.1  
**Contribuidores:** [Alex](https://github.com/LxNautico) e [Junior]

---

*Este roteiro está em constante evolução. Sugestões e contribuições são sempre bem-vindas!* 🪙
