// Rota de saúde — primeiro ponto de verificação (plano, etapa 1).
// O banco será reportado aqui a partir da etapa 2 (quando db/pool.js existir).
const router = require('express').Router();

router.get('/health', (req, res) => {
  const env = require('../config/env');
  res.json({
    ok: true,
    ambiente: env.ambiente,
    banco: 'indisponivel ate a etapa 2 (esperado nesta fase)',
  });
});

module.exports = router;
