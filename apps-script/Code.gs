/**
 * Habit Tracker — Apps Script Web App
 *
 * Substitui a Service Account + API do Sheets. Este script roda com a
 * identidade do Vitor (dono da planilha), então o app web nunca precisa
 * de nenhuma credencial do Google no navegador.
 *
 * Deploy manual (não pode ser feito via CI):
 *   1. Abra a planilha → Extensões → Apps Script.
 *   2. Cole este arquivo como Code.gs.
 *   3. Implantar → Nova implantação → tipo "Aplicativo da web".
 *      - Executar como: Eu (dono da planilha)
 *      - Quem pode acessar: Qualquer pessoa
 *   4. Copie a URL gerada (.../exec) e cole em src/index.html no lugar
 *      de __APPS_SCRIPT_URL__.
 */

const SHEET_NAME = 'entries';

// Ordem das colunas A..V na planilha — não reordenar (compatibilidade
// com linhas históricas). Colunas "aposentadas" (energy/mood/work,
// reading_min/reading_title, fds) continuam existindo na planilha mas
// nada mais escreve nelas.
// exercises_json/meals_json guardam o mesmo dado de exercises/breakfast/
// etc. em formato estruturado (JSON), pro app reconstruir o estado da UI
// ao recarregar a página sem precisar parsear a string legível de volta.
const COLUMNS = [
  'date', 'sleep', 'water', 'weight', 'energy', 'mood', 'work',
  'exercises', 'breakfast', 'lunch', 'dinner', 'ceia', 'supps',
  'reading_min', 'reading_title', 'notes', 'created_at', 'gordura',
  'fds', 'pretreino', 'exercises_json', 'meals_json'
];

function getSheet_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// GET → devolve a aba inteira como {values:[[header...], [linha1...], ...]},
// no mesmo formato que a API do Sheets retornava (facilita o cliente).
function doGet(e) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  return jsonOutput_({ values: values });
}

// POST → upsert por data. Body é um objeto JSON só com os campos que
// mudaram (sempre inclui "date"). Se a data já existe numa linha, só
// as colunas enviadas são sobrescritas — o resto da linha não é tocado.
// Se não existe, cria uma linha nova só com os campos enviados.
function doPost(e) {
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOutput_({ ok: false, error: 'JSON inválido' });
  }

  const date = payload.date;
  if (!date) {
    return jsonOutput_({ ok: false, error: 'date é obrigatório' });
  }

  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  const rowIndex = findRowByDate_(sheet, lastRow, date);

  if (rowIndex === -1) {
    const newRow = COLUMNS.map(key => {
      if (key === 'created_at') return new Date().toISOString();
      return Object.prototype.hasOwnProperty.call(payload, key) ? payload[key] : '';
    });
    sheet.appendRow(newRow);
  } else {
    COLUMNS.forEach((key, idx) => {
      if (key === 'date' || key === 'created_at') return;
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        sheet.getRange(rowIndex, idx + 1).setValue(payload[key]);
      }
    });
  }

  return jsonOutput_({ ok: true });
}

// Retorna o número da linha (1-based, com header) cuja coluna A bate
// com a data, ou -1 se não encontrada.
function findRowByDate_(sheet, lastRow, date) {
  if (lastRow < 2) return -1;
  const dates = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < dates.length; i++) {
    if (dateKey_(dates[i][0]) === date) return i + 2;
  }
  return -1;
}

// A célula da coluna A pode ter sido auto-convertida para Date pelo
// Sheets (comportamento padrão ao gravar um texto "YYYY-MM-DD"), então
// normalizamos para string yyyy-MM-dd antes de comparar.
function dateKey_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(value);
}
