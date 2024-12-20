kubectl create namespace kafka
helm install kafka bitnami/kafka -n kafka -f kafka-values.yaml