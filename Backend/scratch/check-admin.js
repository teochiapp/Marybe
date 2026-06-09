const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../.tmp/data.db');
const db = new Database(dbPath);

try {
  // Ver columnas de up_users
  const colsUsers = db.prepare("PRAGMA table_info(up_users)").all();
  console.log('\n=== Columnas de up_users ===');
  colsUsers.forEach(c => console.log(`  ${c.cid}: ${c.name} (${c.type})`));

  // Ver el usuario admin
  const user = db.prepare("SELECT * FROM up_users WHERE email = ?").get('admin@marybe.com');
  console.log('\n=== Usuario admin ===');
  if (user) {
    const { password, ...rest } = user;
    console.log(JSON.stringify(rest, null, 2));
    console.log('  password hash (primeros 20 chars):', password?.substring(0, 20));
  } else {
    console.log('  ❌ No se encontró el usuario admin@marybe.com');
  }

  // Ver todos los roles
  const roles = db.prepare("SELECT id, name, type FROM up_roles").all();
  console.log('\n=== Roles en up_roles ===');
  roles.forEach(r => console.log(`  id:${r.id} | ${r.name} | type: ${r.type}`));

  // Ver el vínculo usuario-rol
  if (user) {
    const lnk = db.prepare("SELECT * FROM up_users_role_lnk WHERE user_id = ?").all(user.id);
    console.log('\n=== Vínculo usuario-rol ===');
    console.log(JSON.stringify(lnk, null, 2));
  }

} catch (e) {
  console.log('Error:', e.message);
}
db.close();
