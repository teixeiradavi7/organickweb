# Programa Organick — TODO

## Navegação (Navbar)
- [x] Logo Organick no navbar
- [x] Links: Início, Minha Conta, Sobre nós (em português)
- [x] Navbar com efeito frost/opaco ao rolar
- [x] Menu hambúrguer mobile
- [x] Botão "Entrar" no desktop (redireciona para /login)

## Hero Section (Home)
- [x] Container sticky com altura de viewport inteira
- [x] Vídeo scroll-driven: avança ao rolar, volta ao subir
- [x] Scrubbing suave via requestAnimationFrame
- [x] Texto overlay: "Seja bem-vindo ao" + "Programa Organick"
- [x] Dois botões CTA: "Meu Primeiro Login" e "Já tenho minha conta"
- [x] "Meu Primeiro Login" → /onboarding (First Login / Onboarding)
- [x] "Já tenho minha conta" → /login (Login Page)
- [x] Responsivo (desktop + mobile)

## Página de Login (/login)
- [x] Campo: "Qual o seu email?"
- [x] Campo: "Qual sua senha?"
- [x] Botão: "Acessar"
- [x] Login via tRPC com JWT session
- [x] Feedback de sucesso/erro via toast
- [x] Redirect para /members após login
- [x] Link para "Meu Primeiro Login" (onboarding)

## Primeiro Login / Onboarding (/onboarding)
- [x] Fluxo step-by-step (8 passos)
- [x] Passo 1: Qual o seu email? (text)
- [x] Passo 2: Crie uma senha (password, mín. 8 caracteres)
- [x] Passo 3: Qual o nome da sua agência? (text)
- [x] Passo 4: Há quanto tempo você tem sua agência? (single-choice: 4 opções)
- [x] Passo 5: Quantas pessoas trabalham na sua agência? (single-choice: 4 opções)
- [x] Passo 6: Quantos clientes sua agência já atende? (numérico)
- [x] Passo 7: Qual o seu faturamento médio mensal? (currency R$)
- [x] Passo 8: Qual o melhor horário para call de onboarding? (single-choice: 2 opções)
- [x] Botão final: "Dar vida à minha agência"
- [x] Vaso vazio (pot visual) no lado direito
- [x] Criação de conta + salvamento do diagnóstico na submissão
- [x] Redirect para /members após completar
- [x] Barra de progresso visual

## Área do Membro / Diagnóstico (/members)
- [x] Header com logo Organick e botão Sair
- [x] Título: "Diagnóstico"
- [x] Card de informações da agência (nome, tempo)
- [x] Barra de Saúde da agência
- [x] Barra de Tamanho
- [x] Cards: Equipe, Clientes, Faturamento, Call de onboarding
- [x] Blocos placeholder: Módulos (Em breve / Bloqueado)
- [x] Visual de planta (pot) no lado direito
- [x] Rota protegida (redirect se não autenticado)
- [x] Redirect para /onboarding se onboarding não completado

## Minha Conta (/account)
- [x] Rota protegida
- [x] Perfil do usuário (avatar, nome, email)
- [x] Info de login e data de criação
- [x] Botão de logout
- [x] Textos em português

## Sobre nós (/about)
- [x] Página sobre o Programa Organick
- [x] Valores: Método, Simplicidade, Resultado
- [x] Frase de missão
- [x] Footer com logo e copyright

## Backend
- [x] Schema drizzle com users, localCredentials, onboardingResponses
- [x] bcrypt password hashing
- [x] JWT session via cookie
- [x] Auth middleware (protectedProcedure)
- [x] Mutation: register (cria conta local)
- [x] Mutation: login (autentica e retorna session)
- [x] Mutation: completeOnboarding (salva respostas + marca como completo)
- [x] Query: getDashboard (retorna dados do usuário + respostas do diagnóstico)
- [x] Função: getOnboardingResponses (busca dados salvos do diagnóstico)

## Style & Polish
- [x] Apple-inspired white/light color palette
- [x] SF Pro / Inter typography
- [x] Espaçamento generoso, animações sutis
- [x] Transições suaves em todos os elementos interativos
- [x] Totalmente responsivo (desktop + mobile)
- [x] Todos os textos em português brasileiro

## Testes
- [x] Auth register/login procedure unit tests


## Phase 3 - Plant Classification & Signup Flow

### Signup Flow
- [x] Redirect to /login after onboarding completion (instead of /members)
- [x] User must login to access members area

### Plant Classification System
- [x] Create plant classification utility (plantClassification.ts)
- [x] Map 6 plant types to agency metrics (team size, clients, revenue, age)
- [x] Plant types: Broto em Risco, Broto Promissor, Planta em Tração, Tração Instável, Planta Escalável, Gigante Exausta
- [x] Upload all plant PNGs to CDN
- [x] Display classified plant on Members diagnostic page (right side)
- [x] Show plant label and description based on agency classification


## Phase 4 - Diagnostic Page Layout Restructure

- [x] Restructure Members page layout per Miro reference
  - [x] Left sidebar with "Diagnóstico" title and 4 content blocks
  - [x] Center plant visual (2 cols) with full-width display
  - [x] Right sidebar with agency name, health bar, size bar
  - [x] Bottom section with "Próximos passos" modules
  - [x] Responsive layout for mobile


## Phase 5 - Urgency Classification & Diagnostics

- [x] Create urgency classification utility with all 6 plant types
  - [x] Map each plant to urgency level (muito baixa, baixa, moderada, alta, muito alta)
  - [x] Define positivos, negativos, resumo for each classification
  - [x] Use agencyName in all text templates
- [x] Update Members page to display urgency diagnostics
  - [x] Show urgency level with visual indicator
  - [x] Display pontos positivos in clean card format
  - [x] Display pontos negativos in clean card format
  - [x] Show resumo do diagnóstico
  - [x] Maintain premium, clean design
