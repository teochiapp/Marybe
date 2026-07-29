const Database = require('better-sqlite3');
const db = new Database('.tmp/data.db', { readonly: true });
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(tables.map(t => t.name).filter(n => n.includes('variante') || n.includes('producto')));
