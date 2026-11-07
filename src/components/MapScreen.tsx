import React from 'react';
import { sfx } from '../audio';
import { MAP_IMAGE } from '../assets';

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
  ['프롤로그', '구조 요청이 도착했다', '포리의 SOS를 받고 수련생이 되어요.'],
  ['작전 1', '지구 이상 신호를 추적하라', '날씨와 기후, 기후변화 현상과 피해'],
  ['작전 2', '빙하를 녹인 범인을 찾아라', '기후변화의 원인과 지구 온난화'],
  ['작전 3', '탄소 저울을 맞춰라', '이산화 탄소와 탄소 중립'],
  ['작전 4', '포리의 빙하를 되찾아라', '생활 속 실천과 알리기'],
  ['최종 결전', '탄소 대마왕을 막아라', '기후 마법으로 보스 대결 (총정리)'],
  ['에필로그', '임명식', '지구레인저 임명장 발급']
];

// map.webp 위 빙하 섬의 위치(가로 %, 세로 %). 최종 결전은 깃발이 꽂힌 꼭대기.
const NODE_POS: [number, number][] = [
  [11, 80],
  [27, 54],
  [43, 36],
  [62, 58],
  [76, 36],
  [85.5, 13],
  [88, 78]
];

const NODE_ICON = ['📡', '🌍', '🔍', '⚖️', '🧊', '👹', '🎖️'];

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

  const statusOf = (i: number) => {
    const isDone = !!done[i];
    if (isDone) return 'done';
    if (i > unlocked) return 'lock';
    if (i === unlocked) return 'cur';
    return 'open';
  };

  const statusText = (i: number) => {
    const st = statusOf(i);
    if (st === 'done') {
      const n = stars[i] || 0;
      return i > 0 && i < STAGE_INFOS.length - 1 ? '★'.repeat(n) + '☆'.repeat(3 - n) : '✓ 완료';
    }
    if (st === 'lock') return '🔒 잠김';
    return '출동 ▶';
  };

  return (
    <div className="screen map-screen">
      <img className="screen-art map-blur" src={MAP_IMAGE} alt="" draggable={false} />

      <header className="map-head">
        <h1 className="logo map-logo">작전 지도</h1>
        <div className="pill map-pill">
          {name} 수련생 · {code} · 총점 {totalScore.toLocaleString()}점
        </div>
      </header>

      <div className="map-board">
        <img className="map-art" src={MAP_IMAGE} alt="북극 바다 작전 지도" draggable={false} />

        {STAGE_INFOS.map((info, i) => {
          const st = statusOf(i);
          const [x, y] = NODE_POS[i];
          return (
            <button
              key={i}
              type="button"
              disabled={st === 'lock'}
              onClick={() => handleNodeClick(i)}
              className={`map-node ${st}`}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span className="map-node-icon" aria-hidden="true">
                {st === 'lock' ? '🔒' : NODE_ICON[i]}
              </span>
              <span className="map-node-card">
                <b>{info[0]}</b>
                <em>{info[1]}</em>
                <small>{statusText(i)}</small>
              </span>
            </button>
          );
        })}
      </div>

      {/* 좁은 화면에서는 지도 아래에 목록으로도 보여 준다 */}
      <ol className="map-list">
        {STAGE_INFOS.map((info, i) => {
          const st = statusOf(i);
          return (
            <li key={i}>
              <button
                type="button"
                disabled={st === 'lock'}
                onClick={() => handleNodeClick(i)}
                className={`map-row ${st}`}
              >
                <span className="map-node-icon" aria-hidden="true">
                  {st === 'lock' ? '🔒' : NODE_ICON[i]}
                </span>
                <span className="map-row-text">
                  <b>{info[0]}</b> {info[1]}
                  <small>{info[2]}</small>
                </span>
                <span className="map-row-status">{statusText(i)}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="map-actions">
        <button className="big ghost" type="button" onClick={onShowLeaderboard}>
          🏆 순위표
        </button>
        <button className="big ghost" type="button" onClick={onGoTitle}>
          처음 화면으로
        </button>
        <button className="teacher-link" type="button" onClick={onUnlockAll}>
          선생님용: 모든 작전 열기
        </button>
      </div>
    </div>
  );
}
