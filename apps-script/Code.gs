/**
 * Recebe os cadastros do site Panta e grava na planilha.
 * O contato chega primeiro (status "Só contato"); quando a pessoa termina o quiz,
 * a mesma linha é completada com as respostas (status "Completo").
 *
 * Cabeçalho esperado na linha 1 da primeira aba (A até N):
 * Data/hora | Nome | WhatsApp | Cidade | UF | E-mail | Tempo de atuação | Onde atende |
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
 * (Ao alterar este código depois: Implantar → Gerenciar implantações → editar → Nova versão)
 */

const CAMPOS = ['nome', 'whatsapp', 'cidade', 'uf', 'email', 'tempo', 'local', 'atendimentos', 'vende', 'objetivo', 'pagina', 'status', 'id'];
const COL_ID = CAMPOS.length + 1; // +1 pela coluna Data/hora

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = e.parameter || {};
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    // Prefixo ' mantém WhatsApp e demais campos como texto (sem virar número ou data)
    const valores = CAMPOS.map((c) => "'" + String(p[c] || '').slice(0, 200));

    const linhaExistente = p.id ? encontrarLinha(sheet, p.id) : 0;
    if (linhaExistente) {
      sheet.getRange(linhaExistente, 2, 1, CAMPOS.length).setValues([valores]);
    } else {
      sheet.appendRow([new Date()].concat(valores));
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
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

function doGet() {
  return ContentService.createTextOutput('Panta · endpoint de cadastros ativo');
}
