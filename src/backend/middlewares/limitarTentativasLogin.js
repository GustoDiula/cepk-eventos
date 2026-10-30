// Limitador de tentativas de login (proteção contra força-bruta).
// Em memória (adequado ao ambiente de demonstração; produção com várias
// instâncias exigiria armazenamento compartilhado — documentado em api.md).
//
// Regra: no máximo 5 tentativas FALHAS por (IP + e-mail) em 15 minutos → 429.

const LIMITE = 5;
const JANELA_MS = 15 * 60 * 1000;
const tentativas = new Map(); // chave → { contagem, primeira }

function chaveDe(req, email) {
  const ip = req.socket ? req.socket.remoteAddress || '' : '';
  return `${ip}|${String(email || '').trim().toLowerCase()}`;
}

function limpar(chave) {
  tentativas.delete(chave);
}

function registrarFalha(chave) {
  const agora = Date.now();
  const item = tentativas.get(chave);
  if (!item || agora - item.primeira > JANELA_MS) {
    tentativas.set(chave, { contagem: 1, primeira: agora });
  } else {
    item.contagem += 1;
  }
  return tentativas.get(chave).contagem;
}

function excedeuLimite(chave) {
  const item = tentativas.get(chave);
  if (!item) return false;
  if (Date.now() - item.primeira > JANELA_MS) {
    tentativas.delete(chave);
    return false;
  }
  return item.contagem >= LIMITE;
}

// Middleware: bloqueia ANTES de processar credenciais quando estourou o limite.
module.exports = function limitarTentativasLogin(req, res, next) {
  const email = (req.body && req.body.email) || '';
  const chave = chaveDe(req, email);
  req.chaveLimite = chave; // handler usa para contar falha / limpar sucesso
  if (excedeuLimite(chave)) {
    return res.status(429).json({
      erro: { codigo: 'MUITAS_TENTATIVAS', mensagem: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.' },
    });
  }
  return next();
};

// Escopo utilitário (mesmo módulo, evita estado solto)
module.exports.registrarFalha = registrarFalha;
module.exports.limpar = limpar;
module.exports.chaveDe = chaveDe;
