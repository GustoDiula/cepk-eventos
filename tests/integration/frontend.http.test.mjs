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

test('calendário: navegação de meses e estado "passado" presentes (D-021)', async () => {
  const app = require('../../src/backend/app.js');
  const servidor = http.createServer(app);
  await new Promise((resolver) => servidor.listen(0, '127.0.0.1', resolver));
  try {
    const { port } = servidor.address();
    const base = `http://127.0.0.1:${port}`;

    const js = await (await fetch(`${base}/js/calendario.js`)).text();
    // navegação: barra ◀ ▶ + botão "hoje"
    assert.ok(js.includes("'nav-mes'"), 'barra de navegação ausente');
    assert.ok(js.includes("'seta-mes'"), 'setas ◀ ▶ ausentes');
    assert.ok(js.includes("'hoje-mes'"), 'botão "hoje" ausente');
    assert.ok(js.includes('limites.min') && js.includes('limites.max'), 'limites por intervalo do conjunto ausentes');
    // estado passado: calculado na abertura, não congelado
    assert.ok(js.includes("Já passou"), 'mensagem "Já passou" ausente');
    assert.ok(js.includes("data-feriado"), 'marcação de cartões por data ausente');

    const home = await (await fetch(`${base}/`)).text();
    const cartoes = home.match(/data-feriado="2026-\d{2}-\d{2}"/g) || [];
    assert.ok(cartoes.length >= 14, `esperados ≥14 cartões de feriado com data, há ${cartoes.length}`);

    const css = await (await fetch(`${base}/css/main.css`)).text();
    for (const classe of ['.nav-mes', '.seta-mes', '.hoje-mes', '.ev-passado', '.selo--passado']) {
      assert.ok(css.includes(classe), `estilo ${classe} ausente no CSS`);
    }

    const sw = await (await fetch(`${base}/pwa/service-worker.js`)).text();
    assert.ok(sw.includes('cepk-shell-v4'), 'service worker deve estar na versão cepk-shell-v4');
  } finally {
    await new Promise((resolver) => servidor.close(resolver));
  }
});
