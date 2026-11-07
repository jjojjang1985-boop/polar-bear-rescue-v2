import React, { useMemo } from 'react';
import { SHADOW_IMAGE } from '../assets';

export type SceneFxName =
  | 'bookGlow'
  | 'portal'
  | 'alarm'
  | 'shadowPeek'
  | 'goggle'
  | 'twist'
  | 'crack'
  | 'win';

export interface SceneFxState {
  name: SceneFxName;
  id: number;
}

/** 사람 모양 작은 그림자 */
const PERSON = (
  <svg viewBox="0 0 40 70" aria-hidden="true">
    <circle cx="20" cy="12" r="10" />
    <path d="M4 68 Q4 28 20 26 Q36 28 36 68 Z" />
  </svg>
);

/** 후드를 쓴 그림자 악당 (선생님이 만든 그림) */
const HOODED = <img src={SHADOW_IMAGE} alt="" draggable={false} />;

// 그림 안에서의 위치(가로 %, 세로 %)
const HQ_MAP_DOTS: [number, number][] = [
  [42, 27], [47, 24], [52, 29], [57, 25], [62, 33], [66, 28],
  [45, 38], [55, 40], [60, 43], [68, 39], [50, 22], [64, 21]
];
const GOGGLE_TRACES: [number, number][] = [
  [22, 40], [78, 30], [60, 70]
];

export function SceneFx({ fx }: { fx: SceneFxState | null }) {
  // 흩어지는 그림자들의 방향은 효과가 새로 시작될 때만 정한다
  const scatter = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => {
        const ang = (i / 34) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 32 + Math.random() * 30;
        return {
          dx: `${Math.cos(ang) * dist}vw`,
          dy: `${Math.sin(ang) * dist * 0.7}vh`,
          rot: `${Math.random() * 40 - 20}deg`,
          size: 34 + Math.random() * 34,
          delay: `${0.95 + Math.random() * 0.25}s`
        };
      }),
    [fx?.id]
  );

  if (!fx) return null;

  switch (fx.name) {
    case 'bookGlow':
      return (
        <div className="fx" key={fx.id}>
          <div className="fx-imgbox">
            <div className="fx-bookglow" style={{ left: '66%', top: '82%' }}>
              <i className="ring" />
              <i className="ring r2" />
              {Array.from({ length: 14 }, (_, i) => (
                <b
                  key={i}
                  className="mote"
                  style={{
                    left: `${(i * 37) % 100}%`,
                    animationDelay: `${(i % 7) * 0.28}s`,
                    ['--drift' as string]: `${((i * 53) % 60) - 30}px`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      );

    case 'portal':
      return (
        <div className="fx" key={fx.id}>
          <div className="fx-imgbox">
            <div className="fx-portal" style={{ left: '66%', top: '82%' }} />
          </div>
          <div className="fx-whiteout" />
        </div>
      );

    case 'alarm':
      return (
        <div className="fx" key={fx.id}>
          <div className="fx-redpulse" />
          <div className="fx-imgbox">
            {HQ_MAP_DOTS.map(([x, y], i) => (
              <i
                key={i}
                className="fx-dot"
                style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${0.15 + i * 0.12}s` }}
              />
            ))}
          </div>
        </div>
      );

    case 'shadowPeek':
      return (
        <div className="fx" key={fx.id}>
          <div className="fx-dim" />
          <div className="fx-shadow-run">{HOODED}</div>
        </div>
      );

    case 'goggle':
      return (
        <div className="fx" key={fx.id}>
          <svg className="fx-goggle" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <mask id="lens">
                <rect width="100" height="60" fill="#fff" />
                <ellipse cx="31" cy="30" rx="23" ry="24" fill="#000" />
                <ellipse cx="69" cy="30" rx="23" ry="24" fill="#000" />
              </mask>
            </defs>
            <rect width="100" height="60" fill="rgba(24,6,18,.72)" mask="url(#lens)" />
          </svg>
          <div className="fx-redtint" />
          <div className="fx-scanline" />
          {GOGGLE_TRACES.map(([x, y], i) => (
            <i key={i} className="fx-trace" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${0.7 + i * 0.35}s` }} />
          ))}
        </div>
      );

    case 'twist':
      return (
        <div className="fx" key={fx.id}>
          <div className="fx-dim strong" />
          <div className="fx-shadow-big">{HOODED}</div>
          <div className="fx-scatter">
            {scatter.map((p, i) => (
              <span
                key={i}
                className="fx-person"
                style={{
                  width: `${p.size}px`,
                  ['--dx' as string]: p.dx,
                  ['--dy' as string]: p.dy,
                  ['--rot' as string]: p.rot,
                  animationDelay: p.delay
                }}
              >
                {PERSON}
              </span>
            ))}
          </div>
        </div>
      );

    case 'crack':
      return (
        <div className="fx" key={fx.id}>
          <svg className="fx-crack" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
            {[
              'M500 330 L430 360 L380 350 L300 420 L210 430 L120 520',
              'M500 330 L560 380 L640 375 L700 450 L800 470 L900 560',
              'M500 330 L520 260 L480 200 L530 120',
              'M430 360 L420 450 L460 540',
              'M640 375 L690 300 L780 280'
            ].map((d, i) => (
              <g key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                <path d={d} className="under" />
                <path d={d} className="over" />
              </g>
            ))}
          </svg>
        </div>
      );

    case 'win':
      return (
        <div className="fx" key={fx.id}>
          <div className="fx-goldglow" />
          {Array.from({ length: 18 }, (_, i) => (
            <b
              key={i}
              className="fx-star"
              style={{
                left: `${8 + ((i * 47) % 84)}%`,
                top: `${10 + ((i * 29) % 70)}%`,
                animationDelay: `${(i % 6) * 0.15}s`
              }}
            >
              ✦
            </b>
          ))}
        </div>
      );

    default:
      return null;
  }
}
