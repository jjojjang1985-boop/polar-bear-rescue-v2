import React, { useState } from 'react';
import { OL } from '../../svgs';
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
        하얗게 변한 바위를 눌러 인공 어초를 설치하고, 한 번 더 눌러 바닷말을 심으세요. (5월 10일 바다 식목일)
      </p>

      {/* Sea Forest Canvas SVG */}
      <svg
        viewBox="0 0 760 280"
        width="100%"
        className="max-h-[260px] rounded-2xl border-3 border-amber-950 my-2"
        style={{ background: 'linear-gradient(#7fd3ff, #2a6fb8)' }}
      >
        {/* Sandy Sea Floor */}
        <path d="M0 230 Q190 210 380 230 T760 225 V280 H0Z" fill="#f2d49b" stroke={OL} strokeWidth="4" />

        {/* Swimming Fish according to grown count */}
        {Array.from({ length: grownCount }, (_, i) => (
          <g
            key={i}
            style={{
              animation: `swim ${3 + i}s ease-in-out infinite alternate`,
              transformOrigin: 'center'
            }}
          >
            <ellipse
              cx={100 + i * 110}
              cy={60 + (i % 3) * 30}
              rx="18"
              ry="10"
              fill="#ffb36b"
              stroke={OL}
              strokeWidth="3"
            />
            <path
              d={`M${118 + i * 110} ${60 + (i % 3) * 30} l12 -8 v16z`}
              fill="#ffb36b"
              stroke={OL}
              strokeWidth="3"
            />
            <circle
              cx={92 + i * 110}
              cy={57 + (i % 3) * 30}
              r="2.5"
              fill={OL}
            />
          </g>
        ))}

        {/* 6 Replanted Spots */}
        {spots.map((state, i) => {
          const x = 70 + i * 124;
          return (
            <g
              key={i}
              onClick={() => handleSpotClick(i)}
              className="cursor-pointer"
            >
              {/* State 0: Bleached Rock */}
              {state === 0 && (
                <>
                  <ellipse cx={x} cy="222" rx="42" ry="16" fill="#f4f4f4" stroke={OL} strokeWidth="4" />
                  <text
                    x={x}
                    y="200"
                    textAnchor="middle"
                    fontFamily="Jua"
                    fontSize="16"
                    fill="#fff"
                  >
                    눌러요
                  </text>
                </>
              )}

              {/* State 1 or 2: Artificial Reef Structure */}
              {state >= 1 && (
                <>
                  <path
                    d={`M${x - 34} 230 L${x - 24} 186 L${x + 24} 186 L${x + 34} 230Z`}
                    fill="#b8b0a6"
                    stroke={OL}
                    strokeWidth="4"
                  />
                  <rect
                    x={x - 10}
                    y="198"
                    width="20"
                    height="16"
                    fill="#8a8178"
                    stroke={OL}
                    strokeWidth="3"
                  />
                </>
              )}

              {/* State 2: Flourishing Seaweed */}
              {state === 2 && (
                <>
                  <path
                    d={`M${x - 14} 188 q-14 -40 4 -80 M${x} 188 q12 -50 -4 -100 M${x + 14} 188 q14 -36 -2 -70`}
                    fill="none"
                    stroke="#3aa65a"
                    strokeWidth="9"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M${x - 14} 188 q-14 -40 4 -80 M${x} 188 q12 -50 -4 -100 M${x + 14} 188 q14 -36 -2 -70`}
                    fill="none"
                    stroke={OL}
                    strokeWidth="2"
                    opacity="0.4"
                  />
                </>
              )}

              {/* Invisible clickable overlay */}
              <rect x={x - 50} y="80" width="100" height="160" fill="transparent" />
            </g>
          );
        })}
      </svg>

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
