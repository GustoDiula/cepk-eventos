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
    pool = new Pool({ connectionString: url, max: 10 });
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
