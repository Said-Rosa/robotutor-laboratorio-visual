# RoboTutor Laboratorio Visual

Curso interactivo de robótica (teoría, práctica adaptativa, exámenes y laboratorio visual de cinemática). Archivo HTML único, sin backend. El motor de las láminas 3D está incluido en el HTML; abrir o publicar la página no requiere instalar paquetes.

## Estructura

- **`robotutor.html`** — fuente de la verdad. Documento completo publicado en GitHub Pages (con `<!DOCTYPE>`, `<head>`, `<body>` propios). **Edita siempre este archivo**, no `docs/index.html`.
- **`build-artifact.sh`** — genera por defecto un documento HTML completo para GitHub Pages, conservando metadatos de iOS. Elimina el script de transporte de Cloudflare solo si está presente. El modo opcional `artifact` genera un fragmento para un contenedor de Artifacts; GitHub Pages usa el documento completo.
- **`docs/index.html`** — salida generada, publicada por GitHub Pages. **No editar a mano** — se sobreescribe en cada build.

## Flujo de trabajo (dos agentes sobre el mismo repo)

Este repo lo editan tanto Claude (Claude Code) como ChatGPT (Codex/plugin de GitHub). Para no pisarnos el trabajo:

1. Cada cambio va en una rama propia (`claude/<tema>`, `codex/<tema>`), nunca directo a `main`.
2. Abre un PR hacia `main`. GitHub Actions reconstruye `docs/index.html` automáticamente al fusionar — no hace falta ejecutar el build a mano en el PR.
3. Antes de empezar a editar, actualiza tu rama desde `main` (`git pull`) para partir de la última versión.
4. Un humano (o el otro agente) revisa el PR antes de fusionar.

## Publicar cambios manualmente

```bash
bash build-artifact.sh robotutor.html docs/index.html
git add -A
git commit -m "Describe el cambio"
git push
```

## URL en vivo

GitHub Pages, rama `main`, carpeta `/docs`. Se activa la primera vez desde Settings → Pages del repo.


## Validación y colaboración

Antes de abrir el PR: `node scripts/check-source.cjs` y `bash build-artifact.sh robotutor.html /tmp/robotutor-pages.html`.
Los PR también ejecutan esa validación automáticamente. `docs/index.html` continúa siendo una salida generada al fusionar, no un archivo para editar.

Para un contenedor que requiera fragmento: `bash build-artifact.sh robotutor.html /tmp/robotutor-artifact.html artifact`.
El contenedor debe gestionar su propio documento; para PC, Android e iOS mediante GitHub Pages se usa el modo predeterminado `pages`.

Consulta `HANDOFF.md` para el alcance de las correcciones propuestas y la coordinación con la publicación existente.

## Láminas con modelado 3D

La geometría y las cotas se definen en `mechanicalScene` / `mechanicalPlateSvg`, dentro del HTML. `scripts/mechanical-renderer.mjs` dibuja esa geometría con Three.js, iluminación y profundidad real. La cámara ortográfica coincide con la proyección de las cotas SVG; la postura y los resultados del ejercicio no cambian. Si WebGL no está disponible, se conserva la lámina vectorial.

Al modificar ese motor: `npm ci && npm run build:plates`. El comando actualiza exclusivamente el bloque delimitado `ROBOTUTOR_MECHANICAL_3D` en el HTML y conserva la licencia MIT de Three.js. El CI comprueba que el bloque incorporado coincide con su fuente. No requiere CDN al mostrar las láminas.

Prueba opcional con Playwright y Chromium instalados: `node scripts/check-modeled-plates.cjs`. También admite `PLAYWRIGHT_MODULE` (ruta a Playwright) y `CHROME_PATH` (ejecutable de Chrome). Comprueba 18 láminas sin acceso a la red en escritorio/móvil y la alternativa SVG.
