# Package Publishing Workflows

Este directorio contiene dos workflows de GitHub Actions para automatizar la publicación de los packages de LLMonitor.

## Workflows Disponibles

### 1. `publish-packages.yml` (Básico)

Workflow simple que detecta cambios y publica packages automáticamente.

**Características:**

- Detecta cambios en `packages/sdk`, `packages/langchain`, y `packages/react`
- Publica solo los packages que han cambiado
- Maneja dependencias entre packages (langchain y react dependen de sdk)

### 2. `publish-packages-advanced.yml` (Avanzado)

Workflow más robusto con características adicionales.

**Características:**

- Detección inteligente de cambios
- Versionado automático cuando la versión ya existe en npm
- Cache de dependencias para builds más rápidos
- Ejecución de tests (si están disponibles)
- Creación automática de git tags
- Publicación manual con opciones de versionado
- Notificaciones de éxito

## Configuración Requerida

### 1. NPM Token

Necesitas configurar un token de NPM en los secrets de GitHub:

1. Ve a [npmjs.com](https://www.npmjs.com) y genera un token de acceso
2. En tu repositorio de GitHub, ve a Settings > Secrets and variables > Actions
3. Crea un nuevo secret llamado `NPM_TOKEN` con tu token de NPM

### 2. Permisos del Repositorio

Asegúrate de que el workflow tenga permisos para:

- Leer el código del repositorio
- Crear tags
- Escribir en el repositorio (para commits de versioning)

## Uso

### Publicación Automática

Los workflows se ejecutan automáticamente cuando:

- Se hace push a la rama `main`
- Hay cambios en cualquier archivo dentro de `packages/`

### Publicación Manual

Para el workflow avanzado, puedes ejecutarlo manualmente:

1. Ve a la pestaña "Actions" en GitHub
2. Selecciona "Publish Packages (Advanced)"
3. Haz clic en "Run workflow"
4. Opcionalmente:
   - Marca "Force publish all packages" para publicar todos los packages
   - Selecciona el tipo de bump de versión (patch, minor, major)

## Estructura de Packages

Los workflows asumen la siguiente estructura:

```
packages/
├── sdk/
│   ├── package.json
│   ├── src/
│   └── dist/
├── langchain/
│   ├── package.json
│   ├── src/
│   └── dist/
└── react/
    ├── package.json
    ├── src/
    └── dist/
```

## Scripts Requeridos

Cada package debe tener los siguientes scripts en su `package.json`:

```json
{
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "clean": "rm -rf dist",
    "test": "echo 'Tests coming soon!'" // opcional
  }
}
```

## Orden de Publicación

Los workflows respetan las dependencias entre packages:

1. **SDK** se publica primero (es la dependencia base)
2. **Langchain** y **React** se publican después (dependen de SDK)

## Troubleshooting

### Error: "Version already exists"

- El workflow avanzado maneja esto automáticamente bumpeando la versión
- Para el workflow básico, necesitas incrementar manualmente la versión en `package.json`

### Error: "NPM_TOKEN not found"

- Verifica que hayas configurado el secret `NPM_TOKEN` correctamente
- Asegúrate de que el token tenga permisos de publicación

### Error: "Build failed"

- Verifica que todas las dependencias estén instaladas
- Revisa que el script `build` esté definido en `package.json`
- Comprueba que no haya errores de TypeScript

## Recomendaciones

1. **Usa el workflow avanzado** para proyectos en producción
2. **Testa localmente** antes de hacer push:
   ```bash
   cd packages/sdk && pnpm run build
   cd packages/langchain && pnpm run build
   cd packages/react && pnpm run build
   ```
3. **Mantén las versiones sincronizadas** entre packages que dependen entre sí
4. **Revisa los logs** de GitHub Actions si algo falla
