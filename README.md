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
Frontend

React (Vite)

Axios

Backend

Node.js

Express

Prisma 7

PrismaPg Adapter

PostgreSQL

Queue System

BullMQ

Redis

Infrastructure

Kubernetes

Helm

MySQL

WordPress

WooCommerce

nip.io (Local domain routing)

📂 Project Structure
