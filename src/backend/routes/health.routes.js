// Rota de saúde (plano, etapa 1) — banco reportado a partir da etapa 2/D-024.
// Nunca devolve detalhe do erro do banco (arquitetura v2.0): só estado geral.
// O SITE segue de pé mesmo sem banco: "indisponivel" é informação, não 500.
const router = require('express').Router();

router.get('/health', async (req, res) => {
  const env = require('../config/env');
  let banco = 'nao-configurado';
  if (env.databaseUrl) {
    try {
      const { obterPool } = require('../db/pool');
      await obterPool().query('SELECT 1');
      banco = 'ok';
    } catch {
      banco = 'indisponivel';
    }
  }
  res.json({ ok: true, ambiente: env.ambiente, banco });
});

module.exports = router;
