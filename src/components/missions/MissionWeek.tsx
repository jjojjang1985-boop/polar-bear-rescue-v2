import React, { useState } from 'react';

interface DayChallenge {
  day: string;
  em: string;
  sit: string;
  good: string;
  bad: string;
  ok: string;
}

const DAYS: DayChallenge[] = [
  {
    day: '월',
    em: '🏫',
    sit: '10분 거리 학원에 가야 해요.',
    good: '걸어서 간다',
    bad: '차로 태워 달라고 한다',
    ok: '삐빅! 가까운 거리를 걸어가면 자동차가 내보낼 이산화 탄소가 줄어들어.'
  },
  {
    day: '화',
    em: '💻',
    sit: '방에서 나오는데 불과 컴퓨터가 켜져 있어요.',
    good: '끄고 나온다',
    bad: '금방 다시 올 거니까 그냥 둔다',
    ok: '삐빅! 전기를 아끼면 내보내는 이산화 탄소도 줄어들어. 탄소 저울 기억나지?'
  },
  {
    day: '수',
    em: '🧋',
    sit: '친구들과 음료를 사러 가요.',
    good: '텀블러를 챙겨 간다',
    bad: '일회용 컵과 빨대를 받는다',
    ok: '삐빅! 일회용품을 줄이면 쓰레기도, 만드는 데 드는 에너지도 줄어.'
  },
  {
    day: '목',
    em: '🍱',
    sit: '급식 시간에 밥을 받아요.',
    good: '먹을 만큼만 받아 남기지 않는다',
    bad: '많이 받고 반을 남긴다',
    ok: '삐빅! 남은 음식을 처리하는 데도 에너지가 들어. 잘했어!'
  },
  {
    day: '금',
    em: '🧴',
    sit: '다 마신 페트병을 버려요.',
    good: '라벨을 떼고 분리배출한다',
    bad: '일반 쓰레기통에 넣는다',
    ok: '삐빅! 분리배출하면 다시 소중한 자원으로 재활용할 수 있어.'
  },
  {
    day: '토',
    em: '👕',
    sit: '작아진 옷과 다 읽은 책이 있어요.',
    good: '알뜰 시장에서 나누어 쓴다',
    bad: '모두 버리고 새것을 산다',
    ok: '삐빅! 나누어 쓰면 새 물건을 만들 때 나오는 이산화 탄소가 줄어.'
  },
  {
    day: '일',
    em: '❄️',
    sit: '더운 날 거실에서 에어컨을 틀어요.',
    good: '창문을 닫고 알맞은 온도로 튼다',
    bad: '창문을 열어 둔 채 세게 튼다',
    ok: '삐빅! 에너지를 낭비하지 않는 똑똑한 선택이야!'
  }
];

export function MissionWeek({
  onCorrect,
  onWrong,
  onFinish,
  onReact
}: {
  onCorrect: () => void;
  onWrong: () => void;
  onFinish: () => void;
  onReact: (who: any, text: string, mood?: any) => void;
}) {
  const [dayIdx, setDayIdx] = useState(0);
  const cur = DAYS[dayIdx];

  const handlePick = (isGood: boolean) => {
    if (isGood) {
      onCorrect();
      onReact('thermo', cur.ok, 'happy');
      if (dayIdx < DAYS.length - 1) {
        setTimeout(() => setDayIdx(dayIdx + 1), 1200);
      } else {
        setTimeout(onFinish, 1500);
      }
    } else {
      onWrong();
      onReact('pori', '으아아! 얼음이 흔들려요! 다른 방법은 없을까요?', 'scared');
    }
  };

  return (
    <div className="panel max-w-2xl">
      <h2>
        <span className="tag">미션 4-1</span>
        일주일 빙하 챌린지 · {cur.day}요일 ({dayIdx + 1} / 7)
      </h2>
      <p className="guide">
        매일 마주하는 생활 속 상황에서 탄소를 줄이는 선택을 골라 보세요.
      </p>

      <div className="card w-full min-h-[120px] mx-auto my-3 p-4 flex flex-col items-center justify-center">
        <div className="text-5xl mb-2">{cur.em}</div>
        <div className="text-xl font-bold text-stone-900">{cur.sit}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <button
          type="button"
          className="opt text-center p-4 text-lg font-bold border-2 hover:bg-emerald-50"
          onClick={() => handlePick(true)}
        >
          {cur.good}
        </button>
        <button
          type="button"
          className="opt text-center p-4 text-lg font-bold border-2 hover:bg-rose-50"
          onClick={() => handlePick(false)}
        >
          {cur.bad}
        </button>
      </div>
    </div>
  );
}
