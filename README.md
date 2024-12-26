# Infraestructura

## Requerimientos
- Servidor (Ubuntu)
- Servidor con k3s configurado

## Componentes Principales

### 1. Elasticsearch (Ubuntu)
Log Management
- Namespace: `elasticsearch`
- Puerto expuesto por defecto: `9200` (NodePort `30000`)
- Despliegue en Ubuntu utilizando los YAML definidos en el directorio `elasticsearch`.

### 2. SonarQube (k3s)
Quality Code
- Namespace: `sonarqube`
- Puerto expuesto por defecto: `9000` (NodePort `30091`)
- Despliegue en Ubuntu utilizando los YAML definidos en el directorio `sonarqube`.

### 3. Nexus (k3s)
Artifactory
- Namespace: `nexus`
- Puerto expuesto por defecto: `8081` (NodePort `30082`)
- Almacén de artefactos, con PVC definido para persistir datos.
- Despliegue manual con los YAML en el directorio `nexus`.

### 4. Kafka y Zookeeper (k3s)
Kafka Server
- Namespace: `kafka`
- Zookeeper (puerto `2181`) y Kafka (puerto `9092`) expuestos como NodePort.
- Utiliza Kubernetes para coordinar los contenedores de Kafka y Zookeeper.
- Archivos principales en el directorio `kafka` (`zookeeper.yaml`, `kafka.yaml`).

### 5. Apicurio Registry (k3s)
Schema Registry para Kafka
- Se despliega con `schema-registry.yaml` en el namespace `kafka`.
- Conecta con Kafka (`kafka.kafka.svc.cluster.local:9092`) para el almacenamiento de esquemas.
- Puerto expuesto: `8080` (NodePort `30081`).

### 6. Kowl (UI para Kafka)
UI Kafka & Schema Registry
- Desplegado con `kowl.yaml` en el namespace `kafka`.
- Interfaz web para monitorear y administrar Kafka.
- Puerto expuesto: `8080` (NodePort `30070`).

## Cómo Desplegar
Cada directorio posee un `Makefile` para facilitar el despliegue:
1. Entrar en el directorio de cada componente (por ejemplo, `cd elasticsearch`)  
2. Ejecutar `make apply` para desplegar la configuración YAML.
3. Verificar que los pods estén en estado `Running`:
   ```bash
   kubectl get pods -n <namespace>
   ```

## Limpieza de Recursos
Para eliminar todo lo desplegado en un directorio, se puede ejecutar:
```bash
make clean
```
Esto borrará los recursos y el namespace asociado.

## Notas Adicionales
- Revisar los valores de `NodePort` para acceder externamente a cada servicio.
- Ajustar los valores de almacenamiento (`storage`) y memoria (`ES_JAVA_OPTS`, etc.) según las necesidades del entorno.
- Para entornos de producción, usar más réplicas y almacenamiento persistente adecuado.