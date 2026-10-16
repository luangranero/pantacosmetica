/**
 * Recebe os cadastros do site Panta e grava uma linha por cadastro na planilha.
 *
 * Como instalar:
 * 1. Abra a planilha "Cadastros Revendedoras Panta" → Extensões → Apps Script
 * 2. Apague o conteúdo e cole este arquivo inteiro → Salvar
 * 3. Implantar → Nova implantação → tipo "App da Web"
 *    - Executar como: Eu
 *    - Quem pode acessar: Qualquer pessoa
 * 4. Autorize e copie a URL que termina em /exec
 * 5. Cole a URL em SHEETS_URL no arquivo js/main.js do site
 */

const CAMPOS = ['nome', 'whatsapp', 'cidade', 'uf', 'email', 'tempo', 'local', 'atendimentos', 'vende', 'objetivo', 'pagina'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = e.parameter || {};
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    // Prefixo ' mantém WhatsApp e demais campos como texto (sem virar número ou data)
    const linha = [new Date()].concat(CAMPOS.map((c) => "'" + String(p[c] || '').slice(0, 200)));
    sheet.appendRow(linha);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('Panta · endpoint de cadastros ativo');
}
