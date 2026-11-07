import React, { useState } from 'react';
import { OL } from '../../svgs';
import { sfx } from '../../audio';

const levels = [230, 205, 178, 150, 110];

export function MissionSeaLevel({
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
  const [pourStep, setPourStep] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);

  const handlePour = () => {
    const next = pourStep + 1;
    setPourStep(next);
    sfx.splash();

    if (next === 1) onReact('luka', '섬이 조금 잠겼어!', 'o');
    if (next === 2) onReact('luka', '섬이 완전히 잠겨 버렸어!', 'scared');
    if (next === 3) onReact('thermo', '삐빅! 물이 집과 나무 바로 아래까지 올라왔어.', 'alert');
    if (next === 4) {
      onReact('luka', '집이랑 나무까지 물에 잠겼어… 육지가 사라지고 있어!', 'sad');
      setTimeout(() => setShowQuestion(true), 800);
    }
  };

  const handleQuestionAnswer = (choice: string) => {
    if (choice === '사람과 동식물이 살 수 있는 육지가 줄어든다') {
      onCorrect();
      onReact('danbi', '정확해. 바닷물이 높아지면 해안가의 땅과 섬이 잠겨 살 수 있는 터전이 사라져.', 'smile');
      setTimeout(onFinish, 1400);
    } else {
      onWrong();
      onReact('thermo', '삐빅! 수조 속 육지와 섬이 어떻게 되었는지 다시 봐.', 'alert');
    }
  };

  const currentWaterY = levels[pourStep];
  const currentWaterHeight = 276 - currentWaterY;

  return (
    <div className="panel max-w-2xl">
      <h2>
        <span className="tag">미션 1-4</span>
        해수면 상승 모형실험
      </h2>
      <p className="guide">
        "물 한 컵 붓기"를 눌러 녹은 빙하가 바다로 흘러드는 모습을 관찰해 보세요.
      </p>

      <svg
        viewBox="0 0 700 300"
        width="100%"
        className="max-h-[260px] bg-sky-50 border-3 border-amber-950 rounded-2xl my-2"
      >
        <rect x="40" y="30" width="620" height="250" fill="none" stroke="#7ab6e0" strokeWidth="6" rx="6" />
        <rect
          x="44"
          y={currentWaterY}
          width="612"
          height={currentWaterHeight}
          fill="#4fb0e8"
          opacity="0.85"
          style={{ transition: 'all 0.6s ease-out' }}
        />
        {/* Land (Gravel slope) */}
        <path d="M380 276 L656 120 L656 276Z" fill="#b59a7a" stroke={OL} strokeWidth="4" />

        {/* Small island */}
        <g style={{ opacity: pourStep >= 2 ? 0.35 : 1, transition: 'opacity 0.5s' }}>
          <ellipse cx="200" cy="236" rx="70" ry="16" fill="#e8c98f" stroke={OL} strokeWidth="4" />
          <path d="M200 220 v-30" stroke={OL} strokeWidth="5" />
          <path
            d="M200 190 q-20-10-30 4 M200 190 q20-10 30 4 M200 190 q0-18 -14-22"
            fill="none"
            stroke="#2fa36a"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>

        {/* Houses on the hill */}
        <g style={{ opacity: pourStep >= 4 ? 0.35 : 1, transition: 'opacity 0.5s' }}>
          <rect x="520" y="166" width="44" height="34" fill="#ffd23f" stroke={OL} strokeWidth="4" />
          <path d="M514 168 L542 144 L570 168Z" fill="#f2735a" stroke={OL} strokeWidth="4" />
        </g>

        {/* Tree on the hill */}
        <g style={{ opacity: pourStep >= 4 ? 0.35 : 1, transition: 'opacity 0.5s' }}>
          <rect x="606" y="132" width="8" height="26" fill="#8a5a3a" stroke={OL} strokeWidth="3" />
          <circle cx="610" cy="124" r="18" fill="#5cc46a" stroke={OL} strokeWidth="4" />
        </g>

        <text x="500" y="268" fontSize="15" fill="#fff" fontWeight="700">
          자갈 = 육지
        </text>
        <text x="70" y="268" fontSize="15" fill="#fff" fontWeight="700">
          물 = 바닷물
        </text>
      </svg>

      {!showQuestion ? (
        <div className="flex justify-center mt-3">
          <button
            className="big blue"
            type="button"
            disabled={pourStep >= 4}
            onClick={handlePour}
          >
            {pourStep < 4 ? `물 한 컵 붓기 (${pourStep}/4)` : '모형실험 관찰 완료!'}
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-lg font-bold mb-3">
            Q. 바닷물의 높이(해수면)가 올라가면 어떤 일이 생기나요?
          </p>
          <div className="grid gap-2">
            {[
              '사람과 동식물이 살 수 있는 육지가 줄어든다',
              '육지가 더 넓어진다',
              '아무런 변화가 없다'
            ].map(choice => (
              <button
                key={choice}
                type="button"
                className="opt text-center font-bold"
                onClick={() => handleQuestionAnswer(choice)}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
