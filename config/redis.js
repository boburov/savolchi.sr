// redis.js
const { createClient } = require("redis");

const client = createClient();

client.on("error", (err) => console.error("Redis xatosi:", err));

async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
    console.log("Redisga ulandi ✅");
  }
}

connectRedis();

module.exports = client;
