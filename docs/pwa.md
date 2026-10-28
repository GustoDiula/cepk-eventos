# PWA — implementação, verificações e limitações por navegador (etapa 8)

Status: 🟢 implementada per docs (2026-10-28). Este documento registra **o que foi
verificado de verdade** e **o que só se confirma com HTTPS/hospedagem (P-2)**.

## 1. Decisões visíveis no código

| Elemento | Onde | Regra-chave |
|---|---|---|
| Manifest completo | `src/frontend/pwa/manifest.webmanifest` | `start_url`/`scope` `/`, `standalone`, ícones 192/512 + maskable (CA-06) |
| Ícones | `src/frontend/pwa/icons/*.png` | gerados por `scripts/gerar-icones.ps1` (placeholder visual — design final fica a dever) |
| Service worker | `src/frontend/pwa/service-worker.js` | cache **somente leitura** do shell; `/api/**` nunca cacheado (RN08/RF17); métodos de escrita nunca interceptados (RNF07) |
| Atualização | constante `VERSAO` no SW | nova versão: incrementar e publicar; no `activate`, caches antigos são apagados |
| Banner offline | `src/frontend/js/offline.js` | exibe aviso `role=alert`; volta online: some |
| Bloqueio offline | `src/frontend/js/api.js` | sem conexão: `CONEXAO_EXIGIDA` **antes do fetch**; rede caindo no meio: idem — nada é enviado duas vezes nem confirmado pelo cliente (RNF07) |

## 2. Verificado de fato (evidências da etapa)

- `npm test`: manifest/ícones/SW validados por testes unitários e integração (saída no relatório da etapa).
- Navegador Chromium in-app: SW registrado, cache `cepk-shell-v1` preenchido com o shell,
  `/api/v1/health` **no** presente nos caches; 0 erros de console.
- Instalação pelo menu do navegador no `localhost` (Chromium trata localhost como contexto seguro).

## 3. Depende de HTTPS/hospedagem (P-2 — ainda não paramos nada)

- Prompt automático de instalação (Chromium) — só em HTTPS público.
- Instalar em celular de verdade (Android/iOS).
- Ciclo de atualização do SW em produção (navegador revalida até a cada 24h).
- `theme_color`/`background_color` visíveis na splash screen em Android.

## 4. Limitações por navegador (sem prometer o que não dá)

| Navegador | Instalação | Service worker | Observações |
|---|---|---|---|
| Chrome/Edge (desktop+Android) | ✔ menu agora; ✔ prompt com HTTPS | ✔ completo | referência oficial de comportamento |
| Firefox | manualmente pelo mesmo (sem prompt) | ✔ | sem `beforeinstallprompt` |
| Safari iOS | só "Adicionar à Tela de Início" | ✔ com restrições (eviction; sem prompt) | offline básico funciona; app tabs novas |
| Outros | ⇢ verificar suporte atual antes de prometer | — | fonte: caniuse (verificação quando relevante) |

## 5. Avisos

- Os ícones atuais são gerados localmente e são **placeholder visual** — melhorar arte não muda requisitos.
- O checklist manual (`tests/e2e/roteiro.pwa.md`) deve ser executado por você — resultados
  manuais com data dizem a verdade sobre o que foi visto (regra 11).
