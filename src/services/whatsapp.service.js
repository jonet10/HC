const twilio = require("twilio");

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

async function sendWhatsAppMessage(to, body) {
  const client = getTwilioClient();
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!client || !from) {
    console.warn("Twilio is not configured. Skipping WhatsApp send.");
    return { skipped: true, reason: "TWILIO_NOT_CONFIGURED" };
  }
  if (!to) {
    return { skipped: true, reason: "MISSING_DESTINATION" };
  }

  const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  const message = await client.messages.create({
    from,
    to: formattedTo,
    body,
  });
  return { skipped: false, sid: message.sid, status: message.status };
}

async function sendWhatsAppMediaMessage(to, body, mediaUrl) {
  const client = getTwilioClient();
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!client || !from) {
    console.warn("Twilio is not configured. Skipping WhatsApp media send.");
    return { skipped: true, reason: "TWILIO_NOT_CONFIGURED" };
  }
  if (!to) {
    return { skipped: true, reason: "MISSING_DESTINATION" };
  }

  const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  const payload = { from, to: formattedTo, body };
  if (mediaUrl) payload.mediaUrl = [mediaUrl];

  const message = await client.messages.create(payload);
  return { skipped: false, sid: message.sid, status: message.status };
}

function buildPaymentConfirmationMessage({ parentName, studentName, amount, receiptNumber, balance }) {
  return `Bonjour ${parentName}, paiement recu pour ${studentName}. Montant: ${amount} HTG. Recu: ${receiptNumber}. Solde restant: ${balance} HTG. HaitiConnect.`;
}

function buildPaymentReminderMessage({ parentName, studentName, dueAmount }) {
  return `Rappel HaitiConnect: ${parentName}, le solde de ${studentName} est ${dueAmount} HTG. Merci d'effectuer le paiement.`;
}

function buildBalanceAlertMessage({ recipientName, studentName, dueAmount }) {
  return `Alerte solde HaitiConnect: ${studentName} a un solde de ${dueAmount} HTG. Notification pour ${recipientName}.`;
}

module.exports = {
  sendWhatsAppMessage,
  sendWhatsAppMediaMessage,
  buildPaymentConfirmationMessage,
  buildPaymentReminderMessage,
  buildBalanceAlertMessage,
};
