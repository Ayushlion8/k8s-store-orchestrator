const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis();

const provisionQueue = new Queue("provision-store", {
  connection,
});

module.exports = { provisionQueue };
