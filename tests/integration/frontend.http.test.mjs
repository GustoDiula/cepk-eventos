// Teste de integração da etapa 3: páginas estáticas e recursos do frontend.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const caminhos = [
  { rota: '/', tipo: 'text/html', trecho: '<title>CEPK Eventos</title>' },
  { rota: '/login.html', tipo: 'text/html', trecho: 'demonstração' },
  { rota: '/turma.html', tipo: 'text/html', trecho: 'Turma 1º Ano A' },
  { rota: '/evento.html', tipo: 'text/html', trecho: 'detalhe-evento' },
  { rota: '/inscricoes.html', tipo: 'text/html', trecho: 'Minhas inscrições' },
  { rota: '/sobre.html', tipo: 'text/html', trecho: 'Sobre o CEPK Eventos' },
  { rota: '/calendario.html', tipo: 'text/html', trecho: 'Calendário da turma' },
  { rota: '/css/main.css', tipo: 'text/css', trecho: '.cartao-evento' },
  { rota: '/js/calendario.js', tipo: 'javascript', trecho: 'data-calendario' },
  { rota: '/js/sessao.js', tipo: 'javascript', trecho: 'cepkSessaoDemo' },
  { rota: '/pwa/manifest.webmanifest', tipo: 'json', trecho: '"start_url"' },
  { rota: '/pwa/icons/icon-192.png', tipo: 'image/png', trecho: null },
  { rota: '/pwa/icons/icon-512.png', tipo: 'image/png', trecho: null },
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
      if (trecho) {
        const texto = await resposta.text();
        assert.ok(texto.includes(trecho), `${rota} não contém "${trecho}"`);
      }
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
    const manifest = await (await fetch(`http://127.0.0.1:${port}/pwa/manifest.webmanifest`)).text();
    const sw = await (await fetch(`http://127.0.0.1:${port}/pwa/service-worker.js`)).text();
    for (const arquivo of [manifest, sw]) {
      assert.ok(!/senha|password|token|secret|@escola/i.test(arquivo), 'conteúdo suspeito no PWA');
    }
  } finally {
    await new Promise((resolver) => servidor.close(resolver));
  }
});

test('sessão de demonstração: nada é enviado pela rede e senha nunca é armazenada (D-018)', async () => {
  const app = require('../../src/backend/app.js');
  const servidor = http.createServer(app);
  await new Promise((resolver) => servidor.listen(0, '127.0.0.1', resolver));
  try {
    const { port } = servidor.address();
    const sessao = await (await fetch(`http://127.0.0.1:${port}/js/sessao.js`)).text();
    // código (fora de comentários) não pode chamar fetch
    const semComentarios = sessao.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
    assert.doesNotMatch(semComentarios, /fetch\s*\(/, 'sessao.js não deve fazer chamadas de rede');
    const gravacao = sessao.match(/JSON\.stringify\(\{[^}]*\}\)/);
    assert.ok(gravacao, 'gravação da sessão não encontrada');
    assert.ok(/demo:\s*true/.test(gravacao[0]), 'sessão deve estar marcada como demo');
    assert.ok(!/senha/i.test(gravacao[0]), 'senha NUNCA pode entrar no item salvo');
  } finally {
    await new Promise((resolver) => servidor.close(resolver));
  }
});
