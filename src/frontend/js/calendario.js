// Grade mensal do calendário (F-16) — dados do FRONT.
//
//Funcionalidades (D-021):
//  • Setas ◀ ▶ navegam entre os meses com dados, limitadas ao intervalo do
//    conjunto; botão "hoje" volta ao mês corrente.
//  • Dias, marcas e cartões ANTES de hoje ganham estado "passado" (cinza +
//    "Já passou") calculado na hora da abertura — vira o dia, a página muda.
//
// Conjuntos, escolhidos por data-calendario no HTML:
//   "feriados" → feriados OFICIAIS do Paraná, ano 2026 completo (D-019).
//                Fonte oficial: Governo do Paraná — Calendário Anual 2026
//                (administracao.pr.gov.br/Pagina/Calendario-Anual) e Feriados
//                Civis (turismo.pr.gov.br/Pagina/Feriados-Civis-e-Datas-Comemorativas).
//   "provas"   → provas e atividades da turma 1º Ano A — datas FICTÍCIAS
//                (RF15/RNF10).

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
    // meia-noite de hoje: o que for ANTES disto já passou
    return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  }

  function quebrarData(iso) {
    const d = new Date(iso + 'T00:00:00');
    return { ano: d.getFullYear(), mes: d.getMonth(), dia: d.getDate() };
  }

  // conector do conjunto: intervalo de meses com dados (para limitar as setas)
  function intervaloMeses(eventos) {
    let min = null;
    let max = null;
    for (const ev of eventos) {
      const { ano, mes } = quebrarData(ev.data);
      const chave = ano * 12 + mes;
      if (min === null || chave < min) min = chave;
      if (max === null || chave > max) max = chave;
    }
    return { min, max };
  }

  function construirCelulas(ano, mes, eventos) {
    const primeiro = new Date(ano, mes, 1);
    const limite = new Date(ano, mes + 1, 0).getDate();
    const celulas = [];
    const passagem = hoje();

    for (let vazio = 0; vazio < primeiro.getDay(); vazio++) {
      celulas.push({ dia: null });
    }
    for (let dia = 1; dia <= limite; dia++) {
      const dataCelula = new Date(ano, mes, dia);
      const marcados = eventos.filter((ev) => {
        const { ano: anoEv, mes: mesEv, dia: diaEv } = quebrarData(ev.data);
        return anoEv === ano && mesEv === mes && diaEv === dia;
      }).map((ev) => ({ ...ev, passou: dataCelula < passagem }));
      celulas.push({ dia, eventos: marcados, passou: dataCelula < passagem });
    }
    while (celulas.length % 7 !== 0) celulas.push({ dia: null });
    return celulas;
  }

  // Barra de navegação: ◀ título ▶ + "hoje"
  function construirNavegacao(ano, mes, limites, reRender) {
    const barra = document.createElement('div');
    barra.className = 'nav-mes';

    const anterior = document.createElement('button');
    anterior.className = 'seta-mes';
    anterior.type = 'button';
    anterior.textContent = '◀';
    anterior.setAttribute('aria-label', 'Mês anterior');
    if (limites.min !== null && ano * 12 + mes - 1 < limites.min) anterior.disabled = true;
    anterior.addEventListener('click', () => reRender(ano, mes - 1));

    const titulo = document.createElement('span');
    titulo.className = 'titulo-mes';
    titulo.textContent = `${MESES[mes]} de ${ano}`;

    const proximo = document.createElement('button');
    proximo.className = 'seta-mes';
    proximo.type = 'button';
    proximo.textContent = '▶';
    proximo.setAttribute('aria-label', 'Mês próximo');
    if (limites.max !== null && ano * 12 + mes + 1 > limites.max) proximo.disabled = true;
    proximo.addEventListener('click', () => reRender(ano, mes + 1));

    const h = new Date();
    const noMesCorrente = ano === h.getFullYear() && mes === h.getMonth();

    const hojeBtn = document.createElement('button');
    hojeBtn.className = 'hoje-mes';
    hojeBtn.type = 'button';
    hojeBtn.textContent = 'hoje';
    hojeBtn.hidden = noMesCorrente;
    hojeBtn.addEventListener('click', () => reRender(h.getFullYear(), h.getMonth()));

    barra.appendChild(anterior);
    barra.appendChild(titulo);
    barra.appendChild(proximo);
    barra.appendChild(hojeBtn);
    return barra;
  }

  function construir(alvo, conjunto, ano, mes) {
    if (!alvo) return;
    const eventos = CONJUNTOS[conjunto] || [];
    const limites = intervaloMeses(eventos);
    const h = new Date();
    const tituloMes = `${MESES[mes]} de ${ano}`;

    alvo.replaceChildren();

    alvo.appendChild(construirNavegacao(ano, mes, limites, (novoAno, novoMes) => {
      // normaliza mês fora do intervalo (p. ex. 0-1 → dez/2025)
      const dataNorm = new Date(novoAno, novoMes, 1);
      let chave = dataNorm.getFullYear() * 12 + dataNorm.getMonth();
      if (limites.min !== null && chave < limites.min) chave = limites.min;
      if (limites.max !== null && chave > limites.max) chave = limites.max;
      construir(alvo, conjunto, Math.floor(chave / 12), chave % 12);
    }));

    const passar = hoje();

    const tabela = document.createElement('table');
    tabela.className = 'grade-calendario';

    const caption = document.createElement('caption');
    caption.textContent =
      `${tituloMes} — ${conjunto === 'feriados' ? 'feriados oficiais do Paraná (2026)' : 'calendário da turma (fictício)'}`;
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
    const celulas = construirCelulas(ano, mes, eventos);
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
        if (celula.passou) td.classList.add('passado');
        if (celula.dia === h.getDate() && mes === h.getMonth() && ano === h.getFullYear()) {
          td.classList.add('hoje');
        }
        const numero = document.createElement('span');
        numero.className = 'dia-num';
        numero.textContent = String(celula.dia);
        td.appendChild(numero);
        for (const ev of celula.eventos) {
          const marca = document.createElement('span');
          marca.className = `ev ev-${ev.tipo}` + (ev.passou ? ' ev-passado' : '');
          marca.title = (ev.passou ? 'Já passou — ' : '') + ev.titulo;
          marca.textContent = (ev.passou ? '✓ ' : '') + ev.titulo;
          td.appendChild(marca);
        }
      }
      linha.appendChild(td);
    });
    tabela.appendChild(tbody);

    alvo.appendChild(tabela);
  }

  // Marca cartões estáticos com data-feriado="2026-…" como "Já passou".
  function marcarCartoesPassados() {
    const passagem = hoje();
    document.querySelectorAll('[data-feriado]').forEach((cartao) => {
      const { ano, mes, dia } = quebrarData(cartao.getAttribute('data-feriado'));
      const data = new Date(ano, mes, dia);
      if (data < passagem && !cartao.classList.contains('passado')) {
        cartao.classList.add('passado');
        const selo = document.createElement('span');
        selo.className = 'selo selo--facultativo selo--passado';
        selo.textContent = 'Já passou';
        cartao.appendChild(selo);
      }
    });
  }

  // Uma instância por elemento com data-calendario (inicia no mês corrente).
  document.querySelectorAll('[data-calendario]').forEach((alvo) => {
    const h = new Date();
    construir(alvo, alvo.getAttribute('data-calendario'), h.getFullYear(), h.getMonth());
  });

  document.addEventListener('DOMContentLoaded', marcarCartoesPassados);
})();
