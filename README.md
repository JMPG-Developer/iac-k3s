# iac-k3s

Infraestructura como código para **tooling compartido de clusters k3s** gestionado con Ansible.

## Alcance del repositorio

Este repositorio solo contiene componentes de gestión reutilizables entre clusters, por ejemplo:

- `cloudflared`
- `postgres`
- `github_runner`
- bootstrap común (`common`)

Los **microservicios de producto** no se despliegan desde aquí: cada uno debe autodesplegarse desde su propio repositorio.

## Hosts gestionados

- `hades`
- `cronos`

## Estructura principal

```text
inventory/
  hosts.yml
group_vars/
host_vars/
roles/
playbooks/
  k3s_servers.yml
  site.yml
```

## Modelo de despliegue

`playbooks/k3s_servers.yml` aplica un set común de roles sobre `k3s_servers`, activando cada rol por host mediante flags:

- `cloudflared_enabled`
- `postgres_enabled`
- `github_runner_enabled`

Estas flags se definen en `host_vars/<host>/vars.yml`.

`github_runner` obtiene el access token del control node con `gh auth token` y genera un registration token fresco en cada despliegue, así que no hace falta mantener tokens de runner en claro en el repo.

## Uso

```bash
ansible-galaxy collection install -r requirements.yml
ansible-playbook -i inventory/hosts.yml playbooks/site.yml --ask-vault-pass
```

### Ejemplos por tag

```bash
ansible-playbook -i inventory/hosts.yml playbooks/site.yml --tags cloudflared --ask-vault-pass
ansible-playbook -i inventory/hosts.yml playbooks/site.yml --tags postgres --ask-vault-pass
ansible-playbook -i inventory/hosts.yml playbooks/site.yml --tags github_runner --ask-vault-pass
```

## Secretos

- Variables públicas por host: `host_vars/<host>/vars.yml`
- Secretos: `host_vars/<host>/vault.yml` (cifrado con `ansible-vault`)

## Validación recomendada

```bash
ansible-playbook -i inventory/hosts.yml playbooks/site.yml --syntax-check
ansible-lint roles/ playbooks/
```
