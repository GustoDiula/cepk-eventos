// Configuração da sessão por cookie assinado (D-010; api.md §1).
// LEITURA por env (RNF05): nada de segredo no código.
const minutos = Number(process.env.SESSION_MAX_MINUTOS || 480); // F-17: parâmetro configurável

module.exports = {
  nomeCookie: 'cepk.sid',
  maxAgeMs: minutos * 60 * 1000,
  cookie: {
    httpOnly: true,   // JS do navegador jamais lê o cookie
    sameSite: 'lax',  // contribui contra CSRF com requisições cross-site
    // Em development (http://localhost) Secure fica desligado; em production,
    // atrás de HTTPS, liga automaticamente.
    secure: process.env.NODE_ENV === 'production',
  },
};
