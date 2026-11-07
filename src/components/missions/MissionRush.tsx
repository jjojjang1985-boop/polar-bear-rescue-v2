import React, { useState, useEffect, useRef } from 'react';
import { sfx } from '../../audio';
import { poriSVG } from '../../svgs';

const GOOD_POOL = [
  '나무를 심어요',
  '전기를 아껴요',
  '걸어서 가요',
  '텀블러를 써요',
  '분리배출해요',
  '숲을 보존해요',
  '갯벌을 지켜요',
  '바다 숲을 살려요',
  '자전거를 타요',
  '급식을 남기지 않아요',
  '물을 아껴 써요',
  '친환경 기술 개발'
];

const BAD_POOL = [
  '일회용품을 자주 써요',
  '숲을 베어 내요',
  '빈방에 불을 켜 둬요',
  '가까운 곳도 차를 타요',
  '물을 틀어 놔요',
  '필요 없는 물건을 사요'
];

interface FallingCard {
  id: number;
  text: string;
  isGood: boolean;
  x: number; // percentage (15% to 80%)
  y: number; // px from top
  speed: number;
  isDead: boolean;
}

export function MissionRush({
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
  const [energy, setEnergy] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [cards, setCards] = useState<FallingCard[]>([]);

  const cardIdRef = useRef(0);
  const energyRef = useRef(0);
  energyRef.current = energy;
  const isWonRef = useRef(false);

  useEffect(() => {
    isWonRef.current = false;
    onReact('danbi', '지금까지 배운 걸 모두 떠올려! 환경을 지키는 올바른 행동만 골라!', 'serious');

    // Timer
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          if (!isWonRef.current) {
            onReact('danbi', '시간이 조금 모자랐어! 포리를 위해 다시 한번 도전하자!', 'scared');
            // reset
            setEnergy(0);
            return 40;
          }
        }
        return t - 1;
      });
    }, 1000);

    // Spawner
    const spawner = setInterval(() => {
      if (isWonRef.current) return;

      const isGood = Math.random() < 0.6;
      const pool = isGood ? GOOD_POOL : BAD_POOL;
      const text = pool[Math.floor(Math.random() * pool.length)];

      const newCard: FallingCard = {
        id: ++cardIdRef.current,
        text,
        isGood,
        x: 12 + Math.random() * 70,
        y: -40,
        speed: 1.2 + Math.random() * 0.8,
        isDead: false
      };

      setCards(prev => [...prev.filter(c => !c.isDead && c.y < 340), newCard]);
    }, 800);

    // Physics Animation Loop
    let animId: number;
    const loop = () => {
      if (isWonRef.current) return;
      setCards(prev =>
        prev.map(c => {
          if (c.isDead) return c;
          const nextY = c.y + c.speed * 2.2;
          if (nextY > 340) {
            return { ...c, isDead: true };
          }
          return { ...c, y: nextY };
        })
      );
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleCardClick = (cardId: number, isGood: boolean, text: string) => {
    if (isWonRef.current) return;

    setCards(prev =>
      prev.map(c => (c.id === cardId ? { ...c, isDead: true } : c))
    );

    if (isGood) {
      sfx.ok();
      onCorrect();
      const nextE = Math.min(100, energyRef.current + 10);
      setEnergy(nextE);

      if (nextE >= 100 && !isWonRef.current) {
        isWonRef.current = true;
        sfx.win();
        onReact('thermo', '삐빅! 얼음 다리 완성! 포리가 무사히 엄마 품으로 건너갔어!', 'happy');
        setTimeout(onFinish, 1800);
      }
    } else {
      sfx.no();
      onWrong();
      setEnergy(prev => Math.max(0, prev - 10));
      onReact('luka', `앗, "${text}"는 지구를 데우는 행동이야! 얼음 에너지가 줄었어.`, 'o');
    }
  };

  return (
    <div className="panel max-w-3xl">
      <div className="flex justify-between items-center mb-2">
        <h2>
          <span className="tag">미션 4-3</span>
          최종 미션: 빙하 얼리기 러시
        </h2>
        <div className="flex items-center gap-3">
          <span className="timer">{timeLeft}초</span>
          <b className="font-display text-lg text-sky-800">
            얼음 에너지 {energy} / 100
          </b>
        </div>
      </div>

      <p className="guide">
        하늘에서 떨어지는 카드 중 환경을 지키는 행동만 눌러 얼음 에너지를 100까지 채우세요!
      </p>

      {/* Energy Meter */}
      <div className="meter h-5 mb-2">
        <i style={{ width: `${energy}%` }} />
      </div>

      {/* Rush Arena */}
      <div
        id="rushZone"
        className="relative h-[320px] rounded-2xl overflow-hidden border-3 border-amber-950"
        style={{
          background: 'linear-gradient(#c3b2ee 0%, #f6c2b6 60%, #4fb0e8 60%)'
        }}
      >
        {/* Growing Ice Bridge */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            height: '40%',
            width: `${energy}%`,
            background: 'linear-gradient(#ffffff, #bfe6ff)',
            borderRight: '3px solid #4a2a12',
            transition: 'width 0.3s ease-out'
          }}
        />

        {/* Pori waiting on the left */}
        <div
          style={{
            position: 'absolute',
            left: '10px',
            bottom: '40%',
            width: '68px',
            zIndex: 10
          }}
          dangerouslySetInnerHTML={{ __html: poriSVG(energy >= 100 ? 'joy' : 'scared') }}
        />

        {/* Mother bear waiting on the right */}
        <div
          style={{
            position: 'absolute',
            right: '10px',
            bottom: '40%',
            width: '84px',
            transform: 'scaleX(-1)',
            zIndex: 10
          }}
          dangerouslySetInnerHTML={{ __html: poriSVG('happy') }}
        />

        {/* Falling Cards */}
        {cards
          .filter(c => !c.isDead)
          .map(c => (
            <button
              key={c.id}
              type="button"
              className="fall cursor-pointer select-none"
              style={{
                left: `${c.x}%`,
                top: `${c.y}px`,
                background: '#fff'
              }}
              onPointerDown={e => {
                e.preventDefault();
                handleCardClick(c.id, c.isGood, c.text);
              }}
            >
              {c.text}
            </button>
          ))}
      </div>
    </div>
  );
}
