import React, { useState } from 'react';
import { sfx } from '../../audio';

interface Pair {
  em: string;
  l: string;
  r: string;
}

const PAIRS: Pair[] = [
  { em: '🥵', l: '뜨거운 도시의 사람들', r: '폭염이 길어져 건강을 해칠 수 있어요.' },
  { em: '🔥', l: '불타는 숲', r: '산불이 자주 발생해요.' },
  { em: '🌀', l: '거센 바람과 파도', r: '태풍이 자주 발생해요.' },
  { em: '🌾', l: '갈라진 논밭', r: '오랜 가뭄으로 식량이 부족해져요.' },
  { em: '🪸', l: '하얗게 변한 바닷속', r: '바닷물의 온도가 높아져 바다 생태계가 파괴돼요.' },
  { em: '🐻‍❄️', l: '얼음 조각 위의 북극곰', r: '기후변화에 적응하지 못한 동물이 멸종 위기에 처해요.' }
];

export function MissionMatch({
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
  const [leftOrder] = useState(() =>
    [...PAIRS.map((p, i) => ({ ...p, originalIdx: i }))].sort(() => Math.random() - 0.5)
  );
  const [rightOrder] = useState(() =>
    [...PAIRS.map((p, i) => ({ ...p, originalIdx: i }))].sort(() => Math.random() - 0.5)
  );

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Record<number, boolean>>({});

  const handleLeftClick = (idx: number) => {
    if (matched[idx]) return;
    sfx.tick();
    setSelectedLeft(idx);
  };

  const handleRightClick = (idx: number) => {
    if (selectedLeft === null || matched[idx]) {
      if (selectedLeft === null) {
        onReact('luka', '왼쪽 현장부터 먼저 골라 줘!', 'o');
      }
      return;
    }

    if (selectedLeft === idx) {
      onCorrect();
      const newMatched = { ...matched, [idx]: true };
      setMatched(newMatched);
      setSelectedLeft(null);

      if (Object.keys(newMatched).length === PAIRS.length) {
        onReact('pori', '그거 저예요… 저만 그런 게 아니었구나. 모두를 위해 얼음을 지켜야 해요!', 'sad');
        setTimeout(onFinish, 1800);
      }
    } else {
      onWrong();
      onReact('luka', '음, 그 피해는 다른 현장 같아. 천천히 다시 연결해 봐.', 'sad');
    }
  };

  return (
    <div className="panel max-w-3xl">
      <h2>
        <span className="tag">미션 1-4</span>
        피해 카드 연결하기
      </h2>
      <p className="guide">
        왼쪽 현장을 먼저 누르고, 그에 알맞은 기후변화 피해를 오른쪽에서 골라 짝지어요.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        {/* Left column */}
        <div className="flex flex-col gap-2">
          {leftOrder.map(item => {
            const isMatched = !!matched[item.originalIdx];
            const isSelected = selectedLeft === item.originalIdx;
            return (
              <button
                key={item.originalIdx}
                type="button"
                disabled={isMatched}
                onClick={() => handleLeftClick(item.originalIdx)}
                className={`opt flex items-center gap-2 ${isMatched ? 'ok' : ''}`}
                style={{
                  outline: isSelected ? '4px solid #ffb400' : 'none',
                  opacity: isMatched ? 0.6 : 1
                }}
              >
                <span className="text-2xl">{item.em}</span>
                <span className="font-bold">{item.l}</span>
              </button>
            );
          })}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-2">
          {rightOrder.map(item => {
            const isMatched = !!matched[item.originalIdx];
            return (
              <button
                key={item.originalIdx}
                type="button"
                disabled={isMatched}
                onClick={() => handleRightClick(item.originalIdx)}
                className={`opt ${isMatched ? 'ok' : ''}`}
                style={{ opacity: isMatched ? 0.6 : 1 }}
              >
                {item.r}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
