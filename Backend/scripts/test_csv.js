const fs = require('fs');

function parseCSVFull(text) {
  const rows = [];
  let currentField = '';
  let currentFields = [];
  let inQuote = false;
  
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      // Check if it's an escaped quote ""
      if (inQuote && text[i+1] === '"') {
        currentField += '"';
        i++; // skip next quote
      } else {
        inQuote = !inQuote;
      }
    } else if (ch === ',' && !inQuote) {
      currentFields.push(currentField.trim());
      currentField = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuote) {
      if (ch === '\r' && text[i+1] === '\n') {
        i++; // skip \n
      }
      currentFields.push(currentField.trim());
      rows.push(currentFields);
      currentFields = [];
      currentField = '';
    } else {
      currentField += ch;
    }
  }
  if (currentField || currentFields.length > 0) {
    currentFields.push(currentField.trim());
    rows.push(currentFields);
  }
  return rows;
}

const csvRaw = fs.readFileSync('data/pagina revlon kenzo - Hoja2.csv', 'utf8');
const rows = parseCSVFull(csvRaw);

let headerRowIdx = -1;
for (let i = 0; i < rows.length; i++) {
  if (rows[i][0] === 'Codigo') { headerRowIdx = i; break; }
}

const headers = rows[headerRowIdx];
const COL = {};
headers.forEach((h, i) => { COL[h.trim()] = i; });

const dataRows = [];
for (let i = headerRowIdx + 1; i < rows.length; i++) {
  const fields = rows[i];
  if (fields.length < 2) continue;
  
  const codigo = fields[COL['Codigo']] || '';
  const descripcion = fields[COL['Descripcion']] || '';
  const descCompleta = fields[COL['Costo2']] || '';
  
  if (descripcion.startsWith('REVLON AGE DEFYING 3X FUNDATION SPF 25 010')) {
    console.log('Found REVLON AGE DEFYING:');
    console.log('Codigo:', codigo);
    console.log('Desc:', descripcion);
    console.log('Desc Completa:', descCompleta.substring(0, 50) + '...');
  }
}
console.log('Total rows parsed:', rows.length);
