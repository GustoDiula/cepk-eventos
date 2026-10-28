// Placeholder — inofensivo por definição: NÃO intercepta fetch, NÃO cacheia nada.
// A implementação real (cache somente leitura + bloqueio de inscrição offline,
// decisão D-008) ocorre na etapa 8.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (evento) => evento.waitUntil(self.clients.claim()));
