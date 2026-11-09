import React, { useRef, useState } from 'react';
import { GLACIER_IMAGES } from '../../assets';
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
  const [touched, setTouched] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const scene = (hasIce: boolean) => (
    <img
      src={hasIce ? GLACIER_IMAGES.past : GLACIER_IMAGES.now}
      alt={hasIce ? '1910년, 골짜기를 가득 채운 빙하' : '2021년, 빙하가 녹고 호수가 생긴 골짜기'}
      className="w-full h-full object-cover pointer-events-none"
      draggable={false}
    />
  );

  const moveTo = (clientX: number) => {
    const box = boxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    const val = Math.round(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
    updateVal(val);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateVal(Number(e.target.value));
  };

  const updateVal = (val: number) => {
    setSliderVal(val);
    if (!touched) setTouched(true);
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
        사진 가운데의 <b>노란 손잡이</b>를 좌우로 끌어서 같은 장소의 옛날(1910년)과 오늘(2021년)을 비교해 보세요.
      </p>

      <div
        ref={boxRef}
        className="glacier-compare relative aspect-[16/10] max-h-[400px] w-full border-3 border-amber-950 rounded-2xl overflow-hidden my-2"
        onPointerDown={e => {
          dragging.current = true;
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
          moveTo(e.clientX);
        }}
        onPointerMove={e => {
          if (dragging.current) moveTo(e.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        {/* Background: Modern (2021) without ice */}
        <div className="absolute inset-0">{scene(false)}</div>
        {/* Foreground: Vintage (1910) with thick glacier clipped by slider */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - sliderVal}% 0 0)` }}
        >
          {scene(true)}
        </div>

        <span className="tag absolute left-3 top-3 font-display">❄️ 1910년</span>
        <span className="tag absolute right-3 top-3 font-display !bg-sky-500">💧 2021년</span>

        <div className="gc-line" style={{ left: `${sliderVal}%` }}>
          <div className={`gc-knob ${touched ? '' : 'gc-knob-hint'}`}>◀ ▶</div>
        </div>
        {!touched && (
          <div className="gc-hint" style={{ left: `${sliderVal}%` }}>
            👆 손잡이를 좌우로 끌어 보세요!
          </div>
        )}
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
        미국 글레이셔 국립 공원처럼 같은 장소의 1910년과 2021년 모습을 그림으로 나타냈어요 (교과서 93쪽).
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
