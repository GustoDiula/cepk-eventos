// Ponto ÚNICO de chamadas HTTP (arquitetura v2.0).
// Nesta etapa estático: referencia apenas o contrato; chamadas reais entram
// a partir da etapa 5 conforme docs/api.md.
export const API = {
  base: '/api/v1',
  async requisicao(rota, opcoes = {}) {
    const resposta = await fetch(`${this.base}${rota}`, opcoes);
    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status} em ${rota}`);
    }
    return resposta.status === 204 ? null : resposta.json();
  },
};
