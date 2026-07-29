const ExcelJS = require('exceljs');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const EXCEL_PATH = path.join(__dirname, '..', '..', 'Frontend', 'Exportacion_Marybe_2026-07-10 (5) (1).xlsx');
const DB_PATH = path.join(__dirname, '..', '.tmp', 'data.db');

async function run() {
  console.log(`Leyendo Excel: ${EXCEL_PATH}`);
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error('El archivo Excel no existe.');
    return;
  }
  if (!fs.existsSync(DB_PATH)) {
    console.error(`La base de datos no existe en: ${DB_PATH}`);
    return;
  }

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(EXCEL_PATH);

  const wsP = wb.getWorksheet('📦 Productos');
  if (!wsP) {
    console.error('No se encontró la hoja de Productos');
    return;
  }

  const wsV = wb.getWorksheet('🔗 Variantes');
  
  const excelProductos = new Map();
  const excelVariantes = new Map(); // padre_id -> [variantes]

  // Helper
  const cellVal = (row, colIndex) => {
    const cell = row.getCell(colIndex);
    if (!cell) return '';
    if (cell.value && cell.value.formula) return cell.result !== undefined ? cell.result : '';
    if (cell.value && typeof cell.value === 'object' && !cell.value.richText) return '';
    if (cell.value && cell.value.richText) return cell.value.richText.map(rt => rt.text).join('').trim();
    return String(cell.value).trim();
  };

  const parseDecimal = (val) => {
    if (!val) return null;
    if (typeof val === 'number') return val;
    let str = val.toString().trim();
    if (str.includes(',')) str = str.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(str);
    return isNaN(num) ? null : num;
  };

  // Leer productos
  wsP.eachRow((row, rowNum) => {
    if (rowNum <= 3) return; // headers
    const id_original = cellVal(row, 1);
    if (!id_original || id_original.startsWith('═')) return;

    excelProductos.set(id_original, {
      id_original,
      nombre: cellVal(row, 3),
      precio: parseDecimal(cellVal(row, 16)) || 0,
      precio_oferta: parseDecimal(cellVal(row, 17)) || 0,
    });
  });

  // Leer variantes
  if (wsV) {
    wsV.eachRow((row, rowNum) => {
      if (rowNum <= 3) return;
      const id_original = cellVal(row, 1);
      const padre_id = cellVal(row, 2);
      if (!id_original || id_original.startsWith('═')) return;

      if (!excelVariantes.has(padre_id)) {
        excelVariantes.set(padre_id, []);
      }
      excelVariantes.get(padre_id).push({
        id_original,
        volumen: cellVal(row, 5),
        color_nombre: cellVal(row, 12),
        precio: parseDecimal(cellVal(row, 7)) || 0,
        precio_oferta: parseDecimal(cellVal(row, 8)) || 0,
      });
    });
  }

  console.log(`Se encontraron ${excelProductos.size} productos y ${[...excelVariantes.values()].flat().length} variantes en el Excel.`);
  console.log('Consultando Base de Datos SQLite...');

  const db = new Database(DB_PATH, { readonly: true });

  const getDBProductos = () => {
    return db.prepare(`SELECT id, document_id, id_original, nombre, precio, precio_oferta FROM productos`).all();
  };

  const getDBVariantes = (productoId) => {
    return db.prepare(`
      SELECT v.id_original, v.volumen, v.color_nombre, v.precio, v.precio_oferta 
      FROM components_producto_variantes v
      JOIN productos_cmps pvl ON v.id = pvl.cmp_id
      WHERE pvl.entity_id = ? AND pvl.field = 'variantes'
    `).all(productoId);
  };

  const dbProductos = getDBProductos();
  console.log(`Se encontraron ${dbProductos.length} productos en la Base de Datos.\n`);

  const discrepancias = [];
  const noEstanEnDB = [];

  for (const ep of excelProductos.values()) {
    const dbP = dbProductos.find(p => String(p.id_original) === String(ep.id_original));
    
    if (!dbP) {
      noEstanEnDB.push(ep);
      continue;
    }

    const dbVars = getDBVariantes(dbP.id);
    const exVars = excelVariantes.get(ep.id_original) || [];

    // Comparar Padre
    if (ep.precio !== (dbP.precio || 0) || ep.precio_oferta !== (dbP.precio_oferta || 0)) {
      discrepancias.push({
        tipo: 'PADRE',
        id_original: ep.id_original,
        nombre: ep.nombre,
        excel_precio: ep.precio,
        db_precio: dbP.precio || 0,
      });
    }

    // Comparar Variantes
    for (const ev of exVars) {
      const dbV = dbVars.find(v => String(v.id_original) === String(ev.id_original));
      if (!dbV) {
        discrepancias.push({
          tipo: 'VARIANTE_FALTA_EN_DB',
          padre_nombre: ep.nombre,
          id_original: ev.id_original,
        });
        continue;
      }
      if (ev.precio !== (dbV.precio || 0) || ev.precio_oferta !== (dbV.precio_oferta || 0)) {
        discrepancias.push({
          tipo: 'VARIANTE_PRECIO',
          padre_nombre: ep.nombre,
          id_original: ev.id_original,
          volumen: ev.volumen,
          color: ev.color_nombre,
          excel_precio: ev.precio,
          db_precio: dbV.precio || 0,
        });
      }
    }
    
    // Variantes en DB que no están en Excel
    for (const dbV of dbVars) {
      const exV = exVars.find(v => String(v.id_original) === String(dbV.id_original));
      if (!exV) {
        discrepancias.push({
          tipo: 'VARIANTE_SOBRA_EN_DB',
          padre_nombre: ep.nombre,
          id_original: dbV.id_original,
          volumen: dbV.volumen,
          precio: dbV.precio,
        });
      }
    }
  }

  db.close();

  const outPath = path.join(__dirname, 'diagnostico_resultado.txt');
  const out = fs.createWriteStream(outPath);
  const log = (msg) => {
    console.log(msg);
    out.write(msg + '\\n');
  };

  log('================ RESUMEN DE DIAGNÓSTICO ================');
  log(`Productos en Excel que NO existen en DB: ${noEstanEnDB.length}`);
  log(`Discrepancias encontradas: ${discrepancias.length}\\n`);

  if (discrepancias.length > 0) {
    log('--- DETALLE DE DISCREPANCIAS ---');
    for (let i=0; i<discrepancias.length; i++) {
      const d = discrepancias[i];
      if (d.tipo === 'PADRE') {
        log(`[PADRE ID: ${d.id_original}] ${d.nombre} -> Precio Excel: $${d.excel_precio} | Precio DB: $${d.db_precio}`);
      } else if (d.tipo === 'VARIANTE_PRECIO') {
        log(`[VARIANTE ID: ${d.id_original}] de ${d.padre_nombre} (${d.volumen || d.color}) -> Precio Excel: $${d.excel_precio} | Precio DB: $${d.db_precio}`);
      } else if (d.tipo === 'VARIANTE_FALTA_EN_DB') {
        log(`[FALTA EN DB] Variante ID: ${d.id_original} de ${d.padre_nombre} está en el Excel pero NO en la DB.`);
      } else if (d.tipo === 'VARIANTE_SOBRA_EN_DB') {
        log(`[SOBRA EN DB] Variante ID: ${d.id_original} de ${d.padre_nombre} está en la DB pero NO en el Excel.`);
      }
    }
  }
  
  out.end();
  console.log(`\nEl detalle completo se ha guardado en: ${outPath}`);

}

run().catch(console.error);
