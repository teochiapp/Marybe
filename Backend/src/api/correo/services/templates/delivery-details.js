function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function deliveryDetails(address = {}) {
  const escape = escapeHtml;
  if (address.sucursal) return `<strong>Sucursal de retiro:</strong><br/>${escape(address.sucursal)}<br/>${escape(address.provincia)}${address.telefono_sucursal ? `<br/>Teléfono de sucursal: ${escape(address.telefono_sucursal)}` : ''}`;
  return `<strong>Dirección de envío:</strong><br/>${escape(address.calle)} ${escape(address.numero || address.altura || '')}${address.piso_depto ? ` (${escape(address.piso_depto)})` : ''}<br/>${escape(address.ciudad)}, ${escape(address.provincia)}${address.cp ? `<br/>CP ${escape(address.cp)}` : ''}`;
}
module.exports = { escapeHtml, deliveryDetails };
