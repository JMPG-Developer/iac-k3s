#!/bin/bash
NAMESPACE="confluent"
VALUES_FILE="./values.yaml"

# Create namespace if it doesn't exist
kubectl get namespace $NAMESPACE >/dev/null 2>&1 || kubectl create namespace $NAMESPACE

# Install or upgrade Confluent Helm Chart
helm upgrade --install confluent-operator \
  confluentinc/confluent-for-kubernetes \
  --namespace $NAMESPACE \
  -f $VALUES_FILE

kubectl apply -f ./ingress.yaml -n $NAMESPACE