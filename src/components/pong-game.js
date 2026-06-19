import { Board } from '../modules/board.js';
import { Ball } from '../modules/ball.js';
import { Bar } from '../modules/bar.js';
import { hit } from '../modules/collision.js';
import './pong-score.js';

const styles = new CSSStyleSheet();
styles.replaceSync(`
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .canvas-row {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
  .screen-wrapper {
    position: relative;
    display: inline-block;
    border: 4px solid #222;
    border-radius: 10px;
    overflow: hidden;
    box-shadow:
      0 0 20px rgba(0, 255, 100, 0.08),
      inset 0 0 40px rgba(0, 0, 0, 0.3);
  }
  canvas {
    display: block;
    border: none;
    background: #000;
  }
  .vignette {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      ellipse at center,
      transparent 60%,
      rgba(0, 0, 0, 0.5) 100%
    );
  }
`);

export class PongGame extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [styles];
    this.shadowRoot.innerHTML = `
      <slot name="header"></slot>
      <div class="canvas-row">
        <slot name="legend-left"></slot>
        <div class="screen-wrapper">
          <canvas></canvas>
          <div class="vignette"></div>
        </div>
        <slot name="legend-right"></slot>
      </div>`;
    this.canvas = this.shadowRoot.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.board = new Board(1000, 600);
    this.canvas.width = this.board.width;
    this.canvas.height = this.board.height;
    this.keys = {};
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._tick = this._tick.bind(this);
  }

  connectedCallback() {
    this.scoreEl = this.querySelector('pong-score');
    this.maxScoreSelect = this.querySelector('.max-score');
    this.speedSelect = this.querySelector('.speed');
    this.maxScoreSelect?.addEventListener('change', () => {
      this.board.winningScore = +this.maxScoreSelect.value;
    });
    this.speedSelect?.addEventListener('change', () => {
      this.board.speedMultiplier = +this.speedSelect.value;
    });
    this._initGame();
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    requestAnimationFrame(this._tick);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    cancelAnimationFrame(this._animFrame);
  }

  _initGame() {
    this.board.restart();
    new Ball(500 - 12, 300 - 12, 25, this.board);
    new Bar(20, 250, 25, 100, this.board);
    new Bar(955, 250, 25, 100, this.board);
    this._renderScore();
  }

  _onKeyDown(ev) {
    this.keys[ev.key] = true;
    if (ev.key === ' ' || ev.key === 'Space') {
      ev.preventDefault();
      this.board.gameOver ? this._initGame() : (this.board.playing = !this.board.playing);
    }
  }

  _onKeyUp(ev) {
    this.keys[ev.key] = false;
  }

  _tick() {
    this._handleInput();
    this._update();
    this._render();
    this._animFrame = requestAnimationFrame(this._tick);
  }

  _handleInput() {
    if (!this.board.playing || this.board.gameOver) return;
    const [left, right] = this.board.bars;
    const k = this.keys;
    if (k['w'] || k['W']) left?.up();
    if (k['s'] || k['S']) left?.down();
    if (k['ArrowUp']) right?.up();
    if (k['ArrowDown']) right?.down();
  }

  _update() {
    if (!this.board.playing || this.board.gameOver) return;
    const { board } = this;
    const ball = board.ball;
    ball.move();
    if (ball.y <= 0 || ball.y + ball.height >= board.height) {
      ball.speedY = -ball.speedY;
      ball.y = ball.y <= 0 ? 0 : board.height - ball.height;
    }
    for (const bar of board.bars) {
      if (hit(bar, ball)) ball.collision(bar);
    }
    if (ball.x + ball.width < 0) {
      board.scores.right++;
      this._onScore();
    } else if (ball.x > board.width) {
      board.scores.left++;
      this._onScore();
    }
  }

  _onScore() {
    const { board } = this;
    const ball = board.ball;
    this._renderScore();
    if (board.scores.left >= board.winningScore || board.scores.right >= board.winningScore) {
      board.playing = false;
      board.gameOver = true;
    } else {
      ball.resetToCenter(ball.x < board.width / 2 ? -1 : 1);
    }
  }

  _renderScore() {
    if (this.scoreEl) this.scoreEl.scores = this.board.scores;
  }

  _render() {
    const { ctx } = this;
    const board = this.board;
    ctx.clearRect(0, 0, board.width, board.height);
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([15, 15]);
    ctx.beginPath();
    ctx.moveTo(board.width / 2, 0);
    ctx.lineTo(board.width / 2, board.height);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#fff';
    for (const el of board.elements) {
      if (el) ctx.fillRect(el.x, el.y, el.width, el.height);
    }
    if (board.gameOver) {
      const winner = board.scores.left >= board.winningScore ? 'Jugador 1' : 'Jugador 2';
      this._drawOverlay(board, `Ganador: ${winner}`, 'Presiona espacio para reiniciar');
    } else if (!board.playing) {
      this._drawOverlay(board, 'Pausa', null, 0.5);
    }
  }

  _drawOverlay(board, title, subtitle, alpha = 0.6) {
    const { ctx } = this;
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(0, 0, board.width, board.height);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 2.5rem "Courier New", Courier, monospace';
    ctx.fillText(title, board.width / 2, board.height / 2 - (subtitle ? 20 : 0));
    if (subtitle) {
      ctx.font = '1rem "Courier New", Courier, monospace';
      ctx.fillStyle = '#ccc';
      ctx.fillText(subtitle, board.width / 2, board.height / 2 + 30);
    }
  }
}

customElements.define('pong-game', PongGame);
