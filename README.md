# iac-k3s

Infraestructura como código para desplegar **aplicaciones compartidas en clusters K3s** usando Ansible.

## Alcance del repositorio

Este repositorio contiene:

- **catálogo de aplicaciones** (manifiestos en `apps/`)
- **configuración por cluster** (`host_vars/`)
- **orquestación de despliegue** con Ansible

Los microservicios de producto siguen fuera de este repositorio.

## Hosts gestionados

- `hades`
- `cronos`

## Estructura principal

```text
inventory/
  hosts.yml
group_vars/
  all/
    k3s.yml
    services.yml
host_vars/
apps/
  cloudflared/manifests/deploy.yaml.j2
  postgres/manifests/deploy.yaml.j2
  github_runner/manifests/deploy.yaml.j2
  cert_manager/manifests/deploy.yaml.j2
  mongodb/manifests/deploy.yaml.j2
roles/
  common/
  k3s_app_deployer/
playbooks/
  bootstrap.yml
  apps.yml
  site.yml
  services.yml      # alias de compatibilidad
  k3s_servers.yml   # alias de compatibilidad
```

## Modelo de despliegue por aplicación

Cada host define su lista de aplicaciones en `host_vars/<host>/vars.yml`:

```yaml
k3s_apps:
  - name: cloudflared
    enabled: true
    apply_mode: ansible   # ansible | kubectl
    values:
      cloudflared_tunnel_token: "{{ vault_cloudflared_tunnel_token }}"
```

- `name`: app del catálogo (`k3s_app_catalog` en `group_vars/all/services.yml`)
- `enabled`: activa/desactiva por cluster
- `apply_mode`:
  - `ansible` (default): aplica con `kubernetes.core.k8s`
  - `kubectl`: aplica con `kubectl apply`
- `values`: overrides por cluster/app

`playbooks/site.yml` ejecuta:
1. `bootstrap.yml` (prerequisitos del nodo)
2. `apps.yml` (despliegue de catálogo)

## Uso

```bash
ansible-galaxy collection install -r requirements.yml
ansible-playbook -i inventory/hosts.yml playbooks/site.yml --ask-vault-pass
```

### Ejemplos de ejecución

```bash
ansible-playbook -i inventory/hosts.yml playbooks/site.yml --tags bootstrap --ask-vault-pass
ansible-playbook -i inventory/hosts.yml playbooks/apps.yml --ask-vault-pass
ansible-playbook -i inventory/hosts.yml playbooks/apps.yml --limit hades --ask-vault-pass
ansible-playbook -i inventory/hosts.yml playbooks/apps.yml --limit cronos --ask-vault-pass
```

## Secretos

- Variables públicas por host: `host_vars/<host>/vars.yml`
- Secretos: `host_vars/<host>/vault.yml` (cifrado con `ansible-vault`)

## Validación recomendada

```bash
ansible-playbook -i inventory/hosts.yml playbooks/site.yml --syntax-check
ansible-lint roles/ playbooks/
```
