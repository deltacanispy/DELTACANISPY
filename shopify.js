 const axios = require("axios");

async function getOrderStatus(orderNumber) {
  try {
    const res = await axios.get(
      ⁠ https://${process.env.SHOPIFY_STORE}/admin/api/2024-01/orders.json?name=${orderNumber} ⁠,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_TOKEN
        }
      }
    );

    if (!res.data.orders.length) return null;
    return res.data.orders[0].fulfillment_status || res.data.orders[0].financial_status;
  } catch {
    return null;
  }
}

module.exports = { getOrderStatus };
