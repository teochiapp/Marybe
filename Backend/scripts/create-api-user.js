const strapi = require('@strapi/strapi');

async function createApiUser() {
  const app = await strapi().load();

  const adminEmail = process.env.IMPORT_ADMIN_EMAIL || 'admin@marybe.com';
  const adminPassword = process.env.IMPORT_ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('\n❌ Error: IMPORT_ADMIN_PASSWORD no está definida en las variables de entorno.');
    console.error('Por favor, agrega la variable antes de ejecutar este script.');
    process.exit(1);
  }

  try {
    const existingUser = await app.query('plugin::users-permissions.user').findOne({
      where: { email: adminEmail }
    });

    if (existingUser) {
      console.log(`\n✅ El usuario ${adminEmail} ya existe en la base de datos.`);
      process.exit(0);
    }

    const role = await app.query('plugin::users-permissions.role').findOne({
      where: { type: 'authenticated' }
    });

    if (!role) {
      console.log('\n❌ Error: No se encontró el rol "authenticated".');
      process.exit(1);
    }

    await app.plugin('users-permissions').service('user').add({
      username: 'ImportAdmin',
      email: adminEmail,
      password: adminPassword,
      confirmed: true,
      blocked: false,
      role: role.id,
      provider: 'local'
    });

    console.log(`\n🎉 ¡ÉXITO! Usuario API creado correctamente.`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Contraseña: [OCULTA POR SEGURIDAD]`);
    console.log(`Ahora puedes iniciar sesión en /importacion-admin en tu frontend.`);
    process.exit(0);

  } catch (err) {
    console.error(`\n❌ Ocurrió un error al crear el usuario: ${err.message}`);
    process.exit(1);
  }
}

createApiUser();
