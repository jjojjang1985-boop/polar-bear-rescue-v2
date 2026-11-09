import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ATTACKS, DEFAULT_SKILLS, SKILLS, STAGE_PICKS, type Attack } from '../../skills';
import { CAST_IMAGES, SHADOW_IMAGE } from '../../assets';
import type { AvatarType } from '../../types';
import { cue } from '../../audio';
import { shuffle } from '../../shuffle';
import { SkillArt } from '../Skills';
import confetti from 'canvas-confetti';
import { createPortal } from 'react-dom';

/** 기술별 적중 효과 색과 흩어지는 조각 */
const IMPACT: Record<string, { c1: string; c2: string; bits: string[] }> = {
  saver: { c1: '#fff36b', c2: '#ffb700', bits: ['⚡', '✦', '🔌'] },
  bike: { c1: '#b8ffcf', c2: '#2fbf71', bits: ['💨', '🍃', '✦'] },
  guard: { c1: '#d9ffb8', c2: '#4caf50', bits: ['🍃', '🌿', '✦'] },
  tree: { c1: '#c8ff9e', c2: '#3aa65a', bits: ['🌱', '🍃', '🌳'] },
  seaforest: { c1: '#a8f0ff', c2: '#1e88e5', bits: ['🫧', '🐟', '🌊'] },
  solar: { c1: '#fff7c2', c2: '#ff9f1c', bits: ['☀️', '✦', '✨'] },
  recycle: { c1: '#c9ffd8', c2: '#20a060', bits: ['♻️', '✦', '🍃'] },
  bag: { c1: '#ffe6c2', c2: '#e07a2f', bits: ['🛍️', '✦', '✨'] },
  plate: { c1: '#ffffff', c2: '#d4a017', bits: ['✨', '✦', '🍽️'] }
};
const DEF_IMPACT = { c1: '#ffffff', c2: '#7fd3ff', bits: ['✦', '✨'] };

const BOSS_HP = 6;
/** 기술을 쓰기 전 내 캐릭터가 힘을 모으는 시간 */
const CHARGE_MS = 900;
/** 버티기 횟수 (2연속 명중마다 1회 충전) */
const BRACE_MAX = 3;

type Phase = 'incoming' | 'strike' | 'choose' | 'hit' | 'brace' | 'miss' | 'dying' | 'won' | 'victory';

/** 어느 작전에서 고를 수 있었던 기술인지 */
const stageOf = (id: string) =>
  Number(Object.keys(STAGE_PICKS).find(k => STAGE_PICKS[Number(k)].includes(id)) || 0);

export function MissionBoss({
  owned,
  avatar = 'a',
  onHeal,
  onCorrect,
  onWrong,
  onFinish,
  onReact
}: {
  owned: string[];
  avatar?: AvatarType;
  onHeal: (n: number) => void;
  onCorrect: () => void;
  onWrong: () => void;
  onFinish: () => void;
  onReact: (who: any, text: string, mood?: any) => void;
}) {
  // 고른 기술이 하나도 없으면(선생님 모드로 바로 들어온 경우) 기본 기술로 싸운다
  const skills = useMemo(() => {
    const mine = owned.filter(id => SKILLS[id]?.kind === 'battle' || SKILLS[id]?.kind === 'utility');
    return mine.some(id => SKILLS[id].kind === 'battle') ? mine : DEFAULT_SKILLS;
  }, []);
  const battleSkills = skills.filter(id => SKILLS[id].kind === 'battle');
  const hasGoggle = skills.includes('goggle');
  const turnSeconds = skills.includes('clock') ? 25 : 15;

  const canBlock = (a: Attack) => a.counters.some(c => battleSkills.includes(c));

  // 막을 수 있는 공격이 더 자주 나오도록 두 번씩 넣어 섞는다
  const makeQueue = () => shuffle(ATTACKS.flatMap(a => (canBlock(a) ? [a, a] : [a])));

  const [queue, setQueue] = useState<Attack[]>(makeQueue);
  const [hp, setHp] = useState(BOSS_HP);
  const [phase, setPhase] = useState<Phase>('incoming');
  const [timeLeft, setTimeLeft] = useState(turnSeconds);
  const [hints, setHints] = useState(hasGoggle ? 3 : 0);
  const [hintMsg, setHintMsg] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [turn, setTurn] = useState(0);
  const [combo, setCombo] = useState(0);
  const [braces, setBraces] = useState(BRACE_MAX);
  const [braceGain, setBraceGain] = useState(0);
  const [stats, setStats] = useState({ blocked: 0, bestCombo: 0, damage: 0, used: {} as Record<string, number> });
  const timers = useRef<number[]>([]);

  const attack = queue[0];

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => {
    if (skills.includes('heal')) {
      onHeal(4);
      onReact('thermo', '삐빅! 🧊 빙하 회복 마법 발동! 빙하 탑이 4칸 더 단단해졌어.', 'happy');
    }
    if (skills === DEFAULT_SKILLS) {
      onReact('thermo', '삐빅! 고른 기술이 없어서 기본 기술로 싸울게. (선생님 모드)', 'alert');
    }
    return () => timers.current.forEach(t => window.clearTimeout(t));
  }, []);

  // 새 공격이 날아온다
  useEffect(() => {
    if (phase !== 'incoming') return;
    cue.bossAttack();
    setPicked(null);
    setHintMsg(null);
    setTimeLeft(turnSeconds);
    // 막을 기술도 버티기도 없으면 기다리지 않고 대마왕이 바로 공격한다
    if (attack && !canBlock(attack) && braces <= 0) {
      const a = attack;
      const rest = queue.slice(1);
      later(() => {
        setPhase('strike');
        cue.bossRise();
      }, 900);
      later(() => {
        setPhase('miss');
        cue.bossHurtsYou();
        takeDamage(2);
        onReact(
          'luka',
          `으악, 막을 기술도 버티기도 없어서 그대로 맞았어! 2연속 명중으로 버티기를 충전해 둬. (${a.name}은 ${counterText(a)}로 막을 수 있어)`,
          'o'
        );
      }, 2200);
      later(() => nextTurn(rest), 3600);
      return;
    }
    later(() => setPhase('choose'), 1100);
  }, [phase, turn]);

  // 제한 시간
  useEffect(() => {
    if (phase !== 'choose') return;
    if (timeLeft <= 0) {
      resolve('timeout');
      return;
    }
    const t = window.setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, timeLeft]);

  const nextTurn = (q: Attack[]) => {
    setQueue(q.length ? q : makeQueue());
    setTurn(t => t + 1);
    setPhase('incoming');
  };

  /** 이 공격을 막을 수 있었던 기술 설명 */
  const counterText = (a: Attack) =>
    a.counters.map(c => `${SKILLS[c].ic} ${SKILLS[c].name}(작전 ${stageOf(c)})`).join(' 또는 ');

  const takeDamage = (n: number) => {
    setCombo(0);
    setStats(st => ({ ...st, damage: st.damage + n }));
    for (let i = 0; i < n; i++) later(onWrong, i * 350);
  };

  const resolve = (choice: string) => {
    if (phase !== 'choose' || !attack) return;
    setPicked(choice);
    const rest = queue.slice(1);
    const blockable = canBlock(attack);

    // 1) 알맞은 기술로 막음
    if (attack.counters.includes(choice)) {
      setPhase('hit');
      cue.charge();
      later(() => cue.skillHit(), CHARGE_MS);
      later(() => cue.impact(), CHARGE_MS + 330);
      onCorrect();
      const nextHp = hp - 1;
      setHp(nextHp);
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo % 2 === 0 && braces < BRACE_MAX) {
        setBraces(b => Math.min(BRACE_MAX, b + 1));
        later(() => setBraceGain(g => g + 1), CHARGE_MS + 600);
      }
      setStats(st => ({
        ...st,
        blocked: st.blocked + 1,
        bestCombo: Math.max(st.bestCombo, nextCombo),
        used: { ...st.used, [choice]: (st.used[choice] || 0) + 1 }
      }));
      const sk = SKILLS[choice];
      onReact('thermo', `삐빅! ${sk.ic} ${sk.name} 명중! ${attack.why}`, 'happy');
      if (nextHp <= 0) {
        // 쓰러지는 연출 → 흩어짐 → 승리 화면
        later(() => {
          setPhase('dying');
          cue.bossCrumble();
        }, CHARGE_MS + 1500);
        later(() => {
          setPhase('won');
          cue.bossDefeat();
        }, CHARGE_MS + 3700);
        later(() => {
          setPhase('victory');
          const burst = (x: number) =>
            confetti({ particleCount: 90, spread: 75, startVelocity: 45, origin: { x, y: 0.7 }, colors: ['#ffd84d', '#7fd3ff', '#7be6b0', '#ffffff', '#f2735a'] });
          burst(0.2);
          burst(0.8);
          later(() => burst(0.5), 500);
          later(() => burst(0.3), 1100);
          later(() => burst(0.7), 1500);
        }, CHARGE_MS + 5200);
      } else {
        later(() => nextTurn(rest), CHARGE_MS + 1700);
      }
      return;
    }

    // 2) 막을 기술이 없는 공격에 버티기: 피해 1
    const braceOk = choice === 'brace' && braces > 0;
    if (choice === 'brace' && braces > 0) setBraces(b => b - 1);
    if (braceOk && !blockable) {
      setPhase('brace');
      cue.bossHurtsYou();
      takeDamage(1);
      onReact(
        'danbi',
        `잘 판단했어! 막을 기술이 없을 땐 버티는 게 최선이야. 이 공격은 ${counterText(attack)}로 막을 수 있었어.`,
        'serious'
      );
      later(() => nextTurn(rest), 2000);
      return;
    }

    // 3) 막을 수 있었는데 놓침: 피해 1, 같은 공격이 나중에 다시 나온다
    if (blockable) {
      setPhase('miss');
      cue.bossHurtsYou();
      takeDamage(1);
      const mine = attack.counters.filter(c => battleSkills.includes(c)).map(c => `${SKILLS[c].ic} ${SKILLS[c].name}`);
      onReact(
        'luka',
        `${choice === 'timeout' ? '시간이 다 됐어!' : '으악, 막지 못했어!'} ${attack.name}에는 네가 가진 ${mine.join(', ')}! ${attack.why}`,
        'o'
      );
      later(() => nextTurn([...rest, attack]), 1900);
      return;
    }

    // 4) 막을 기술이 없는데 다른 기술을 쓰거나 시간이 지남: 피해 2
    setPhase('miss');
    cue.bossHurtsYou();
    takeDamage(2);
    onReact(
      'luka',
      `크윽, 큰 피해야! 이 공격을 막을 기술은 없었어. ${braces > 0 ? '그럴 땐 🧱 버티기!' : '버티기를 다 써서 막을 수 없었어. 2연속 명중으로 버티기를 충전해!'} (${counterText(attack)}로 막을 수 있어)`,
      'o'
    );
    later(() => nextTurn(rest), 2100);
  };

  const useHint = () => {
    if (phase !== 'choose' || hints <= 0 || hintMsg || !attack) return;
    cue.goggle();
    setHints(h => h - 1);
    setHintMsg(
      canBlock(attack)
        ? '🥽 간파! 이 공격은 막을 수 있어. 반짝이는 기술을 써!'
        : braces > 0
          ? '🥽 간파! 이 공격을 막을 기술이 없어. 🧱 버티기를 골라!'
          : '🥽 간파! 이 공격은 막을 수 없어… 버티기도 다 썼으니 이번엔 견뎌야 해!'
    );
  };

  const hintTarget = (id: string) =>
    !!hintMsg && !!attack && (id === 'brace' ? !canBlock(attack) && braces > 0 : attack.counters.includes(id));

  return (
    <div className="panel boss-panel max-w-3xl">
      <h2>
        <span className="tag">최종 결전</span>
        탄소 대마왕을 막아라!
      </h2>

      <div className={`boss-arena phase-${phase} ${phase === 'hit' ? 'shake-hard' : ''}`}>
        <div className="boss-hp" aria-label={`탄소 대마왕 체력 ${hp} / ${BOSS_HP}`}>
          <span className="boss-hp-label">탄소 대마왕</span>
          <div className="boss-hp-bar">
            <i style={{ width: `${(hp / BOSS_HP) * 100}%` }} />
          </div>
          <span className="boss-hp-num">
            {hp} / {BOSS_HP}
          </span>
        </div>

        <div className="boss-fig">
          <img src={SHADOW_IMAGE} alt="탄소 대마왕" draggable={false} />
          {Array.from({ length: 6 }, (_, i) => (
            <b key={i} className="co2" style={{ left: `${10 + i * 15}%`, animationDelay: `${i * 0.45}s` }}>
              CO₂
            </b>
          ))}
          {(phase === 'won' || phase === 'victory') && (
            <div className="boss-scatter">
              {Array.from({ length: 14 }, (_, i) => {
                const a = (i / 14) * Math.PI * 2;
                return (
                  <span
                    key={`p${i}`}
                    className="light-person"
                    style={{
                      ['--dx' as string]: `${Math.cos(a) * 170}px`,
                      ['--dy' as string]: `${Math.sin(a) * 105}px`,
                      animationDelay: `${(i % 4) * 0.06}s`
                    }}
                  >
                    <svg viewBox="0 0 40 70" aria-hidden="true">
                      <circle cx="20" cy="12" r="10" />
                      <path d="M4 68 Q4 28 20 26 Q36 28 36 68 Z" />
                    </svg>
                  </span>
                );
              })}
              {Array.from({ length: 26 }, (_, i) => (
                <i
                  key={`m${i}`}
                  className={`light-mote ${i % 3 === 0 ? 'flake' : ''}`}
                  style={{
                    ['--dx' as string]: `${(((i * 53) % 100) - 50) * 4}px`,
                    animationDelay: `${0.2 + (i % 9) * 0.15}s`
                  }}
                >
                  {i % 3 === 0 ? '❄' : ''}
                </i>
              ))}
            </div>
          )}
        </div>

        {attack && !['dying', 'won', 'victory'].includes(phase) && (
          <div key={turn} className="boss-attack">
            <span className="em">{attack.em}</span>
            <span className="nm">{attack.name}!</span>
          </div>
        )}

        {phase === 'hit' && picked && createPortal(<SkillImpact key={`imp${turn}`} id={picked} combo={combo} avatar={avatar} />, document.body)}
        {phase === 'dying' && (
          <div className="boss-dying-fx">
            {Array.from({ length: 10 }, (_, i) => (
              <i key={i} style={{ transform: `rotate(${i * 36}deg)`, animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        )}
        {(phase === 'won' || phase === 'victory') && <div className="boss-whiteout" />}
        {phase === 'brace' && <div className="brace-shield">🧱</div>}
        {phase === 'strike' && attack && (
          <>
            <div className="boss-strike-banner">막을 방법이 없어!</div>
            <div className="boss-strike-shot" aria-hidden="true">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} style={{ ['--i' as any]: i }}>
                  {attack.em}
                </span>
              ))}
            </div>
          </>
        )}
        {(phase === 'miss' || phase === 'brace') && <div className={`attack-hit ${phase === 'brace' ? 'soft' : ''}`} />}

      </div>

      {(phase === 'dying' || phase === 'won') && createPortal(<BossDeathOverlay phase={phase} />, document.body)}
      {phase === 'victory' && createPortal(<VictoryScreen stats={stats} onNext={onFinish} />, document.body)}

      {!['dying', 'won', 'victory'].includes(phase) && (
        <>
          <div className="boss-timer" aria-hidden="true">
            <i
              style={{ width: `${phase === 'choose' ? (timeLeft / turnSeconds) * 100 : 100}%` }}
              className={timeLeft <= 5 ? 'low' : ''}
            />
          </div>
          <p className="guide boss-guide">
            {hintMsg ??
              (phase === 'incoming'
                ? '공격이 날아온다…!'
                : phase === 'strike' || (phase === 'miss' && braces <= 0 && attack && !canBlock(attack))
                  ? '막을 기술도, 버티기도 없어! 탄소 대마왕의 공격!'
                  : `내 기술로 막을 수 있을까? (${timeLeft}초)`)}
          </p>

          <div className="skill-grid">
            {battleSkills.map(id => {
              const sk = SKILLS[id];
              return (
                <button
                  key={id}
                  type="button"
                  className={`skill-card ${hintTarget(id) ? 'hint' : ''} ${
                    picked === id ? (attack?.counters.includes(id) ? 'ok' : 'no') : ''
                  }`}
                  disabled={phase !== 'choose'}
                  onClick={() => resolve(id)}
                >
                  <SkillArt id={id} className="skill-card-art" />
                  <span className="nm">{sk.name}</span>
                </button>
              );
            })}
            <button
              type="button"
              className={`skill-card brace ${hintTarget('brace') ? 'hint' : ''} ${picked === 'brace' ? 'ok' : ''} ${braces <= 0 ? 'empty' : ''}`}
              disabled={phase !== 'choose' || braces <= 0}
              onClick={() => resolve('brace')}
            >
              <span className="skill-art">
                <span className="skill-emoji">🧱</span>
              </span>
              <span className="nm">
                버티기
                <span className="brace-count" aria-label={`버티기 ${braces}번 남음`}>
                  {Array.from({ length: BRACE_MAX }, (_, i) => (
                    <i key={i} className={i < braces ? 'on' : ''} />
                  ))}
                </span>
                <small>{braces > 0 ? '막을 기술이 없을 때' : '2연속 명중하면 충전!'}</small>
              </span>
              {braceGain > 0 && (
                <b key={braceGain} className="brace-gain">
                  🧱 +1 충전!
                </b>
              )}
            </button>
          </div>

          <div className="boss-tools">
            {hasGoggle && (
              <button
                type="button"
                className="chip"
                disabled={phase !== 'choose' || hints <= 0 || !!hintMsg}
                onClick={useHint}
              >
                🥽 간파의 고글 ({hints}번 남음)
              </button>
            )}
            {skills.includes('clock') && <span className="boss-badge">⏳ 시간 멈춤: 25초</span>}
          </div>
        </>
      )}
    </div>
  );
}

/** 기술 적중: 날아가는 마법 → 폭발 → 충격파·빛줄기·조각 → 데미지 숫자 */
function SkillImpact({ id, combo, avatar }: { id: string; combo: number; avatar: AvatarType }) {
  const fx = IMPACT[id] || DEF_IMPACT;
  const [fired, setFired] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setFired(true), CHARGE_MS);
    return () => window.clearTimeout(t);
  }, []);
  const sk = SKILLS[id];
  const bits = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2 + Math.random() * 0.3;
        const d = 28 + Math.random() * 30;
        return {
          ch: fx.bits[i % fx.bits.length],
          dx: `${Math.cos(a) * d}vmax`,
          dy: `${Math.sin(a) * d * 0.8}vmax`,
          r: `${Math.random() * 360}deg`,
          delay: `${0.33 + Math.random() * 0.1}s`
        };
      }),
    [id]
  );
  return (
    <div className={`impact impact-full ${fired ? 'fired' : 'charging'}`} style={{ ['--c1' as string]: fx.c1, ['--c2' as string]: fx.c2 }}>
      <div className="imp-dim" />
      <div className="cast">
        <img className="cast-me" src={CAST_IMAGES[avatar] ?? CAST_IMAGES.a} alt="" draggable={false} />
        <div className="cast-hands">
          <div className="cast-aura" />
          <i className="cast-ring" />
          <i className="cast-ring c2" />
          {Array.from({ length: 16 }, (_, i) => (
            <b
              key={i}
              className="cast-mote"
              style={{ ['--a' as string]: `${i * 22.5}deg`, animationDelay: `${(i % 8) * 0.06}s` }}
            >
              {fx.bits[i % fx.bits.length]}
            </b>
          ))}
          <div className="cast-orb">
            <SkillArt id={id} />
          </div>
        </div>
        <div className="cast-shout">
          {sk?.ic} {sk?.name}!
        </div>
      </div>
      {fired && (
      <>
      <div className="imp-flash" />
      <div className="imp-speed" />
      <div className="imp-projectile">
        <SkillArt id={id} />
      </div>
      <div className="imp-core">
        <div className="imp-rays" />
        <i className="imp-ring" />
        <i className="imp-ring r2" />
        <i className="imp-ring r3" />
        <div className="imp-art">
          <SkillArt id={id} />
        </div>
        {bits.map((b, i) => (
          <span
            key={i}
            className="imp-bit"
            style={{ ['--dx' as string]: b.dx, ['--dy' as string]: b.dy, ['--r' as string]: b.r, animationDelay: b.delay }}
          >
            {b.ch}
          </span>
        ))}
      </div>
      <div className="imp-dmg">-1</div>
      <div className="imp-word">{combo >= 2 ? `${combo}연속 명중!` : '명중!'}</div>
      </>
      )}
    </div>
  );
}

/** 승리 축하 화면 */
function VictoryScreen({
  stats,
  onNext
}: {
  stats: { blocked: number; bestCombo: number; damage: number; used: Record<string, number> };
  onNext: () => void;
}) {
  const stars = stats.damage <= 1 ? 3 : stats.damage <= 4 ? 2 : 1;
  const used = Object.entries(stats.used).sort((a, b) => b[1] - a[1]);
  const mvp = used[0]?.[0];
  return (
    <div className="victory">
      <div className="victory-rays" />
      <div className="victory-card">
        <div className="victory-crown">🏆</div>
        <h3 className="victory-title">탄소 대마왕 격파!</h3>
        <p className="victory-sub">작은 실천이 모여 지구를 지켜 냈어요</p>
        <div className="victory-stars">
          {[0, 1, 2].map(i => (
            <span key={i} className={i < stars ? 'on' : ''} style={{ animationDelay: `${0.5 + i * 0.25}s` }}>
              ★
            </span>
          ))}
        </div>
        <div className="victory-stats">
          <div>
            <b>{stats.blocked}</b>
            <small>막아 낸 공격</small>
          </div>
          <div>
            <b>{stats.bestCombo}</b>
            <small>최고 연속 명중</small>
          </div>
          <div>
            <b>{stats.damage}</b>
            <small>받은 피해</small>
          </div>
        </div>
        {mvp && (
          <div className="victory-mvp">
            <SkillArt id={mvp} className="victory-mvp-art" />
            <div>
              <small>가장 활약한 기술</small>
              <b>
                {SKILLS[mvp].ic} {SKILLS[mvp].name}
              </b>
            </div>
          </div>
        )}
        {used.length > 1 && (
          <div className="victory-parade">
            {used.map(([sid], i) => (
              <span key={sid} style={{ animationDelay: `${1.2 + i * 0.15}s` }}>
                <SkillArt id={sid} />
              </span>
            ))}
          </div>
        )}
        <button type="button" className="big victory-btn" onClick={onNext}>
          포리에게 가기 ▶
        </button>
      </div>
    </div>
  );
}

/** 대마왕이 쓰러질 때 화면 전체를 덮는 연출 */
function BossDeathOverlay({ phase }: { phase: 'dying' | 'won' }) {
  return (
    <div className={`bdo bdo-${phase}`} aria-hidden="true">
      <div className="bdo-bg" />
      {phase === 'dying' && (
        <>
          <div className="bdo-rays">
            {Array.from({ length: 14 }, (_, i) => (
              <i key={i} style={{ transform: `rotate(${i * (360 / 14)}deg)`, animationDelay: `${(i % 7) * 0.13}s` }} />
            ))}
          </div>
          <img className="bdo-boss" src={SHADOW_IMAGE} alt="" draggable={false} />
          {Array.from({ length: 12 }, (_, i) => (
            <b
              key={i}
              className="bdo-co2"
              style={{
                ['--dx' as string]: `${Math.cos((i / 12) * Math.PI * 2) * 42}vmin`,
                ['--dy' as string]: `${Math.sin((i / 12) * Math.PI * 2) * 36}vmin`,
                animationDelay: `${0.3 + (i % 4) * 0.25}s`
              }}
            >
              CO₂
            </b>
          ))}
          <div className="bdo-word">크아아악…!</div>
        </>
      )}
      {phase === 'won' && (
        <>
          <div className="bdo-white" />
          <div className="bdo-burst" />
          {Array.from({ length: 22 }, (_, i) => {
            const a = (i / 22) * Math.PI * 2;
            return (
              <span
                key={`p${i}`}
                className="bdo-person"
                style={{
                  ['--dx' as string]: `${Math.cos(a) * (30 + (i % 3) * 8)}vmax`,
                  ['--dy' as string]: `${Math.sin(a) * (22 + (i % 3) * 6)}vmax`,
                  animationDelay: `${(i % 5) * 0.05}s`
                }}
              >
                <svg viewBox="0 0 40 70">
                  <circle cx="20" cy="12" r="10" />
                  <path d="M4 68 Q4 28 20 26 Q36 28 36 68 Z" />
                </svg>
              </span>
            );
          })}
          {Array.from({ length: 40 }, (_, i) => (
            <i
              key={`m${i}`}
              className={`bdo-mote ${i % 3 === 0 ? 'flake' : ''}`}
              style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 10) * 0.09}s` }}
            >
              {i % 3 === 0 ? '❄' : ''}
            </i>
          ))}
        </>
      )}
    </div>
  );
}
