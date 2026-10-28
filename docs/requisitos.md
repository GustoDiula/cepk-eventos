# Documento de Requisitos — CEPK Eventos

## 1. Identificação

| Campo | Valor |
|---|---|
| Projeto | CEPK Eventos |
| Versão do documento | 1.1 |
| Data | 2026-10-28 |
| Elaborado por | Gustavo Diula (autor do projeto) com apoio de agente de Engenharia de Requisitos |
| Repositório | https://github.com/GustoDiula/cepk-eventos |
| Documentos relacionados | `AGENTS.md` (regras permanentes), `docs/arquitetura.md`, `docs/decisoes.md` |
| Status | 🟡 Aguardando aprovação final do autor (revisão pós-auditoria) |

> **Regra permanente:** nada deve ser implementado antes da aprovação deste documento
> pelo autor. Qualquer alteração futura cria uma versão nova com histórico.
> **Origem da v1.1:** auditoria de Engenharia de Requisitos (apontamentos AUD-01…AUD-24)
> realizada em 2026-10-28, com aprovação de todas as correções e recomendações pelo autor.

## 2. Problema

O projeto parte de uma constatação feita pelo autor: os eventos do Colégio Estadual
Presidente Kennedy (CEPK) e as inscrições neles precisam de um ponto centralizado de
consulta, acessível pela comunidade escolar a partir de qualquer dispositivo com
navegador. Sem esse ponto centralizado, cada evento depende de um canal próprio,
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
| OF-07 | Operar de forma responsável com dados pessoais: coleta mínima, sem dados sensíveis e cenário offline seguro | 🟡 Recomendação (auditoria AUD-06/07/14/17) |

## 4. Público-alvo

- Alunos matriculados no CEPK (consultar eventos e realizar inscrições).
- Professores do CEPK (apenas os **explicitamente autorizados** publicam e gerenciam
  eventos; o comportamento do professor não autorizado está pendente — F-09).
- Profissionais responsáveis pelos calendários do CEPK (administradores do sistema).

*Público-alvo estimado em quantidade: a definir com o autor; os requisitos não dependem desses números.*

## 5. Perfis de usuário

| Perfil | O que pode fazer | Como é identificado |
|---|---|---|
| Visitante (sem login) | A definir — depende da Dúvida F-1 | — |
| Aluno | Ver eventos gerais + da própria turma; inscrever-se em eventos gerais e da própria turma, quando exigirem inscrição (RF14/D-009) | Conta institucional `@escola` + vínculo aluno–turma no banco |
| Professor autorizado | Publicar, editar e cancelar eventos (escopo de edição de eventos de terceiros: pendente — F-12) | Vínculo professor + autorização explícita no banco |
| Professor não autorizado | A definir (F-09) | Conta institucional `@escola` sem vínculo de autorização |
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
- **Modo offline:** somente leitura com aviso de dados possivelmente desatualizados;
  inscrições exigem conexão ativa (decisão D-008).
- **Versionamento:** GitHub (decisão D-007 — repositório público: https://github.com/GustoDiula/cepk-eventos).
- **Publicação:** online com HTTPS (consulte P-2 em `decisoes.md`).

## 7. Escopo (índice com referências — não duplica requisitos)

> ⚠️ Este capítulo é um **mapa de navegação** das funcionalidades aprovadas.
> O texto normativo único de cada item está nos capítulos 9–11 (AUD-22: fonte única).

| ID | Elemento do escopo | Referência | Status |
|---|---|---|---|
| E-01 | Calendário geral da escola na página inicial | RF01 | Aprovado |
| E-02 | Acesso às turmas a partir da página inicial | RF01 | Aprovado |
| E-03 | Login institucional `@escola` via provedor institucional | RF02 | Aprovado (dependência técnica pendente: F-2) |
| E-04 | Redirecionamento do aluno à própria turma após o login | RF03 | Aprovado |
| E-05 | Visualização de eventos gerais e da própria turma (aluno); isolamento das demais turmas | RF04, RF05 | Aprovado |
| E-06 | Publicação, edição e cancelamento de eventos (professores autorizados/admins) | RF06 | Aprovado |
| E-07 | Inscrições com prazo e limite de vagas | RF07 | Aprovado |
| E-08 | Confirmação de inscrição validada no servidor | RF08 | Aprovado |
| E-09 | Instalação como PWA em navegadores compatíveis | RF09 | Aprovado |
| E-10 | Comportamento da página inicial para usuários sem login | RF10 | 🔴 Pendente (F-1) |
| E-11 | Elegibilidade de inscrição: eventos gerais + da própria turma | RF14 | Aprovado (D-009) |
| E-12 | Modo offline somente leitura com bloqueio de inscrições | RF17 | Aprovado (D-008) |

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
agente para reduzir riscos e manter o foco do projeto de curso). **Nenhum é decisão:**

| ID | Item | Por que recomendado ficar de fora por ora |
|---|---|---|
| FR-01 | Notificações automáticas (push/e-mail) | Amplia o produto além do básico; exige decisão sobre canais de envio. Ver §15 |
| FR-02 | Relatórios/estatísticas de participação | Benefício adicional; pode ser incluído em versões futuras |
| FR-03 | Certificados de participação | Não definido; depende de políticas da escola (não inventar) |
| FR-04 | Sincronização com calendários externos (iCal/Google Calendar) | Complexidade adicional; demanda não registrada pelo autor |

## 9. Requisitos funcionais (RF)

**Legenda da coluna Origem:** 🟢 Aprovada = decisão definitiva do autor ·
🟡 Recomendação = sugestão que depende de sua aprovação ·
🔴 Pendente = falta decisão/informação (ver §15) · ✅ Resolvida = era pendente e foi decidida

| ID | Requisito | Origem |
|---|---|---|
| RF01 | A página inicial apresenta o calendário geral da escola e o acesso às turmas | 🟢 Aprovada (autor) |
| RF02 | O usuário autentica-se com conta institucional `@escola`, via provedor institucional | 🟢 Aprovada (autor) — dependência técnica pendente (F-2) |
| RF03 | Após o login, o aluno é direcionado à própria turma | 🟢 Aprovada (autor) |
| RF04 | Aluno visualiza eventos gerais e eventos da própria turma | 🟢 Aprovada (autor) |
| RF05 | Aluno NÃO visualiza eventos exclusivos de outras turmas | 🟢 Aprovada (autor); elegibilidade de inscrição definida em RF14/D-009 |
| RF06 | Professores autorizados e administradores podem publicar, editar e cancelar eventos | 🟢 Aprovada (autor) — alcance em eventos de terceiros: F-12 |
| RF07 | Eventos podem exigir inscrição, com prazo e limite de vagas | 🟢 Aprovada (autor) |
| RF08 | A inscrição só é confirmada após resposta favorável do servidor; a interface não deve exibir confirmação antecipada | 🟢 Aprovada (regra 9 de AGENTS.md) |
| RF09 | A PWA é instalável em navegadores compatíveis | 🟢 Aprovada (autor) |
| RF10 | Definir o que o visitante sem login vê na página inicial (só calendário; calendário + tela de acesso; bloqueio completo) | 🔴 Pendente (F-1) |
| RF11 | Definir o comportamento ao cancelar um evento (exibir como "cancelado", remover do calendário, informar inscritos) | 🔴 Pendente (F-3) |
| RF12 | Definir se o aluno pode cancelar a própria inscrição e até quando | 🔴 Pendente (F-5) |
| RF13 | Definir a listagem de turmas e seus eventos com os dados reais do CEPK | 🔴 Pendente (F-6) — associado a F-08 (vínculo aluno↔turma) |
| RF14 | O aluno pode inscrever-se em eventos **gerais** e em eventos da **própria turma**, quando exigirem inscrição; eventos de outras turmas não são elegíveis | 🟢 Aprovada (D-009, 2026-10-28) — resolve F-4 |
| RF15 | A página do evento exibe: título, descrição, data/hora, local (se informado), estado da inscrição do aluno e — quando exigir inscrição — indicador `inscritos/vagas` e prazo | 🟡 Recomendação (AUD-04/12) |
| RF16 | A página da turma lista os eventos daquela turma, visível apenas a quem pertence a ela (e a professores autorizados/administradores) | 🟡 Recomendação (AUD-04) |
| RF17 | **Modo offline (D-008):** sem conexão, a PWA (a) exibe o calendário em cache em modo somente leitura com aviso visível "dados podem estar desatualizados" e (b) bloqueia toda tentativa de inscrição com aviso "requer conexão"; **nada é enfileirado ou enviado automaticamente depois** | 🟢 Aprovada (D-008, 2026-10-28) — resolve F-15 |

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
| RNF08 | Recarregar a página ou alternar abas não causa erro na aplicação e não registra inscrição duplicada no servidor | 🟡 Recomendação (AUD-15) |
| RNF09 | Logout disponível e sessão com expiração definida; após o logout, recarregar a página não mantém o acesso | 🟡 Recomendação (AUD-06) — valor da expiração: F-17 |
| RNF10 | Coleta mínima de dados: somente e-mail institucional, nome e vínculo necessários à operação; nenhum dado sensível; dados de teste sempre fictícios | 🟡 Recomendação (AUD-17) — retenção ao sair da escola: F-14 |
| RNF11 | Toda data/hora do sistema é interpretada e exibida no fuso oficial da escola (proposta técnica: America/Sao_Paulo) | 🟡 Recomendação (AUD-13) |
| RNF12 | Registro simples de auditoria: quem e quando publicou, editou ou cancelou evento; quem e quando se inscreveu | 🟡 Recomendação (AUD-16) |

## 11. Regras de negócio (RN)

| ID | Regra | Origem |
|---|---|---|
| RN01 | O vínculo aluno–turma é registrado e validado no banco de dados; nunca inferido do e-mail | 🟢 Aprovada (regras 7/8 de AGENTS.md; D-004) |
| RN02 | Um evento exige inscrição ou não; se exigir, define prazo e limite de vagas *(reafirma RF07 — AUD-22: fonte única em RF/RNF)* | 🟢 Aprovada (autor) |
| RN03 | A inscrição é recusada quando: fora do prazo, sem vaga ou sem vínculo permitido | 🟢 Aprovada (autor) |
| RN04 | Professores autorizados e administradores publicam/editam/cancelam eventos *(reafirma RF06 + FX-05)* | 🟢 Aprovada (autor) |
| RN05 | Elegibilidade de inscrição — **resolvida em 2026-10-28:** ver RF14 e D-009 | ✅ Resolvida (F-4) |
| RN06 | Ao esgotar as vagas, novas tentativas recebem resposta clara de que não há vagas | 🟡 Recomendação (agente) |
| RN07 | Uma inscrição por aluno por evento: tentativa duplicada é recusada com mensagem clara de que o aluno já está inscrito | 🟡 Recomendação (AUD-10) |
| RN08 | Sem conexão, nenhuma inscrição é aceita pela interface, nem provisoriamente (coerência com RF08/RNF07/RF17) | 🟢 Aprovada (D-008, 2026-10-28) |

## 12. Critérios de aceitação (CA)

Critérios verificáveis para considerar o sistema pronto (na medida em que cada
requisito associado for aprovado).

| ID | Critério de aceitação | Requisitos associados | Status |
|---|---|---|---|
| CA-01 | Com dados de teste fictícios, em viewports de 360 px e 1440 px, a página inicial exibe o calendário geral e a lista de turmas, sem rolagem horizontal indevida | RF01, RF10, RNF01 | 🟢 |
| CA-02 | Com credencial institucional válida, o login autentica e o aluno é direcionado à página da sua turma | RF02, RF03 | 🟡 Condicional — executável somente após F-2 confirmar o provedor |
| CA-03 | O aluno não consegue obter eventos de outra turma nem pela interface nem chamando a API diretamente; o servidor recusa | RF05, RNF04 | 🟢 |
| CA-04 | Aluno que tentar publicar/editar/cancelar (via API) recebe recusa do servidor; professor autorizado/admin consegue | RF06, RNF04 | 🟢 |
| CA-05 | Inscrição fora do prazo, sem vaga ou duplicada é recusada com mensagem clara; inscrição válida exibe sucesso somente após confirmação do servidor | RF07, RF08, RN07, RNF07 | 🟢 |
| CA-06 | A instalação da PWA é iniciada pelo menu do navegador compatível; o app abre em janela própria, com ícone, e o manifest e o service worker estão ativos | RF09 | 🟢 |
| CA-07 | Em viewports de 360, 768 e 1440 px em navegador compatível, a interface não apresenta rolagem horizontal indevida nem sobreposição de elementos | RNF01 | 🟢 |
| CA-08 | Auditoria do repositório não encontra segredos, senhas ou tokens versionados | RNF05 | 🟢 |
| CA-09 | Após logout, recarregar a página não mantém o acesso nem permite operações autenticadas | RNF09 | 🟡 (recomendação) |
| CA-10 | Com a conexão cortada: tentativa de inscrição é bloqueada com aviso "requer conexão" e nada é enfileirado; o calendário em cache permanece legível com aviso "dados podem estar desatualizados" | RF17, RN08 | 🟢 (D-008) |
| CA-11 | Contador `inscritos/vagas` visível na página de todo evento que exigir inscrição | RF15 | 🟡 (recomendação) |

## 13. Riscos

| ID | Risco | Impacto | Mitigação |
|---|---|---|---|
| RA-01 | O provedor institucional `@escola` não estar disponível/não existir na escola para uso do projeto | Alto — bloqueia RF02/RF03 | Confirmar antes do desenvolvimento do login (F-2); discutir alternativas com o autor — nenhuma alternativa será implementada sem decisão |
| RA-02 | Prazos do curso mais curtos que o esforço de desenvolvimento | Médio | Entregar o escopo mínimo aprovado primeiro; versões futuras para FR-01…FR-04 |
| RA-03 | Dados das turmas ficarem desatualizados durante o ano letivo | Médio | Definir quem atualiza e como (F-6/F-7/F-08); administração via perfil admin |
| RA-04 | Publicação acidental de segredos no repositório | Alto | `.gitignore` já configurado; revisar pendências antes de cada push (regra 6) |
| RA-05 | Não haver hospedagem gratuita/adequada com HTTPS para o backend | Alto | Decidir cedo (P-2 em `decisoes.md`); alternativas a serem pesquisadas sem inventar serviços |
| RA-06 | Tentativas de inscrições duplicadas/esgotamento de vagas em concorrência | Médio | Controle de vagas transacional no backend; regra RN06 + RN07 |
| RA-07 | Dados pessoais de menores tratados sem política documentada (retenção, minimização) | Alto | Recomendação RNF10 quando aprovada; decisão sobre retenção: F-14; nenhum dado real de alunos/turmas entra no repositório (ver AUD-18) |
| RA-08 | Cache offline exibir dados desatualizados como se valessem a validade | Médio | RF17/RN08 (D-008): somente leitura + aviso; teste por CA-10 |
| RA-09 | Prazos comparados em fusos distintos (navegador x servidor) | Médio | Recomendação RNF11 quando aprovada; testes de limite com prazo programado |

## 14. Decisões aprovadas (resumo por fonte)

- **D-001** — Somente PWA, sem APK/nativo/Capacitor.
- **D-002** — Stack: HTML/CSS/JS + Node.js/Express + PostgreSQL.
- **D-003** — Autenticação institucional; sem armazenamento de senhas.
- **D-004** — Permissões via vínculos no banco, validadas no backend; domínio de e-mail nunca concede privilégio.
- **D-005, D-006, D-007** — Documentação antes do código, Git local, publicação no GitHub.
- **D-008 (novo, 2026-10-28)** — Modo offline: somente leitura com aviso de desatualização; inscrição exige conexão ativa; nada é enfileirado.
- **D-009 (novo, 2026-10-28)** — Elegibilidade de inscrição: eventos gerais + da própria turma.
- Regras 1–12 de `AGENTS.md` continuam vigentes.

*Histórico completo: `docs/decisoes.md` — sempre adicionar um novo ID; nunca sobrescrever uma decisão.*

## 15. Decisões pendentes (aguardando o autor)

| ID | Questão | Onde impacta | Status |
|---|---|---|---|
| F-1 | Visitante sem login vê o calendário geral na página inicial, ou precisa logar? | RF10, página inicial | 🔴 Aberta |
| F-2 | Qual provedor institucional de autenticação existe na escola (Google for Education, Microsoft 365, outro)? | RF02, backend do login, P-1 | 🔴 Aberta |
| F-3 | Ao cancelar um evento com inscritos, o que deve acontecer? | RF11, RN05 | 🔴 Aberta |
| F-4 | Aluno pode inscrever-se em eventos gerais abertos a todas as turmas? | RF14 | ✅ Resolvida (D-009) |
| F-5 | Aluno pode cancelar a própria inscrição? E até quando? | RF12, regras de inscrição | 🔴 Aberta |
| F-6 | Quantas turmas existem e como são identificadas? | RF13, cadastro de turmas, P-3 | 🔴 Aberta |
| F-7 | Quem habilita um professor a autorizar (admin) e como? | RF06, gestão de permissões, P-4 | 🔴 Aberta |
| F-8 | **Novo:** como o vínculo aluno↔turma é criado e mantido (cadastro manual pelo admin, importação em lote, outra forma)? Com que frequência é atualizado? O que acontece com o vínculo quando o aluno muda de turma? | RF03–RF05, RN01, RA-03 | 🔴 Aberta (AUD-01) |
| F-9 | **Novo:** o professor não autorizado vê o mesmo que o aluno, vê apenas eventos gerais, ou fica com acesso restrito? | §5, RF06 | 🔴 Aberta (AUD-02) |
| F-10 | **Novo:** eventos de turma podem estar abertos às demais turmas? | RF05, §5 | ✅ Resolvida por reflexo — D-009 restringe a elegibilidade a eventos gerais + da própria turma |
| F-11 | **Novo:** quais dados do evento (prazo, vagas) podem ser alterados depois de iniciadas as inscrições, e com que efeito sobre inscritos? | RF06, RF07, RF11 | 🔴 Aberta (AUD-11) |
| F-12 | **Novo:** professor autorizado edita/cancela somente seus eventos ou qualquer evento? (sugestão do agente: somente os próprios; admin tudo) | RF06 | 🔴 Aberta (AUD-05) |
| F-13 | **Novo:** como é criado o primeiro administrador do sistema (script de preparação único, promoção manual no banco, outro método)? | §5, plano de desenvolvimento | 🔴 Aberta (AUD-07) |
| F-14 | **Novo:** o que é retido (ou apagado) dos dados de um aluno cujo vínculo com a escola termina? | RNF10, RA-07 | 🔴 Aberta (AUD-17) |
| F-15 | **Novo:** qual o comportamento offline da PWA? | RF17, RN08 | ✅ Resolvida (D-008) |
| F-16 | **Novo:** o "calendário geral" será um calendário visual (grade mensal) ou uma lista/agenda ordenada? | RF01, interface | 🔴 Aberta (AUD-23) — decisão de tela |
| F-17 | **Novo:** quanto tempo uma sessão pode ficar inativa antes de expirar (proposta do agente quando aprovado o RNF09)? | RNF09, CA-09 | 🔴 Aberta (AUD-06) |

> **P-1 a P-4 de `decisoes.md` permanecem válidas:** provedor institucional (P-1),
> hospedagem com HTTPS (P-2), dados reais das turmas (P-3), políticas de
> cancelamento (P-4).

## 16. Histórico de versões

| Versão | Data | Descrição |
|---|---|---|
| 1.0 | 2026-10-28 | Primeira versão formal do documento. Base: rascunho anterior (commit 4d316ca). Adicionadas seções de identificação, problema, objetivos, público-alvo, escopo, fora do escopo, critérios de aceitação, riscos e pendências; IDs renormalizados para RF/RNF/RN sem hífen; dúvidas F-1…F-7 preservadas |
| 1.1 | 2026-10-28 | Auditoria de requisitos aplicada (AUD-01…AUD-24, aprovadas pelo autor). Criados RF14–RF17, RNF08–RNF12 (reescrita do RNF08), RN06–RN08, CA-09–CA-11, RA-07–RA-09; pendências F-08–F-17; decisões D-008 (offline) e D-009 (elegibilidade de inscrição) aprovadas e registradas; questões F-4/F-10/F-15 resoluções; §7 tornado índice com referências cruzadas (AUD-22); CAs vagos reescritos (CA-01, CA-02 condicional, CA-06, CA-07) |
