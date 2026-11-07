import React, { useMemo, useState } from 'react';
import { shuffle } from '../../shuffle';
import type { QuizItem } from '../../types';

export function QuizComponent({
  items,
  onCorrect,
  onWrong,
  onFinish,
  onReact
}: {
  items: QuizItem[];
  onCorrect: () => void;
  onWrong: () => void;
  onFinish: () => void;
  onReact: (who: any, text: string, mood?: any) => void;
}) {
  const [qIdx, setQIdx] = useState(0);
  const cur = items[qIdx];
  const opts = useMemo(() => shuffle(cur.opts), [qIdx, items]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleChoice = (opt: string) => {
    if (selectedAnswer !== null) return;

    if (opt === cur.a) {
      setSelectedAnswer(opt);
      onCorrect();
      onReact('thermo', '삐빅! 정답! 단서 수첩의 내용을 완벽하게 기억했어.', 'happy');

      setTimeout(() => {
        setSelectedAnswer(null);
        if (qIdx < items.length - 1) {
          setQIdx(qIdx + 1);
        } else {
          onFinish();
        }
      }, 1000);
    } else {
      onWrong();
      onReact('luka', '아깝다! 초성 힌트를 다시 한번 확인해 봐.', 'o');
    }
  };

  const questionParts = cur.q.split('( )');

  return (
    <div className="panel max-w-2xl">
      <h2>
        <span className="tag">확인 퀴즈</span>
        빈칸을 채워라! ({qIdx + 1} / {items.length})
      </h2>
      {cur.hint && (
        <p className="guide text-amber-900">
          초성 힌트: <b className="text-coral font-display text-lg">{cur.hint}</b>
        </p>
      )}

      <div className="note my-4 text-xl font-bold leading-relaxed">
        {questionParts[0]}
        <span className="inline-block min-w-[90px] border-b-4 border-amber-950 text-center text-rose-700 px-2 mx-1">
          {selectedAnswer || '?'}
        </span>
        {questionParts[1]}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        {opts.map(opt => (
          <button
            key={opt}
            type="button"
            className="opt text-center font-bold p-3 text-lg"
            onClick={() => handleChoice(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
