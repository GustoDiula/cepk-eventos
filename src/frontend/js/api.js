// Ponto ÚNICO de chamadas HTTP (arquitetura v2.0).
//
// Guarda offline (RF17/RN08, decisão D-008): sem conexão, NADA é enviado
// nem enfileirado — a operação falha imediatamente com CONEXAO_EXIGIDA.

export const API = {
  base: '/api/v1',

  estaOffline: () => !navigator.onLine,

  async requisicao(rota, opcoes = {}) {
    if (this.estaOffline()) {
      const falha = new Error('Sem conexão: esta operação exige rede (RF17/RN08).');
      falha.codigo = 'CONEXAO_EXIGIDA';
      throw falha;
    }

    let resposta;
    try {
      resposta = await fetch(`${this.base}${rota}`, opcoes);
    } catch (erro) {
      // Falha de rede durante a chamada — nunca tratamos como confirmação.
      const falha = new Error('Rede indisponível durante a operação.');
      falha.codigo = 'CONEXAO_EXIGIDA';
      throw falha;
    }

    if (!resposta.ok) {
      const falha = new Error(`HTTP ${resposta.status} em ${rota}`);
      falha.status = resposta.status;
      throw falha;
    }

    return resposta.status === 204 ? null : resposta.json();
  },
};
