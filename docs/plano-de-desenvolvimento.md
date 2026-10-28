# Plano de Desenvolvimento — CEPK Eventos

Status: 🟢 Aprovado pelo autor em 2026-10-28 (proposta apresentada e aprovada na
sessão, incluindo a decisão D-012). Executa-se **uma etapa por vez**, com relatório,
commit e push ao fim de cada uma.

Vinculado a: `requisitos.md` v1.1 · `arquitetura.md` v2.0 · `modelo-de-dados.md` v1.0 ·
`api.md` v1.0.

## 1. Etapas

| Etapa | O que constrói | Cobertura | Dependências | Revisão p/ autor |
|---|---|---|---|---|
| 0. **Ambiente local** | Instalar/verificar Node.js e PostgreSQL (instalação direta — D-011); zero código | D-011 | Nenhuma | Relatório com `node -v` e teste do `psql` |
| 1. **Esqueleto do backend** | `package.json`, `server.js`/`app.js`, `config/env.js`, `GET /api/v1/health`, `.env.example`; `npm install` só nesta etapa, com aviso prévio ao autor | RNF05/06 | Etapa 0 | Rota de saúde respondendo |
| 2. **Banco de dados** | `db/schema.sql` (7 tabelas do modelo v1.0; escolhas do §6 do modelo só entram se aprovadas) + semente fictícia para dev | RNF10, RN01, D-009 | Etapa 1 | Autor inspeciona o script **antes** de qualquer execução no banco |
| 3. **Frontend estático** | 4 páginas + `css/main.css` + esboço de `js/api.js` + base do manifest/SW; servidos pelo Express em dev | RF01, RNF01 | Etapa 1 | Páginas no navegador |
| 4. **Sessão e login** 🔴 | Cookie assinado + logout/me (D-010). **Modo de teste de sessão** liberado (D-012) para progredir; provedor real aguarda F-2 | RF02/03, RNF09 | F-2 (parcial — modo teste apenas dev) | Sessão testável manualmente |
| 5. **Consulta de eventos** | GET turmas/eventos + páginas turma/evento; testes de isolamento (CA-03: 404 para turmas alheias — política confirmada 2026-10-28) | RF04/05/16, CA-03 | Etapa 2 | Testes de isolamento executados |
| 6. **Publicar/editar/cancelar** | POST/PATCH eventos com `requireRole` (RF06) + versão inicial de auditoria se RNF12 aprovada | RF06, RNF12 | F-3/F-11/F-12 (ajustes finais); núcleo avança | Professor de teste publica |
| 7. **Inscrições** | POST `/eventos/:id/inscricoes` (transação de vagas), erros 409/422; testes de duplicidade/vagas (CA-05/CA-10); DELETE p/ aluno só quando F-5 aprovado | RF07/08/14, RN07 | Etapa 2; F-5 (só o cancelamento) | Testes de concorrência executados |
| 8. **PWA final** | Manifest completo + ícones + service worker (cache somente leitura + bloqueio offline — D-008) | RF09/RF17, CA-06/CA-10 | Etapa 3 | Instalar no celular e testar offline |
| 9. **Administrativos** 🔴 | Turmas/vínculos/autorizações + `bootstrap` do primeiro admin | F-6/F-7/F-8/F-13 | F (não inicia antes das decisões) | Revisão de segurança do bootstrap |
| 10. **Publicação online** | Hospedagem HTTPS (P-2) + auditoria final de segredos (CA-08) + docs finais | P-2, CA-08 | P-2 | Checklist de publicação |

> Marcações 🔴: etapa (ou parte dela) **não inicia** sem a decisão pendente listada.
> Depois de F-8 respondida, atualizar `api.md` §3.5.

## 2. Regras de execução

1. **Uma etapa por vez.** Nada se antecipa; a cada fim: relatório ao autor (o que
   mudou, por quê, como verificar — regra 10), commit e push.
2. **Instalações sempre avisam antes de acontecer** (npm, Node, PostgreSQL,
   framework de testes). Nenhuma dependência é instalada às escondidas.
3. **Testes** começam na etapa 1 e crescem etapa por etapa; nenhum teste é declarado
   executado sem constar execução real (regra 11).
4. **Dados sempre fictícios** em dev/teste (RNF10) — nada do CEPK real entra no repositório.
5. Pendências em aberto **não param o resto do plano**: só login-real (4 parcial) e
   administrativos (9) aguardam decisões.

## 3. Histórico

| Versão | Data | Descrição |
|---|---|---|
| 1.0 | 2026-10-28 | Plano de 10 etapas aprovado (inclui decisão D-012 — modo de teste de sessão em dev, bloqueado em produção) |
