import React, { useState } from 'react';
import { npcSVG } from '../../svgs';

interface CouncilItem {
  who: string;
  c: string;
  say: string;
  a: string;
}

const ITEMS: CouncilItem[] = [
  {
    who: '초록 나라 대표',
    c: '#3aa65a',
    say: '여러 나라가 힘을 모아 아프리카 사막 지역에 거대한 숲의 장벽을 만들고 있어요.',
    a: '국제 협력 (녹색 장벽)'
  },
  {
    who: '파랑 나라 대표',
    c: '#3a9be6',
    say: '우리나라는 숲과 갯벌을 함부로 개발하지 않고 보존하여 이산화 탄소를 흡수하고 있어요.',
    a: '자연환경 보존'
  },
  {
    who: '노랑 나라 대표',
    c: '#e8a21c',
    say: '에너지를 적게 쓰는 새로운 친환경 기계와 신재생 에너지를 열심히 연구하고 있어요.',
    a: '친환경 기술 개발'
  },
  {
    who: '분홍 나라 대표',
    c: '#d77fa1',
    say: '폭염과 홍수가 찾아와도 사람들이 안전하게 지낼 수 있도록 시설을 미리 대비하고 있어요.',
    a: '기후변화에 적응할 수 있도록 대비'
  }
];

const LABELS = [
  '국제 협력 (녹색 장벽)',
  '자연환경 보존',
  '친환경 기술 개발',
  '기후변화에 적응할 수 있도록 대비'
];

export function MissionCouncil({
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
  const [curIdx, setCurIdx] = useState(0);
  const currentItem = ITEMS[curIdx];

  const handleChoice = (chosen: string) => {
    if (chosen === currentItem.a) {
      onCorrect();
      onReact('rep', '정답입니다! 각국이 힘을 모아 기후변화에 적극 대응해야 합니다.', 'smile');
      if (curIdx < ITEMS.length - 1) {
        setTimeout(() => setCurIdx(curIdx + 1), 900);
      } else {
        setTimeout(onFinish, 1400);
      }
    } else {
      onWrong();
      onReact('thermo', '삐빅! 각국 대표의 발표 내용을 다시 읽어 봐.', 'alert');
    }
  };

  return (
    <div className="panel max-w-2xl">
      <h2>
        <span className="tag">미션 3-3</span>
        세계 구조대 연합 회의 ({curIdx + 1} / {ITEMS.length})
      </h2>
      <p className="guide">
        각국 대표의 발표를 읽고 알맞은 기후변화 대응 방법 이름표를 붙이세요.
      </p>

      <div className="flex gap-4 items-center my-3 p-3 bg-purple-50 rounded-2xl border-2 border-amber-950">
        <div
          className="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-amber-950 bg-white"
          dangerouslySetInnerHTML={{
            __html: npcSVG({ suit: currentItem.c, suit2: currentItem.c })
          }}
        />
        <div className="note flex-1">
          <b>{currentItem.who}</b> "{currentItem.say}"
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
        {LABELS.map(label => (
          <button
            key={label}
            type="button"
            className="opt text-center font-bold"
            onClick={() => handleChoice(label)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
