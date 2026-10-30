// Sessão REAL de servidor (D-024) — substitui o login de navegador (D-018).
//
// Princípios:
//  • NENHUMA identidade ou senha vive no navegador: a sessão é um cookie
//    HttpOnly assinado que o navegador envia sozinho; este script só EXIBE
//    o que o SERVIDOR confirmar (GET /api/v1/auth/me).
//  • Sem resposta confirmada (401/offline), a interface trata como visitante.
//    A lista de turmas e os eventos NUNCA são decididos aqui — quem mostra
//    quem tem acesso a o quê é o backend (regra 8 do AGENTS.md).

(function () {
  'use strict';

  // Rótulos de papel SÓ para exibição — não decidem nada
  const ROTULO_PAPEL = {
    aluno: 'Aluno',
    professor: 'Professor(a)',
    pedagogia: 'Pedagogia',
    direcao: 'Direção',
  };

  async function consultar() {
    try {
      const resposta = await fetch('/api/v1/auth/me', { credentials: 'same-origin' });
      if (!resposta.ok) return null;
      const dados = await resposta.json();
      return dados && dados.usuario ? dados.usuario : null;
    } catch {
      return null; // offline ou falha: exibido como visitante (nada é inventado)
    }
  }

  async function sair() {
    try {
      // O COMANDO de terminar a sessão vai ao SERVIDOR; só volta quando ele
      // confirma (a sessão é dele, não deste navegador).
      await fetch('/api/v1/auth/sair', { method: 'POST', credentials: 'same-origin' });
    } catch {
      // sem rede: nada a fazer aqui além de sair da tela
    }
    location.href = '/';
  }

  function blocoSessao(alvo, usuario) {
    alvo.replaceChildren();
    if (usuario) {
      const quem = document.createElement('span');
      quem.className = 'nome-demo'; // estilo existente da sidebar
      const papel = ROTULO_PAPEL[usuario.papel] || '';
      quem.textContent = usuario.nome + (papel ? ' · ' + papel : '');
      const botaoSair = document.createElement('button');
      botaoSair.className = 'sair-demo';
      botaoSair.type = 'button';
      botaoSair.textContent = 'Sair';
      botaoSair.addEventListener('click', sair);
      alvo.appendChild(quem);
      alvo.appendChild(botaoSair);
    } else {
      alvo.innerHTML = '<a class="entrar" href="/login.html">Entrar</a>';
    }
  }

  async function renderizar() {
    const usuario = await consultar();
    document.documentElement.classList.toggle('com-sessao', !!usuario);

    const alvo = document.getElementById('areaSessao');
    if (alvo) blocoSessao(alvo, usuario);

    // Faixa no celular (aparece só com sessão ativa — ver main.css)
    const faixa = document.getElementById('faixaSessao');
    if (faixa) {
      faixa.replaceChildren();
      if (usuario) {
        const rotulo = document.createElement('span');
        const papel = ROTULO_PAPEL[usuario.papel] || '';
        rotulo.textContent = usuario.nome + (papel ? ' · ' + papel : '');
        faixa.appendChild(rotulo);
        const botaoSair = document.createElement('button');
        botaoSair.className = 'sair-demo';
        botaoSair.type = 'button';
        botaoSair.textContent = 'Sair';
        botaoSair.addEventListener('click', sair);
        faixa.appendChild(botaoSair);
      }
    }
  }

  window.CEPKSessao = { consultar, sair, renderizar };
  document.addEventListener('DOMContentLoaded', renderizar);
})();
