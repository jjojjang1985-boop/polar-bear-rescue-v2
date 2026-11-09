/**
 * 플래닛 가디언즈 기술(마법·무기)과 탄소 대마왕의 공격.
 * 작전마다 후보 3개 중 1개를 골라 익히고, 최종 결전에서는 익힌 기술로만 공격을 막을 수 있다.
 */

export type SkillKind = 'item' | 'utility' | 'battle';

export interface SkillInfo {
  ic: string;
  name: string;
  /** 고르기 창과 기술 도감에 나오는 설명 */
  desc: string;
  kind: SkillKind;
  /** 보스전에서 막을 수 있는 공격 이름들 (battle 기술) */
  blocks?: string;
}

export const SKILLS: Record<string, SkillInfo> = {
  // ---- 장비 (선택 없이 받음)
  watch: { ic: '⌚', name: '수련생 손목 통신기', kind: 'item', desc: '대사 속 반짝이는 단어를 단서 수첩에 저장해요.' },
  badge: { ic: '🏅', name: '지구레인저 배지', kind: 'item', desc: '플래닛 가디언즈가 인정한 정식 지구레인저의 증표예요.' },

  // ---- 작전 1: 보조 마법 (관측과 대비)
  goggle: { ic: '🥽', name: '간파의 고글', kind: 'utility', desc: '최종 결전에서 3번까지, 지금 공격을 막을 기술이 있는지 알려 줘요.' },
  heal: { ic: '🧊', name: '빙하 회복 마법', kind: 'utility', desc: '최종 결전을 시작할 때 빙하 탑 블록을 4개 더 쌓고 시작해요.' },
  clock: { ic: '⏳', name: '시간 멈춤 시계', kind: 'utility', desc: '최종 결전에서 공격마다 생각할 시간이 15초에서 25초로 늘어나요.' },

  // ---- 작전 2: 원인을 막는 기술
  saver: { ic: '🔌', name: '절전 스위치', kind: 'battle', desc: '쓰지 않는 전기를 딸깍 꺼 버려요.', blocks: '빈방 전등 번개 · 플러그 대기 전력 광선 · 문 열고 튼 에어컨 폭풍' },
  bike: { ic: '🚲', name: '자전거 질주', kind: 'battle', desc: '가까운 거리는 걷거나 자전거로! 매연을 멈춰요.', blocks: '가까운 길 자동차 배기가스 · 편의점 오토바이 매연탄' },
  guard: { ic: '🛡️', name: '숲 지킴이 방패', kind: 'battle', desc: '숲이 불타거나 마구 베어지지 않게 지켜요.', blocks: '숲을 태우는 산불 연기 · 벌목 톱날' },

  // ---- 작전 3: 탄소를 흡수하고 줄이는 기술
  tree: { ic: '🌳', name: '나무 심기 지팡이', kind: 'battle', desc: '나무를 쑥쑥 키워 이산화 탄소를 빨아들여요.', blocks: '공장 굴뚝 이산화 탄소 구름 · 벌목 톱날' },
  seaforest: { ic: '🌊', name: '바다 숲 소환', kind: 'battle', desc: '미역·다시마 바다 숲을 되살려 바다를 지켜요.', blocks: '바다 열기 파도 · 바다 사막화 물결' },
  solar: { ic: '☀️', name: '태양광 캐논', kind: 'battle', desc: '햇빛으로 만든 깨끗한 에너지를 쏘아요.', blocks: '석탄 태우는 발전소 매연 · 공장 굴뚝 이산화 탄소 구름' },

  // ---- 작전 4: 생활 속 실천 기술
  recycle: { ic: '♻️', name: '분리배출 부메랑', kind: 'battle', desc: '쓰레기를 나눠 담아 다시 자원으로 되돌려요.', blocks: '마구 섞어 버린 쓰레기 산사태 · 라벨 안 뗀 페트병 미사일' },
  bag: { ic: '🛍️', name: '장바구니 방패', kind: 'battle', desc: '장바구니와 텀블러로 일회용품을 막아요.', blocks: '일회용 컵 소나기 · 비닐봉지 회오리' },
  plate: { ic: '🍽️', name: '남김없이 접시', kind: 'battle', desc: '먹을 만큼만 담아 음식물 쓰레기를 없애요.', blocks: '먹다 남긴 음식물 쓰레기 폭탄 · 남긴 급식 폭탄' }
};

/** 작전 번호(1~4)별로 고를 수 있는 기술 후보 */
export const STAGE_PICKS: Record<number, string[]> = {
  1: ['goggle', 'heal', 'clock'],
  2: ['saver', 'bike', 'guard'],
  3: ['tree', 'seaforest', 'solar'],
  4: ['recycle', 'bag', 'plate']
};

/** 기술을 하나도 고르지 않은 채 결전에 들어온 경우(선생님 모드 등) 쓰는 기본 기술 */
export const DEFAULT_SKILLS = ['goggle', 'saver', 'tree', 'recycle'];

export interface Attack {
  id: string;
  em: string;
  name: string;
  /** 이 공격을 막을 수 있는 기술 */
  counters: string[];
  /** 써모의 설명 (교과서 내용) */
  why: string;
}

export const ATTACKS: Attack[] = [
  { id: 'factory', em: '🏭', name: '공장 굴뚝 이산화 탄소 구름', counters: ['tree', 'solar'], why: '나무는 이산화 탄소를 빨아들이고, 깨끗한 에너지를 쓰면 처음부터 덜 내보내.' },
  { id: 'coal', em: '⚫', name: '석탄 태우는 발전소 매연', counters: ['solar'], why: '석탄 같은 화석 연료 대신 태양광 같은 친환경 에너지를 쓰면 이산화 탄소가 줄어.' },
  { id: 'fire', em: '🔥', name: '숲을 태우는 산불 연기', counters: ['guard'], why: '숲을 지키면 이산화 탄소를 흡수하는 힘도 지킬 수 있어.' },
  { id: 'logging', em: '🪚', name: '숲을 싹쓸이하는 벌목 톱날', counters: ['guard', 'tree'], why: '숲을 베지 않고 지키거나, 나무를 다시 심어야 해.' },
  { id: 'sea', em: '🌡️', name: '뜨거워진 바다 열기 파도', counters: ['seaforest'], why: '바다 숲이 되살아나면 바다가 이산화 탄소를 더 흡수해.' },
  { id: 'desert', em: '🪨', name: '바닷말이 사라진 바다 사막화 물결', counters: ['seaforest'], why: '인공 어초와 바닷말로 바다 숲을 되살릴 수 있어. 5월 10일은 바다 식목일!' },
  { id: 'light', em: '💡', name: '빈방에 켜 둔 전등 번개', counters: ['saver'], why: '빈방의 불을 끄면 전기와 이산화 탄소가 함께 줄어.' },
  { id: 'standby', em: '📺', name: '꽂아만 둔 플러그 대기 전력 광선', counters: ['saver'], why: '안 쓰는 전자 제품은 플러그를 뽑거나 꺼야 해.' },
  { id: 'aircon', em: '🥵', name: '문 열고 튼 에어컨 폭풍', counters: ['saver'], why: '창문을 닫고 알맞은 온도로 틀면 에너지를 아낄 수 있어.' },
  { id: 'car', em: '🚗', name: '가까운 길도 자동차 배기가스', counters: ['bike'], why: '가까운 거리는 걷거나 자전거를 타면 매연이 나오지 않아.' },
  { id: 'moto', em: '🏍️', name: '코앞 편의점도 오토바이 매연탄', counters: ['bike'], why: '편의점처럼 가까운 곳은 걸어가면 돼. 루카도 이제 알지?' },
  { id: 'trash', em: '🗑️', name: '마구 섞어 버린 쓰레기 산사태', counters: ['recycle'], why: '분리배출하면 쓰레기가 다시 자원이 돼.' },
  { id: 'pet', em: '🧴', name: '라벨 안 뗀 페트병 미사일', counters: ['recycle'], why: '라벨을 떼고 분리배출하면 다시 쓸 수 있는 자원이 돼.' },
  { id: 'cup', em: '🥤', name: '한 번 쓰고 버린 일회용 컵 소나기', counters: ['bag'], why: '텀블러를 쓰면 일회용 컵을 만들고 버릴 때 드는 에너지가 줄어.' },
  { id: 'vinyl', em: '🌪️', name: '장 볼 때마다 받은 비닐봉지 회오리', counters: ['bag'], why: '장바구니를 쓰면 비닐 사용을 줄일 수 있어.' },
  { id: 'lunch', em: '🍚', name: '욕심껏 담고 남긴 급식 폭탄', counters: ['plate'], why: '급식은 먹을 만큼만 받고 다 먹으면 버려지는 음식이 줄어.' },
  { id: 'food', em: '🍱', name: '먹다 남긴 음식물 쓰레기 폭탄', counters: ['plate'], why: '먹을 만큼만 받아 남기지 않으면 음식물 쓰레기를 처리하는 에너지가 줄어.' }
];
