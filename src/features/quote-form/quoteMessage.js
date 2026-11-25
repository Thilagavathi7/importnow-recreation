export function buildWhatsAppMessage({ name, city, product, quantity, budget, details }) {
  return [
    'Hello ImportNow, I would like to enquire about importing from China.',
    '',
    `Name: ${name}`,
    `City: ${city}`,
    `Product: ${product}`,
    `Approximate quantity: ${quantity}`,
    `Budget: ${budget || 'Not specified'}`,
    `Details: ${details || 'Not specified'}`,
  ].join('\n')
}
