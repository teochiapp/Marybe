import axios from 'axios';

class EmailService {
  constructor() {
    this.apiKey = process.env.REACT_APP_BREVO_API_KEY;
    this.baseURL = 'https://api.brevo.com/v3';
  }

  async sendEmail(formData) {
    
    try {
      const emailData = {
        sender: {
          name: 'SurCodes Contact Form',
          email: 'blackflameroma@gmail.com'
        },
        to: [
          {
            email: process.env.REACT_APP_RECIPIENT_EMAIL,
            name: 'SurCodes Team'
          }
        ],
        subject: `Nuevo mensaje de contacto: ${formData.subject}`,
        htmlContent: this.generateEmailHTML(formData),
        textContent: this.generateEmailText(formData)
      };

      const response = await axios.post(
        `${this.baseURL}/smtp/email`,
        emailData,
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        message: 'Email enviado correctamente',
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al enviar el email. Por favor, intenta nuevamente.',
        error: error.response?.data || error.message
      };
    }
  }

  generateEmailHTML(formData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nuevo mensaje de contacto - SurCodess</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #66d3fa, #ffd26f); padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .header h1 { color: #fff; margin: 0; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 8px; }
          .field { margin-bottom: 15px; }
          .field-label { font-weight: bold; color: #66d3fa; }
          .field-value { margin-top: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nuevo Mensaje de Contacto</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="field-label">Nombre:</div>
              <div class="field-value">${formData.name}</div>
            </div>
            <div class="field">
              <div class="field-label">Email:</div>
              <div class="field-value">${formData.email}</div>
            </div>
            <div class="field">
              <div class="field-label">Asunto:</div>
              <div class="field-value">${formData.subject}</div>
            </div>
            <div class="field">
              <div class="field-label">Mensaje:</div>
              <div class="field-value">${formData.message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          <div class="footer">
            <p>Este mensaje fue enviado desde el formulario de contacto de SurCodes</p>
            <p>Fecha: ${new Date().toLocaleString('es-AR')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateEmailText(formData) {
    return `
Nuevo mensaje de contacto - SurCodes

Nombre: ${formData.name}
Email: ${formData.email}
Asunto: ${formData.subject}

Mensaje:
${formData.message}

---
Enviado desde el formulario de contacto de SurCodes
Fecha: ${new Date().toLocaleString('es-AR')}
    `;
  }
}

export default EmailService; 