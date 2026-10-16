/* ===== Panta · Revenda para Podólogas ===== */
/* Usado em 3 páginas: / (home), /formulario/ (etapas 2 a 6) e /obrigado/ */

// WhatsApp comercial da Panta: (11) 93902-0616 (DDI + DDD + número, só dígitos)
const WHATSAPP = '5511939020616';
const MARGEM = 0.40;
// URL do App da Web do Google Apps Script (apps-script/Code.gs) que grava os cadastros na planilha
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzQjREEJ3eC1aqFTBrnjigVwrnvdprJJtvQGxlJABBU5CVNKcQ5RERaVbNzrl11FaUw/exec';

const PAGE = document.body.dataset.page || 'home';
const BASE = document.body.dataset.base || ''; // prefixo de caminho nas subpáginas ("../")

const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const brl2 = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const waLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

/* ---------- Lead entre páginas (sessão do navegador) ---------- */
const LEAD_KEY = 'pantaLead';
function lerLead() {
  try { return JSON.parse(sessionStorage.getItem(LEAD_KEY)) || null; } catch (e) { return null; }
}
function guardarLead(lead) {
  try { sessionStorage.setItem(LEAD_KEY, JSON.stringify(lead)); } catch (e) { /* sem sessão: segue sem guardar */ }
}
const novoId = (prefixo = '') => prefixo + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Envia o cadastro para o Google Sheets sem segurar a navegação
function salvarNaPlanilha(dados) {
  if (!SHEETS_URL) return;
  const body = new URLSearchParams(dados);
  if (navigator.sendBeacon && navigator.sendBeacon(SHEETS_URL, body)) return;
  fetch(SHEETS_URL, { method: 'POST', mode: 'no-cors', keepalive: true, body }).catch(() => {});
}

// Máscara simples de telefone
function mascaraTelefone(tel) {
  tel.addEventListener('input', () => {
    const d = tel.value.replace(/\D/g, '').slice(0, 11);
    tel.value = d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
      : d.length > 6 ? d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
      : d.length > 2 ? d.replace(/(\d{2})(\d{0,5})/, '($1) $2')
      : d;
  });
}

// Valida nome, WhatsApp, cidade e UF de um formulário; marca os campos inválidos
function contatoValido(f, erroEl) {
  let ok = true;
  [f.nome, f.whatsapp, f.cidade, f.uf].forEach((el) => {
    const valido = el === f.whatsapp ? el.value.replace(/\D/g, '').length >= 10 : el.value.trim() !== '';
    el.classList.toggle('is-invalid', !valido);
    if (!valido) ok = false;
  });
  erroEl.hidden = ok;
  return ok;
}

const primeiroNome = (nome) => (nome || '').trim().split(/\s+/)[0];
document.querySelectorAll('#leadNome').forEach((el) => {
  const lead = lerLead();
  if (lead && lead.nome) el.textContent = primeiroNome(lead.nome);
});

/* ---------- Menu mobile ---------- */
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
if (nav && navToggle) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));
}

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Simulador ---------- */
const simAtend = document.getElementById('simAtend');
if (simAtend) {
  const simConv = document.getElementById('simConv');
  const simTicket = document.getElementById('simTicket');
  const chips = document.querySelectorAll('.chip');
  let ticketExato = null; // preço exato quando um produto é escolhido

  const fill = (range) => {
    const pct = ((range.value - range.min) / (range.max - range.min)) * 100;
    range.style.setProperty('--fill', pct + '%');
  };

  const simular = () => {
    const atend = +simAtend.value;
    const conv = +simConv.value / 100;
    const ticket = ticketExato ?? +simTicket.value;
    const clientes = Math.round(atend * 4 * conv);
    const vendas = clientes * ticket;
    const lucro = vendas * MARGEM;

    document.getElementById('simAtendOut').textContent = atend;
    document.getElementById('simConvOut').textContent = Math.round(conv * 100) + '%';
    document.getElementById('simTicketOut').textContent = ticketExato ? brl2(ticket) : brl(ticket);
    document.getElementById('simClientes').textContent = clientes;
    document.getElementById('simVendas').textContent = brl(vendas);
    document.getElementById('simLucro').textContent = brl(lucro);
    document.getElementById('simAno').textContent = brl(lucro * 12);
    [simAtend, simConv, simTicket].forEach(fill);
  };

  [simAtend, simConv].forEach((r) => r.addEventListener('input', simular));
  simTicket.addEventListener('input', () => {
    ticketExato = null;
    chips.forEach((c) => c.classList.remove('is-active'));
    simular();
  });
  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    ticketExato = +chip.dataset.ticket;
    simTicket.value = Math.round(ticketExato / 5) * 5;
    simular();
  }));
  simular();
}

/* ---------- Produtos (Linha Podologia · preços Catálogo 2026) ---------- */
const PRODUTOS = [
  { nome: 'NutriUnha', img: 'nutriunha.jpg', tipo: 'home', desc: 'Óleo reparador e fortalecedor. Unhas fracas e quebradiças; auxilia no tratamento de onicomicoses.', preco: 104.90, ref: '30 ml' },
  { nome: 'Rachadex', img: 'rachadex.jpg', tipo: 'home', desc: 'Loção antirrachaduras de ação profunda. Trata e previne rachaduras e calosidades.', preco: 49.90, ref: '38 ml' },
  { nome: 'Panta Creme', img: 'panta-creme.jpg', tipo: 'home', desc: 'Hidratante glicerinado com mel e óleo de amêndoas para pele seca e extrasseca.', preco: 44.90, ref: '120 g' },
  { nome: 'Panta Esfoliante', img: 'esfoliante.jpg', tipo: 'home', desc: 'Esfoliação moderada com semente de damasco e mamona, enriquecido com mel.', preco: 44.90, ref: '120 g' },
  { nome: 'Panta Alívea', img: 'alivea.jpg', tipo: 'home', desc: 'Gel para massagem com Sangue de Dragão, Arnica e mix de ervas. Alivia o cansaço.', preco: 39.90, ref: '200 g' },
  { nome: 'NEOskin Green', img: 'neoskin.jpg', tipo: 'home', desc: 'Restaurador dérmico premium com nanotecnologia. Cicatrização mais rápida.', preco: 74.90, ref: '38 g' },
  { nome: 'Pantaphil', img: 'pantaphil.jpg', tipo: 'pro', desc: 'Loção hipoalergênica sem perfume, 48h de hidratação. Ideal durante procedimentos.', preco: 79.90, ref: '300 ml' },
  { nome: 'Amene Gel', img: 'amene.jpg', tipo: 'pro', desc: 'Gel calmante que reduz inflamação e vermelhidão. Pós-procedimento e espiculaectomia.', preco: 169.90, ref: '500 g' },
  { nome: 'Higienizante Pés e Mãos', img: 'higienizante.jpg', tipo: 'pro', desc: 'Com clorexidina e tecnologia Odorblock. Antes, durante e após o atendimento. Sem enxágue.', preco: 69.90, ref: '500 g' },
  { nome: 'Neutral Clean', img: 'neutral-clean.jpg', tipo: 'pro', desc: 'Sabonete líquido neutro, sem corantes e sem parabenos, com pH compatível com a pele.', preco: 24.90, ref: '300 ml' },
  { nome: 'Panta Óleo', img: 'panta-oleo.jpg', tipo: 'pro', desc: 'Óleo de amêndoas doces que repõe a oleosidade natural e estimula o colágeno.', preco: null, ref: '200 ml' },
];

const grid = document.getElementById('products');
if (grid) {
  grid.innerHTML = PRODUTOS.map((p) => `
    <article class="product" data-tipo="${p.tipo}">
      <div class="product__img"><img src="${BASE}assets/img/${p.img}" alt="${p.nome}" loading="lazy"></div>
      <div class="product__body">
        <span class="tag ${p.tipo === 'home' ? 'tag--home' : 'tag--pro'}">${p.tipo === 'home' ? 'Home care · revenda' : 'Uso profissional'}</span>
        <h3>${p.nome}</h3>
        <p>${p.desc}</p>
        <div class="product__price">
          ${p.preco
            ? `<strong>${brl2(p.preco)} <small>${p.ref}</small></strong><em>lucro ${brl2(p.preco * MARGEM)}</em>`
            : `<strong>${p.ref}</strong><em>consulte</em>`}
        </div>
      </div>
    </article>`).join('');

  document.querySelectorAll('.filter').forEach((btn) => btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const f = btn.dataset.filter;
    grid.querySelectorAll('.product').forEach((el) => { el.hidden = f !== 'all' && el.dataset.tipo !== f; });
  }));
}

/* ---------- Quiz de cadastro ----------
 * Home: tela inicial (0) e contato (1) → grava "Só contato" e vai para /formulario/
 * /formulario/: perguntas (2 a 6) → grava "Completo", abre o WhatsApp e vai para /obrigado/
 */
const quiz = document.getElementById('quiz');
if (quiz) {
  const screens = [...quiz.querySelectorAll('.quiz__screen')];
  const footer = document.getElementById('quizFooter');
  const bar = document.getElementById('quizBar');
  const TOTAL = 6;
  const PRIMEIRA = PAGE === 'formulario' ? 2 : 0;
  let step = PRIMEIRA;

  const go = (n) => {
    step = n;
    screens.forEach((s) => s.classList.toggle('is-active', +s.dataset.step === n));
    footer.hidden = n < 1 || n > TOTAL;
    bar.style.width = (Math.min(n, TOTAL) / TOTAL) * 100 + '%';
    if (n >= 1 && n !== PRIMEIRA) quiz.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  go(step);

  const startBtn = quiz.querySelector('[data-next]');
  if (startBtn) startBtn.addEventListener('click', () => go(1));

  quiz.querySelector('[data-prev]').addEventListener('click', () => {
    if (PAGE === 'formulario' && step <= PRIMEIRA) { location.href = `${BASE}#cadastro`; return; }
    go(Math.max(step - 1, 1));
  });

  // Ao escolher uma opção, avança automaticamente (menos na última etapa, que tem botão de envio)
  quiz.querySelectorAll('.option input').forEach((input) => input.addEventListener('change', () => {
    if (input.closest('[data-final]')) return;
    setTimeout(() => go(step + 1), 280);
  }));

  // Etapa 1 (home): valida o contato, grava o lead e abre /formulario/
  const contatoBtn = document.getElementById('quizContato');
  if (contatoBtn) {
    const f = quiz.elements;
    mascaraTelefone(f.whatsapp);
    contatoBtn.addEventListener('click', () => {
      if (!contatoValido(f, document.getElementById('quizError'))) return;
      const lead = {
        id: novoId(),
        nome: f.nome.value.trim(),
        whatsapp: f.whatsapp.value,
        cidade: f.cidade.value.trim(),
        uf: f.uf.value.trim().toUpperCase(),
      };
      guardarLead(lead);
      salvarNaPlanilha({ ...lead, status: 'Só contato', pagina: location.href });
      location.href = `${BASE}formulario/`;
    });
    // Enter nos campos de contato avança em vez de enviar o formulário
    quiz.querySelectorAll('[data-step="1"] input').forEach((el) => el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); contatoBtn.click(); }
    }));
  }

  // /formulario/ sem contato na sessão: volta para o início do cadastro
  if (PAGE === 'formulario' && !lerLead()) location.replace(`${BASE}#cadastro`);

  // Última etapa (/formulario/): grava tudo, abre o WhatsApp e vai para /obrigado/
  quiz.addEventListener('submit', (e) => {
    e.preventDefault();
    const lead = lerLead();
    if (!lead) { location.href = `${BASE}#cadastro`; return; }
    const f = quiz.elements;
    const respostas = {
      tempo: f.tempo.value,
      local: f.local.value,
      atendimentos: f.atendimentos.value,
      vende: f.vende.value,
      objetivo: f.objetivo.value,
    };
    salvarNaPlanilha({ ...lead, ...respostas, status: 'Completo', pagina: location.href });

    const msg = [
      'Olá! Quero ser revendedora Panta 🧡',
      '',
      `*Nome:* ${lead.nome}`,
      `*WhatsApp:* ${lead.whatsapp}`,
      `*Cidade:* ${lead.cidade}/${lead.uf}`,
      '',
      `*Tempo de atuação:* ${respostas.tempo || '-'}`,
      `*Onde atendo:* ${respostas.local || '-'}`,
      `*Atendimentos/semana:* ${respostas.atendimentos || '-'}`,
      `*Já vendo produtos:* ${respostas.vende || '-'}`,
      `*Objetivo:* ${respostas.objetivo || '-'}`,
    ].join('\n');
    const link = waLink(msg);
    guardarLead({ ...lead, waLink: link });
    window.open(link, '_blank', 'noopener');
    location.href = `${BASE}obrigado/`;
  });
}

/* ---------- /obrigado/ ---------- */
const thanksWhats = document.getElementById('thanksWhats');
if (thanksWhats) {
  const lead = lerLead();
  thanksWhats.href = (lead && lead.waLink) || waLink('Olá! Acabei de fazer meu cadastro de revendedora Panta.');
}

/* ---------- Botão flutuante de WhatsApp (capta o contato antes de abrir a conversa) ---------- */
const whatsFloat = document.getElementById('whatsFloat');
const waModal = document.getElementById('waModal');
const waForm = document.getElementById('waForm');
if (whatsFloat && waModal && waForm) {
  whatsFloat.href = waLink('Olá! Sou podóloga e quero saber mais sobre a revenda Panta.');
  mascaraTelefone(waForm.elements.whatsapp);

  const abrirWaModal = () => {
    // Reaproveita o contato que a pessoa já informou (no quiz desta página ou na sessão)
    const lead = lerLead() || {};
    ['nome', 'whatsapp', 'cidade', 'uf'].forEach((c) => {
      const doQuiz = quiz && quiz.elements[c] ? quiz.elements[c].value : '';
      if (!waForm.elements[c].value) waForm.elements[c].value = doQuiz || lead[c] || '';
    });
    waModal.hidden = false;
    document.body.classList.add('has-modal');
    setTimeout(() => waForm.elements.nome.focus(), 50);
  };
  const fecharWaModal = () => {
    waModal.hidden = true;
    document.body.classList.remove('has-modal');
    whatsFloat.focus();
  };

  whatsFloat.addEventListener('click', (e) => { e.preventDefault(); abrirWaModal(); });
  document.querySelectorAll('[data-wa-open]').forEach((el) => el.addEventListener('click', abrirWaModal));
  waModal.querySelectorAll('[data-wa-close]').forEach((el) => el.addEventListener('click', fecharWaModal));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !waModal.hidden) fecharWaModal(); });

  waForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = waForm.elements;
    if (!contatoValido(f, document.getElementById('waError'))) return;
    const nome = f.nome.value.trim();
    const cidade = `${f.cidade.value.trim()}/${f.uf.value.trim().toUpperCase()}`;
    salvarNaPlanilha({
      id: novoId('wa-'),
      status: 'Botão WhatsApp',
      nome,
      whatsapp: f.whatsapp.value,
      cidade: f.cidade.value.trim(),
      uf: f.uf.value.trim().toUpperCase(),
      pagina: location.href,
    });
    const link = waLink(`Olá! Sou ${nome}, de ${cidade}, e quero saber mais sobre a revenda Panta.`);
    window.open(link, '_blank', 'noopener');
    fecharWaModal();
  });
}

/* ---------- Animação ao rolar ---------- */
const revealEls = document.querySelectorAll('.section h2, .section__lead, .compare__col, .steps li, .protocol, .benefit, .testimonial, .material, .example');
revealEls.forEach((el) => el.classList.add('reveal'));
const io = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
}), { threshold: 0.12 });
revealEls.forEach((el) => io.observe(el));
