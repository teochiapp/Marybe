const sqlite3 = require('better-sqlite3');
const db = sqlite3('.tmp/data.db');

try {
  const roles = db.prepare("SELECT id, name FROM up_roles;").all();
  
  const actions = [
    'api::cliente.cliente.findme',
    'api::cliente.cliente.createorupdateme'
  ];
  
  roles.forEach(role => {
    actions.forEach(action => {
      // 1. Insert permission
      const res = db.prepare("INSERT INTO up_permissions (action, created_at, updated_at) VALUES (?, datetime('now'), datetime('now'))").run(action);
      const permId = res.lastInsertRowid;
      
      // 2. Link permission to role
      db.prepare("INSERT INTO up_permissions_role_lnk (permission_id, role_id) VALUES (?, ?)").run(permId, role.id);
      console.log(`Granted ${action} to role ${role.name}`);
    });
  });
  console.log("Custom route permissions injected successfully.");
} catch(e) {
  console.log(e);
}
