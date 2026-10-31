// Sessão da DEMONSTRAÇÃO estática (pasta demo/, GitHub Pages).
//
// Princípios iguais aos do produto real (js/sessao.js):
//  • NENHUMA senha existe nesta versão: "entrar" = ESCOLHER um perfil
//    pré-definido (mesmas 5 contas de demonstração do banco do projeto).
//  • A identidade vive APENAS na sessionStorage desta janela — some ao fechar.
//  • Nada é enviado a servidor: esta demonstração NÃO tem backend. Ela só
//    navega e exibe os dados pré-carregados de dados-demo.js; por isso as
//    INSCRIÇÕES ficam desabilitadas em toda a interface (regra 9: nada finge
//    confirmação que só o servidor pode dar).

(function () {
  'use strict';

  // Chave única da sessão de demonstração nesta janela
  var CHAVE = 'cepkDemo';

  // Rótulos de papel SÓ PARA EXIBIÇÃO — não decidem nada (quem decide é o
  // vínculo registrado nos dados, como no banco no produto real).
  var ROTULO_PAPEL = {
    aluno: 'Aluno',
    professor: 'Professor(a)',
    pedagogia: 'Pedagogia',
    direcao: 'Direção',
  };

  function sessaoAtual() {
    try {
      var bruto = sessionStorage.getItem(CHAVE);
      if (!bruto) return null;
      var s = JSON.parse(bruto);
      return s && s.email ? s : null;
    } catch (erro) {
      return null;
    }
  }

  function guardarSessao(perfil) {
    // Guarda SOMENTE identidade de exibição (email/nome/papel) — sem senha
    sessionStorage.setItem(CHAVE, JSON.stringify({
      email: perfil.email,
      nome: perfil.nome,
      papel: perfil.papel,
    }));
    location.href = './turma.html';
  }

  function sair() {
    try { sessionStorage.removeItem(CHAVE); } catch (erro) { /* nada a limpar */ }
    location.href = './entrar.html';
  }

  // ------------------------------------------------------------
  // Dados por vínculo (mesma semântica dos endpoints do backend):
  // direção vê TODAS; aluno/docência/pedagogia veem o que ESTIVER
  // registrado nos vínculos — nada é decidido por e-mail.
  function turmasVisiveis(dados, sessao) {
    if (!dados || !sessao) return [];

    var nomes = [];
    if (sessao.papel === 'direcao') {
      dados.turmas.forEach(function (t) { nomes.push(t.nome_curto); });
    } else {
      function procurar(grupo) {
        (grupo || []).forEach(function (v) {
          if (v.email !== sessao.email) return;
          if (v.turma) nomes.push(v.turma);
          (v.turmas || []).forEach(function (t) { nomes.push(t); });
        });
      }
      procurar(dados.vinculos.alunos);
      procurar(dados.vinculos.docencia);
      procurar(dados.vinculos.pedagogia);
    }

    // remove duplicados (p. ex. mesmo e-mail em duas listas) e ordena
    // pela ordem oficial das turmas (dados.turmas)
    nomes = nomes.filter(function (nome, i) { return nomes.indexOf(nome) === i; });
    var ordem = dados.turmas.map(function (t) { return t.nome_curto; });
    nomes.sort(function (a, b) { return ordem.indexOf(a) - ordem.indexOf(b); });

    return nomes.map(function (nome) {
      var base = dados.turmas.filter(function (t) { return t.nome_curto === nome; })[0] || {};
      return { nome_curto: nome, tipo: base.tipo || 'regular' };
    });
  }

  function eventosDaTurma(dados, nomeTurma) {
    return (dados.eventos || [])
      .filter(function (ev) { return ev.turma === nomeTurma; })
      .sort(function (a, b) { return String(a.inicio).localeCompare(String(b.inicio)); });
  }

  // ------------------------------------------------------------
  // Formatação — MESMA técnica das páginas reais: fatia a string ISO
  // (fuso da escola -, já pronto); NUNCA reconverte com toLocaleString.
  function dataCurta(iso) {
    return String(iso).slice(8, 10) + '/' + String(iso).slice(5, 7) + '/' + String(iso).slice(0, 4);
  }
  function horaCurta(iso) {
    return String(iso).slice(11, 16);
  }

  window.CEPKDemo = {
    CHAVE: CHAVE,
    sessaoAtual: sessaoAtual,
    guardarSessao: guardarSessao,
    sair: sair,
    ROTULO_PAPEL: ROTULO_PAPEL,
    turmasVisiveis: turmasVisiveis,
    eventosDaTurma: eventosDaTurma,
    dataCurta: dataCurta,
    horaCurta: horaCurta,
  };

  // ------------------------------------------------------------
  // Renderização da sessão na sidebar e na faixa do celular — roda ao
  // carregar CADA página da demo. O HTML traz o link estático "Escolher
  // perfil"; com perfil ativo ele é substituído por nome + botão "Sair".
  function botaoSair() {
    var botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'sair-demo';
    botao.textContent = 'Sair (demo)';
    botao.addEventListener('click', sair);
    return botao;
  }

  function preencherSessao() {
    var s = sessaoAtual();
    var area = document.getElementById('areaSessao');
    var faixa = document.getElementById('faixaSessao');
    var raiz = document.documentElement;

    if (s) {
      if (area) {
        var nome = document.createElement('span');
        nome.className = 'nome-demo';
        nome.textContent = s.nome + ' (' + (ROTULO_PAPEL[s.papel] || 'Perfil') + ')';
        area.replaceChildren(nome, botaoSair());
      }
      if (faixa) {
        var texto = document.createElement('span');
        texto.textContent = 'Perfil: ' + s.nome;
        faixa.replaceChildren(texto, botaoSair());
      }
      raiz.classList.add('com-sessao');
    } else {
      if (faixa) {
        var aviso = document.createElement('span');
        aviso.textContent = 'Nenhum perfil escolhido';
        faixa.replaceChildren(aviso);
      }
      raiz.classList.remove('com-sessao');
    }
  }

  // Cada página da demo carrega demo.js: preenche na abertura, todas as vezes
  document.addEventListener('DOMContentLoaded', preencherSessao);
})();
