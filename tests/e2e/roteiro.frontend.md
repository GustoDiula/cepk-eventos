# Roteiro manual E2E — Frontend estático (Etapa 3)

Executor: ___________ · Data: ___________ · Navegador: ___________

Responda ✔/✘ em cada item. Falhas devem ser registradas no rodapé.

## 1. Responsividade (RNF01/CA-07)
- [ ] Em 360 px: sem rolagem horizontal indevida em `/`
- [ ] Em 360 px: cartões de turma empilham em coluna única
- [ ] Em 768 px: grade de turmas em 3 colunas
- [ ] Em 1440 px: conteúdo centralizado com largura maior
- [ ] Regardless de largura: nada sobrepõe/oculta texto

## 2. Navegação
- [ ] `/` → link "Turma exemplo" abre `/turma.html`
- [ ] `/` → link "Ver detalhe" abre `/evento.html`
- [ ] `/turma.html` → "← Voltar ao calendário" retorna a `/`
- [ ] `/login.html` → botão desabilitado e aviso de F-2 visível
- [ ] `/evento.html` → botão "Inscrever-se" desabilitado com legenda da etapa 7

## 3. Conteúdo e privacidade (RNF10)
- [ ] Todos os textos de dados mostram a marcação "fictício"
- [ ] Nenhum nome/telefone/e-mail real aparece em qualquer tela
- [ ] Nenhum texto promete recursos que ainda não existem

## 4. PWA base (parcial — conclusão apenas na etapa 8/RF09)
- [ ] DevTools → Application → Manifest mostra "CEPK Eventos"
- [ ] DevTools → Application → Service Workers mostra registrado (inofensivo)

## Observações/falhas
_(anotar aqui)_
