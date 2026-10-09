/* ===== Panta · Revenda para Podólogas ===== */

// TODO: trocar pelo WhatsApp comercial da Panta (DDI + DDD + número, só dígitos)
const WHATSAPP = '5500000000000';
const MARGEM = 0.40;

const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const brl2 = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const waLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

/* ---------- Menu mobile ---------- */
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', open);
});
nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
  nav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
}));

/* ---------- WhatsApp flutuante ---------- */
document.getElementById('whatsFloat').href = waLink('Olá! Sou podóloga e quero saber mais sobre a revenda Panta.');
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Simulador ---------- */
const simAtend = document.getElementById('simAtend');
const simConv = document.getElementById('simConv');
const simTicket = document.getElementById('simTicket');
const chips = document.querySelectorAll('.chip');
let ticketExato = null; // preço exato quando um produto é escolhido

function fill(range) {
  const pct = ((range.value - range.min) / (range.max - range.min)) * 100;
  range.style.setProperty('--fill', pct + '%');
}

function simular() {
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
}

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
grid.innerHTML = PRODUTOS.map((p) => `
  <article class="product" data-tipo="${p.tipo}">
    <div class="product__img"><img src="assets/img/${p.img}" alt="${p.nome}" loading="lazy"></div>
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

/* ---------- Quiz de cadastro (multi-etapas) ---------- */
const quiz = document.getElementById('quiz');
const screens = [...quiz.querySelectorAll('.quiz__screen')];
const footer = document.getElementById('quizFooter');
const bar = document.getElementById('quizBar');
const TOTAL = 6;
let step = 0;

function go(n) {
  step = n;
  screens.forEach((s) => s.classList.toggle('is-active', +s.dataset.step === n));
  footer.hidden = n < 1 || n > TOTAL;
  bar.style.width = (Math.min(n, TOTAL) / TOTAL) * 100 + '%';
  if (n >= 1) quiz.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

quiz.querySelector('[data-next]').addEventListener('click', () => go(1));
quiz.querySelector('[data-prev]').addEventListener('click', () => go(Math.max(step - 1, 1)));

// Ao escolher uma opção, avança automaticamente
quiz.querySelectorAll('.option input').forEach((input) => input.addEventListener('change', () => {
  setTimeout(() => go(step + 1), 280);
}));

// Máscara simples de telefone
const tel = quiz.elements.whatsapp;
tel.addEventListener('input', () => {
  const d = tel.value.replace(/\D/g, '').slice(0, 11);
  tel.value = d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
    : d.length > 6 ? d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    : d.length > 2 ? d.replace(/(\d{2})(\d{0,5})/, '($1) $2')
    : d;
});

quiz.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = quiz.elements;
  const obrigatorios = [f.nome, f.whatsapp, f.cidade, f.uf];
  let ok = true;
  obrigatorios.forEach((el) => {
    const valido = el === f.whatsapp ? el.value.replace(/\D/g, '').length >= 10 : el.value.trim() !== '';
    el.classList.toggle('is-invalid', !valido);
    if (!valido) ok = false;
  });
  document.getElementById('quizError').hidden = ok;
  if (!ok) return;

  const msg = [
    'Olá! Quero ser revendedora Panta 🧡',
    '',
    `*Nome:* ${f.nome.value.trim()}`,
    `*WhatsApp:* ${f.whatsapp.value}`,
    `*Cidade:* ${f.cidade.value.trim()}/${f.uf.value.trim().toUpperCase()}`,
    f.email.value.trim() ? `*E-mail:* ${f.email.value.trim()}` : null,
    '',
    `*Tempo de atuação:* ${f.tempo.value || '-'}`,
    `*Onde atendo:* ${f.local.value || '-'}`,
    `*Atendimentos/semana:* ${f.atendimentos.value || '-'}`,
    `*Já vendo produtos:* ${f.vende.value || '-'}`,
    `*Objetivo:* ${f.objetivo.value || '-'}`,
  ].filter((l) => l !== null).join('\n');

  // TODO: se quiser guardar os leads, enviar também para uma planilha/CRM aqui (ex.: Google Apps Script, RD Station)
  const link = waLink(msg);
  document.getElementById('quizWhats').href = link;
  go(TOTAL + 1);
  window.open(link, '_blank', 'noopener');
});

/* ---------- Animação ao rolar ---------- */
const revealEls = document.querySelectorAll('.section h2, .section__lead, .compare__col, .steps li, .protocol, .benefit, .testimonial, .material, .example');
revealEls.forEach((el) => el.classList.add('reveal'));
const io = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
}), { threshold: 0.12 });
revealEls.forEach((el) => io.observe(el));
