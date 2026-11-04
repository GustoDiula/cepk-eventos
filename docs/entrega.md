# Documento de entrega — CEPK Eventos

Data: 2026-11-03 · Autor: Gustavo Diula
Projeto: CEPK Eventos — PWA para centralizar os eventos do
Colégio Estadual Presidente Kennedy (CEPK).

## 1. Links da entrega

| O quê | Link |
|---|---|
| **Aplicação online (PWA real, instalável)** | <https://cepk-eventos.onrender.com> |
| Repositório GitHub (código + histórico) | <https://github.com/GustoDiula/cepk-eventos> |
| Documento de requisitos | <https://github.com/GustoDiula/cepk-eventos/blob/master/docs/requisitos.md> |
| (Extra) Demo estática sem servidor — vitrine | <https://gustodiula.github.io/cepk-eventos/> |

## 2. O que funciona ONLINE hoje (provado por verificação em 03/11)

- **Login real** com as 5 contas de demonstração do banco
  (ex.: `aluno1@cepk-eventos.test`), sessão de SERVIDOR gravada no
  PostgreSQL, cookie HTTP-only (regra 9 em vigor: nada de confirmação
  apenas na interface);
- **Turmas conforme o vínculo do banco** (D-025): aluno vê a própria
  turma; professora vê as 3 que leciona; pedagoga/direção conforme papel;
- **Calendário mensal + lista de atividades por turma**, lidos pela
  API (`/api/v1/turmas` e `/api/v1/turmas/:id/eventos`) com datas/horas
  no fuso da escola (`-03:00`);
- **401** para quem não tem sessão (permissão validada no BACKEND);
- **PWA instalável**: manifest + ícones 192/512/maskable +
  service worker (cabeçalho `Service-Worker-Allowed: /` verificado) —
  HTTPS: o navegador oferece "Instalar aplicativo";
- **Banco PostgreSQL real na nuvem** (Neon, plano gratuito), TLS
  obrigatório; aplicação hospedada no Render (plano gratuito; o serviço
  "dorme" após ~15 min sem acesso e acorda em ~30–50 s — comportamento
  do plano, não defeito).

### Protótipos honestos (etapas 6–7 pendentes)

- `inscricoes.html` e `evento.html` são **protótipos visuais**: os botões
  de inscrição aparecem DESABILITADOS de propósito — a confirmação
  precisa do servidor conferindo vagas e prazo (RN08/regra 9). Os
  endpoints dessas etapas constam do plano de desenvolvimento.

## 3. Mapeamento exigência → evidência

| Exigência do trabalho | Atendimento | Evidência |
|---|---|---|
| Projeto de IA + agente especializado em Eng. de Requisitos | Feito com **OpenCode** (rota "preferencial" do enunciado) | `AGENTS.md` (instruções permanentes do agente) + `docs/requisitos.md` |
| Definir requisitos, funcionalidades e planejamento | Feito ANTES de programar (decisão D-005) | `docs/requisitos.md` · `docs/plano-de-desenvolvimento.md` (etapas 0–5 executadas) · `docs/decisoes.md` (D-001..D-027: data, motivo, status) |
| Desenvolver a aplicação utilizando IA | Toda a implementação com o agente | histórico do repositório (`git log`) |
| Experimentar diferentes modelos de IA e comparar | ⚠️ **Pendente de documentação pelo autor** | (o agente do projeto é único: OpenCode + modelo GLM) — o autor precisa registrar a comparação que fizer com outro modelo (ex.: ChatGPT) para este item |
| Interface responsiva e instalável (PWA) | Feito e verificado online | checks de 03/11: manifest 200, SW 200 + `Service-Worker-Allowed`, ícones PNG reais |
| Aplicação pode usar API e banco (opcionais) | **Usamos API + PostgreSQL** | Express + Neon; `localStorage` não foi necessário (e na demo é proibido por decisão — `docs/decisoes.md` D-026) |
| Agente especializado no OpenCode | ✅ Exatamente o que o projeto tem | `AGENTS.md` |
| Pesquisar o conceito de ______ e suas aplicações | ⚠️ A palavra-fim da exigência constava do enunciado ORIGINAL — o autor confirma a palavra e registra em `docs/` | (não inventar conceito — em aberto) |
| Testar e corrigir a aplicação | Feito continuamente | suíte `npm test`: **34/34** ✔ + falhas/correções reais registradas nas decisões |
| Publicar o código no GitHub | Feito | repositório público linkado acima |
| Aplicação acessível online e instalável como PWA | ✅ NO AR (03/11) | URL da entrega; verificação completa em `docs/hospedagem.md` |

## 4. Roteiro de apresentação (2–3 minutos)

1. Abrir <https://cepk-eventos.onrender.com/login.html> **do celular ou
   do PC** e logar com `aluno1@cepk-eventos.test` + a senha de
   demonstração (o autor apresenta);
2. Mostrar **a grade de turmas do aluno** (só a dele — vínculo do banco)
   → abrir o calendário do `1º A` → listar atividades;
3. Mostrar a "justiça das permissões": abrir a MESMA URL em janela
   anônima **sem login** → a API responde **401** (nada se vê);
4. Instalar o PWA (botão de instalar do navegador) — ícone no
   celular/desktop;
5. Mostrar o repositório: `AGENTS.md`, `docs/requisitos.md`,
   `docs/decisoes.md` (diário D-001..D-027) e a suíte: `npm test`
   (34 testes);
6. (Extra) Demo estática no Pages como vitrine sem servidor.

## 5. Como executar localmente (professor/avaliador)

1. Clonar o repositório; 2. `npm install`; 3. copiar `.env.example` →
`.env` e definir `DATABASE_URL` de um PostgreSQL local + `SENHA_DEMO`;
4. iniciar o banco portátil: `npm run pg:start`; 5. semear o banco:
`npm run db:demonstracao`; 6. abrir: `npm run dev` (porta 3000);
7. testes: `npm test` (34 testes).

### Segurança do repositório (prova de higiene)

- **Nenhum segredo está em código/Git**: senhas vivem só no `.env`
  (gitignored) e nos painéis das hospedagens (Render/Neon);
- `.env.example` documenta AS VARIÁVEIS sem valores;
- `npm audit` limpo no build do deploy (0 vulnerabilidades).

## 6. Pendências declaradas (honestidade da entrega)

1. Etapas 6–7: endpoints de inscrições/eventos (protótipos já publicados);
2. Etapa 8–10: publicar/cancelar eventos por professores autorizados;
3. Login institucional `@escola` (D-003) — aguarda provedor;
4. Item do trabalho "diferentes modelos de IA" e o "conceito de ______"
   (a palavra exata do enunciado ORIGINAL) — a completar pelo autor;
5. CSP estrita (helmet) — pendência técnica registrada no plano.
