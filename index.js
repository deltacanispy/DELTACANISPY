const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const languages = require("./languages");
const faqAI = require("./faq_ai");
const { getOrderStatus } = require("./shopify");

let users = fs.existsSync("users.json")
  ? JSON.parse(fs.readFileSync("users.json"))
  : {};

const client = new Client({
  authStrategy: new LocalAuth()
});

function isBusinessHours() {
  const hour = new Date().getHours();
  return hour >= 8 && hour < 18;
}

client.on("qr", qr => {
  qrcode.generate(qr, { small: true });
  console.log("📲 Escaneie o QR Code com o WhatsApp Business");
});

client.on("ready", () => {
  console.log("🤖 DELTA CANIS BOT ONLINE");
});

client.on("message", async message => {
  const id = message.from;
  const text = message.body.trim().toLowerCase();

  if (!isBusinessHours()) {
    return message.reply(
      "⏰ Nosso atendimento funciona de segunda a sexta, das 08h às 18h.\n" +
      "Você pode consultar o menu ou deixar sua mensagem que responderemos no próximo horário útil."
    );
  }

  if (!users[id]) {
    users[id] = { lang: null };
    fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
    return message.reply(
      "🌎 Elige tu idioma / Escolha o idioma:\n1️⃣ Español\n2️⃣ Português"
    );
  }

  if (!users[id].lang) {
    users[id].lang = text === "1" ? "es" : "pt";
    fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
    const L = languages[users[id].lang];
    return message.reply(⁠ ${L.welcome}\n${L.menu} ⁠);
  }

  const L = languages[users[id].lang];

  if (["menu", "oi", "hola"].includes(text)) {
    return message.reply(⁠ ${L.welcome}\n${L.menu} ⁠);
  }

  if (text === "1") return message.reply(⁠ ${L.catalog}\n👉 https://deltacanis.myshopify.com ⁠);
  if (text === "2") return message.reply(L.payment);
  if (text === "3") {
    return message.reply(L.order);
  }
  if (text.startsWith("#")) {
    const status = await getOrderStatus(text.replace("#", ""));
    if (!status) return message.reply(L.orderNotFound);

    if (status === "fulfilled") return message.reply(L.orderShipped);
    if (status === "paid") return message.reply(L.orderPaid);
    return message.reply(L.orderPending);
  }

  if (text === "4") return message.reply(L.human);
  if (text === "5") return message.reply(L.delivery);
  if (text === "6") return message.reply(L.returns);

  const aiResponse = faqAI(text, users[id].lang);
  if (aiResponse) return message.reply(aiResponse);
});

client.initialize();

const http = require("http");

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("DELTA CANIS BOT ONLINE");
}).listen(PORT, () => {
  console.log("🌐 Servidor ativo na porta", PORT);
});
