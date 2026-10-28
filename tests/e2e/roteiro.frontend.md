# Roteiro manual E2E — Frontend estático (Etapa 3)

Executor: ___________ · Data: ___________ · Navegador: ___________

Responda ✔/✘ em cada item. Falhas devem ser registradas no rodapé.

## 1. Responsividade (RNF01/CA-07)
- [ ] Em 360 px: sem rolagem horizontal indevida em `/`
- [ ] Em 360 px: cartões de turma empilham em coluna única
- [ ] Em 768 px: grade de turmas em 3 colunas
- [ ] Em 1440 px: conteúdo centralizado com largura maior
- [ ] Regardless de largura: nada sobrepõe/oculta texto

## 2. Navegação (redesign: sidebar desktop / bottom nav no celular)
- [ ] Desktop (≥768 px): sidebar fixa com Início / Turmas / Minhas inscrições / Sobre + botão "Entrar"
- [ ] Celular (<768 px): barra inferior fixa com os mesmos 4 destinos; sem sobrepor o conteúdo
- [ ] Todos os links "Turmas" levam à página da turma (`/turma.html`); nenhum link quebra
- [ ] `/` → SEM seção de turmas; página inicial mostra só o calendário geral (feriados) e dia de hoje destacado
- [ ] `/` → cartões de feriado com data já vencida exibem selo "Já passou" e ficam apagados
- [ ] `/` → setas ◀ ▶ navegam os meses; ◀ trava em janeiro/2026 e ▶ trava em dezembro/2026
- [ ] `/` → botão "hoje" (só visível fora do mês corrente) volta ao mês atual
- [ ] Ao passar o dia, dias/marcas/console anteriores a hoje ganham "passado" automaticamente sem editar código
- [ ] `/turma.html` → título com o nome da turma; calendário da turma (provas), legenda; prova do dia destacada; setas limitadas ao intervalo das provas (out–dez/2026)
- [ ] `/turma.html` → link "Ver detalhe" (viagem pedagógica) abre `/evento.html` com badges (Turma / Exige inscrição)
- [ ] `/evento.html` → "Ver modal de confirmação" abre o modal; "Inscrever-se" e "Cancelar inscrição" desabilitados (aguardando servidor)
- [ ] `/inscricoes.html` → abas Ativas/Histórico alternam com O MOUSE e com as setas ← → do teclado; estados Confirmada / Em análise / Cancelada visíveis
- [ ] `/sobre.html` → conteúdo sem dados reais da escola
- [ ] `/turma.html`, `/evento.html` e `/inscricoes.html` → links "← Voltar" retornam corretamente
- [ ] `/login.html` → entrar com QUALQUER e-mail/senha cria sessão "(demo)" persistente; senha jamais aparece em lugar nenhum

## 3. Conteúdo e privacidade (RNF10)
- [ ] Nenhum texto visível mostra siglas técnicas (RF10, RN08, D-009 etc.) — linguagem clara para alunos
- [ ] Todos os textos de dados mostram a marcação "fictício" (exceto feriados — oficiais, com fonte citada)
- [ ] Nenhum nome/telefone/e-mail real aparece em qualquer tela
- [ ] Nenhum texto promete recursos que ainda não existem

## 4. PWA base (parcial — conclusão apenas na etapa 8/RF09)
- [ ] DevTools → Application → Manifest mostra "CEPK Eventos"
- [ ] DevTools → Application → Service Workers mostra registrado (inofensivo)

## Observações/falhas
_(anotar aqui)_
