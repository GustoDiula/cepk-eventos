// Esqueleto — Etapa 1 do plano de desenvolvimento.
// Apenas liga o servidor; decisões de rotas ficam no app.js.
const app = require('./app');
const env = require('./config/env');

app.listen(env.porta, () => {
  console.log(`CEPK Eventos: servidor ativo em http://localhost:${env.porta} (${env.ambiente})`);
});
