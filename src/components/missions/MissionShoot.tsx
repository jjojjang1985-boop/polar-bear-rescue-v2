import React, { useEffect, useRef, useState } from 'react';
import { SCENE_IMAGES, SHOOT_IMAGES } from '../../assets';
import { sfx, tone, cue } from '../../audio';

/** 쏘아서 없애야 하는 열기 덩어리 (지구를 데우는 행동) */
const HEATS = [
  { em: '🏭', t: '공장 매연' },
  { em: '🚗', t: '배기가스' },
  { em: '🥤', t: '일회용 컵' },
  { em: '💡', t: '빈방 전등' },
  { em: '🔥', t: '산불 연기' },
  { em: '🗑️', t: '쓰레기 더미' },
  { em: '🛍️', t: '비닐봉지' },
  { em: '🚰', t: '틀어 둔 물' }
];

/** 쏘지 말고 포리로 받아야 하는 실천 아이템 */
const GOODS = [
  { em: '🌳', t: '나무 심기', power: 'spread' as const },
  { em: '🚲', t: '자전거 타기', power: 'rapid' as const },
  { em: '♻️', t: '분리배출', power: 'clear' as const },
  { em: '🧋', t: '텀블러 쓰기', power: 'energy' as const }
];

type Power = 'spread' | 'rapid' | 'clear' | 'energy';

interface Thing {
  id: number;
  kind: 'heat' | 'good';
  x: number; // %
  y: number; // %
  vy: number; // %/s
  wob: number;
  em: string;
  t: string;
  power?: Power;
  hp: number;
  big?: boolean;
  dead?: 'hit' | 'catch' | 'miss' | 'oops';
  deadAt?: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
}

const GOAL = 100;
const PLAYER_Y = 84;

const POWER_TEXT: Record<Power, string> = {
  spread: '🌳 세 갈래 얼음 빔!',
  rapid: '🚲 빠른 연사!',
  clear: '♻️ 열기 싹 정리!',
  energy: '🧋 얼음 에너지 듬뿍!'
};

export function MissionShoot({
  onCorrect,
  onWrong,
  onFinish,
  onReact
}: {
  onCorrect: () => void;
  onWrong: () => void;
  onFinish: () => void;
  onReact: (who: any, text: string, mood?: any) => void;
}) {
  const arenaRef = useRef<HTMLDivElement>(null);
  const [, setFrame] = useState(0);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [powerMsg, setPowerMsg] = useState<string | null>(null);

  const s = useRef({
    px: 50,
    targetX: 50,
    energy: 0,
    things: [] as Thing[],
    bullets: [] as Bullet[],
    nextId: 1,
    lastShot: 0,
    lastSpawn: 0,
    spreadUntil: 0,
    rapidUntil: 0,
    elapsed: 0,
    misses: 0,
    keys: { left: false, right: false },
    won: false,
    lastMissTalk: 0
  });

  // 키보드 ← → 로도 움직일 수 있다
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') s.current.keys.left = true;
      if (e.key === 'ArrowRight') s.current.keys.right = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') s.current.keys.left = false;
      if (e.key === 'ArrowRight') s.current.keys.right = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const flashPower = (msg: string) => {
    setPowerMsg(msg);
    window.setTimeout(() => setPowerMsg(m => (m === msg ? null : m)), 1300);
  };

  const addEnergy = (n: number) => {
    const st = s.current;
    st.energy = Math.max(0, Math.min(GOAL, st.energy + n));
    if (st.energy >= GOAL && !st.won) {
      st.won = true;
      st.things.forEach(t => {
        if (!t.dead) {
          t.dead = 'hit';
          t.deadAt = performance.now();
        }
      });
      setWon(true);
      setPowerMsg(null);
      cue.fanfare();
      onReact('pori', '엄마! 엄마가 보여요! 조금만 더 가면 돼요!', 'joy');
      window.setTimeout(onFinish, 2600);
    }
  };

  // 게임 루프
  useEffect(() => {
    if (!started) return;
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = s.current;
      const arena = arenaRef.current;
      const ratio = arena ? arena.clientHeight / arena.clientWidth : 0.6; // % 단위 충돌을 화면 비율로 보정

      if (!st.won) {
        st.elapsed += dt;
        const level = Math.min(1, st.elapsed / 60); // 1분에 걸쳐 조금씩 빨라진다

        // 이동
        if (st.keys.left) st.targetX -= 70 * dt;
        if (st.keys.right) st.targetX += 70 * dt;
        st.targetX = Math.max(6, Math.min(94, st.targetX));
        st.px += (st.targetX - st.px) * Math.min(1, dt * 14);

        // 자동 발사
        const rapid = now < st.rapidUntil;
        const gap = rapid ? 170 : 380;
        if (now - st.lastShot > gap) {
          st.lastShot = now;
          const spread = now < st.spreadUntil;
          const vxs = spread ? [-22, 0, 22] : [0];
          vxs.forEach(vx => st.bullets.push({ id: st.nextId++, x: st.px, y: PLAYER_Y - 8, vx }));
          tone(1300 + Math.random() * 200, 0.04, 'triangle', 0.012);
        }

        // 생성
        const spawnGap = 820 - level * 400;
        if (now - st.lastSpawn > spawnGap) {
          st.lastSpawn = now;
          const isGood = Math.random() < 0.22;
          const big = !isGood && Math.random() < 0.3 + level * 0.2;
          const base = isGood ? GOODS[Math.floor(Math.random() * GOODS.length)] : HEATS[Math.floor(Math.random() * HEATS.length)];
          st.things.push({
            id: st.nextId++,
            kind: isGood ? 'good' : 'heat',
            x: 8 + Math.random() * 84,
            y: -8,
            vy: (isGood ? 15 : 13) + level * 14 + Math.random() * 5,
            hp: big ? 3 : 1,
            big,
            wob: Math.random() * 6.28,
            em: base.em,
            t: base.t,
            power: isGood ? (base as (typeof GOODS)[number]).power : undefined
          });
        }

        // 총알 이동
        st.bullets.forEach(b => {
          b.y -= 120 * dt;
          b.x += b.vx * dt;
        });
        st.bullets = st.bullets.filter(b => b.y > -5 && b.x > -5 && b.x < 105);

        // 떨어지는 것들 이동과 충돌
        st.things.forEach(t => {
          if (t.dead) return;
          t.y += t.vy * dt;
          t.wob += dt * 3;
          if (t.kind === 'heat') t.x = Math.max(5, Math.min(95, t.x + Math.sin(t.wob * 0.9) * (6 + level * 10) * dt));

          // 얼음 빔에 맞음 (좋은 행동 방울은 빔이 그냥 통과한다)
          if (t.kind === 'heat') {
            for (const b of st.bullets) {
              const dx = b.x - t.x;
              const dy = (b.y - t.y) * ratio;
              if (Math.hypot(dx, dy) < 5.5) {
                b.y = -100;
                t.hp -= 1;
                if (t.hp <= 0) {
                  t.dead = 'hit';
                  t.deadAt = now;
                  sfx.ok();
                  addEnergy(t.big ? 3 : 1.2);
                } else {
                  tone(300, 0.05, 'square', 0.02);
                }
                break;
              }
            }
          }
          if (t.dead) return;

          // 포리가 받음
          if (Math.abs(t.x - st.px) < 8 && Math.abs(t.y - PLAYER_Y) < 9) {
            if (t.kind === 'good') {
              t.dead = 'catch';
              t.deadAt = now;
              cue.tower();
              onCorrect();
              addEnergy(t.power === 'energy' ? 6 : 3.5);
              if (t.power === 'spread') st.spreadUntil = now + 6000;
              if (t.power === 'rapid') st.rapidUntil = now + 6000;
              if (t.power === 'clear') {
                st.things.forEach(o => {
                  if (!o.dead && o.kind === 'heat') {
                    o.dead = 'hit';
                    o.deadAt = now;
                    addEnergy(1);
                  }
                });
              }
              flashPower(POWER_TEXT[t.power!]);
            } else {
              t.dead = 'miss';
              t.deadAt = now;
              cue.crack();
              onWrong();
            }
            return;
          }

          // 바닥에 닿음
          if (t.y > 100) {
            t.dead = 'miss';
            t.deadAt = now;
            if (t.kind === 'good' && now - st.lastMissTalk > 6000) {
              st.lastMissTalk = now;
              onReact('luka', `아깝다! ${t.em} ${t.t}는 좋은 행동이야. 포리로 받으면 특별한 힘이 생겨!`, 'o');
            }
            if (t.kind === 'heat') {
              cue.crack();
              onWrong();
              st.misses++;
              if (now - st.lastMissTalk > 6000) {
                st.lastMissTalk = now;
                onReact('thermo', `삐빅! ${t.em} ${t.t} 열기가 빙하에 닿았어! 빙하가 녹고 있어!`, 'alert');
              }
            }
          }
        });
      }

      // 사라지는 효과가 끝난 것 정리
      st.things = st.things.filter(t => !t.dead || now - (t.deadAt || 0) < 450);
      setFrame(f => (f + 1) % 1000000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [started]);

  const handlePointer = (e: React.PointerEvent) => {
    const r = arenaRef.current?.getBoundingClientRect();
    if (!r) return;
    s.current.targetX = Math.max(6, Math.min(94, ((e.clientX - r.left) / r.width) * 100));
  };

  const st = s.current;
  const now = performance.now();
  const spreadOn = now < st.spreadUntil;
  const rapidOn = now < st.rapidUntil;

  return (
    <div className="panel shoot-panel max-w-3xl">
      <div className="flex justify-between items-center mb-1 gap-2 flex-wrap">
        <h2>
          <span className="tag">미션 4-3</span>
          빙하 지키기 슈팅
        </h2>
        <b className="font-display text-sky-800">
          얼음 에너지 {Math.round(st.energy)} / {GOAL}
        </b>
      </div>
      <div className="meter h-4 mb-2">
        <i style={{ width: `${(st.energy / GOAL) * 100}%` }} />
      </div>

      <div
        ref={arenaRef}
        className={`shoot-arena ${won ? 'won' : ''}`}
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
      >
        <img className="shoot-bg" src={SCENE_IMAGES.arctic} alt="" draggable={false} />

        {/* 멀리서 기다리는 엄마 곰: 에너지가 찰수록 가까워진다 */}
        <img
          className="shoot-mom"
          src={SHOOT_IMAGES.mom}
          alt="엄마 곰"
          draggable={false}
          style={{ width: `${9 + (st.energy / GOAL) * 9}%`, top: `${6 + (st.energy / GOAL) * 8}%` }}
        />

        {st.bullets.map(b => (
          <i key={b.id} className="ice-bullet" style={{ left: `${b.x}%`, top: `${b.y}%` }} />
        ))}

        {st.things.map(t => (
          <div
            key={t.id}
            className={`falling ${t.kind === 'heat' ? 'fall-heat' : 'fall-good'} ${t.big ? 'big' : ''} ${t.dead ? `dead-${t.dead}` : ''}`}
            style={{ left: `${t.x + Math.sin(t.wob) * 1.5}%`, top: `${t.y}%` }}
          >
            {t.kind === 'heat' ? (
              <img src={SHOOT_IMAGES.heat} alt="" draggable={false} />
            ) : (
              <span className="good-bubble">{t.em}</span>
            )}
            {t.kind === 'heat' && <span className="heat-badge">{t.em}</span>}
            {t.big && !t.dead && <span className="heat-hp">{'●'.repeat(t.hp)}</span>}
            <span className="falling-label">{t.t}</span>
          </div>
        ))}

        <div className={`shoot-player ${spreadOn || rapidOn ? 'powered' : ''}`} style={{ left: `${st.px}%`, top: `${PLAYER_Y}%` }}>
          <img src={SHOOT_IMAGES.pori} alt="포리" draggable={false} />
        </div>

        {powerMsg && !won && <div className="power-msg">{powerMsg}</div>}

        {!started && (
          <div className="shoot-start">
            <div className="shoot-howto">
              <p>
                <b>🔴 열기 덩어리</b>는 얼음 빔으로 <b>맞혀서</b> 없애요. 큰 덩어리는 세 번 맞혀야 해요!
              </p>
              <p>
                <b>🟢 초록 방울(좋은 행동)</b>은 포리로 <b>받아요</b>. 얼음 에너지와 특별한 힘이 생겨요!
              </p>
              <p className="small">마우스·손가락으로 좌우로 움직이거나, 키보드 ← → 를 쓰세요. 빔은 자동으로 나가요.</p>
            </div>
            <button
              type="button"
              className="big"
              onClick={() => {
                sfx.ok();
                setStarted(true);
              }}
            >
              시작! 🐻‍❄️
            </button>
          </div>
        )}

        {won && <div className="shoot-won">엄마가 보여요! 💙</div>}
      </div>
    </div>
  );
}
