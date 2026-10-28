// Roteamento + middlewares, SEM listen (permite testar via node --test).
// Escopo desta etapa: apenas estrutura inicial — login, permissões e inscrições
// NÃO entram aqui (etapas 4–7 do plano de desenvolvimento).
const path = require('node:path');
const express = require('express');

const raizFrontend = path.join(__dirname, '..', 'frontend');

const app = express();

// Frontend estático (arquitetura v2.0, cap. 2).
// O cabeçalho Service-Worker-Allowed vem ANTES do static de /pwa —
// sem ele o navegador limita o escopo do SW a /pwa/ (defeito verificado em 2026-10-28).
app.use('/pwa', (req, res, next) => {
  if (req.path.endsWith('service-worker.js')) {
    res.setHeader('Service-Worker-Allowed', '/');
  }
  next();
}, express.static(path.join(raizFrontend, 'pwa')));
app.use('/css', express.static(path.join(raizFrontend, 'css')));
app.use('/js', express.static(path.join(raizFrontend, 'js')));
app.use(express.static(path.join(raizFrontend, 'pages')));

// API v1
app.use('/api/v1', require('./routes/health.routes'));

// Rotas de API desconhecidas: JSON uniforme (convenção de api.md)
app.use('/api', (req, res) => {
  res.status(404).json({
    erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Recurso inexistente.' },
  });
});

// Páginas inexistente sob / : texto simples (placeholder da etapa 3)
app.use((req, res) => {
  res.status(404).send('Página não encontrada.');
});

// Último elo da cadeia: tratamento de erros (nunca vaza detalhe interno)
app.use(require('./middlewares/errorHandler'));

module.exports = app;
