# Guía de contribución

## Objetivo del repo

`iac-k3s` mantiene solo tooling/infra compartida entre clusters (`hades`, `cronos`).

No se aceptan despliegues de microservicios de producto en este repositorio; esos despliegues van en sus repositorios propios.

## Convención de roles

Cada rol debe seguir:

```text
roles/<role>/
  defaults/main.yml
  tasks/main.yml
  templates/deploy.yaml.j2   # cuando aplique
```

Y ejecutarse con `kubernetes.core.k8s` sobre `k3s_kubeconfig`.

## Flags por host

Cada host activa/desactiva tooling con flags en `host_vars/<host>/vars.yml`:

- `cloudflared_enabled`
- `postgres_enabled`
- `github_runner_enabled`

`github_runner` usa `gh auth token` del control node para generar tokens frescos; no guardes registration tokens de runners en texto plano.

## Flujo de validación local

```bash
ansible-playbook -i inventory/hosts.yml playbooks/site.yml --syntax-check
ansible-lint roles/ playbooks/
```

Opcional para revisión de cambios:

```bash
ansible-playbook -i inventory/hosts.yml playbooks/site.yml --check --diff --ask-vault-pass
```

## Commits

Usar commits convencionales:

- `feat(...)`
- `fix(...)`
- `docs(...)`
- `chore(...)`
- `ci(...)`
