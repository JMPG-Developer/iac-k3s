# Variables
KUBECTL = kubectl
NAMESPACE = sonarqube
FILES = sonarqube.yaml

# Targets
.PHONY: all apply clean

# Por defecto, aplica todos los YAML en el directorio
all: apply

apply:
	@echo "Applying Kubernetes manifests to namespace $(NAMESPACE)..."
	kubectl create namespace $(NAMESPACE)
	for file in $(FILES); do \
		$(KUBECTL) apply -n $(NAMESPACE) -f $$file; \
	done

# Limpia (elimina) todos los recursos del namespace especificado
clean:
	@echo "Deleting Kubernetes resources in namespace $(NAMESPACE)..."
	for file in $(FILES); do \
		$(KUBECTL) delete -n $(NAMESPACE) -f $$file; \
	done
	kubectl delete namespace $(NAMESPACE)