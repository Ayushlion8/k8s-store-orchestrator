#!/usr/bin/env bash
# Example: install nginx-ingress controller using Helm
kubectl create ns ingress-nginx || true
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --wait
echo "Ingress controller installed"
