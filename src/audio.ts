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
  /** 고글 온도 탐지음: 뜨거울수록 높고 크게 */
  heatBeep(h: number) {
    tone(700 + h * 900, 0.06, 'square', 0.012 + h * 0.025);
  },
  /** 탄소 대마왕 등장 */
  bossRise() {
    pad(55, 3, 'sawtooth', 0.04);
    pad(58.3, 3, 'sawtooth', 0.035);
    noise(2.6, 0.06, 150, 900, 'lowpass', 0, 1.2);
    [147, 175, 208].forEach((f, i) => pad(f, 2.2, 'triangle', 0.035, 0.6 + i * 0.05));
    tone(110, 0.5, 'square', 0.04, 1.6);
    tone(104, 0.9, 'square', 0.04, 2.0);
  },
  /** 보스가 공격을 날림 */
  bossAttack() {
    noise(0.8, 0.06, 2000, 300, 'lowpass', 0, 0.1);
    sweep(600, 150, 0.7, 'sawtooth', 0.035);
    tone(98, 0.4, 'square', 0.03, 0.55);
  },
  /** 기후 마법 명중 */
  /** 얼음 다리가 하나씩 이어짐: 맑은 종소리 계단 */
  iceBridge() {
    const notes = [784, 880, 988, 1047, 1175, 1319, 1397, 1568, 1760, 2093];
    notes.forEach((f, i) => {
      tone(f, 0.35, 'sine', 0.05, 0.25 + i * 0.16);
      tone(f * 2, 0.2, 'triangle', 0.015, 0.25 + i * 0.16);
    });
    pad(523, 2.6, 'sine', 0.025, 0.2);
    pad(784, 2.6, 'sine', 0.02, 0.2);
    noise(1.2, 0.02, 9000, 6000, 'highpass', 1.9, 0.05);
  },
  /** 기술 쓰기 전 기 모으기 */
  charge() {
    sweep(150, 900, 0.85, 'sawtooth', 0.025);
    sweep(300, 1800, 0.85, 'sine', 0.04);
    for (let i = 0; i < 8; i++) tone(700 + i * 120, 0.06, 'triangle', 0.025, 0.1 + i * 0.09);
  },
  skillHit() {
    sweep(500, 2000, 0.25, 'triangle', 0.05);
    [1047, 1319, 1568].forEach((f, i) => tone(f, 0.3, 'sine', 0.06, 0.22 + i * 0.07));
    noise(0.3, 0.05, 3000, 800, 'bandpass', 0.25, 0.01);
    tone(80, 0.3, 'sine', 0.1, 0.25);
  },
  /** 엄마 곰 등장: 따뜻하고 반가운 화음 */
  momAppear() {
    [523, 659, 784].forEach(f => pad(f, 2, 'triangle', 0.035));
    [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.5, 'sine', 0.05, 0.3 + i * 0.16));
  },
  /** 포리가 통통 뛰어감 */
  poriRun() {
    for (let i = 0; i < 6; i++) {
      tone(660 + (i % 2) * 220, 0.08, 'triangle', 0.05, i * 0.22);
      tone(330, 0.05, 'sine', 0.05, i * 0.22);
    }
  },
  /** 보스 등장 음악: 북소리와 낮게 내려가는 단조 선율 */
  bossTheme() {
    const beat = 0.42;
    for (let i = 0; i < 8; i++) {
      tone(55, 0.3, 'sine', 0.18, 0.9 + i * beat);
      noise(0.12, 0.06, 900, 200, 'lowpass', 0.9 + i * beat, 0.003);
    }
    const mel: [number, number][] = [
      [220, 0], [208, 1], [196, 2], [185, 3], [175, 4], [165, 5], [156, 6], [147, 7]
    ];
    mel.forEach(([f, k]) => tone(f, beat * 0.95, 'sawtooth', 0.035, 0.9 + k * beat));
    [110, 131, 156].forEach(f => pad(f, 3.8, 'sawtooth', 0.03, 0.9));
    tone(98, 1.4, 'square', 0.04, 0.9 + 8 * beat);
    tone(92.5, 1.4, 'square', 0.04, 0.9 + 8 * beat);
  },
  /** 마법이 보스에 꽂히는 순간의 폭발 */
  impact() {
    tone(55, 0.45, 'sine', 0.16);
    noise(0.5, 0.1, 4000, 300, 'lowpass', 0, 0.005);
    [1568, 2093, 2637].forEach((f, i) => tone(f, 0.35, 'sine', 0.035, 0.05 + i * 0.05));
  },
  /** 대마왕이 흔들리며 무너지기 시작 */
  bossCrumble() {
    pad(49, 2.2, 'sawtooth', 0.05);
    noise(2.0, 0.07, 200, 1800, 'lowpass', 0, 0.4);
    for (let i = 0; i < 8; i++) noise(0.15, 0.06, 2500, 800, 'bandpass', 0.2 + i * 0.22, 0.005);
    sweep(400, 60, 1.8, 'square', 0.025, 0.2);
  },
  /** 막지 못해서 공격을 맞음 */
  bossHurtsYou() {
    noise(0.5, 0.09, 1200, 200, 'lowpass', 0, 0.01);
    tone(70, 0.5, 'sine', 0.12);
    tone(196, 0.25, 'square', 0.03, 0.1);
    tone(185, 0.4, 'square', 0.03, 0.3);
  },
  /** 대마왕 쓰러짐 */
  bossDefeat() {
    noise(1.4, 0.07, 400, 6000, 'lowpass', 0, 0.3);
    sweep(150, 1200, 1.2, 'triangle', 0.04);
    for (let i = 0; i < 12; i++) tone(1000 + Math.random() * 1500, 0.08, 'triangle', 0.03, 0.4 + i * 0.07);
    cue.fanfare();
  },
  /** 지구레인저 변신: 차오르는 빛 + 반짝임 + 팡파르 */
  transform() {
    sweep(180, 1400, 1.6, 'triangle', 0.045);
    sweep(90, 700, 1.6, 'sawtooth', 0.02);
    noise(1.6, 0.03, 300, 7000, 'bandpass', 0, 0.2);
    for (let i = 0; i < 14; i++) tone(900 + i * 90, 0.07, 'triangle', 0.025, 0.3 + i * 0.09);
    tone(60, 0.6, 'sine', 0.14, 1.65);
    noise(0.8, 0.07, 6000, 400, 'lowpass', 1.65, 0.05);
    setTimeout(() => cue.fanfare(), 1750);
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

/* =========================================================================
   배경음악 (그림 파일 없이 소리를 직접 만들어 반복 재생)
   ========================================================================= */
type Song = {
  bpm: number;
  /** 8분음표 단위 마디 수 x 8 */
  bars: number;
  lead: string[];
  chords: string[][];
  leadType: OscillatorType;
  leadVol: number;
  arp?: boolean;
};

const NOTE_IDX: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function noteFreq(n: string): number {
  const m = /^([A-G])(b|#)?(\d)$/.exec(n);
  if (!m) return 0;
  let semi = NOTE_IDX[m[1]] + (m[2] === 'b' ? -1 : m[2] === '#' ? 1 : 0);
  const midi = (Number(m[3]) + 1) * 12 + semi;
  return 440 * Math.pow(2, (midi - 69) / 12);
}
/** "E5:2 G5:2 - C6" → [시작(8분음표), 주파수, 길이] */
function parseBar(bar: string, offset: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  let pos = offset;
  bar.trim().split(/\s+/).forEach(tok => {
    const [n, l] = tok.split(':');
    const len = Number(l || 1);
    if (n !== '-') out.push([pos, noteFreq(n), len]);
    pos += len;
  });
  return out;
}

const SONGS: Record<'title' | 'ending', Song> = {
  // 처음 화면: 밝고 씩씩한 모험 테마 (C장조)
  title: {
    bpm: 112,
    bars: 8,
    leadType: 'triangle',
    leadVol: 0.05,
    lead: [
      'E5:2 G5:2 C6:3 B5',
      'D6:2 B5:2 G5:4',
      'A5:2 C6:2 E6:2 D6 C6',
      'A5:4 F5:2 G5:2',
      'E5:2 G5:2 C6:3 D6',
      'E6:2 D6:2 B5:4',
      'C6 A5 F5 A5 C6:2 D6:2',
      'B5:4 G5:2 -:2'
    ],
    chords: [
      ['C3', 'C4', 'E4', 'G4'],
      ['G2', 'B3', 'D4', 'G4'],
      ['A2', 'A3', 'C4', 'E4'],
      ['F2', 'A3', 'C4', 'F4'],
      ['C3', 'C4', 'E4', 'G4'],
      ['G2', 'B3', 'D4', 'G4'],
      ['F2', 'A3', 'C4', 'F4'],
      ['G2', 'B3', 'D4', 'F4']
    ]
  },
  // 엔딩: 따뜻하고 뭉클한 테마 (F장조)
  ending: {
    bpm: 84,
    bars: 8,
    leadType: 'sine',
    leadVol: 0.06,
    arp: true,
    lead: [
      'A5:4 C6:2 A5:2',
      'G5:6 E5:2',
      'F5:2 A5:2 D6:3 C6',
      'Bb5:6 -:2',
      'A5:2 C6:2 F6:3 E6',
      'E6:2 D6:2 C6:4',
      'D6:2 Bb5:2 C6:2 E6:2',
      'F6:6 -:2'
    ],
    chords: [
      ['F2', 'F3', 'A3', 'C4'],
      ['C3', 'E3', 'G3', 'C4'],
      ['D3', 'D3', 'F3', 'A3'],
      ['Bb2', 'Bb3', 'D4', 'F4'],
      ['F2', 'F3', 'A3', 'C4'],
      ['C3', 'E3', 'G3', 'C4'],
      ['Bb2', 'Bb3', 'D4', 'F4'],
      ['F2', 'F3', 'A3', 'C4']
    ]
  }
};

let musicGain: GainNode | null = null;
let musicTimer: number | null = null;
let musicName: 'title' | 'ending' | null = null;
let musicStart = 0;
let musicLoop = 0;

function musicNote(a: AudioContext, out: GainNode, f: number, t: number, d: number, type: OscillatorType, vol: number, attack = 0.02) {
  if (!f) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(vol * 0.6, t + Math.max(attack + 0.01, d * 0.5));
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g);
  g.connect(out);
  o.start(t);
  o.stop(t + d + 0.05);
}

function scheduleLoop(a: AudioContext, song: Song, loopStart: number) {
  if (!musicGain) return;
  const e = 60 / song.bpm / 2; // 8분음표 길이(초)
  song.lead.forEach((bar, bi) => {
    parseBar(bar, bi * 8).forEach(([pos, f, len]) => {
      musicNote(a, musicGain!, f, loopStart + pos * e, len * e * 0.95, song.leadType, song.leadVol);
    });
  });
  song.chords.forEach((ch, bi) => {
    const t = loopStart + bi * 8 * e;
    const [bass, ...rest] = ch.map(noteFreq);
    // 베이스: 4분음표로 통통
    for (let k = 0; k < 4; k++) musicNote(a, musicGain!, k % 2 ? bass * 2 : bass, t + k * 2 * e, 1.8 * e, 'triangle', 0.045);
    if (song.arp) {
      // 엔딩: 펼침화음
      for (let k = 0; k < 8; k++) musicNote(a, musicGain!, rest[k % rest.length] * 2, t + k * e, 1.6 * e, 'sine', 0.018, 0.01);
    } else {
      // 처음 화면: 부드러운 화음 + 박자 맞춘 반짝임
      rest.forEach(f => musicNote(a, musicGain!, f, t, 8 * e, 'sine', 0.014, 0.15));
      for (let k = 1; k < 8; k += 2) musicNote(a, musicGain!, rest[2] * 4, t + k * e, 0.4 * e, 'square', 0.006, 0.005);
    }
  });
}

/** 배경음악 시작 (같은 곡이 이미 나오고 있으면 그대로 둔다) */
export function startMusic(name: 'title' | 'ending') {
  if (!soundEnabled) return;
  if (musicName === name && musicTimer !== null) return;
  stopMusic(0.4);
  const a = getAudioContext();
  if (!a) return;
  const song = SONGS[name];
  const loopLen = (60 / song.bpm / 2) * 8 * song.bars;
  musicGain = a.createGain();
  musicGain.gain.setValueAtTime(0.0001, a.currentTime);
  musicGain.gain.exponentialRampToValueAtTime(name === 'title' ? 0.7 : 0.85, a.currentTime + 1.2);
  musicGain.connect(a.destination);
  musicName = name;
  musicStart = a.currentTime + 0.15;
  musicLoop = 0;
  const tick = () => {
    if (!musicGain) return;
    // 다음 반복이 2초 안으로 다가오면 미리 예약한다
    while (musicStart + musicLoop * loopLen < a.currentTime + 2) {
      scheduleLoop(a, song, musicStart + musicLoop * loopLen);
      musicLoop += 1;
    }
  };
  tick();
  musicTimer = window.setInterval(tick, 500);
}

/**
 * 브라우저가 소리를 막아 둔 상태(첫 터치 전)에서 시작한 음악을 터치 뒤에 다시 시작한다.
 * 휴대폰·태블릿은 pointerdown이 아니라 click/touchend에서만 소리를 허락한다.
 */
export function unlockMusic(name: 'title' | 'ending' | null) {
  const a = getAudioContext();
  if (!a) return;
  const restart = () => {
    if (name && soundEnabled) {
      musicName = null; // 같은 곡이어도 시간 맞춰 새로 시작
      startMusic(name);
    }
  };
  if (a.state === 'running') {
    if (name && musicName !== name) restart();
    return;
  }
  a.resume().then(restart).catch(() => {});
}

/** 배경음악 멈춤 (fade 초 동안 서서히 줄인다) */
export function stopMusic(fade = 0.8) {
  if (musicTimer !== null) window.clearInterval(musicTimer);
  musicTimer = null;
  musicName = null;
  const g = musicGain;
  musicGain = null;
  const a = audioCtx;
  if (g && a) {
    try {
      g.gain.cancelScheduledValues(a.currentTime);
      g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + fade);
      window.setTimeout(() => g.disconnect(), fade * 1000 + 100);
    } catch {
      g.disconnect();
    }
  }
}
