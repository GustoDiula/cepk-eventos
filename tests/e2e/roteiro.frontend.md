# Roteiro manual E2E — Frontend (sessão real — atualizado 2026-10-29)

Executor: ___________ · Data: ___________ · Navegador: ___________

Responda ✔/✘ em cada item. Falhas devem ser registradas no rodapé.

## 1. Responsividade (RNF01/CA-07)
- [ ] Em 360 px: sem rolagem horizontal indevida em `/` e em `/turma.html`
- [ ] Em 360 px: grade de turmas e lista de atividades empilham em coluna única
- [ ] Em 768/1440 px: conteúdo centralizado com larguras maiores
- [ ] Independente da largura: nada sobrepõe/oculta texto

## 2. Navegação (sidebar desktop / bottom-nav mobile)
- [ ] Desktop (≥768 px): sidebar com Início / Turmas / Minhas inscrições / Sobre + botão "Entrar" (sem sessão)
- [ ] Celular (<768 px): barra inferior fixa com os mesmos 4 destinos; sem sobrepor o conteúdo
- [ ] Anônimo abrindo `/turma.html` → REDIRECIONAMENTO para `/login.html` (nada fica aberto por engano)
- [ ] `/` → página inicial mostra o calendário geral (feriados oficiais do Paraná 2026, com fonte citada) e o dia de hoje destacado
- [ ] `/` → cartões de feriado com data vencida exibem selo "Já passou" e ficam apagados; ao virar o dia, mudam sozinhos (D-021)
- [ ] `/` → setas ◀ ▶ navegam os meses, travando em janeiro/dezembro de 2026; botão "hoje" aparece fora do mês corrente

## 3. Sessão real (D-024)
- [ ] `/login.html` → lista de contas de demonstração mostra APENAS os e-mails `.test`; nenhuma senha em tela
- [ ] E-mail inexistente OU senha errada → a MESMA mensagem de erro nos dois casos (não revela o que falhou)
- [ ] 6ª tentativa com falha seguida → aviso de limite de tentativas (aguardar alguns minutos)
- [ ] Entrar com uma das contas + senha inicial (definida no `.env`) → cabeçalho passa a mostrar "NOME · papel" com botão Sair
- [ ] `Sair` → cabeçalho volta a "Entrar"; abrir `/turma.html` volta a redirecionar para o login (sessão destruída no servidor)
- [ ] DevTools → Application → Local Storage/Session Storage VAZIOS; nada de identidade/sessão guardada no navegador

## 4. Turmas por perfil (D-023/D-025 — decide o BANCO)
- [ ] Aluno 1 → somente "1º A" e o calendário desta turma abre direto (com 1 turma não há passo de escolha)
- [ ] Aluno 2 → somente "1º B"
- [ ] Professora de Geografia → somente 1º A, 1º B e 1º C
- [ ] Pedagoga 1 → as 10 turmas (7 técnicas + 3 regulares)
- [ ] Diretora → as 10 turmas
- [ ] Os cartões identificam o tipo ("curso técnico" quando for o caso)

## 5. Calendário e atividades da turma
- [ ] Calendário da turma com títulos e destaques: prova vencida aparece com "✓" e tooltip "Já passou — …" (D-021)
- [ ] Setas ◀ ▶ limitadas ao intervalo de datas das atividades da turma; botão "hoje" fora do mês corrente
- [ ] Lista de atividades com selo por tipo (Prova / Viagem / Trabalho / Boletim) e HORA CORRETA (fuso da escola; ex.: prova das 08:00 não aparece como 11:00)
- [ ] Atividade com inscrição mostra a contagem de vagas informada pelo servidor (ex.: "30 de 45 vagas")
- [ ] Telas de turma marcam "(dados de demonstração)"; nenhum dado real do CEPK além dos feriados oficiais

## 6. Conteúdo e privacidade (RNF10)
- [ ] Nenhum texto visível mostra siglas técnicas (RF10, RN08, D-009 etc.) — linguagem clara para alunos
- [ ] Nenhuma senha aparece em lugar nenhum (nem na tela, nem no HTML, nem no service worker)
- [ ] Nenhum nome/telefone/e-mail real aparece em qualquer tela (contas usam e-mails `.test`)

## 7. Páginas de detalhe e inscrições (protótipo — aguardando servidor, etapas 6–7)
- [ ] `/evento.html` → "Ver modal de confirmação" abre o modal; "Inscrever-se" e "Cancelar inscrição" ficam desabilitados (aguardando servidor)
- [ ] `/inscricoes.html` → abas Ativas/Histórico alternam com o MOUSE e com as setas ← → do teclado; estados Confirmada / Em análise / Cancelada visíveis
- [ ] `/turma.html`, `/evento.html` e `/inscricoes.html` → link "← Voltar" retorna corretamente

## 8. PWA base (parcial — conclusão apenas na etapa 8/RF09)
- [ ] DevTools → Application → Manifest mostra "CEPK Eventos"
- [ ] DevTools → Application → Service Workers mostra o service worker registrado

## Observações/falhas
_(anotar aqui)_
