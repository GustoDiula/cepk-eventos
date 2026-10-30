// Permissões por vínculo no BANCO (regra 7/8 do AGENTS; D-004; RF05/D-009).
// Nenhuma decisão de acesso nasce de e-mail, domínio ou interface — só destas queries.
const { obterPool } = require('../db/pool');

// Conjunto de IDs de turmas que o usuário pode VER/consultar, conforme papel:
//   aluno     → vínculo(s) ativo(s) na tabela de alunos (1 turma pela regra do modelo)
//   professor → vínculos de docência (cada linha = professor↔turma↔disciplina)
//   pedagogia → vínculos de responsabilidade (conjunto configurável no banco)
//   direcao   → todas as turmas ativas (acesso decorre do papel atribuído, NÃO de exceção no frontend)
async function turmasAcessiveis(usuario) {
  const pool = obterPool();
  const filtroTurmasAtivas = 'SELECT id, nome_curto, tipo, ano_letivo FROM turmas WHERE ativa = true ORDER BY nome_curto';

  if (usuario.papel === 'direcao') {
    const { rows } = await pool.query(filtroTurmasAtivas);
    return rows;
  }

  const consultas = {
    aluno: `SELECT t.id, t.nome_curto, t.tipo, t.ano_letivo
              FROM turmas t
              JOIN vinculos_aluno_turma v ON v.turma_id = t.id
             WHERE v.usuario_id = $1 AND v.ativo = true AND t.ativa = true
             ORDER BY t.nome_curto`,
    professor: `SELECT DISTINCT t.id, t.nome_curto, t.tipo, t.ano_letivo
              FROM turmas t
              JOIN vinculos_docencia v ON v.turma_id = t.id
             WHERE v.usuario_id = $1 AND v.ativo = true AND t.ativa = true
             ORDER BY t.nome_curto`,
    pedagogia: `SELECT t.id, t.nome_curto, t.tipo, t.ano_letivo
              FROM turmas t
              JOIN vinculos_pedagogia v ON v.turma_id = t.id
             WHERE v.usuario_id = $1 AND v.ativo = true AND t.ativa = true
             ORDER BY t.nome_curto`,
  };

  const { rows } = await pool.query(consultas[usuario.papel], [usuario.id]);
  return rows;
}

// Verificação pontual: este usuário pode consultar esta turma? (usada nas
// rotas por turma; quem não pode recebe 404 — CA-03/D-009: não vazar existência)
async function podeAcessarTurma(usuario, turmaId) {
  const pool = obterPool();
  const id = Number(turmaId);
  if (!Number.isInteger(id) || id <= 0) return false;

  if (usuario.papel === 'direcao') {
    const { rows } = await pool.query('SELECT 1 FROM turmas WHERE id = $1 AND ativa = true', [id]);
    return rows.length === 1;
  }

  const consultas = {
    aluno:     'SELECT 1 FROM vinculos_aluno_turma WHERE usuario_id = $1 AND turma_id = $2 AND ativo = true',
    professor: 'SELECT 1 FROM vinculos_docencia      WHERE usuario_id = $1 AND turma_id = $2 AND ativo = true',
    pedagogia: 'SELECT 1 FROM vinculos_pedagogia     WHERE usuario_id = $1 AND turma_id = $2 AND ativo = true',
  };
  const { rows } = await pool.query(consultas[usuario.papel], [usuario.id, id]);
  return rows.length === 1;
}

module.exports = { turmasAcessiveis, podeAcessarTurma };
