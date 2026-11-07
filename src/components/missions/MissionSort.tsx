import React, { useState, useEffect } from 'react';
import { sfx } from '../../audio';

interface CardItem {
  text: string;
  em?: string;
  bin: number;
}

interface MissionSortProps {
  tag: string;
  title: string;
  guide: string;
  bins: [string, string];
  cards: CardItem[];
  onCorrect: () => void;
  onWrong: () => void;
  onFinish: () => void;
  onReact: (who: any, text: string, mood?: any) => void;
}

export function MissionSort({
  tag,
  title,
  guide,
  bins,
  cards,
  onCorrect,
  onWrong,
  onFinish,
  onReact
}: MissionSortProps) {
  const [queue, setQueue] = useState<CardItem[]>(() => [...cards].sort(() => Math.random() - 0.5));
  const [isWobbling, setIsWobbling] = useState(false);
  const total = cards.length;
  const left = queue.length;
  const currentCard = queue[0];

  const pick = (chosenBin: number) => {
    if (!currentCard) return;

    if (currentCard.bin === chosenBin) {
      onCorrect();
      onReact('thermo', '삐빅! 정확해! 알맞은 상자에 분류했어.', 'happy');
      const nextQueue = queue.slice(1);
      setQueue(nextQueue);
      if (nextQueue.length === 0) {
        setTimeout(onFinish, 600);
      }
    } else {
      onWrong();
      setIsWobbling(true);
      onReact('luka', '앗! 다시 생각해 봐. "오늘"처럼 하루 일인지, 오랜 기간 평균인지 살펴봐!', 'o');
      setTimeout(() => {
        setIsWobbling(false);
        // Move card to end of queue to try again
        setQueue(prev => [...prev.slice(1), prev[0]]);
      }, 450);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') pick(0);
      if (e.key === 'ArrowRight') pick(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCard, queue]);

  const progressPercent = ((total - left) / total) * 100;

  return (
    <div className="panel max-w-2xl">
      <h2>
        <span className="tag">{tag}</span>
        {title}
      </h2>
      <p className="guide">{guide}</p>

      <div className="meter my-2">
        <i style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="bins mt-4 grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
        <button
          className="bin a cursor-pointer"
          type="button"
          onClick={() => pick(0)}
        >
          {bins[0]}
          <small>← 키보드 왼쪽</small>
        </button>

        <div className="slot flex justify-center">
          {currentCard ? (
            <div className={`card ${isWobbling ? 'no' : ''}`}>
              {currentCard.em && <div className="em">{currentCard.em}</div>}
              <div className="font-bold text-stone-800">{currentCard.text}</div>
            </div>
          ) : (
            <div className="card text-green-700 font-bold">완료!</div>
          )}
        </div>

        <button
          className="bin b cursor-pointer"
          type="button"
          onClick={() => pick(1)}
        >
          {bins[1]}
          <small>키보드 오른쪽 →</small>
        </button>
      </div>
    </div>
  );
}
