// Testes da DEMONSTRAÇÃO ESTÁTICA (pasta demo/, publicada no GitHub Pages).
//
// Esta demo é PUBLICADA (pessoa lá fora vê) e serve para mostrar o projeto em
// páginas estáticas, onde NÃO existe backend. Os testes guardam a honestidade:
//  • SOMENTE caminhos relativos (sem Express, `/css/...` não existe);
//  • NENHUMA chamada de rede, senha, hash e nenhum segredo;
//  • banner "DEMONSTRAÇÃO" explicando as limitações em TODAS as páginas, para
//    que ninguém seja enganado;
//  • cópias geradas (main.css, calendario.js) IGUAIS à fonte — se divergir,
//    falha o teste até rodar npm run demo:gerar de novo;
//  • dados-demo.js = MESMO jogo de dados do seed (fonte única, sem duplicação).

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const arquivoDemo = (...partes) => path.join(raiz, 'demo', ...partes);
const lerDemo = (...partes) => fs.readFileSync(arquivoDemo(...partes), 'utf8');

const PAGINAS = ['index.html', 'entrar.html', 'turma.html', 'inscricoes.html'];

// ... dados-demo.js é JS de navegador; para testar, recorte o objeto literal
function dadosDemo() {
  const texto = lerDemo('dados-demo.js');
  const marca = 'window.CEPKDemoDados = ';
  const inicio = texto.indexOf(marca);
  assert.notEqual(inicio, -1, 'dados-demo.js deve definir window.CEPKDemoDados');
  const json = texto.slice(inicio + marca.length).replace(/;\s*$/, '');
  return JSON.parse(json);
}

test('as 4 páginas + demo.js existem e usam SOMENTE caminhos relativos', () => {
  const arquivos = [...PAGINAS, 'demo.js'];
  for (const nome of arquivos) {
    const texto = lerDemo(nome);
    assert.doesNotMatch(texto, /(href|src)="\/(?!\/)/u, `${nome}: caminho absoluto de raiz não existe fora do servidor`);
    assert.doesNotMatch(texto, /href="https?:\/\//u, `${nome}: sem links externos`);
    assert.doesNotMatch(texto, /fetch\(/u, `${nome}: a demo não tem rede — e não deve fingir que tem`);
  }
  // estilo ÚNICO do projeto (cópia gerada, não uma segunda cópia)
  assert.equal(fs.existsSync(arquivoDemo('main.css')), true, 'demo/main.css ausente');
  for (const pagina of PAGINAS) {
    assert.match(lerDemo(pagina), /href="\.\/main\.css"/u, `${pagina} não usa o css da demo`);
  }
});

test('a demo não usa localStorage, não traz senha/hash e não revela o valor da senha de demo', () => {
  const conjunto = [...PAGINAS, 'demo.js', 'dados-demo.js'].map((n) => lerDemo(n)).join('\n');
  assert.doesNotMatch(conjunto, /localStorage\./u, 'a sessão de demo vive APENAS na sessionStorage');
  assert.doesNotMatch(conjunto, /SENHA_DEMO|senha_hash|bcrypt/iu, 'nenhum segredo na demo');
  assert.doesNotMatch(conjunto, /1234/u, 'o VALOR da senha de demo nunca pode parar aqui');
  assert.match(conjunto, /cepkDemo/u, 'sessão demo guarda-se na chave cepkDemo');
});

test('TODAS as páginas anunciam DEMONSTRAÇÃO e explicam inscrições desabilitadas', () => {
  for (const pagina of PAGINAS) {
    const texto = lerDemo(pagina);
    assert.match(texto, /class="aviso-demo"/u, `${pagina}: falta o banner de demonstração`);
    assert.match(texto, /DEMONSTRAÇÃO/u, `${pagina}: banner precisa dizer DEMONSTRAÇÃO`);
    assert.match(texto, /desabilitadas/iu, `${pagina}: precisa avisar que inscrições estão desabilitadas`);
  }
});

test('papel de cada página: entrar tem os 5 perfis; turma e inscrições exigem sessão', () => {
  const entrar = lerDemo('entrar.html');
  assert.match(entrar, /src="\.\/dados-demo\.js"/u, 'entrar carrega os dados gerados');
  assert.match(entrar, /guardarSessao\(/u, 'entrar guarda o perfil escolhido');

  for (const pagina of ['turma.html', 'inscricoes.html']) {
    const texto = lerDemo(pagina);
    assert.match(texto, /location\.href = '\.\/entrar\.html'/u, `${pagina} sem perfil → volta para entrar`);
    assert.match(texto, /cepkDemo|sessaoAtual/u, `${pagina} lê a sessão demo`);
  }
  // página de turmas usa a MESMA grade de calendário do produto real (cópia)
  assert.match(lerDemo('turma.html'), /src="\.\/calendario\.js"/u, 'turma usa a MESMA grade do projeto');
});

test('demo.js preenche a sessão no carregamento de TODA página (nome + Sair)', () => {
  const demo = lerDemo('demo.js');
  assert.match(demo, /document\.addEventListener\('DOMContentLoaded', preencherSessao\)/u,
    'listener de carregamento ausente (barra de sessão nunca enche)');
  assert.match(demo, /className = 'nome-demo'/u, 'falta o nome do perfil');
  assert.match(demo, /className = 'sair-demo'/u, 'falta o botão de sair da demo');
  assert.match(demo, /classList\.add\('com-sessao'\)/u, 'falta ligar a faixa do celular');
});

test('cópias geradas são BYTE A BYTE iguais às fontes (fonte única de estilo/grade)', () => {
  const copia = (destino, origem) => fs.readFileSync(arquivoDemo(destino)).equals(fs.readFileSync(path.join(raiz, origem)));
  assert.ok(copia('main.css', path.join('src', 'frontend', 'css', 'main.css')),
    'demo/main.css divergiu de src/frontend/css/main.css — rode npm run demo:gerar');
  assert.ok(copia('calendario.js', path.join('src', 'frontend', 'js', 'calendario.js')),
    'demo/calendario.js divergiu de src/frontend/js/calendario.js — rode npm run demo:gerar');
});

test('dados da demo: MESMAS 10 turmas do seed (3 regulares + 7 técnicas)', () => {
  const d = dadosDemo();
  assert.equal(d.turmas.length, 10);
  assert.equal(d.turmas.filter((t) => t.tipo === 'regular').length, 3);
  assert.equal(d.turmas.filter((t) => t.tipo === 'tecnica').length, 7);
  assert.deepEqual(
    d.turmas.map((t) => t.nome_curto),
    ['1º A', '1º B', '1º C', '1º DSB', '1º ADM', '2º DSB', '2º ADM', '3º DSB', '3º DSC', '3º ADM'],
  );
});

test('contas da demo: só as 5 de demonstração, SEM hash e sem qualquer senha', () => {
  const d = dadosDemo();
  assert.equal(d.contas.length, 5);
  for (const conta of d.contas) {
    assert.deepEqual(Object.keys(conta).sort(), ['email', 'nome', 'papel']);
    assert.match(conta.email, /@cepk-eventos\.test$/u);
    assert.ok(['aluno', 'professor', 'pedagogia', 'direcao'].includes(conta.papel), `papel estranho: ${conta.papel}`);
  }
});

test('eventos da demo: MESMA narrativa do seed — 27 no fuso -03:00 e marcados "(demonstração)"', () => {
  const d = dadosDemo();
  assert.equal(d.eventos.length, 27);
  for (const ev of d.eventos) {
    assert.ok(ev.titulo.includes('(demonstração)'), `atividade sem marca: ${ev.titulo}`);
    assert.ok(String(ev.inicio).endsWith('-03:00'), `fuso errado em: ${ev.titulo}`);
    assert.ok(String(ev.fim).endsWith('-03:00'), `fuso errado no fim de: ${ev.titulo}`);
    assert.ok(ev.turma && d.turmas.some((t) => t.nome_curto === ev.turma), `turma inexistente: ${ev.turma}`);
  }
  const porTurma = {};
  for (const ev of d.eventos) porTurma[ev.turma] = (porTurma[ev.turma] || 0) + 1;
  assert.deepEqual(porTurma, {
    '1º A': 8, '1º B': 3, '1º C': 2,
    '1º DSB': 2, '1º ADM': 2, '2º DSB': 2, '2º ADM': 2,
    '3º DSB': 2, '3º DSC': 2, '3º ADM': 2,
  });
});

test('exatamente 1 atividade exige inscrição (viagem pedagógica do 1º A, vagas 45/30)', () => {
  const d = dadosDemo();
  const exigidas = d.eventos.filter((ev) => ev.exige_inscricao === true);
  assert.equal(exigidas.length, 1);
  const ev = exigidas[0];
  assert.equal(ev.turma, '1º A');
  assert.ok(/Viagem pedagógica/.test(ev.titulo));
  assert.equal(ev.vagas_total, 45);
  assert.equal(ev.vagas_restantes, 30);
  assert.equal(ev.prazo_inscricao, '2026-11-30T18:00:00-03:00');
});

test('vínculos da demo = os aprovados (aluno 1↔1; docência 3 turmas de Geografia; pedagogia 10; direção por papel)', () => {
  const d = dadosDemo();
  assert.equal(d.vinculos.alunos.length, 2);
  assert.deepEqual(d.vinculos.alunos.map((v) => v.turma).sort(), ['1º A', '1º B']);

  assert.equal(d.vinculos.docencia.length, 1);
  const docente = d.vinculos.docencia[0];
  assert.deepEqual(docente.turmas, ['1º A', '1º B', '1º C']);
  assert.equal(d.disciplina, 'Geografia');

  assert.equal(d.vinculos.pedagogia.length, 1);
  assert.equal(d.vinculos.pedagogia[0].turmas.length, 10);

  // direção NÃO tem linhas de vínculo: é papel (vê todas)
  assert.ok(!JSON.stringify(d.vinculos).includes('direcao'), 'direção não deve ter vínculos listados');
});

test('a demo NÃO tem service worker nem manifest (PWA é só no produto real)', () => {
  assert.equal(fs.existsSync(arquivoDemo('service-worker.js')), false, 'nada de SW na demo');
  assert.equal(fs.existsSync(arquivoDemo('sw.js')), false);
  for (const pagina of PAGINAS) {
    const texto = lerDemo(pagina);
    assert.doesNotMatch(texto, /rel="manifest"/u, `${pagina}: manifest é do produto real`);
    assert.doesNotMatch(texto, /serviceWorker/u, `${pagina}: SW é do produto real`);
  }
});

test('a demo é pública: nada de conteúdo interno (IDs de decisão, e-mails reais)', () => {
  // IDs de decisão (D-0xx) ficam nos docs, nunca no que a pessoa externa vê
  for (const pagina of PAGINAS) {
    const texto = lerDemo(pagina);
    assert.doesNotMatch(texto, /D-\d{2}/u, `${pagina}: sigla interna de decisão no que é publicado`);
  }
});

test('publicação: workflow do Pages e npm script demo:gerar existem', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(raiz, 'package.json'), 'utf8'));
  assert.equal(typeof pkg.scripts['demo:gerar'], 'string', 'npm script demo:gerar ausente');

  // Publisher ÚNICO: static.yml (gabarito da GitHub que executou com sucesso).
  // deploy-demo.yml foi aposentado (2 tentativas falharam sem criar job algum).
  const workflow = fs.readFileSync(path.join(raiz, '.github', 'workflows', 'static.yml'), 'utf8');
  assert.match(workflow, /deploy-pages@v5/u, 'deploy do Pages ausente');
  assert.match(workflow, /path: demo/u, 'artifact precisa publicar a PASTA demo/');
  assert.doesNotMatch(workflow, /path:\s*['"]?\.\s*$/u, 'workflow NÃO pode publicar a raiz (404)');
  assert.match(workflow, /github-pages/u, 'environment do Pages ausente');
  assert.match(workflow, /demo:gerar/u, 'workflow precisa regenerar a demo');

  assert.throws(() => fs.readFileSync(path.join(raiz, '.github', 'workflows', 'deploy-demo.yml')),
    'deploy-demo.yml aposentado ainda existe no repo');
});
