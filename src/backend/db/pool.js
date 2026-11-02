// Conexão única com o PostgreSQL (URL vem do .env — NUNCA escrita no código).
// Uso em development/test: DATABASE_URL precisa existir para as rotas de dados.
const { Pool } = require('pg');

let pool = null;

function obterPool() {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      const erro = new Error('DATABASE_URL não configurado (.env).');
      erro.codigo = 'BANCO_NAO_CONFIGURADO';
      throw erro;
    }
    // Hospedagens em nuvem (D-027: Neon) exigem TLS — sinalizado por
    // sslmode= na própria DATABASE_URL; o PostgreSQL local não tem sslmode
    // e continua como sempre. rejectUnauthorized: false = não avalida o
    // certificado do servidor do banco (padrão com sslmode=require);
    // pinar a CA do Neon (verify-full) fica como endurecimento futuro.
    const tlsExigido = /[?&]sslmode=/.test(url);
    pool = new Pool({
      connectionString: url,
      max: 10,
      ...(tlsExigido ? { ssl: { rejectUnauthorized: false } } : {}),
    });
    // Erros de conexão não derrubam o processo: não há listener "error" aqui porque
    // o Pool já reentrega o erro ao query chamador.
  }
  return pool;
}

module.exports = { obterPool, encerrar };

// Fecha as conexões do pool (usado ao fim dos testes para o processo terminar
// sem pendurar aberturas vivas). Não faz nada quando o pool nunca abriu.
async function encerrar() {
  if (pool) {
    const fechado = pool;
    pool = null;
    await fechado.end();
  }
}
