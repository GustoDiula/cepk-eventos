// PWA — cache SOMENTE LEITURA do app shell (RF17/RN08, decisão D-008).
//
// Regras permanentes deste service worker:
//  1) /api/** NUNCA é cacheado nem enfileirado — respostas do servidor são frescas;
//  2) respostas privadas (sessão, perfil, turmas do usuário, listas de inscritos)
//     NUNCA entram em cache — hoje a autenticação por sessão É real (D-024):
//     todas as ROTAS DE /api/** estão fora da lista (nada delas é cacheado);
//  3) o modo offline é somente leitura: a interface bloqueia envios (js/offline.js + js/api.js);
//  4) para publicar uma nova versão do shell: incremente VERSAO abaixo.

const VERSAO = 'cepk-shell-v6';

const SHELL = [
  '/',
  '/index.html',
  '/login.html',
  '/turma.html',
  '/evento.html',
  '/inscricoes.html',
  '/sobre.html',
  '/css/main.css',
  '/js/api.js',
  '/js/offline.js',
  '/js/calendario.js',
  '/js/sessao.js',
  '/pwa/manifest.webmanifest',
  '/pwa/icons/icon-192.png',
  '/pwa/icons/icon-512.png',
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(VERSAO)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) => Promise.all(
        chaves.filter((chave) => chave !== VERSAO).map((chave) => caches.delete(chave))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;

  // Nunca interceptar escrita (POST/PATCH/DELETE): sem cache, sem fila (RNF07)
  if (pedido.method !== 'GET') return;

  const url = new URL(pedido.url);

  // Recursos externos: não tratamos
  if (url.origin !== self.location.origin) return;

  // /api/** : rede sempre; nenhum cache (RN08/RF17)
  if (url.pathname.startsWith('/api/')) return;

  // Estratégia: cache primeiro, com revalidação em segundo plano
  evento.respondWith(
    caches.match(pedido).then((doCache) => {
      const daRede = fetch(pedido)
        .then((resposta) => {
          if (resposta && resposta.ok && resposta.type === 'basic') {
            const copia = resposta.clone();
            caches.open(VERSAO).then((cache) => cache.put(pedido, copia));
          }
          return resposta;
        })
        .catch(() => doCache); // falhou a rede: usa o cache (somente leitura)
      return doCache || daRede;
    })
  );
});
