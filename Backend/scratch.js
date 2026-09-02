const axios = require('axios');

async function test() {
  const jwt = await axios.post('http://localhost:1337/api/importacion-admin/login', {
    identifier: 'admin@marybe.com',
    password: process.env.IMPORT_ADMIN_PASSWORD || 'marybe2026' // I need the actual password or I can't login?
  }).then(r=>r.data.jwt).catch(()=>null);

  console.log("JWT:", jwt ? "Success" : "Failed");
}
test();
