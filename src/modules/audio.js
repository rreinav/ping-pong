let ctx;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(freq, dur) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.3, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + dur);
}

export function resumeAudioContext() {
  const c = getCtx();
  if (c.state === 'suspended') c.resume();
}

export function playPing() {
  playTone(880, 0.1);
}

export function playPong() {
  playTone(440, 0.12);
}
