# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato de este changelog se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), y este proyecto se adhiere al [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

### Added
- App `mongodb` con persistencia (PVC) en el catálogo declarativo de K3s
- Nuevo catálogo declarativo de aplicaciones por cluster con `k3s_apps` en `host_vars/<host>/vars.yml`
- Nuevo rol genérico `k3s_app_deployer` para desplegar apps del catálogo
- Nuevo playbook `playbooks/apps.yml` como capa principal de despliegue de aplicaciones
- Soporte dual de despliegue por aplicación: `apply_mode=ansible|kubectl`
- Nuevos playbooks por capa: `bootstrap.yml` y `services.yml`
- Role `github_runner`: runners self-hosted de GitHub Actions parametrizados por lista
  - Soporta scope `org` y `repo` (necesario para repos de cuenta personal como `jmpgdev/portal`)
  - Token via Secret de k8s (antes hardcodeado en el YAML crudo de `cronos/`)
  - RBAC opcional por runner (`deploy_namespaces`): ServiceAccount + Role/RoleBinding limitados para desplegar via kubectl in-cluster
- Migración completa de IaC crudo de Kubernetes a roles Ansible
- Estructura base: `inventory`, `group_vars`, `host_vars`, `roles`, `playbooks`
- Role `common`: bootstrap de dependencias Python (kubernetes lib)
- Role `cloudflared`: Cloudflare Tunnel normalizado a un único formato de Secret
  - Soporta configuración DNS condicional por host
  - Tokens parametrizados y vaulteados por servidor
- Role `postgres`: PostgreSQL 14 con correcciones de seguridad
  - Corregido: ConfigMap → Secret para contraseñas
  - Passwords distintos y únicos por servidor
- Gestión de secretos con `ansible-vault`
  - Patrón de indirección: `vault.yml` (cifrado) ← `vars.yml` (plano)
- GitHub Actions workflows
  - `changelog.yml`: genera CHANGELOG automáticamente desde commits convencionales
  - `ansible-lint.yml`: valida sintaxis y mejores prácticas de Ansible
- `.gitignore`: macOS (.DS_Store), Ansible (*.retry), vault passwords
- README completamente reescrito con documentación de arquitectura, despliegue y troubleshooting

### Changed
- Reestructuración de manifiestos: `deployments/` → `apps/<app>/manifests/`
- `playbooks/site.yml` ahora orquesta bootstrap + `apps.yml`
- `playbooks/services.yml` y `playbooks/k3s_servers.yml` quedan como alias de compatibilidad
- Consolidación de despliegues en un modelo de catálogo (sin roles por app)
- `playbooks/site.yml` ahora orquesta bootstrap + despliegue de servicios
- `k3s_servers.yml` pasa a ser alias de compatibilidad hacia `services.yml`
- Variables globales divididas en `group_vars/all/k3s.yml` y `group_vars/all/services.yml`
- Estructura del repo: de YAML crudo por host a roles Ansible reutilizables
- Formato de Secret en cloudflared: normalizado a `stringData`/`TUNNEL_TOKEN` en los 3 hosts

### Fixed
- PostgreSQL: password almacenada en Secret (no ConfigMap)
- Elasticsearch: Namespace creado explícitamente en template (no depende de Makefile)
- Cloudflared: formato inconsistente de Secret entre servidores (3 variantes → 1 estándar)

### Security
- Tokens de Cloudflare Tunnel vaulteados (antes en texto plano/base64)
- Contraseña de Postgres movida de ConfigMap a Secret (almacenamiento seguro)
- Token de GitHub Runner vaulteado
- Contraseña de Artifactory en Jenkins vaulteada
- Correo ACME de cert-manager parametrizado (sacado de valores hardcodeados)

### Deprecated
- Makefile en carpetas de apps individuales (reemplazados por roles Ansible)

### Removed
- Dependencia de `kubectl apply -f` manual (ahora `ansible-playbook`)

### Notes
- Roles en construcción: `metallb`, `cert_manager`, `docker_registry`, `redpanda`, `github_runner`
- Requisito de coordinación: al aplicar nuevas passwords de Postgres, coordinar con consumidores de BD (backend, sonarqube, gaming-guild)

---

## Próximas releases

### v0.2.0 (Planned)
- Completar migración de todos los roles restantes
- GitHub Actions para validación pre-merge (`ansible-playbook --check`)
- Documentación de disaster recovery y rollback procedures

### v1.0.0 (Planned)
- Todos los roles Ansible completamente implementados y testeados
- CI/CD integration: auto-deploy en cambios a main
- Secretos completamente en vault (sin valores hardcodeados en git)
