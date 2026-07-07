/**
 * test_export_integrity.js
 * Verifica que el Excel exportado (Productos_RevlonKenzo_Marybe.xlsx)
 * sea consistente con el CSV fuente y las reglas del script de exportacion.
 * Uso: node Backend/scripts/test_export_integrity.js
 */
const ExcelJS = require("exceljs");
const fs      = require("fs");
const path    = require("path");

const CSV_PATH   = path.join(__dirname, "../data/pagina revlon kenzo - Hoja2.csv");
const EXCEL_PATH = path.join(__dirname, "../data/Productos_RevlonKenzo_Marybe.xlsx");

// ─── Utilidades de test ──────────────────────────────────────────────────────
let passed = 0, failed = 0, warned = 0;

function check(name, condition, detail) {
  detail = detail || "";
  const suffix = detail ? " -> " + detail : "";
  if (condition === "WARN") {
    warned++;
    console.log("  [WARN]  " + name + suffix);
  } else if (condition) {
    passed++;
    console.log("  [PASS]  " + name + suffix);
  } else {
    failed++;
    console.log("  [FAIL]  " + name + suffix);
  }
}

function section(title) {
  console.log("\n" + "-".repeat(60));
  console.log("  " + title);
  console.log("-".repeat(60));
}

// ─── CSV helpers ─────────────────────────────────────────────────────────────
function parsePrecio(str) {
  if (!str || str.trim() === "") return null;
  const clean = str.replace(/"/g, "").trim().replace(/\./g, "").replace(",", ".");
  const val = parseFloat(clean);
  return isNaN(val) ? null : val;
}

function extractSize(nombre) {
  if (!nombre) return { base: nombre, size: null };
  const u = nombre.toUpperCase();
  if (u.startsWith("CUTEX ESMALTE DUO PACK "))
    return { base: nombre.substring(0, 22).trim(), size: nombre.substring(22).trim() };
  if (u.startsWith("CUTEX ESMALTE "))
    return { base: nombre.substring(0, 13).trim(), size: nombre.substring(13).trim() };
  if (u.startsWith("REVLON ")) {
    const m = nombre.match(/^(.*?)\s+(\d{1,4})$/);
    if (m) return { base: m[1].trim(), size: m[2].trim() };
  }
  const mX = nombre.match(/^(.*?)\s+X\s+(\d+(?:[.,]\d+)?(?:\s*(?:ml|g|gr|oz|L|l|kg|Ml|ML))?)\s*$/i);
  if (mX) return { base: mX[1].trim(), size: mX[2].trim() };
  const mN = nombre.match(/^(.*?)\s+(\d+(?:[.,]\d+)?\s*(?:ml|g|gr|oz|L|l|kg))\s*$/i);
  if (mN) return { base: mN[1].trim(), size: mN[2].trim() };
  return { base: nombre.trim(), size: null };
}

function parseCSVFull(text) {
  const rows = [];
  let cf = "", cfs = [], inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQ && text[i+1] === '"') { cf += '"'; i++; } else inQ = !inQ;
    } else if (ch === "," && !inQ) {
      cfs.push(cf.trim()); cf = "";
    } else if ((ch === "\n" || ch === "\r") && !inQ) {
      if (ch === "\r" && text[i+1] === "\n") i++;
      cfs.push(cf.trim()); rows.push(cfs); cfs = []; cf = "";
    } else { cf += ch; }
  }
  if (cf || cfs.length > 0) { cfs.push(cf.trim()); rows.push(cfs); }
  return rows;
}

function buildCSVGroups() {
  const csvRaw = fs.readFileSync(CSV_PATH, "utf8");
  const rows   = parseCSVFull(csvRaw);
  let headerRowIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === "Codigo") { headerRowIdx = i; break; }
  }
  if (headerRowIdx === -1) throw new Error("No se encontro encabezado CSV");
  const headers = rows[headerRowIdx];
  const COL = {};
  headers.forEach((h, i) => { COL[h.trim()] = i; });
  const dataRows = [];
  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const fields = rows[i];
    if (fields.length < 2) continue;
    const desc = (fields[COL["Descripcion"]] || "").replace(/"/g, "").trim();
    if (!desc || desc.startsWith("Absorbe") || desc.startsWith("Difumina")) continue;
    dataRows.push({
      codigo:    (fields[COL["Codigo"]]    || "").replace(/"/g, "").trim(),
      descripcion: desc,
      publico:   parsePrecio(fields[COL["Publico"]] || ""),
      oferta:    parsePrecio(fields[COL["Oferta"]]  || ""),
      proveedor: (fields[COL["Proveedor"]] || "").replace(/"/g, "").trim(),
      rubro:     (fields[COL["Rubro"]]     || "").replace(/"/g, "").trim(),
    });
  }
  const productGroups = new Map();
  for (const row of dataRows) {
    const { base } = extractSize(row.descripcion);
    if (!productGroups.has(base))
      productGroups.set(base, { variantes: [] });
    productGroups.get(base).variantes.push({ codigo: row.codigo, publico: row.publico });
  }
  return { productGroups, dataRows };
}

async function readExcel() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(EXCEL_PATH);
  const wsP = wb.getWorksheet("\uD83D\uDCE6 Productos");
  const wsV = wb.getWorksheet("\uD83D\uDD17 Variantes");
  const wsC = wb.getWorksheet("\uD83C\uDFA8 Colores");
  const wsL = wb.getWorksheet("\uD83D\uDCCB Listas");
  const wsI = wb.getWorksheet("\uD83D\uDCCB Instrucciones");
  const products = [], variantes = [];
  if (wsP) wsP.eachRow((row, n) => {
    if (n < 4) return;
    const id = row.getCell(1).value; if (!id) return;
    products.push({
      rowNum: n, id: String(id),
      nombre:      row.getCell(3).value,
      marca:       row.getCell(4).value,
      seccion:     row.getCell(5).value,
      categoria:   row.getCell(6).value,
      proveedor:   row.getCell(11).value,
      publicado:   row.getCell(12).value,
      moneda:      row.getCell(14).value,
      precio:      row.getCell(16).value,
      pctDesc:     row.getCell(17).value,
      precioOferta: row.getCell(18).value,
    });
  });
  if (wsV) wsV.eachRow((row, n) => {
    if (n < 4) return;
    const id = row.getCell(1).value; if (!id) return;
    variantes.push({
      rowNum: n, id: String(id),
      productoPadre: String(row.getCell(2).value),
      nombrePadre:   row.getCell(3).value,
      sku:           row.getCell(4).value,
      size:          row.getCell(5).value,
      precio:        row.getCell(7).value,
      pctDesc:       row.getCell(8).value,
      precioOferta:  row.getCell(9).value,
      publicado:     row.getCell(10).value,
      moneda:        row.getCell(12).value,
    });
  });
  return { wb, wsP, wsV, wsC, wsL, wsI, products, variantes };
}

async function main() {
  console.log("\n=== TEST DE INTEGRIDAD: CSV -> Excel Marybe ===\n");

  section("1. ARCHIVOS FUENTE");
  check("CSV existe",   fs.existsSync(CSV_PATH),   CSV_PATH);
  check("Excel existe", fs.existsSync(EXCEL_PATH), EXCEL_PATH);
  if (!fs.existsSync(EXCEL_PATH) || !fs.existsSync(CSV_PATH)) {
    console.log("\nNo se puede continuar sin los archivos."); process.exit(1);
  }

  const { productGroups, dataRows } = buildCSVGroups();
  const { wb, wsP, wsV, wsC, wsL, wsI, products, variantes } = await readExcel();
  const totalCSVProducts  = productGroups.size;
  const totalCSVVariantes = dataRows.length;

  section("2. HOJAS DEL WORKBOOK");
  check("Hoja Productos existe",      !!wsP);
  check("Hoja Variantes existe",      !!wsV);
  check("Hoja Colores existe (oculta)", !!wsC);
  check("Hoja Listas existe (oculta)",  !!wsL);
  check("Hoja Instrucciones existe",    !!wsI);
  if (wsC) check("Colores esta oculta", wsC.state === "veryHidden", "state=" + wsC.state);
  if (wsL) check("Listas esta oculta",  wsL.state === "veryHidden", "state=" + wsL.state);

  section("3. CONTEO DE FILAS");
  console.log("  CSV: " + totalCSVProducts + " productos unicos | " + totalCSVVariantes + " variantes totales");
  console.log("  XLS: " + products.length + " filas Productos  | " + variantes.length  + " filas Variantes");
  check("Cantidad de productos coincide", products.length === totalCSVProducts,
    "Excel=" + products.length + " | CSV=" + totalCSVProducts);
  check("Cantidad de variantes coincide", variantes.length === totalCSVVariantes,
    "Excel=" + variantes.length + " | CSV=" + totalCSVVariantes);

  section("4. IDs UNICOS - SIN DUPLICADOS");
  const pIds = products.map(p => p.id);
  const vIds = variantes.map(v => v.id);
  const dupP = pIds.filter((id, i) => pIds.indexOf(id) !== i);
  const dupV = vIds.filter((id, i) => vIds.indexOf(id) !== i);
  check("IDs de Productos sin duplicados", dupP.length === 0,
    dupP.length > 0 ? "Duplicados: " + dupP.join(", ") : "OK");
  check("IDs de Variantes sin duplicados", dupV.length === 0,
    dupV.length > 0 ? "Duplicados: " + dupV.join(", ") : "OK");

  section("5. RELACION PADRE-HIJO");
  const pIdSet = new Set(pIds);
  const huerfanas = variantes.filter(v => !pIdSet.has(v.productoPadre));
  check("Todas las variantes tienen padre valido", huerfanas.length === 0,
    huerfanas.length > 0
      ? huerfanas.length + " huerfanas. Ej: " + huerfanas.slice(0,3).map(v => "V=" + v.id + " padre=" + v.productoPadre).join(", ")
      : "OK");
  const prodIdWithVar = new Set(variantes.map(v => v.productoPadre));
  const sinVar = products.filter(p => !prodIdWithVar.has(p.id));
  check("Todos los productos tienen al menos 1 variante", sinVar.length === 0,
    sinVar.length > 0 ? sinVar.length + " sin variante" : "OK");

  section("6. CAMPOS OBLIGATORIOS NO VACIOS");
  const sinNombre  = products.filter(p => !p.nombre  || String(p.nombre).trim()  === "");
  const sinSeccion = products.filter(p => !p.seccion || String(p.seccion).trim() === "");
  const sinMoneda  = products.filter(p => !p.moneda  || String(p.moneda).trim()  === "");
  check("Productos: todos tienen Nombre",  sinNombre.length  === 0, sinNombre.length  > 0 ? sinNombre.length  + " sin nombre"  : "OK");
  check("Productos: todos tienen Seccion", sinSeccion.length === 0, sinSeccion.length > 0 ? sinSeccion.length + " sin seccion" : "OK");
  check("Productos: todos tienen Moneda",  sinMoneda.length  === 0, sinMoneda.length  > 0 ? sinMoneda.length  + " sin moneda"  : "OK");
  const varSinPrecio = variantes.filter(v => v.precio === null || v.precio === undefined || v.precio === "");
  check("Variantes: todas tienen Precio", varSinPrecio.length === 0,
    varSinPrecio.length > 0 ? varSinPrecio.length + " sin precio" : "OK");

  section("7. VALIDACION SECCION Y MONEDA");
  const SECS  = new Set(["Perfumeria", "Hogar", "Perfumer\u00eda"]);
  const MONES = new Set(["ARS", "USD", "EUR"]);
  const secInv = products.filter(p => p.seccion && !SECS.has(String(p.seccion)));
  const monInv = products.filter(p => p.moneda  && !MONES.has(String(p.moneda)));
  check("Seccion valida (Perfumeria/Hogar)", secInv.length === 0,
    secInv.length > 0 ? secInv.length + " invalidas. Ej: " + [...new Set(secInv.map(p => p.seccion))].slice(0,3).join(", ") : "OK");
  check("Moneda valida (ARS/USD/EUR)", monInv.length === 0,
    monInv.length > 0 ? monInv.length + " invalidas" : "OK");

  section("8. PRECIOS RAZONABLES");
  const vConP    = variantes.filter(v => typeof v.precio === "number");
  const vNeg     = vConP.filter(v => v.precio <= 0);
  const vBajo    = vConP.filter(v => v.precio > 0 && v.precio < 100);
  const vAlto    = vConP.filter(v => v.precio > 10000000);
  const vDescInv = variantes.filter(v => { const d = Number(v.pctDesc); return !isNaN(d) && (d < 0 || d > 100); });
  check("Ningun precio negativo o cero", vNeg.length === 0, vNeg.length > 0 ? vNeg.length + " con precio <= 0" : "OK");
  if (vBajo.length > 0)
    check("Precios muy bajos (< $100)", "WARN", vBajo.length + " variantes. Ej: " + vBajo.slice(0,3).map(v => v.id + "=$" + v.precio).join(", "));
  else
    check("Ningun precio sospechosamente bajo (< $100)", true, "OK");
  if (vAlto.length > 0)
    check("Precios muy altos (> $10M)", "WARN", vAlto.length + " variantes");
  else
    check("Ningun precio extremadamente alto (> $10M)", true, "OK");
  check("% Descuento entre 0 y 100", vDescInv.length === 0,
    vDescInv.length > 0 ? vDescInv.length + " fuera de rango" : "OK");

  section("9. FORMULAS EN COLUMNAS CALCULADAS");
  const varConF = variantes.filter(v => v.precioOferta && typeof v.precioOferta === "object" && v.precioOferta.formula);
  const varSinF = variantes.filter(v => {
    const po = v.precioOferta;
    return po !== null && po !== undefined && po !== "" && !(typeof po === "object" && po.formula);
  });
  check("Variantes: Precio Oferta es formula", varSinF.length === 0,
    varSinF.length > 0 ? varSinF.length + " con valor estatico" : varConF.length + " filas con formula OK");
  const varVlookup = variantes.filter(v => {
    const np = v.nombrePadre;
    return np && typeof np === "object" && np.formula && np.formula.includes("VLOOKUP");
  });
  check("Variantes: Nombre Padre usa VLOOKUP", varVlookup.length === variantes.length,
    varVlookup.length + "/" + variantes.length + " con VLOOKUP");
  const prodConF = products.filter(p => p.precioOferta && typeof p.precioOferta === "object" && p.precioOferta.formula);
  check("Productos: Precio Oferta (col R) es formula", prodConF.length === products.length,
    prodConF.length + "/" + products.length + " con formula");

  section("10. CRUCE CSV <-> EXCEL (muestra de precios por EAN)");
  const excelVarByEAN = new Map();
  for (const v of variantes) {
    if (v.sku) excelVarByEAN.set(String(v.sku).trim(), v);
  }
  let mismatch = 0, sinEAN = 0, matchOK = 0, checked = 0;
  for (const row of dataRows) {
    if (checked >= 300) break;
    checked++;
    if (!row.codigo) { sinEAN++; continue; }
    const ev = excelVarByEAN.get(row.codigo);
    if (!ev) { sinEAN++; continue; }
    if (row.publico !== null && ev.precio !== null) {
      if (Math.abs(Number(ev.precio) - row.publico) > 1) {
        mismatch++;
        if (mismatch <= 3) console.log("    Precio distinto EAN " + row.codigo + ": CSV=" + row.publico + " | Excel=" + ev.precio);
      } else { matchOK++; }
    }
  }
  check("Precios CSV == Excel (muestra de " + checked + ")", mismatch === 0,
    mismatch > 0 ? mismatch + " precios distintos" : matchOK + " OK (" + sinEAN + " sin EAN saltados)");

  section("11. PUBLICADO = TRUE");
  const pNoPubl = products.filter(p => String(p.publicado) !== "TRUE");
  const vNoPubl = variantes.filter(v => String(v.publicado) !== "TRUE");
  check("Productos: Publicado=TRUE", pNoPubl.length === 0, pNoPubl.length > 0 ? pNoPubl.length + " con Publicado!=TRUE" : "OK");
  check("Variantes: Publicado=TRUE", vNoPubl.length === 0, vNoPubl.length > 0 ? vNoPubl.length + " con Publicado!=TRUE" : "OK");

  section("12. DISTRIBUCION DE MARCAS Y CATEGORIAS");
  const marcaCount = {}, catCount = {};
  for (const p of products) {
    const m = String(p.marca || "SIN MARCA");
    const c = String(p.categoria || "SIN CATEGORIA");
    marcaCount[m] = (marcaCount[m] || 0) + 1;
    catCount[c]   = (catCount[c]   || 0) + 1;
  }
  console.log("  Marcas:");
  Object.entries(marcaCount).sort((a,b) => b[1]-a[1]).forEach(([m,n]) => console.log("    " + m.padEnd(20) + n));
  console.log("  Categorias:");
  Object.entries(catCount).sort((a,b) => b[1]-a[1]).forEach(([c,n]) => console.log("    " + c.padEnd(30) + n));
  check("Al menos una marca detectada",     Object.keys(marcaCount).length > 0, Object.keys(marcaCount).length + " marcas");
  check("Al menos una categoria detectada", Object.keys(catCount).length   > 0, Object.keys(catCount).length   + " categorias");

  console.log("\n=============== RESUMEN FINAL ================");
  console.log("  PASS: " + passed + "  FAIL: " + failed + "  WARN: " + warned);
  const total = passed + failed + warned;
  console.log("  Score: " + (total > 0 ? Math.round(passed/total*100) : 0) + "% (" + passed + "/" + total + " checks)");
  if (failed === 0)
    console.log("  Excel exportado CORRECTO. Todos los checks pasaron.");
  else
    console.log("  Hay " + failed + " check(s) fallidos. Revisar arriba.");
  console.log("==============================================\n");
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => { console.error("Error:", err.message); process.exit(1); });
