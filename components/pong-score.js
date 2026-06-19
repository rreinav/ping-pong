const PATTERNS = {
  0: [1,1,1,1,1,1,0],
  1: [0,1,1,0,0,0,0],
  2: [1,1,0,1,1,0,1],
  3: [1,1,1,1,0,0,1],
  4: [0,1,1,0,0,1,1],
  5: [1,0,1,1,0,1,1],
  6: [1,0,1,1,1,1,1],
  7: [1,1,1,0,0,0,0],
  8: [1,1,1,1,1,1,1],
  9: [1,1,1,1,0,1,1],
};

const SEGMENTS = ['a','b','c','d','e','f','g'];

const styles = new CSSStyleSheet();
styles.replaceSync(`
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: 'Courier New', Courier, monospace;
    user-select: none;
    margin-top: 0.4rem;
  }

  .board {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    background: #0a0a0a;
    border: 2px solid #222;
    border-radius: 6px;
    padding: 0.35rem 0.5rem;
  }

  .display {
    display: flex;
    align-items: center;
    gap: 0.2rem;
  }

  .digit {
    position: relative;
    width: 28px;
    height: 48px;
  }

  .segment {
    position: absolute;
    background: #331111;
    border-radius: 2px;
    transition: background 0.08s, box-shadow 0.08s;
  }

  .segment.on {
    background: #ff2200;
    box-shadow: 0 0 6px #ff4400;
  }

  .segment-a { top: 1px; left: 4px; width: 20px; height: 5px; }
  .segment-b { top: 5px; right: 1px; width: 5px; height: 16px; }
  .segment-c { bottom: 5px; right: 1px; width: 5px; height: 16px; }
  .segment-d { bottom: 1px; left: 4px; width: 20px; height: 5px; }
  .segment-e { bottom: 5px; left: 1px; width: 5px; height: 16px; }
  .segment-f { top: 5px; left: 1px; width: 5px; height: 16px; }
  .segment-g { top: 21px; left: 4px; width: 20px; height: 5px; }

  .dash {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 48px;
    padding: 0 2px;
  }

  .dash-bar {
    width: 20px;
    height: 5px;
    border-radius: 2px;
    background: #ff2200;
    box-shadow: 0 0 6px #ff4400;
  }
`);

export class PongScore extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [styles];
    this.shadowRoot.innerHTML = `
      <div class="board">
        <div class="display"></div>
      </div>`;
    this._scores = { left: 0, right: 0 };
  }

  connectedCallback() {
    this._render();
  }

  set scores(val) {
    this._scores = val;
    this._render();
  }

  _digitHTML(value) {
    const n = Math.min(Math.max(0, value), 9);
    const pattern = PATTERNS[n];
    return '<div class="digit">' + SEGMENTS.map((seg, i) =>
      `<div class="segment segment-${seg}${pattern[i] ? ' on' : ''}"></div>`
    ).join('') + '</div>';
  }

  _render() {
    const left = String(this._scores.left).padStart(2, '0');
    const right = String(this._scores.right).padStart(2, '0');
    const display = this.shadowRoot.querySelector('.display');
    display.innerHTML =
      this._digitHTML(+left[0]) +
      this._digitHTML(+left[1]) +
      '<span class="dash"><span class="dash-bar"></span></span>' +
      this._digitHTML(+right[0]) +
      this._digitHTML(+right[1]);
  }
}

customElements.define('pong-score', PongScore);
