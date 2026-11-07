import React from 'react';
import { danbiSVG, heroSVG, lukaSVG, poriSVG, squirrelSVG, thermoSVG } from '../svgs';
import { getAudioContext, sfx } from '../audio';

interface TitleScreenProps {
  hasSave: boolean;
  playerName: string;
  onContinue: () => void;
  onNewGame: () => void;
  onOpenLeaderboard: () => void;
}

export function TitleScreen({
  hasSave,
  playerName,
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
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 overflow-y-auto bg-gradient-to-b from-[#a99be6] via-[#f2a9b4] via-70% to-[#ffe7a8]">
      {/* Aurora glow effect */}
      <div className="aur pointer-events-none absolute inset-0 overflow-hidden">
        <i
          className="absolute -top-[6%] -left-[20%] w-[140%] h-[40%] rounded-full opacity-50 blur-3xl animate-[aur_12s_ease-in-out_infinite_alternate]"
          style={{ background: '#fff3b0' }}
        />
        <i
          className="absolute top-[18%] -left-[20%] w-[140%] h-[40%] rounded-full opacity-50 blur-3xl animate-[aur_12s_ease-in-out_infinite_alternate]"
          style={{ background: '#ffd0e0', animationDelay: '-4s' }}
        />
      </div>

      {/* Real-time Leaderboard shortcut button on top right */}
      <button
        type="button"
        onClick={() => {
          sfx.blip();
          onOpenLeaderboard();
        }}
        className="absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 hover:bg-white text-amber-950 font-display text-sm md:text-base shadow-lg border-2 border-amber-900 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="구글 파이어베이스 실시간 명예의 전당 보기"
      >
        <span className="text-xl">🏆</span>
        <span className="font-bold">실시간 명예의 전당</span>
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
      </button>

      <div className="relative max-w-4xl w-full text-center py-6">
        <h1 className="logo">
          북극곰 구조대
          <span className="block mt-1">빙하를 지켜라!</span>
        </h1>

        <div className="pill mt-3">
          4학년 과학 · 기후변화와 우리 생활
        </div>

        {/* Animated Character Lineup */}
        <div className="flex justify-center items-end gap-1 sm:gap-3 my-6 flex-nowrap px-2">
          <div className="flex flex-col items-center w-16 sm:w-28 animate-[float_3s_ease-in-out_infinite]">
            <div
              className="w-full"
              dangerouslySetInnerHTML={{ __html: danbiSVG('smile') }}
            />
            <span className="font-display text-xs sm:text-sm bg-white text-amber-950 px-2 py-0.5 rounded-full border-2 border-amber-950 shadow">
              단비 대장
            </span>
          </div>

          <div className="flex flex-col items-center w-16 sm:w-28 animate-[float_3s_ease-in-out_infinite_0.4s]">
            <div
              className="w-full"
              dangerouslySetInnerHTML={{ __html: poriSVG('happy') }}
            />
            <span className="font-display text-xs sm:text-sm bg-white text-amber-950 px-2 py-0.5 rounded-full border-2 border-amber-950 shadow">
              포리
            </span>
          </div>

          <div className="flex flex-col items-center w-20 sm:w-36 animate-[float_3s_ease-in-out_infinite_0.8s]">
            <div
              className="w-full"
              dangerouslySetInnerHTML={{ __html: heroSVG('happy', 'a') }}
            />
            <span className="font-display text-xs sm:text-sm bg-white text-amber-950 px-2 py-0.5 rounded-full border-2 border-amber-950 shadow">
              신입 대원
            </span>
          </div>

          <div className="flex flex-col items-center w-16 sm:w-28 animate-[float_3s_ease-in-out_infinite_1.0s]">
            <div
              className="w-full"
              dangerouslySetInnerHTML={{ __html: squirrelSVG() }}
            />
            <span className="font-display text-xs sm:text-sm bg-white text-amber-950 px-2 py-0.5 rounded-full border-2 border-amber-950 shadow">
              너구리 파트너
            </span>
          </div>

          <div className="flex flex-col items-center w-16 sm:w-28 animate-[float_3s_ease-in-out_infinite_1.2s]">
            <div
              className="w-full"
              dangerouslySetInnerHTML={{ __html: thermoSVG('normal') }}
            />
            <span className="font-display text-xs sm:text-sm bg-white text-amber-950 px-2 py-0.5 rounded-full border-2 border-amber-950 shadow">
              써모
            </span>
          </div>

          <div className="flex flex-col items-center w-16 sm:w-28 animate-[float_3s_ease-in-out_infinite_1.4s]">
            <div
              className="w-full"
              dangerouslySetInnerHTML={{ __html: lukaSVG('grin') }}
            />
            <span className="font-display text-xs sm:text-sm bg-white text-amber-950 px-2 py-0.5 rounded-full border-2 border-amber-950 shadow">
              루카
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-6 flex-wrap items-center">
          {hasSave ? (
            <>
              <button
                className="big"
                type="button"
                onClick={() => handleStart(true)}
              >
                {playerName} 대원, 이어서 하기
              </button>
              <button
                className="big ghost"
                type="button"
                onClick={() => handleStart(false)}
              >
                새 대원으로 시작
              </button>
            </>
          ) : (
            <button
              className="big text-2xl py-4 px-8"
              type="button"
              onClick={() => handleStart(false)}
            >
              화면을 눌러 시작하기! 🚀
            </button>
          )}

          <button
            className="big ghost flex items-center justify-center gap-2"
            type="button"
            onClick={() => {
              sfx.blip();
              onOpenLeaderboard();
            }}
          >
            <span className="text-xl">🏆</span>
            <span>순위표 확인하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
