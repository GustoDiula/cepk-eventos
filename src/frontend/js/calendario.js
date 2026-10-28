// Grade mensal do calendário (F-16, decisão D-013) — maquete visual com
// dados FICTÍCIOS marcados. Nada é buscado do servidor (etapa 5 fará isso).
//
// Regras: o mês renderizado é o mês corrente (decisão: nunca fica congelado);
// os eventos fictícios têm datas fixas de Outubro/2026 para a demonstração.
// Acessibilidade: <table> com caption, th e escopo — leitores de tela navegam
// como tabela normal.

(function () {
  'use strict';

  // Eventos FICTÍCIOS marcados (RF15/RNF10). Cada página declara qual conjunto
  // usa com data-calendario="geral" ou data-calendario="turma".
  const CONJUNTOS = {
    geral: [
      { data: '2026-10-28', titulo: 'Torres de ciências', tipo: 'exige' },
      { data: '2026-10-29', titulo: 'Roda de leitura', tipo: 'aberto' },
      { data: '2026-10-31', titulo: 'Festival Cultural', tipo: 'exige' },
    ],
    turma: [
      { data: '2026-10-27', titulo: 'Reforço de matemática', tipo: 'aberto' },
      { data: '2026-10-30', titulo: 'Reunião de pais', tipo: 'exige' },
      { data: '2026-10-31', titulo: 'Feira de profissões', tipo: 'opcional' },
    ],
  };

  const ROTULOS_DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  function hoje() {
    const agora = new Date();
    return { ano: agora.getFullYear(), mes: agora.getMonth(), dia: agora.getDate() };
  }

  // Constrói as células (7 colunas) do mês corrente, domingo primeiro.
  function construirCelulas(ano, mes, eventos) {
    const primeiro = new Date(ano, mes, 1);
    const limite = new Date(ano, mes + 1, 0).getDate();
    const celulas = [];

    for (let vazio = 0; vazio < primeiro.getDay(); vazio++) {
      celulas.push({ dia: null });
    }
    for (let dia = 1; dia <= limite; dia++) {
      const atributos = eventos.filter((ev) => {
        const data = new Date(ev.data + 'T00:00:00');
        return data.getFullYear() === ano && data.getMonth() === mes && data.getDate() === dia;
      });
      celulas.push({ dia, eventos: atributos });
    }
    // completa a última linha
    while (celulas.length % 7 !== 0) celulas.push({ dia: null });
    return celulas;
  }

  function construir(alvo, conjunto) {
    if (!alvo) return;
    const eventos = CONJUNTOS[conjunto] || [];
    const h = hoje();
    const titulo = `${MESES[h.mes]} de ${h.ano}`;

    const tabela = document.createElement('table');
    tabela.className = 'grade-calendario';

    const caption = document.createElement('caption');
    caption.textContent = `${titulo} — dados fictícios`;
    tabela.appendChild(caption);

    const thead = document.createElement('thead');
    const linhaTitulos = document.createElement('tr');
    for (const rotulo of ROTULOS_DIAS) {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = rotulo;
      linhaTitulos.appendChild(th);
    }
    thead.appendChild(linhaTitulos);
    tabela.appendChild(thead);

    const tbody = document.createElement('tbody');
    const celulas = construirCelulas(h.ano, h.mes, eventos);
    let linha;
    celulas.forEach((celula, indice) => {
      if (indice % 7 === 0) {
        linha = document.createElement('tr');
        tbody.appendChild(linha);
      }
      const td = document.createElement('td');
      if (celula.dia === null) {
        td.className = 'fora';
        td.setAttribute('aria-hidden', 'true');
        td.innerHTML = '&nbsp;';
      } else {
        const numero = document.createElement('span');
        numero.className = 'dia-num';
        numero.textContent = String(celula.dia);
        td.appendChild(numero);
        if (celula.dia === h.dia) td.classList.add('hoje');
        for (const ev of celula.eventos) {
          const marca = document.createElement('span');
          marca.className = `ev ev-${ev.tipo}`;
          marca.title = `${ev.titulo} (fictício)`;
          marca.textContent = ev.titulo;
          td.appendChild(marca);
        }
      }
      linha.appendChild(td);
    });
    tabela.appendChild(tbody);

    alvo.replaceChildren(tabela);
  }

  // Uma instância por elemento com data-calendario (index: geral; turma.html: turma).
  document.querySelectorAll('[data-calendario]').forEach((alvo) => {
    construir(alvo, alvo.getAttribute('data-calendario'));
  });
})();
