# Especificação da API — CEPK Eventos

Status: 🟡 Proposta v1.0 — aguardando aprovação do autor. Nenhum endpoint foi
implementado; nenhum servidor/rota criado. Este documento descreve o contrato HTTP
proposto para o backend Express (arquitetura v2.0, cap. 3).

## 1. Convenções gerais

| Tema | Proposta |
|---|---|
| Prefixo | `/api/v1` — versão explícita para mudanças futuras sem quebrar clientes |
| Formato | JSON; datas/horas em ISO 8601 com deslocamento (ex.: `"2026-11-20T09:30:00-03:00"`) |
| Autenticação | Sessão por **cookie assinado `httpOnly`** (D-010). O cookie é enviado automaticamente pelo navegador; nunca extraído por JS |
| Cookies de sitio | `SameSite=Lax` + mitigação de CSRF para verbos de escrita (🟡 recomendação — detalhe no plano de dev) |
| Autorização | Em **todo** endpoint sensível: middlewares `authenticate` + `requireRole` (regra 8; RNF04) |
| Erros | Formato único, nunca detalhes técnicos do banco: `{ "erro": { "codigo": "…", "mensagem": "…" } }` |
| IDs | Numéricos (`BIGSERIAL`), conforme proposta do `modelo-de-dados.md` |

Códigos HTTP utilizados: `200 OK`, `201 Created`, `204 No Content`, `400 → 499`
(validação/estado), `500` (erro inesperado — registrado, mas mensagem genérica).

### Erros nomeados (proposta)

| Código | Significado |
|---|---|
| `SESSAO_INVALIDA` | 401 — não autenticado ou sessão expirada → RF02/RNF09 |
| `SEM_PERMISSAO` | 403 — autenticado, mas papel/vínculo não permite (RF05/RF06) |
| `NAO_ENCONTRADO` | 404 — recurso inexistente **ou inacessível** (usado para não vazar dados: turmas/eventos de outras turmas respondem 404) |
| `FORA_DO_PRAZO` | 422 — inscrição após `prazo_inscricao` (RN03) |
| `SEM_VAGAS` | 409 — `vagas_restantes = 0` (RN06) |
| `INSCRICAO_DUPLICADA` | 409 — UNIQUE (RN07/CA-05) |
| `DADOS_INVALIDOS` | 400 — campos inválidos/ausentes |
| `CONEXAO_EXIGIDA` | — caso de interface, não de API (RF17: sem conexão a PWA nem envia) |

## 2. Papéis usados nas tabelas abaixo

`visitante` (sem sessão — comportamento 🔴 pendente F-1), `aluno`,
`professor_autorizado`, `admin`.

## 3. Endpoints propostos

### 3.1 Autenticação 🔴 dependente de F-2 (provedor)

> Nada aqui é implementado até F-2 confirmar o provedor. As formas abaixo são o
> padrão OAuth básico comum — **não uma decisão de provedor**.

| Método | Rota | Autenticação | Finalidade | Erros |
|---|---|---|---|---|
| GET | `/api/v1/auth/institucional` | visitante | inicia login: responde URL/definição do provedor | 503 caso prod não configurado (F-2) |
| GET | `/api/v1/auth/callback` | visitante | recebe retorno do provedor, valida identidade, consulta `usuarios`+vínculos no banco (D-004), cria sessão, responde para qual página seguir (RF03: turma do aluno) | 401 `SESSAO_INVALIDA` se identidade recusada |
| POST | `/api/v1/auth/logout` | qualquer autenticado | encerra sessão (RNF09/CA-09), cookie invalidado | 204 |
| GET | `/api/v1/auth/me` | autenticado | devolve perfil/papéis para a interface (jamais fonte de decisão) | 401 |

### 3.2 Turmas

| Método | Rota | Autenticação | Permissão | Finalidade | Entrada | Saída | Erros |
|---|---|---|---|---|---|---|---|
| GET | `/api/v1/turmas` | 🔴 depende de F-1 | 🔴 F-1 | lista de turmas da escola para a página inicial (RF01) | — | `[{id,nome_curto,ano_letivo}]` | — |
| GET | `/api/v1/turmas/:id/eventos` | aluno da turma | vínculo ativo (RN01) OU professor autorizado OU admin | eventos da turma (RF04/RF16) | — | lista de eventos | 401; 404 (quem não pertence — CA-03) |

> 🔴 Criação/módificação de turmas e vínculos por admin ficou para cadastro — depende de F-6/F-8; propostas em §3.5.

### 3.3 Eventos

| Método | Rota | Autenticação | Permissão | Finalidade | Entrada | Saída | Erros |
|---|---|---|---|---|---|---|---|
| GET | `/api/v1/eventos/gerais` | 🔴 depende de F-1 (visitante?) | 🔴 F-1 / autenticado | eventos de escopo `geral` (RF01/RF04) | — (filtros opcionais no futuro) | lista de eventos | — |
| GET | `/api/v1/eventos/:id` | autenticado | aluno recebe sempre (geral SEM pré-vinculo); de turma: só membro/autorizado/admin | detalhe do evento (RF15): contendo `{inscritos, vagas}` quando exige_inscricao | — | objeto de evento | 401; 404 se de outra turma (CA-03) |
| POST | `/api/v1/eventos` | professor_autorizado/admin (RF06) | | publicar evento (geral ou da própria turma) | campos coerentes ao escopo e restrições 3.4 do modelo | `201` + evento criado | 400 `DADOS_INVALIDOS`, 403 |
| PATCH | `/api/v1/eventos/:id` | professor_autorizado/admin | campo-sensível: 🔴 F-11 (o que pode mudar depois do inicio das inscrições); quem pode editar de terceiro: 🔴 F-12 | editar evento | parciais | 200 + evento | 400; 403; 404 |
| PATCH | `/api/v1/eventos/:id/cancelar` | professor_autorizado/admin | 🔴 dependente de F-3 (efeito sobre inscritos) | marca `status='cancelado'` + auditoria | — | 200 | 403; 404 |

> O uso de `PATCH …/cancelar` (cancelamento lógico) protege as inscrições já
> registradas da exclusão acidental — decisão de F-3 definirá o que o aluno vê
> depois (RF11).

### 3.4 Inscrições (o coração da aplicação)

| Método | Rota | Autenticação | Permissão | Finalidade | Entrada | Saída | Erros |
|---|---|---|---|---|---|---|---|
| POST | `/api/v1/eventos/:id/inscricoes` | aluno (ou admin, sem inscrição própria? — 🔴 F-4/aclarado mais) | vínculo elegível (RF14/D-009): geral OU própria turma | inscrever-se (RF07/RF08): transação única valida vínculo + prazo + vagas => grava | — | `201` + confirmação com `criado_em` | 401/403; 404; `FORA_DE_PRAZO 422`; `SEM_DE_VAGAS 409`; `INSCRICAO_DUPLICADA 409` |
| GET | `/api/v1/eventos/:id/inscricoes` | professor_autorizado/admin | | lista de inscritos (AUD-12); a contagem `inscritos/vagas` também está disponível no GET `/api/v1/eventos/:id` | `?page` simples | lista com nome (apenas para estes papéis — RNF10) | 403; 404 |
| DELETE | `/api/v1/eventos/:id/inscricoes/eu` | aluno | | cancelar propia inscrição | — | 204 ou 200 conforme estado | 🔴 **Pendente F-5** (se aprovado; até lá nem existe) |

**Regras transversais da inscrição (codificadas nos serviços):**

1. Prazo: `now() > prazo_inscricao` → 422 (com fuso bem definido — RNF11, recomendação pendente).
2. Vagas: atualização condicional com `vagas_restantes > 0` dentro da transação
   (desenho completo em `modelo-de-dados.md` §4.2) → 409 `SEM_VAGAS`.
3. Duplicidade: índice `UNIQUE (evento_id, usuario_id)` → 409.
4. A resposta `201` **só** sai depois do COMMIT — CA-05 (regra 9 de AGENTS.md).
5. Offline: a PWA não envia a requisição (RF17/RN08) — nenhum endpoint de fila.

### 3.5 Endpoints administrativos 🔴 (dependem de F-6/F-7/F-8 — só plano futuro)

| Método | Rota | Finalidade | Pendência |
|---|---|---|---|
| POST | `/api/v1/admin/turmas` | criar turma | F-6 |
| POST | `/api/v1/admin/vinculos` | criar/atualizar vínculo aluno↔turma | F-8 |
| POST | `/api/v1/admin/autorizacoes` | conceder papel professor_autorizado/admin | F-7 (revogação = desativar) |
| GET | `/api/v1/admin/auditoria` | consultar registro de auditoria | RNF12 (se aprovado) |

## 4. Proteção de dados pessoais na API (RNF10/AUD-17)

- **Respostas mínimas:** a lista de turmas/eventos **nunca** contém e-mails de
  alunos; nomes de inscritos aparecem apenas para `professor_autorizado`/`admin`.
- **404 em vez de 403** para recursos de outras turmas (§3.2/§3.3): o sistema não
  confirma a existência do recurso para quem não deve vê-lo (CA-03).
  **✅ Confirmado pelo autor em 2026-10-28.**
- **Sessão** carrega o mínimo (id + papéis); dados de identidade vêm do banco a cada
  interação de escrita — permissions revogam aplicam imediatamente.
- 🔴 Retenção/tratamento de ex-alunos: F-14.

## 5. O que esta especificação NÃO decide (aguardando você)

| # | Ponto | Status |
|---|---|---|
| 1 | Visitor endpoints (F-1) | 🔴 Pendente |
| 2 | Provedor de login (F-2) | 🔴 Pendente — não assume nome de nenhum serviço |
| 3 | Cancelamento de evento e de inscrição (F-3/F-5) | 🔴 Pendente |
| 4 | Edição post-publicação e efeito do prazo/vagas (F-11) | 🔴 Pendente |
| 5 | Quem pode editar eventos de terceiros (F-12) | 🔴 Pendente |
| 6 | Endpoints administrativos (F-6/F-7/F-8) | 🔴 Pendente |
| 7 | Expiração de sessão (F-17) | 🔴 Pendente |
| 8 | CSRF: token ou dupla camada com SameSite (🟡) | 🟡 Recomendação, definiremos no plano de dev |

## 6. Histórico

| Versão | Data | Descrição |
|---|---|---|
| 1.0 | 2026-10-28 | Proposta do contrato HTTP: convenções, erros nomeados, 15 endpoints em 5 domínios, regras transversais de inscrição e política de dados. Nenhum endpoint implementado |
