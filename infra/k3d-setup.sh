#!/usr/bin/env bash
# Create k3d cluster with a loadbalancer and local-path storage
k3d cluster create urumi --servers 1 --agents 2 --port "80:80@loadbalancer" --wait
# install local-path storage (k3d gives local-path by default usually)
kubectl create ns ingress-basic || true
echo "k3d cluster created"
