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

/* =========================================================================
   Scene music cues (synthesized, no audio files)
   ========================================================================= */

/** Frequency sweep, e.g. a rising scanner tone. */
export function sweep(f1: number, f2: number, d: number, type: OscillatorType = 'sine', vol = 0.06, when = 0) {
  if (!soundEnabled) return;
  const a = getAudioContext();
  if (!a) return;
  try {
    const t = a.currentTime + when;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, t);
    o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.08, d / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g);
    g.connect(a.destination);
    o.start(t);
    o.stop(t + d + 0.02);
  } catch {
    // ignore
  }
}

/** Soft swelling tone (slow attack) for pads and drones. */
function pad(f: number, d: number, type: OscillatorType = 'triangle', vol = 0.04, when = 0) {
  if (!soundEnabled) return;
  const a = getAudioContext();
  if (!a) return;
  try {
    const t = a.currentTime + when;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + d * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g);
    g.connect(a.destination);
    o.start(t);
    o.stop(t + d + 0.02);
  } catch {
    // ignore
  }
}

let noiseBuf: AudioBuffer | null = null;

/** Filtered noise: whooshes, cracks, cymbal shimmer. */
function noise(
  d: number,
  vol = 0.05,
  f1 = 800,
  f2 = 800,
  filter: BiquadFilterType = 'lowpass',
  when = 0,
  attack = 0.02
) {
  if (!soundEnabled) return;
  const a = getAudioContext();
  if (!a) return;
  try {
    if (!noiseBuf) {
      noiseBuf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
      const ch = noiseBuf.getChannelData(0);
      for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    }
    const t = a.currentTime + when;
    const src = a.createBufferSource();
    src.buffer = noiseBuf;
    const flt = a.createBiquadFilter();
    flt.type = filter;
    flt.frequency.setValueAtTime(f1, t);
    flt.frequency.exponentialRampToValueAtTime(f2, t + d);
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    src.connect(flt);
    flt.connect(g);
    g.connect(a.destination);
    src.start(t);
    src.stop(t + d + 0.05);
  } catch {
    // ignore
  }
}

export const cue = {
  /** 책 속 사진이 파랗게 빛남: 반짝이는 신비한 음 */
  bookGlow() {
    pad(330, 2.6, 'triangle', 0.035);
    pad(494, 2.6, 'sine', 0.025, 0.1);
    [659, 831, 988, 1319, 1661, 1976].forEach((f, i) => tone(f, 0.6, 'sine', 0.045, 0.15 + i * 0.12));
    [2637, 2349, 3136, 2794].forEach((f, i) => tone(f, 0.25, 'sine', 0.02, 1.0 + i * 0.22));
  },
  /** 빛 속으로 빨려 들어가 본부로 이동 */
  portal() {
    noise(1.2, 0.07, 300, 7000, 'lowpass', 0, 0.5);
    sweep(220, 1760, 1.0, 'sine', 0.05);
    [523, 659, 784, 1047].forEach(f => pad(f, 1.8, 'triangle', 0.03, 0.75));
    tone(2093, 0.5, 'sine', 0.04, 1.05);
  },
  /** 본부 경보: 삐삐 */
  alarm() {
    for (let i = 0; i < 3; i++) {
      tone(988, 0.13, 'square', 0.035, i * 0.5);
      tone(784, 0.16, 'square', 0.035, i * 0.5 + 0.17);
    }
    pad(98, 1.6, 'sawtooth', 0.025);
  },
  /** 수상한 그림자가 휙 지나감 */
  shadow() {
    pad(73, 2.2, 'sawtooth', 0.035);
    pad(77.8, 2.2, 'sawtooth', 0.03);
    noise(1.4, 0.06, 1400, 200, 'lowpass', 0.3, 0.5);
    tone(247, 0.5, 'triangle', 0.05, 0.2);
    tone(233, 0.9, 'triangle', 0.05, 0.75);
  },
  /** 고글 탐지: 삐삐 삐삐 + 스캔음 */
  goggle() {
    sweep(400, 1600, 0.6, 'sine', 0.035);
    [0.65, 0.85, 1.4, 1.6].forEach(w => tone(1568, 0.1, 'square', 0.03, w));
    tone(523, 0.4, 'triangle', 0.04, 2.0);
    tone(392, 0.6, 'triangle', 0.04, 2.25);
  },
  /** 반전: 그림자가 사람 모양 수백 개로 흩어짐 */
  twist() {
    [131, 156, 185].forEach(f => pad(f, 1.6, 'sawtooth', 0.03));
    noise(1.6, 0.05, 6000, 2000, 'highpass', 0, 0.01);
    tone(65, 0.9, 'sine', 0.12);
    noise(1.0, 0.06, 400, 5000, 'bandpass', 0.9, 0.05);
    for (let i = 0; i < 14; i++) tone(900 + Math.random() * 1400, 0.06, 'triangle', 0.025, 0.95 + i * 0.06);
  },
  /** 빙하가 갈라짐 */
  crack() {
    tone(60, 0.5, 'sine', 0.14);
    noise(0.25, 0.12, 2500, 900, 'bandpass', 0, 0.005);
    noise(0.18, 0.08, 3500, 1500, 'bandpass', 0.22, 0.005);
    noise(0.3, 0.07, 2000, 600, 'bandpass', 0.4, 0.005);
    sfx.crack();
  },
  /** 빙하 탑 등장: 얼음 종소리 */
  tower() {
    [1319, 1568, 2093, 2637].forEach((f, i) => tone(f, 0.7, 'sine', 0.045, i * 0.09));
    pad(659, 1.4, 'triangle', 0.025, 0.1);
  },
  /** 성공: 팡파르 */
  fanfare() {
    const n: [number, number, number][] = [
      [523, 0, 0.15],
      [659, 0.14, 0.15],
      [784, 0.28, 0.15],
      [1047, 0.42, 0.35],
      [784, 0.8, 0.12],
      [1047, 0.94, 0.7]
    ];
    n.forEach(([f, w, d]) => tone(f, d, 'triangle', 0.08, w));
    [523, 659, 784].forEach(f => pad(f, 1.8, 'sine', 0.03, 0.94));
    noise(1.2, 0.03, 8000, 5000, 'highpass', 0.94, 0.01);
  }
};
