import React from 'react';
import { PORI_FACE } from '../assets';

interface TowerAsideProps {
  blocks: number;
  towerOn: boolean;
  poriMood: 'scared' | 'joy' | 'happy';
  wobble: boolean;
  happy: boolean;
}

const MAX_BLOCKS = 12;

export function TowerAside({ blocks, towerOn, poriMood, wobble, happy }: TowerAsideProps) {
  if (!towerOn) return null;

  const mood = blocks <= 2 ? 'scared' : blocks >= 9 ? 'joy' : poriMood;
  const badge = mood === 'scared' ? '💦' : mood === 'joy' ? '✨' : '';

  return (
    <aside id="tower" className={`tower mood-${mood}`} aria-label={`빙하 탑 블록 ${blocks}개`}>
      <div className="tower-head">
        <h3>빙하 탑</h3>
        <div className="tower-count">
          {blocks}
          <small> / {MAX_BLOCKS}</small>
        </div>
      </div>

      <div className="tower-body">
        <div id="blocks" className="tower-blocks">
          {Array.from({ length: blocks }, (_, idx) => (
            <div key={idx} className="ice" />
          ))}
        </div>

        <div id="poriTop" className={`tower-pori ${wobble ? 'wobble' : ''} ${happy ? 'happy' : ''}`}>
          <img src={PORI_FACE} alt="포리" draggable={false} />
          {badge && <span className="tower-badge">{badge}</span>}
        </div>
      </div>

      <div className="tower-sea" />
    </aside>
  );
}
