import React, { useState } from 'react';
import { OL } from '../../svgs';
import { sfx } from '../../audio';

export function MissionGlacier({
  onFinish,
  onReact
}: {
  onFinish: () => void;
  onReact: (who: any, text: string, mood?: any) => void;
}) {
  const [sliderVal, setSliderVal] = useState(50);
  const [hasInteracted, setHasInteracted] = useState(false);

  const scene = (hasIce: boolean) => (
    <svg viewBox="0 0 700 320" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
      <rect width="700" height="320" fill="#bfe6ff" />
      <path
        d="M0 260 L120 80 L230 200 L350 40 L470 190 L580 70 L700 240 V320 H0Z"
        fill="#9b8a7a"
        stroke={OL}
        strokeWidth="5"
      />
      {hasIce ? (
        <>
          <path
            d="M210 320 Q240 200 300 120 L350 60 L400 120 Q460 200 490 320Z"
            fill="#f4fbff"
            stroke={OL}
            strokeWidth="5"
          />
          <path d="M110 100 L130 80 L150 110Z M560 90 L580 70 L600 100Z" fill="#fff" stroke={OL} strokeWidth="4" />
        </>
      ) : (
        <>
          <path
            d="M330 90 L350 60 L372 92 Q350 110 330 90Z"
            fill="#f4fbff"
            stroke={OL}
            strokeWidth="4"
          />
          <path
            d="M220 320 Q300 270 350 250 Q400 270 480 320Z"
            fill="#5fb8e8"
            stroke={OL}
            strokeWidth="4"
          />
        </>
      )}
      <rect y="290" width="700" height="30" fill="#6fae5c" />
    </svg>
  );

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderVal(val);
    if (!hasInteracted && (val <= 15 || val >= 85)) {
      setHasInteracted(true);
      onReact('luka', '우와, 슬라이더를 당겨보니 빙하가 거의 다 사라졌잖아!', 'o');
      sfx.ok();
    }
  };

  return (
    <div className="panel max-w-2xl">
      <h2>
        <span className="tag">미션 1-4</span>
        빙하 비교 사진
      </h2>
      <p className="guide">
        가운데 막대를 좌우로 움직여 같은 장소의 옛날(1910년)과 오늘(2021년)을 비교해 보세요.
      </p>

      <div className="relative h-[280px] border-3 border-amber-950 rounded-2xl overflow-hidden my-2">
        {/* Background: Modern (2021) without ice */}
        <div className="absolute inset-0">{scene(false)}</div>
        {/* Foreground: Vintage (1910) with thick glacier clipped by slider */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - sliderVal}% 0 0)` }}
        >
          {scene(true)}
        </div>

        <span className="tag absolute left-3 top-3 font-display">1910년 (빙하 가득)</span>
        <span className="tag absolute right-3 top-3 font-display !bg-sky-500">2021년 (빙하 소멸)</span>

        <div
          className="absolute top-0 bottom-0 w-1.5 bg-yellow-300 border border-amber-950 pointer-events-none"
          style={{ left: `${sliderVal}%`, transform: 'translateX(-50%)' }}
        />
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={sliderVal}
        onChange={handleSliderChange}
        className="w-full my-2 accent-amber-600 h-2 bg-stone-300 rounded-lg cursor-pointer"
        aria-label="옛날과 오늘 빙하 비교"
      />

      <p className="text-xs text-stone-600 mb-4">
        미국 글레이셔 국립 공원의 1910년과 2021년 모습을 그림으로 나타냈어요 (교과서 93쪽).
      </p>

      <div className="flex justify-center">
        <button
          className="big"
          type="button"
          onClick={onFinish}
        >
          확인 완료! 다음 단계로
        </button>
      </div>
    </div>
  );
}
