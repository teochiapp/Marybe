const sqlite3 = require('better-sqlite3');
const db = sqlite3('.tmp/data.db');
const { v4: uuidv4 } = require('uuid');

try {
  const authRole = db.prepare("SELECT id FROM up_roles WHERE type = 'authenticated';").get();
  
  if (authRole) {
    const actions = [
      'api::cliente.cliente.create',
      'api::cliente.cliente.find',
      'api::cliente.cliente.findOne',
      'api::cliente.cliente.update'
    ];
    
    actions.forEach(action => {
      // 1. Insert permission
      const res = db.prepare("INSERT INTO up_permissions (action, created_at, updated_at) VALUES (?, datetime('now'), datetime('now'))").run(action);
      const permId = res.lastInsertRowid;
      
      // 2. Link permission to role
      db.prepare("INSERT INTO up_permissions_role_lnk (permission_id, role_id) VALUES (?, ?)").run(permId, authRole.id);
      console.log("Granted permission:", action);
    });
    console.log("All fixed! Restarting not needed but good measure.");
  }
} catch(e) {
  console.log(e);
}
