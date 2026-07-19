# Guía de Contribución

Este documento describe cómo contribuir cambios al repositorio `iac-k3s`.

## Convenciones de commits

Usamos **commits convencionales** (`conventional commits`) para mantener un historial de cambios legible y generar automáticamente el CHANGELOG.

### Formato de commit

```
<tipo>[<scope>]: <descripción>

[cuerpo]

[pie]
```

### Tipos de commit

| Tipo | Emoji | Uso | CHANGELOG |
|------|-------|-----|-----------|
| `feat` | ✨ | Nueva funcionalidad (nuevo role, playbook, etc.) | ✅ (Added) |
| `fix` | 🐛 | Bug fix | ✅ (Fixed) |
| `security` | 🔒 | Fix de seguridad | ✅ (Security) |
| `perf` | ⚡ | Mejora de performance | ✅ (Changed) |
| `refactor` | ♻️ | Reescritura sin cambiar funcionalidad | ❌ |
| `chore` | 🔧 | Cambios en deps, build, CI/CD, etc. | ❌ |
| `docs` | 📝 | Cambios en documentación | ❌ |
| `style` | 💅 | Formato, spacing, comillas, etc. | ❌ |
| `test` | ✅ | Cambios en tests | ❌ |
| `ci` | 🔄 | Cambios en GitHub Actions, scripts de CI | ❌ |
| `revert` | ↩️ | Revert a un commit anterior | ✅ |

### Scopes sugeridos

Use scopes para precisar qué parte del repo cambió:

- `roles` — cambios en la carpeta `roles/`
- `playbooks` — cambios en `playbooks/`
- `inventory` — cambios en `inventory/`
- `group_vars` — cambios en `group_vars/`
- `host_vars` — cambios en `host_vars/`
- `workflows` — cambios en `.github/workflows/`
- `docs` — cambios en documentación (README.md, CONTRIBUTING.md, etc.)

### Ejemplos

```bash
# Nuevo role
git commit -m "feat(roles): agregar role jenkins

Implementa Jenkins + docker-in-docker para el servidor zeus.
Incluye RBAC, PVCs, y Ingress vía Traefik."

# Bug fix
git commit -m "fix(postgres): corregir Secret vaulteado

El Secret de postgres no estaba siendo descifrado correctamente.
Añadida referencia {{ vault_* }} en vars.yml."

# Mejora de seguridad
git commit -m "security(cloudflared): vaultear token

Los tokens de Cloudflare Tunnel se guardaban en texto plano.
Movidos a vault.yml con cifrado ansible-vault."

# Cambio en documentación
git commit -m "docs(README): actualizar instrucciones de despliegue"

# Cambio en CI/CD
git commit -m "ci(workflows): añadir ansible-lint al pipeline"

# Cambio en infraestructura (deps, etc.)
git commit -m "chore(requirements): actualizar kubernetes.core a 3.1.0"
```

## Flujo de trabajo para contribuir

### 1. Crear rama de feature
```bash
git checkout -b feat/nombre-del-cambio
# O bug fix:
git checkout -b fix/descripcion-del-bug
```

### 2. Hacer cambios
```bash
# Editar archivos, crear roles, etc.
```

### 3. Validar antes de commit

```bash
# Ejecutar ansible-lint localmente
ansible-lint roles/ playbooks/

# Validar sintaxis YAML
for file in inventory/*.yml group_vars/**/*.yml host_vars/**/*.yml playbooks/*.yml; do
  python3 -m yaml "$file" || echo "Error en $file"
done

# Si hay cambios a roles, testear en dry-run:
ansible-playbook -i inventory/hosts.yml playbooks/hades.yml \
  --check --diff \
  --ask-vault-pass
```

### 4. Commit con mensaje convencional
```bash
git add roles/nuevo_role/ playbooks/hades.yml
git commit -m "feat(roles): agregar nuevo role

Descripción larga del cambio si es necesario.

Co-Authored-By: Tu Nombre <tu-email@example.com>"
```

### 5. Push y crear PR
```bash
git push origin feat/nombre-del-cambio
# Ir a GitHub y crear Pull Request
```

### 6. Esperar validación
GitHub Actions ejecutará:
- **`ansible-lint`**: valida sintaxis y mejores prácticas
- Cualquier otro check que esté configurado

### 7. Merge y CHANGELOG automático
Una vez aprobado, al hacer merge a `main`:
- GitHub Actions genera/actualiza `CHANGELOG.md` automáticamente
- Usa tus commits convencionales como entrada

## Reglas para roles Ansible

Todos los roles deben seguir este patrón:

```
roles/nombre_role/
├── defaults/main.yml      # Variables con valores por defecto
├── tasks/main.yml         # Tareas a ejecutar
└── templates/             # Templates Jinja2 (si son necesarios)
    └── deploy.yaml.j2
```

### Checklist para un nuevo rol

- [ ] Directorio del rol creado con estructura estándar
- [ ] `defaults/main.yml`: todas las variables documentadas
- [ ] `tasks/main.yml`: tarea única que aplica el manifiesto
- [ ] `templates/deploy.yaml.j2`: manifiesto Kubernetes templatizado
- [ ] Variables públicas en `host_vars/<host>/vars.yml`
- [ ] Secretos en `host_vars/<host>/vault.yml` (cifrado)
- [ ] Role añadido al playbook del servidor correspondiente con su tag
- [ ] Validado con `--check --diff` antes de commit
- [ ] Mensaje de commit convencional: `feat(roles): agregar role xyz`

## Patrón de variables por rol

```yaml
# defaults/main.yml
---
nombre_role_namespace: nombre-role
nombre_role_image: nombre-imagen:latest
nombre_role_replicas: 1
nombre_role_token: null  # Se sobrescribe en host_vars

# host_vars/servidor/vars.yml
nombre_role_token: "{{ vault_nombre_role_token }}"
nombre_role_replicas: 2  # Sobrescribe el default solo en este servidor

# host_vars/servidor/vault.yml (cifrado)
vault_nombre_role_token: "valor-secreto-real"
```

## Validación en CI/CD

Los siguientes checks se ejecutan automáticamente:

### `ansible-lint`
```bash
# Ejecuta localmente antes de commit:
ansible-lint roles/ playbooks/
```

Busca:
- Sintaxis incorrecta de YAML
- Mejores prácticas Ansible (variables hardcodeadas, tareas sin nombre, etc.)
- Estructura incorrecta de directorios

### Validación de YAML
```bash
# Ya se valida en ansible-lint, pero puedes ejecutar manualmente:
python3 -m yaml inventory/hosts.yml
python3 -m yaml group_vars/all/vars.yml
```

### Conventional Changelog
```bash
# Los commits deben cumplir el formato convencional
# GitHub Actions lo valida automáticamente
# Mensaje de error si el commit no cumple el formato
```

## Preguntas frecuentes

### ¿Qué pasa si hago un commit con mensaje incorrecto?
Puedes corregir el último commit:
```bash
git commit --amend -m "feat(roles): mensaje correcto"
git push origin rama --force  # Solo si no está merged a main
```

O hacer un nuevo commit de tipo `revert`:
```bash
git commit -m "revert: undo incorrect commit abc123"
```

### ¿Cómo genero el CHANGELOG localmente?
```bash
npm install -g conventional-changelog-cli
conventional-changelog -p conventionalcommits -i CHANGELOG.md
```

### ¿Los BREAKING CHANGES afectan el versionado?
Sí, si en el pie del commit escribes `BREAKING CHANGE:` o `BREAKING-CHANGE:`, se considera un cambio de versión mayor (v1.x → v2.0).

Ejemplo:
```
feat: cambiar nombre del namespace de apps

BREAKING CHANGE: El namespace cambió de 'mi-app' a 'mi-aplicacion'.
Los usuarios deben actualizar sus conexiones.
```

### ¿Puedo hacer commits sin scope?
Sí, es opcional. Pero es recomendado para mejor trazabilidad:
```bash
# Sin scope (válido pero menos informativo)
git commit -m "fix: corregir indentación"

# Con scope (mejor)
git commit -m "fix(roles): corregir indentación en deploy.yaml.j2"
```

### ¿Y si necesito hacer un cambio trivial (typo en comentario)?
Usa `chore` o `docs`:
```bash
git commit -m "docs: corregir typo en README"
git commit -m "chore: actualizar comentario en defaults/main.yml"
```

Estos commits no aparecen en el CHANGELOG, así que son "invisibles" para el historial de releases.

## Reportar issues

Si encuentras un problema, abre un issue en GitHub con:
1. **Descripción clara** del problema
2. **Pasos para reproducir**
3. **Output de error** (si aplica)
4. **Ambiente**: SO, versión de Ansible, servidor afectado (hades/zeus/cronos)

Ejemplo:
```
### Descripción
Al desplegar el role cloudflared en cronos, el Pod no se crea.

### Pasos para reproducir
1. ansible-playbook -i inventory/hosts.yml playbooks/cronos.yml --tags cloudflared --ask-vault-pass
2. Ver logs: ansible cronos -i inventory/hosts.yml -b -m shell -a "kubectl get pods -n cloudflared"

### Output
NAME                    READY   STATUS             RESTARTS   AGE
cloudflared-deploy...   0/2     CrashLoopBackOff   3          2m

### Ambiente
- Ansible: 2.15.2
- kubernetes.core: 3.0.1
- Servidor: cronos
```

## Contacto

Para preguntas o dudas, contacta al equipo de DevOps de JMPG-Developer.

---

Gracias por contribuir a mejorar este proyecto. 🚀
