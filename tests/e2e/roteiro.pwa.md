# Roteiro manual E2E — PWA (Etapa 8)

Executor: ___________ · Data: ___________ · Navegador: ___________

## 1. Instalação
- [ ] DevTools → Application → Manifest: nome "CEPK Eventos", ícones 192/512 visíveis
- [ ] DevTools → Application → Service Workers: "ativado e em execução"
- [ ] Menu do navegador → "Instalar CEPK Eventos" (localhost) — abre janela própria com ícone
- [ ] App instalado abre standalone (sem barra do navegador)

## 2. Offline (D-008/RF17/CA-10)
- [ ] Com app aberto: DevTools → Network → Offline; recarregar página: continua visível (cache)
- [ ] Banner vermelho aparece: "Você está offline — dados podem estar desatualizados"
- [ ] Em `/evento.html`, botão "Inscrever-se" permanece desabilitado (etapa 7) e NENHUMA chamada
      `/api` é disparada enquanto offline (DevTools → Network: vazio)
- [ ] Reconectar (Online): banner desaparece

## 3. Privacidade do cache (RNF10/RNF07)
- [ ] DevTools → Application → Cache Storage → cepk-shell-v1: NENHUMA chave contém `/api/`
- [ ] Após interações, cache contém apenas: páginas públicas, css, js, manifest, ícones

## 4. Atualização (procedimento documentado)
- [ ] Alterar `VERSAO` no service-worker.js e recarregar → cache antigo sai, novo entra

## Observações/falhas
_(anotar aqui)_
