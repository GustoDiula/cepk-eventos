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
├── .gitignore
├── scripts/
│   └── gerar-icones.ps1           ← gera os ícones do PWA
├── docs/
│   ├── requisitos.md              ← requisitos funcionais/não funcionais e regras de negócio
│   ├── arquitetura.md             ← arquitetura (v2.0) + §5A perfis e permissões
│   ├── decisoes.md                ← registro de decisões (D-001..D-023)
│   ├── modelo-de-dados.md / api.md / pwa.md / plano-de-desenvolvimento.md
├── src/
│   ├── backend/
│   │   ├── app.js                 ← Express: rotas estáticas + health + SW-Allowed
│   │   ├── server.js · config/env.js
│   │   ├── routes/health.routes.js · middlewares/errorHandler.js
│   │   └── controllers/ · db/ · services/   (vazios: etapas 2–7 pendentes)
│   └── frontend/
│       ├── pages/
│       │   ├── index.html         ← Início: feriados oficiais do PR 2026 + grade geral
│       │   ├── turma.html         ← Turmas: calendário e atividades da turma (única)
│       │   ├── inscricoes.html · evento.html
│       │   ├── login.html         ← login de demonstração (D-018)
│       │   └── sobre.html
│       ├── css/main.css
│       ├── js/ (api.js · calendario.js · offline.js · sessao.js)
│       └── pwa/ (manifest.webmanifest · service-worker.js · icons/ 192·512·maskable)
└── tests/
    ├── unit/ (backend.health · pwa.manifest)
    ├── integration/frontend.http.test.mjs
    └── e2e/ (roteiro.frontend.md · roteiro.pwa.md) · *.gitkeep
```

> Atualização 2026-10-28 (pedido do autor): a página `calendario.html` foi excluída
> (conteúdo fundido em `turma.html` — D-022). Seção mantida por este arquivo.

> Atualize esta seção sempre que a estrutura do repositório mudar
> (explique a alteração ao autor antes, conforme a regra 2).
