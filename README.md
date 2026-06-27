# Pong

Juego clásico de Pong desarrollado con WebComponents nativos y Canvas 2D,
sin frameworks ni bundlers.

**Características:**
- Multijugador local (2 jugadores)
- Sonido sintetizado con Web Audio API (`ping` en pala izquierda, `pong` en derecha)
- Puntuación LCD con display de 7 segmentos
- Velocidad ajustable (Fácil / Medio / Difícil)
- Puntuación máxima configurable (5-50)

## Requisitos

- [pnpm](https://pnpm.io/)

## Desarrollo

```bash
pnpm dev
```

Abrir http://localhost:8080 en el navegador.

## Tests

```bash
pnpm test        # ejecutar una vez
pnpm test:watch  # modo watch
```

## Deploy

```bash
pnpm run deploy
```

Publica en GitHub Pages desde la carpeta `src/`.

## Cómo jugar

| Tecla | Acción |
|---|---|
| `W` / `S` | Jugador 1 (arriba / abajo) |
| `↑` / `↓` | Jugador 2 (arriba / abajo) |
| `Espacio` | Pausar / reanudar / reiniciar |

## Estructura

```
src/
├── components/
│   ├── pong-game.js   → Componente principal (game loop, input)
│   └── pong-score.js  → Display LCD 7 segmentos
├── modules/
│   ├── board.js       → Estado del juego
│   ├── ball.js        → Física de la pelota
│   ├── bar.js         → Palas
│   ├── collision.js   → Detección de colisiones AABB
│   ├── layout.js      → Constantes de proporción
│   ├── renderer.js    → Renderizado canvas
│   └── audio.js       → Sonido con Web Audio API
├── css/index.css      → Estilos globales
├── index.html         → Página principal
└── main.js            → Entry point
```

## Licencia

MIT — ver [LICENSE.md](LICENSE.md).
