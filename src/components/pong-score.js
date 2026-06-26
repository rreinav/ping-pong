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
    font-size: clamp(0.6rem, 1.2vw, 1rem);
  }

  .board {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2em;
    background: #0a0a0a;
    border: 0.125em solid #222;
    border-radius: 0.375em;
    padding: 0.35em 0.5em;
  }

  .display {
    display: flex;
    align-items: center;
    gap: 0.2em;
  }

  .digit {
    position: relative;
    width: 1.75em;
    height: 3em;
  }

  .segment {
    position: absolute;
    background: #331111;
    border-radius: 0.125em;
    transition: background 0.08s, box-shadow 0.08s;
  }

  .segment.on {
    background: #ff2200;
    box-shadow: 0 0 0.375em #ff4400;
  }

  .segment-a { top: 0.0625em; left: 0.25em; width: 1.25em; height: 0.3125em; }
  .segment-b { top: 0.3125em; right: 0.0625em; width: 0.3125em; height: 1em; }
  .segment-c { bottom: 0.3125em; right: 0.0625em; width: 0.3125em; height: 1em; }
  .segment-d { bottom: 0.0625em; left: 0.25em; width: 1.25em; height: 0.3125em; }
  .segment-e { bottom: 0.3125em; left: 0.0625em; width: 0.3125em; height: 1em; }
  .segment-f { top: 0.3125em; left: 0.0625em; width: 0.3125em; height: 1em; }
  .segment-g { top: 1.3125em; left: 0.25em; width: 1.25em; height: 0.3125em; }

  .dash {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 3em;
    padding: 0 0.125em;
  }

  .dash-bar {
    width: 1.25em;
    height: 0.3125em;
    border-radius: 0.125em;
    background: #ff2200;
    box-shadow: 0 0 0.375em #ff4400;
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
