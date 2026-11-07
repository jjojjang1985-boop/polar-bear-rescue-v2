import type { AvatarType, SpeakerId } from './types';

// Warm chocolate outline matching the reference art style
export const OL = '#331c10';
let _u = 0;

/* =========================================================================
   BOBA ANIME EYES & MOUTHS (Matching the Reference Image Style)
   ========================================================================= */

function bobaEye(cx: number, cy: number, s = 1, irisCol = '#4a2512', u = 0, lookX = 0, lash = false) {
  const id = `ir_${u}_${Math.round(cx)}`;
  const rx = 14 * s;
  const ry = 18 * s;
  const dx = lookX || 0;

  return `<defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#140702"/>
      <stop offset="40%" stop-color="#2a1208"/>
      <stop offset="70%" stop-color="${irisCol}"/>
      <stop offset="100%" stop-color="#e28a38"/>
    </linearGradient>
  </defs>
  <!-- Sclera -->
  <ellipse cx="${cx}" cy="${cy}" rx="${rx + 1}" ry="${ry + 1}" fill="#ffffff" stroke="${OL}" stroke-width="${3 * s}"/>
  <!-- Iris -->
  <ellipse cx="${cx + dx}" cy="${cy + 1 * s}" rx="${rx}" ry="${ry}" fill="url(#${id})"/>
  <!-- Dark Pupil Core -->
  <ellipse cx="${cx + dx}" cy="${cy - 1 * s}" rx="${rx * 0.55}" ry="${ry * 0.6}" fill="#0d0401"/>
  <!-- Bottom warm amber reflection arc -->
  <path d="M${cx + dx - rx * 0.65} ${cy + ry * 0.3} Q${cx + dx} ${cy + ry * 0.9} ${cx + dx + rx * 0.65} ${cy + ry * 0.3}" fill="none" stroke="#f5a442" stroke-width="${3.2 * s}" stroke-linecap="round" opacity="0.8"/>
  <!-- Primary Big White Specular Highlight (Top-left) -->
  <ellipse cx="${cx + dx - 4 * s}" cy="${cy - 5 * s}" rx="${5.2 * s}" ry="${6.2 * s}" fill="#ffffff"/>
  <!-- Secondary White Highlight (Top-right) -->
  <circle cx="${cx + dx + 5.5 * s}" cy="${cy - 3 * s}" r="${2.3 * s}" fill="#ffffff" opacity="0.9"/>
  <!-- Bottom Accent Sparkle (Lower-left) -->
  <circle cx="${cx + dx - 4.5 * s}" cy="${cy + 7 * s}" r="${2.1 * s}" fill="#ffffff" opacity="0.85"/>
  <!-- Bottom Tiny Sparkle (Lower-right) -->
  <circle cx="${cx + dx + 6 * s}" cy="${cy + 5.5 * s}" r="${1.2 * s}" fill="#ffffff" opacity="0.75"/>
  <!-- Eyelid stroke with subtle lash curve -->
  <path d="M${cx - rx - 2 * s} ${cy - ry * 0.5} Q${cx} ${cy - ry * 1.3} ${cx + rx + 3 * s} ${cy - ry * 0.4}" fill="none" stroke="${OL}" stroke-width="${4.5 * s}" stroke-linecap="round"/>
  ${lash ? `<path d="M${cx + rx + 2 * s} ${cy - ry * 0.5} q4 -6 7 -4" fill="none" stroke="${OL}" stroke-width="${3.2 * s}" stroke-linecap="round"/>` : ''}
  `;
}

function closedEyeCurve(cx: number, cy: number, s = 1) {
  return `<path d="M${cx - 15 * s} ${cy + 3 * s} Q${cx} ${cy - 12 * s} ${cx + 15 * s} ${cy + 3 * s}" fill="none" stroke="${OL}" stroke-width="${4.8 * s}" stroke-linecap="round"/>
  <path d="M${cx + 14 * s} ${cy + 1 * s} l5 -5" stroke="${OL}" stroke-width="${3 * s}" stroke-linecap="round"/>`;
}

function cuteBlush(x1: number, x2: number, y: number, s = 1) {
  return `
  <!-- Left Cheek Blush -->
  <ellipse cx="${x1}" cy="${y}" rx="${13 * s}" ry="${8 * s}" fill="#ff7f8d" opacity="0.78"/>
  <path d="M${x1 - 6 * s} ${y + 2 * s} l4 -6 M${x1} ${y + 2 * s} l4 -6 M${x1 + 6 * s} ${y + 2 * s} l4 -6" stroke="#ff475e" stroke-width="${1.8 * s}" stroke-linecap="round" opacity="0.7"/>
  <!-- Right Cheek Blush -->
  <ellipse cx="${x2}" cy="${y}" rx="${13 * s}" ry="${8 * s}" fill="#ff7f8d" opacity="0.78"/>
  <path d="M${x2 - 6 * s} ${y + 2 * s} l4 -6 M${x2} ${y + 2 * s} l4 -6 M${x2 + 6 * s} ${y + 2 * s} l4 -6" stroke="#ff475e" stroke-width="${1.8 * s}" stroke-linecap="round" opacity="0.7"/>
  `;
}

function cuteMouth(kind: string, x = 100, y = 142, s = 1) {
  switch (kind) {
    case 'sad':
      return `<path d="M${x - 12 * s} ${y + 6 * s} Q${x} ${y - 6 * s} ${x + 12 * s} ${y + 6 * s}" fill="none" stroke="${OL}" stroke-width="${4 * s}" stroke-linecap="round"/>`;
    case 'o':
      return `
      <ellipse cx="${x}" cy="${y + 2 * s}" rx="${8 * s}" ry="${10 * s}" fill="#9c1f2e" stroke="${OL}" stroke-width="${3.5 * s}"/>
      <ellipse cx="${x}" cy="${y + 7 * s}" rx="${5 * s}" ry="${4 * s}" fill="#ff8093"/>
      <ellipse cx="${x}" cy="${y - 4 * s}" rx="${4 * s}" ry="${2 * s}" fill="#ffffff"/>
      `;
    case 'smile':
      return `<path d="M${x - 12 * s} ${y - 2 * s} Q${x} ${y + 11 * s} ${x + 12 * s} ${y - 2 * s}" fill="none" stroke="${OL}" stroke-width="${4.2 * s}" stroke-linecap="round"/>`;
    case 'open':
    case 'happy':
    case 'grin':
    default:
      return `
      <!-- Joyful Open Smile with Tongue & Top Teeth -->
      <path d="M${x - 17 * s} ${y - 4 * s} Q${x} ${y + 24 * s} ${x + 17 * s} ${y - 4 * s} Z" fill="#9c1f2e" stroke="${OL}" stroke-width="${4 * s}" stroke-linejoin="round"/>
      <!-- Tongue -->
      <path d="M${x - 11 * s} ${y + 8 * s} Q${x} ${y + 1 * s} ${x + 11 * s} ${y + 8 * s} Q${x} ${y + 16 * s} ${x - 11 * s} ${y + 8 * s} Z" fill="#ff8093"/>
      <!-- Top teeth bar -->
      <path d="M${x - 13 * s} ${y - 3 * s} L${x + 13 * s} ${y - 3 * s} L${x + 10 * s} ${y + 2 * s} L${x - 10 * s} ${y + 2 * s} Z" fill="#ffffff"/>
      `;
  }
}

function shadow() {
  return `<ellipse cx="100" cy="194" rx="60" ry="7.5" fill="rgba(51,28,16,0.2)"/>`;
}

export function wrap(inner: string) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" stroke-linejoin="round">${inner}</svg>`;
}

/* =========================================================================
   1. 아기 북극곰 포리 (Pori - Super Fluffy Cuddly Cub in Reference Style)
   ========================================================================= */

export function poriSVG(mood = 'happy') {
  const u = ++_u;
  const furId = `pfur_${u}`;
  const scarfId = `pscf_${u}`;

  let eyes = bobaEye(70, 96, 1.05, '#402010', u, 0, false) + bobaEye(130, 96, 1.05, '#402010', u, 0, false);
  if (mood === 'joy') eyes = closedEyeCurve(70, 96, 1) + closedEyeCurve(130, 96, 1);

  let brows = `<path d="M56 74 Q70 70 82 74" fill="none" stroke="${OL}" stroke-width="3.5" stroke-linecap="round"/><path d="M144 74 Q130 70 118 74" fill="none" stroke="${OL}" stroke-width="3.5" stroke-linecap="round"/>`;
  if (mood === 'sad' || mood === 'scared') {
    brows = `<path d="M56 76 L82 82" stroke="${OL}" stroke-width="4" stroke-linecap="round"/><path d="M144 76 L118 82" stroke="${OL}" stroke-width="4" stroke-linecap="round"/>`;
  }
  const tear = mood === 'sad'
    ? `<path d="M54 110 Q48 122 54 128 Q60 122 54 110Z" fill="#7cc8ff" stroke="${OL}" stroke-width="2.5"/>`
    : '';

  const m = mood === 'sad' ? 'sad' : mood === 'scared' ? 'o' : mood === 'smile' ? 'smile' : 'happy';

  return wrap(`
    <defs>
      <!-- Soft Fluffy White Fur with Warm Golden Rim & Subtle Blue Shadow -->
      <radialGradient id="${furId}" cx="45%" cy="35%" r="72%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="65%" stop-color="#f5f8fc"/>
        <stop offset="92%" stop-color="#e0ebf7"/>
        <stop offset="100%" stop-color="#ffd9aa"/>
      </radialGradient>
      <!-- Coral Red Scarf -->
      <linearGradient id="${scarfId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ff7f68"/>
        <stop offset="100%" stop-color="#e84530"/>
      </linearGradient>
    </defs>
    ${shadow()}

    <!-- Pori Body -->
    <ellipse cx="100" cy="168" rx="55" ry="32" fill="url(#${furId})" stroke="${OL}" stroke-width="4"/>
    <!-- Paws -->
    <ellipse cx="68" cy="184" rx="16" ry="11" fill="url(#${furId})" stroke="${OL}" stroke-width="3.8"/>
    <ellipse cx="132" cy="184" rx="16" ry="11" fill="url(#${furId})" stroke="${OL}" stroke-width="3.8"/>
    <!-- Soft Paw Pads -->
    <circle cx="68" cy="184" r="5" fill="#fca5b4"/>
    <circle cx="132" cy="184" r="5" fill="#fca5b4"/>

    <!-- Ears with Pink Fluff -->
    <circle cx="44" cy="48" r="23" fill="url(#${furId})" stroke="${OL}" stroke-width="4"/>
    <circle cx="44" cy="50" r="12" fill="#ffb8c6"/>
    <circle cx="156" cy="48" r="23" fill="url(#${furId})" stroke="${OL}" stroke-width="4"/>
    <circle cx="156" cy="50" r="12" fill="#ffb8c6"/>

    <!-- Head with Chubby Cheeks -->
    <ellipse cx="100" cy="98" rx="76" ry="65" fill="url(#${furId})" stroke="${OL}" stroke-width="4.2"/>
    <!-- Cheek fluff tufts -->
    <path d="M26 104 Q20 112 28 120 Q22 126 36 132" fill="none" stroke="${OL}" stroke-width="3" stroke-linecap="round"/>
    <path d="M174 104 Q180 112 172 120 Q178 126 164 132" fill="none" stroke="${OL}" stroke-width="3" stroke-linecap="round"/>

    <!-- Snout Muzzle -->
    <ellipse cx="100" cy="126" rx="30" ry="21" fill="#ffffff" stroke="${OL}" stroke-width="2.5"/>
    <!-- Cute Button Nose -->
    <path d="M89 116 Q100 110 111 116 Q106 127 100 128 Q94 127 89 116 Z" fill="#2b1408" stroke="${OL}" stroke-width="2"/>
    <ellipse cx="96" cy="116" rx="3.5" ry="2" fill="#ffffff"/>

    <!-- Eyes & Brows -->
    ${brows}
    ${eyes}
    ${cuteBlush(52, 148, 120, 1.1)}
    ${tear}
    ${cuteMouth(m, 100, 140, 1)}

    <!-- Cozy Winter Scarf -->
    <path d="M56 150 Q100 174 144 150 L140 166 Q100 186 60 166 Z" fill="url(#${scarfId})" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>
    <!-- Scarf knot & fringe hanging down -->
    <path d="M122 162 L136 192 L118 190 Z" fill="url(#${scarfId})" stroke="${OL}" stroke-width="3.5" stroke-linejoin="round"/>
    <line x1="122" y1="191" x2="124" y2="195" stroke="#ffe14d" stroke-width="3" stroke-linecap="round"/>
    <line x1="128" y1="191" x2="130" y2="195" stroke="#ffe14d" stroke-width="3" stroke-linecap="round"/>
    <line x1="134" y1="191" x2="136" y2="195" stroke="#ffe14d" stroke-width="3" stroke-linecap="round"/>
  `);
}

/* =========================================================================
   2. 주인공 신입 대원 (Hero 'a' - Exact Girl from the Reference Image!)
   - Warm chestnut bob hair with neat bangs & cute ahoge sprout
   - Big brown boba anime eyes with triple highlights
   - Cheerful yellow hoodie & teal backpack
   ========================================================================= */

export function heroSVG(mood = 'happy', v: AvatarType = 'a') {
  const u = ++_u;
  const isGirl = v === 'a';
  const isFriend = v === 'c';

  const skinId = `hsk_${u}`;
  const hairId = `hhr_${u}`;
  const clothId = `hcl_${u}`;

  // Palette matching reference image
  const hairDark = isGirl ? '#452613' : isFriend ? '#2c1e47' : '#1e2d4d';
  const hairMid = isGirl ? '#69381c' : isFriend ? '#523c7a' : '#3a568c';
  const hairHighlight = isGirl ? '#e8a358' : isFriend ? '#a48cd4' : '#88b5ff';

  // Clothing: Girl wears yellow hoodie from reference, Boy wears rescue jacket
  const jacket1 = isGirl ? '#ffca36' : isFriend ? '#8977e8' : '#f2735a';
  const jacket2 = isGirl ? '#e89c17' : isFriend ? '#614fb8' : '#d24830';

  let eyes = bobaEye(75, 102, 1.1, isGirl ? '#402010' : '#244066', u, 0, isGirl) +
             bobaEye(125, 102, 1.1, isGirl ? '#402010' : '#244066', u, 0, isGirl);
  if (mood === 'joy') {
    eyes = closedEyeCurve(75, 102, 1.1) + closedEyeCurve(125, 102, 1.1);
  }

  let brows = `<path d="M62 78 Q76 72 88 78" fill="none" stroke="${OL}" stroke-width="3.8" stroke-linecap="round"/><path d="M138 78 Q124 72 112 78" fill="none" stroke="${OL}" stroke-width="3.8" stroke-linecap="round"/>`;
  if (mood === 'sad' || mood === 'o') {
    brows = `<path d="M62 82 L88 88" stroke="${OL}" stroke-width="3.8" stroke-linecap="round"/><path d="M138 82 L112 88" stroke="${OL}" stroke-width="3.8" stroke-linecap="round"/>`;
  }

  const m = mood === 'sad' ? 'sad' : mood === 'o' ? 'o' : mood === 'smile' ? 'smile' : 'happy';

  return wrap(`
    <defs>
      <!-- Warm Peach Skin with Sunset Glow -->
      <radialGradient id="${skinId}" cx="45%" cy="38%" r="72%">
        <stop offset="0%" stop-color="#fff8f0"/>
        <stop offset="70%" stop-color="#ffe3cf"/>
        <stop offset="100%" stop-color="#f7be9e"/>
      </radialGradient>
      <!-- Hair Gradient -->
      <linearGradient id="${hairId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${hairMid}"/>
        <stop offset="100%" stop-color="${hairDark}"/>
      </linearGradient>
      <!-- Clothes Gradient -->
      <linearGradient id="${clothId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${jacket1}"/>
        <stop offset="100%" stop-color="${jacket2}"/>
      </linearGradient>
    </defs>
    ${shadow()}

    <!-- Back Hair for Bob Style -->
    ${
      isGirl
        ? `
        <!-- Cute curved bob back hair framing the shoulders -->
        <path d="M40 100 Q26 142 42 168 Q54 172 68 155 L132 155 Q146 172 158 168 Q174 142 160 100 Q156 50 100 46 Q44 50 40 100 Z" fill="url(#${hairId})" stroke="${OL}" stroke-width="4.2"/>
        <!-- Soft golden sunset rim highlight on back hair -->
        <path d="M46 76 Q100 46 154 76" fill="none" stroke="${hairHighlight}" stroke-width="6" stroke-linecap="round" opacity="0.65"/>
        `
        : `
        <!-- Spiky Boy Hair Back -->
        <path d="M38 114 L28 92 L46 90 L34 64 L56 70 L52 42 L74 56 L82 28 L98 48 L112 26 L124 50 L142 34 L144 60 L166 54 L156 80 L172 90 L156 102 L162 118 Q150 70 100 66 Q50 70 38 114 Z" fill="url(#${hairId})" stroke="${OL}" stroke-width="4.2"/>
        `
    }

    <!-- Torso: Yellow Hoodie with Teal Backpack Straps (Reference Match) -->
    <path d="M48 200 Q52 166 80 160 L120 160 Q148 166 152 200 Z" fill="url(#${clothId})" stroke="${OL}" stroke-width="4"/>
    <!-- Teal Backpack Straps -->
    <path d="M64 162 L56 200" stroke="#2ba397" stroke-width="7" stroke-linecap="round"/>
    <path d="M64 162 L56 200" stroke="${OL}" stroke-width="1.8" fill="none"/>
    <path d="M136 162 L144 200" stroke="#2ba397" stroke-width="7" stroke-linecap="round"/>
    <path d="M136 162 L144 200" stroke="${OL}" stroke-width="1.8" fill="none"/>
    <!-- Hoodie Collar / Drawstrings -->
    <path d="M80 160 Q100 178 120 160" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
    <path d="M92 172 L92 188" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    <path d="M108 172 L108 188" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>

    <!-- Neck -->
    <rect x="87" y="148" width="26" height="18" fill="url(#${skinId})" stroke="${OL}" stroke-width="3.5"/>

    <!-- Head Base -->
    <path d="M52 100 Q48 144 100 164 Q152 144 148 100 Q148 56 100 54 Q52 56 52 100 Z" fill="url(#${skinId})" stroke="${OL}" stroke-width="4"/>
    <!-- Ears -->
    <path d="M52 104 Q46 106 48 116 Q50 124 56 122" fill="url(#${skinId})" stroke="${OL}" stroke-width="3.5"/>
    <path d="M148 104 Q154 106 152 116 Q150 124 144 122" fill="url(#${skinId})" stroke="${OL}" stroke-width="3.5"/>

    <!-- Eyes, Eyebrows & Mouth -->
    ${brows}
    ${eyes}
    ${cuteBlush(58, 142, 122, 1.05)}
    <!-- Tiny Cute Nose Dot -->
    <circle cx="100" cy="120" r="2" fill="#ba6f45"/>
    ${cuteMouth(m, 100, 138, 1)}

    <!-- Front Hair Bangs & Cute Side Locks -->
    ${
      isGirl
        ? `
        <!-- Side Bangs Framing Cheeks -->
        <path d="M48 98 Q42 128 54 146 Q58 132 58 112 Z" fill="url(#${hairId})" stroke="${OL}" stroke-width="3.5"/>
        <path d="M152 98 Q158 128 146 146 Q142 132 142 112 Z" fill="url(#${hairId})" stroke="${OL}" stroke-width="3.5"/>
        <!-- Cute Rounded Forehead Bangs with Center Parting -->
        <path d="M46 104 Q50 56 100 52 Q150 56 154 104 L146 88 L138 98 L126 80 L118 96 L104 80 L96 96 L84 80 L74 98 L64 88 Z" fill="url(#${hairId})" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>
        <!-- Sunset Golden Rim Highlight Across Bangs -->
        <path d="M68 68 Q100 56 132 68" fill="none" stroke="${hairHighlight}" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
        <!-- Iconic Hair Sprout (Ahoge) at the Top! -->
        <path d="M100 52 Q88 24 108 14 Q98 32 112 40" fill="url(#${hairId})" stroke="${OL}" stroke-width="3.5" stroke-linejoin="round"/>
        `
        : `
        <!-- Boy Front Bangs -->
        <path d="M48 104 Q54 66 100 62 Q146 66 150 104 L140 86 L132 94 L124 78 L114 92 L104 74 L94 92 L84 76 L76 94 L66 82 L58 96 Z" fill="url(#${hairId})" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M72 70 Q100 58 128 70" fill="none" stroke="${hairHighlight}" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
        <path d="M100 30 Q92 10 110 4 Q104 16 112 22" fill="url(#${hairId})" stroke="${OL}" stroke-width="3.5" stroke-linejoin="round"/>
        `
    }
  `);
}

/* =========================================================================
   3. 루카 선배 (Luka - Companion with Safety Hardhat & Green Vest, like the Tanuki!)
   ========================================================================= */

export function lukaSVG(mood = 'grin') {
  const u = ++_u;
  const skinId = `lsk_${u}`;
  const hairId = `lhr_${u}`;

  let eyes = bobaEye(75, 102, 1.1, '#1b5442', u, 0, false) +
             bobaEye(125, 102, 1.1, '#1b5442', u, 0, false);
  if (mood === 'joy') eyes = closedEyeCurve(75, 102, 1.1) + closedEyeCurve(125, 102, 1.1);

  let brows = `<path d="M62 78 Q76 70 88 76" fill="none" stroke="${OL}" stroke-width="3.8" stroke-linecap="round"/><path d="M138 78 Q124 70 112 76" fill="none" stroke="${OL}" stroke-width="3.8" stroke-linecap="round"/>`;

  return wrap(`
    <defs>
      <radialGradient id="${skinId}" cx="45%" cy="38%" r="72%">
        <stop offset="0%" stop-color="#fff8f0"/>
        <stop offset="70%" stop-color="#ffe3cf"/>
        <stop offset="100%" stop-color="#f7be9e"/>
      </radialGradient>
      <linearGradient id="${hairId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d46726"/>
        <stop offset="100%" stop-color="#7a340d"/>
      </linearGradient>
    </defs>
    ${shadow()}

    <!-- Green Work/Rescue Vest (Matching the Tanuki Partner in Reference) -->
    <path d="M48 200 Q52 166 80 160 L120 160 Q148 166 152 200 Z" fill="#2fa86a" stroke="${OL}" stroke-width="4"/>
    <path d="M82 160 L100 180 L118 160" fill="#ffffff" stroke="${OL}" stroke-width="3.5"/>
    <!-- Collar & Pocket -->
    <rect x="58" y="174" width="22" height="18" rx="4" fill="#258a56" stroke="${OL}" stroke-width="2"/>
    <rect x="120" y="174" width="22" height="18" rx="4" fill="#258a56" stroke="${OL}" stroke-width="2"/>

    <!-- Neck -->
    <rect x="87" y="148" width="26" height="18" fill="url(#${skinId})" stroke="${OL}" stroke-width="3.5"/>

    <!-- Head -->
    <path d="M52 100 Q48 144 100 164 Q152 144 148 100 Q148 56 100 54 Q52 56 52 100 Z" fill="url(#${skinId})" stroke="${OL}" stroke-width="4"/>

    <!-- Cheerful Red-Orange Hair -->
    <path d="M44 98 Q42 56 100 50 Q158 56 156 98 L146 84 L138 94 L126 78 L114 94 L100 78 L86 94 L74 78 L62 94 Z" fill="url(#${hairId})" stroke="${OL}" stroke-width="4"/>

    <!-- Yellow Safety Hardhat with Shiny Rim (Direct reference to image!) -->
    <path d="M38 72 Q42 22 100 18 Q158 22 162 72 Z" fill="#ffd438" stroke="${OL}" stroke-width="4.2"/>
    <path d="M30 72 Q100 64 170 72 L164 80 Q100 72 36 80 Z" fill="#e5b81b" stroke="${OL}" stroke-width="3.8"/>
    <!-- Hardhat Crest Ridge -->
    <path d="M93 20 Q100 16 107 20 L106 68 Q100 66 94 68 Z" fill="#fff085" stroke="${OL}" stroke-width="2.5"/>

    <!-- Eyes, Brows & Open Cheerful Smile -->
    ${brows}
    ${eyes}
    ${cuteBlush(58, 142, 122, 1.05)}
    <!-- Nose -->
    <circle cx="100" cy="120" r="2.2" fill="#ba6f45"/>
    ${cuteMouth(mood === 'happy' || mood === 'grin' ? 'grin' : mood, 100, 138, 1)}
  `);
}

/* =========================================================================
   4. 단비 대장 (Captain Danbi - Heroic & Adorable Rescue Captain)
   ========================================================================= */

export function danbiSVG(mood = 'smile') {
  const u = ++_u;
  const skinId = `dsk_${u}`;
  const hairId = `dhr_${u}`;

  let eyes = bobaEye(75, 102, 1.1, '#4a2010', u, 0, true) +
             bobaEye(125, 102, 1.1, '#4a2010', u, 0, true);
  if (mood === 'joy') eyes = closedEyeCurve(75, 102, 1.1) + closedEyeCurve(125, 102, 1.1);

  let brows = `<path d="M62 78 Q76 70 88 76" fill="none" stroke="${OL}" stroke-width="4" stroke-linecap="round"/><path d="M138 78 Q124 70 112 76" fill="none" stroke="${OL}" stroke-width="4" stroke-linecap="round"/>`;

  return wrap(`
    <defs>
      <radialGradient id="${skinId}" cx="45%" cy="38%" r="72%">
        <stop offset="0%" stop-color="#fff8f0"/>
        <stop offset="70%" stop-color="#ffe3cf"/>
        <stop offset="100%" stop-color="#f7be9e"/>
      </radialGradient>
      <linearGradient id="${hairId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#542e1a"/>
        <stop offset="100%" stop-color="#2e170c"/>
      </linearGradient>
    </defs>
    ${shadow()}

    <!-- Captain Uniform Jacket (Navy & Warm Coral Stripe) -->
    <path d="M48 200 Q52 166 80 160 L120 160 Q148 166 152 200 Z" fill="#1f3f73" stroke="${OL}" stroke-width="4"/>
    <path d="M54 186 L146 186" stroke="#ff7f68" stroke-width="7"/>
    <path d="M80 160 L100 178 L120 160" fill="#ffd438" stroke="${OL}" stroke-width="3.5"/>
    <!-- Gold Captain Star Badge -->
    <path d="M132 170 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 Z" fill="#ffd438" stroke="${OL}" stroke-width="2"/>

    <!-- Neck -->
    <rect x="87" y="148" width="26" height="18" fill="url(#${skinId})" stroke="${OL}" stroke-width="3.5"/>

    <!-- Head & Hair Base -->
    <ellipse cx="100" cy="94" rx="66" ry="64" fill="url(#${hairId})" stroke="${OL}" stroke-width="4"/>
    <path d="M52 100 Q48 144 100 164 Q152 144 148 100 Q148 56 100 54 Q52 56 52 100 Z" fill="url(#${skinId})" stroke="${OL}" stroke-width="4"/>

    <!-- Hair Bangs & Sleek Ponytail -->
    <path d="M150 72 Q188 94 174 142 Q164 122 152 114 Z" fill="url(#${hairId})" stroke="${OL}" stroke-width="4"/>
    <path d="M46 98 Q48 42 100 38 Q152 42 154 98 Q140 72 112 70 Q118 82 108 88 Q100 68 76 72 Q60 78 46 98 Z" fill="url(#${hairId})" stroke="${OL}" stroke-width="4"/>

    <!-- Headset Microphone (Rescue Command Gear) -->
    <path d="M40 98 Q36 46 100 30 Q164 46 160 98" fill="none" stroke="#ff7a59" stroke-width="7" stroke-linecap="round"/>
    <circle cx="42" cy="104" r="13" fill="#ff7a59" stroke="${OL}" stroke-width="3.5"/>
    <path d="M46 114 Q58 140 82 138" fill="none" stroke="${OL}" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="84" cy="138" r="4.5" fill="#333" stroke="${OL}" stroke-width="2"/>

    <!-- Eyes, Brows & Smile -->
    ${brows}
    ${eyes}
    ${cuteBlush(58, 142, 122, 1.05)}
    <circle cx="100" cy="120" r="2.2" fill="#ba6f45"/>
    ${cuteMouth(mood === 'serious' ? 'smile' : mood, 100, 138, 1)}
  `);
}

/* =========================================================================
   5. 체온계 로봇 써모 (Thermo - Cute High-Tech Companion Bot)
   ========================================================================= */

export function thermoSVG(mood = 'normal') {
  const u = ++_u;
  const alert = mood === 'alert';
  const eyeColor = alert ? '#ff4b4b' : '#3ee8f5';

  return wrap(`
    <defs>
      <!-- Glass Capsule Gradients -->
      <linearGradient id="tgl_${u}" x1="0" x2="1">
        <stop offset="0%" stop-color="#e3f5ff"/>
        <stop offset="40%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#b6def7"/>
      </linearGradient>
      <!-- Red Mercury Bulb -->
      <radialGradient id="tbl_${u}" cx="38%" cy="32%" r="70%">
        <stop offset="0%" stop-color="#ffb3a6"/>
        <stop offset="50%" stop-color="#f0503b"/>
        <stop offset="100%" stop-color="#b3261e"/>
      </radialGradient>
      <!-- Dark Display Screen -->
      <linearGradient id="tsc_${u}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1b3659"/>
        <stop offset="100%" stop-color="#0e1f36"/>
      </linearGradient>
    </defs>
    ${shadow()}

    <!-- Cute Little Robot Arms -->
    <path d="M60 114 Q36 120 34 136" fill="none" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="34" cy="140" r="9" fill="#ffd438" stroke="${OL}" stroke-width="3.5"/>
    <path d="M140 114 Q164 104 168 88" fill="none" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="168" cy="84" r="9" fill="#ffd438" stroke="${OL}" stroke-width="3.5"/>

    <!-- Antenna with Golden Light Bulb -->
    <line x1="100" y1="26" x2="100" y2="10" stroke="${OL}" stroke-width="4"/>
    <circle cx="100" cy="9" r="9" fill="#ffd438" stroke="${OL}" stroke-width="3.5"/>
    <circle cx="98" cy="7" r="2.5" fill="#ffffff"/>

    <!-- Thermometer Glass Body -->
    <rect x="62" y="24" width="76" height="132" rx="38" fill="url(#tgl_${u})" stroke="${OL}" stroke-width="4"/>

    <!-- Red Mercury Liquid Tube & Bulb -->
    <rect x="91" y="96" width="18" height="62" rx="9" fill="#f0503b" stroke="${OL}" stroke-width="2.5"/>
    <circle cx="100" cy="164" r="27" fill="url(#tbl_${u})" stroke="${OL}" stroke-width="4"/>
    <ellipse cx="91" cy="155" rx="7" ry="5" fill="#ffffff" opacity="0.75"/>

    <!-- Digital Face Screen -->
    <rect x="70" y="38" width="60" height="46" rx="18" fill="url(#tsc_${u})" stroke="${OL}" stroke-width="3.5"/>
    <!-- Glowing Boba Eyes on Screen -->
    <ellipse cx="88" cy="58" rx="8" ry="10" fill="${eyeColor}"/>
    <circle cx="86" cy="54" r="3" fill="#ffffff"/>
    <ellipse cx="112" cy="58" rx="8" ry="10" fill="${eyeColor}"/>
    <circle cx="110" cy="54" r="3" fill="#ffffff"/>
    <!-- Cute Smile/Alarm Mouth -->
    <path d="M92 71 Q100 ${alert ? 66 : 77} 108 71" fill="none" stroke="${eyeColor}" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Cheerful Digital Blush -->
    <ellipse cx="78" cy="74" rx="5" ry="3" fill="#ff7f8d" opacity="0.8"/>
    <ellipse cx="122" cy="74" rx="5" ry="3" fill="#ff7f8d" opacity="0.8"/>

    <!-- Measurement Gauge Marks -->
    <g stroke="${OL}" stroke-width="2.5" stroke-linecap="round">
      <line x1="118" y1="98" x2="126" y2="98"/>
      <line x1="118" y1="110" x2="124" y2="110"/>
      <line x1="118" y1="122" x2="126" y2="122"/>
      <line x1="118" y1="134" x2="124" y2="134"/>
    </g>
    <!-- Glass Highlight Reflection -->
    <rect x="70" y="90" width="7" height="46" rx="3.5" fill="#ffffff" opacity="0.85"/>
  `);
}

/* =========================================================================
   6. 동물 및 NPC (다람쥐 / 너구리 / 주민들)
   ========================================================================= */

export function squirrelSVG() {
  const u = ++_u;
  return wrap(`
    <defs>
      <!-- Warm Tanuki/Raccoon Fur Gradient from Reference Image -->
      <radialGradient id="tanuki_${u}" cx="45%" cy="35%" r="72%">
        <stop offset="0%" stop-color="#fff0da"/>
        <stop offset="60%" stop-color="#cf9f74"/>
        <stop offset="100%" stop-color="#8a5327"/>
      </radialGradient>
    </defs>
    ${shadow()}

    <!-- Fluffy Striped Tail (Like the Raccoon in the Image) -->
    <path d="M148 190 Q196 150 170 90 Q152 60 172 40 Q130 50 138 100 Q146 140 118 170 Z" fill="url(#tanuki_${u})" stroke="${OL}" stroke-width="4.2"/>
    <!-- Tail Stripes -->
    <path d="M152 80 Q144 88 160 94" stroke="#4a2810" stroke-width="8" stroke-linecap="round"/>
    <path d="M144 110 Q138 118 155 126" stroke="#4a2810" stroke-width="8" stroke-linecap="round"/>
    <path d="M136 140 Q130 148 146 156" stroke="#4a2810" stroke-width="8" stroke-linecap="round"/>

    <!-- Body with Green Safety Vest -->
    <ellipse cx="100" cy="166" rx="42" ry="30" fill="url(#tanuki_${u})" stroke="${OL}" stroke-width="4"/>
    <path d="M74 154 L100 174 L126 154" fill="#ffffff" stroke="${OL}" stroke-width="3"/>
    <path d="M66 160 Q100 174 134 160 L134 190 Q100 200 66 190 Z" fill="#2fa86a" stroke="${OL}" stroke-width="3.5"/>

    <!-- Round Tanuki Ears -->
    <circle cx="56" cy="46" r="18" fill="#8a5327" stroke="${OL}" stroke-width="3.5"/>
    <circle cx="56" cy="46" r="9" fill="#ffffff"/>
    <circle cx="144" cy="46" r="18" fill="#8a5327" stroke="${OL}" stroke-width="3.5"/>
    <circle cx="144" cy="46" r="9" fill="#ffffff"/>

    <!-- Head -->
    <ellipse cx="100" cy="102" rx="60" ry="52" fill="url(#tanuki_${u})" stroke="${OL}" stroke-width="4.2"/>

    <!-- Black Eye-Mask Patch (Like the Raccoon in Reference!) -->
    <path d="M52 92 Q74 80 94 96 Q74 114 52 108 Z" fill="#382012"/>
    <path d="M148 92 Q126 80 106 96 Q126 114 148 108 Z" fill="#382012"/>

    <!-- White Cheeks & Muzzle -->
    <ellipse cx="100" cy="116" rx="36" ry="24" fill="#ffffff" stroke="${OL}" stroke-width="2.5"/>

    <!-- Big Boba Eyes inside Mask -->
    ${bobaEye(74, 98, 1, '#3a1e0f', u)}
    ${bobaEye(126, 98, 1, '#3a1e0f', u)}

    <!-- Cute Black Nose -->
    <ellipse cx="100" cy="114" rx="6.5" ry="4.5" fill="#211008"/>
    <circle cx="98" cy="112" r="1.5" fill="#ffffff"/>

    <!-- Blush & Joyful Mouth -->
    ${cuteBlush(58, 142, 118, 1)}
    ${cuteMouth('happy', 100, 128, 0.95)}

    <!-- Yellow Hardhat (Reference match) -->
    <path d="M48 64 Q52 20 100 18 Q148 20 152 64 Z" fill="#ffd438" stroke="${OL}" stroke-width="4"/>
    <path d="M40 64 Q100 58 160 64 L156 70 Q100 64 44 70 Z" fill="#e5b81b" stroke="${OL}" stroke-width="3.5"/>
  `);
}

export function shadowSVG() {
  return wrap(`
    <ellipse cx="100" cy="193" rx="50" ry="7" fill="rgba(0,0,0,0.25)"/>
    <path d="M40 190 Q30 100 60 60 Q100 10 140 60 Q170 100 160 190 Q140 175 125 190 Q110 175 100 190 Q90 175 75 190 Q60 175 40 190Z" fill="#2d2240" stroke="#120b1c" stroke-width="4"/>
    <ellipse cx="80" cy="92" rx="9" ry="12" fill="#ff5a5a"/>
    <ellipse cx="120" cy="92" rx="9" ry="12" fill="#ff5a5a"/>
    <text x="100" y="150" text-anchor="middle" font-size="44" fill="#ffe14d" font-family="Jua">?</text>
  `);
}

export function npcSVG(o: {
  hair?: string;
  suit?: string;
  suit2?: string;
  collar?: string;
  hat?: string | null;
  old?: boolean;
  mood?: string;
}) {
  const u = ++_u;
  const hair = o.hair || '#452613';
  const suit = o.suit || '#5a7da8';
  const suit2 = o.suit2 || '#3a5d88';

  const skinId = `nsk_${u}`;

  let eyes = bobaEye(75, 102, 1.05, '#3a1e0f', u, 0, false) +
             bobaEye(125, 102, 1.05, '#3a1e0f', u, 0, false);
  if (o.mood === 'joy') eyes = closedEyeCurve(75, 102, 1.05) + closedEyeCurve(125, 102, 1.05);

  const glasses = o.old
    ? `<circle cx="75" cy="102" r="15" fill="none" stroke="${OL}" stroke-width="3"/><circle cx="125" cy="102" r="15" fill="none" stroke="${OL}" stroke-width="3"/><line x1="90" y1="102" x2="110" y2="102" stroke="${OL}" stroke-width="3"/>`
    : '';

  const hat = o.hat
    ? `<path d="M46 76 Q50 36 100 34 Q150 36 154 76 Z" fill="${o.hat}" stroke="${OL}" stroke-width="4"/><path d="M38 78 L162 78" stroke="${OL}" stroke-width="8" stroke-linecap="round"/><path d="M38 78 L162 78" stroke="${o.hat}" stroke-width="4" stroke-linecap="round"/>`
    : '';

  return wrap(`
    <defs>
      <radialGradient id="${skinId}" cx="45%" cy="38%" r="72%">
        <stop offset="0%" stop-color="#fff8f0"/>
        <stop offset="70%" stop-color="#ffe3cf"/>
        <stop offset="100%" stop-color="#f7be9e"/>
      </radialGradient>
    </defs>
    ${shadow()}

    <path d="M48 200 Q52 166 80 160 L120 160 Q148 166 152 200 Z" fill="${suit}" stroke="${OL}" stroke-width="4"/>
    <path d="M80 160 L100 176 L120 160" fill="${o.collar || '#ffffff'}" stroke="${OL}" stroke-width="3.5"/>

    <path d="M52 100 Q48 144 100 164 Q152 144 148 100 Q148 56 100 54 Q52 56 52 100 Z" fill="url(#${skinId})" stroke="${OL}" stroke-width="4"/>

    <!-- Hair -->
    <path d="M46 100 Q46 54 100 48 Q154 54 154 100 L146 82 L136 94 L122 76 L112 92 L100 76 L88 92 L78 76 L64 94 Z" fill="${o.old ? '#d5d8e0' : hair}" stroke="${OL}" stroke-width="4"/>

    ${hat}
    ${eyes}
    ${glasses}
    ${cuteBlush(58, 142, 122, 1)}
    <circle cx="100" cy="120" r="2.2" fill="#ba6f45"/>
    ${cuteMouth(o.mood || 'happy', 100, 138, 1)}
  `);
}

/* =========================================================================
   SPEAKER RESOLUTION HELPER
   ========================================================================= */

export function getCharacterSVG(who: SpeakerId, mood = 'happy', avatar: AvatarType = 'a') {
  switch (who) {
    case 'pori':
      return poriSVG(mood);
    case 'thermo':
      return thermoSVG(mood);
    case 'danbi':
      return danbiSVG(mood);
    case 'luka':
      return lukaSVG(mood);
    case 'me':
      return heroSVG(mood, avatar);
    case 'friend':
      return heroSVG(mood, 'c');
    case 'shadow':
      return shadowSVG();
    case 'factory':
      return npcSVG({ hat: '#ffd438', suit: '#5a7da8', hair: '#3a2010', mood });
    case 'squirrel':
      return squirrelSVG();
    case 'police':
      return npcSVG({ hat: '#2a4f8c', suit: '#2a4f8c', suit2: '#4a7cc4', collar: '#ffd438', mood });
    case 'grandma':
      return npcSVG({ old: true, suit: '#d77fa1', suit2: '#f2a6c2', mood });
    case 'janitor':
      return npcSVG({ hat: '#2fa86a', suit: '#2fa36a', suit2: '#55cf8f', hair: '#2b2b2b', mood });
    case 'villager':
      return npcSVG({ mood: mood || 'sad', suit: '#d98a4a', suit2: '#f2ad6f' });
    case 'rep':
      return npcSVG({ suit: '#7a5ac8', suit2: '#a589f0', mood });
    case 'narr':
    default:
      return '';
  }
}

export const CHARACTER_INFO: Record<SpeakerId, { name: string; bg: string }> = {
  pori: { name: '포리', bg: '#dff3ff' },
  thermo: { name: '써모', bg: '#e0f7ff' },
  danbi: { name: '단비 대장', bg: '#ffe7d6' },
  luka: { name: '루카', bg: '#d9fbef' },
  me: { name: '{name}', bg: '#fff3c4' },
  friend: { name: '친구', bg: '#ece6ff' },
  shadow: { name: '???', bg: '#3a2c4f' },
  factory: { name: '공장장', bg: '#e8eef6' },
  squirrel: { name: '다람쥐 (너구리)', bg: '#e9f8d9' },
  police: { name: '교통경찰', bg: '#e3ecfb' },
  grandma: { name: '이웃 할머니', bg: '#ffe9f2' },
  janitor: { name: '미화원 아저씨', bg: '#e2f7ea' },
  villager: { name: '마을 주민', bg: '#fff0de' },
  rep: { name: '대표', bg: '#f0eaff' },
  narr: { name: '', bg: 'transparent' }
};

/* =========================================================================
   SCENIC BACKGROUNDS (Warm Sunset Atmosphere matching the reference)
   ========================================================================= */

export const BACKGROUNDS: Record<string, string> = {
  classroom: `<svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><rect width="1000" height="560" fill="#ffe9c2"/>
   <rect y="400" width="1000" height="160" fill="#d9a066"/><path d="M0 400h1000" stroke="${OL}" stroke-width="5"/>
   <rect x="300" y="70" width="400" height="220" rx="14" fill="#2f6b4f" stroke="${OL}" stroke-width="7"/><text x="500" y="190" text-anchor="middle" font-family="Jua" font-size="40" fill="#e9f5ee" opacity=".85">기후변화와 우리 생활</text>
   <rect x="60" y="80" width="170" height="200" rx="10" fill="#bfe6ff" stroke="${OL}" stroke-width="6"/><path d="M145 80v200M60 180h170" stroke="${OL}" stroke-width="5"/>
   <rect x="780" y="80" width="170" height="200" rx="10" fill="#bfe6ff" stroke="${OL}" stroke-width="6"/><path d="M865 80v200M780 180h170" stroke="${OL}" stroke-width="5"/>
   <g fill="#c98a4b" stroke="${OL}" stroke-width="5"><rect x="120" y="430" width="220" height="40" rx="8"/><rect x="660" y="430" width="220" height="40" rx="8"/></g></svg>`,
  hq: `<svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><defs><linearGradient id="hqg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd6ff"/><stop offset="1" stop-color="#e3f4ff"/></linearGradient></defs>
   <rect width="1000" height="560" fill="url(#hqg)"/><rect y="430" width="1000" height="130" fill="#7aa8d6"/><path d="M0 430h1000" stroke="${OL}" stroke-width="5"/>
   <rect x="230" y="40" width="540" height="300" rx="24" fill="#1d4478" stroke="${OL}" stroke-width="8"/>
   <g fill="#5fc9a8" stroke="#0e2a50" stroke-width="3"><path d="M290 120 q40-30 90-10 q30 20 10 50 q-30 30-70 20 q-40-20-30-60z"/><path d="M420 100 q50-20 110 0 q40 20 30 60 q-30 40-90 30 q-60-20-50-90z"/><path d="M600 110 q60-30 120 10 q20 40-20 70 q-50 20-90-10 q-30-30-10-70z"/><path d="M360 220 q30-10 50 20 q10 40-20 70 q-30 10-40-30 q-10-40 10-60z"/><path d="M640 230 q40-10 60 20 q0 30-40 40 q-40-10-20-60z"/></g>
   <text x="500" y="320" text-anchor="middle" font-family="Jua" font-size="22" fill="#9fe3ff">북극곰 구조대 지구 관측 화면</text>
   <g stroke="${OL}" stroke-width="5"><rect x="80" y="360" width="200" height="80" rx="14" fill="#ffd23f"/><rect x="720" y="360" width="200" height="80" rx="14" fill="#ffd23f"/></g>
   <g><circle cx="120" cy="395" r="10" fill="#ff5a4a"/><circle cx="160" cy="395" r="10" fill="#2fbf71"/><circle cx="200" cy="395" r="10" fill="#3a9be6"/><circle cx="760" cy="395" r="10" fill="#2fbf71"/><circle cx="800" cy="395" r="10" fill="#ff5a4a"/><circle cx="840" cy="395" r="10" fill="#3a9be6"/></g></svg>`,
  arctic: `<svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a99be6"/><stop offset=".5" stop-color="#f5b3b6"/><stop offset="1" stop-color="#ffd896"/></linearGradient></defs>
   <rect width="1000" height="560" fill="url(#ag)"/><circle cx="780" cy="300" r="70" fill="#fff2b0" opacity=".9"/>
   <path d="M0 140 Q250 60 500 140 T1000 120" stroke="#9ff0d8" stroke-width="40" fill="none" opacity=".45"/>
   <rect y="330" width="1000" height="230" fill="#4fb0e8"/><path d="M0 330h1000" stroke="${OL}" stroke-width="5"/>
   <g fill="#fff" stroke="${OL}" stroke-width="6"><path d="M60 360 l60-40 h140 l40 40 z"/><path d="M640 420 l40-30 h120 l50 30 z"/><path d="M380 470 l30-20 h80 l30 20 z"/></g>
   <g stroke="#2a7cc4" stroke-width="4" opacity=".6" fill="none"><path d="M100 420 q20 -10 40 0"/><path d="M520 380 q20-10 40 0"/><path d="M820 500 q20-10 40 0"/></g></svg>`,
  ocean: `<svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><defs><linearGradient id="og" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd3ff"/><stop offset="1" stop-color="#2a6fb8"/></linearGradient></defs>
   <rect width="1000" height="560" fill="url(#og)"/><g fill="#fff" opacity=".18"><path d="M150 0 L260 0 L120 560 L40 560z"/><path d="M520 0 L600 0 L520 560 L420 560z"/></g>
   <path d="M0 470 Q250 440 500 470 T1000 460 V560 H0z" fill="#f2d49b" stroke="${OL}" stroke-width="5"/></svg>`,
  town: `<svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><defs>
    <!-- Warm Sunset Town Skyline Matching Reference Image -->
    <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f5a484"/>
      <stop offset="45" stop-color="#ffd596"/>
      <stop offset="100" stop-color="#fff0c4"/>
    </linearGradient>
   </defs>
   <rect width="1000" height="560" fill="url(#tg)"/>
   <!-- Sunset Glowing Clouds -->
   <ellipse cx="200" cy="100" rx="140" ry="40" fill="#ffffff" opacity="0.3"/>
   <ellipse cx="650" cy="140" rx="180" ry="50" fill="#ffffff" opacity="0.25"/>
   <!-- Apartment Buildings matching the reference background -->
   <g fill="#d9c5b8" stroke="${OL}" stroke-width="4">
     <rect x="50" y="180" width="140" height="280"/>
     <rect x="220" y="110" width="130" height="350"/>
     <rect x="680" y="130" width="140" height="330"/>
     <rect x="850" y="190" width="120" height="270"/>
   </g>
   <!-- Glowing Warm Windows -->
   <g fill="#ffe066">
     <rect x="70" y="210" width="24" height="24" rx="3"/><rect x="120" y="270" width="24" height="24" rx="3"/>
     <rect x="240" y="150" width="24" height="24" rx="3"/><rect x="290" y="220" width="24" height="24" rx="3"/>
     <rect x="710" y="170" width="24" height="24" rx="3"/><rect x="760" y="240" width="24" height="24" rx="3"/>
     <rect x="880" y="230" width="24" height="24" rx="3"/>
   </g>
   <!-- Green Trees & Ground -->
   <rect y="460" width="1000" height="100" fill="#75ba52"/><path d="M0 460h1000" stroke="${OL}" stroke-width="5"/>
   <circle cx="180" cy="450" r="40" fill="#88cf60" stroke="${OL}" stroke-width="4"/>
   <circle cx="640" cy="445" r="50" fill="#88cf60" stroke="${OL}" stroke-width="4"/>
  </svg>`
};
