// Último elo da cadeia de middlewares (arquitetura v2.0, cap. 3).
// Nunca expõe detalhes internos (stack, SQL) ao cliente (RNF05/RNF06).

module.exports = (erro, req, res, next) => {
  console.error('[erro]', erro.message);
  res.status(500).json({
    erro: { codigo: 'ERRO_INTERNO', mensagem: 'Erro interno. Tente novamente.' },
  });
};
