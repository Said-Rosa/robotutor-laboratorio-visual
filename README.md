# RoboTutor Laboratorio Visual

Curso interactivo de robótica (teoría, práctica adaptativa, exámenes y laboratorio visual de cinemática). Archivo HTML único, sin backend ni dependencias de compilación.

## Estructura

- **`robotutor.html`** — fuente de la verdad. El documento completo tal como lo sirve `chatgpt.site` (con `<!DOCTYPE>`, `<head>`, `<body>` propios). **Edita siempre este archivo**, no `docs/index.html`.
- **`build-artifact.sh`** — genera `docs/index.html` a partir de `robotutor.html`: quita el envoltorio de documento, fija el `<title>`, repone los `<meta>` de iOS y elimina el script de bot-management que inyecta Cloudflare al servir el original. Necesario porque GitHub Pages y los Artifacts de Claude aportan su propio envoltorio HTML.
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
