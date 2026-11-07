/// <reference types="vite/client" />
import type { AvatarType, SpeakerId } from './types';

// vite.config.ts의 base('./') 기준 경로라서 GitHub Pages 하위 주소에서도 동작한다.
const BASE = import.meta.env.BASE_URL;
const img = (name: string) => `${BASE}assets/img/${name}.webp`;

export const TITLE_IMAGE = img('title');
export const MAP_IMAGE = img('map');
export const SHADOW_IMAGE = img('shadow');
export const SOS_MAP_IMAGE = img('sos-map');

/** 대사 장면 배경 (stagesData의 bg 값과 같은 이름) */
export const SCENE_IMAGES: Record<string, string> = {
  classroom: img('bg-classroom'),
  hq: img('bg-hq'),
  arctic: img('bg-arctic'),
  ocean: img('bg-ocean'),
  town: img('bg-town')
};

const FACE_IMAGES: Partial<Record<SpeakerId, string>> = {
  pori: img('face-pori'),
  thermo: img('face-thermo'),
  danbi: img('face-danbi'),
  luka: img('face-luka'),
  squirrel: img('face-raccoon'),
  friend: img('face-friend'),
  factory: img('face-factory'),
  police: img('face-police'),
  grandma: img('face-grandma'),
  janitor: img('face-janitor'),
  villager: img('face-villager'),
  rep: img('face-rep')
};

export const PORI_FACE = img('face-pori');
export const ME_FACE = img('face-me');

/** 등록 화면에서 고르는 신입 대원 얼굴 (a: 단발, b: 소년, c: 친구) */
export const AVATAR_FACES: Record<AvatarType, string> = {
  a: ME_FACE,
  b: img('face-boy'),
  c: img('face-friend')
};

/**
 * 말하는 캐릭터의 얼굴 그림 주소. 그림이 없는 인물(예: 그림자)은 null을
 * 돌려주며, 이때는 기존 SVG 얼굴을 쓴다.
 */
export function getFaceImage(who: SpeakerId, avatar: AvatarType): string | null {
  if (who === 'me') return AVATAR_FACES[avatar] ?? ME_FACE;
  return FACE_IMAGES[who] ?? null;
}

/** 장면이 바뀔 때 깜박이지 않도록 배경 그림을 미리 받아 둔다. */
export function preloadImages() {
  [TITLE_IMAGE, MAP_IMAGE, SHADOW_IMAGE, ...Object.values(SCENE_IMAGES), ...Object.values(FACE_IMAGES), ...Object.values(AVATAR_FACES)].forEach(
    src => {
      const im = new Image();
      im.src = src;
    }
  );
}

/**
 * 기술 효과 그림. 선생님이 그림을 올리면 파일 이름(skill-<id>.webp)을 이 목록에 추가한다.
 * 목록에 없는 기술은 이모지로 보여 준다.
 */
export const SKILL_ART_READY: string[] = [
  'goggle', 'heal', 'clock',
  'saver', 'bike', 'guard',
  'tree', 'seaforest', 'solar',
  'recycle', 'bag', 'plate'
];

export function getSkillArt(id: string): string | null {
  return SKILL_ART_READY.includes(id) ? img(`skill-${id}`) : null;
}

/** 작전 2 수사 장소 그림 (hunt-<id>.webp). 그림이 들어오면 이 목록에 id를 추가한다. */
export const HUNT_ART_READY: string[] = ['factory', 'forest', 'road', 'home', 'school'];

export function getHuntArt(id: string): string | null {
  return HUNT_ART_READY.includes(id) ? img(`hunt-${id}`) : null;
}
