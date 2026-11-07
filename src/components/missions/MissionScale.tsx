import React, { useState, useEffect } from 'react';
import { OL } from '../../svgs';
import { sfx } from '../../audio';

interface ScaleCard {
  t: string;
  v: number;
  k: 'cut' | 'sink' | 'trap';
}

interface RoundData {
  L: number;
  R: number;
  say: string;
  time?: number;
  cards: ScaleCard[];
}

const ROUNDS: RoundData[] = [
  {
    L: 10,
    R: 2,
    say: '1라운드야. 내보내는 양은 줄이고, 흡수하는 양은 늘려서 양쪽을 같게 맞춰 봐.',
    cards: [
      { t: '가까운 거리는 걸어요', v: 3, k: 'cut' },
      { t: '전기를 아껴 써요', v: 2, k: 'cut' },
      { t: '나무를 심어요', v: 3, k: 'sink' },
      { t: '숲을 보존해요', v: 2, k: 'sink' },
      { t: '숲을 베어 건물을 지어요', v: 3, k: 'trap' },
      { t: '일회용품을 자주 써요', v: 2, k: 'trap' }
    ]
  },
  {
    L: 15,
    R: 3,
    say: '2라운드는 더 무거워. 나라와 사회가 하는 일도 카드에 들어 있어.',
    cards: [
      { t: '친환경 기술을 개발해요', v: 4, k: 'cut' },
      { t: '일회용품을 줄여요', v: 2, k: 'cut' },
      { t: '바다 숲을 되살려요', v: 4, k: 'sink' },
      { t: '갯벌을 보존해요', v: 2, k: 'sink' },
      { t: '자전거를 타요', v: 1, k: 'cut' },
      { t: '빈방에 불을 켜 둬요', v: 2, k: 'trap' },
      { t: '필요 없는 물건을 사요', v: 3, k: 'trap' }
    ]
  },
  {
    L: 20,
    R: 4,
    time: 60,
    say: '마지막 3라운드! 60초 안에 맞춰야 해. 집중!',
    cards: [
      { t: '친환경 기술을 개발해요', v: 5, k: 'cut' },
      { t: '가까운 거리는 걸어요', v: 3, k: 'cut' },
      { t: '전기를 아껴 써요', v: 2, k: 'cut' },
      { t: '나무를 심어요', v: 4, k: 'sink' },
      { t: '숲을 보존해요', v: 3, k: 'sink' },
      { t: '바다 숲을 되살려요', v: 2, k: 'sink' },
      { t: '물을 틀어 놔요', v: 3, k: 'trap' },
      { t: '숲을 태워 땅을 개발해요', v: 2, k: 'trap' }
    ]
  }
];

export function MissionScale({
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
  const [roundIdx, setRoundIdx] = useState(0);
  const curRound = ROUNDS[roundIdx];

  const [leftVal, setLeftVal] = useState(curRound.L);
  const [rightVal, setRightVal] = useState(curRound.R);
  const [usedCards, setUsedCards] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(curRound.time || 0);

  // Initialize round state
  useEffect(() => {
    setLeftVal(curRound.L);
    setRightVal(curRound.R);
    setUsedCards({});
    setTimeLeft(curRound.time || 0);
    onReact('danbi', curRound.say, 'serious');
  }, [roundIdx]);

  // Round 3 countdown timer
  useEffect(() => {
    if (!curRound.time) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          onReact('thermo', '삐빅! 시간이 다 됐지만 괜찮아. 끝까지 맞춰 보자!', 'alert');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [roundIdx, curRound.time]);

  const diff = leftVal - rightVal;
  const isBalanced = diff === 0;

  const handleCardClick = (card: ScaleCard, cardIdx: number) => {
    if (usedCards[cardIdx] || isBalanced) return;

    setUsedCards(prev => ({ ...prev, [cardIdx]: true }));

    if (card.k === 'cut') {
      const nextL = leftVal - card.v;
      setLeftVal(nextL);
      sfx.ok();
      onReact('thermo', `삐빅! ${card.t}: 내보내는 이산화 탄소가 ${card.v}만큼 줄었어.`, 'happy');
      checkBalance(nextL, rightVal);
    } else if (card.k === 'sink') {
      const nextR = rightVal + card.v;
      setRightVal(nextR);
      sfx.ok();
      onReact('thermo', `삐빅! ${card.t}: 흡수하는 이산화 탄소가 ${card.v}만큼 늘었어.`, 'happy');
      checkBalance(leftVal, nextR);
    } else {
      // trap
      const nextL = leftVal + card.v;
      setLeftVal(nextL);
      onWrong();
      onReact('luka', `으악, "${card.t}"는 지구를 데우는 행동이야! 저울이 더 기울었어. "다시 하기"를 눌러 봐!`, 'scared');
    }
  };

  const checkBalance = (l: number, r: number) => {
    if (l === r) {
      onCorrect();
      sfx.win();
      onReact('danbi', '수평 달성! 내보내는 양과 흡수하는 양이 같아지는 탄소 중립 성공!', 'smile');
      setTimeout(() => {
        if (roundIdx < ROUNDS.length - 1) {
          setRoundIdx(roundIdx + 1);
        } else {
          onFinish();
        }
      }, 1600);
    }
  };

  const handleReset = () => {
    setLeftVal(curRound.L);
    setRightVal(curRound.R);
    setUsedCards({});
    sfx.tick();
  };

  // Scale geometry
  const angle = Math.max(-18, Math.min(18, diff * 1.6));
  const rad = (angle * Math.PI) / 180;
  const cx = 350;
  const cy = 90;
  const arm = 210;
  const lx = cx - arm * Math.cos(rad);
  const ly = cy + arm * Math.sin(rad);
  const rx = cx + arm * Math.cos(rad);
  const ry = cy - arm * Math.sin(rad);

  return (
    <div className="panel max-w-3xl">
      <div className="flex justify-between items-center mb-2">
        <h2>
          <span className="tag">미션 3-1</span>
          탄소 저울 퍼즐 ({roundIdx + 1} / {ROUNDS.length})
        </h2>
        {curRound.time && <span className="timer">{timeLeft}초</span>}
      </div>

      <p className="guide">
        카드를 골라 저울을 수평(탄소 중립)으로 맞추세요. (내보내는 양 = 흡수하는 양)
      </p>

      {/* Dynamic SVG Balance Scale */}
      <div className="scale my-2">
        <svg viewBox="0 0 700 320" width="100%" className="max-h-[240px]">
          {/* Base Stand */}
          <path d="M310 250 L350 100 L390 250Z" fill="#ffd23f" stroke={OL} strokeWidth="5" />
          {/* Arm */}
          <line
            x1={lx}
            y1={ly}
            x2={rx}
            y2={ry}
            stroke={OL}
            strokeWidth="12"
            strokeLinecap="round"
          />
          <line
            x1={lx}
            y1={ly}
            x2={rx}
            y2={ry}
            stroke="#a8743e"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r="12" fill="#f2735a" stroke={OL} strokeWidth="4" />

          {/* Left Pan: Emission (Clouds) */}
          <line x1={lx} y1={ly} x2={lx - 50} y2={ly + 70} stroke={OL} strokeWidth="3" />
          <line x1={lx} y1={ly} x2={lx + 50} y2={ly + 70} stroke={OL} strokeWidth="3" />
          <path
            d={`M${lx - 70} ${ly + 70} h140 q-10 34 -70 34 q-60 0 -70 -34z`}
            fill="#c8c3cf"
            stroke={OL}
            strokeWidth="4"
          />
          <text x={lx} y={ly + 55} textAnchor="middle" fontSize="24">
            {'☁️'.repeat(Math.max(1, Math.min(5, Math.ceil(leftVal / 4))))}
          </text>
          <text
            x={lx}
            y={ly + 130}
            textAnchor="middle"
            fontFamily="Jua"
            fontSize="18"
            fill={OL}
          >
            내보내는 양 {leftVal}
          </text>

          {/* Right Pan: Absorption (Forests) */}
          <line x1={rx} y1={ry} x2={rx - 50} y2={ry + 70} stroke={OL} strokeWidth="3" />
          <line x1={rx} y1={ry} x2={rx + 50} y2={ry + 70} stroke={OL} strokeWidth="3" />
          <path
            d={`M${rx - 70} ${ry + 70} h140 q-10 34 -70 34 q-60 0 -70 -34z`}
            fill="#b9ecc4"
            stroke={OL}
            strokeWidth="4"
          />
          <text x={rx} y={ry + 55} textAnchor="middle" fontSize="24">
            {'🌿'.repeat(Math.max(1, Math.min(5, Math.ceil(rightVal / 4))))}
          </text>
          <text
            x={rx}
            y={ry + 130}
            textAnchor="middle"
            fontFamily="Jua"
            fontSize="18"
            fill={OL}
          >
            흡수하는 양 {rightVal}
          </text>
        </svg>
      </div>

      <div className="text-center font-display text-lg mb-3" style={{ color: isBalanced ? '#2fbf71' : '#c43d1f' }}>
        {isBalanced
          ? '🎉 수평! 탄소 중립 달성!'
          : diff > 0
          ? `내보내는 쪽(이산화 탄소)이 ${diff}만큼 더 무거워요`
          : `흡수하는 쪽이 ${-diff}만큼 더 무거워요`}
      </div>

      {/* Cards list */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {curRound.cards.map((c, i) => {
          const isUsed = !!usedCards[i];
          return (
            <button
              key={i}
              type="button"
              disabled={isUsed || isBalanced}
              onClick={() => handleCardClick(c, i)}
              className={`wcard ${isUsed ? 'used' : ''}`}
            >
              <span className="w">
                {c.k === 'cut' ? `-${c.v}` : c.k === 'sink' ? `+${c.v}` : `+${c.v}`}
              </span>
              <span className="text-sm font-bold">{c.t}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center mt-3">
        <button className="big ghost" type="button" onClick={handleReset}>
          처음부터 다시
        </button>
      </div>
    </div>
  );
}
