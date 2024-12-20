# Infraestructura: Elasticsearch y SonarQube

## Elasticsearch (Ubuntu)
- Instalado en: `http://<ubuntu-server-ip>:9200`
- Configuración:
  - `network.host: 0.0.0.0`
  - `discovery.type: single-node`

## SonarQube (k3s)
- Namespace: `sonarqube`
- Instalación con Helm:
  ```bash
  helm install sonarqube sonarqube/sonarqube -n sonarqube -f sonarqube-values.yaml
