// Middleware de autenticação (api.md §1: `authenticate`).
// Válida SESSÃO DE SERVIDOR em toda rota protegida — a interface não decide nada.
module.exports = function autenticar(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.status(401).json({
    erro: { codigo: 'SESSAO_INVALIDA', mensagem: 'Entre com sua conta para continuar.' },
  });
};
