# AGENTS.md — Instruções permanentes do projeto CEPK Eventos

Este arquivo orienta **qualquer agente de IA** (ou desenvolvedor) que trabalhe neste repositório.
Leia-o integralmente antes de qualquer alteração.

## 1. Contexto do projeto

- **Projeto:** CEPK Eventos — Progressive Web App (PWA) para centralizar os eventos do
  Colégio Estadual Presidente Kennedy (CEPK).
- **Autor:** estudante de Desenvolvimento de Sistemas (Ensino Médio).
  Explicar decisões técnicas de forma didática, sem presumir conhecimento avançado,
  sem jargão desnecessário e sem pressa.
- **Produto final:** somente PWA, responsiva e instalável em navegadores compatíveis.
  Não desenvolver APK, aplicativo Android nativo ou integração com Capacitor.

## 2. Decisões já estabelecidas pelo autor (não reabrir sem justificativa)

1. Produto final é somente uma PWA.
2. Página inicial apresenta o calendário geral da escola e o acesso às turmas.
3. Autenticação por conta institucional `@escola`, via provedor institucional
   (disponibilidade do provedor ainda precisa ser confirmada — não assumir qual é).
4. Após o login, o aluno é direcionado à própria turma.
5. Alunos visualizam apenas eventos gerais + eventos da própria turma;
   não visualizam eventos exclusivos de outras turmas.
6. Somente professores explicitamente autorizados e administradores podem
   publicar, editar ou cancelar eventos.
7. Eventos podem exigir inscrição, com limite de vagas e prazo.
8. Backend e banco de dados centralizados.
9. Arquitetura prevista: HTML/CSS/JS no frontend, Node.js + Express no backend,
   PostgreSQL no banco de dados.
10. Versionamento no GitHub; publicação online com HTTPS.
11. Código organizado, seguro, testável e de fácil manutenção.

## 3. Regras de trabalho (obrigatórias)

1. Antes de modificar arquivos, examine a estrutura atual do repositório.
2. Não apague, sobrescreva ou reorganize arquivos existentes sem necessidade
   e sem explicar o motivo ao autor.
3. Não invente informações sobre a escola, contas institucionais ou serviços externos.
4. Não implemente funcionalidades antes da aprovação dos requisitos e do plano
   de desenvolvimento.
5. Não execute comandos destrutivos, não publique o projeto e não envie dados
   para serviços externos sem autorização explícita do autor.
6. Nunca coloque senhas, tokens, chaves privadas ou segredos no código ou no Git.
7. O domínio do e-mail **NUNCA** é suficiente para conceder privilégios
   administrativos; privilégios derivam de vínculos registrados no banco de dados.
8. Valide permissões no backend, não apenas na interface.
9. Não confirme inscrições na interface antes da confirmação pelo servidor.
10. Ao sugerir ou realizar mudanças, informe: arquivos afetados, por que foram
    alterados e como verificar o resultado.
11. Nunca declare testes executados sem tê-los realmente executado.
12. Quando faltar informação importante, apresente as dúvidas e aguarde a
    decisão do autor.

## 4. Organização atual do repositório

```text
cepk-eventos/
├── AGENTS.md                      ← este arquivo
├── package.json / package-lock.json
├── .env.example                   ← modelo de variáveis (NUNCA o .env real)
├── .gitignore                     ← mantém o .env LOCAL fora do Git
├── .github/workflows/static.yml   ← publicador ÚNICO do Pages: instala deps, `npm run demo:gerar` e publica a pasta demo/ a cada push (D-026)
├── backup/
│   └── cepk-eventos-backup-2026-10-29.zip  ← backup do projeto (zip: código + histórico .git; sem .env e sem node_modules)
├── demo/                          ← DEMONSTRAÇÃO ESTÁTICA para o GitHub Pages (D-026) — produto real INTACTO
│   ├── index.html · entrar.html (escolha de perfil, SEM senha) · turma.html · inscricoes.html (botões desabilitados)
│   ├── demo.js                    ← sessão de demo na sessionStorage (chave cepkDemo) + turmas/eventos por vínculo
│   └── main.css · calendario.js · dados-demo.js   ← GERADOS por scripts/gerar-demo.cjs (fonte única: seed-demo.js)
├── scripts/
│   ├── gerar-icones.ps1           ← gera os ícones do PWA
│   ├── gerar-demo.cjs             ← gera a demonstração estática (cópias byte a byte + dados puros) (D-026)
│   ├── pgsql-start.ps1            ← inicia o PostgreSQL portátil local (D-011; 100% ASCII por causa do PS 5.1)
│   └── pgsql-stop.ps1             ← para o PostgreSQL portátil
├── docs/
│   ├── requisitos.md              ← requisitos funcionais/não funcionais e regras de negócio
│   ├── arquitetura.md             ← arquitetura (v2.0) + §5A perfis e permissões (implementados)
│   ├── decisoes.md                ← registro de decisões (D-001..D-026)
│   ├── modelo-de-dados.md         ← v1.1 (IMPLEMENTADA, etapas 2–5)
│   ├── api.md                     ← v1.1: §3.0 endpoints reais + contrato futuro (etapas 6–9)
│   └── pwa.md / plano-de-desenvolvimento.md
├── src/
│   ├── backend/
│   │   ├── app.js                 ← Express: sessão no PG (D-024) + estáticos + 401/404 de API
│   │   ├── server.js · config/ (env.js · session.js)
│   │   ├── db/ (pool.js · schema.sql · seed-demo.js ← semente IDEMPOTENTE + fonte dos dados puros da demo D-026)
│   │   ├── middlewares/ (authenticate.js · limitarTentativasLogin.js · errorHandler.js)
│   │   ├── routes/ (health.routes.js · auth.routes.js · turmas.routes.js)
│   │   ├── services/turmas-permissao.js  ← vínculos do BANCO decidem o acesso (D-004/D-025)
│   │   └── controllers/ (vazio: etapas 6–7 pendentes)
│   └── frontend/
│       ├── pages/
│       │   ├── index.html         ← Início: feriados oficiais do PR 2026
│       │   ├── turma.html         ← Turmas: grade por vínculo + calendário/lista via API
│       │   ├── inscricoes.html · evento.html   (protótipos: etapas 6–7)
│       │   ├── login.html         ← login REAL de demonstração (D-024; D-018 em desuso)
│       │   └── sobre.html
│       ├── css/main.css
│       ├── js/ (api.js · calendario.js · offline.js · sessao.js ← consulta /auth/me)
│       └── pwa/ (manifest.webmanifest · service-worker.js cepk-shell-v6 · icons/ 192·512·maskable)
└── tests/
    ├── unit/ (backend.health · pwa.manifest · demo.estatica)
    ├── integration/ (frontend.http.test.mjs · auth.db.test.mjs ← 8 grupos de teste do autor)
    └── e2e/ (roteiro.frontend.md · roteiro.pwa.md) · *.gitkeep
```

> Atualização 2026-10-28 (pedido do autor): a página `calendario.html` foi excluída
> (conteúdo fundido em `turma.html` — D-022). Seção mantida por este arquivo.

> Atualização 2026-10-29: etapas 0–5 do plano executadas. O `.env` LOCAL guarda
> `SENHA_DEMO` (senha inicial das contas de demonstração) e as credenciais do
> PostgreSQL — vivem APENAS ali (fora do Git), nunca em código, interface ou docs.
> Banco de demonstração: 5 contas `.test` com vínculos registrados
> (2 alunos · prof. Geografia em 3 turmas · pedagogia/direção em todas as 10).

> Atualização 2026-10-30: D-026 — demonstração ESTÁTICA para o GitHub Pages
> (pasta `demo/`, gerada por `npm run demo:gerar` + workflow do Actions). O
> login é substituído por ESCOLHA DE PERFIL (sem senha); inscrições desabilitadas
> com aviso; sem service worker/manifest. Produto real e PWA (etapas 6–10) NÃO mudam.

> Atualize esta seção sempre que a estrutura do repositório mudar
> (explique a alteração ao autor antes, conforme a regra 2).
