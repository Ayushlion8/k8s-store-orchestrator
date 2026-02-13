# k8s-store-orchestrator

## Quick start (local)
1. Install: Docker, k3d, kubectl, helm, node/npm
2. Run infra:
   ```bash
   ./infra/k3d-setup.sh
   ./infra/install-ingress.sh

3. Install helm deps for chart:
    cd charts/medusa-store
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm dependency update
    cd ../../

4. Start orchestrator locally (dev):
    cd orchestrator
    npm install
    npm run dev

5. Start dashboard:
    cd dashboard
    npm install
    npm start