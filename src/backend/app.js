// Roteamento + middlewares, SEM listen (permite testar via node --test).
// Etapa 4: autenticação por sessão de SERVIDOR (D-024) e rotas de turmas
// por vínculo no banco — o frontend estático continua como nesta arquitetura.
const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const env = require('./config/env');

const raizFrontend = path.join(__dirname, '..', 'frontend');

const app = express();

// Cabeçalhos de segurança (RNF04). A Content-Security-Policy fica
// temporariamente DESLIGADA porque as páginas ainda usam scripts inline
// do protótipo; CSP estrita é pendência da etapa 5 (documentada no plano).
app.use(helmet({ contentSecurityPolicy: false }));

// Frontend estático (arquitetura v2.0, cap. 2).
// O cabeçalho Service-Worker-Allowed vem ANTES do static de /pwa —
// sem ele o navegador limita o escopo do SW a /pwa/ (defeito corrigido em 2026-10-28).
app.use('/pwa', (req, res, next) => {
  if (req.path.endsWith('service-worker.js')) {
    res.setHeader('Service-Worker-Allowed', '/');
  }
  next();
}, express.static(path.join(raizFrontend, 'pwa')));
app.use('/css', express.static(path.join(raizFrontend, 'css')));
app.use('/js', express.static(path.join(raizFrontend, 'js')));
app.use(express.static(path.join(raizFrontend, 'pages')));

// Sessão por cookie HTTP-only assinado (D-010). Com banco, a sessão é
// gravada no PostgreSQL (sobrevive a reinícios, sessões centrais); sem
// banco o armazenamento padrão (memória do processo) mantém o esqueleto
// de pé — production SEMPRE exige DATABASE_URL (config/env.js barra).
const expressSession = require('express-session');
const configSessao = require('./config/session');
const opcoesSessao = {
  name: configSessao.nomeCookie,
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { ...configSessao.cookie, maxAge: configSessao.maxAgeMs },
};
if (env.databaseUrl) {
  const lojaPg = require('connect-pg-simple')(expressSession);
  const { obterPool } = require('./db/pool');
  opcoesSessao.store = new lojaPg({
    pool: obterPool(), // MESMO pool do app: um único abraço de conexões
    tableName: 'sessoes',
    createTableIfMissing: true, // cria 'sessoes' se não existir (idempotente)
  });
}
app.use(expressSession(opcoesSessao));

// API v1 — corpo JSON só dentro da API, com limite pequeno (defesa básica
// contra pedidos gigantes; única rota que lê corpo hoje é POST /auth/entrar).
app.use('/api/v1', express.json({ limit: '10kb' }));

app.use('/api/v1', require('./routes/health.routes'));
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/turmas', require('./routes/turmas.routes'));

// Rotas de API desconhecidas: JSON uniforme (convenção de api.md)
app.use('/api', (req, res) => {
  res.status(404).json({
    erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Recurso inexistente.' },
  });
});

// Páginas inexistentes: texto simples
app.use((req, res) => {
  res.status(404).send('Página não encontrada.');
});

// Último elo da cadeia: tratamento de erros (nunca vaza detalhe interno)
app.use(require('./middlewares/errorHandler'));

module.exports = app;
