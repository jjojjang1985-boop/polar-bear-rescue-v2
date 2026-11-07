import React from 'react';
import { poriSVG } from '../svgs';

interface TowerAsideProps {
  blocks: number;
  towerOn: boolean;
  poriMood: 'scared' | 'joy' | 'happy';
  wobble: boolean;
  happy: boolean;
}

export function TowerAside({
  blocks,
  towerOn,
  poriMood,
  wobble,
  happy
}: TowerAsideProps) {
  const maxBlocks = 12;

  const resolvedMood =
    blocks <= 2 ? 'scared' : blocks >= 9 ? 'joy' : poriMood;

  return (
    <aside
      id="tower"
      className={towerOn ? '' : 'off'}
      style={{
        position: 'relative',
        borderRadius: '26px',
        background: 'linear-gradient(180deg, #c3b2ee 0%, #f6c2b6 55%, #ffe0a6 100%)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '8px 8px 44px',
        border: '4px solid var(--line)',
        boxShadow: '0 6px 0 var(--line)',
        minHeight: '260px'
      }}
    >
      <h3
        style={{
          position: 'absolute',
          top: '10px',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: '16px',
          color: 'var(--sun)',
          WebkitTextStroke: '4px var(--line)',
          paintOrder: 'stroke fill'
        }}
      >
        빙하 탑
      </h3>

      <div
        id="tcount"
        style={{
          position: 'absolute',
          top: '34px',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: '14px',
          color: 'var(--line)',
          fontWeight: 700
        }}
      >
        블록 {blocks} / {maxBlocks}
      </div>

      <div
        id="poriTop"
        className={`${wobble ? 'wobble' : ''} ${happy ? 'happy' : ''}`}
        style={{
          width: '90px',
          height: '90px',
          transition: 'transform 0.4s',
          marginBottom: '-6px',
          zIndex: 2
        }}
        dangerouslySetInnerHTML={{ __html: poriSVG(resolvedMood) }}
      />

      <div
        id="blocks"
        style={{
          display: 'flex',
          flexDirection: 'column-reverse',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        {Array.from({ length: blocks }, (_, idx) => (
          <div key={idx} className="ice" />
        ))}
      </div>

      <div id="sea"></div>
    </aside>
  );
}
