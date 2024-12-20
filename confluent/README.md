# Helm Deployment for Confluent

## Prerequisites
1. Kubernetes cluster up and running.
2. Helm installed.

## Installation

### Install Namespace
```bash
kubectl apply -f ../../namespaces/confluent-namespace.yaml