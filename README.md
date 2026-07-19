# iac-k3s: Infraestructura como Código para k3s con Ansible

[![Validar Ansible](https://github.com/JMPG-Developer/iac-k3s/actions/workflows/ansible-lint.yml/badge.svg)](https://github.com/JMPG-Developer/iac-k3s/actions/workflows/ansible-lint.yml)
[![CHANGELOG](https://img.shields.io/badge/changelog-v0.1.0-blue)](CHANGELOG.md)

Gestión declarativa de 3 clusters k3s standalone independientes (`hades`, `zeus`, `cronos`) mediante **Ansible**, roles templatizados con **Jinja2**, y secretos cifrados con **ansible-vault**.

## 🎯 Objetivo

Transformar el repo de IaC de **YAML crudo y aplicación manual** (`kubectl apply -f`) a un **proyecto Ansible profesional** donde:
- ✅ Cada aplicación es un rol reutilizable y parametrizado
- ✅ Los 3 servidores (hades, zeus, cronos) son hosts gestionados por un inventory
- ✅ Los secretos están cifrados con `ansible-vault`, no en texto plano
- ✅ Se aplican cambios declarativamente con `ansible-playbook`
- ✅ Hay trazabilidad total (versionado en git, commits convencionales)
- ✅ Es fácil añadir nuevas aplicaciones siguiendo un patrón consistente

## 📋 Resumen de cambios realizados

### Estructura base creada
- **`ansible.cfg`**: configuración central (inventory, roles_path, become method)
- **`requirements.yml`**: dependencias (colección `kubernetes.core`)
- **`inventory/hosts.yml`**: 3 hosts (hades, zeus, cronos) en grupo `k3s_servers`
- **`group_vars/`**: variables globales y de grupo
- **`host_vars/`**: variables por servidor (planas + cifradas con vault)
- **`roles/`**: roles Ansible reutilizables (comunes a todos, específicos por app)
- **`playbooks/`**: orquestación (`site.yml` + playbooks por servidor)
- **`.gitignore`**: macOS (.DS_Store), Ansible (*.retry), vault passwords
- **`CHANGELOG.md`**: changelog automático desde commits convencionales
- **GitHub Actions workflows**:
  - `changelog.yml`: genera/actualiza CHANGELOG automáticamente
  - `ansible-lint.yml`: valida sintaxis y mejores prácticas de Ansible

### Roles implementados
1. **`common`** — Bootstrap de dependencias Python
2. **`cloudflared`** — Cloudflare Tunnel (normalizado a formato único)
3. **`postgres`** — PostgreSQL 14 (bug ConfigMap→Secret corregido)

### Seguridad y correcciones aplicadas
| Problema | Solución |
|----------|----------|
| Tokens/contraseñas en texto plano | ✅ Vaulteados con `ansible-vault` |
| ConfigMap para Postgres password | ✅ Movido a Secret (tipo Opaque) |
| 3 formatos de Secret en cloudflared | ✅ Normalizado a `stringData`/`TUNNEL_TOKEN` |
| Contraseña reutilizada entre servidores | ✅ Passwords distintos por host (hades ≠ zeus) |
| Elasticsearch sin Namespace explícito | ✅ Template crea Namespace (no depende de Makefile) |
| README desactualizado | ✅ Completamente reescrito |

## 🏗️ Arquitectura

```
Tu máquina (Control Node)
    ↓
    ├─ ansible-playbook -i inventory/hosts.yml playbooks/site.yml --ask-vault-pass
    │
    ├─ SSH a hades.example.com
    │   └─ kubernetes.core.k8s ejecuta localmente contra /etc/rancher/k3s/k3s.yaml
    │       ├─ cloudflared (Deployment, Secret, Namespace)
    │       ├─ postgres (PV, PVC, Secret, Service)
    │       └─ ... (otros roles)
    │
    ├─ SSH a zeus.example.com
    │   └─ kubernetes.core.k8s ejecuta localmente contra /etc/rancher/k3s/k3s.yaml
    │       ├─ cloudflared (con DNS personalizado)
    │       ├─ postgres
    │       └─ ... (confluent_kafka, jenkins, etc. en construcción)
    │
    └─ SSH a cronos.example.com
        └─ kubernetes.core.k8s ejecuta localmente contra /etc/rancher/k3s/k3s.yaml
            ├─ cloudflared
            └─ ... (redpanda, github_runner en construcción)
```

**Ventaja**: No expone el API server (6443) hacia internet — Ansible ejecuta el módulo `kubernetes.core.k8s` directamente en cada servidor contra su kubeconfig local (`/etc/rancher/k3s/k3s.yaml`).

## ⚙️ Requisitos previos

1. **Ansible ≥ 2.15** en tu máquina:
   ```bash
   ansible --version  # debe salir 2.15 o superior
   ```

2. **Colección `kubernetes.core`**:
   ```bash
   ansible-galaxy collection install -r requirements.yml
   ```

3. **Acceso SSH sin password** a los 3 servidores:
   ```bash
   ssh root@hades "echo OK"  # no debe pedir password
   ssh root@zeus "echo OK"
   ssh root@cronos "echo OK"
   ```
   Si pide password, configura primero:
   ```bash
   ssh-copy-id -i ~/.ssh/id_rsa.pub root@hades
   ssh-copy-id -i ~/.ssh/id_rsa.pub root@zeus
   ssh-copy-id -i ~/.ssh/id_rsa.pub root@cronos
   ```

4. **Contraseña de ansible-vault**: se proporciona fuera del repo (no en git).
   - Se solicita interactivamente con `--ask-vault-pass`
   - O se guarda en un archivo (ej. `~/.vault_pass`) y se usa con `--vault-password-file=~/.vault_pass`

5. **Python 3 + pip en cada servidor**: lo instala automáticamente `roles/common`

6. **Actualizar IPs/dominios en `inventory/hosts.yml`**:
   ```yaml
   hades:
     ansible_host: <tu-ip-o-dominio-hades>
   zeus:
     ansible_host: <tu-ip-o-dominio-zeus>
   cronos:
     ansible_host: <tu-ip-o-dominio-cronos>
   ```

7. **Valores reales en `host_vars/<host>/vault.yml`**: reemplazar placeholders con datos reales (tokens, contraseñas, etc.)

## 🚀 Cómo desplegar

### Instalación inicial de dependencias
```bash
# Clonar este repo
git clone https://github.com/JMPG-Developer/iac-k3s.git
cd iac-k3s

# Instalar colección kubernetes.core
ansible-galaxy collection install -r requirements.yml

# Verificar conectividad SSH a los 3 servidores
ansible all -i inventory/hosts.yml -m ping
```

### Desplegar todo (todos los roles en todos los servidores)
```bash
ansible-playbook -i inventory/hosts.yml playbooks/site.yml --ask-vault-pass
```

### Desplegar un solo servidor
```bash
# Solo hades
ansible-playbook -i inventory/hosts.yml playbooks/hades.yml --ask-vault-pass

# Solo zeus
ansible-playbook -i inventory/hosts.yml playbooks/zeus.yml --ask-vault-pass
```

### Desplegar un solo rol/app en todos sus servidores
```bash
# cloudflared en los 3 servidores
ansible-playbook -i inventory/hosts.yml playbooks/site.yml --tags cloudflared --ask-vault-pass

# postgres en hades y zeus
ansible-playbook -i inventory/hosts.yml playbooks/site.yml --tags postgres --ask-vault-pass
```

### Dry-run (validar cambios SIN aplicarlos)
```bash
# Ver qué cambiaría sin hacer nada
ansible-playbook -i inventory/hosts.yml playbooks/hades.yml \
  --tags postgres \
  --check --diff \
  --ask-vault-pass
```

### Usar un archivo de contraseña en lugar de `--ask-vault-pass`
```bash
# Guardar la contraseña en un archivo (únicamente lectura)
echo "mi-contraseña-secreta" > ~/.vault_pass
chmod 600 ~/.vault_pass

# Usar el archivo
ansible-playbook -i inventory/hosts.yml playbooks/site.yml \
  --vault-password-file=~/.vault_pass

# IMPORTANTE: nunca commitees ~/.vault_pass a git (ya está en .gitignore)
```

## 📁 Estructura del repo

```
iac-k3s/
├── README.md                       # Este archivo
├── CHANGELOG.md                    # Changelog automático (generado por GitHub Actions)
├── .gitignore                      # Archivos a ignorar
├── ansible.cfg                     # Configuración de Ansible
├── requirements.yml                # Dependencias (colecciones)
├──
├── inventory/
│   └── hosts.yml                   # 3 hosts: hades, zeus, cronos
│
├── group_vars/
│   ├── all/
│   │   └── vars.yml                # Globales: cert_manager_acme_email, k3s_kubeconfig
│   └── k3s_servers/
│       └── vars.yml                # De grupo: ansible_user, become, become_method
│
├── host_vars/
│   ├── hades/
│   │   ├── vars.yml                # Variables de hades (plano)
│   │   └── vault.yml               # Secretos de hades (cifrado)
│   ├── zeus/
│   │   ├── vars.yml
│   │   └── vault.yml
│   └── cronos/
│       ├── vars.yml
│       └── vault.yml
│
├── roles/                          # Roles Ansible reutilizables
│   ├── common/                     # Bootstrap: pip3 + librería kubernetes
│   │   └── tasks/main.yml
│   │
│   ├── cloudflared/                # Cloudflare Tunnel
│   │   ├── defaults/main.yml       # cloudflared_namespace, replicas, image, etc.
│   │   ├── tasks/main.yml          # Tarea que aplica el manifiesto
│   │   └── templates/deploy.yaml.j2 # Template Jinja2 con Namespace+Secret+Deployment
│   │
│   ├── postgres/                   # PostgreSQL 14
│   │   ├── defaults/main.yml
│   │   ├── tasks/main.yml
│   │   └── templates/deploy.yaml.j2
│   │
│   └── ... (otros roles en construcción)
│
├── playbooks/
│   ├── site.yml                    # Orquestador (import de los 3 siguientes)
│   ├── hades.yml                   # Roles para servidor hades
│   ├── zeus.yml                    # Roles para servidor zeus
│   └── cronos.yml                  # Roles para servidor cronos
│
└── .github/
    └── workflows/
        ├── changelog.yml           # GitHub Actions: genera CHANGELOG automáticamente
        └── ansible-lint.yml        # GitHub Actions: valida sintaxis Ansible
```

## 🔐 Gestión de secretos con ansible-vault

Cada servidor tiene dos archivos en `host_vars/<host>/`:
- **`vars.yml`**: variables públicas (plano, versionado en git)
- **`vault.yml`**: secretos cifrados (todo el archivo está encriptado)

### Patrón de referencia
```yaml
# host_vars/hades/vars.yml (público)
cloudflared_tunnel_token: "{{ vault_cloudflared_tunnel_token }}"
postgres_password: "{{ vault_postgres_password_hades }}"

# host_vars/hades/vault.yml (cifrado, todo el archivo)
vault_cloudflared_tunnel_token: "eyJhIjoiMjc3OGEwMzM2ZDM4ZjZlN2UzYTBkMjliZGEyMTI4NGMi..."
vault_postgres_password_hades: "nueva-password-segura-123"
```

### Editar un secreto
```bash
# Desencripta, abre editor, recifra automáticamente
ansible-vault edit host_vars/hades/vault.yml --ask-vault-pass
```

### Ver un secreto (solo lectura)
```bash
ansible-vault view host_vars/hades/vault.yml --ask-vault-pass
```

### Crear un nuevo archivo vaulteado
```bash
ansible-vault create host_vars/hades/vault_new.yml --ask-vault-pass
```

### Cambiar la contraseña de vault
```bash
ansible-vault rekey host_vars/*/vault.yml --ask-vault-pass
```

## 📝 Patrón de un rol (ejemplo: cloudflared)

Cada rol sigue una estructura estándar:

### 1. `defaults/main.yml` — variables por defecto
```yaml
---
cloudflared_namespace: cloudflared
cloudflared_secret_name: tunnel-token
cloudflared_replicas: 2
cloudflared_image: cloudflare/cloudflared:latest
cloudflared_loglevel: debug
cloudflared_metrics_port: 2000
cloudflared_dns_enabled: false  # Se puede sobreescribir por host
cloudflared_dns_nameservers:
  - 1.1.1.1
  - 8.8.8.8
```

### 2. `tasks/main.yml` — qué hacer
```yaml
---
- name: Aplicar manifiestos de cloudflared
  kubernetes.core.k8s:
    kubeconfig: "{{ k3s_kubeconfig }}"
    state: present
    definition: "{{ lookup('template', 'deploy.yaml.j2') | from_yaml_all | list }}"
```

### 3. `templates/deploy.yaml.j2` — manifiesto Kubernetes templatizado
```jinja2
apiVersion: v1
kind: Namespace
metadata:
  name: {{ cloudflared_namespace }}
---
apiVersion: v1
kind: Secret
metadata:
  name: {{ cloudflared_secret_name }}
  namespace: {{ cloudflared_namespace }}
type: Opaque
stringData:
  TUNNEL_TOKEN: "{{ cloudflared_tunnel_token }}"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cloudflared-deployment
  namespace: {{ cloudflared_namespace }}
spec:
  replicas: {{ cloudflared_replicas }}
  # ... resto del Deployment
{% if cloudflared_dns_enabled %}
  # bloque dnsConfig condicional solo en zeus
{% endif %}
```

### 4. `host_vars/<host>/vars.yml` — valores específicos del servidor
```yaml
cloudflared_tunnel_token: "{{ vault_cloudflared_tunnel_token }}"
# En zeus, además:
cloudflared_dns_enabled: true
```

### 5. `host_vars/<host>/vault.yml` — secretos cifrados
```yaml
vault_cloudflared_tunnel_token: "eyJhIjoiMjc3OGEwMzM2ZDM4ZjZlN2UzYTBkMjliZGEyMTI4NGMi..."
```

## ✨ Cómo añadir una nueva aplicación

1. **Crear estructura del role**:
   ```bash
   mkdir -p roles/mi_app/{defaults,tasks,templates}
   ```

2. **Escribir defaults**:
   ```bash
   cat > roles/mi_app/defaults/main.yml << 'EOF'
   ---
   mi_app_namespace: mi-app
   mi_app_image: mi-imagen:latest
   mi_app_replicas: 1
   mi_app_token: null
   EOF
   ```

3. **Escribir tasks**:
   ```bash
   cat > roles/mi_app/tasks/main.yml << 'EOF'
   ---
   - name: Aplicar manifiestos de mi_app
     kubernetes.core.k8s:
       kubeconfig: "{{ k3s_kubeconfig }}"
       state: present
       definition: "{{ lookup('template', 'deploy.yaml.j2') | from_yaml_all | list }}"
   EOF
   ```

4. **Escribir template** (Namespace + Secret + Deployment + Service):
   ```bash
   cat > roles/mi_app/templates/deploy.yaml.j2 << 'EOF'
   apiVersion: v1
   kind: Namespace
   metadata:
     name: {{ mi_app_namespace }}
   ---
   apiVersion: v1
   kind: Secret
   metadata:
     name: mi-app-secret
     namespace: {{ mi_app_namespace }}
   stringData:
     TOKEN: "{{ mi_app_token }}"
   ---
   apiVersion: apps/v1
   kind: Deployment
   # ... resto
   EOF
   ```

5. **Añadir variables a host_vars**:
   ```bash
   echo 'mi_app_token: "{{ vault_mi_app_token }}"' >> host_vars/hades/vars.yml
   ```

6. **Añadir secretos a vault**:
   ```bash
   ansible-vault edit host_vars/hades/vault.yml --ask-vault-pass
   # Añadir:
   # vault_mi_app_token: "valor-real"
   ```

7. **Añadir role al playbook**:
   ```bash
   # En playbooks/hades.yml, añadir:
   - { role: mi_app, tags: [mi-app] }
   ```

8. **Validar**:
   ```bash
   ansible-playbook -i inventory/hosts.yml playbooks/hades.yml \
     --tags mi-app \
     --check --diff \
     --ask-vault-pass
   ```

9. **Aplicar**:
   ```bash
   ansible-playbook -i inventory/hosts.yml playbooks/hades.yml \
     --tags mi-app \
     --ask-vault-pass
   ```

## 📊 Roles implementados vs. en construcción

| Rol | Servidor(es) | Estado | Notas |
|-----|--------------|--------|-------|
| `common` | todos | ✅ | Bootstrap Python + kubernetes lib |
| `cloudflared` | hades, zeus, cronos | ✅ | Normalizado a formato único |
| `postgres` | hades, zeus | ✅ | ConfigMap→Secret, passwords distintos |
| `metallb` | hades | 🔄 | Load balancer para bare-metal |
| `cert_manager` | hades, zeus, cronos | 🔄 | Let's Encrypt + Traefik |
| `docker_registry` | hades | 🔄 | Registry privado (era "artifactory") |
| `jmpg_developer_backend` | hades | 🔄 | Spring Boot backend |
| `jmpg_developer_frontend` | hades | 🔄 | Frontend frontend |
| `sonarqube` | hades | 🔄 | Code quality |
| `confluent_kafka` | zeus | 🔄 | Zookeeper + Broker + Schema Registry + Control Center |
| `elasticsearch` | zeus | 🔄 | Log management |
| `gaming_guild` | zeus | 🔄 | Backend |
| `jenkins` | zeus | 🔄 | CI/CD + docker-in-docker |
| `kafka_broker` | zeus | ❌ | Deshabilitado (redundante con confluent_kafka) |
| `redpanda` | cronos | 🔄 | Streaming via HelmChart CRD de k3s |
| `github_runner` | cronos | 🔄 | Self-hosted runner |

Leyenda: ✅ = implementado, 🔄 = en construcción, ❌ = deshabilitado

## 🐛 Troubleshooting

### "Failed to locate Python" en el servidor remoto
`roles/common` debería instalar python3-pip automáticamente. Si aún falla:
```bash
ssh root@hades "apt-get update && apt-get install -y python3-pip && pip3 install kubernetes"
```

### "Permission denied" al conectar por SSH
```bash
# Verificar conectividad
ssh -i ~/.ssh/id_rsa root@hades "echo OK"

# Si pide password, configurar clave:
ssh-copy-id -i ~/.ssh/id_rsa.pub root@hades
```

### "kubeconfig not found"
```bash
# Verificar que k3s está instalado
ssh root@hades "ls -la /etc/rancher/k3s/k3s.yaml"

# Si no existe, instalar k3s:
ssh root@hades "curl -sfL https://get.k3s.io | sh -"
```

### Ansible vault password incorrecto
```bash
# Verificar que introduces la contraseña correcta (sin saltos de línea)
ansible-playbook -i inventory/hosts.yml playbooks/hades.yml --ask-vault-pass

# O usar un archivo:
echo "contraseña" > ~/.vault_pass && chmod 600 ~/.vault_pass
ansible-playbook -i inventory/hosts.yml playbooks/hades.yml --vault-password-file=~/.vault_pass
```

### "ERROR! The vault password file was not readable"
```bash
chmod 600 ~/.vault_pass  # Debe ser 600 (rw-------)
```

### Los pods no se crean
```bash
# Ver qué está pasando
ansible hades -i inventory/hosts.yml -b -m shell \
  -a "kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml get pods -n cloudflared"

# Ver logs de eventos
ansible hades -i inventory/hosts.yml -b -m shell \
  -a "kubectl --kubeconfig=/etc/rancher/k3s/k3s.yaml describe pod -n cloudflared <pod-name>"
```

## 📚 GitHub Actions

### `changelog.yml` — Genera CHANGELOG automáticamente
- Trigger: push a `main` (excepto cambios a CHANGELOG.md, README.md)
- Acción: genera CHANGELOG desde commits convencionales
- Commit message: convención `feat:`, `fix:`, `chore:`, `docs:`, etc.
- Ejemplo:
  ```
  feat: agregar role jenkins
  fix: corregir formato de Secret en postgres
  chore: actualizar dependencias
  ```

### `ansible-lint.yml` — Valida Ansible
- Trigger: PR o push a `main` con cambios a roles/playbooks
- Acción: valida sintaxis, mejores prácticas, estructura de directorios

## 🔄 Flujo de contribución

1. Crear rama: `git checkout -b feat/nuevo-role`
2. Crear el rol siguiendo el patrón (ver sección anterior)
3. Añadir valores a `host_vars/` y `vault.yml`
4. Commit con mensaje convencional: `feat: agregar role xyz`
5. Push y crear PR
6. GitHub Actions valida (`ansible-lint`)
7. Merge a `main`
8. GitHub Actions genera/actualiza CHANGELOG automáticamente

## 📋 Próximas tareas

- [ ] Completar migración de roles restantes (metallb, cert_manager, docker_registry, etc.)
- [ ] Implementar validation playbook (`--check` pre-merge)
- [ ] Auto-deploy en cambios a `main`
- [ ] Documentación de disaster recovery y rollback
- [ ] Tests unitarios con Molecule
- [ ] Rotación automática de secretos (integración con gestores externos)

## 📖 Documentación adicional

- [Changelog (CHANGELOG.md)](CHANGELOG.md)
- [Plan de migración (ref. git)](docs/PLAN.md) — ver `.claude/plans/` en el control node
- [Commits convencionales](https://www.conventionalcommits.org/)
- [Ansible best practices](https://docs.ansible.com/ansible/latest/tips_tricks/index.html)
- [Kubernetes.core module](https://galaxy.ansible.com/community/kubernetes)

## 👨‍💼 Licencia

Interno para JMPG-Developer.

---

**Última actualización**: julio 2026  
**Autores**: Migración a Ansible por Claude Code  
**Estado**: 🔄 En progreso (3/16 roles completados)