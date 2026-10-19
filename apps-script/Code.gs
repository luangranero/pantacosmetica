/**
 * Recebe os cadastros do site Panta e grava na planilha.
 * O contato chega primeiro (status "Só contato"); quando a pessoa termina o quiz,
 * a mesma linha é completada com as respostas (status "Completo").
 *
 * O cabeçalho é criado automaticamente na linha 1 da primeira aba (A até M):
 * Data/hora | Nome | WhatsApp | Cidade | UF | Tempo de atuação | Onde atende |
 * Atendimentos/semana | Já vende produtos | Objetivo | Página | Status | ID
 *
 * Como instalar:
 * 1. Na planilha → Extensões → Apps Script
 * 2. Apague o conteúdo e cole este arquivo inteiro → Salvar
 * 3. Implantar → Nova implantação → tipo "App da Web"
 *    - Executar como: Eu
 *    - Quem pode acessar: Qualquer pessoa
 * 4. Autorize e copie a URL que termina em /exec
 * 5. Cole a URL em SHEETS_URL no arquivo js/main.js do site
 * (Ao alterar este código depois: Implantar → Gerenciar implantações → lápis → Versão: Nova versão)
 */

const CAMPOS = ['nome', 'whatsapp', 'cidade', 'uf', 'tempo', 'local', 'atendimentos', 'vende', 'objetivo', 'pagina', 'status', 'id'];
const COL_ID = CAMPOS.length + 1; // +1 pela coluna Data/hora
const CABECALHO = ['Data/hora', 'Nome', 'WhatsApp', 'Cidade', 'UF', 'Tempo de atuação', 'Onde atende',
  'Atendimentos/semana', 'Já vende produtos', 'Objetivo', 'Página', 'Status', 'ID'];

// Garante o cabeçalho na linha 1 (cria se a planilha estiver vazia ou se a linha 1 tiver dados)
function garantirCabecalho(sheet) {
  if (sheet.getLastRow() > 0 && sheet.getRange(1, 1).getValue() === CABECALHO[0]) return;
  if (sheet.getLastRow() > 0) sheet.insertRowBefore(1);
  sheet.getRange(1, 1, 1, CABECALHO.length).setValues([CABECALHO]).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

// Grava ou completa a linha do cadastro (mesmo ID = mesma linha)
function salvar(p) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    garantirCabecalho(sheet);
    const linhaExistente = p.id ? encontrarLinha(sheet, p.id) : 0;

    if (!linhaExistente) {
      // Prefixo ' mantém WhatsApp e demais campos como texto (sem virar número ou data)
      sheet.appendRow([new Date()].concat(CAMPOS.map((c) => "'" + String(p[c] || '').slice(0, 200))));
      return;
    }

    // Linha já existe: só sobrescreve campos que vieram preenchidos,
    // e nunca rebaixa um cadastro "Completo" para "Só contato" (envios duplicados ou atrasados)
    const range = sheet.getRange(linhaExistente, 2, 1, CAMPOS.length);
    const atuais = range.getValues()[0];
    const novos = CAMPOS.map((c, i) => {
      const valor = String(p[c] || '').slice(0, 200);
      if (!valor) return atuais[i] === '' ? '' : "'" + atuais[i];
      if (c === 'status' && atuais[i] === 'Completo' && valor !== 'Completo') return "'" + atuais[i];
      return "'" + valor;
    });
    range.setValues([novos]);
  } finally {
    lock.releaseLock();
  }
}

function encontrarLinha(sheet, id) {
  const ultima = sheet.getLastRow();
  if (ultima < 2) return 0;
  const ids = sheet.getRange(2, COL_ID, ultima - 1, 1).getValues();
  for (let i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]) === String(id)) return i + 2;
  }
  return 0;
}

const json = (obj) => ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);

// O site envia por POST e, de reserva, por GET (os dois caem na mesma linha pelo ID)
function doPost(e) {
  salvar(e.parameter || {});
  return json({ ok: true });
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.id) { salvar(p); return json({ ok: true }); }
  // Diagnóstico: ?check=<ID> responde se o cadastro está na planilha (sem expor dados)
  if (p.check) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    return json({ found: encontrarLinha(sheet, p.check) > 0 });
  }
  return ContentService.createTextOutput('Panta · endpoint de cadastros ativo · v3 (POST + GET, sem rebaixar status)');
}
