import { LAYOUT } from './layout.js';

const MAX_BOUNCE_ANGLE = Math.PI / 4;

export class Ball {
  constructor(x, y, size, board) {
    this.x = x;
    this.y = y;
    this.width = size;
    this.height = size;
    this.board = board;
    this.baseSpeed = board.width * LAYOUT.BALL_SPEED_RATIO;
    this.speedX = this.speed;
    this.speedY = 0;
    board.ball = this;
  }

  get speed() {
    return this.baseSpeed * (this.board.speedMultiplier ?? 1);
  }

  move() {
    this.x += this.speedX;
    this.y += this.speedY;
  }

  collision(bar) {
    const overlapX1 = (this.x + this.width) - bar.x;
    const overlapX2 = (bar.x + bar.width) - this.x;
    const overlapY1 = (this.y + this.height) - bar.y;
    const overlapY2 = (bar.y + bar.height) - this.y;

    const minX = Math.min(overlapX1, overlapX2);
    const minY = Math.min(overlapY1, overlapY2);

    if (minX < minY) {
      const relY = bar.y + bar.height / 2 - (this.y + this.height / 2);
      const normY = relY / (bar.height / 2);
      const angle = normY * MAX_BOUNCE_ANGLE;
      const sign = this.x < bar.x ? -1 : 1;
      this.speedX = this.speed * Math.cos(angle) * sign;
      this.speedY = this.speed * -Math.sin(angle);
      if (overlapX1 < overlapX2) {
        this.x = bar.x - this.width;
      } else {
        this.x = bar.x + bar.width;
      }
    } else {
      this.speedY = -this.speedY;
      if (overlapY1 < overlapY2) {
        this.y = bar.y - this.height;
      } else {
        this.y = bar.y + bar.height;
      }
    }
  }

  resetToCenter(dir = 1) {
    this.x = this.board.width / 2 - this.width / 2;
    this.y = this.board.height / 2 - this.height / 2;
    this.speedX = this.speed * dir;
    this.speedY = 0;
  }
}
