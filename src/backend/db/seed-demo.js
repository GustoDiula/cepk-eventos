// Inicialização REPRODUZÍVEL do ambiente de demonstração (pedido 28/10/2026 §4).
//
// Executar: npm run db:demonstracao   (ou: node --env-file-if-exists=.env src/backend/db/seed-demo.js)
//
// Regras SÉRIAS desta etapa:
//   • A SENHA de demonstração NUNCA fica no código, no Git, no frontend ou em logs:
//     o script LÊ SENHA_DEMO do .env local (gitignored) e guarda APENAS o hash bcrypt.
//   • Sem a variável, o script SE RECUSA (erro claro) — nada é inventado.
//   • Idempotência: reexecutar não duplica (ON CONFLICT DO NOTHING); dados alterados
//     manualmente não são sobrescritos.
//   • Todas as atividades implantadas aqui carregam a marca "(demonstração)" — nunca
//     se passam por dados reais do colégio (regra 3 do AGENTS.md).
//
// FONTE ÚNICA (D-026): este arquivo também exporta os DADOS PUROS de demonstração
// (turmas, contas SEM hash, narrativa de eventos e vínculos por nome/e-mail).
// scripts/gerar-demo.cjs os usa para montar a demo estática do GitHub Pages —
// assim há UM só jogo de dados no projeto (o mesmo do banco), nunca uma cópia.
//
// Contas (5 — dois alunos, um professor, uma pedagoga, uma diretora):
//   aluno1@cepk-eventos.test        → turma 1º A
//   aluno2@cepk-eventos.test        → turma 1º B
//   prof.geografia@cepk-eventos.test→ leciona Geografia em 1º A, 1º B, 1º C
//   pedagoga1@cepk-eventos.test     → 10 turmas (7 técnicas + 1º A/B/C)
//   diretora@cepk-eventos.test      → papel direção (todas as turmas ativas)

const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const { obterPool } = require('./pool');

const TURMAS = [
  // 3 regulares + 7 técnicas — ano letivo 2026
  { nome_curto: '1º A', tipo: 'regular' },
  { nome_curto: '1º B', tipo: 'regular' },
  { nome_curto: '1º C', tipo: 'regular' },
  { nome_curto: '1º DSB', tipo: 'tecnica' },
  { nome_curto: '1º ADM', tipo: 'tecnica' },
  { nome_curto: '2º DSB', tipo: 'tecnica' },
  { nome_curto: '2º ADM', tipo: 'tecnica' },
  { nome_curto: '3º DSB', tipo: 'tecnica' },
  { nome_curto: '3º DSC', tipo: 'tecnica' },
  { nome_curto: '3º ADM', tipo: 'tecnica' },
];

const CONTAS = [
  // Dados PUROS — NENHUMA senha aqui: a senha inicial vive só no .env LOCAL
  // e entra no banco como hash bcrypt (função hashDaSenhaDemo).
  { email: 'aluno1@cepk-eventos.test', nome: 'Aluno Demo 1', papel: 'aluno' },
  { email: 'aluno2@cepk-eventos.test', nome: 'Aluno Demo 2', papel: 'aluno' },
  { email: 'prof.geografia@cepk-eventos.test', nome: 'Professora de Geografia (demo)', papel: 'professor' },
  { email: 'pedagoga1@cepk-eventos.test', nome: 'Pedagoga 1 (demo)', papel: 'pedagogia' },
  { email: 'diretora@cepk-eventos.test', nome: 'Diretora (demo)', papel: 'direcao' },
];

// Hash é calculado UMA vez por execução (custo 10 — equilíbrio padrão)
function hashDaSenhaDemo() {
  const senha = process.env.SENHA_DEMO;
  if (!senha) {
    throw new Error(
      'SENHA_DEMO ausente no .env. Defina a senha inicial das contas de demonstração ' +
      'no seu arquivo .env local (fora do Git) e rode npm run seed-demo novamente.'
    );
  }
  return bcrypt.hashSync(senha, 10);
}

async function aplicarSchema() {
  const pool = obterPool();
  const arquivo = path.join(__dirname, 'schema.sql');
  await pool.query(fs.readFileSync(arquivo, 'utf8'));
}

async function semearTurmas(pool) {
  for (const t of TURMAS) {
    await pool.query(
      `INSERT INTO turmas (nome_curto, tipo, ano_letivo)
       VALUES ($1, $2, 2026)
       ON CONFLICT (nome_curto) DO NOTHING`,
      [t.nome_curto, t.tipo]
    );
  }
}

async function semearUsuarios(pool, hash) {
  for (const conta of CONTAS) {
    await pool.query(
      `INSERT INTO usuarios (email, nome, papel, senha_hash)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [conta.email, conta.nome, conta.papel, hash]
    );
  }
}

// Vínculos de demonstração — DADOS PUROS (identificados por e-mail + nome de
// turma, sem ids): consumidos pelo seed (abaixo) e pela demo estática (D-026).
function vinculosDemo() {
  return {
    // Aluno 1 → 1º A · Aluno 2 → 1º B (aprovado pelo autor)
    alunos: [
      { email: 'aluno1@cepk-eventos.test', turma: '1º A' },
      { email: 'aluno2@cepk-eventos.test', turma: '1º B' },
    ],
    // Professora de Geografia → 1º A, 1º B, 1º C (aprovado)
    docencia: [
      { email: 'prof.geografia@cepk-eventos.test', disciplina: 'Geografia', turmas: ['1º A', '1º B', '1º C'] },
    ],
    // Pedagoga 1 → as 10 turmas listadas (aprovado: todas as 10)
    pedagogia: [
      { email: 'pedagoga1@cepk-eventos.test', turmas: TURMAS.map((t) => t.nome_curto) },
    ],
    // Diretoria: papel 'direcao' já abrange todas — NENHUMA linha de vínculo
  };
}

async function semearVinculos(pool) {
  const idDe = async (tabela, coluna, valor) => {
    const { rows } = await pool.query(`SELECT id FROM ${tabela} WHERE ${coluna} = $1`, [valor]);
    return rows.length ? rows[0].id : null;
  };

  const turmaDe = (nome) => idDe('turmas', 'nome_curto', nome);
  const usuarioDe = (email) => idDe('usuarios', 'email', email);

  const vinculos = vinculosDemo();

  const disciplinaNome = vinculos.docencia[0].disciplina;
  await pool.query(
    `INSERT INTO disciplinas (nome) VALUES ($1) ON CONFLICT (nome) DO NOTHING`,
    [disciplinaNome]
  );
  const disciplinaId = await idDe('disciplinas', 'nome', disciplinaNome);

  for (const aluno of vinculos.alunos) {
    await pool.query(
      `INSERT INTO vinculos_aluno_turma (usuario_id, turma_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [await usuarioDe(aluno.email), await turmaDe(aluno.turma)]
    );
  }

  for (const docente of vinculos.docencia) {
    const prof = await usuarioDe(docente.email);
    for (const turmaNome of docente.turmas) {
      await pool.query(
        `INSERT INTO vinculos_docencia (usuario_id, turma_id, disciplina_id) VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [prof, await turmaDe(turmaNome), disciplinaId]
      );
    }
  }

  for (const pedagogo of vinculos.pedagogia) {
    const pedagoga = await usuarioDe(pedagogo.email);
    for (const turmaNome of pedagogo.turmas) {
      await pool.query(
        `INSERT INTO vinculos_pedagogia (usuario_id, turma_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [pedagoga, await turmaDe(turmaNome)]
      );
    }
  }

  const diretora = CONTAS.find((c) => c.papel === 'direcao');
  return { diretoraId: await usuarioDe(diretora.email) };
}

// NARRATIVA FICTÍCIA das atividades — DADOS PUROS (turma por NOME, resolves no
// seed): mesmas 27 atividades de TODAS as turmas, claramente marcadas
// "(demonstração)". 1º A espelha a narrativa das telas (RF15 mantida).
function narrativaEventosDemo() {
  function evento(turma, titulo, tipo, data, horaInicio, horaFim, local, inscricao = null) {
    const inicio = `${data}T${horaInicio}:00-03:00`;
    const fim = `${data}T${horaFim}:00-03:00`;
    return {
      turma, titulo, tipo, inicio, fim, local,
      ...(inscricao ? { exige_inscricao: true, vagas_total: 45, vagas_restantes: 30, prazo_inscricao: inscricao } : {}),
    };
  }

  return [
    // 1º A — mesma narrativa das telas aprovadas (RF15 mantida)
    evento('1º A', 'Prova de Matemática (demonstração)', 'prova', '2026-10-28', '08:00', '09:30', 'Sala 12'),
    evento('1º A', 'Prova de História (demonstração)', 'prova', '2026-11-04', '08:00', '09:30', 'Sala 12'),
    evento('1º A', 'Prova de Biologia (demonstração)', 'prova', '2026-11-11', '08:00', '09:30', 'Sala 12'),
    evento('1º A', 'Prova de Português (demonstração)', 'prova', '2026-11-18', '08:00', '09:30', 'Sala 12'),
    evento('1º A', 'Prova de Geografia (demonstração)', 'prova', '2026-11-25', '08:00', '09:30', 'Sala 12'),
    evento('1º A', 'Feira de profissões (demonstração)', 'feira', '2026-12-05', '09:00', '11:00', 'Ginásio'),
    evento('1º A', 'Viagem pedagógica (demonstração)', 'viagem', '2026-12-08', '07:30', '17:00',
      'Saída pelo portão da escola', '2026-11-30T18:00:00-03:00'),
    evento('1º A', 'Entrega de boletim (demonstração)', 'boletim', '2026-12-11', '19:00', '20:00', 'Sala 12'),

    // 1º B e 1º C — algumas suas
    evento('1º B', 'Prova de Matemática (demonstração)', 'prova', '2026-11-06', '08:00', '09:30', 'Sala 21'),
    evento('1º B', 'Trabalho em grupo (demonstração)', 'trabalho', '2026-11-20', '14:00', '16:00', 'Sala 21'),
    evento('1º B', 'Entrega de boletim (demonstração)', 'boletim', '2026-12-11', '19:00', '20:00', 'Sala 21'),
    evento('1º C', 'Prova de Física (demonstração)', 'prova', '2026-11-09', '10:00', '11:30', 'Lab. 2'),
    evento('1º C', 'Entrega de boletim (demonstração)', 'boletim', '2026-12-11', '19:00', '20:00', 'Sala 31'),

    // 7 técnicas — prova + atividade cada, datas escalonadas
    evento('1º DSB', 'Prova técnica (demonstração)', 'prova', '2026-11-05', '08:00', '09:30', 'Oficina 1'),
    evento('1º DSB', 'Visita técnica (demonstração)', 'viagem', '2026-11-27', '08:00', '12:00', 'Saída da escola'),
    evento('1º ADM', 'Prova técnica (demonstração)', 'prova', '2026-11-06', '08:00', '09:30', 'Sala 41'),
    evento('1º ADM', 'Apresentação de projetos (demonstração)', 'trabalho', '2026-11-28', '14:00', '16:00', 'Sala 41'),
    evento('2º DSB', 'Prova técnica (demonstração)', 'prova', '2026-11-10', '08:00', '09:30', 'Oficina 2'),
    evento('2º DSB', 'Feira de profissões (demonstração)', 'feira', '2026-12-04', '09:00', '11:00', 'Ginásio'),
    evento('2º ADM', 'Prova técnica (demonstração)', 'prova', '2026-11-12', '08:00', '09:30', 'Sala 42'),
    evento('2º ADM', 'Entrega de projeto (demonstração)', 'trabalho', '2026-12-01', '14:00', '16:00', 'Sala 42'),
    evento('3º DSB', 'Prova técnica (demonstração)', 'prova', '2026-11-13', '08:00', '09:30', 'Oficina 3'),
    evento('3º DSB', 'Entrega de boletim (demonstração)', 'boletim', '2026-12-11', '19:00', '20:00', 'Oficina 3'),
    evento('3º DSC', 'Prova técnica (demonstração)', 'prova', '2026-11-17', '08:00', '09:30', 'Lab. 3'),
    evento('3º DSC', 'Entrega de boletim (demonstração)', 'boletim', '2026-12-11', '19:00', '20:00', 'Lab. 3'),
    evento('3º ADM', 'Prova técnica (demonstração)', 'prova', '2026-11-19', '08:00', '09:30', 'Sala 43'),
    evento('3º ADM', 'Entrega de boletim (demonstração)', 'boletim', '2026-12-11', '19:00', '20:00', 'Sala 43'),
  ];
}

async function semearEventos(pool, criadoPor) {
  const turmaPorNome = {};
  for (const t of TURMAS) {
    const { rows } = await pool.query('SELECT id FROM turmas WHERE nome_curto = $1', [t.nome_curto]);
    turmaPorNome[t.nome_curto] = rows[0].id;
  }

  const eventos = narrativaEventosDemo();

  for (const ev of eventos) {
    // IDEMPOTÊNCIA dos eventos: 'eventos' não tem chave única (id é sequência),
    // então INSERT ... ON CONFLICT não protege contra repetição de Execuções.
    // Confere ANTES: mesmos turma + titulo + inicio ⇒ já implantado, pula.
    const jaExiste = await pool.query(
      `SELECT 1 FROM eventos WHERE turma_id = $1 AND titulo = $2 AND inicio = $3 AND status = 'ativo' LIMIT 1`,
      [turmaPorNome[ev.turma], ev.titulo, ev.inicio]
    );
    if (jaExiste.rowCount > 0) continue;

    await pool.query(
      `INSERT INTO eventos
         (titulo, descricao, local, inicio, fim, tipo, escopo, turma_id,
          exige_inscricao, vagas_total, vagas_restantes, prazo_inscricao, status, criado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'ativo', $13)
       ON CONFLICT DO NOTHING`,
      [
        ev.titulo,
        'Atividade de demonstração (dados fictícios) para a apresentação do projeto.',
        ev.local,
        ev.inicio,
        ev.fim,
        ev.tipo,
        'turma',
        turmaPorNome[ev.turma],
        ev.exige_inscricao ?? false,
        ev.vagas_total ?? null,
        ev.vagas_restantes ?? null,
        ev.prazo_inscricao ?? null,
        criadoPor,
      ]
    );
  }
}

async function executar() {
  // --schema-only: aplica apenas o DDL (útil depois de trocar o schema.sql,
  // sem precisar da senha de demonstração)
  const soSchema = process.argv.includes('--schema-only');
  if (soSchema) {
    const pronta = { usuarios: '(não semeados)', turmas: '(não semeadas)', eventos: '(não semeados)' };
    return aplicarSchema().then(() => pronta);
  }

  const hash = hashDaSenhaDemo();
  const pool = obterPool();
  await aplicarSchema();
  await semearTurmas(pool);
  await semearUsuarios(pool, hash);
  const { diretoraId } = await semearVinculos(pool);
  await semearEventos(pool, diretoraId);

  const resumo = await pool.query(
    `SELECT
       (SELECT count(*) FROM usuarios)   AS usuarios,
       (SELECT count(*) FROM turmas)     AS turmas,
       (SELECT count(*) FROM eventos)    AS eventos`
  );
  return resumo.rows[0];
}

module.exports = {
  // dados puros (fonte única: p/ seed, testes e demo estática — D-026)
  TURMAS,
  CONTAS,
  narrativaEventosDemo,
  vinculosDemo,
  // própios de banco de verdade
  executar,
  aplicarSchema,
};

// Invocável direto: npm run db:demonstracao
if (require.main === module) {
  executar()
    .then((r) => {
      console.log(`Seed de demonstração ok — usuarios: ${r.usuarios}, turmas: ${r.turmas}, eventos: ${r.eventos}`);
    })
    .catch((erro) => {
      console.error(`Seed falhou: ${erro.message}`);
      process.exit(1);
    });
}
