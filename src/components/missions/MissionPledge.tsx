import React, { useState } from 'react';
import { sfx } from '../../audio';

const PLEDGE_OPTIONS = [
  '가까운 거리는 걸어 다니기',
  '빈방 불 끄기',
  '텀블러 쓰기',
  '급식 남기지 않기',
  '분리배출하기',
  '물 아껴 쓰기',
  '필요 없는 물건 사지 않기',
  '가족에게 기후변화 알리기'
];

export function MissionPledge({
  onFinish
}: {
  onFinish: (pledges: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const togglePledge = (item: string) => {
    sfx.tick();
    if (selected.includes(item)) {
      setSelected(selected.filter(x => x !== item));
    } else if (selected.length < 3) {
      setSelected([...selected, item]);
    }
  };

  const handleConfirm = () => {
    sfx.win();
    onFinish(selected);
  };

  return (
    <div className="panel max-w-2xl">
      <h2>
        <span className="tag">실천 약속</span>
        일주일 실천 목표 정하기
      </h2>
      <p className="guide">
        일주일 동안 지킬 실천 목표 3가지를 고르세요. 정식 임명장에 자랑스럽게 기록돼요! ({selected.length} / 3)
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-4">
        {PLEDGE_OPTIONS.map(opt => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              className={`opt text-left font-bold p-3 ${isSelected ? 'ok' : ''}`}
              onClick={() => togglePledge(opt)}
            >
              <span className="mr-2">{isSelected ? '✅' : '⬜'}</span>
              {opt}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center mt-3">
        <button
          className="big"
          type="button"
          disabled={selected.length !== 3}
          onClick={handleConfirm}
        >
          약속하기 ({selected.length}/3)
        </button>
      </div>
    </div>
  );
}
