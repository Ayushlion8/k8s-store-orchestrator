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

   🚀 k8s-store-orchestrator

Multi-Tenant WooCommerce Orchestrator built with Kubernetes, Helm, Node.js, Prisma, Redis, and React.

🧱 Architecture Overview

User (React Dashboard)
⬇
Node.js Orchestrator (Express API)
⬇
PostgreSQL (Store metadata via Prisma)
⬇
Redis (BullMQ Job Queue)
⬇
Worker
⬇
Helm → Kubernetes
⬇
MySQL + WordPress + WooCommerce (Per Namespace)

⚙️ Tech Stack
## Frontend

React (Vite)

Axios

## Backend

Node.js

Express

Prisma 7

PrismaPg Adapter

PostgreSQL

Queue System

BullMQ

Redis

## Infrastructure

Kubernetes

Helm

MySQL

WordPress

WooCommerce

nip.io (Local domain routing)

📂 Project Structure

```
k8s-store-orchestrator/
│
├── charts/woocommerce-store
│   ├── templates/
│   │   ├── mysql-statefulset.yaml
│   │   ├── wordpress-deployment.yaml
│   │   ├── wordpress-service.yaml
│   │   └── wordpress-ingress.yaml
│   ├── Chart.yaml
│   └── values.yaml
│
├── orchestrator/
│   ├── src/
│   │   ├── api/
│   │   ├── provisioning/
│   │   ├── worker.js
│   │   └── server.js
│   └── prisma/
│
├── dashboard/
│   └── src/
│
└── infra/
```

🔧 Prerequisites

Install the following:

Docker Desktop (with Kubernetes enabled)

kubectl

helm

Node.js (v18+ recommended)

PostgreSQL

Redis

🚀 Quick Start (Local Setup)
1️⃣ Start PostgreSQL
```
createdb urumi
```

Create .env inside orchestrator/:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/urumi"
```

2️⃣ Run Prisma Setup
```
cd orchestrator
npx prisma generate
npx prisma migrate dev
cd ..
```

3️⃣ Start Redis
```
docker run -d -p 6379:6379 redis
```

4️⃣ Start Kubernetes

Enable Kubernetes in Docker Desktop.

Verify:
```
kubectl get nodes
```

5️⃣ Install Ingress Controller
```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

6️⃣ Start Orchestrator API
```
cd orchestrator
npm install
node src/server.js
```

Server runs on:
```
http://localhost:4000
```

7️⃣ Start Provision Worker (New Terminal)
```
cd orchestrator
node src/worker.js
```

8️⃣ Start Dashboard
```
cd dashboard
npm install
npm run dev
```

Open:
```
http://localhost:5173
```

🔁 Store Provisioning Flow

User creates store from dashboard

API saves store in PostgreSQL

Job pushed to Redis queue

Worker processes job:

Creates namespace

Generates dynamic Helm values

Installs Helm chart

Deploys MySQL StatefulSet

Deploys WordPress

Runs initContainer to install WooCommerce

Store status updated to READY

Store URL format:
```
http://store-xxxxxxx.127.0.0.1.nip.io
```

🧪 Useful Kubernetes Commands
Check pods
```
kubectl get pods -n store-xxxxxxx
```

View logs
```
kubectl logs -n store-xxxxxxx <pod-name>
```

Delete store namespace
```
kubectl delete namespace store-xxxxxxx
```

