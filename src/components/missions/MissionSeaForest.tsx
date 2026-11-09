import React, { useEffect, useRef, useState } from 'react';
import { SEA_IMAGES } from '../../assets';
import { sfx } from '../../audio';

// sea-floor 그림 속 하얀 바위 6개의 가로 위치(%)
const SPOT_X = [10.9, 26.8, 42.7, 58.2, 74.1, 89.3];
const HIT_RANGE = 6; // 바위 가운데에서 이만큼(%) 안에 떨어지면 성공
const DROP_MS = 950;
const GROW_SECONDS = 30;
const GROW_PER_SEC = 100 / 16; // 방해가 없으면 16초 만에 다 자란다
const EAT_PER_SEC = 22;
const URCHIN_SPEED = 5.5; // %/초
const CURRENTS = [-5, -3, 0, 3, 5];

type Phase = 'drop' | 'ready2' | 'grow' | 'done';

interface Falling {
  x0: number;
  drift: number;
  t0: number;
}
interface Urchin {
  id: number;
  x: number;
  dir: 1 | -1;
  target: number;
  eating: boolean;
  poof?: number;
}
interface Splash {
  id: number;
  x: number;
  ok: boolean;
}

export function MissionSeaForest({
  onCorrect,
  onFinish,
  onReact
}: {
  onCorrect: () => void;
  onFinish: () => void;
  onReact: (who: any, text: string, mood?: any) => void;
}) {
  const [phase, setPhase] = useState<Phase>('drop');
  const [, setFrame] = useState(0);

  // 1단계 상태
  const placed = useRef<boolean[]>([false, false, false, false, false, false]);
  const craneX = useRef(50);
  const craneT = useRef(0);
  const falling = useRef<Falling | null>(null);
  const [current, setCurrent] = useState(() => CURRENTS[Math.floor(Math.random() * CURRENTS.length)]);
  const splashes = useRef<Splash[]>([]);
  const misses = useRef(0);

  // 2단계 상태
  const growth = useRef<number[]>([0, 0, 0, 0, 0, 0]);
  const urchins = useRef<Urchin[]>([]);
  const growLeft = useRef(GROW_SECONDS);
  const nextSpawn = useRef(1.2);
  const caught = useRef(0);
  const uid = useRef(1);

  const placedCount = placed.current.filter(Boolean).length;
  const fullCount = growth.current.filter(g => g >= 99).length;

  // 게임 루프
  useEffect(() => {
    if (phase !== 'drop' && phase !== 'grow') return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (phase === 'drop') {
        // 놓은 개수가 늘수록 크레인이 조금씩 빨라진다
        const speed = 1.15 + placed.current.filter(Boolean).length * 0.12;
        craneT.current += dt * speed;
        craneX.current = 50 + 43 * Math.sin(craneT.current);
        const f = falling.current;
        if (f && now - f.t0 >= DROP_MS) {
          landReef(f.x0 + f.drift);
          falling.current = null;
        }
      } else {
        growLeft.current -= dt;
        // 바닷말 자람
        growth.current = growth.current.map((g, i) => {
          const eaten = urchins.current.some(u => u.eating && !u.poof && u.target === i);
          return Math.max(0, Math.min(100, g + (eaten ? -EAT_PER_SEC : GROW_PER_SEC) * dt));
        });
        // 성게 등장
        nextSpawn.current -= dt;
        if (nextSpawn.current <= 0) {
          const elapsed = GROW_SECONDS - growLeft.current;
          nextSpawn.current = Math.max(0.9, 1.9 - elapsed * 0.035);
          const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
          const target = Math.floor(Math.random() * SPOT_X.length);
          urchins.current.push({ id: uid.current++, x: dir === 1 ? -4 : 104, dir, target, eating: false });
        }
        // 성게 이동
        urchins.current = urchins.current.filter(u => {
          if (u.poof) return now - u.poof < 450;
          const tx = SPOT_X[u.target];
          if (Math.abs(u.x - tx) < 2.2) {
            if (!u.eating) {
              u.eating = true;
              if (Math.random() < 0.35) onReact('thermo', '삐빅! 성게가 바닷말을 갉아먹고 있어! 빨리 눌러서 치워 줘!', 'alert');
            }
          } else {
            u.x += Math.sign(tx - u.x) * URCHIN_SPEED * dt;
          }
          return true;
        });
        if (growLeft.current <= 0) {
          finishGrow();
          return;
        }
      }
      setFrame(n => (n + 1) % 100000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /** 떨어진 어초가 바닥에 닿았을 때 */
  const landReef = (x: number) => {
    let hit = -1;
    SPOT_X.forEach((sx, i) => {
      if (!placed.current[i] && Math.abs(sx - x) <= HIT_RANGE) {
        if (hit < 0 || Math.abs(sx - x) < Math.abs(SPOT_X[hit] - x)) hit = i;
      }
    });
    splashes.current = [...splashes.current.slice(-4), { id: uid.current++, x: hit >= 0 ? SPOT_X[hit] : x, ok: hit >= 0 }];
    if (hit >= 0) {
      placed.current[hit] = true;
      sfx.ok();
      onCorrect();
      const n = placed.current.filter(Boolean).length;
      if (n >= SPOT_X.length) {
        onReact('danbi', '인공 어초 6개 설치 완료! 이제 어초에 바닷말이 붙어 자라기 시작할 거야.', 'smile');
        window.setTimeout(() => setPhase('ready2'), 900);
      } else {
        onReact('thermo', `쿵! 어초 설치 성공! (${n}/6) 해류 방향도 잘 보고 내려 줘.`, 'happy');
      }
    } else {
      misses.current += 1;
      sfx.no();
      onReact('luka', '앗, 바위를 빗나가서 모래에 빠졌어! 해류에 밀리는 만큼 미리 눌러 봐.', 'o');
    }
    setCurrent(CURRENTS[Math.floor(Math.random() * CURRENTS.length)]);
  };

  const dropReef = () => {
    if (phase !== 'drop' || falling.current) return;
    sfx.tick();
    falling.current = { x0: craneX.current, drift: current, t0: performance.now() };
  };

  const startGrow = () => {
    growth.current = [8, 8, 8, 8, 8, 8];
    growLeft.current = GROW_SECONDS;
    nextSpawn.current = 1.5;
    urchins.current = [];
    setPhase('grow');
  };

  const catchUrchin = (u: Urchin) => {
    if (u.poof || phase !== 'grow') return;
    u.poof = performance.now();
    caught.current += 1;
    sfx.ok();
    if (caught.current % 4 === 0) onCorrect();
  };

  const finishGrow = () => {
    urchins.current = [];
    const full = growth.current.filter(g => g >= 99).length;
    setPhase('done');
    sfx.win();
    onReact(
      'danbi',
      `바다 숲 복원 성공! 바다 숲 ${full}곳이 무성해졌어. 우리나라는 매년 5월 10일을 바다 식목일로 정해 바다 숲을 지키고 있어.`,
      'smile'
    );
  };

  // 화면용 값
  const life = phase === 'drop' || phase === 'ready2' ? placedCount / 12 : 0.5 + growth.current.reduce((a, b) => a + b, 0) / 1200;
  const gauge =
    phase === 'drop' || phase === 'ready2'
      ? (placedCount / 6) * 40
      : 40 + (growth.current.reduce((a, b) => a + b, 0) / 600) * 60;
  const f = falling.current;
  const fp = f ? Math.min(1, (performance.now() - f.t0) / DROP_MS) : 0;
  const fishN = phase === 'grow' || phase === 'done' ? fullCount + (phase === 'done' ? 1 : 0) : 0;

  return (
    <div className="panel max-w-3xl">
      <h2>
        <span className="tag">미션 3-2</span>
        바다 숲을 살려라
      </h2>
      <p className="guide">
        {phase === 'drop' &&
          '① 배의 크레인이 하얀 바위 위에 왔을 때 눌러 인공 어초를 내리세요. 해류에 밀리는 방향을 잘 보세요!'}
        {phase === 'ready2' && '② 어초에 바닷말이 자라기 시작해요. 바닷말을 갉아먹는 성게를 눌러 치워 바다 숲을 지키세요!'}
        {phase === 'grow' && '② 성게를 눌러 치우세요! 바닷말이 끝까지 자라면 물고기가 돌아와요.'}
        {phase === 'done' && '바다 숲이 되살아났어요! (5월 10일 바다 식목일)'}
      </p>

      <div
        className={`seafloor sea-game sea-${phase}`}
        style={{ ['--life' as any]: Math.min(1, life).toFixed(2) }}
        onPointerDown={phase === 'drop' ? dropReef : undefined}
      >
        <img className="seafloor-bg" src={SEA_IMAGES.floor} alt="하얗게 변한 바닷속" draggable={false} />

        {/* 물고기 */}
        {Array.from({ length: fishN }, (_, i) => (
          <img
            key={`f${i}`}
            className={`sea-fish ${i % 2 ? 'rev' : ''}`}
            src={SEA_IMAGES.fish}
            alt=""
            draggable={false}
            style={{ top: `${18 + ((i * 17) % 34)}%`, animationDuration: `${9 + (i % 3) * 3}s`, animationDelay: `${-i * 1.7}s` }}
          />
        ))}

        {/* 바위 자리, 어초, 바닷말 */}
        {SPOT_X.map((x, i) => {
          const g = growth.current[i];
          return (
            <div key={i} className="sg-spot" style={{ left: `${x}%` }}>
              {!placed.current[i] && phase === 'drop' && <span className="sg-target" />}
              {placed.current[i] && (
                <>
                  {(phase === 'grow' || phase === 'done') && (
                    <img
                      className="sg-weed"
                      src={SEA_IMAGES.weed}
                      alt=""
                      draggable={false}
                      style={{ ['--g' as any]: (Math.max(0.08, g / 100)).toFixed(3) }}
                    />
                  )}
                  <img className="sg-reef" src={SEA_IMAGES.reef} alt="" draggable={false} />
                  {(phase === 'grow' || phase === 'done') && (
                    <span className={`sg-bar ${g >= 99 ? 'full' : ''}`}>
                      <i style={{ width: `${g}%` }} />
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* 1단계: 배와 크레인 */}
        {phase === 'drop' && (
          <>
            <div className="sg-current">
              해류 {current === 0 ? '없음' : current < 0 ? `${'◀'.repeat(Math.abs(current) > 3 ? 2 : 1)} 왼쪽` : `오른쪽 ${'▶'.repeat(current > 3 ? 2 : 1)}`}
            </div>
            <div className="sg-boat" style={{ left: `${craneX.current}%` }}>
              <img className="sg-boat-img" src={SEA_IMAGES.boat} alt="크레인 배" draggable={false} />
              {!f && <img className="sg-hook-reef" src={SEA_IMAGES.reef} alt="" draggable={false} />}
            </div>
            {f && (
              <img
                className="sg-falling"
                src={SEA_IMAGES.reef}
                alt=""
                draggable={false}
                style={{ left: `${f.x0 + f.drift * fp}%`, top: `${15 + fp * 38}%`, transform: `translateX(-50%) rotate(${f.drift * fp * 3}deg)` }}
              />
            )}
            {placedCount === 0 && !f && <div className="sg-tap">👆 바위 위에서 눌러 어초 내리기!</div>}
          </>
        )}
        {splashes.current.map(s => (
          <span key={s.id} className={`sg-splash ${s.ok ? 'ok' : 'no'}`} style={{ left: `${s.x}%` }}>
            {s.ok ? '쿵!' : '풍덩…'}
          </span>
        ))}

        {/* 2단계: 성게 */}
        {phase === 'grow' &&
          urchins.current.map(u => (
            <button
              key={u.id}
              type="button"
              className={`sg-urchin ${u.eating ? 'eating' : ''} ${u.poof ? 'poof' : ''}`}
              style={{ left: `${u.x}%` }}
              onPointerDown={e => {
                e.stopPropagation();
                catchUrchin(u);
              }}
              aria-label="성게 치우기"
            >
              <img src={SEA_IMAGES.urchin} alt="" draggable={false} />
            </button>
          ))}
        {phase === 'grow' && <div className="sg-timer">⏱ {Math.ceil(growLeft.current)}초 · 성게 {caught.current}마리 치움</div>}

        {phase === 'ready2' && (
          <div className="sg-overlay">
            <div className="sg-card">
              <div className="sg-card-urchin">
                <img src={SEA_IMAGES.urchin} alt="" draggable={false} />
              </div>
              <b>바닷말을 지켜라!</b>
              <p>
                어초에 바닷말이 자라기 시작했어요. 그런데 바닷말을 갉아먹는 <b>성게</b>가 몰려와요!
                <br />
                {GROW_SECONDS}초 동안 성게를 눌러 치워 바다 숲을 키우세요.
              </p>
              <button type="button" className="big green" onClick={startGrow}>
                시작! 🌿
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <b className="font-display text-stone-800">
            {phase === 'drop' || phase === 'ready2' ? `인공 어초 ${placedCount} / 6` : `무성한 바다 숲 ${fullCount} / 6`} · 이산화 탄소 흡수 게이지
          </b>
          <span className="font-display text-sm text-stone-700">{Math.round(gauge)}%</span>
        </div>
        <div className="meter">
          <i style={{ width: `${gauge}%` }} />
        </div>
      </div>

      {phase === 'done' && (
        <div className="flex justify-center mt-4">
          <button className="big" type="button" onClick={onFinish}>
            바다 숲 복원 완료! 다음으로
          </button>
        </div>
      )}
    </div>
  );
}
