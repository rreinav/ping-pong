import { LAYOUT } from './layout.js';

export class Bar {
  constructor(x, y, width, height, board) {
    Object.assign(this, { x, y, width, height, board });
    this.speed = board.width * LAYOUT.PADDLE_SPEED_RATIO;
    board.bars.push(this);
  }

  up() {
    this.y = Math.max(0, this.y - this.speed);
  }

  down() {
    this.y = Math.min(this.board.height - this.height, this.y + this.speed);
  }
}
