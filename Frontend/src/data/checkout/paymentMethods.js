export const paymentOptions = [
  // { id: 'debito', title: 'Tarjeta de débito', subtitle: 'Visa Débito - MasterCard - Maestro - Cabal', right: 'Sin recargo' },
  // { id: 'credito', title: 'Tarjeta de crédito', subtitle: 'Visa - MasterCard - Naranja X - Sucrédito - Banco del Sol', right: 'Hasta x cuotas sin interés' },
  { id: 'mercadopago', title: 'Mercado Pago', subtitle: 'Tarjetas de crédito, débito o dinero en cuenta', right: 'Sin recargo' },
  { id: 'transferencia', title: 'Transferencia bancaria', subtitle: 'CBU / CVU - Acreditación en 24 hs.', right: 'Sin recargo' },
  { id: 'efectivo', title: 'Efectivo', subtitle: 'Pagás al retirar el pedido', right: 'Sin recargo' },
  { id: 'aconvenir', title: 'A Convenir', subtitle: 'Coordinamos el pago por WhatsApp', right: 'Flexible' },
];

export const sucursalesRetiro = [
  {
    provincia: 'Santiago del Estero',
    opciones: [
      { id: 'Peatonal Tucuman 20, Santiago del Estero', label: 'Peatonal Tucuman 20' },
      { id: 'Pellegrini 141, Santiago del Estero', label: 'Pellegrini 141' },
      { id: 'Absalon Rojas 55, Santiago del Estero', label: 'Absalon Rojas 55' },
      { id: 'España 99, Santiago del Estero', label: 'España 99' },
    ]
  },
  {
    provincia: 'Tucumán',
    opciones: [
      { id: '25 de Mayo 256, Tucumán', label: '25 de Mayo 256' },
      { id: 'Pellegrini 141, Tucumán', label: 'Pellegrini 141' },
    ]
  }
];

export const infoTransferencia = {
  banco: 'Banco Galicia',
  titular: 'Marybe SRL',
  cuit: '30-71234567-9',
  cbu: '00 70 12 34 00 00 00 12 34 56 78',
  alias: 'marybe.perfumeria',
  whatsappNumero: '351 000-0000',
  mensajeWhatsapp: 'Enviá el comprobante por WhatsApp al 351 000-0000'
};
