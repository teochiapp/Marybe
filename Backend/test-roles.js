const sqlite3 = require('better-sqlite3');
const db = sqlite3('.tmp/data.db');

try {
  const users = db.prepare('SELECT u.id, u.username, r.name as role FROM up_users u JOIN up_users_role_links l ON u.id = l.user_id JOIN up_roles r ON l.role_id = r.id;').all();
  console.log('--- USERS ---');
  console.log(users);

  const perms = db.prepare('SELECT action FROM up_permissions WHERE role_id = (SELECT id FROM up_roles WHERE name = \'Authenticated\') AND action LIKE \'%cliente%\';').all();
  console.log('--- PERMISSIONS FOR AUTHENTICATED ---');
  console.log(perms);
} catch(e) {
  console.log(e);
}
