# Guía de contribución

## Objetivo del repo

`iac-k3s` mantiene solo tooling/infra compartida entre clusters (`hades`, `cronos`).

No se aceptan despliegues de microservicios de producto en este repositorio; esos despliegues van en sus repositorios propios.

## Convención de aplicaciones

Cada aplicación del catálogo debe seguir:

```text
apps/<app>/
  manifests/deploy.yaml.j2
```

Los valores base de cada app se registran en:

```text
group_vars/all/services.yml -> k3s_app_catalog
```

Y los overrides por cluster en:

```text
host_vars/<host>/vars.yml -> k3s_apps
```

## Convención de roles

- `roles/common`: prerequisitos del host.
- `roles/k3s_app_deployer`: motor genérico de despliegue.

## Convención de playbooks

- `playbooks/bootstrap.yml`: bootstrap de host.
- `playbooks/apps.yml`: despliegue de catálogo de apps.
- `playbooks/site.yml`: orquestación principal.
- `playbooks/services.yml` y `playbooks/k3s_servers.yml`: aliases de compatibilidad.

## Modelo por host

Cada host declara una lista `k3s_apps` con:

- `name`
- `enabled`
- `apply_mode` (`ansible` o `kubectl`)
- `values`

`github_runner` usa `gh auth token` del control node para generar tokens frescos; no guardes tokens en texto plano.

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
