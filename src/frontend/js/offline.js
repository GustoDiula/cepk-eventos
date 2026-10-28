// Detector de conexão + banner + API de estados (RF17/RN08, decisão D-008).
// O banner aparece em qualquer página que inclua este arquivo com defer.
//
// Regra permanente: nada é enviado ou enfileirado enquanto offline —
// o bloqueio efetivo de envios vive no js/api.js (fonte única).

(function () {
  const ID_BANNER = 'bannerOffline';

  function montarBanner() {
    if (document.getElementById(ID_BANNER)) return;
    const banner = document.createElement('aside');
    banner.id = ID_BANNER;
    banner.setAttribute('role', 'alert');
    banner.textContent =
      'Você está offline — dados podem estar desatualizados. Inscrições exigem conexão.';
    document.body.prepend(banner);
  }

  function removerBanner() {
    const banner = document.getElementById(ID_BANNER);
    if (banner) banner.remove();
  }

  window.CEPKOffline = {
    estaOffline: () => !navigator.onLine,
    aoMudar: (fn) => {
      window.addEventListener('online', () => fn(false));
      window.addEventListener('offline', () => fn(true));
    },
  };

  function aplicar() {
    if (window.CEPKOffline.estaOffline()) montarBanner();
    else removerBanner();
  }

  aplicar();
  window.addEventListener('online', aplicar);
  window.addEventListener('offline', aplicar);
})();
