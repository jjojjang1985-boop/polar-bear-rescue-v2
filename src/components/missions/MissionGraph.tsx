import React, { useState } from 'react';
import { OL } from '../../svgs';

const vals = [7.7, 10.4, 11.1, 14];
const labels = ['1984~1993', '1994~2003', '2004~2013', '2014~2023'];

export function MissionGraph({
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
  const [step, setStep] = useState(0);

  const questions = [
    {
      q: '시간이 지날수록 폭염 일수는 어떻게 변했나요?',
      opts: ['줄었다', '비슷하다', '늘었다'],
      a: '늘었다',
      reactOk: '삐빅! 맞아. 폭염이 점점 잦아지고 있어.'
    },
    {
      q: '가장 최근 막대(14일)는 가장 오래된 막대(7.7일)의 약 몇 배인가요?',
      opts: ['약 2배', '약 5배', '약 10배'],
      a: '약 2배',
      reactOk: '40년 만에 두 배나 늘었어! 포리가 있는 북극도 그래서 더워진 거구나.'
    }
  ];

  const currentQ = questions[step];

  const handleChoice = (opt: string) => {
    if (opt === currentQ.a) {
      onCorrect();
      onReact(step === 0 ? 'thermo' : 'luka', currentQ.reactOk, 'happy');
      if (step < questions.length - 1) {
        setTimeout(() => setStep(step + 1), 900);
      } else {
        setTimeout(onFinish, 1200);
      }
    } else {
      onWrong();
      onReact('thermo', '삐빅! 막대의 높이가 어떻게 변하는지 다시 살펴봐.', 'alert');
    }
  };

  return (
    <div className="panel max-w-2xl">
      <h2>
        <span className="tag">미션 1-3</span>
        써모의 그래프 판독
      </h2>
      <p className="guide">
        우리나라 폭염 일수 막대그래프를 자세히 살펴보고 질문에 답하세요.
      </p>

      <svg viewBox="0 0 700 290" width="100%" className="max-h-[260px] bg-white border-2 border-amber-950 rounded-2xl p-2 my-2">
        <g stroke="#eadfcf" strokeWidth="2">
          {[4, 8, 12, 16].map(t => (
            <line
              key={t}
              x1="60"
              x2="680"
              y1={240 - (t / 16) * 200}
              y2={240 - (t / 16) * 200}
            />
          ))}
        </g>
        <g fontSize="14" fill="#9a7a60" textAnchor="end">
          {[0, 4, 8, 12, 16].map(t => (
            <text key={t} x="52" y={245 - (t / 16) * 200}>
              {t}
            </text>
          ))}
        </g>
        <line x1="60" x2="680" y1="240" y2="240" stroke={OL} strokeWidth="3" />
        {vals.map((v, i) => {
          const h = (v / 16) * 200;
          const x = 90 + i * 150;
          return (
            <g key={i}>
              <rect
                x={x}
                y={240 - h}
                width="90"
                height={h}
                rx="10"
                fill={i === 3 ? '#f2735a' : '#ffb36b'}
                stroke={OL}
                strokeWidth="4"
              />
              <text
                x={x + 45}
                y={232 - h}
                textAnchor="middle"
                fontFamily="Jua"
                fontSize="22"
                fill={OL}
              >
                {v}일
              </text>
              <text
                x={x + 45}
                y="268"
                textAnchor="middle"
                fontSize="15"
                fontWeight="700"
                fill="#6b4a33"
              >
                {labels[i]}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-xs text-stone-600 mb-3">
        우리나라 폭염 일수(연평균, 일) · 자료: 기상청 기상자료개방포털(교과서 89쪽)
      </p>

      <div className="mt-2">
        <p className="text-lg font-bold mb-3">{currentQ.q}</p>
        <div className="flex gap-2 flex-wrap">
          {currentQ.opts.map(opt => (
            <button
              key={opt}
              type="button"
              className="opt flex-1 text-center"
              onClick={() => handleChoice(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
