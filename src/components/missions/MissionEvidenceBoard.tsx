import React from 'react';

export function MissionEvidenceBoard({
  evidences,
  onCorrect,
  onWrong,
  onFinish,
  onReact
}: {
  evidences: string[];
  onCorrect: () => void;
  onWrong: () => void;
  onFinish: () => void;
  onReact: (who: any, text: string, mood?: any) => void;
}) {
  const options = [
    '정체불명의 그림자',
    '갑자기 뜨거워진 태양',
    '편리한 생활을 위해 늘어난 사람들의 활동'
  ];

  const handleChoice = (opt: string) => {
    if (opt === '편리한 생활을 위해 늘어난 사람들의 활동') {
      onCorrect();
      onReact('danbi', '정확해! 공장, 자동차, 전기 낭비, 산림 훼손… 범인은 바로 우리들의 활동이었어.', 'smile');
      setTimeout(onFinish, 1400);
    } else {
      onWrong();
      onReact('thermo', '삐빅! 수사로 모은 증거 카드 5개를 다시 읽어 봐. 모두 사람들이 한 일이야.', 'alert');
    }
  };

  return (
    <div className="panel max-w-2xl">
      <h2>
        <span className="tag">미션 2-2</span>
        증거 보드 분석
      </h2>
      <p className="guide">
        다섯 장소에서 모은 증거들을 연결해 빙하를 녹인 진짜 범인을 밝혀내세요.
      </p>

      <div className="evid mb-4">
        {evidences.map((e, i) => (
          <span key={i} className="e">
            증거 {i + 1}: {e}
          </span>
        ))}
      </div>

      <div className="mt-3">
        <p className="text-xl font-bold mb-3 text-stone-900">
          Q. 증거 다섯 개가 가리키는 기후변화의 범인은 누구일까요?
        </p>
        <div className="grid gap-2">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              className="opt text-left font-bold"
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
