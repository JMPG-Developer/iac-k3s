# Variables
KUBECTL = kubectl
NAMESPACE = kafka
FILES = zookeeper.yaml kafka.yaml schema-registry.yaml kowl.yaml

# Targets
.PHONY: all apply clean

# Por defecto, aplica todos los YAML en el directorio
all: apply

apply:
	@echo "Applying Kubernetes manifests to namespace $(NAMESPACE)..."
	@$(KUBECTL) get namespace $(NAMESPACE) || $(KUBECTL) create namespace $(NAMESPACE)
	for file in zookeeper.yaml kafka.yaml; do \
		$(KUBECTL) apply -n $(NAMESPACE) -f $$file; \
	done
	@echo "Waiting for Kafka to be ready..."
	$(KUBECTL) wait --namespace $(NAMESPACE) \
		--for=condition=ready pod \
		--selector=app=kafka \
		--timeout=300s
	@echo "Kafka is ready. Deploying Kowl..."
	$(KUBECTL) apply -n $(NAMESPACE) -f schema-registry.yaml
	$(KUBECTL) apply -n $(NAMESPACE) -f kowl.yaml

# Limpia (elimina) todos los recursos del namespace especificado
clean:
	@echo "Deleting Kubernetes resources in namespace $(NAMESPACE)..."
	for file in $(FILES); do \
		$(KUBECTL) delete -n $(NAMESPACE) -f $$file; \
	done
	kubectl delete namespace $(NAMESPACE)