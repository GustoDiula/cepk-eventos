# Hospedagem do produto real — Render + Neon (D-027)

v1.0 · 2026-11-02 · decisão D-027 (docs/decisoes.md)
Atualização 2026-11-03: primeiro deploy VERDE e bateria de verificação executada
(health ok/banco ok, páginas 200, API 401 sem sessão, manifest e SW com
`Service-Worker-Allowed: /`) — o produto real está acessível na URL do serviço.

Abordagem: subir o **produto REAL** (Node.js + Express + PostgreSQL) numa
hospedagem na nuvem com plano gratuito, para login real, calendário por vínculo
da API e inscrições funcionarem de qualquer lugar — como no servidor local.

> A **demo estática** do GitHub Pages (D-026) continua sendo a vitrine sem
> servidor. Este documento é sobre o produto real.

## 1. O que fica no ar

| Serviço | Endereço (exemplo) | Papel |
|---|---|---|
| Render — Web Service | `https://cepk-eventos-<sufixo>.onrender.com` | Node.js + Express servindo páginas, API e PWA |
| Neon — Database | (não é acessível por URL; só por `DATABASE_URL`) | PostgreSQL com schema + dados de demonstração |
| GitHub Pages | `https://gustodiula.github.io/cepk-eventos/` | demo estática (vitrine; D-026) |

## 2. O que já está feito NO REPOSITÓRIO (D-027)

- `src/backend/app.js` — `app.set('trust proxy', 1)` **só em produção**
  (atrás do rebalanceador do Render, o `Secure` do cookie e o IP vêm certos).
- `src/backend/db/pool.js` — ativa **TLS** quando a `DATABASE_URL` contém
  `sslmode=` (exigência do Neon; local continua igual).
- `package.json` — script **`subir:producao`**: `seed-demo.js`
  (idempotente: cria schema + dados sem duplicar) **e depois** `server.js`.
  Motivo: o plano gratuito do Render não tem terminal — tudo tem que
  acontecer no boot.
- `src/backend/config/env.js` — em produção **exige** `DATABASE_URL` e
  `SESSION_SECRET` (já existia; agora passamos a usá-lo).

## 3. O que VOCÊ configura (em segredo — nunca aqui, nunca no Git)

### 3.1 Contas (gratuitas)

1. **Neon**: <https://neon.com> → *Sign up* (pode usar a conta GitHub) →
   *Create project* → região mais próxima (ex.: São Paulo / AWS `sa-east`).
2. No painel do Neon, abra o projeto → *Connection details* → copie a
   **connection string** (formato `postgresql://...:SENHA@ep-...neon.tech/...`).
   Ela contém a senha do banco gerada pelo Neon.
   Se não aparecer `?sslmode=` no fim, acrescente `?sslmode=require`.
   ⚠️ Nunca cole essa string aqui no chat, no Git ou em qualquer arquivo.
3. **Render**: <https://render.com> → *Sign up* com a conta GitHub →
   autorize o acesso ao repositório `GustoDiula/cepk-eventos`.

### 3.2 Variáveis de ambiente no painel do Render

No *Web Service* → *Environment* → *Add Environment Variable*:

| Chave | Valor | Nota |
|---|---|---|
| `NODE_ENV` | `production` | liga cookie `Secure`, exigências do `env.js` |
| `DATABASE_URL` | (string do Neon, com senha, terminando em `sslmode=require`) | gerada pelo Neon; SÓ no painel |
| `SESSION_SECRET` | (sequência aleatória de 64 hex) | gerada com `npm run segredo` |
| `SENHA_DEMO` | (senha forte que VOCÊ escolhe) | senha única inicial das 5 contas `.test` — passe ao colega por mensagem **privada**, jamais no chat, Git ou docs |
| `BASE_URL` | `https://cepk-eventos-<sufixo>.onrender.com` | endereço público do sistema (RNF05) |
| `PORT` | (não configure) | o Render define a porta do próprio modo |

Para gerar o `SESSION_SECRET`, rode no terminal do projeto: `npm run segredo`.
A saída é um valor aleatório de 64 dígitos hexadecimais — copie direto para o
painel do Render. **Não** salve em arquivo, não cole em chat/Git/doc.
(Evite os comandos com `node -e`: o PowerShell do Windows costuma engolir as
aspas internas e o valor sai errado — defeito comprovado em 02/11.)

### 3.3 Configuração do Web Service

- **Repository** `GustoDiula/cepk-eventos` · **Branch** `master`
- **Build Command**: `npm ci`   · **Start Command**: `npm run subir:producao`
- **Instance type**: `Free`
- Depois de salvo, o primeiro deploy roda e os logs mostram
  `Seed de demonstração ok — usuarios: 5, turmas: 10, eventos: 27` e
  `CEPK Eventos: servidor ativo ...`.

### 3.4 Verificação (a fazer de verdade após o deploy)

1. `GET <URL>/api/v1/health` → `{"ok":true,"ambiente":"production","banco":"ok"}`.
2. Abrir `<URL>/` no navegador → página Início renderizada com estilo.
3. `<URL>/login.html` → entrar com `aluno1@cepk-eventos.test` +
   `SENHA_DEMO` (a que você configurou) → Turmas mostra 1º A com eventos.
4. Nova janela anônima, **sem** login: tentar abrir `/turma.html` →
   deve receber 401 da API (a permissão vem do banco, regra 7/D-025).
5. PWA: botão de instalar no navegador na `<URL>/` — o manifesto e o
   service worker funcionam porque o app está servido na RAIZ do domínio
   (ambos os caminhos absolutos batem).

## 4. O dia a dia

- Cada `git push` em `master` → **Render re-publica automaticamente**
  (igual ao Pages do D-026). Nada precisa ser feito no painel.
- As 5 contas são `.test` com senha única (a `SENHA_DEMO`): se um dia
  trocar, o seed NÃO sobrescreve senhas já existentes (idempotência);
  para trocar de senha das contas haverá ferramenta específica depois.

## 5. Limites do plano gratuito (esperáveis, não defeitos)

- Render free: serviço **dorme** após ~15 minutos sem requisições;
  a próxima visita leva ~30–60 s para acordar. Após adormecer, as sessões
  logadas continuam válidas (estão no PostgreSQL, D-024).
- Neon free: o banco também "adormece" quando inativo e acorda sozinho —
  a primeira consulta após o descanso é um pouco mais lenta.
- 750 horas/mês de web service (suficiente para 1 serviço 24/7) e
  armazenamento do banco ~0,5 GB — muito acima do demo atual.

## 6. Segurança do modo aberto ao público

- **Ninguém se cadastra**: não existe rota de cadastro; apenas as 5 contas
  semeadas existem (registro fechado).
- **Força-bruta**: limitador de tentativas de login (5 falhas por 15 min → 429).
- **Permissões**: aluno não vê eventos de outra turma; publicar/cancelar
  evento é papel de professor/direção — checados no BANCO (D-025, regra 8).
- **Segredos**: só no painel do Render. `.env` local nunca vai ao Git
  (`.gitignore`), valores nunca aparecem aqui.
- Cabeçalhos de segurança (helmet) ativos; CSP estrita permanece como
  pendência já documentada nas etapas 6–7.
- Autenticação institucional: login com conta `@escola` (requisito §2-3)
  segue como etapa futura; no ar estará o modo atual (D-024 — contas locais).

## 7. Como reverter / desligar

- Para tirar do ar: painel do Render → *Web Service* → *Delete* (nada
  automático fica lá fora). O banco Neon pode ser deletado no painel dele.
- O GitHub Pages (demo) é independente deste processo.
