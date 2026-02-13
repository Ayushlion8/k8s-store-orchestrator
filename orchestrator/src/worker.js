require("dotenv").config();

const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const { PrismaClient } = require("./generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");
const { helmInstall } = require("./provisioning/helmClient");
const { ensureNamespace } = require("./provisioning/k8sClient");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

// ----------------------------------------------------
// Prisma 7 Adapter Setup (PostgreSQL)
// ----------------------------------------------------
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found in environment variables");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

// ----------------------------------------------------
// Redis Connection (BullMQ)
// ----------------------------------------------------
const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

// ----------------------------------------------------
// Helm Chart Path
// ----------------------------------------------------
const CHART_PATH = path.resolve(
  __dirname,
  "../../charts/woocommerce-store"
);

// ----------------------------------------------------
// Worker Definition
// ----------------------------------------------------
const worker = new Worker(
  "provision-store",
  async (job) => {
    const { storeId } = job.data;

    console.log(`🚀 Provision job received for store: ${storeId}`);

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new Error("Store not found in database");
    }

    try {
      // 1️⃣ Update status → INSTALLING
      await prisma.store.update({
        where: { id: storeId },
        data: { status: "INSTALLING" },
      });

      // 2️⃣ Ensure namespace
      await ensureNamespace(store.namespace);

      // 3️⃣ Generate dynamic values.yaml
        const values = {
        wordpress: {
            image: {
            repository: "wordpress",
            tag: "6.4-apache",
            pullPolicy: "IfNotPresent",
            },
            persistence: {
            enabled: true,
            size: "1Gi",
            },
        },
        mysql: {
            image: {
            repository: "mysql",
            tag: "8.0",
            pullPolicy: "IfNotPresent",
            },
            rootPassword: "rootpassword",
            user: "wpuser",
            password: "wppassword",
            database: "wordpress",
            persistence: {
            enabled: true,
            size: "1Gi",
            },
        },
        ingress: {
            enabled: true,
            host: store.domain,
        },
        };


      const valuesPath = path.join(
        require("os").tmpdir(),
        `values-${store.release}.yaml`
      );

      fs.writeFileSync(valuesPath, yaml.dump(values), "utf8");

      // 4️⃣ Helm install / upgrade
      await helmInstall(
        store.release,
        CHART_PATH,
        store.namespace,
        valuesPath
      );

      // 5️⃣ Mark READY
      await prisma.store.update({
        where: { id: storeId },
        data: { status: "READY" },
      });

      console.log(`✅ Store ${storeId} is READY`);
    } catch (err) {
      console.error(`❌ Provisioning failed for ${storeId}`);
      console.error(err);

      await prisma.store.update({
        where: { id: storeId },
        data: {
          status: "FAILED",
          errorMessage: err.message,
        },
      });
    }
  },
  { connection }
);

// ----------------------------------------------------
// Worker Events
// ----------------------------------------------------
worker.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`🔥 Job ${job?.id} failed:`, err.message);
});

console.log("🛠 Provision Worker Running...");
