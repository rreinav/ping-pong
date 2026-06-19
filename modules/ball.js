const MAX_BOUNCE_ANGLE = Math.PI / 12;

export class Ball {
  constructor(x, y, size, board) {
    this.x = x;
    this.y = y;
    this.width = size;
    this.height = size;
    this.board = board;
    this.baseSpeed = 4;
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
    const relY = bar.y + bar.height / 2 - (this.y + this.height / 2);
    const normY = relY / (bar.height / 2);
    const angle = normY * MAX_BOUNCE_ANGLE;
    const sign = this.x > this.board.width / 2 ? -1 : 1;
    this.speedX = this.speed * Math.cos(angle) * sign;
    this.speedY = this.speed * -Math.sin(angle);
  }

  resetToCenter(dir = 1) {
    this.x = this.board.width / 2 - this.width / 2;
    this.y = this.board.height / 2 - this.height / 2;
    this.speedX = this.speed * dir;
    this.speedY = 0;
  }
}
