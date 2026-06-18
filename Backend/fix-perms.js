const sqlite3 = require('better-sqlite3');
const db = sqlite3('.tmp/data.db');

try {
  // En Strapi 4 la tabla es up_permissions o similares, busquemos el nombre
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table';").all();
  console.log("Tables:", tables.map(t => t.name).filter(n => n.includes('permission') || n.includes('role')));

  const authRole = db.prepare("SELECT id FROM up_roles WHERE type = 'authenticated';").get();
  
  if (authRole) {
    console.log("Role ID:", authRole.id);
    const actions = [
      'api::cliente.cliente.create',
      'api::cliente.cliente.find',
      'api::cliente.cliente.findOne',
      'api::cliente.cliente.update'
    ];
    
    actions.forEach(action => {
      try {
        db.prepare("INSERT INTO up_permissions (action, role_id) VALUES (?, ?)").run(action, authRole.id);
        console.log("Added permission:", action);
      } catch (err) {
        // Ignorar si ya existe
      }
    });
    console.log("Permissions injected successfully.");
  }
} catch(e) {
  console.log(e);
}
