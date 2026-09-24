const strapi = require('@strapi/strapi');

async function run() {
  const app = await strapi().load();
  
  // mock user, ctx
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@test.com'
  };
  
  const ctx = {
    state: { user: mockUser },
    request: {
      body: {
        productos: [
          {
            id_producto: "gift-card-1000",
            quantity: 2,
            price: 1000,
            product: {
              id: "gift-card-1000",
              nombre: "Gift Card 1000",
              precio: 1000
            }
          }
        ],
        total: 2000,
        metodo_pago: 'efectivo',
        direccion_envio: { nombre: 'Test', email: 'test@test.com' }
      }
    },
    send: (data) => console.log('Response:', JSON.stringify(data, null, 2)),
    unauthorized: (msg) => console.log('Unauthorized:', msg),
    badRequest: (msg) => console.log('BadRequest:', msg)
  };
  
  const customPedidoController = app.controller('api::pedido.custom-pedido');
  
  console.log("Creando pedido de Gift Card...");
  await customPedidoController.createMyOrder(ctx);
  
  console.log("Verificando si la Gift Card se creó en la BBDD...");
  const gcs = await app.entityService.findMany('api::gift-card.gift-card', { sort: { createdAt: 'desc' }, limit: 2 });
  console.log('Últimas Gift Cards:', gcs);
  
  process.exit(0);
}

run().catch(console.error);
