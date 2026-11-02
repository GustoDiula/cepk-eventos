// Gera um valor aleatório de 64 hex para ser usado como SESSION_SECRET.
// Gerado na MÁQUINA de quem usa e copiado para o painel da hospedagem
// (D-027): o texto impresso é a única cópia; nada é gravado em arquivo.
//
// Uso: npm run segredo      (alimenta o console com session secret; nunca
// cole num chat, doc, código ou Git — destino é o painel da hospedagem.)
const valor = require('node:crypto').randomBytes(32).toString('hex');
console.log(valor);
