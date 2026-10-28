// Teste do esqueleto (etapa 1): o app monta e a rota de saúde responde.
// Executor nativo do Node (node --test) — sem dependências extras.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

test('GET /api/v1/health responde ok (esqueleto da etapa 1)', async () => {
  const app = require('../../src/backend/app.js');
  const servidor = http.createServer(app);
  await new Promise((resolver) => servidor.listen(0, '127.0.0.1', resolver));
  try {
    const { port } = servidor.address();
    const resposta = await fetch(`http://127.0.0.1:${port}/api/v1/health`);
    assert.equal(resposta.status, 200);
    const corpo = await resposta.json();
    assert.equal(corpo.ok, true);
    assert.equal(typeof corpo.ambiente, 'string');
  } finally {
    await new Promise((resolver) => servidor.close(resolver));
  }
});

test('rota de API desconhecida responde 404 JSON uniforme (convenção de api.md)', async () => {
  const app = require('../../src/backend/app.js');
  const servidor = http.createServer(app);
  await new Promise((resolver) => servidor.listen(0, '127.0.0.1', resolver));
  try {
    const { port } = servidor.address();
    const resposta = await fetch(`http://127.0.0.1:${port}/api/v1/inexistente`);
    assert.equal(resposta.status, 404);
    const corpo = await resposta.json();
    assert.equal(corpo.erro.codigo, 'NAO_ENCONTRADO');
  } finally {
    await new Promise((resolver) => servidor.close(resolver));
  }
});
