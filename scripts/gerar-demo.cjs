// Gera a DEMONSTRAÇÃO ESTÁTICA (pasta demo/) publicada no GitHub Pages — D-026.
// Uso: npm run demo:gerar   (ou node --env-file-if-exists=.env scripts/gerar-demo.cjs)
//
// O que gera (3 arquivos, determinísticos — sempre iguais para os mesmos dados):
//   demo/main.css       ← cópia BYTE A BYTE de src/frontend/css/main.css
//   demo/calendario.js  ← cópia BYTE A BYTE de src/frontend/js/calendario.js
//   demo/dados-demo.js  ← DADOS PUROS de src/backend/db/seed-demo.js (fonte única)
//
// As páginas HTML e demo/demo.js NÃO são geradas por aqui: são escritas à mão.
// Os dados das contas gerados aqui NÃO contêm senha nem hash (CONTAS é puro).
// Requerendo o seed NÃO se conecta ao banco: os dados puros vivem no módulo.
//
// IMPORTANTE: console 100% ASCII (mesmo motivo dos scripts pg — PowerShell 5.1).

const fs = require('node:fs');
const path = require('node:path');

const raiz = path.resolve(__dirname, '..');
const seed = require(path.join(raiz, 'src', 'backend', 'db', 'seed-demo.js'));

const destino = path.join(raiz, 'demo');
fs.mkdirSync(destino, { recursive: true });

// 1) Estilo único do projeto (a demo usa O MESMO CSS do produto real)
fs.copyFileSync(
  path.join(raiz, 'src', 'frontend', 'css', 'main.css'),
  path.join(destino, 'main.css')
);

// 2) Grade mensal do calendário (D-021) — o MESMO script do produto real
fs.copyFileSync(
  path.join(raiz, 'src', 'frontend', 'js', 'calendario.js'),
  path.join(destino, 'calendario.js')
);

// 3) Dados da demo — MESMO jogo de dados do banco de demonstração (fonte única
//    seed-demo.js). Contas SEM hash; eventos com ISO no fuso da escola (-03:00).
const vinculos = seed.vinculosDemo();
const dados = {
  turmas: seed.TURMAS,
  contas: seed.CONTAS,
  disciplina: vinculos.docencia[0].disciplina,
  eventos: seed.narrativaEventosDemo(),
  vinculos,
};

const cabecalho = [
  '// GERADO AUTOMATICAMENTE por scripts/gerar-demo.cjs — NAO EDITAR A MAO.',
  '// Fonte unica: src/backend/db/seed-demo.js (D-026) — o mesmo jogo de dados',
  '// semeado no banco de demonstracao. Contas SEM senha e SEM hash.',
  '// Consumo: window.CEPKDemoDados (lido pelas paginas da pasta demo/).',
].join('\n');

fs.writeFileSync(
  path.join(destino, 'dados-demo.js'),
  cabecalho + '\n\nwindow.CEPKDemoDados = ' + JSON.stringify(dados, null, 2) + ';\n',
  'utf8'
);

console.log('Demo estatica gerada em demo/: main.css, calendario.js, dados-demo.js');
