const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '.tmp', 'data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("SELECT * FROM productos WHERE id_original = '4907'", (err, rows) => {
  if (err) {
      console.error("Error querying productos:", err);
      return;
  }
  console.log('Producto:', rows);
  
  if (rows && rows.length > 0) {
    db.all("SELECT * FROM productos_variantes_links pvl JOIN variantes v ON pvl.variante_id = v.id WHERE pvl.producto_id = ?", [rows[0].id], (err, vars) => {
      if (err) console.error("Error querying variantes:", err);
      console.log('Variantes:', vars);
    });
  }
});
