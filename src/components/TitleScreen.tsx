import React from 'react';
import { getAudioContext, sfx } from '../audio';
import { TITLE_IMAGE } from '../assets';

interface TitleScreenProps {
  hasSave: boolean;
  playerName: string;
  isRanger?: boolean;
  onContinue: () => void;
  onNewGame: () => void;
  onOpenLeaderboard: () => void;
}

export function TitleScreen({
  hasSave,
  playerName,
  isRanger = false,
  onContinue,
  onNewGame,
  onOpenLeaderboard
}: TitleScreenProps) {
  const handleStart = (isContinue: boolean) => {
    getAudioContext();
    sfx.ok();
    if (isContinue) {
      onContinue();
    } else {
      onNewGame();
    }
  };

  return (
    <div className="screen title-screen">
      <img className="screen-art title-art" src={TITLE_IMAGE} alt="" draggable={false} />
      <div className="title-scrim" />

      <button
        type="button"
        onClick={() => {
          sfx.blip();
          onOpenLeaderboard();
        }}
        className="glass-btn title-rank"
        title="실시간 명예의 전당 보기"
      >
        <span aria-hidden="true">🏆</span>
        <span>명예의 전당</span>
        <span className="live-dot" aria-hidden="true" />
      </button>

      <div className="title-copy">
        <h1 className="logo">
          지구레인저
          <span className="block">빙하를 지켜라!</span>
        </h1>
        <div className="pill">4학년 과학 · 기후변화와 우리 생활</div>

        <div className="title-actions">
          {hasSave ? (
            <>
              <button className="big" type="button" onClick={() => handleStart(true)}>
                {playerName} {isRanger ? '레인저' : '수련생'}, 이어서 하기 ▶
              </button>
              <button className="big ghost" type="button" onClick={() => handleStart(false)}>
                새로 시작하기
              </button>
            </>
          ) : (
            <button className="big title-start" type="button" onClick={() => handleStart(false)}>
              수련 시작하기! 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
