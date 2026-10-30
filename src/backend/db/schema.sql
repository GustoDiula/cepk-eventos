-- CEPK Eventos — esquema do banco (etapa 2 + D-024/D-025).
-- Alinhado a docs/modelo-de-dados.md; adições desta etapa estão comentadas.
-- Aplicar: npm run db:schema   (idempotente: CREATE TABLE IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS turmas (
  id          BIGSERIAL PRIMARY KEY,
  nome_curto  TEXT   NOT NULL UNIQUE,
  tipo        TEXT   NOT NULL DEFAULT 'regular' CHECK (tipo IN ('regular', 'tecnica')),
  ano_letivo  SMALLINT NOT NULL,
  ativa       BOOLEAN NOT NULL DEFAULT true,
  criada_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT   NOT NULL UNIQUE,
  nome          TEXT   NOT NULL,
  -- papel define o ESCOPO de consulta; publicação de eventos (RF06) plusetapa 6 usa autorizacoes
  papel         TEXT   NOT NULL CHECK (papel IN ('aluno', 'professor', 'pedagogia', 'direcao')),
  -- ALTERAÇÃO D-024: senha_hash para contas LOCAIS de demonstração (bcrypt).
  -- NULO = conta que entra somente pelo provedor institucional (F-2, futuro).
  -- JAMAIS guardar a senha em texto: só o hash sai do processo de inicialização.
  senha_hash    TEXT,
  ativo         BOOLEAN NOT NULL DEFAULT true,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS disciplinas (
  id   BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE
);

-- Aluno ↔ turma (modelo v1.0 §3.3): 1 vínculo ativo por aluno (D-009)
CREATE TABLE IF NOT EXISTS vinculos_aluno_turma (
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  turma_id   BIGINT NOT NULL REFERENCES turmas(id)   ON DELETE CASCADE,
  ativo      BOOLEAN NOT NULL DEFAULT true,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS vinculos_aluno_unicos
  ON vinculos_aluno_turma (usuario_id) WHERE ativo = true;

-- Professor ↔ turma ↔ disciplina (nova — pedido 28/10/2026): 1 linha por
-- (professor, turma, disciplina). Vários vínculos por professor, sempre
-- explícitos no banco; o próprio professor NÃO pode criar os seus.
CREATE TABLE IF NOT EXISTS vinculos_docencia (
  usuario_id    BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  turma_id      BIGINT NOT NULL REFERENCES turmas(id)   ON DELETE CASCADE,
  disciplina_id BIGINT NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
  ativo         BOOLEAN NOT NULL DEFAULT true,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS vinculos_docencia_unicos
  ON vinculos_docencia (usuario_id, turma_id, disciplina_id) WHERE ativo = true;

-- Pedagogia ↔ turmas (nova): conjunto de turmas sob responsabilidade,
-- definido por linhas no banco (configurável sem tocar código — B-002).
CREATE TABLE IF NOT EXISTS vinculos_pedagogia (
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  turma_id   BIGINT NOT NULL REFERENCES turmas(id)   ON DELETE CASCADE,
  ativo      BOOLEAN NOT NULL DEFAULT true,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, turma_id)
);

-- Eventos (modelo v1.0 §3.4) + campo tipo para apresentação na grade
CREATE TABLE IF NOT EXISTS eventos (
  id              BIGSERIAL PRIMARY KEY,
  titulo          TEXT   NOT NULL,
  descricao       TEXT,
  local           TEXT,
  inicio          TIMESTAMPTZ NOT NULL,
  fim             TIMESTAMPTZ NOT NULL,
  tipo            TEXT   NOT NULL DEFAULT 'outro'
                  CHECK (tipo IN ('prova', 'feira', 'viagem', 'trabalho', 'boletim', 'outro')),
  escopo          TEXT   NOT NULL CHECK (escopo IN ('geral', 'turma')),
  turma_id        BIGINT REFERENCES turmas(id),
  exige_inscricao BOOLEAN NOT NULL DEFAULT false,
  vagas_total     SMALLINT CHECK (vagas_total > 0),
  vagas_restantes SMALLINT CHECK (vagas_restantes >= 0 AND vagas_restantes <= vagas_total),
  prazo_inscricao TIMESTAMPTZ,
  status          TEXT   NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'cancelado')),
  criado_por      BIGINT REFERENCES usuarios(id),
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((escopo = 'geral' AND turma_id IS NULL) OR (escopo = 'turma' AND turma_id IS NOT NULL)),
  CHECK (fim > inicio),
  CHECK (NOT exige_inscricao OR (
    vagas_total IS NOT NULL AND vagas_restantes IS NOT NULL AND prazo_inscricao IS NOT NULL
  ))
);
CREATE INDEX IF NOT EXISTS eventos_por_turma ON eventos (turma_id, inicio) WHERE status = 'ativo';
