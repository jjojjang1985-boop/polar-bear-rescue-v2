import React from 'react';
import type { LeaderboardEntry } from '../types';
import { GEAR_INFO } from '../stagesData';

export function NotesModal({
  clues,
  onClose
}: {
  clues: Record<string, string>;
  onClose: () => void;
}) {
  const ks = Object.keys(clues);
  return (
    <div className="fixed inset-0 z-50 bg-[rgba(4,12,30,0.66)] flex items-center justify-center p-4">
      <div className="panel max-w-xl">
        <h2>
          단서 수첩 <span className="tag">{ks.length}개</span>
        </h2>
        <p className="guide">
          대사 속 반짝이는 단어를 누르면 여기에 저장돼요. 미션이 어려우면 수첩을 다시 읽어 보세요.
        </p>
        <div className="grid gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {ks.length > 0 ? (
            ks.map(k => (
              <div key={k} className="note">
                <b>{k}</b>
                {clues[k]}
              </div>
            ))
          ) : (
            <div className="note text-center py-4 text-stone-500">
              아직 모은 단서가 없어요. 대사 속 노란색 반짝이는 단어를 탭해 보세요!
            </div>
          )}
        </div>
        <div className="flex justify-center mt-4">
          <button className="big blue" type="button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export function ClueCheckModal({
  requiredClues,
  clues,
  seen,
  onCollect,
  onStartQuiz
}: {
  requiredClues: string[];
  clues: Record<string, string>;
  seen: Record<string, string>;
  onCollect: (k: string, sentence: string) => void;
  onStartQuiz: () => void;
}) {
  const missing = requiredClues.filter(k => !clues[k]);

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(4,12,30,0.66)] flex items-center justify-center p-4">
      <div className="panel max-w-xl">
        <h2>
          단서 점검{' '}
          <span className="tag">
            {requiredClues.length - missing.length} / {requiredClues.length}
          </span>
        </h2>
        <p className="guide">
          {missing.length > 0
            ? `아직 저장하지 않은 단서가 ${missing.length}개 있어요. 문장을 다시 읽고 반짝이는 단어를 눌러 모두 저장하면 확인 퀴즈가 열려요.`
            : '단서를 모두 모았어요! 확인 퀴즈를 시작해요.'}
        </p>
        <div className="grid gap-2 max-h-[50vh] overflow-y-auto pr-1">
          {requiredClues.map(k => {
            const isGot = !!clues[k];
            const sentence = seen[k] || `**${k}**`;
            const parts = sentence.split(k);
            return (
              <div key={k} className="note">
                {parts.length > 1 ? (
                  <span>
                    {parts[0]}
                    <button
                      type="button"
                      className={`kw ${isGot ? 'got' : ''}`}
                      onClick={() => onCollect(k, sentence)}
                    >
                      {k}
                    </button>
                    {parts.slice(1).join(k)}
                  </span>
                ) : (
                  <button
                    type="button"
                    className={`kw ${isGot ? 'got' : ''}`}
                    onClick={() => onCollect(k, sentence)}
                  >
                    {k}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-center mt-4">
          <button
            className="big"
            type="button"
            disabled={missing.length > 0}
            onClick={onStartQuiz}
          >
            확인 퀴즈 시작
          </button>
        </div>
      </div>
    </div>
  );
}

export function RewardModal({
  gearId,
  onClose
}: {
  gearId: string;
  onClose: () => void;
}) {
  const g = GEAR_INFO[gearId] || { ic: '🎁', name: '새 장비' };
  return (
    <div className="fixed inset-0 z-50 bg-[rgba(4,12,30,0.66)] flex items-center justify-center p-4">
      <div className="panel max-w-md text-center">
        <h2 className="justify-center">장비 획득!</h2>
        <div className="my-5">
          <span className="gear">
            <span className="ic">{g.ic}</span>
            <span className="text-xl font-bold">{g.name}</span>
          </span>
        </div>
        <p className="guide">새로운 장비로 북극곰과 지구를 지키는 힘이 더 강해졌어요!</p>
        <div className="flex justify-center mt-4">
          <button className="big" type="button" onClick={onClose}>
            좋아요!
          </button>
        </div>
      </div>
    </div>
  );
}

export function StageResultModal({
  stageTitle,
  stars,
  pts,
  blocks,
  mistakes,
  cluesCount,
  hasNext,
  onNext,
  onMap
}: {
  stageTitle: string;
  stars: number;
  pts: number;
  blocks: number;
  mistakes: number;
  cluesCount: number;
  hasNext: boolean;
  onNext: () => void;
  onMap: () => void;
}) {
  const bonus = blocks * 10;
  const total = pts + bonus;

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(4,12,30,0.66)] flex items-center justify-center p-4">
      <div className="panel max-w-lg text-center">
        <h2 className="justify-center">{stageTitle} 완료!</h2>
        <div className="stars my-2">
          {[1, 2, 3].map(i => (
            <span key={i} className={i <= stars ? '' : 'e'}>
              ★
            </span>
          ))}
        </div>
        <div className="score-big">{total.toLocaleString()}점</div>
        <p className="guide mt-2 text-stone-700">
          미션 점수 {pts.toLocaleString()} + 빙하 블록 보너스 {bonus} (블록 {blocks}개)
          <br />
          실수 {mistakes}번 · 모은 단서 {cluesCount}개
        </p>
        <div className="flex justify-center gap-3 mt-4 flex-wrap">
          <button className="big ghost" type="button" onClick={onMap}>
            작전 지도
          </button>
          {hasNext && (
            <button className="big" type="button" onClick={onNext}>
              다음 작전으로
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import type { User } from 'firebase/auth';
import { heroSVG } from '../svgs';

export function LeaderboardModal({
  entries,
  localEntries = [],
  myName,
  myCode,
  isLoading = false,
  currentUser = null,
  isAdmin = false,
  onSignInGoogle,
  onSignOutGoogle,
  onDeleteEntry,
  onClose,
  onClearLocal
}: {
  entries: LeaderboardEntry[];
  localEntries?: LeaderboardEntry[];
  myName: string;
  myCode: string;
  isLoading?: boolean;
  currentUser?: User | null;
  isAdmin?: boolean;
  onSignInGoogle?: () => Promise<void>;
  onSignOutGoogle?: () => Promise<void>;
  onDeleteEntry?: (id: string) => Promise<void>;
  onClose: () => void;
  onClearLocal?: () => void;
}) {
  const [activeTab, setActiveTab] = React.useState<'live' | 'local'>('live');
  const [confirmClear, setConfirmClear] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const displayedList = activeTab === 'live' ? entries : localEntries;

  const handleDelete = async (id: string) => {
    if (!onDeleteEntry) return;
    if (!window.confirm('이 랭킹 기록을 삭제할까요?')) return;
    setDeletingId(id);
    try {
      await onDeleteEntry(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(4,12,30,0.66)] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="panel max-w-2xl w-full my-auto">
        <div className="flex items-center justify-between gap-2 border-b-2 border-amber-950 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <h2 className="!mb-0 text-xl sm:text-2xl font-display text-amber-950">
              최우수 대원 명예의 전당
            </h2>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-400 px-2.5 py-1 rounded-full text-xs font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Firebase 실시간 연동</span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 my-2">
          <button
            type="button"
            className={`flex-1 py-1.5 px-3 rounded-xl font-display text-sm border-2 transition-all ${
              activeTab === 'live'
                ? 'bg-amber-400 text-amber-950 border-amber-950 shadow-sm font-bold'
                : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
            }`}
            onClick={() => setActiveTab('live')}
          >
            🌐 실시간 온라인 순위표 ({entries.length}명)
          </button>
          <button
            type="button"
            className={`flex-1 py-1.5 px-3 rounded-xl font-display text-sm border-2 transition-all ${
              activeTab === 'local'
                ? 'bg-amber-400 text-amber-950 border-amber-950 shadow-sm font-bold'
                : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
            }`}
            onClick={() => setActiveTab('local')}
          >
            💻 이 기기 로컬 기록 ({localEntries.length}명)
          </button>
        </div>

        {/* Google Auth Status bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 bg-amber-50/80 border border-amber-200 rounded-xl px-3 py-1.5 text-xs text-amber-950 mb-3">
          <div className="flex items-center gap-1.5">
            {currentUser ? (
              <>
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                <span>
                  <b>{currentUser.displayName || currentUser.email}</b> 님
                </span>
                {isAdmin && (
                  <span className="bg-red-500 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">
                    선생님(관리자)
                  </span>
                )}
              </>
            ) : (
              <span className="text-stone-600">
                선생님 또는 대원 계정으로 로그인하면 관리자 권한을 사용할 수 있습니다.
              </span>
            )}
          </div>
          <div>
            {currentUser ? (
              <button
                type="button"
                className="text-stone-500 hover:text-stone-800 underline text-xs font-bold"
                onClick={onSignOutGoogle}
              >
                로그아웃
              </button>
            ) : (
              onSignInGoogle && (
                <button
                  type="button"
                  className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-800 px-2.5 py-1 rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                  onClick={onSignInGoogle}
                >
                  <span>구글 로그인 (선택)</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && activeTab === 'live' && entries.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin text-3xl mb-2">🧊</div>
            <p className="text-stone-600 text-sm font-bold">파이어베이스에서 순위표를 불러오는 중입니다...</p>
          </div>
        ) : displayedList.length > 0 ? (
          <div className="max-h-[50vh] overflow-y-auto my-2 pr-1">
            <table className="lb w-full">
              <thead>
                <tr className="text-xs text-stone-600 border-b border-amber-200">
                  <th className="py-1 px-2 text-left w-14">순위</th>
                  <th className="py-1 px-2 text-left">대원</th>
                  <th className="py-1 px-2 text-center w-20">별점</th>
                  <th className="py-1 px-2 text-right w-24">점수</th>
                  <th className="py-1 px-2 text-right w-24 hidden sm:table-cell">날짜</th>
                  {isAdmin && activeTab === 'live' && (
                    <th className="py-1 px-2 text-center w-12">관리</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {displayedList.slice(0, 50).map((x, i) => {
                  const isMe = x.name === myName && x.code === myCode;
                  const rankIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}위`;
                  return (
                    <tr
                      key={x.id || `${x.name}-${x.code}-${i}`}
                      className={`${i === 0 ? 'r1' : ''} ${isMe ? 'me' : ''} hover:bg-amber-50/50 transition-colors`}
                    >
                      <td className="font-display text-sm py-2 px-2">
                        <span className={`inline-block text-center ${i < 3 ? 'text-lg font-bold' : 'text-stone-700'}`}>
                          {rankIcon}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full overflow-hidden border border-amber-900 bg-amber-100 flex-shrink-0"
                            dangerouslySetInnerHTML={{
                              __html: heroSVG('smile', x.avatar || 'a')
                            }}
                          />
                          <div>
                            <span className="font-bold text-amber-950 text-sm">
                              {x.name}
                            </span>{' '}
                            <span className="text-[11px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">
                              {x.code}
                            </span>
                            {isMe && (
                              <span className="ml-1 text-[10px] bg-blue-500 text-white px-1 rounded font-bold">
                                나
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-amber-500 font-bold text-center text-xs py-2 px-2">
                        {'★'.repeat(Math.min(5, x.stars))}
                        {x.stars > 5 && ` +${x.stars - 5}`}
                      </td>
                      <td className="text-right font-display text-amber-900 font-bold text-sm py-2 px-2">
                        {x.score.toLocaleString()}점
                      </td>
                      <td className="text-right text-[11px] text-stone-500 py-2 px-2 hidden sm:table-cell">
                        {x.date}
                      </td>
                      {isAdmin && activeTab === 'live' && (
                        <td className="text-center py-2 px-2">
                          <button
                            type="button"
                            disabled={deletingId === x.id}
                            className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer text-sm"
                            title="기록 삭제 (관리자)"
                            onClick={() => x.id && handleDelete(x.id)}
                          >
                            {deletingId === x.id ? '…' : '🗑️'}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="note text-center py-8 bg-amber-50/50 rounded-xl my-3">
            <p className="text-2xl mb-1">🐻‍❄️</p>
            <p className="font-bold text-amber-950 mb-1">
              {activeTab === 'live'
                ? '아직 등록된 실시간 순위 기록이 없어요.'
                : '아직 이 기기에 저장된 기록이 없어요.'}
            </p>
            <p className="text-stone-600 text-xs">
              에필로그까지 미션을 모두 완료하면 순위표에 명예의 대원으로 자동 등록됩니다!
            </p>
          </div>
        )}

        <div className="flex justify-center gap-3 mt-4">
          <button className="big blue" type="button" onClick={onClose}>
            닫기
          </button>
        </div>

        {activeTab === 'local' && onClearLocal && (
          <div className="text-center mt-3">
            <button
              className="text-stone-600 text-xs underline font-bold"
              type="button"
              onClick={() => {
                if (confirmClear) {
                  onClearLocal();
                  setConfirmClear(false);
                } else {
                  setConfirmClear(true);
                }
              }}
            >
              {confirmClear ? '⚠️ 정말 초기화할까요? (한 번 더 누르면 삭제)' : '로컬 순위표 초기화'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
