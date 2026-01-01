module.exports = function faqAI(text, lang) {
  if (text.includes("pago") || text.includes("pix") || text.includes("paypal")) {
    return lang === "es"
      ? "💳 Aceptamos Pix, PayPal, tarjeta y transferencia."
      : "💳 Aceitamos Pix, PayPal, cartão e transferência.";
  }
  return null;
};
