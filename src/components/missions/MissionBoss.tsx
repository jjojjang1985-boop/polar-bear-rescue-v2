import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ATTACKS, DEFAULT_SKILLS, SKILLS, STAGE_PICKS, type Attack } from '../../skills';
import { SHADOW_IMAGE } from '../../assets';
import { cue } from '../../audio';
import { shuffle } from '../../shuffle';
import { SkillArt } from '../Skills';

const BOSS_HP = 6;

type Phase = 'incoming' | 'choose' | 'hit' | 'brace' | 'miss' | 'won';

/** 어느 작전에서 고를 수 있었던 기술인지 */
const stageOf = (id: string) =>
  Number(Object.keys(STAGE_PICKS).find(k => STAGE_PICKS[Number(k)].includes(id)) || 0);

export function MissionBoss({
  owned,
  onHeal,
  onCorrect,
  onWrong,
  onFinish,
  onReact
}: {
  owned: string[];
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
      cue.skillHit();
      onCorrect();
      const nextHp = hp - 1;
      setHp(nextHp);
      const sk = SKILLS[choice];
      onReact('thermo', `삐빅! ${sk.ic} ${sk.name} 명중! ${attack.why}`, 'happy');
      if (nextHp <= 0) {
        later(() => {
          setPhase('won');
          cue.bossDefeat();
        }, 900);
        later(onFinish, 3600);
      } else {
        later(() => nextTurn(rest), 1700);
      }
      return;
    }

    // 2) 막을 기술이 없는 공격에 버티기: 피해 1
    if (choice === 'brace' && !blockable) {
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
      `크윽, 큰 피해야! 이 공격을 막을 기술은 없었어. 그럴 땐 🧱 버티기! (${counterText(attack)}로 막을 수 있어)`,
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
        : '🥽 간파! 이 공격을 막을 기술이 없어. 🧱 버티기를 골라!'
    );
  };

  const hintTarget = (id: string) =>
    !!hintMsg && !!attack && (id === 'brace' ? !canBlock(attack) : attack.counters.includes(id));

  return (
    <div className="panel boss-panel max-w-3xl">
      <h2>
        <span className="tag">최종 결전</span>
        탄소 대마왕을 막아라!
      </h2>

      <div className={`boss-arena phase-${phase}`}>
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
          {phase === 'won' && (
            <div className="boss-scatter">
              {Array.from({ length: 16 }, (_, i) => (
                <span
                  key={i}
                  style={{
                    ['--dx' as string]: `${Math.cos((i / 16) * 6.28) * 180}px`,
                    ['--dy' as string]: `${Math.sin((i / 16) * 6.28) * 110}px`
                  }}
                >
                  {['🧒', '👧', '🧑', '👦'][i % 4]}
                </span>
              ))}
            </div>
          )}
        </div>

        {attack && phase !== 'won' && (
          <div key={turn} className="boss-attack">
            <span className="em">{attack.em}</span>
            <span className="nm">{attack.name}!</span>
          </div>
        )}

        {phase === 'hit' && picked && (
          <div className="skill-blast">
            <SkillArt id={picked} />
          </div>
        )}
        {phase === 'brace' && <div className="brace-shield">🧱</div>}
        {(phase === 'miss' || phase === 'brace') && <div className={`attack-hit ${phase === 'brace' ? 'soft' : ''}`} />}
        {phase === 'won' && <div className="boss-won">승리! 🎉</div>}
      </div>

      {phase !== 'won' && (
        <>
          <div className="boss-timer" aria-hidden="true">
            <i
              style={{ width: `${phase === 'choose' ? (timeLeft / turnSeconds) * 100 : 100}%` }}
              className={timeLeft <= 5 ? 'low' : ''}
            />
          </div>
          <p className="guide boss-guide">
            {hintMsg ??
              (phase === 'incoming' ? '공격이 날아온다…!' : `내 기술로 막을 수 있을까? (${timeLeft}초)`)}
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
              className={`skill-card brace ${hintTarget('brace') ? 'hint' : ''} ${picked === 'brace' ? 'ok' : ''}`}
              disabled={phase !== 'choose'}
              onClick={() => resolve('brace')}
            >
              <span className="skill-art">
                <span className="skill-emoji">🧱</span>
              </span>
              <span className="nm">
                버티기
                <small>막을 기술이 없을 때</small>
              </span>
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
