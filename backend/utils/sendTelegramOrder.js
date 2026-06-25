function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildOrderMessage(order) {
  const customer = order.shippingAddress || {};
  const user = order.user || {};
  const items = (order.orderItems || [])
    .map((item) => `- ${escapeHtml(item.name)} x${item.qty} - ${formatMoney(item.price * item.qty)}`)
    .join('\n');

  return [
    '<b>New Cash on Delivery Order</b>',
    '',
    `<b>Order ID:</b> ${order._id}`,
    `<b>Payment:</b> ${escapeHtml(order.paymentMethod)} (${escapeHtml(order.paymentStatus)})`,
    `<b>Total:</b> ${formatMoney(order.totalPrice)}`,
    '',
    '<b>Customer</b>',
    `<b>Name:</b> ${escapeHtml(customer.fullName)}`,
    `<b>Email:</b> ${escapeHtml(user.email || 'N/A')}`,
    `<b>Phone:</b> ${escapeHtml(customer.phone)}`,
    '',
    '<b>Shipping Address</b>',
    `${escapeHtml(customer.address)}`,
    `${escapeHtml(customer.city)}, ${escapeHtml(customer.country)}`,
    customer.postalCode ? `<b>Postal Code:</b> ${escapeHtml(customer.postalCode)}` : '',
    customer.notes ? `<b>Notes:</b> ${escapeHtml(customer.notes)}` : '',
    '',
    '<b>Items</b>',
    items || 'No items'
  ].filter(Boolean).join('\n');
}

async function sendTelegramOrder(order) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('Telegram order notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing.');
    return;
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: buildOrderMessage(order),
      parse_mode: 'HTML'
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Telegram notification failed: ${details}`);
  }

  console.log(`Telegram order notification sent for order ${order._id}`);
}

module.exports = sendTelegramOrder;
