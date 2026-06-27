import { LAYOUT } from './layout.js';

export class Board {
  constructor(width, height) {
    Object.assign(this, {
      width,
      height,
      playing: false,
      gameOver: false,
      bars: [],
      ball: null,
      scores: { left: 0, right: 0 },
      winningScore: LAYOUT.DEFAULT_WINNING_SCORE,
      speedMultiplier: LAYOUT.DEFAULT_SPEED,
    });
  }

  get elements() {
    return [...this.bars, this.ball];
  }

  restart() {
    this.bars = [];
    this.ball = null;
    this.scores = { left: 0, right: 0 };
    this.gameOver = false;
    this.playing = false;
  }
}
