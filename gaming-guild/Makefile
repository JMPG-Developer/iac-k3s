# Variables
KUBECTL = kubectl
NAMESPACE = gaming-guild
YAML_FILES := $(wildcard *.yaml)

# Targets
.PHONY: all apply clean

# Por defecto, aplica todos los YAML en el directorio
all: apply

apply:
	@echo "Archivos YAML encontrados:"
	@for file in $(YAML_FILES); do \
		echo "Procesando $$file"; \
		$(KUBECTL) apply -n $(NAMESPACE) -f $$file; \
	done

clean:
	@echo "Deleting K8s resources in namespace $(NAMESPACE)..."
	for file in $(YAML_FILES); do \
		$(KUBECTL) delete -n $(NAMESPACE) -f $$file; \
	done
	kubectl delete namespace $(NAMESPACE)