# Arquitetura — CEPK Eventos (proposta inicial)

Status: 🟡 proposta para aprovação. Descreve a arquitetura prevista; nada está implementado.

## 1. Visão geral em camadas

```text
┌──────────────────────────────────────────┐
│             NAVEGADOR (PWA)              │
│      HTML + CSS + JavaScript             │
│   instalável · responsiva · offline-lite │
└──────────────────┬───────────────────────┘
                   │ HTTPS
                   ▼
┌──────────────────────────────────────────┐
│        BACKEND (Node.js + Express)       │
│   rotas · validação de permissões ·      │
│   regras de negócio · prazos · vagas     │
└─────────┬───────────────────┬────────────┘
          │                   │
          ▼                   ▼
┌──────────────────┐   ┌──────────────────────────┐
│    PostgreSQL    │   │  Provedor institucional  │
│ (dados central   │   │  de autenticação @escola │
│  e única verdade)│   │  (disponibilidade a      │
└──────────────────┘   │   confirmar — não assumir)│
                       └──────────────────────────┘
```

## 2. Explicação didática de cada camada

- **Frontend (PWA):** é a interface. Roda no navegador, pode ser instalada na tela
  inicial do celular e funciona como "porta de entrada". **Nunca** decide quem pode
  fazer o quê — tudo que é sensível é revalidado no backend, porque o código do
  navegador é visível e manipulável pelo usuário.
- **Backend (Express):** é o "gerente". Recebe pedidos, valida quem está chamando,
  aplica as regras (permissões, prazos, limite de vagas) e só então responde.
- **PostgreSQL:** é a "memória" central e a única fonte de verdade: usuários, turmas,
  eventos, inscrições e vínculos de permissão.
- **Provedor institucional:** autentica a conta `@escola`. O sistema **não** guarda
  senha nenhuma; verifica a identidade junto ao provedor.

## 3. Organização de pastas prevista (sujeita a revisão)

```text
cepk-eventos/
├── AGENTS.md
├── docs/
│   ├── requisitos.md
│   ├── arquitetura.md
│   └── decisoes.md
├── src/
│   ├── frontend/
│   │   ├── css/
│   │   ├── js/
│   │   └── pwa/            ← manifest.json, service worker
│   └── backend/
│       ├── routes/          ← definição dos endpoints
│       ├── controllers/     ← lógica de cada endpoint
│       ├── services/        ← regras de negócio (prazos, vagas, permissões)
│       ├── middlewares/     ← autenticação e verificação de perfil
│       ├── db/              ← conexão e scripts do banco
│       └── app.js
├── tests/
├── .env.example             ← SEM segredos reais; modelo de variáveis de ambiente
└── .gitignore
```

> A pasta `src/` ainda **não existe**. Será criada apenas na etapa de código,
> após aprovação do plano de desenvolvimento.

## 4. Fluxos principais previstos

1. **Login:** usuário → tela de login → provedor institucional valida → backend
   recebe identidade → verifica vínculos no banco → responde perfil → PWA
   redireciona à turma do aluno.
2. **Calendário geral:** PWA pede eventos gerais → backend filtra conforme perfil → resposta.
3. **Eventos da turma:** PWA pede eventos da turma X → backend valida se o aluno
   pertence à turma X → libera ou recusa (regra garantida no servidor).
4. **Publicar/editar/cancelar evento:** backend verifica perfil (professor
   autorizado/admin) em cada pedido — nunca confia no que a tela diz.
5. **Inscrição:** backend valida prazo, vagas e elegibilidade → reserva vaga →
   retorna confirmação → só então a PWA exibe "inscrição confirmada".

## 5. Decisões de arquitetura em aberto

| Tema | Situação |
|---|---|
| Provedor institucional de autenticação | A confirmar com a escola (ver F-2 em requisitos.md) |
| Hospedagem com HTTPS para o backend (o frontend PWA sozinho não roda Express) | A definir com o autor |
| Estratégia de testes (manuais e automatizados) | A definir na etapa de planejamento |
| Avisos de prazos dos eventos | A decidir (pode ficar fora do escopo inicial) |
