/// <reference types="vite/client" />
import type { AvatarType, SpeakerId } from './types';

// vite.config.ts의 base('./') 기준 경로라서 GitHub Pages 하위 주소에서도 동작한다.
const BASE = import.meta.env.BASE_URL;
const img = (name: string) => `${BASE}assets/img/${name}.webp`;

export const TITLE_IMAGE = img('title');
export const MAP_IMAGE = img('map');

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
  squirrel: img('face-raccoon')
};

export const PORI_FACE = img('face-pori');
export const ME_FACE = img('face-me');

/**
 * 말하는 캐릭터의 얼굴 그림 주소. 그림이 없는 인물(공장장, 할머니 등)과
 * 직접 고른 다른 아바타는 null을 돌려주며, 이때는 기존 SVG 얼굴을 쓴다.
 */
export function getFaceImage(who: SpeakerId, avatar: AvatarType): string | null {
  if (who === 'me') return avatar === 'a' ? ME_FACE : null;
  return FACE_IMAGES[who] ?? null;
}

/** 장면이 바뀔 때 깜박이지 않도록 배경 그림을 미리 받아 둔다. */
export function preloadImages() {
  [TITLE_IMAGE, MAP_IMAGE, ...Object.values(SCENE_IMAGES), ...Object.values(FACE_IMAGES), ME_FACE].forEach(
    src => {
      const im = new Image();
      im.src = src;
    }
  );
}
