const QUESTIONS_PATH = 'data/questions.json';
const KB_PATH = 'data/knowledgeBase.json';

let questions = [];
let kb = {};
let answers = {}; // {qId: optionId}
let currentIndex = 0;
const OS_LIST = ['windows', 'linux', 'macos', 'android'];

async function init() {
  questions = await fetchJson(QUESTIONS_PATH);
  kb = await fetchJson(KB_PATH);
  setupEventListeners();
  showIntro();
}

async function fetchJson(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error('Falha ao carregar ' + path);
  return await r.json();
}

/* UI elements */
const elIntro = document.getElementById('screen-intro');
const elQuestion = document.getElementById('screen-question');
const elResult = document.getElementById('screen-result');
const btnStart = document.getElementById('btn-start');
const qTitle = document.getElementById('q-title');
const qCount = document.getElementById('q-count');
const optionsArea = document.getElementById('options-area');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const progressBar = document.getElementById('progress-bar');
const resultTitle = document.getElementById('result-title');
const resultSummary = document.getElementById('result-summary');
const justificationDiv = document.getElementById('justification');
const btnRestart = document.getElementById('btn-restart');
const btnExport = document.getElementById('btn-export');

function setupEventListeners() {
  btnStart.addEventListener('click', () => {
    answers = {};
    currentIndex = 0;
    showQuestionScreen();
    renderQuestion();
  });

  btnPrev.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderQuestion();
    }
  });

  btnNext.addEventListener('click', () => {
    const q = questions[currentIndex];
    const selected = optionsArea.querySelector('.option-selected');
    if (!selected) {
      alert('Selecione uma opção para prosseguir.');
      return;
    }
    answers[q.id] = selected.dataset.optionId;
    if (currentIndex < questions.length - 1) {
      currentIndex++;
      renderQuestion();
    } else {
      showResultScreen();
      computeAndShowResult();
    }
  });

  btnRestart.addEventListener('click', () => {
    answers = {};
    currentIndex = 0;
    showQuestionScreen();
    renderQuestion();
  });

  btnExport.addEventListener('click', exportPdf);
}

function showIntro() {
  elIntro.classList.remove('d-none');
  elQuestion.classList.add('d-none');
  elResult.classList.add('d-none');
}

function showQuestionScreen() {
  elIntro.classList.add('d-none');
  elQuestion.classList.remove('d-none');
  elResult.classList.add('d-none');
}

function showResultScreen() {
  elIntro.classList.add('d-none');
  elQuestion.classList.add('d-none');
  elResult.classList.remove('d-none');
}

function renderQuestion() {
  const q = questions[currentIndex];
  qTitle.textContent = q.text;
  qCount.textContent = `${currentIndex + 1}/${questions.length}`;
  const pct = Math.round((currentIndex / questions.length) * 100);
  progressBar.style.width = pct + '%';

  optionsArea.innerHTML = '';
  q.options.forEach(opt => {
    const div = document.createElement('div');
    div.className = 'card mb-2 option-card';
    div.innerHTML = `<div class="card-body d-flex justify-content-between align-items-center">
      <div>${opt.text}</div>
    </div>`;
    div.dataset.optionId = opt.id;
    if (answers[q.id] === opt.id) div.classList.add('option-selected');

    div.addEventListener('click', () => {
      optionsArea.querySelectorAll('.option-card').forEach(c => c.classList.remove('option-selected'));
      div.classList.add('option-selected');
    });

    optionsArea.appendChild(div);
  });

  btnPrev.style.visibility = currentIndex === 0 ? 'hidden' : 'visible';
  btnNext.textContent = currentIndex === questions.length - 1 ? 'Finalizar' : 'Próxima';
}

function calculateScores() {
  const totals = { windows: 0, linux: 0, macos: 0, android: 0 };
  for (const q of questions) {
    const chosenId = answers[q.id];
    if (!chosenId) continue;
    const opt = q.options.find(o => o.id === chosenId);
    if (!opt) continue;
    for (const os of OS_LIST) {
      totals[os] += (opt.impact[os] || 0);
    }
  }
  return totals;
}

function computeAndShowResult() {
  const totals = calculateScores();
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const winner = entries[0][0];
  const second = entries[1][0];
  const topScore = entries[0][1];
  const secondScore = entries[1][1];

  const diff = topScore - secondScore;
  const confidence = diff >= 3 ? 'Alta' : diff >= 1 ? 'Média' : 'Baixa';

  resultTitle.innerHTML = `<strong>Recomendação: ${capitalize(winner)}</strong>`;
  resultSummary.textContent = `Confiança da recomendação: ${confidence}. Pontuação: ${topScore} (vencedor) — diferença para o segundo: ${diff}.`;

  const just = buildJustification(winner, totals, answers);
  justificationDiv.innerHTML = just.html;

  drawChart(totals);
}

/* === SEÇÃO DE JUSTIFICATIVA DETALHADA === */
function buildJustification(winner, totals, answers) {
  const data = kb[winner] || {};
  const reasons = [];

  for (const q of questions) {
    const chosenId = answers[q.id];
    if (!chosenId) continue;
    const opt = q.options.find(o => o.id === chosenId);
    if (!opt) continue;
    const impact = opt.impact[winner] || 0;
    if (impact > 0) {
      reasons.push(`"${q.text}" → ${opt.text} (impacto +${impact})`);
    }
  }

  // Gera tabela comparativa detalhada
  const tableRows = OS_LIST.map(os => `
    <tr>
      <th>${icon(os)} ${capitalize(os)}</th>
      <td>${kb[os].architecture}</td>
      <td>${kb[os].security}</td>
      <td>${kb[os].useCases}</td>
    </tr>
  `).join("");

  // Gera conclusão automática
  const conclusions = {
    windows: "O Windows se destaca por sua ampla compatibilidade e suporte a software comercial e jogos, oferecendo um equilíbrio entre desempenho e usabilidade.",
    linux: "O Linux se sobressai pela liberdade de customização, segurança e eficiência, sendo ideal para desenvolvedores e servidores.",
    macos: "O macOS apresenta estabilidade, segurança e integração impecável com o ecossistema Apple, ideal para produtividade e design.",
    android: "O Android prioriza mobilidade, flexibilidade e integração com serviços Google, sendo perfeito para uso em dispositivos móveis."
  };
  const conclusionText = conclusions[winner] || "";

  const htmlParts = [];
  htmlParts.push(`<p><strong>Resumo:</strong> O ${capitalize(winner)} foi identificado como o sistema mais compatível com suas prioridades.</p>`);
  htmlParts.push(`<p><strong>Respostas que favoreceram ${capitalize(winner)}:</strong></p>`);
  htmlParts.push('<ul>');
  if (reasons.length === 0)
    htmlParts.push('<li>Não houve impacto decisivo em uma única direção — análise equilibrada.</li>');
  else reasons.forEach(r => htmlParts.push(`<li>${r}</li>`));
  htmlParts.push('</ul>');

  htmlParts.push(`<h5 class="mt-4">🔍 Comparativo Técnico Detalhado</h5>
  <p>O quadro abaixo compara os principais aspectos técnicos de cada sistema operacional, considerando arquitetura, segurança e adequação de uso:</p>
  <div class="table-responsive">
  <table class="table table-bordered small align-middle">
    <thead class="table-light">
      <tr>
        <th>Sistema</th>
        <th>Arquitetura do Kernel</th>
        <th>Modelo de Segurança</th>
        <th>Principais Casos de Uso</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
  </div>`);

  htmlParts.push(`<p><strong>Conclusão:</strong> ${conclusionText}</p>`);
  htmlParts.push(`<p class="text-muted small">
    Fontes: Trabalhos acadêmicos do grupo sobre Windows e Linux, documentação oficial dos sistemas, e comparações técnicas.
  </p>`);

  htmlParts.push('<h6 class="mt-3">Pontuações Finais</h6>');
  htmlParts.push('<dl>');
  for (const os of OS_LIST) {
    htmlParts.push(`<dt>${capitalize(os)}</dt><dd>${totals[os]}</dd>`);
  }
  htmlParts.push('</dl>');

  return { html: htmlParts.join('\n') };
}

/* === FUNÇÕES AUXILIARES === */

function drawChart(totals) {
  const ctx = document.getElementById('score-chart').getContext('2d');
  if (window._soChart) window._soChart.destroy();
  window._soChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: OS_LIST.map(capitalize),
      datasets: [{
        label: 'Pontuação',
        data: OS_LIST.map(k => totals[k]),
        borderRadius: 6,
        barThickness: 28
      }]
    },
    options: {
      indexAxis: 'y',
      scales: { x: { beginAtZero: true } },
      plugins: { legend: { display: false } }
    }
  });
}

function exportPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const title = document.getElementById('result-title').innerText;
  const summary = document.getElementById('result-summary').innerText;
  const justHtml = justificationDiv.innerText;

  doc.setFontSize(16);
  doc.text(title, 40, 60);
  doc.setFontSize(11);
  doc.text(summary, 40, 90);
  doc.setFontSize(10);
  const split = doc.splitTextToSize(justHtml, 520);
  doc.text(split, 40, 120);
  doc.save('justificativa_so.pdf');
}

function icon(os) {
  switch (os) {
    case 'windows': return '🪟';
    case 'linux': return '🐧';
    case 'macos': return '🍎';
    case 'android': return '🤖';
    default: return '';
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* === INICIALIZA === */
init().catch(err => {
  console.error(err);
  alert('Erro ao iniciar a aplicação. Verifique se os arquivos JSON estão na pasta "data" e abra via http(s) (não via file:// se o navegador bloquear fetch).');
});
