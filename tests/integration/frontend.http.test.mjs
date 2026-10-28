// Teste de integração da etapa 3: páginas estáticas e recursos do frontend.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const caminhos = [
  { rota: '/', tipo: 'text/html', trecho: '<h1>CEPK Eventos</h1>' },
  { rota: '/login.html', tipo: 'text/html', trecho: 'F-2' },
  { rota: '/turma.html', tipo: 'text/html', trecho: 'Turma exemplo' },
  { rota: '/evento.html', tipo: 'text/html', trecho: 'detalhe-evento' },
  { rota: '/css/main.css', tipo: 'text/css', trecho: '.cartao-evento' },
  { rota: '/pwa/manifest.json', tipo: 'json', trecho: '"start_url"' },
];

test('todas as páginas e recursos estáticos respondem 200 (etapa 3)', async () => {
  const app = require('../../src/backend/app.js');
  const servidor = http.createServer(app);
  await new Promise((resolver) => servidor.listen(0, '127.0.0.1', resolver));
  try {
    const { port } = servidor.address();
    for (const { rota, tipo, trecho } of caminhos) {
      const resposta = await fetch(`http://127.0.0.1:${port}${rota}`);
      assert.equal(resposta.status, 200, `falhou em ${rota}`);
      const texto = await resposta.text();
      assert.ok(texto.includes(trecho), `${rota} não contém "${trecho}"`);
      if (tipo) {
        assert.ok(
          resposta.headers.get('content-type').includes(tipo),
          `${rota} deveria ter content-type ${tipo}`,
        );
      }
    }
  } finally {
    await new Promise((resolver) => servidor.close(resolver));
  }
});

test('manifest e service-worker sem conteúdo sensível (auditoria básica)', async () => {
  const app = require('../../src/backend/app.js');
  const servidor = http.createServer(app);
  await new Promise((resolver) => servidor.listen(0, '127.0.0.1', resolver));
  try {
    const { port } = servidor.address();
    const manifest = await (await fetch(`http://127.0.0.1:${port}/pwa/manifest.json`)).text();
    const sw = await (await fetch(`http://127.0.0.1:${port}/pwa/service-worker.js`)).text();
    for (const arquivo of [manifest, sw]) {
      assert.ok(!/senha|password|token|secret|@escola/i.test(arquivo), 'conteúdo suspeito no PWA');
    }
  } finally {
    await new Promise((resolver) => servidor.close(resolver));
  }
});
