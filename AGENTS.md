# Convenciones del proyecto

**Estado actual:** Juego Pong con WebComponents nativos, ESM, canvas 2D. Sin bundler. Una dependencia dev (`servor`).

## Código
- Vanilla JS, sin framework. Todo en **ESM** (`import`/`export`).
- **WebComponents nativos** con Shadow DOM y `CSSStyleSheet`.
- Preferir estilos locales al componente sobre globales.

## Estructura de archivos
- `index.html` y fuentes dentro de `src/`.
- `src/components/` para WebComponents. Subcarpetas si son varios archivos.
- `src/css/index.css` para estilos globales y utilidades.
- `src/modules/` para módulos JS de lógica pura (evitar `src/utils/`).
- `public/` para assets estáticos (imágenes, etc.).
- Test junto al fuente: `*.test.js` en la misma carpeta (no carpeta `tests/` global).

## Desarrollo
- `pnpm dev` — servidor local con `servor src --reload`.
- Sin linter, typecheck ni formatter por ahora.
- El gestor de paquetes en este entorno es `pnpm` (no hay `npm`).
