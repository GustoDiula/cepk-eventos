// Turmas conforme o PERFIL autenticado (pedido 28/10/2026, itens 2.3 e 5).
// O servidor decide o que responder; a interface só renderiza.
// Quem tenta ver turma sem vínculo recebe 404 (CA-03/D-009: não revelar existência).
const express = require('express');
const autenticar = require('../middlewares/authenticate');
const { turmasAcessiveis, podeAcessarTurma } = require('../services/turmas-permissao');
const { obterPool } = require('../db/pool');

const router = express.Router();

// Lista de turmas do usuário (aluno: própria; professor: docência;
// pedagogia: conjunto sob responsabilidade; direcao: todas)
router.get('/', autenticar, async (req, res, next) => {
  try {
    const turmas = await turmasAcessiveis(req.session.usuario);
    return res.json({ turmas });
  } catch (erro) {
    return next(erro);
  }
});

// Detalhe da turma
router.get('/:id', autenticar, async (req, res, next) => {
  try {
    const pode = await podeAcessarTurma(req.session.usuario, req.params.id);
    if (!pode) {
      return res.status(404).json({ erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Recurso inexistente.' } });
    }
    const { rows } = await obterPool().query(
      'SELECT id, nome_curto, tipo, ano_letivo FROM turmas WHERE id = $1 AND ativa = true',
      [Number(req.params.id)]
    );
    if (rows.length !== 1) {
      return res.status(404).json({ erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Recurso inexistente.' } });
    }
    return res.json({ turma: rows[0] });
  } catch (erro) {
    return next(erro);
  }
});

// Eventos/atividades da turma (consulta; publicação/edição: etapa 6)
router.get('/:id/eventos', autenticar, async (req, res, next) => {
  try {
    const pode = await podeAcessarTurma(req.session.usuario, req.params.id);
    if (!pode) {
      return res.status(404).json({ erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Recurso inexistente.' } });
    }
    // Datas em ISO 8601 COM O FUSO DA ESCOLA (api.md §1): pg devolve Date em
    // UTC, e o res.json serializaria com Z — fazendo o frontend exibir horário
    // errado. A escola (America/Sao_Paulo) está a UTC-03 e o Brasil NÃO usa
    // horário de verão desde 2019 (dec. 10.065/2019); se voltar, revisar aqui.
    const { rows } = await obterPool().query(
      `SELECT id, titulo, descricao, local,
              to_char(inicio AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD"T"HH24:MI:SS') || '-03:00' AS inicio,
              to_char(fim AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD"T"HH24:MI:SS') || '-03:00' AS fim,
              tipo, escopo, exige_inscricao, vagas_total, vagas_restantes,
              CASE WHEN prazo_inscricao IS NULL THEN NULL
                   ELSE to_char(prazo_inscricao AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD"T"HH24:MI:SS') || '-03:00'
              END AS prazo_inscricao,
              status
         FROM eventos
        WHERE turma_id = $1 AND status = 'ativo'
        ORDER BY inicio`,
      [Number(req.params.id)]
    );
    return res.json({ eventos: rows });
  } catch (erro) {
    return next(erro);
  }
});

module.exports = router;
