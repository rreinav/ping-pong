export function renderBoard(ctx, board) {
  ctx.clearRect(0, 0, board.width, board.height);
  ctx.strokeStyle = '#fff';
  ctx.setLineDash([board.width * 0.015, board.width * 0.015]);
  ctx.beginPath();
  ctx.moveTo(board.width / 2, 0);
  ctx.lineTo(board.width / 2, board.height);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#fff';
  for (const el of board.elements) {
    if (el) ctx.fillRect(el.x, el.y, el.width, el.height);
  }
}

export function drawOverlay(ctx, board, title, subtitle, alpha = 0.6) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.fillRect(0, 0, board.width, board.height);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 2.5rem "Courier New", Courier, monospace';
  ctx.fillText(title, board.width / 2, board.height / 2 - (subtitle ? board.height * 0.033 : 0));
  if (subtitle) {
    ctx.font = '1rem "Courier New", Courier, monospace';
    ctx.fillStyle = '#ccc';
    ctx.fillText(subtitle, board.width / 2, board.height / 2 + board.height * 0.05);
  }
}
