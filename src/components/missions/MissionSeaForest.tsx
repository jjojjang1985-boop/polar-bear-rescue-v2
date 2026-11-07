import React, { useState } from 'react';
import { SEA_IMAGES } from '../../assets';

// sea-floor 그림 속 하얀 바위 6개의 가로 위치(%)
const SPOT_X = [10.9, 26.8, 42.7, 58.2, 74.1, 89.3];
import { sfx } from '../../audio';

export function MissionSeaForest({
  onCorrect,
  onFinish,
  onReact
}: {
  onCorrect: () => void;
  onFinish: () => void;
  onReact: (who: any, text: string, mood?: any) => void;
}) {
  // 6 spots: 0 = bleached rock, 1 = artificial reef placed, 2 = seaweed flourishing!
  const [spots, setSpots] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  const handleSpotClick = (idx: number) => {
    if (spots[idx] >= 2) return;
    sfx.ok();
    onCorrect();

    const nextState = [...spots];
    nextState[idx] = spots[idx] + 1;
    setSpots(nextState);

    if (nextState[idx] === 1) {
      onReact('thermo', '삐빅! 인공 어초를 내려놓았어. 한 번 더 눌러 바닷말을 심어 줘.', 'happy');
    } else {
      onReact('luka', '바닷말이 풍성하게 자랐어! 물고기들이 다시 찾아오고 있어!', 'grin');
    }

    if (nextState.every(s => s === 2)) {
      onReact(
        'danbi',
        '바다 숲 복원 성공! 우리나라는 매년 5월 10일을 바다 식목일로 정해 바다 숲을 지키고 있어.',
        'smile'
      );
      setTimeout(onFinish, 1800);
    }
  };

  const grownCount = spots.filter(s => s === 2).length;
  const progressRatio = (spots.reduce((a, b) => a + b, 0) / 12) * 100;

  return (
    <div className="panel max-w-3xl">
      <h2>
        <span className="tag">미션 3-2</span>
        바다 숲을 살려라
      </h2>
      <p className="guide">
        하얗게 변한 바위를 눌러 인공 어초를 내리고, 한 번 더 눌러 바닷말을 심어 바다 숲을 되살리세요. (5월 10일 바다 식목일)
      </p>

      <div
        className="seafloor"
        style={{ ['--life' as any]: (spots.reduce((a, b) => a + b, 0) / 12).toFixed(2) }}
      >
        <img className="seafloor-bg" src={SEA_IMAGES.floor} alt="하얗게 변한 바닷속" draggable={false} />

        {/* 바다 숲이 살아날 때마다 물고기가 한 마리씩 */}
        {Array.from({ length: grownCount }, (_, i) => (
          <img
            key={`f${i}`}
            className={`sea-fish ${i % 2 ? 'rev' : ''}`}
            src={SEA_IMAGES.fish}
            alt=""
            draggable={false}
            style={{ top: `${12 + ((i * 17) % 40)}%`, animationDuration: `${9 + (i % 3) * 3}s`, animationDelay: `${-i * 1.7}s` }}
          />
        ))}

        {spots.map((state, i) => (
          <button
            key={i}
            type="button"
            className={`reef-spot s${state}`}
            style={{ left: `${SPOT_X[i]}%` }}
            onClick={() => handleSpotClick(i)}
            disabled={state >= 2}
            aria-label={state === 0 ? '인공 어초 설치하기' : state === 1 ? '바닷말 심기' : '바다 숲 완성'}
          >
            {state === 0 && <span className="reef-hint">어초 설치</span>}
            {state >= 1 && (
              <>
                <img className="reef-img" src={SEA_IMAGES.reef} alt="" draggable={false} />
                <span className="bubbles" aria-hidden="true">
                  <i /><i /><i /><i /><i />
                </span>
              </>
            )}
            {state === 1 && <span className="reef-hint plant">바닷말 심기</span>}
            {state === 2 && <img className="weed-img" src={SEA_IMAGES.weed} alt="" draggable={false} />}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <b className="font-display text-stone-800">이산화 탄소 흡수 게이지</b>
          <span className="font-display text-sm text-stone-700">{Math.round(progressRatio)}%</span>
        </div>
        <div className="meter">
          <i style={{ width: `${progressRatio}%` }} />
        </div>
      </div>
    </div>
  );
}
