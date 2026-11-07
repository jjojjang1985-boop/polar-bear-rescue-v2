import React from 'react';
import { SKILLS, STAGE_PICKS } from '../skills';
import { getSkillArt } from '../assets';
import { sfx } from '../audio';

/** 기술 그림 (그림이 아직 없으면 이모지) */
export function SkillArt({ id, className = '' }: { id: string; className?: string }) {
  const art = getSkillArt(id);
  const sk = SKILLS[id];
  return (
    <span className={`skill-art ${art ? 'has-img' : ''} ${className}`}>
      {art ? <img src={art} alt="" draggable={false} /> : <span className="skill-emoji">{sk?.ic ?? '✨'}</span>}
    </span>
  );
}

const KIND_LABEL: Record<string, string> = {
  utility: '보조 마법',
  battle: '전투 기술',
  item: '장비'
};

/** 작전이 끝날 때 후보 3개 중 하나를 고르는 창 */
export function SkillPickModal({ stage, onPick }: { stage: number; onPick: (id: string) => void }) {
  const options = STAGE_PICKS[stage] || [];
  const [chosen, setChosen] = React.useState<string | null>(null);
  const isUtility = options.every(id => SKILLS[id]?.kind === 'utility');

  return (
    <div className="modal-back">
      <div className="panel pick-panel">
        <h2 className="justify-center">✨ 작전 {stage} 성공! 기술 하나를 골라 익히세요</h2>
        <p className="guide text-center">
          {isUtility
            ? '보조 마법은 최종 결전을 도와줘요. 어떤 도움이 가장 필요할까요?'
            : '고르지 않은 기술로만 막을 수 있는 공격은 최종 결전에서 막을 수 없어요. 신중하게!'}
        </p>
        <div className="pick-grid">
          {options.map(id => {
            const sk = SKILLS[id];
            return (
              <button
                key={id}
                type="button"
                className={`pick-card ${chosen === id ? 'sel' : ''}`}
                onClick={() => {
                  sfx.tick();
                  setChosen(id);
                }}
              >
                <SkillArt id={id} className="pick-art" />
                <span className="pick-kind">{KIND_LABEL[sk.kind]}</span>
                <b className="pick-name">
                  {sk.ic} {sk.name}
                </b>
                <span className="pick-desc">{sk.desc}</span>
                {sk.blocks && (
                  <span className="pick-blocks">
                    <em>막는 공격</em> {sk.blocks}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex justify-center mt-4">
          <button className="big" type="button" disabled={!chosen} onClick={() => chosen && onPick(chosen)}>
            {chosen ? `${SKILLS[chosen].name} 익히기!` : '기술을 골라 주세요'}
          </button>
        </div>
      </div>
    </div>
  );
}

/** 지금까지 익힌 기술 보기 */
export function SkillBookModal({ owned, onClose }: { owned: string[]; onClose: () => void }) {
  const list = owned.filter(id => SKILLS[id]);
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="panel book-panel" onClick={e => e.stopPropagation()}>
        <h2 className="justify-center">📖 나의 기술 도감</h2>
        {list.length === 0 ? (
          <p className="guide text-center">아직 익힌 기술이 없어요. 작전을 성공하면 기술을 고를 수 있어요!</p>
        ) : (
          <div className="book-list">
            {list.map(id => {
              const sk = SKILLS[id];
              return (
                <div key={id} className="book-row">
                  <SkillArt id={id} className="book-art" />
                  <div>
                    <span className="pick-kind">{KIND_LABEL[sk.kind]}</span>
                    <b className="pick-name">
                      {sk.ic} {sk.name}
                    </b>
                    <span className="pick-desc">{sk.desc}</span>
                    {sk.blocks && (
                      <span className="pick-blocks">
                        <em>막는 공격</em> {sk.blocks}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex justify-center mt-4">
          <button className="big" type="button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
