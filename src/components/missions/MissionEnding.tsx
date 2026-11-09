import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BADGE_IMAGE } from '../../assets';
import { cue } from '../../audio';

/** 마지막 엔딩: 실천 약속을 다시 보여 주고, 크레딧처럼 마무리한다 */
export function MissionEnding({
  name,
  pledges,
  totalScore,
  stars,
  result,
  onMount,
  onShowLeaderboard,
  onGoTitle,
  onGoMap
}: {
  name: string;
  pledges: string[];
  totalScore: number;
  stars: Record<number, number>;
  result: { rank: number; online: boolean } | null;
  onMount: () => void;
  onShowLeaderboard: () => void;
  onGoTitle: () => void;
  onGoMap: () => void;
}) {
  useEffect(() => {
    onMount(); // 에필로그 완료 표시
    cue.momAppear();
    const t = window.setTimeout(() => {
      try {
        confetti({ particleCount: 120, spread: 100, origin: { y: 0.3 }, colors: ['#ffd84d', '#7fd3ff', '#ffffff', '#7be6b0'] });
      } catch {
        // ignore
      }
    }, 2600);
    return () => window.clearTimeout(t);
  }, []);

  const starTotal = [1, 2, 3, 4, 5].reduce((a, i) => a + (stars[i] || 0), 0);
  const list = pledges.length ? pledges : ['지구와 북극곰을 꾸준히 지키기'];
  const checkDate = new Date(Date.now() + 7 * 24 * 3600 * 1000).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="ending">
      <img className="ending-badge" src={BADGE_IMAGE} alt="지구레인저 배지" draggable={false} />
      <h2 className="ending-title">임무 완료!</h2>
      <p className="ending-lead">
        지구레인저 <b>{name}</b>, 오늘도 지구를 부탁해!
      </p>

      <div className="ending-pledges">
        <div className="ending-pledges-head">📌 나의 일주일 실천 약속</div>
        <ol>
          {list.slice(0, 3).map((p, i) => (
            <li key={i} style={{ animationDelay: `${0.9 + i * 0.25}s` }}>
              <span className="chk">☐</span> {p}
            </li>
          ))}
        </ol>
        <div className="ending-check">
          일주일 뒤 <b>{checkDate}</b>에 약속을 지켰는지 꼭 확인해 봐요!
        </div>
      </div>

      <div className="ending-stats">
        <span>⭐ 총점 {totalScore.toLocaleString()}점</span>
        <span>★ 별 {starTotal}개</span>
        {result && result.rank > 0 && <span>🏆 이 기기 {result.rank}위</span>}
      </div>
      {result && (
        <p className={`ending-save ${result.online ? 'ok' : 'warn'}`}>
          {result.online
            ? '✅ 실시간 명예의 전당에 기록했어요.'
            : '💾 이 기기 순위표에 기록했어요. 온라인 명예의 전당은 인터넷이 연결되면 자동으로 올라가요.'}
        </p>
      )}

      <div className="ending-actions">
        <button className="big" type="button" onClick={onShowLeaderboard}>
          🏆 명예의 전당
        </button>
        <button className="big ghost" type="button" onClick={onGoMap}>
          🗺️ 작전 지도
        </button>
        <button className="big ghost" type="button" onClick={onGoTitle}>
          처음 화면으로
        </button>
      </div>

      <p className="ending-credit">— 플래닛 가디언즈 · 포리 · 단비 대장 · 루카 · 써모 —</p>
    </div>
  );
}
