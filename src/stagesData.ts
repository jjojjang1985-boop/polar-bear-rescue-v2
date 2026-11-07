import type { MoodType, QuizItem, SpeakerId } from './types';

export interface StageStepSay {
  type: 'say';
  who: SpeakerId;
  text: string;
  mood?: MoodType;
  must?: string;
}

export interface StageStepBg {
  type: 'bg';
  bg: string;
}

export interface StageStepFx {
  type: 'fx';
  name: 'flash' | 'towerOn' | 'twist' | 'shadowPeek' | 'stageCrack' | 'winFlash';
}

export interface StageStepMission {
  type: 'mission';
  id:
    | 'sort-1'
    | 'sos'
    | 'graph'
    | 'glacier'
    | 'sealevel'
    | 'match-1'
    | 'hunt'
    | 'evidence-board'
    | 'chain'
    | 'sort-2'
    | 'scale'
    | 'seaforest'
    | 'council'
    | 'week'
    | 'campaign'
    | 'rush'
    | 'pledge'
    | 'ceremony';
  options?: any;
}

export interface StageStepQuiz {
  type: 'quiz';
  items: QuizItem[];
}

export interface StageStepReward {
  type: 'reward';
  gear: string;
}

export type StageStep =
  | StageStepSay
  | StageStepBg
  | StageStepFx
  | StageStepMission
  | StageStepQuiz
  | StageStepReward;

export interface StageDefinition {
  label: string;
  title: string;
  goal: string;
  bg: string;
  clues: string[];
  steps: StageStep[];
}

export const GEAR_INFO: Record<string, { ic: string; name: string }> = {
  watch: { ic: '⌚', name: '구조대 손목 통신기' },
  goggle: { ic: '🥽', name: '기후 관측 고글' },
  detector: { ic: '🔍', name: '단서 탐지기' },
  scale: { ic: '⚖️', name: '탄소 저울' },
  badge: { ic: '🏅', name: '북극곰 구조대 정식 배지' }
};

export const STAGES: StageDefinition[] = [
  // ---------- 프롤로그 ----------
  {
    label: '프롤로그',
    title: '구조 요청이 도착했다',
    goal: '아기 북극곰 포리의 SOS를 받고 북극곰 구조대에 합류해요.',
    bg: 'classroom',
    clues: ['빙하'],
    steps: [
      { type: 'say', who: 'narr', text: '친구와 함께 도서관에서 빌린 책을 펼친 날이었어요.' },
      { type: 'say', who: 'friend', text: '이 사진 좀 봐. 북극곰이 쉴 곳을 잃고 먹잇감도 못 찾고 있대.', mood: 'sad' },
      { type: 'say', who: 'me', text: '어? 북극은 원래 엄청 추운 곳 아니야? 왜 얼음이 녹고 있지?', mood: 'o' },
      { type: 'say', who: 'narr', text: '그때, 책 속 북극곰 사진이 파랗게 빛나기 시작했어요.' },
      { type: 'fx', name: 'flash' },
      { type: 'bg', bg: 'hq' },
      { type: 'say', who: 'thermo', text: '삐빅! 신입 대원 도착 확인. 북극곰 구조대 본부에 온 걸 환영해.', mood: 'happy' },
      { type: 'say', who: 'luka', text: '와, 진짜 왔다! 반가워, 나는 선배 대원 루카야. 너 이름이 뭐야?', mood: 'grin' },
      { type: 'say', who: 'me', text: '나는 {name}! 코드네임은 {code}야.', mood: 'happy' },
      { type: 'say', who: 'danbi', text: '반갑다, {name} 대원. 나는 구조대장 단비야. 방금 너에게 온 빛은 우리가 보낸 호출 신호였어. 기후를 궁금해하는 사람에게만 보이는 빛이지.', mood: 'smile' },
      { type: 'say', who: 'danbi', text: '지금 우리에겐 급한 구조 요청이 하나 있어. 써모, 통신 연결해 줘.', mood: 'serious' },
      { type: 'bg', bg: 'arctic' },
      { type: 'fx', name: 'stageCrack' },
      { type: 'say', who: 'pori', text: '구조대님, 들리세요? 저는 포리예요. 엄마랑 사냥하러 나왔는데, 밟고 있던 얼음이 갑자기 갈라졌어요.', mood: 'scared' },
      { type: 'say', who: 'pori', text: '얼음이 자꾸 녹아서 엄마한테 돌아갈 수가 없어요. 도와주세요!', mood: 'sad' },
      { type: 'say', who: 'luka', text: '대장님, 당장 헬기 타고 가서 포리를 구해 오면 되잖아요!', mood: 'o' },
      { type: 'say', who: 'danbi', text: '그러면 오늘은 포리를 구하겠지. 하지만 내일도, 다음 달에도 빙하는 계속 녹을 거야. 포리가 엄마와 다시 살려면, 빙하가 녹는 걸 멈춰야 해.', mood: 'serious' },
      { type: 'fx', name: 'towerOn' },
      { type: 'say', who: 'thermo', text: '삐빅! 포리 주변에 빙하 블록 탑을 설치했어. 화면 오른쪽을 봐. 우리가 올바른 선택을 할 때마다 블록이 단단해지고, 틀리면 블록 하나가 녹아내려.', mood: 'happy' },
      { type: 'say', who: 'danbi', text: '{name} 대원, 이것을 받아. 구조대 손목 통신기야. 대사 속에서 반짝이는 단어를 누르면 단서 수첩에 저장돼. 지금 **빙하**를 눌러 봐.', mood: 'smile', must: '빙하' },
      { type: 'say', who: 'thermo', text: '삐빅! 잘했어. 단서를 모두 모아야 작전 끝의 확인 퀴즈가 열려. 정답을 맞힐수록, 연속으로 맞힐수록 점수가 올라가.', mood: 'happy' },
      { type: 'say', who: 'danbi', text: '네 번의 작전이 기다리고 있다. 북극곰 구조대, 출동!', mood: 'smile' },
      { type: 'reward', gear: 'watch' }
    ]
  },
  // ---------- 작전 1 ----------
  {
    label: '작전 1',
    title: '지구 이상 신호를 추적하라',
    goal: '날씨와 기후, 기후변화의 뜻을 알고 기후변화 현상과 피해를 확인해요. (교과서 88~89쪽, 92~95쪽)',
    bg: 'hq',
    clues: ['날씨', '기후', '평년', '기후변화', '기온 변화', '강수량 변화', '해수면 상승'],
    steps: [
      { type: 'say', who: 'narr', text: '삐삐! 본부 대형 화면의 세계 지도에 빨간 불빛이 하나씩 켜집니다.' },
      { type: 'say', who: 'thermo', text: '삐빅! 경고, 경고! 지구 곳곳에서 이상 신호가 감지되고 있어.', mood: 'alert' },
      { type: 'say', who: 'luka', text: '이상 신호? 불빛이 여기저기 다 켜져 있잖아!', mood: 'o' },
      { type: 'say', who: 'danbi', text: '포리의 빙하만 문제가 아니었군. 지구 전체에 무슨 일이 일어나고 있는지부터 알아야 해. 써모, 브리핑을 시작해.', mood: 'serious' },
      { type: 'say', who: 'thermo', text: '이상 신호를 읽으려면 먼저 두 단어를 구분해야 해. 날씨와 기후야.', mood: 'happy' },
      { type: 'say', who: 'thermo', text: '**날씨**는 오늘 비가 오는지, 덥거나 추운지처럼 그날그날 바뀌는 하늘과 공기의 상태야.', mood: 'happy' },
      { type: 'say', who: 'thermo', text: '**기후**는 한 지역에서 보통 30년 이상 오랜 기간에 걸쳐 나타나는 날씨의 평균적인 상태야.', mood: 'happy' },
      { type: 'say', who: 'luka', text: '에이, 그럼 간단하네! 오늘 엄청 추우니까 지구는 더워지는 게 아니라 추워지는 거지?', mood: 'grin' },
      { type: 'say', who: 'thermo', text: '삐빅! 틀렸어, 루카. 오늘 하루가 추운 건 날씨야. 지구가 더워지는지는 오랜 기간의 평균, 즉 기후를 봐야 알 수 있어.', mood: 'serious' },
      { type: 'say', who: 'danbi', text: '오늘 소나기가 온다는 건 날씨, 우리나라는 여름에 덥고 비가 많이 온다는 건 기후. 기억해 두도록.', mood: 'smile' },
      { type: 'mission', id: 'sort-1' },
      { type: 'say', who: 'thermo', text: '다음 단서는 **평년**이야. 지난 30년 동안 날씨의 평균적인 상태를 말해. "평년보다 덥다"는 건 보통 때보다 덥다는 뜻이야.', mood: 'happy' },
      { type: 'say', who: 'thermo', text: '그리고 이렇게 오랜 기간에 걸쳐 평균적인 날씨가 변하는 것을 **기후변화**라고 해.', mood: 'happy' },
      { type: 'say', who: 'luka', text: '근데 기후는 옛날에도 변했다며? 그럼 문제없는 거 아니야?', mood: 'o' },
      { type: 'say', who: 'danbi', text: '좋은 질문이야. 기후는 끊임없이 변해 왔어. 하지만 오늘날은 그 변화의 정도가 매우 커. 그래서 지도에 불빛이 이렇게 많이 켜진 거지.', mood: 'serious' },
      { type: 'mission', id: 'sos' },
      { type: 'say', who: 'thermo', text: '삐빅! 분석 완료. 폭염과 한파는 **기온 변화**로, 홍수·폭설·가뭄은 **강수량 변화**로 나타나는 현상이야. 이런 현상이 예년보다 더 자주 일어나고 정도도 심해지고 있어.', mood: 'happy' },
      { type: 'mission', id: 'graph' },
      { type: 'say', who: 'danbi', text: '기후변화가 사람과 자연에게 어떤 피해를 주는지 현장을 직접 확인하자.', mood: 'serious' },
      { type: 'mission', id: 'glacier' },
      { type: 'say', who: 'thermo', text: '삐빅! 지구의 평균 기온이 높아지면서 극지방과 육지를 덮고 있던 빙하가 빠르게 녹고 있어. 얼어 있던 땅도 녹고 있지.', mood: 'alert' },
      { type: 'say', who: 'luka', text: '그럼 녹은 물은 다 어디로 가?', mood: 'o' },
      { type: 'mission', id: 'sealevel' },
      { type: 'say', who: 'thermo', text: '삐빅! 이걸 **해수면 상승**이라고 해. 해안가가 물에 잠기고, 해안 생태계가 파괴돼서 많은 생물이 위험에 처해.', mood: 'serious' },
      { type: 'say', who: 'danbi', text: '실제로 남태평양의 섬나라 투발루는 바닷물에 잠겨 육지 면적이 줄어들고 있어.', mood: 'serious' },
      { type: 'mission', id: 'match-1' },
      {
        type: 'quiz',
        items: [
          { q: '오랜 기간에 걸쳐 평균적인 날씨가 변하는 것을 ( )(이)라고 해요.', hint: 'ㄱㅎㅂㅎ', a: '기후변화', opts: ['기후변화', '날씨', '평년', '해수면'] },
          { q: '한 지역에서 보통 ( )년 이상 나타나는 날씨의 평균적인 상태를 기후라고 해요.', a: '30', opts: ['1', '5', '30', '100'] },
          { q: '최근에 가뭄, 폭설, 폭염, 한파, 홍수 같은 ( ) 현상이 많이 나타나고 있어요.', hint: 'ㄱㅎㅂㅎ', a: '기후변화', opts: ['기후변화', '자연', '계절', '날씨예보'] },
          { q: '극지방과 육지의 빙하, 언 땅이 녹으면서 ( )이 상승하고 있어요.', hint: 'ㅎㅅㅁ', a: '해수면', opts: ['해수면', '산꼭대기', '구름', '기온계'] }
        ]
      },
      { type: 'say', who: 'danbi', text: '오늘 알아낸 것을 정리하자. 지구의 기후가 변하고 있고, 그 변화는 폭염, 한파, 홍수, 폭설, 가뭄으로 나타나. 빙하가 녹아 바닷물이 높아지고, 사람과 동물 모두 피해를 입고 있지.', mood: 'smile' },
      { type: 'say', who: 'thermo', text: '삐빅! 그런데 대장님, 이상한 게 있어요. 지구의 평균 기온이 계속 올라가고 있어요. 누군가 지구를 데우고 있는 것 같아요.', mood: 'alert' },
      { type: 'fx', name: 'shadowPeek' },
      { type: 'say', who: 'luka', text: '방금 봤어? 저 그림자가 범인일지도 몰라!', mood: 'o' },
      { type: 'say', who: 'danbi', text: '그렇다면 다음 작전은 하나야. 빙하를 녹인 범인을 찾는다. {name} 대원, 수고했어. 이것을 받아.', mood: 'serious' },
      { type: 'reward', gear: 'goggle' }
    ]
  },
  // ---------- 작전 2 ----------
  {
    label: '작전 2',
    title: '빙하를 녹인 범인을 찾아라',
    goal: '기후변화의 원인을 찾고, 지구 온난화와 온실가스의 관계를 알아봐요. (교과서 90~91쪽)',
    bg: 'town',
    clues: ['최근 100여 년', '인간의 활동', '온실가스', '지구 온난화'],
    steps: [
      { type: 'say', who: 'danbi', text: '대원들, 기후 관측 고글을 써. 고글을 끼면 지구를 데우는 흔적이 붉게 보여.', mood: 'serious' },
      { type: 'say', who: 'thermo', text: '삐빅! 수사 브리핑을 시작할게. 기후는 자연적으로도 변해 왔어. 그런데 **최근 100여 년** 동안에는 유독 급격하게 변하고 있어.', mood: 'happy' },
      { type: 'say', who: 'luka', text: '100년 전부터 갑자기? 그때 무슨 일이 있었는데?', mood: 'o' },
      { type: 'say', who: 'thermo', text: '그걸 알아내는 게 이번 작전이야. 단서를 따라가 보자.', mood: 'happy' },
      { type: 'mission', id: 'hunt' },
      { type: 'bg', bg: 'hq' },
      { type: 'mission', id: 'evidence-board' },
      { type: 'say', who: 'narr', text: '고글이 갑자기 삐삐 울립니다. 붉은 흔적이 바로 본부 안에서 보여요.' },
      { type: 'say', who: 'luka', text: '어…? 대장님, 본부 에어컨이 아무도 없는 방에서 켜져 있어요. 현관 불도요.', mood: 'o' },
      { type: 'say', who: 'luka', text: '그리고 아까 나는 편의점까지 오토바이를 타고 갔고… 음료수 컵도 세 개나 버렸어.', mood: 'sad' },
      { type: 'fx', name: 'twist' },
      { type: 'say', who: 'narr', text: '그림자가 화면 가득 나타났다가 작은 그림자 수백 개로 흩어졌어요. 그림자마다 사람의 모양이에요.' },
      { type: 'say', who: 'danbi', text: '그래, 범인은 악당 한 명이 아니었어. 편리한 생활을 위해 급격하게 늘어난 우리 모두의 활동, 바로 **인간의 활동**이 범인이야.', mood: 'serious' },
      { type: 'say', who: 'luka', text: '그럼… 나도 범인이었던 거야? 엉엉.', mood: 'sad' },
      { type: 'say', who: 'danbi', text: '자책할 필요는 없어, 루카. 오히려 좋은 소식이야. 우리가 한 일이 원인이라면, 우리가 바꿀 수도 있다는 뜻이니까.', mood: 'smile' },
      { type: 'say', who: 'luka', text: '그런데 대장님, 사람들이 불을 켜고 자동차를 타는 게 어떻게 북극의 빙하를 녹여요? 북극은 엄청 멀잖아요.', mood: 'o' },
      { type: 'say', who: 'thermo', text: '삐빅! 연결 고리를 하나씩 이어 줄게. 공장을 돌리고, 자동차를 타고, 전기를 쓰고, 숲을 태우면 공기 중으로 이산화 탄소 같은 기체가 많이 나와. 이런 기체를 **온실가스**라고 해.', mood: 'happy' },
      { type: 'say', who: 'thermo', text: '온실가스는 지구를 두꺼운 이불처럼 감싸서, 지구의 열이 우주로 빠져나가지 못하게 붙잡아.', mood: 'happy' },
      { type: 'say', who: 'luka', text: '아, 여름에 두꺼운 이불을 덮으면 땀이 뻘뻘 나는 것처럼?', mood: 'grin' },
      { type: 'say', who: 'thermo', text: '바로 그거야. 온실가스가 많아질수록 이불이 두꺼워져서 지구의 평균 기온이 점점 올라가. 이걸 **지구 온난화**라고 해.', mood: 'happy' },
      { type: 'say', who: 'danbi', text: '지구 온난화로 빙하가 녹아 해수면이 높아지고, 날씨의 균형이 흔들려 폭염, 홍수, 가뭄 같은 기후변화 현상이 심해지는 거야.', mood: 'serious' },
      { type: 'say', who: 'luka', text: '잠깐, 지구가 더워지는데 한파랑 폭설은 왜 생겨요?', mood: 'o' },
      { type: 'say', who: 'thermo', text: '삐빅! 지구가 더워지면 공기와 바다의 흐름이 흔들려. 그래서 어떤 곳은 갑자기 아주 추워지거나 눈이 한꺼번에 쏟아지기도 해. 날씨가 점점 극단적으로 변하는 거야.', mood: 'alert' },
      { type: 'say', who: 'danbi', text: '정리하자. 인간의 활동이 늘어나 온실가스가 많이 나오고, 온실가스 때문에 지구 온난화가 일어나고, 지구 온난화 때문에 기후변화가 심해진다. 이 연결 고리를 꼭 기억해.', mood: 'smile' },
      { type: 'mission', id: 'chain' },
      { type: 'mission', id: 'sort-2' },
      {
        type: 'quiz',
        items: [
          { q: '산림을 훼손하고 물과 에너지를 낭비하는 등 최근에 급격하게 늘어난 ( )의 활동은 기후변화에 영향을 주고 있어요.', hint: 'ㅇㄱ', a: '인간', opts: ['인간', '동물', '태양', '바다'] },
          { q: '기후는 인간의 활동이 많아진 최근 ( )여 년 동안 급격하게 변하고 있어요.', a: '100', opts: ['10', '100', '1000', '3'] },
          { q: '이산화 탄소처럼 지구를 이불처럼 감싸 열을 붙잡는 기체를 ( )(이)라고 해요.', hint: 'ㅇㅅㄱㅅ', a: '온실가스', opts: ['온실가스', '산소', '수증기 구름', '바람'] },
          { q: '온실가스가 많아져 지구의 평균 기온이 점점 올라가는 것을 ( )(이)라고 해요.', hint: 'ㅈㄱ ㅇㄴㅎ', a: '지구 온난화', opts: ['지구 온난화', '해수면', '평년', '계절 변화'] }
        ]
      },
      { type: 'say', who: 'danbi', text: '대장의 한마디. 공장에서 물건을 많이 만들고, 숲을 훼손하고, 교통수단을 많이 이용하고, 물과 에너지를 낭비하는 것. 이런 인간의 활동이 온실가스를 늘려 지구 온난화를 일으키고, 그 결과 기후변화가 심해지고 있어.', mood: 'smile' },
      { type: 'say', who: 'thermo', text: '삐빅! 다음 작전에서는 온실가스 중에서 가장 많이 나오는 기체를 자세히 조사할게요.', mood: 'happy' },
      { type: 'say', who: 'pori', text: '대원님, 범인을 찾았다는 소식 들었어요! 그럼 이제 얼음을 되돌릴 수 있는 거죠?', mood: 'happy' },
      { type: 'reward', gear: 'detector' }
    ]
  },
  // ---------- 작전 3 ----------
  {
    label: '작전 3',
    title: '탄소 저울을 맞춰라',
    goal: '이산화 탄소와 탄소 중립을 알고, 나라와 사회가 기후변화에 대응하는 방법을 알아봐요. (교과서 96~97쪽, 100~101쪽)',
    bg: 'hq',
    clues: ['이산화 탄소', '바다 숲', '흡수', '탄소 중립', '인공 어초', '바다 식목일'],
    steps: [
      { type: 'say', who: 'thermo', text: '삐빅! 작전 2에서 찾은 연결 고리 기억나? 인간의 활동이 늘어나면 온실가스가 나오고, 온실가스 때문에 지구 온난화가 일어나고, 그래서 기후변화가 심해졌지.', mood: 'happy' },
      { type: 'say', who: 'thermo', text: '온실가스 가운데 사람들의 활동으로 가장 많이 나오는 기체가 바로 **이산화 탄소**야. 공장을 돌리고, 자동차를 타고, 에너지를 쓸 때 많이 나와.', mood: 'happy' },
      { type: 'say', who: 'thermo', text: '이산화 탄소는 대기의 온도를 높이는 기체야. 이산화 탄소가 늘어날수록 지구 온난화가 심해지고, 빙하도 더 빨리 녹아.', mood: 'alert' },
      { type: 'say', who: 'luka', text: '그럼 이산화 탄소를 아예 없애 버리면 되잖아! 거대한 청소기 같은 걸로!', mood: 'grin' },
      { type: 'say', who: 'thermo', text: '삐빅! 상상력은 좋아. 그런데 지구에는 이미 이산화 탄소를 빨아들이는 청소기가 있어. 바로 나무와 숲, 그리고 미역·다시마·잘피가 자라는 **바다 숲**이야.', mood: 'happy' },
      { type: 'say', who: 'thermo', text: '이들은 이산화 탄소를 **흡수**해서 스스로 양분을 만들고, 그 과정에서 산소를 내보내.', mood: 'happy' },
      { type: 'say', who: 'narr', text: '본부 가운데에 커다란 저울이 나타납니다. 왼쪽 접시가 무겁게 내려가 있어요.' },
      { type: 'say', who: 'danbi', text: '이것이 이번 작전의 장비, 탄소 저울이야. 왼쪽 접시에는 사람들이 내보내는 이산화 탄소, 오른쪽 접시에는 숲과 바다 숲이 흡수하는 이산화 탄소가 올라가.', mood: 'serious' },
      { type: 'say', who: 'thermo', text: '지금은 내보내는 쪽이 훨씬 무거워서, 남은 이산화 탄소가 계속 쌓이고 있어. 내보내는 양을 줄이고 흡수하는 양을 늘려서 양쪽을 같게 맞추는 것. 이걸 **탄소 중립**이라고 해.', mood: 'happy' },
      { type: 'say', who: 'luka', text: '아하! 없애는 게 아니라 맞추는 거구나. 시소 탈 때처럼!', mood: 'grin' },
      { type: 'mission', id: 'scale' },
      { type: 'bg', bg: 'ocean' },
      { type: 'say', who: 'danbi', text: '긴급 상황이야. 바다 숲이 사막처럼 변하고 있대.', mood: 'serious' },
      { type: 'say', who: 'thermo', text: '삐빅! 기후변화로 바닷물의 온도가 높아지면서, 차가운 물에서 잘 자라는 미역과 다시마가 살기 어려워졌어. 이걸 바다 사막화라고 해.', mood: 'alert' },
      { type: 'say', who: 'thermo', text: '우리나라는 사람이 만든 돌인 **인공 어초**에 바닷말을 심어 바닷속으로 내려보내는 생태 기술을 쓰고 있어.', mood: 'happy' },
      { type: 'mission', id: 'seaforest' },
      { type: 'say', who: 'danbi', text: '바다 숲이 되살아나면 이산화 탄소를 더 많이 흡수해서 지구의 평균 기온이 높아지는 것을 막을 수 있어. 우리나라는 매년 5월 10일을 **바다 식목일**로 정해 바다 숲을 지키고 있지.', mood: 'smile' },
      { type: 'bg', bg: 'hq' },
      { type: 'say', who: 'danbi', text: '이번엔 세계 구조대 연합 회의다. 여러 나라가 기후변화에 어떻게 대응하는지 들어 보자.', mood: 'serious' },
      { type: 'mission', id: 'council' },
      {
        type: 'quiz',
        items: [
          { q: '이산화 탄소는 대기의 ( )를 높이는 기체예요.', hint: 'ㅇㄷ', a: '온도', opts: ['온도', '습도', '바람', '높이'] },
          { q: '내보내는 이산화 탄소와 흡수하는 이산화 탄소의 양을 같게 맞추는 것을 ( )(이)라고 해요.', hint: 'ㅌㅅ ㅈㄹ', a: '탄소 중립', opts: ['탄소 중립', '지구 온난화', '해수면 상승', '바다 사막화'] },
          { q: '기후변화에 대응하기 위해 숲을 보존하고 ( ) 기술을 개발해요.', hint: 'ㅊㅎㄱ', a: '친환경', opts: ['친환경', '자동차', '일회용', '우주'] }
        ]
      },
      { type: 'say', who: 'danbi', text: '대장의 한마디. 내보내는 이산화 탄소는 줄이고, 숲과 바다 숲으로 흡수는 늘리고. 저울을 맞추는 것이 탄소 중립이야. 여러 나라가 자연을 지키고, 친환경 기술을 만들고, 힘을 합치고 있지.', mood: 'smile' },
      { type: 'say', who: 'luka', text: '그럼 이제 나라들이 다 해 주는 거죠? 끝!', mood: 'grin' },
      { type: 'say', who: 'danbi', text: '아직이야. 저울을 끝까지 맞추려면 한 사람 한 사람의 힘이 필요해. 마지막 작전의 무대는 바로 너희들의 하루야.', mood: 'serious' },
      { type: 'reward', gear: 'scale' }
    ]
  },
  // ---------- 작전 4 ----------
  {
    label: '작전 4',
    title: '포리의 빙하를 되찾아라',
    goal: '생활 속에서 기후변화에 대응하는 방법을 실천하고, 주변에 알려요. (교과서 97~99쪽)',
    bg: 'arctic',
    clues: ['작은 행동부터', '걷거나 자전거', '전기를 아끼고', '일회용품과 비닐', '분리배출', '알려야', '꾸준히'],
    steps: [
      { type: 'say', who: 'narr', text: '포리가 선 빙하가 사방에서 갈라지는 소리가 들립니다.' },
      { type: 'fx', name: 'stageCrack' },
      { type: 'say', who: 'pori', text: '대원님! 얼음이 너무 작아졌어요. 엄마가 저 멀리서 저를 부르고 있는데, 갈 수가 없어요!', mood: 'scared' },
      { type: 'say', who: 'danbi', text: '최종 작전을 시작한다. 이번 작전의 무대는 북극이 아니라, {name} 대원의 일주일이야.', mood: 'serious' },
      { type: 'say', who: 'thermo', text: '삐빅! 기후변화에 대응하려면 **작은 행동부터** 실천해야 해. 가까운 거리는 **걷거나 자전거**를 타고, **전기를 아끼고**, **일회용품과 비닐**을 적게 쓰고, 재활용품을 **분리배출**하는 것처럼.', mood: 'happy' },
      { type: 'say', who: 'thermo', text: '이런 행동은 모두 내보내는 이산화 탄소를 줄여서, 탄소 저울을 맞추고 지구 온난화를 늦추는 데 도움이 돼.', mood: 'happy' },
      { type: 'say', who: 'luka', text: '에이, 그건 너무 작은 일 아니야? 나 한 명 바뀐다고 뭐가 달라져?', mood: 'o' },
      { type: 'say', who: 'danbi', text: '작전 2를 떠올려 봐. 범인은 수백만 개의 작은 그림자였지. 작은 행동이 모여 문제가 됐다면, 작은 실천이 모여 해결도 될 수 있어.', mood: 'smile' },
      { type: 'mission', id: 'week' },
      { type: 'say', who: 'danbi', text: '기후변화에 대응하려면 여러 사람의 노력이 필요해. 나 혼자가 아니라 주변 사람들에게도 **알려야** 해.', mood: 'serious' },
      { type: 'mission', id: 'campaign' },
      { type: 'say', who: 'luka', text: '우와, 본부 앞에 사람들이 모였어! 다들 텀블러를 들고 있어!', mood: 'grin' },
      { type: 'say', who: 'danbi', text: '기억해. 기후변화에 대응하는 활동은 한 번이 아니라 **꾸준히** 실천해야 해. 그래야 빙하가 계속 단단하게 유지돼.', mood: 'smile' },
      { type: 'say', who: 'thermo', text: '삐빅! 포리의 빙하가 무너지기 직전이야! 지금까지 모은 장비를 모두 가동한다!', mood: 'alert' },
      { type: 'mission', id: 'rush' },
      { type: 'say', who: 'narr', text: '얼음 다리가 반짝이며 이어지고, 포리가 달려가 엄마 품에 안깁니다.' },
      { type: 'fx', name: 'winFlash' },
      { type: 'say', who: 'pori', text: '엄마! 대원님들이 얼음을 돌려주셨어요! {name} 대원님, 고마워요!', mood: 'joy' },
      {
        type: 'quiz',
        items: [
          { q: '가까운 거리는 걷거나 ( )를 이용해요.', hint: 'ㅈㅈㄱ', a: '자전거', opts: ['자전거', '자동차', '비행기', '오토바이'] },
          { q: '기후변화에 대응하는 활동은 한 번이 아니라 ( ) 실천해야 해요.', hint: 'ㄲㅈㅎ', a: '꾸준히', opts: ['꾸준히', '가끔', '한 번만', '나중에'] },
          { q: '다음 중 기후변화에 대응하는 방법이 아닌 것은? ( )', a: '일회용품 자주 쓰기', opts: ['일회용품 자주 쓰기', '에너지 사용 줄이기', '자연환경 보존하기', '분리배출하기'] }
        ]
      },
      { type: 'say', who: 'danbi', text: '작전 성공이다. 이제 임명식을 준비하자.', mood: 'smile' },
      { type: 'reward', gear: 'badge' }
    ]
  },
  // ---------- 에필로그 ----------
  {
    label: '에필로그',
    title: '임명식',
    goal: '실천 약속을 정하고 북극곰 구조대 임명장을 받아요.',
    bg: 'arctic',
    clues: [],
    steps: [
      { type: 'say', who: 'thermo', text: '삐빅! 대원, 한 가지가 남았어. 빙하는 한 번 얼렸다고 영원히 지켜지지 않아.', mood: 'alert' },
      { type: 'say', who: 'danbi', text: '구조대원의 진짜 임무는 지금부터야. 일주일 동안 지킬 실천 목표 세 가지를 정해 줘.', mood: 'smile' },
      { type: 'mission', id: 'pledge' },
      { type: 'say', who: 'pori', text: '대원님, 다음에 또 놀러 와요! 그때는 얼음이 더 두껍고 단단했으면 좋겠어요.', mood: 'joy' },
      { type: 'say', who: 'luka', text: '나도 오토바이 대신 자전거 탈 거야. 일주일 뒤에 누가 더 잘 지켰는지 대결하자!', mood: 'grin' },
      { type: 'say', who: 'danbi', text: '{name} 대원, 앞으로. 북극곰 구조대장으로서 너를 정식 대원으로 임명한다!', mood: 'smile' },
      { type: 'fx', name: 'winFlash' },
      { type: 'mission', id: 'ceremony' }
    ]
  }
];
