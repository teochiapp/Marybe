const Database = require('better-sqlite3');
const db = new Database('.tmp/data.db', { readonly: true });
console.log('components_producto_variantes:');
console.log(db.prepare("PRAGMA table_info('components_producto_variantes')").all());
console.log('productos_cmps:');
console.log(db.prepare("PRAGMA table_info('productos_cmps')").all());
