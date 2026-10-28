# Documento de Requisitos — CEPK Eventos

## 1. Identificação

| Campo | Valor |
|---|---|
| Projeto | CEPK Eventos |
| Versão do documento | 1.0 |
| Data | 2026-10-28 |
| Elaborado por | Gustavo Diula (autor do projeto) com apoio de agente de Engenharia de Requisitos |
| Repositório | https://github.com/GustoDiula/cepk-eventos |
| Documentos relacionados | `AGENTS.md` (regras permanentes), `docs/arquitetura.md`, `docs/decisoes.md` |
| Status | 🟡 Aguardando revisão e aprovação do autor |

> **Regra permanente:** nada deve ser implementado antes da aprovação deste documento
> pelo autor. Qualquer alteração futura cria uma versão nova com histórico.

## 2. Problema

O projeto parte de uma constatação feita pelo autor: os eventos do Colégio Estadual
Presidente Kennedy (CEPK) e as inscrições neles precisam de um ponto centralizado de
consulta, acessível pela comunidade escolar a partir de qualquer dispositivo com
navegador. Sem esse ponto centralizado, cada evento depende de canais próprios,
não há um único calendário confiável nem um controle automático de prazo e vagas
para eventos com inscrição.

> ⚠️ Este documento não afirma como a escola comunicava eventos antes disso — essa
> informação não foi fornecida pelo autor e não é necessária para definir os requisitos.

## 3. Objetivos

### 3.1 Objetivo geral

Fornecer uma PWA que centralize a consulta aos eventos do CEPK (calendário geral e
eventos por turma) e automatize as inscrições quando exigidas.

### 3.2 Objetivos específicos

| ID | Objetivo | Natureza |
|---|---|---|
| OF-01 | Centralizar o calendário geral de eventos da escola | Aprovado — decisão do autor |
| OF-02 | Restringir a visualização de eventos de turmas conforme o vínculo do aluno | Aprovado — decisão do autor |
| OF-03 | Restringir publicação/edição/cancelamento de eventos a professores autorizados e administradores | Aprovado — decisão do autor |
| OF-04 | Automatizar inscrições com controle de prazo e limite de vagas, confirmadas somente pelo servidor | Aprovado — decisão do autor |
| OF-05 | Entregar uma PWA responsiva e instalável em navegadores compatíveis | Aprovado — decisão do autor |
| OF-06 | Manter a segurança: permissões validadas no backend e nenhuma senha armazenada pelo sistema | Aprovado — decisão do autor |

## 4. Público-alvo

- Alunos matriculados no CEPK (consultar eventos e realizar inscrições).
- Professores do CEPK (professores autorizados publicam e gerenciam eventos).
- Profissionais responsáveis pelos calendários do CEPK (administradores do sistema).

*Público-alvo estimado em quantidade: a definir com o autor; os requisitos não dependem desses números.*

## 5. Perfis de usuário

| Perfil | O que pode fazer | Como é identificado |
|---|---|---|
| Visitante (sem login) | A definir — depende da Dúvida F-1 | — |
| Aluno | Ver eventos gerais + da própria turma; inscrever-se quando habilitado | Conta institucional `@escola` + vínculo aluno–turma no banco |
| Professor autorizado | Publicar, editar e cancelar eventos | Vínculo professor + autorização explícita no banco |
| Administrador | Tudo do professor + conceder autorizações | Vínculo administrador no banco |

> ⚠️ Regra permanente: o domínio do e-mail **não** define o perfil. Apenas o vínculo
> registrado no banco de dados, validado no backend (decisão D-004).

## 6. Arquitetura inicialmente prevista

- **Produto:** somente PWA (Progressive Web App), responsiva e instalável em
  navegadores compatíveis (decisão D-001).
- **Frontend:** HTML, CSS e JavaScript (decisão D-002).
- **Backend:** Node.js com Express, centralizado (decisão D-002).
- **Banco:** PostgreSQL, centralizado e única fonte de verdade (decisão D-002).
- **Autenticação:** provedor institucional compatível com `@escola`; o sistema não
  armazena senhas (decisão D-003 — disponibilidade do provedor pendente: F-2).
- **Versionamento:** GitHub (decisão D-007 — repositório público: https://github.com/GustoDiula/cepk-eventos).
- **Publicação:** online com HTTPS (consulte P-2 em decisoes.md).

## 7. Escopo

O sistema deverá ser capaz de:

| ID | Elemento do escopo | Natureza |
|---|---|---|
| E-01 | Calendário geral da escola na página inicial | Aprovado — decisão do autor |
| E-02 | Acesso às turmas a partir da página inicial | Aprovado — decisão do autor |
| E-03 | Login institucional `@escola` via provedor institucional | Aprovado — decisão do autor |
| E-04 | Redirecionamento do aluno à própria turma após o login | Aprovado — decisão do autor |
| E-05 | Visualização de eventos gerais e eventos da própria turma (aluno) | Aprovado — decisão do autor |
| E-06 | Publicação, edição e cancelamento de eventos por professores autorizados e admins | Aprovado — decisão do autor |
| E-07 | Inscrições em eventos, com prazo e limite de vagas | Aprovado — decisão do autor |
| E-08 | Confirmação de inscrições validada no servidor | Aprovado — decisão do autor |
| E-09 | Instalação como PWA em navegadores compatíveis | Aprovado — decisão do autor |
| E-10 | Comportamento da página inicial para usuários sem login | 🔴 Pendente (F-1) |

## 8. Funcionalidades fora do escopo

### 8.1 Fora do escopo (decisão do autor — não será feito)

| ID | Item | Motivo |
|---|---|---|
| FX-01 | APK, aplicativo Android nativo ou integração com Capacitor | Decisão D-001: produto final é somente PWA |
| FX-02 | Armazenamento de senhas pelo sistema | Decisão D-003: autenticação delegada ao provedor institucional |
| FX-03 | Cadastro próprio de contas (registro exclusivo do CEPK Eventos) | Deriva de D-003: a identidade vem do provedor `@escola` |
| FX-04 | Exibir eventos exclusivos de outras turmas ao aluno | Regra permanente do autor (RF05) |
| FX-05 | Publicação/cancelamento de eventos por alunos | Regra permanente do autor (RF06) |

### 8.2 Fora do escopo inicial (🔴 pendente de decisão — não iniciar até o autor aprovar)

Os itens abaixo foram sugeridos como exclusões do primeiro escopo (recomendação do
agente para reduzir riscos e foco do TCC/projeto de curso). **Nenhum é decisão:**

| ID | Item | Por que recomendado ficar de fora por ora |
|---|---|---|
| FR-01 | Notificações automáticas (push/e-mail) | Amplia o produto além do básico; exige decisão sobre canais de envio. Ver §15 |
| FR-02 | Relatórios/estatísticas de participação | Benefício adicional; pode ser incluído em versões futuras |
| FR-03 | Certificados de participação | Não definido; depende de políticas da escola (não inventar) |
| FR-04 | Sincronização com calendários externos (iCal/Google Calendar) | Complexidade adicional; reclamação do usuário não registrada |

## 9. Requisitos funcionais (RF)

**Legenda da coluna Origem:** 🟢 Aprovada = decisão definitiva do autor ·
🟡 Recomendação = sugestão que depende de sua aprovação ·
🔴 Pendente = falta decisão/informação (ver §15)

| ID | Requisito | Origem |
|---|---|---|
| RF01 | A página inicial apresenta o calendário geral da escola e o acesso às turmas | 🟢 Aprovada (autor) |
| RF02 | O usuário autentica-se com conta institucional `@escola`, via provedor institucional | 🟢 Aprovada (autor) — dependência técnica pendente (F-2) |
| RF03 | Após o login, o aluno é direcionado à própria turma | 🟢 Aprovada (autor) |
| RF04 | Aluno visualiza eventos gerais e eventos da própria turma | 🟢 Aprovada (autor) |
| RF05 | Aluno NÃO visualiza eventos exclusivos de outras turmas | 🟢 Aprovada (autor) |
| RF06 | Professores autorizados e administradores podem publicar, editar e cancelar eventos | 🟢 Aprovada (autor) |
| RF07 | Eventos podem exigir inscrição, com prazo e limite de vagas | 🟢 Aprovada (autor) |
| RF08 | A inscrição só é confirmada após resposta favorável do servidor; a interface não deve exibir confirmação antecipada | 🟢 Aprovada (regra 9 de AGENTS.md) |
| RF09 | A PWA é instalável em navegadores compatíveis | 🟢 Aprovada (autor) |
| RF10 | Definir o que o visitante sem login vê na página inicial (só calendário; calendário + tela de acesso; bloqueio completo) | 🔴 Pendente (F-1) |
| RF11 | Definir o comportamento ao cancelar um evento (exibir como "cancelado", remover do calendário, informar inscritos) | 🔴 Pendente (F-3) |
| RF12 | Definir se o aluno pode cancelar a própria inscrição e até quando | 🔴 Pendente (F-5) |
| RF13 | Definir a listagem de turmas e seus eventos com os dados reais do CEPK | 🔴 Pendente (F-6) |

## 10. Requisitos não funcionais (RNF)

| ID | Requisito | Origem |
|---|---|---|
| RNF01 | Interface responsiva (celular, tablet, desktop) | 🟢 Aprovada (autor) |
| RNF02 | Backend e banco de dados centralizados; a interface jamais decide permissões | 🟢 Aprovada (autor) |
| RNF03 | Comunicação sempre por HTTPS | 🟢 Aprovada (autor) |
| RNF04 | Permissões validadas no backend em TODA operação sensível | 🟢 Aprovada (regra 8 de AGENTS.md) |
| RNF05 | Segredos fora do código e do Git (variáveis de ambiente / provedor de segredos) | 🟢 Aprovada (regra 6 de AGENTS.md) |
| RNF06 | Código organizado, testável e de fácil manutenção | 🟢 Aprovada (autor) |
| RNF07 | A interface nunca exibe um estado não confirmado pelo servidor (ex.: inscrições pendentes não aparecem como confirmadas) | 🟢 Aprovada (regra 9 de AGENTS.md) |
| RNF08 | O sistema continua operando sem perder dados registrados diante de falhas de sessão (recarregar, trocar de aba) | 🟡 Recomendação (agente) |

## 11. Regras de negócio (RN)

| ID | Regra | Origem |
|---|---|---|
| RN01 | O vínculo aluno–turma é registrado e validado no banco de dados; nunca inferido do e-mail | 🟢 Aprovada (regras 7/8 de AGENTS.md; D-004) |
| RN02 | Um evento exige inscrição ou não; se exigir, define prazo e limite de vagas | 🟢 Aprovada (autor) |
| RN03 | A inscrição é recusada quando: fora do prazo, sem vaga ou sem vínculo permitido | 🟢 Aprovada (autor) |
| RN04 | Professores autorizados e administradores publicam/editam/cancelam eventos | 🟢 Aprovada (autor) |
| RN05 | Refinamento de elegibilidade de inscrição: em quais eventos o aluno pode inscrever-se (gerais abertos, próprias turmas etc.) | 🔴 Pendente (F-4) |
| RN06 | Ao esgotar as vagas, novas tentativas recebem resposta clara de que não há vagas | 🟡 Recomendação (agente) |

## 12. Critérios de aceitação (CA)

Critérios verificáveis para considerar o sistema pronto (na medida em que cada
requisito associado for aprovado).

| ID | Critério de aceitação | Requisitos associados |
|---|---|---|
| CA-01 | Com dados de teste (fictícios), a página inicial exibe o calendário geral e a lista de turmas | RF01, RF10 |
| CA-02 | Com credencial institucional válida, o login autentica e o aluno é direcionado à página da sua turma | RF02, RF03 |
| CA-03 | O aluno não consegue obter eventos de outra turma nem pela interface nem chamando a API diretamente; o servidor recusa | RF05, RNF04 |
| CA-04 | Aluno que tentar publicar/editar/cancelar (via API) recebe recusa do servidor; professor autorizado/admin consegue | RF06, RNF04 |
| CA-05 | Inscrição fora do prazo ou com vagas esgotadas é recusada com mensagem clara; inscrição válida exibe sucesso somente após confirmação do servidor | RF07, RF08, RNF07 |
| CA-06 | A PWA instala-se a partir de um navegador compatível (manifest e service worker configurados) | RF09 |
| CA-07 | A interface mantém funcionamento com visual adequado em celular, tablet e desktop | RNF01 |
| CA-08 | Auditoria do repositório não encontra segredos, senhas ou tokens versionados | RNF05 |

## 13. Riscos

| ID | Risco | Impacto | Mitigação |
|---|---|---|---|
| RA-01 | O provedor institucional `@escola` não estar disponível/não existir na escola para uso do projeto | Alto — bloqueia RF02/RF03 | Confirmar antes do desenvolvimento do login (F-2); discutir alternativas com o autor — nenhuma alternativa será implementada sem decisão |
| RA-02 | Prazos do curso mais curtos que o esforço de desenvolvimento | Médio | Escopo mínimo primeiro (ementas aprovadas); versões futuras para FR-01…FR-04 |
| RA-03 | Dados das turmas ficarem desatualizados durante o ano letivo | Médio | Definir quem atualiza e como (F-6/F-7); administração via perfil admin |
| RA-04 | Publicação acidental de segredos no repositório | Alto | `.gitignore` já configurado; revisar pendências antes de cada push (regra 6) |
| RA-05 | Não haver hospedagem gratuita/adequada com HTTPS para o backend | Alto | Decidir cedo (P-2 em decidões.md); alternativas a serem pesquisadas sem inventar serviços |
| RA-06 | Tentativas de inscrições duplicadas/esgotamento de vagas em concorrência | Médio | Controle de vagas transacional no backend; recomendação RN06 |

## 14. Decisões aprovadas (resumo por fonte)

- **D-001** — Somente PWA, sem APK/nativo/Capacitor.
- **D-002** — Stack: HTML/CSS/JS + Node.js/Express + PostgreSQL.
- **D-003** — Autenticação institucional; sem armazenamento de senhas.
- **D-004** — Permissões via vínculos no banco, validadas no backend; domínio de e-mail nunca concede privilégio.
- **D-005, D-006, D-007** — Documentação antes do código, Git local, publicação no GitHub.
- Regras 1–12 de `AGENTS.md` continuam vigentes.

*Histórico completo: `docs/decisoes.md` — sempre adicionar um novo ID; nunca sobrescrever uma decisão.*

## 15. Decisões pendentes (aguardando o autor)

| ID | Questão | Onde impacta |
|---|---|---|
| F-1 | Visitante sem login vê o calendário geral na página inicial, ou precisa logar? | RF10, página inicial |
| F-2 | Qual provedor institucional de autenticação existe na escola (Google for Education, Microsoft 365, outro)? | RF02, backend do login, P-1 |
| F-3 | Ao cancelar um evento com inscritos, o que deve acontecer? | RF11, RN05 |
| F-4 | Aluno pode inscrever-se em eventos gerais abertos a todas as turmas? Somente da própria + gerais? | RN05, RF12 |
| F-5 | Aluno pode cancelar a própria inscrição? E até quando? | RF12, regras de inscrição |
| F-6 | Quantas turmas existem e como são identificadas? | RF13, cadastro de turmas, P-3 |
| F-7 | Quem habilita um professor a autorizar (admin) e como? | RF06, gestão de permissões, P-4 |

> **P-1 a P-4 de `decisoes.md` permanecem válidas:** provedor institucional (P-1),
> hospedagem com HTTPS (P-2), dados reais das turmas (P-3), políticas de
> cancelamento (P-4).

## 16. Histórico de versões

| Versão | Data | Descrição |
|---|---|---|
| 1.0 | 2026-10-28 | Primeira versão formal do documento. Base: rascunho anterior (commit 4d316ca). Adicionadas seções de identificação, problema, objetivos, público-alvo, escopo, fora do escopo, critérios de aceitação, riscos e pendências; IDs renormalizados para RF/RNF/RN sem hífen; dúvidas F-1…F-7 preservadas |
