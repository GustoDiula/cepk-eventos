// Grade mensal do calendário (F-16) — dados do FRONT.
//
// Dois conjuntos, escolhidos por data-calendario no HTML:
//   "feriados"  → feriados oficiais do Paraná — ANO 2026 COMPLETO (D-019).
//                 Fonte oficial: Governo do Paraná — Calendário Anual 2026 da
//                 SEAP (administracao.pr.gov.br/Pagina/Calendario-Anual) e
//                 Feriados Civis (turismo.pr.gov.br/Pagina/Feriados-Civis-e-Datas-Comemorativas).
//                 Inclui 19/12 (feriado ESTADUAL da Emancipação do Paraná).
//   "provas"    → provas e atividades da turma 1º Ano A — datas FICTÍCIAS,
//                 ficam ao lado do rótulo de marcação (RF15/RNF10).
//
// O mês renderizado é o mês corrente na hora de abrir a página — cada dia o
// calendário já nasce atualizado, sem intervenção.

(function () {
  'use strict';

  const CONJUNTOS = {
    feriados: [
      { data: '2026-01-01', titulo: 'Confraternização Universal', tipo: 'feriado' },
      { data: '2026-02-16', titulo: 'Carnaval (ponto facultativo)', tipo: 'facultativo' },
      { data: '2026-02-17', titulo: 'Carnaval (ponto facultativo)', tipo: 'facultativo' },
      { data: '2026-02-18', titulo: 'Quarta-feira de Cinzas (pf até 14h)', tipo: 'facultativo' },
      { data: '2026-04-02', titulo: 'Ponto facultativo', tipo: 'facultativo' },
      { data: '2026-04-03', titulo: 'Paixão de Cristo', tipo: 'feriado' },
      { data: '2026-04-20', titulo: 'Ponto facultativo', tipo: 'facultativo' },
      { data: '2026-04-21', titulo: 'Tiradentes', tipo: 'feriado' },
      { data: '2026-05-01', titulo: 'Dia do Trabalho', tipo: 'feriado' },
      { data: '2026-06-04', titulo: 'Corpus Christi (ponto facultativo)', tipo: 'facultativo' },
      { data: '2026-06-05', titulo: 'Ponto facultativo', tipo: 'facultativo' },
      { data: '2026-09-07', titulo: 'Independência do Brasil', tipo: 'feriado' },
      { data: '2026-10-12', titulo: 'N. S. Aparecida', tipo: 'feriado' },
      { data: '2026-11-02', titulo: 'Finados', tipo: 'feriado' },
      { data: '2026-11-15', titulo: 'Proclamação da República', tipo: 'feriado' },
      { data: '2026-11-20', titulo: 'Consciência Negra', tipo: 'feriado' },
      { data: '2026-12-19', titulo: 'Emancipação do Paraná', tipo: 'feriadoest' },
      { data: '2026-12-21', titulo: 'Início do recesso', tipo: 'facultativo' },
      { data: '2026-12-25', titulo: 'Natal', tipo: 'feriado' },
      { data: '2026-12-31', titulo: 'Fim do recesso', tipo: 'facultativo' },
    ],
    provas: [
      { data: '2026-10-28', titulo: 'Prova de Matemática', tipo: 'prova' },
      { data: '2026-11-04', titulo: 'Prova de História', tipo: 'prova' },
      { data: '2026-11-11', titulo: 'Prova de Biologia', tipo: 'prova' },
      { data: '2026-11-18', titulo: 'Prova de Português', tipo: 'prova' },
      { data: '2026-11-25', titulo: 'Prova de Geografia', tipo: 'prova' },
      { data: '2026-12-05', titulo: 'Feira de profissões', tipo: 'atividade' },
      { data: '2026-12-08', titulo: 'Viagem pedagógica', tipo: 'atividade' },
      { data: '2026-12-11', titulo: 'Entrega de boletim', tipo: 'atividade' },
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
      const marcados = eventos.filter((ev) => {
        const data = new Date(ev.data + 'T00:00:00');
        return data.getFullYear() === ano && data.getMonth() === mes && data.getDate() === dia;
      });
      celulas.push({ dia, eventos: marcados });
    }
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
    caption.textContent =
      `${titulo} — ${conjunto === 'feriados' ? 'feriados oficiais do Paraná (2026)' : 'calendário da turma (fictício)'}`;
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
          // o sufixo de classe sai do próprio tipo (feriado/facultativo/prova...)
          marca.className = `ev ev-${ev.tipo}`;
          marca.title = ev.titulo;
          marca.textContent = ev.titulo;
          td.appendChild(marca);
        }
      }
      linha.appendChild(td);
    });
    tabela.appendChild(tbody);

    alvo.replaceChildren(tabela);
  }

  // Uma instância por elemento com data-calendario.
  document.querySelectorAll('[data-calendario]').forEach((alvo) => {
    construir(alvo, alvo.getAttribute('data-calendario'));
  });
})();
