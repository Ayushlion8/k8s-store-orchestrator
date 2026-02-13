require("dotenv").config();

const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");

const { provisionQueue } = require("../queue");
const { helmUninstall } = require("../provisioning/helmClient");
const { deleteNamespace } = require("../provisioning/k8sClient");
const { v4: uuidv4 } = require("uuid");

// 🔥 Prisma 7 Adapter Setup
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

/*
|--------------------------------------------------------------------------
| CREATE STORE (Async Provisioning)
|--------------------------------------------------------------------------
*/
router.post("/stores", async (req, res) => {
  try {
    const { name = "My Store", adminEmail = "admin@example.com" } = req.body;

    const id = uuidv4();
    const shortId = id.slice(0, 8);
    const namespace = `store-${shortId}`;
    const release = namespace;
    const domain = `${namespace}.127.0.0.1.nip.io`;

    const adminPassword = Math.random().toString(36).slice(2, 10);

    const store = await prisma.store.create({
      data: {
        id,
        name,
        namespace,
        release,
        domain,
        plan: "starter",
        adminEmail,
        adminPassword,
        status: "CREATING",
      },
    });

    await provisionQueue.add(
      "provision-store",
      { storeId: store.id },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    return res.status(202).json({
      success: true,
      message: "Store provisioning started",
      store,
    });
  } catch (err) {
    console.error("Create store error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| LIST STORES
|--------------------------------------------------------------------------
*/
router.get("/stores", async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      count: stores.length,
      stores,
    });
  } catch (err) {
    console.error("List stores error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET SINGLE STORE
|--------------------------------------------------------------------------
*/
router.get("/stores/:id", async (req, res) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: req.params.id },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: "Store not found",
      });
    }

    return res.json({
      success: true,
      store,
    });
  } catch (err) {
    console.error("Get store error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| DELETE STORE
|--------------------------------------------------------------------------
*/
router.delete("/stores/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: "Store not found",
      });
    }

    await prisma.store.update({
      where: { id },
      data: { status: "DELETING" },
    });

    await helmUninstall(store.release, store.namespace);
    await deleteNamespace(store.namespace);

    await prisma.store.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Store deleted successfully",
    });
  } catch (err) {
    console.error("Delete store error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
