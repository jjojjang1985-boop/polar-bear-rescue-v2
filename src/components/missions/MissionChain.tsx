import React, { useState } from 'react';

const STEPS = [
  '인간의 활동이 늘어나요',
  '온실가스(이산화 탄소 등)가 많이 나와요',
  '지구 온난화가 일어나요',
  '기후변화 현상이 심해져요'
];

const EMOJIS = ['🏭', '☁️', '🌡️', '🌪️'];

export function MissionChain({
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
  const [nextExpected, setNextExpected] = useState(0);
  const [shuffledCards] = useState(() =>
    STEPS.map((s, i) => ({ s, i, em: EMOJIS[i] })).sort(() => Math.random() - 0.5)
  );
  const [placed, setPlaced] = useState<number[]>([]);

  const handleCardClick = (idx: number) => {
    if (placed.includes(idx)) return;

    if (idx === nextExpected) {
      onCorrect();
      const nextStep = nextExpected + 1;
      setPlaced(prev => [...prev, idx]);
      setNextExpected(nextStep);

      if (nextStep === STEPS.length) {
        onReact(
          'danbi',
          '완벽해! 인간의 활동 → 온실가스 → 지구 온난화 → 기후변화. 이게 바로 빙하를 녹인 연결 고리야.',
          'smile'
        );
        setTimeout(onFinish, 1600);
      }
    } else {
      onWrong();
      onReact('luka', '음, 그건 조금 더 나중에 일어나는 일 같아! 무엇이 먼저일까?', 'o');
    }
  };

  return (
    <div className="panel max-w-3xl">
      <h2>
        <span className="tag">미션 2-2+</span>
        연결 고리 맞추기
      </h2>
      <p className="guide">
        카드를 원인에서 결과 순서대로 눌러 기후변화 연결 고리를 완성하세요.
      </p>

      {/* Target Slots */}
      <div className="flex items-center justify-between gap-2 my-4 overflow-x-auto pb-2">
        {STEPS.map((step, i) => {
          const isFilled = placed.includes(i);
          return (
            <React.Fragment key={i}>
              <div
                className="note flex-1 min-w-[130px] min-h-[80px] text-center flex flex-col items-center justify-center border-dashed border-2"
                style={{
                  background: isFilled ? '#d4f7e3' : '#fff',
                  borderStyle: isFilled ? 'solid' : 'dashed',
                  borderColor: isFilled ? '#1f6b4f' : '#bca594'
                }}
              >
                {isFilled ? (
                  <>
                    <span className="text-2xl">{EMOJIS[i]}</span>
                    <span className="font-bold text-xs mt-1">{step}</span>
                  </>
                ) : (
                  <span className="text-amber-800 font-display text-lg">{i + 1}단계</span>
                )}
              </div>
              {i < 3 && <b className="text-xl text-amber-950">→</b>}
            </React.Fragment>
          );
        })}
      </div>

      {/* Selection Cards */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {shuffledCards.map(c => {
          const isUsed = placed.includes(c.i);
          return (
            <button
              key={c.i}
              type="button"
              disabled={isUsed}
              onClick={() => handleCardClick(c.i)}
              className={`opt text-center flex flex-col items-center p-3 ${isUsed ? 'ok' : ''}`}
              style={{ opacity: isUsed ? 0.5 : 1 }}
            >
              <span className="text-3xl mb-1">{c.em}</span>
              <span className="font-bold">{c.s}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
