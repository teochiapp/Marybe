'use strict';

const nodemailer = require('nodemailer');
const generarConfirmacionPedidoCliente = require('./templates/confirmacion-pedido-cliente');
const generarAlertaNuevoPedidoAdmin = require('./templates/alerta-nuevo-pedido-admin');
const generarBienvenidaCliente = require('./templates/bienvenida-cliente');
const generarAvisoPedidoEnviado = require('./templates/aviso-pedido-enviado');
const generarAvisoPedidoCompletado = require('./templates/aviso-pedido-completado');
const generarAvisoPedidoCancelado = require('./templates/aviso-pedido-cancelado');

module.exports = ({ strapi }) => ({
  /**
   * Envía un correo utilizando Nodemailer y Brevo SMTP
   * 
   * @param {Object} options Opciones del correo
   * @param {string|string[]} options.to Destinatario(s)
   * @param {string} options.subject Asunto del correo
   * @param {string} options.html Contenido HTML
   * @param {string} [options.text] Contenido en texto plano (opcional)
   * @returns {Promise<Object>} Resultado del envío
   */
  async enviar(options) {
    try {
      // Creamos el transportador con tus credenciales SMTP de Brevo
      const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.BREVO_SMTP_USER,
          pass: process.env.BREVO_SMTP_PASS
        },
      });

      // Configuración por defecto y datos recibidos
      const mailOptions = {
        from: '"Marybe" <teochiapps@gmail.com>', // Cambia esto por tu remitente verificado
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || '',
      };

      // Enviamos el correo
      const info = await transporter.sendMail(mailOptions);
      console.log('Correo enviado con éxito: %s', info.messageId);

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error enviando el correo:', error);
      // Retornamos success: false para manejarlo sin romper la aplicación
      return { success: false, error: error.message };
    }
  },

  /**
   * Envía correo de confirmación de pedido con diseño mejorado
   */
  async enviarConfirmacionPedido(emailCliente, nombreCliente, pedido) {
    const htmlContent = generarConfirmacionPedidoCliente(emailCliente, nombreCliente, pedido);

    return this.enviar({
      to: emailCliente,
      subject: `Confirmación de Pedido #${pedido.numero_pedido} - Marybe`,
      html: htmlContent
    });
  },

  /**
   * Envía notificación de nueva venta al administrador
   */
  async enviarAlertaNuevoPedidoAdmin(pedido, nombreCliente) {
    const htmlContent = generarAlertaNuevoPedidoAdmin(pedido, nombreCliente);

    return this.enviar({
      to: 'teochiapps@gmail.com',
      subject: `¡Nueva Venta! Pedido #${pedido.numero_pedido} - $${pedido.total}`,
      html: htmlContent
    });
  },

  /**
   * Envía correo de bienvenida al registrarse
   */
  async enviarBienvenida(emailCliente, nombreCliente) {
    const htmlContent = generarBienvenidaCliente(nombreCliente);

    return this.enviar({
      to: emailCliente,
      subject: `¡Bienvenida a Marybe, ${nombreCliente}! 🌸`,
      html: htmlContent
    });
  },

  async enviarAvisoPedidoEnviado(emailCliente, nombreCliente, pedido) {
    const htmlContent = generarAvisoPedidoEnviado(emailCliente, nombreCliente, pedido);
    return this.enviar({
      to: emailCliente,
      subject: `Tu pedido #${pedido.numero_pedido} está en camino 🚚`,
      html: htmlContent
    });
  },

  async enviarAvisoPedidoCompletado(emailCliente, nombreCliente, pedido) {
    const htmlContent = generarAvisoPedidoCompletado(emailCliente, nombreCliente, pedido);
    const hasGiftCard = pedido.gift_cards_generadas && Array.isArray(pedido.gift_cards_generadas) && pedido.gift_cards_generadas.length > 0;
    const subject = hasGiftCard ? 'Tu Gift Card está lista' : `Tu pedido #${pedido.numero_pedido} ha sido completado`;
    
    return this.enviar({
      to: emailCliente,
      subject,
      html: htmlContent
    });
  },

  async enviarAvisoPedidoCancelado(emailCliente, nombreCliente, pedido) {
    const htmlContent = generarAvisoPedidoCancelado(emailCliente, nombreCliente, pedido);
    return this.enviar({
      to: emailCliente,
      subject: `Aviso sobre tu pedido #${pedido.numero_pedido} ⚠️`,
      html: htmlContent
    });
  }
});
