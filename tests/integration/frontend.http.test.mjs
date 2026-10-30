// Teste de integração do frontend: páginas estáticas, recursos e auditorias
// das decisões vigentes (sessão real D-24 substitui a de navegador D-18).
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const caminhos = [
  { rota: '/', tipo: 'text/html', trecho: '<title>CEPK Eventos</title>' },
  { rota: '/login.html', tipo: 'text/html', trecho: 'demonstração' },
  { rota: '/turma.html', tipo: 'text/html', trecho: 'Minhas turmas' },
  { rota: '/evento.html', tipo: 'text/html', trecho: 'detalhe-evento' },
  { rota: '/inscricoes.html', tipo: 'text/html', trecho: 'Minhas inscrições' },
  { rota: '/sobre.html', tipo: 'text/html', trecho: 'Sobre o CEPK Eventos' },
  { rota: '/css/main.css', tipo: 'text/css', trecho: '.cartao-evento' },
  { rota: '/js/calendario.js', tipo: 'javascript', trecho: 'data-calendario' },
  { rota: '/js/sessao.js', tipo: 'javascript', trecho: 'CEPKSessao' },
  { rota: '/pwa/manifest.webmanifest', tipo: 'json', trecho: '"start_url"' },
  { rota: '/pwa/icons/icon-192.png', tipo: 'image/png', trecho: null },
  { rota: '/pwa/icons/icon-512.png', tipo: 'image/png', trecho: null },
];

test('todas as páginas e recursos estáticos respondem 200', async () => {
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

test('sessão REAL: nada de identidade/senha guardada no navegador (substitui o login local D-018)', async () => {
  const app = require('../../src/backend/app.js');
  const servidor = http.createServer(app);
  await new Promise((resolver) => servidor.listen(0, '127.0.0.1', resolver));
  try {
    const { port } = servidor.address();
    const base = `http://127.0.0.1:${port}`;

    // sessao.js: consulta o SERVIDOR; não usa armazenamento do navegador
    const original = await (await fetch(`${base}/js/sessao.js`)).text();
    const codigo = original.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
    assert.ok(codigo.includes('fetch'), 'sessao.js deve conversar com o servidor');
    assert.match(codigo, /\/api\/v1\/auth\/me/, 'fonte da sessão é o servidor (/auth/me)');
    assert.match(codigo, /\/api\/v1\/auth\/sair/, 'sair pede ao servidor para destruir a sessão');
    assert.doesNotMatch(codigo, /localStorage|sessionStorage|document\s*\.\s*cookie/,
      'nada de sessão pode ser guardado ou lido no navegador');

    // login.html: lista e-mails de teste, NUNCA a senha
    const paginaLogin = await (await fetch(`${base}/login.html`)).text();
    assert.match(paginaLogin, /aluno1@cepk-eventos\.test/, 'conta de teste listada com e-mail');
    assert.doesNotMatch(paginaLogin, /SENHA_DEMO/, 'nome da variável de senha não circula na página');
    assert.ok(!/\b1234\b/.test(paginaLogin), 'a página de login NUNCA contém uma senha');
    assert.doesNotMatch(paginaLogin, /localStorage|sessionStorage/, 'login não guarda nada no navegador');

    // turma.html: a lista de turmas não vem do navegador
    const paginaTurma = await (await fetch(`${base}/turma.html`)).text();
    assert.doesNotMatch(paginaTurma, /localStorage|sessionStorage/, 'turma não guarda dados no navegador');
    assert.match(paginaTurma, /\/api\/v1\/turmas/, 'turma busca as turmas do servidor');
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
    assert.ok(js.includes('limites.min') && js.includes('limites.max'), 'limites por intervalo ausentes');
    // estado passado: calculado na abertura, não congelado
    assert.ok(js.includes('Já passou'), 'mensagem "Já passou" ausente');
    assert.ok(js.includes('data-feriado'), 'marcação de cartões por data ausente');
    // modo dinâmico (eventos do servidor) exportado
    assert.ok(js.includes('CEPKCalendario'), 'acesso dinâmico ausente');

    const home = await (await fetch(`${base}/`)).text();
    const cartoes = home.match(/data-feriado="2026-\d{2}-\d{2}"/g) || [];
    assert.ok(cartoes.length >= 14, `esperados ≥14 cartões de feriado com data, há ${cartoes.length}`);

    const css = await (await fetch(`${base}/css/main.css`)).text();
    for (const classe of ['.nav-mes', '.seta-mes', '.hoje-mes', '.ev-passado', '.selo--passado']) {
      assert.ok(css.includes(classe), `estilo ${classe} ausente no CSS`);
    }

    const sw = await (await fetch(`${base}/pwa/service-worker.js`)).text();
    assert.ok(sw.includes('cepk-shell-v6'), 'service worker deve estar na versão cepk-shell-v6');
  } finally {
    await new Promise((resolver) => servidor.close(resolver));
  }
});

test('rotas protegidas: sem sessão → 401 uniforme (mesmo sem banco configurado)', async () => {
  const app = require('../../src/backend/app.js');
  const servidor = http.createServer(app);
  await new Promise((resolver) => servidor.listen(0, '127.0.0.1', resolver));
  try {
    const { port } = servidor.address();
    const base = `http://127.0.0.1:${port}`;

    const turmas = await fetch(`${base}/api/v1/turmas`);
    assert.equal(turmas.status, 401);
    assert.equal((await turmas.json()).erro.codigo, 'SESSAO_INVALIDA');

    // login com e-mail inválido → rejeitado ANTES de qualquer consulta ao banco
    const entrar = await fetch(`${base}/api/v1/auth/entrar`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'sem-arroba', senha: 'x' }),
    });
    assert.equal(entrar.status, 401);
    assert.equal((await entrar.json()).erro.codigo, 'CREDENCIAIS_INVALIDAS');
  } finally {
    await new Promise((resolver) => servidor.close(resolver));
  }
});

test('interface sem siglas técnicas e navegação reorganizada (pedido 28/10/2026)', async () => {
  const app = require('../../src/backend/app.js');
  const servidor = http.createServer(app);
  await new Promise((resolver) => servidor.listen(0, '127.0.0.1', resolver));
  try {
    const { port } = servidor.address();
    const base = `http://127.0.0.1:${port}`;
    for (const rota of ['/', '/login.html', '/turma.html', '/evento.html', '/inscricoes.html', '/sobre.html']) {
      const pagina = await (await fetch(`${base}${rota}`)).text();
      // verifica apenas o TEXTO VISÍVEL: remove scripts, estilos, comentários e tags
      const visivel = pagina
        .replace(/<script[\s\S]*?<\/script>/g, '')
        .replace(/<style[\s\S]*?<\/style>/g, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<[^>]+>/g, '');
      assert.doesNotMatch(visivel, /\bRF\d\d|RN\d\d|D-\d\d\d|F-\d\b|RNF\d|etapa\s+\d/i,
        `sigla técnica visível em ${rota}`);
      // a página de calendário foi fundida na turma (D-022): nenhum link pode sobrar
      assert.ok(!pagina.includes('calendario.html'), `link para calendario.html restou em ${rota}`);
      // navegação nova: Turmas direto para a página da turma
      assert.ok(pagina.includes('href="/turma.html"'), `link Turmas para /turma.html ausente em ${rota}`);
    }
    // página inicial: sem a seção de turmas repetida
    const home = await (await fetch(`${base}/`)).text();
    assert.ok(!home.includes('grade-turmas'), 'página inicial deve ficar sem a seção de turmas');
    // calendario.html foi excluída: não pode mais responder
    const extinta = await fetch(`${base}/calendario.html`);
    assert.equal(extinta.status, 404, 'calendario.html deveria estar excluída (404)');
  } finally {
    await new Promise((resolver) => servidor.close(resolver));
  }
});
