// Sessão de DEMONSTRAÇÃO (D-018, D-012) — APENAS FRONTAL.
//
// Regras permanentes:
//  1) NENHUMA senha é enviada ao servidor ou guardada aqui — o campo de senha
//     do formulário é lido e descartado na hora (queremos SÓ o nome para exibir).
//  2) A sessão fica no localStorage do navegador, marcada como "demo", e NÃO
//     é um login real. Autenticação de verdade: etapa 4, com provedor
//     institucional (F-2) e cookie httpOnly (D-010).
//  3) Privilégio nenhum decorre daqui: e-mail digitado não dá acesso a nada
//     (D-004) — páginas ainda não conversam com servidor algum.

(function () {
  'use strict';

  const CHAVE = 'cepkSessaoDemo';

  function ler() {
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (!bruto) return null;
      const dados = JSON.parse(bruto);
      if (!dados || dados.demo !== true) return null;
      return { nome: String(dados.nome), email: String(dados.email), demo: true };
    } catch {
      return null;
    }
  }

  function entrar(nome, email) {
    localStorage.setItem(
      CHAVE,
      JSON.stringify({ nome: String(nome), email: String(email), demo: true })
    );
  }

  function sair() {
    localStorage.removeItem(CHAVE);
  }

  // Renderiza o bloco de sessão na sidebar (#areaSessao, presente em todas as
  // páginas) e a faixa indicativa no celular (.faixa-sessao, criada aqui).
  function renderizar() {
    const alvo = document.getElementById('areaSessao');
    const sessao = ler();

    document.documentElement.classList.toggle('com-sessao-demo', !!sessao);

    if (alvo) {
      if (sessao) {
        alvo.innerHTML = '';

        const quem = document.createElement('span');
        quem.className = 'nome-demo';
        quem.textContent = sessao.nome + ' (demo)';
        quem.title = 'Sessão de demonstração — e-mail digitado: ' + sessao.email;

        const botaoSair = document.createElement('button');
        botaoSair.className = 'sair-demo';
        botaoSair.type = 'button';
        botaoSair.textContent = 'Sair';
        botaoSair.addEventListener('click', function () {
          sair();
          location.reload();
        });

        alvo.appendChild(quem);
        alvo.appendChild(botaoSair);
      } else {
        alvo.innerHTML =
          '<a class="entrar" href="/login.html">Entrar</a>';
      }
    }
    // Faixa do celular: mostra o usuário demo com Sair (fica escondida no desktop)
    const faixa = document.getElementById('faixaSessao');
    if (faixa) {
      faixa.innerHTML = '';
      if (sessao) {
        const rotulo = document.createElement('span');
        rotulo.textContent = 'DEMO: ' + sessao.nome;
        faixa.appendChild(rotulo);
        const botaoSairFaixa = document.createElement('button');
        botaoSairFaixa.className = 'sair-demo';
        botaoSairFaixa.type = 'button';
        botaoSairFaixa.textContent = 'Sair';
        botaoSairFaixa.addEventListener('click', function () {
          sair();
          location.reload();
        });
        faixa.appendChild(botaoSairFaixa);
      } else {
        const linkEntrar = document.createElement('a');
        linkEntrar.href = '/login.html';
        linkEntrar.textContent = 'Entrar (modo demonstração)';
        faixa.appendChild(linkEntrar);
      }
    }
  }

  window.CEPKSessaoDemo = { ler, entrar, sair, renderizar };
  document.addEventListener('DOMContentLoaded', renderizar);
})();
