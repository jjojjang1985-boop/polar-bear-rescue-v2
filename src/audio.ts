let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    } catch {
      // AudioContext not available or blocked
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function tone(f: number, d: number, type: OscillatorType = 'sine', vol = 0.08, when = 0) {
  if (!soundEnabled) return;
  const a = getAudioContext();
  if (!a) return;
  try {
    const t = a.currentTime + (when || 0);
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(vol || 0.08, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g);
    g.connect(a.destination);
    o.start(t);
    o.stop(t + d + 0.02);
  } catch {
    // Audio synthesis failure caught
  }
}

export const sfx = {
  ok() {
    tone(660, 0.12, 'triangle', 0.1);
    tone(990, 0.2, 'triangle', 0.09, 0.1);
  },
  no() {
    tone(200, 0.18, 'square', 0.05);
    tone(140, 0.25, 'square', 0.05, 0.12);
  },
  clue() {
    tone(880, 0.08, 'triangle', 0.08);
    tone(1320, 0.14, 'triangle', 0.07, 0.07);
    tone(1760, 0.16, 'sine', 0.05, 0.14);
  },
  blip() {
    tone(560 + Math.random() * 90, 0.025, 'square', 0.012);
  },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'triangle', 0.09, i * 0.11));
  },
  crack() {
    tone(110, 0.3, 'sawtooth', 0.05);
    tone(80, 0.35, 'sawtooth', 0.04, 0.08);
  },
  tick() {
    tone(1000, 0.03, 'square', 0.02);
  },
  splash() {
    tone(300, 0.2, 'sine', 0.07);
    tone(180, 0.3, 'sine', 0.06, 0.1);
  }
};
