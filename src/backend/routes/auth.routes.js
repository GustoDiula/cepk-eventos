// Autenticação LOCAL (contas de demonstração — D-024).
//
// Práticas aplicadas:
//   • credenciais validadas somente no backend; hash bcrypt, nunca texto;
//   • mensagem ÚNICA de erro (não revela se o e-mail existe — anti-enumeration);
//   • comparação também quando o usuário não existe (hash "isca") para reduzir
//     vazamento de tempo;
//   • limite de tentativas (middleware próprio);
//   • cookie httpOnly assinado (D-010/config/session.js);
//   • conferência de Origem nos POSTs (mitigação adicional de CSRF, junto com SameSite=Lax);
//   • sair destrói a sessão no servidor (api.md: POST /auth/logout).
//
// O login institucional por provedor (F-2) continua uma PENDÊNCIA separada:
// quando existir, o /callback Consultará o MESMO usuário/vínculo no banco.

const express = require('express');
const bcrypt = require('bcryptjs');
const autenticar = require('../middlewares/authenticate');
const limitador = require('../middlewares/limitarTentativasLogin');
const { obterPool } = require('../db/pool');

const router = express.Router();

// Hash fixo para comparação quando o usuário NÃO existe (tempo parecido com o caminho real).
const HASH_ISCA = bcrypt.hashSync('senha-inexistente-isca', 10);

const MENSAGEM_UNICA = 'E-mail ou senha incorretos.';
const ERRO_CREDENCIAIS = { codigo: 'CREDENCIAIS_INVALIDAS', mensagem: MENSAGEM_UNICA };

function origemConfereCom(req, res, next) {
  const origem = req.headers.origin;
  if (origem) {
    try {
      const host = new URL(origem).host;
      if (host !== req.headers.host) {
        return res.status(403).json({ erro: { codigo: 'ORIGEM_REJEITADA', mensagem: 'Origem não permitida.' } });
      }
    } catch {
      return res.status(403).json({ erro: { codigo: 'ORIGEM_REJEITADA', mensagem: 'Origem não permitida.' } });
    }
  }
  return next();
}

router.post('/entrar', origemConfereCom, limitador, async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
    const senha = typeof req.body.senha === 'string' ? req.body.senha : '';

    // Validação de entrada: sem ghosts, sem tamanhos absurdos
    const emailValido = /.+@.+\..+/.test(email) && email.length <= 254;
    const senhaValida = senha.length >= 1 && senha.length <= 1000;
    if (!emailValido || !senhaValida) {
      // Mensagem igual ao de erro de credenciais: não revela o motivo exato
      return res.status(401).json({ erro: { codigo: ERRO_CREDENCIAIS.codigo, mensagem: ERRO_CREDENCIAIS.mensagem } });
    }

    const pool = obterPool();
    const { rows } = await pool.query(
      'SELECT id, nome, email, papel, senha_hash FROM usuarios WHERE lower(email) = lower($1) AND ativo = true',
      [email]
    );
    const usuario = rows[0];

    // Mesma comparação nos dois caminhos (existe/não existe) — tempo parecido
    const ok = await bcrypt.compare(senha, usuario ? (usuario.senha_hash || HASH_ISCA) : HASH_ISCA);

    if (!usuario || !ok) {
      limitador.registrarFalha(req.chaveLimite);
      return res.status(401).json({ erro: { codigo: ERRO_CREDENCIAIS.codigo, mensagem: ERRO_CREDENCIAIS.mensagem } });
    }

    // Nunca há login sem hash: conta institucional pura (senha_hash NULO) não entra por aqui
    if (!usuario.senha_hash) {
      return res.status(401).json({ erro: { codigo: ERRO_CREDENCIAIS.codigo, mensagem: ERRO_CREDENCIAIS.mensagem } });
    }

    limitador.limpar(req.chaveLimite);
    req.session.regenerate((erroRegenera) => {
      if (erroRegenera) return next(erroRegenera);
      req.session.usuario = { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel };
      // Grava a sessão NO BANCO ANTES de responder: sem isto, o pedido seguinte
      // pode chegar antes do INSERT ter confirmado e ser visto como sem sessão
      // (corrida reproduzida nos testes — a resposta sai só quando está seguro).
      req.session.save((erroSalva) => {
        if (erroSalva) return next(erroSalva);
        return res.json({ usuario: { nome: usuario.nome, email: usuario.email, papel: usuario.papel } });
      });
    });
  } catch (erro) {
    return next(erro);
  }
});

router.post('/sair', origemConfereCom, (req, res, next) => {
  req.session.destroy(() => {
    res.clearCookie(require('../config/session').nomeCookie);
    return res.status(204).end();
  });
});

// Devolve o usuário logado (FONTE de exibição, nunca de decisão de permissão)
router.get('/me', autenticar, (req, res) => {
  return res.json({ usuario: req.session.usuario });
});

module.exports = router;
