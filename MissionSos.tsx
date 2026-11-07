import React, { useState } from 'react';
import { sfx } from '../../audio';
import { SOS_MAP_IMAGE } from '../../assets';

interface PinData {
  name: string;
  x: number;
  y: number;
  a: string;
  sos: string;
}

const PINS: PinData[] = [
  { name: '해바라기 마을', x: 18, y: 31, a: '폭염', sos: '기온이 평년보다 훨씬 높은 날이 여러 날 이어져요. 할머니께서 더위를 먹어 병원에 가셨어요.' },
  { name: '자작나무 마을', x: 52, y: 25, a: '한파', sos: '기온이 갑자기 뚝 떨어져서 수도관이 얼어 터졌어요!' },
  { name: '강변 마을', x: 78, y: 38, a: '홍수', sos: '짧은 시간 동안 비가 너무 많이 내려서 마을 길이 물에 잠겼어요.' },
  { name: '산골 마을', x: 27, y: 70, a: '폭설', sos: '하룻밤 사이에 눈이 무릎까지 쌓여서 자동차가 다니지 못해요.' },
  { name: '들판 마을', x: 68, y: 66, a: '가뭄', sos: '비가 오랫동안 내리지 않아서 논밭이 갈라지고 마실 물도 부족해요.' }
];

const OPTIONS = ['폭염', '한파', '홍수', '폭설', '가뭄'];

export function MissionSos({
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
  const [solved, setSolved] = useState<Record<number, boolean>>({});
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleSelectPin = (idx: number) => {
    if (solved[idx]) return;
    sfx.tick();
    setSelectedIdx(idx);
    onReact('villager', PINS[idx].sos, 'sad');
  };

  const handleAnswer = (choice: string) => {
    if (selectedIdx === null) return;
    const pin = PINS[selectedIdx];
    if (choice === pin.a) {
      onCorrect();
      const newSolved = { ...solved, [selectedIdx]: true };
      setSolved(newSolved);
      setSelectedIdx(null);
      const solvedCount = Object.keys(newSolved).length;
      onReact(
        'thermo',
        `삐빅! 정답, ${pin.a}이야. ${
          solvedCount < PINS.length ? `남은 신호는 ${PINS.length - solvedCount}곳!` : '모든 신호를 해결했어!'
        }`,
        'happy'
      );
      if (solvedCount === PINS.length) {
        setTimeout(onFinish, 1400);
      }
    } else {
      onWrong();
      onReact('luka', '앗, 아닌 것 같아! 주민의 말을 다시 꼼꼼히 읽어 봐.', 'o');
    }
  };

  return (
    <div className="panel max-w-3xl">
      <h2>
        <span className="tag">미션 1-2</span>
        세계 이상 신호 출동
      </h2>
      <p className="guide">
        빨간 신호를 눌러 주민의 SOS를 읽고, 어떤 기후변화 현상인지 골라요. ({Object.keys(solved).length} / {PINS.length})
      </p>

      <div className="mapwrap sos-map">
        <img src={SOS_MAP_IMAGE} alt="이상 기후를 겪는 다섯 마을 지도" draggable={false} />

        {PINS.map((pin, i) => (
          <button
            key={i}
            className={`pin ${solved[i] ? 'done' : ''}`}
            type="button"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            onClick={() => handleSelectPin(i)}
          >
            <i />
            <span>{pin.name}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 min-h-[90px]">
        {selectedIdx !== null ? (
          <div>
            <div className="note mb-2">
              <b>{PINS[selectedIdx].name}</b> "{PINS[selectedIdx].sos}"
            </div>
            <div className="flex gap-2 flex-wrap">
              {OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  className="opt flex-1 text-center"
                  onClick={() => handleAnswer(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="note text-stone-500 text-center">
            지도의 빨간 신호 핀을 눌러 주민의 구조 요청을 확인하세요!
          </div>
        )}
      </div>
    </div>
  );
}
