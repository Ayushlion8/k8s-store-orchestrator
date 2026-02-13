const k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const coreApi = kc.makeApiClient(k8s.CoreV1Api);

async function ensureNamespace(name) {
  try {
    await coreApi.readNamespace(name);
    return;
  } catch (e) {
    const body = { metadata: { name, labels: { 'app/managed-by': 'urumi-orchestrator' } } };
    await coreApi.createNamespace(body);
  }
}

async function createSecret(ns, name, keyValues) {
  const secret = {
    metadata: { name },
    stringData: keyValues
  };
  try {
    await coreApi.createNamespacedSecret(ns, secret);
  } catch (err) {
    if (err.body && err.body.reason === 'AlreadyExists') {
      await coreApi.replaceNamespacedSecret(name, ns, secret);
    } else throw err;
  }
}

async function deleteNamespace(name) {
  try {
    await coreApi.deleteNamespace(name);
  } catch (e) {
    if (e.statusCode !== 404) throw e;
  }
}

module.exports = { ensureNamespace, createSecret, deleteNamespace };
