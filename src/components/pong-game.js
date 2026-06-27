import { Board } from '../modules/board.js';
import { Ball } from '../modules/ball.js';
import { Bar } from '../modules/bar.js';
import { hit } from '../modules/collision.js';
import { LAYOUT } from '../modules/layout.js';
import { renderBoard, drawOverlay } from '../modules/renderer.js';
import { playPing, playPong, resumeAudioContext } from '../modules/audio.js';
import './pong-score.js';

const styles = new CSSStyleSheet();
styles.replaceSync(`
  :host {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100dvh;
  }
  ::slotted([slot="header"]) {
    align-self: center;
    margin: 0.5rem 0;
  }
  .canvas-row {
    display: flex;
    flex: 1;
    min-height: 0;
  }
  .legend-col {
    flex: 0 0 16.6667%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    box-sizing: border-box;
    padding: 0 0.5rem 1rem;
  }
  .screen-wrapper {
    position: relative;
    flex: 0 0 66.6667%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
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
        <div class="legend-col"><slot name="legend-left"></slot></div>
        <div class="screen-wrapper">
          <canvas></canvas>
          <div class="vignette"></div>
        </div>
        <div class="legend-col"><slot name="legend-right"></slot></div>
      </div>`;
    this.canvas = this.shadowRoot.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.board = new Board(800, 480);
    this.canvas.width = this.board.width;
    this.canvas.height = this.board.height;
    this.keys = {};
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._tick = this._tick.bind(this);
    this._resize = this._resize.bind(this);
  }

  connectedCallback() {
    this.scoreEl = this.querySelector('pong-score');
    this.maxScoreSelect = this.querySelector('.max-score');
    this.speedSelect = this.querySelector('.speed');
    if (this.maxScoreSelect) {
      this.maxScoreSelect.value = LAYOUT.DEFAULT_WINNING_SCORE;
      this.board.winningScore = LAYOUT.DEFAULT_WINNING_SCORE;
      this.maxScoreSelect.addEventListener('change', () => {
        this.board.winningScore = +this.maxScoreSelect.value;
      });
    }
    if (this.speedSelect) {
      this.speedSelect.value = LAYOUT.DEFAULT_SPEED;
      this.board.speedMultiplier = LAYOUT.DEFAULT_SPEED;
      this.speedSelect.addEventListener('change', () => {
        this.board.speedMultiplier = +this.speedSelect.value;
      });
    }
    this._resize();
    this._initGame();
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('resize', this._resize);
    requestAnimationFrame(this._tick);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('resize', this._resize);
    cancelAnimationFrame(this._animFrame);
  }

  _computeBoardSize() {
    const availW = window.innerWidth * 4 / 6;
    const availH = window.innerHeight * 4 / 5;
    let h = availH;
    let w = h * LAYOUT.BOARD_ASPECT;
    if (w > availW) { w = availW; h = w / LAYOUT.BOARD_ASPECT; }
    return { width: Math.round(w), height: Math.round(h) };
  }

  _elementSizes() {
    const w = this.board.width;
    const h = this.board.height;
    return {
      ballSize: Math.round(w * LAYOUT.BALL_SIZE_RATIO),
      paddleW: Math.round(w * LAYOUT.PADDLE_WIDTH_RATIO),
      paddleH: Math.round(h * LAYOUT.PADDLE_HEIGHT_RATIO),
      margin: Math.round(w * LAYOUT.PADDLE_MARGIN_RATIO),
    };
  }

  _resetElements() {
    const ball = this.board.ball;
    const [left, right] = this.board.bars;
    if (!ball || !left || !right) return;
    const s = this._elementSizes();
    const { width, height } = this.board;
    Object.assign(ball, {
      width: s.ballSize, height: s.ballSize,
      baseSpeed: width * LAYOUT.BALL_SPEED_RATIO,
      x: (width - s.ballSize) / 2, y: (height - s.ballSize) / 2,
    });
    const barProps = { width: s.paddleW, height: s.paddleH, speed: width * LAYOUT.PADDLE_SPEED_RATIO };
    Object.assign(left, { ...barProps, x: s.margin, y: (height - s.paddleH) / 2 });
    Object.assign(right, { ...barProps, x: width - s.margin - s.paddleW, y: (height - s.paddleH) / 2 });
  }

  _resize() {
    this.board.playing = false;
    const { width, height } = this._computeBoardSize();
    Object.assign(this.board, { width, height });
    this.canvas.width = width;
    this.canvas.height = height;
    this._resetElements();
  }

  _initGame() {
    this.board.restart();
    new Ball(0, 0, 0, this.board);
    new Bar(0, 0, 0, 0, this.board);
    new Bar(0, 0, 0, 0, this.board);
    this._resetElements();
    this._renderScore();
  }

  _onKeyDown(ev) {
    resumeAudioContext();
    this.keys[ev.key] = true;
    if (ev.key === ' ' || ev.key === 'Space') {
      ev.preventDefault();
      this.board.gameOver ? this._initGame() : (this.board.playing = !this.board.playing);
    }
  }

  _onKeyUp(ev) { this.keys[ev.key] = false; }

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
    const [left] = board.bars;
    for (const bar of board.bars) {
      if (hit(bar, ball)) {
        ball.collision(bar);
        (bar === left ? playPing : playPong)();
      }
    }
    if (ball.y < 0) {
      ball.y = 0;
      ball.speedY = Math.abs(ball.speedY);
    }
    if (ball.y + ball.height > board.height) {
      ball.y = board.height - ball.height;
      ball.speedY = -Math.abs(ball.speedY);
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
    this._renderScore();
    if (board.scores.left >= board.winningScore || board.scores.right >= board.winningScore) {
      board.playing = false;
      board.gameOver = true;
    } else {
      board.ball.resetToCenter(board.ball.x < board.width / 2 ? -1 : 1);
    }
  }

  _renderScore() { if (this.scoreEl) this.scoreEl.scores = this.board.scores; }

  _render() {
    renderBoard(this.ctx, this.board);
    if (this.board.gameOver) {
      const winner = this.board.scores.left >= this.board.winningScore ? 'Jugador 1' : 'Jugador 2';
      drawOverlay(this.ctx, this.board, `Ganador: ${winner}`, 'Presiona espacio para reiniciar');
    } else if (!this.board.playing) {
      drawOverlay(this.ctx, this.board, 'Pausa', null, 0.5);
    }
  }
}

customElements.define('pong-game', PongGame);
