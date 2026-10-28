# Requisitos — CEPK Eventos

Documento oficial de requisitos. **Nada deve ser implementado antes da aprovação
deste documento pelo autor** (regra 4 de AGENTS.md).

Status: 🟡 aguardando aprovação.

## 1. Visão geral

Centralizar os eventos do Colégio Estadual Presidente Kennedy (CEPK) em uma PWA que
permite: consultar o calendário geral da escola, consultar eventos da própria turma
e, quando o evento exigir, realizar inscrição dentro do prazo e do limite de vagas.

## 2. Perfis de usuário

| Perfil | O que pode fazer | Como é identificado |
|---|---|---|
| Visitante (sem login) | A definir — depende da Dúvida F-1 | — |
| Aluno | Ver eventos gerais + da própria turma; inscrever-se quando habilitado | Conta institucional `@escola` + vínculo aluno–turma no banco |
| Professor autorizado | Publicar, editar e cancelar eventos | Vínculo professor + autorização explícita no banco |
| Administrador | Tudo do professor + conceder autorizações | Vínculo administrador no banco |

> ⚠️ Regra permanente: o domínio do e-mail **não** define o perfil. Apenas o vínculo
> registrado no banco de dados, validado no backend.

## 3. Requisitos funcionais (RF)

| ID | Requisito | Fonte |
|---|---|---|
| RF-01 | A página inicial apresenta o calendário geral da escola e o acesso às turmas | Decisões do autor |
| RF-02 | O usuário autentica-se com conta institucional `@escola` | Decisões do autor |
| RF-03 | Após o login, o aluno é direcionado à própria turma | Decisões do autor |
| RF-04 | Aluno visualiza eventos gerais e da própria turma | Decisões do autor |
| RF-05 | Aluno NÃO visualiza eventos exclusivos de outras turmas | Decisões do autor |
| RF-06 | Professores autorizados e administradores podem publicar, editar e cancelar eventos | Decisões do autor |
| RF-07 | Eventos podem exigir inscrição, com prazo e limite de vagas | Decisões do autor |
| RF-08 | Inscrito só é validado/confirmado após resposta do servidor | Regra 9 de AGENTS.md |
| RF-09 | A PWA é instalável em navegadores compatíveis | Decisões do autor |

## 4. Requisitos não funcionais (RNF)

| ID | Requisito |
|---|---|
| RNF-01 | Interface responsiva (celular, tablet, desktop) |
| RNF-02 | Backend e banco de dados centralizados; a interface jamais decide permissões |
| RNF-03 | Comunicação sempre por HTTPS |
| RNF-04 | Permissões validadas no backend em TODA operação sensível |
| RNF-05 | Segredos fora do código e do Git (uso de variáveis de ambiente / provedor de segredos) |
| RNF-06 | Código organizado, testável e de fácil manutenção |
| RNF-07 | A interface nunca exibe um estado não confirmado pelo servidor (ex.: inscrições pendentes não aparecem como confirmadas) |

## 5. Regras de negócio (RN)

| ID | Regra |
|---|---|
| RN-01 | O vínculo aluno√turma é registrado e validado no banco; nunca inferido do e-mail |
| RN-02 | Evento exige inscrição ou não; se exigir, define prazo e limite de vagas |
| RN-03 | A inscrição é recusada quando: fora do prazo, sem vaga ou sem vínculo permitido |
| RN-04 | Professores autorizados e admins publicam/editam/cancelam eventos |

## 6. Dúvidas em aberto (aguardando decisão do autor)

| ID | Dúvida | Impacto |
|---|---|---|
| F-1 | Visitante sem login vê o calendário geral na página inicial, ou precisa logar? | Design da página inicial |
| F-2 | Qual provedor institucional de autenticação está disponível na escola? (Google for Education, Microsoft 365, outro?) | Estratégia de login |
| F-3 | Ao cancelar um evento com inscritos, o que deve acontecer? (aparecer "cancelado", remover, notificar?) | Comportamento de cancelamento |
| F-4 | Aluno pode inscrever-se em eventos gerais de outras turmas? Somente da própria + gerais? | Regras de inscrição |
| F-5 | Aluno pode cancelar a própria inscrição? até quando? | Regras de inscrição |
| F-6 | Quantas turmas existem e como são identificadas? (dados a fornecer pelo autor) | Cadastro de turmas |
| F-7 | Quem habilita um professor a autorizar (admin) e como? | Gestão de permissões |
