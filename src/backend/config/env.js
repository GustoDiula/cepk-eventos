// Configuração por variáveis de ambiente (RNF05): segredos nunca no código.
// Em production, DATABASE_URL e SESSION_SECRET são obrigatórios.
// Em development/test, a ausência não impede o esqueleto de subir.

const ambiente = process.env.NODE_ENV || 'development';
const porta = Number(process.env.PORT || 3000);

const faltantes = [];
if (ambiente === 'production') {
  if (!process.env.DATABASE_URL) faltantes.push('DATABASE_URL');
  if (!process.env.SESSION_SECRET) faltantes.push('SESSION_SECRET');
}
if (faltantes.length > 0) {
  console.error(`[env] variáveis ausentes para "${ambiente}": ${faltantes.join(', ')}`);
  process.exit(1);
}

module.exports = {
  ambiente,
  porta,
  baseUrl: process.env.BASE_URL || `http://localhost:${porta}`,
  databaseUrl: process.env.DATABASE_URL || null,
};
