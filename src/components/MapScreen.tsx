import React from 'react';
import { sfx } from '../audio';

interface MapScreenProps {
  name: string;
  code: string;
  unlocked: number;
  done: Record<number, boolean>;
  stars: Record<number, number>;
  totalScore: number;
  onSelectStage: (stageIdx: number) => void;
  onShowLeaderboard: () => void;
  onGoTitle: () => void;
  onUnlockAll: () => void;
}

const STAGE_INFOS = [
  ['프롤로그', '구조 요청이 도착했다', '아기 북극곰 포리의 SOS를 받아요.'],
  ['작전 1', '지구 이상 신호를 추적하라', '날씨와 기후, 기후변화 현상과 피해'],
  ['작전 2', '빙하를 녹인 범인을 찾아라', '기후변화의 원인과 지구 온난화'],
  ['작전 3', '탄소 저울을 맞춰라', '이산화 탄소와 탄소 중립'],
  ['작전 4', '포리의 빙하를 되찾아라', '생활 속 실천과 알리기'],
  ['에필로그', '임명식', '정식 임명장 발급과 최우수 대원 기록']
];

export function MapScreen({
  name,
  code,
  unlocked,
  done,
  stars,
  totalScore,
  onSelectStage,
  onShowLeaderboard,
  onGoTitle,
  onUnlockAll
}: MapScreenProps) {
  const handleNodeClick = (i: number) => {
    if (i > unlocked) {
      sfx.no();
      return;
    }
    sfx.ok();
    onSelectStage(i);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 overflow-y-auto bg-gradient-to-b from-[#a99be6] via-[#f2a9b4] via-70% to-[#ffe7a8]">
      <div className="max-w-4xl w-full text-center py-4">
        <h1 className="logo text-4xl sm:text-6xl mb-2">작전 지도</h1>

        <div className="pill text-sm sm:text-lg mb-4">
          {name} 대원 · 코드네임 {code} · 총점 {totalScore.toLocaleString()}점
        </div>

        {/* 6 Grid Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-4 text-left">
          {STAGE_INFOS.map((info, i) => {
            const isLocked = i > unlocked;
            const isCurrent = i === unlocked && !done[i];
            const isDone = !!done[i];
            const starCount = stars[i] || 0;

            return (
              <button
                key={i}
                type="button"
                disabled={isLocked}
                onClick={() => handleNodeClick(i)}
                className={`node transition-transform ${
                  isLocked ? 'lock opacity-60' : 'cursor-pointer hover:-translate-y-1'
                } ${isCurrent ? 'cur' : ''}`}
                style={{
                  background: isCurrent ? '#fff3c4' : '#fffaf0',
                  boxShadow: isCurrent ? '0 6px 0 var(--line), 0 0 0 5px var(--coral)' : undefined
                }}
              >
                <span className="n">{info[0]}</span>
                <h3 className="text-xl font-bold mt-1 text-amber-950">{info[1]}</h3>
                <p className="text-sm text-stone-600 font-semibold">{info[2]}</p>

                <div className="mt-auto pt-2 flex items-center justify-between">
                  {isDone && i > 0 && i < 5 ? (
                    <span className="text-amber-500 font-bold text-lg">
                      {'★'.repeat(starCount)}
                      {'☆'.repeat(3 - starCount)}
                    </span>
                  ) : isDone ? (
                    <span className="text-emerald-700 font-bold text-sm">✓ 완료</span>
                  ) : isLocked ? (
                    <span className="text-stone-500 text-xs font-bold">🔒 잠김</span>
                  ) : (
                    <span className="text-coral text-xs font-bold animate-pulse">
                      출동 대기 ▶
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom controls */}
        <div className="flex justify-center gap-3 mt-4 flex-wrap">
          <button
            className="big ghost"
            type="button"
            onClick={onShowLeaderboard}
          >
            최우수 대원 순위표 🏆
          </button>
          <button
            className="big ghost"
            type="button"
            onClick={onGoTitle}
          >
            처음 화면으로
          </button>
        </div>

        <div className="mt-3">
          <button
            className="text-stone-600 text-xs underline font-bold"
            type="button"
            onClick={onUnlockAll}
          >
            선생님용: 모든 작전 열기
          </button>
        </div>
      </div>
    </div>
  );
}
