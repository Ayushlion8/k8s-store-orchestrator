const { exec } = require("child_process");

/**
 * Install or upgrade a Helm release
 * @param {string} release - Release name (store name)
 * @param {string} chartPath - Path to Helm chart
 * @param {string} namespace - Kubernetes namespace
 * @param {string} valuesFilePath - Path to values.yaml file
 * @param {object} overrides - Key/value pairs for --set overrides
 */
function helmInstall(release, chartPath, namespace, valuesFilePath, overrides = {}) {
  const setArgs = Object.entries(overrides)
    .map(([key, value]) => `--set ${key}=${value}`)
    .join(" ");

  const cmd = `
    helm upgrade --install ${release} ${chartPath}
    --namespace ${namespace}
    -f ${valuesFilePath}
    ${setArgs}
    --create-namespace
    --wait
    --timeout 10m
  `.replace(/\s+/g, " ");

  return execPromise(cmd);
}

/**
 * Uninstall a Helm release
 * @param {string} release - Release name
 * @param {string} namespace - Kubernetes namespace
 */
function helmUninstall(release, namespace) {
  const cmd = `
    helm uninstall ${release}
    --namespace ${namespace}
  `.replace(/\s+/g, " ");

  return execPromise(cmd);
}

/**
 * Execute shell command with Promise wrapper
 */
function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    const proc = exec(
      cmd,
      { maxBuffer: 20 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) {
          return reject(new Error(stderr || err.message));
        }
        resolve(stdout);
      }
    );

    // Stream logs live (great for demo + debugging)
    proc.stdout?.pipe(process.stdout);
    proc.stderr?.pipe(process.stderr);
  });
}

module.exports = {
  helmInstall,
  helmUninstall,
};
