# Registro de decisões técnicas — CEPK Eventos

Formato de "diário de decisões": cada decisão ganha um ID, data, motivo e status.
Serve para justificar escolhas durante o desenvolvimento do curso.

## Decisões

| ID | Data | Decisão | Motivo | Status |
|---|---|---|---|---|
| D-001 | 2026-10-28 | Produto final será somente PWA (sem APK, app nativo ou Capacitor) | Instalação direta pelo navegador compatível, sem necessidade de distribuição própria | ✅ Decidida |
| D-002 | 2026-10-28 | Stack definida: HTML/CSS/JS (frontend), Node.js + Express (backend), PostgreSQL (banco) | Alinhada ao contexto do curso e à necessidade de backend centralizado | ✅ Decidida |
| D-003 | 2026-10-28 | Autenticação via provedor institucional `@escola`; o sistema não armazena senhas | Reutilizar identidade institucional em vez de criar cadastros próprios | ⏳ Pendente: disponibilidade do provedor a confirmar (F-2) |
| D-004 | 2026-10-28 | Permissões (aluno/professor autorizado/admin) derivam de vínculos no banco e são validadas no backend; o domínio do e-mail nunca concede privilégio | Segurança: a interface pode ser manipulada; a validação confiável é no servidor | ✅ Decidida |
| D-005 | 2026-10-28 | Criar documentação (AGENTS.md + docs/) e aprovar requisitos antes de programar | Engenharia de requisitos: reduz retrabalho | ✅ Decidida |
| D-006 | 2026-10-28 | Repositório local iniciado com Git | Versionar histórico local | ✅ Decidida |
| D-007 | 2026-10-28 | Autorização explícita do autor para publicar o projeto no GitHub | O autor solicitou o envio para o GitHub nesta etapa | ✅ Decidida |
| D-008 | 2026-10-28 | Modo offline da PWA: somente leitura com aviso "dados podem estar desatualizados"; inscrição exige conexão ativa; nada é enfileirado | Evita inscrição aparentar confirmada sem servidor (protege regra 9 de AGENTS.md); decisão do autor em auditoria | ✅ Decidida |
| D-009 | 2026-10-28 | Elegibilidade de inscrição: aluno pode inscrever-se em eventos gerais e da própria turma; eventos de outras turmas não são elegíveis | Decisão do autor em auditoria (resolve F-4/F-10) | ✅ Decidida |
| D-010 | 2026-10-28 | Sessão via cookie assinado `httpOnly` (em vez de JWT/localStorage) | Impede leitura do token por JavaScript; logout real para computadores compartilhados (AUD-06) | ✅ Decidida |
| D-011 | 2026-10-28 | PostgreSQL do ambiente local por instalação direta (sem Docker) | Escolha do autor para o ambiente de desenvolvimento | ✅ Decidida |
| D-012 | 2026-10-28 | Modo de teste de sessão liberado no dev enquanto F-2 pendência; bloqueado em produção (`NODE_ENV`) | Permitir progresso do plano (etapa 4) sem o provedor institucional | ✅ Decidida |

## Pendências (avisos ao autor)

| ID | Pendência | Onde impacta |
|---|---|---|
| P-1 | Confirmar o provedor institucional de autenticação | Backend (login), requisitos F-2 |
| P-2 | Definir hospedagem com HTTPS (backend) | Publicação final |
| P-3 | Fornecer dados reais das turmas | Cadastro de turmas (F-6) |
| P-4 | Decidir comportamento de cancelamento de evento e de inscrição | Regras de negócio (F-3, F-5). *F-4 resolvida por D-009 em 2026-10-28* |

> Novas decisões devem ser **adicionadas com novo ID**; nunca sobrescrever uma
> decisão anterior (histórico preservado).
