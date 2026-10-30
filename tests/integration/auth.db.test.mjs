// Testes de INTEGRAÇÃO com banco (etapa 4 — pedido 28/10/2026, §6).
//
// Cobertura (grupos do pedido do autor):
//   1) seed idempotente e senhas só como hash bcrypt (item 7)
//   2) login das 5 contas com a senha inicial definida no .env (item 6)
//   3) mensagem ÚNICA de erro (não revela se o e-mail existe)
//   4) limite de tentativas: 6ª falha seguida → 429
//   5) páginas/operações protegidas contra não autenticado (item 8: /me → 401)
//   6) turmas por perfil: pedagogia 10 · professor 3 · alunos 1/1 · direção 10
//      (pedagoga vê EXATAMENTE as 10 combinadas — itens 1, 2, 3)
//   7) aluno não vê turma de outro (404, sem revelar existência — item 4)
//   8) impossível auto-escalar papel/vínculos (item 5)
//   9) logout destrói a sessão no SERVIDOR
//
// Requisito para rodar de verdade: .env com DATABASE_URL e SENHA_DEMO e o
// PostgreSQL ligado (npm run pg:start). Sem isso os testes são PULADOS
// com aviso — nunca marcados como aprovados (regra 11 do AGENTS.md).

import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequire } from 'node:module';
import { before, after } from 'node:test';

const require = createRequire(import.meta.url);

const TEM_BANCO = Boolean(process.env.DATABASE_URL && process.env.SENHA_DEMO);
const pular = TEM_BANCO ? false
  : 'precisa de .env com DATABASE_URL + SENHA_DEMO e PostgreSQL ligado (npm run pg:start)';

const app = require('../../src/backend/app.js');

let servidor = null;
let PORTA = 0;

before(async () => {
  servidor = http.createServer(app);
  await new Promise((resolver) => servidor.listen(0, '127.0.0.1', resolver));
  PORTA = servidor.address().port;
});

after(async () => {
  // fecha servidor e conexões de banco: o processo de teste termina limpo
  if (servidor) await new Promise((resolver) => servidor.close(resolver));
  if (TEM_BANCO) {
    const { encerrar } = require('../../src/backend/db/pool.js');
    await encerrar();
  }
});

// "Navegador" mínimo: guarda o cookie de sessão entre pedidos
function clienteSessao() {
  const base = `http://127.0.0.1:${PORTA}`;
  let cookie = '';
  return {
    async pedido(rota, opcoes = {}) {
      const resposta = await fetch(base + rota, {
        ...opcoes,
        headers: { ...(opcoes.headers || {}), ...(cookie ? { cookie } : {}) },
      });
      const setados = resposta.headers.getSetCookie ? resposta.headers.getSetCookie() : [];
      if (setados.length) cookie = setados[0].split(';')[0];
      return resposta;
    },
    async entrar(email, senha) {
      return this.pedido('/api/v1/auth/entrar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
    },
  };
}

// Resumo das turmas esperado por perfil (combinado com o autor em 28/10/2026)
const AS_10 = ['1º A', '1º B', '1º C', '1º ADM', '1º DSB', '2º ADM', '2º DSB', '3º ADM', '3º DSB', '3º DSC'];

test('seed: rodado 2× não duplica; senhas existem SÓ como hash bcrypt', { skip: pular }, async () => {
  const seed = require('../../src/backend/db/seed-demo.js');
  await seed.executar(); // 1ª execução
  await seed.executar(); // 2ª execução: NÃO pode criar duplicatas

  const { obterPool } = require('../../src/backend/db/pool.js');
  const pool = obterPool();

  const contagens = await pool.query(
    `SELECT (SELECT count(*)::int FROM usuarios) AS usuarios,
            (SELECT count(*)::int FROM turmas)  AS turmas`
  );
  assert.equal(contagens.rows[0].usuarios, 5, '5 contas de demonstração');
  assert.equal(contagens.rows[0].turmas, 10, '10 turmas do ambiente demo');

  const senhas = await pool.query('SELECT email, senha_hash FROM usuarios ORDER BY email');
  for (const linha of senhas.rows) {
    assert.match(String(linha.senha_hash), /^\$2[aby]\$/, `${linha.email}: hash bcrypt esperado`);
    assert.ok(
      !String(linha.senha_hash).includes(String(process.env.SENHA_DEMO)),
      'hash NÃO pode conter a senha em texto'
    );
  }

  // nenhuma coluna de senha em texto: só senha_hash
  const colunas = await pool.query(
    `SELECT column_name FROM information_schema.columns
      WHERE table_name = 'usuarios' AND column_name ILIKE '%senha%'`
  );
  assert.deepEqual(
    colunas.rows.map((c) => c.column_name).sort(),
    ['senha_hash'],
    'só a coluna de HASH pode existir'
  );

  // vínculos conforme o combinado: pedagoga 10, professora 3, alunos 1/1
  // vínculos conforme o combinado: pedagoga 10, professora 3, alunos 1/1
  const pedagoga = await pool.query(
    `SELECT count(*)::int AS n FROM vinculos_pedagogia v
      JOIN usuarios u ON u.id = v.usuario_id
     WHERE u.email = 'pedagoga1@cepk-eventos.test'`
  );
  assert.equal(pedagoga.rows[0].n, 10, 'pedagoga com 10 vínculos');

  const professora = await pool.query(
    `SELECT count(*)::int AS n FROM vinculos_docencia v
      JOIN usuarios u ON u.id = v.usuario_id
     WHERE u.email = 'prof.geografia@cepk-eventos.test'`
  );
  assert.equal(professora.rows[0].n, 3, 'professora leciona em 3 turmas');

  const alunos = await pool.query(
    `SELECT u.email, count(*)::int AS n
       FROM usuarios u
       LEFT JOIN vinculos_aluno_turma v ON v.usuario_id = u.id
      WHERE u.papel = 'aluno'
      GROUP BY u.email ORDER BY u.email`
  );
  assert.deepEqual(alunos.rows.map((r) => r.n), [1, 1], 'cada aluno em 1 turma');

  // eventos: contagem EXATA determinada pelo seed (8 no 1º A, 3 no 1º B,
  // 2 no 1º C e 2 em cada uma das 7 técnicas) — DUPLICATAS desta tabela
  // não podem escapar: 'eventos' não tem chave única.
  const eventos = await pool.query(
    `SELECT count(*)::int AS n
       FROM eventos
      WHERE titulo LIKE '%(demonstração)'`
  );
  assert.equal(eventos.rows[0].n, 27, '27 atividades de demonstração, sem repetição');
});

test('login real: as 5 contas entram com a senha inicial e saem pelo servidor', { skip: pular }, async () => {
  const senhaInicial = process.env.SENHA_DEMO;
  const contas = [
    ['aluno1@cepk-eventos.test', 'aluno'],
    ['aluno2@cepk-eventos.test', 'aluno'],
    ['prof.geografia@cepk-eventos.test', 'professor'],
    ['pedagoga1@cepk-eventos.test', 'pedagogia'],
    ['diretora@cepk-eventos.test', 'direcao'],
  ];
  for (const [email, papel] of contas) {
    const cliente = clienteSessao();

    const entrada = await cliente.entrar(email, senhaInicial);
    assert.equal(entrada.status, 200, `entrada com ${email}`);
    const corpo = await entrada.json();
    assert.equal(corpo.usuario.papel, papel);
    assert.equal(corpo.usuario.email, email);
    assert.ok(!('senha' in corpo.usuario), 'resposta NUNCA inclui senha');
    assert.ok(!('senha_hash' in corpo.usuario), 'resposta NUNCA inclui hash');

    const pedido = await cliente.pedido('/api/v1/auth/me');
    assert.equal(pedido.status, 200);
    assert.equal((await pedido.json()).usuario.email, email, 'sessão do servidor confirmada');

    const saida = await cliente.pedido('/api/v1/auth/sair', { method: 'POST' });
    assert.equal(saida.status, 204);

    const depois = await cliente.pedido('/api/v1/auth/me');
    assert.equal(depois.status, 401, 'sessão destruída no SERVIDOR');
    const turmasDepois = await cliente.pedido('/api/v1/turmas');
    assert.equal(turmasDepois.status, 401, 'rotas protegidas continuam fechadas');
  }
});

test('erro de login: mensagem ÚNICA para e-mail inexistente e senha errada', { skip: pular }, async () => {
  const cliente = clienteSessao();
  const fantasma = await cliente.entrar('fantasma@cepk-eventos.test', 'qualquer');
  const errada = await cliente.entrar('aluno1@cepk-eventos.test', 'certamente-errada');
  assert.equal(fantasma.status, 401);
  assert.equal(errada.status, 401);
  const corpo1 = await fantasma.json();
  const corpo2 = await errada.json();
  assert.deepEqual(corpo1, corpo2, 'respostas idênticas (não revela qual campo falhou)');
  assert.equal(corpo1.erro.codigo, 'CREDENCIAIS_INVALIDAS');
});

test('limite de tentativas: 6ª falha seguida → 429 (mesmo com senha correta)', { skip: pular }, async () => {
  const cliente = clienteSessao();
  const emailTeste = 'rate@cepk-eventos.test';
  for (let i = 0; i < 5; i += 1) {
    const falha = await cliente.entrar(emailTeste, `errada-${i}`);
    assert.equal(falha.status, 401);
  }
  const bloqueada = await cliente.entrar(emailTeste, String(process.env.SENHA_DEMO));
  assert.equal(bloqueada.status, 429);
  const corpo = await bloqueada.json();
  assert.equal(corpo.erro.codigo, 'MUITAS_TENTATIVAS');
});

test('sem sessão: /me, /turmas e eventos → 401 (nada de página aberta por acidente)', { skip: pular }, async () => {
  const cliente = clienteSessao();
  const me = await cliente.pedido('/api/v1/auth/me');
  assert.equal(me.status, 401);
  assert.equal((await me.json()).erro.codigo, 'SESSAO_INVALIDA');

  const turmas = await cliente.pedido('/api/v1/turmas');
  assert.equal(turmas.status, 401);

  const eventos = await cliente.pedido('/api/v1/turmas/1/eventos');
  assert.equal(eventos.status, 401);
});

test('turmas por perfil: pedagogia 10 · professor 3 · alunos 1 e 1 · direção 10', { skip: pular }, async () => {
  async function entrarComo(email) {
    const cliente = clienteSessao();
    const r = await cliente.entrar(email, String(process.env.SENHA_DEMO));
    assert.equal(r.status, 200, `fallback de senha inicial com ${email}`);
    const pedido = await cliente.pedido('/api/v1/turmas');
    assert.equal(pedido.status, 200);
    return (await pedido.json()).turmas;
  }

  const pedagoga = await entrarComo('pedagoga1@cepk-eventos.test');
  assert.equal(pedagoga.length, 10, 'pedagoga vê exatamente 10 turmas');
  assert.deepEqual(
    pedagoga.map((t) => t.nome_curto).sort(),
    [...AS_10].sort(),
    'e são as 10 combinadas (nada a mais, nada a menos)'
  );

  const professora = await entrarComo('prof.geografia@cepk-eventos.test');
  assert.equal(professora.length, 3, 'professora vê apenas as vinculadas');
  assert.deepEqual(
    professora.map((t) => t.nome_curto).sort(),
    ['1º A', '1º B', '1º C'].sort()
  );

  const aluno1 = await entrarComo('aluno1@cepk-eventos.test');
  assert.equal(aluno1.length, 1, 'aluno 1 vê só a própria');
  assert.equal(aluno1[0].nome_curto, '1º A');

  const aluno2 = await entrarComo('aluno2@cepk-eventos.test');
  assert.equal(aluno2.length, 1, 'aluno 2 vê só a própria');
  assert.equal(aluno2[0].nome_curto, '1º B');

  const diretora = await entrarComo('diretora@cepk-eventos.test');
  assert.equal(diretora.length, 10, 'direção decorre do papel, vê todas');
  assert.deepEqual(
    diretora.map((t) => t.nome_curto).sort(),
    [...AS_10].sort()
  );
});

test('aluno NÃO vê turma de outra: própria 200 · de outro 404 (sem revelar existência)', { skip: pular }, async () => {
  const cliente = clienteSessao();
  const entrada = await cliente.entrar('aluno1@cepk-eventos.test', String(process.env.SENHA_DEMO));
  assert.equal(entrada.status, 200);

  const lista = await (await cliente.pedido('/api/v1/turmas')).json();
  const propria = lista.turmas[0];

  const eventosProprios = await cliente.pedido(`/api/v1/turmas/${propria.id}/eventos`);
  assert.equal(eventosProprios.status, 200, 'própria turma abre');
  const eventos = (await eventosProprios.json()).eventos;
  assert.ok(eventos.length >= 5, 'atividades de demonstração presentes');
  assert.ok(
    eventos.some((ev) => ev.tipo === 'prova'),
    'provas de demonstração presentes'
  );

  // id de uma turma que NÃO é do aluno (1º B pertence ao aluno 2)
  const clienteOutro = clienteSessao();
  await clienteOutro.entrar('diretora@cepk-eventos.test', String(process.env.SENHA_DEMO));
  const todas = await (await clienteOutro.pedido('/api/v1/turmas')).json();
  const outra = todas.turmas.find((t) => t.nome_curto === '1º B');
  assert.ok(outra && outra.id !== propria.id);

  const negada = await cliente.pedido(`/api/v1/turmas/${outra.id}`);
  assert.equal(negada.status, 404, '404, não 403: não revelar existência');
  assert.equal((await negada.json()).erro.codigo, 'NAO_ENCONTRADO');

  const eventosNegados = await cliente.pedido(`/api/v1/turmas/${outra.id}/eventos`);
  assert.equal(eventosNegados.status, 404);
});

test('não é possível auto-escalar papel nem criar vínculos próprios', { skip: pular }, async () => {
  const cliente = clienteSessao();
  const entrada = await cliente.entrar('aluno1@cepk-eventos.test', String(process.env.SENHA_DEMO));
  assert.equal(entrada.status, 200);

  // tente se tornar direção via PATCH do próprio perfil → rota não existe (404)
  const patchPerfil = await cliente.pedido('/api/v1/auth/me', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ papel: 'direcao' }),
  });
  assert.equal(patchPerfil.status, 404, 'não há endpoint que troque o papel');

  // tente criar vínculos escrevendo no banco via API → rota não existe (404)
  const postVinculos = await cliente.pedido('/api/v1/vinculos', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ turma_id: 2 }),
  });
  assert.equal(postVinculos.status, 404, 'não há endpoint que crie vínculo');

  // tente publicar evento (permissão vem depois; hoje é somente leitura) → 404
  const postEvento = await cliente.pedido('/api/v1/turmas/1/eventos', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ titulo: 'Injeção por aluno' }),
  });
  assert.equal(postEvento.status, 404, 'não há endpoint de publicação nesta etapa');

  // a sessão continua sendo a do aluno (nenhuma tentativa alterou algo)
  const perfil = await (await cliente.pedido('/api/v1/auth/me')).json();
  assert.equal(perfil.usuario.papel, 'aluno', 'papel imutável pelo cliente');

  // campos injetados no ENTRAR também são ignorados pela rota
  const cliente2 = clienteSessao();
  const injecao = await cliente2.pedido('/api/v1/auth/entrar', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: 'aluno1@cepk-eventos.test',
      senha: String(process.env.SENHA_DEMO),
      papel: 'direcao', // tentativa de se elevar no próprio login
    }),
  });
  assert.equal(injecao.status, 200, 'login normal com campos extras ignorados');
  const perfilInjetado = await cliente2.pedido('/api/v1/auth/me');
  assert.equal((await perfilInjetado.json()).usuario.papel, 'aluno');
});
