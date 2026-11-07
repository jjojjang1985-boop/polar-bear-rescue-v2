import React, { useState, useEffect, useRef } from 'react';
import { sfx } from '../../audio';

interface ObjItem {
  em: string;
  x: number;
  y: number;
  label: string;
  bad?: number;
}

interface PlaceData {
  name: string;
  em: string;
  bg: string;
  who: any;
  evid: string;
  testimony: string;
  objs: ObjItem[];
}

const PLACES: PlaceData[] = [
  {
    name: '공장 지대',
    em: '🏭',
    bg: 'linear-gradient(#cfd8e6,#f6e3d3)',
    who: 'factory',
    evid: '산업 활동',
    testimony: '요즘 사람들이 물건을 아주 많이 사서, 공장을 밤낮없이 돌려요. 공장에서 많은 물건을 생산하고 또 소비하지요.',
    objs: [
      { em: '🏭', x: 28, y: 45, label: '굴뚝 연기', bad: 1 },
      { em: '📦', x: 70, y: 70, label: '쌓인 물건 더미', bad: 1 },
      { em: '🌼', x: 86, y: 28, label: '꽃' },
      { em: '🐦', x: 52, y: 20, label: '새' },
      { em: '🚲', x: 14, y: 80, label: '자전거' },
      { em: '🌲', x: 90, y: 74, label: '나무' }
    ]
  },
  {
    name: '숲',
    em: '🌳',
    bg: 'linear-gradient(#d8f5c4,#a8dc8a)',
    who: 'squirrel',
    evid: '산림 훼손',
    testimony: '여기 있던 나무를 다 베고 태워서, 땅을 개발한대요. 우리 집도 없어졌어요.',
    objs: [
      { em: '🪵', x: 34, y: 66, label: '베어 낸 나무 밑동', bad: 1 },
      { em: '🔥', x: 74, y: 48, label: '불탄 자리', bad: 1 },
      { em: '🌳', x: 14, y: 36, label: '나무' },
      { em: '🍄', x: 56, y: 82, label: '버섯' },
      { em: '🦋', x: 50, y: 22, label: '나비' },
      { em: '🌷', x: 88, y: 80, label: '꽃' }
    ]
  },
  {
    name: '도로와 공항',
    em: '🛣️',
    bg: 'linear-gradient(#c8e6ff,#d9d4cc)',
    who: 'police',
    evid: '교통수단 이용',
    testimony: '가까운 거리도 다들 자동차를 타서 길이 늘 막혀요. 비행기도 하루 종일 뜨고 내리고요.',
    objs: [
      { em: '🚗', x: 40, y: 74, label: '줄지은 자동차', bad: 1 },
      { em: '✈️', x: 72, y: 24, label: '비행기', bad: 1 },
      { em: '🚦', x: 14, y: 50, label: '신호등' },
      { em: '🚶', x: 86, y: 76, label: '걷는 사람' },
      { em: '🌳', x: 58, y: 52, label: '가로수' },
      { em: '🏪', x: 24, y: 24, label: '가게' }
    ]
  },
  {
    name: '우리 동네 집',
    em: '🏠',
    bg: 'linear-gradient(#fff1d6,#ffd9b0)',
    who: 'grandma',
    evid: '물과 에너지 낭비',
    testimony: '아무도 없는 방에 불이 하루 종일 켜져 있더구나. 수도꼭지에서는 물이 콸콸 흐르고.',
    objs: [
      { em: '💡', x: 30, y: 26, label: '빈방에 켜 둔 불', bad: 1 },
      { em: '🚰', x: 72, y: 62, label: '틀어 둔 수도꼭지', bad: 1 },
      { em: '🛋️', x: 46, y: 74, label: '소파' },
      { em: '🪴', x: 88, y: 34, label: '화분' },
      { em: '🐈', x: 16, y: 74, label: '고양이' },
      { em: '📚', x: 60, y: 30, label: '책' }
    ]
  },
  {
    name: '학교',
    em: '🏫',
    bg: 'linear-gradient(#e8f3ff,#d6ecd2)',
    who: 'janitor',
    evid: '쓰레기 증가',
    testimony: '멀쩡한 물건이랑 일회용품이 매일 산더미처럼 버려져요. 필요 없는 물건도 많이 사고요.',
    objs: [
      { em: '🗑️', x: 24, y: 68, label: '넘치는 쓰레기통', bad: 1 },
      { em: '🛍️', x: 70, y: 40, label: '뜯지도 않은 새 학용품', bad: 1 },
      { em: '✏️', x: 50, y: 78, label: '연필' },
      { em: '🎒', x: 86, y: 74, label: '가방' },
      { em: '🏀', x: 14, y: 28, label: '공' },
      { em: '📗', x: 44, y: 30, label: '교과서' }
    ]
  }
];

export function MissionHunt({
  onCorrect,
  onWrong,
  onFinish,
  onReact,
  onAddEvidence
}: {
  onCorrect: () => void;
  onWrong: () => void;
  onFinish: (evidences: string[]) => void;
  onReact: (who: any, text: string, mood?: any) => void;
  onAddEvidence: (evid: string) => void;
}) {
  const [visited, setVisited] = useState<Record<number, boolean>>({});
  const [activePlaceIdx, setActivePlaceIdx] = useState<number | null>(null);
  const [foundObjs, setFoundObjs] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(30);
  const [showAllHeat, setShowAllHeat] = useState(false);
  const [pointerPos, setPointerPos] = useState({ x: 200, y: 150 });
  const [testimonyMode, setTestimonyMode] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Timer for active investigation
  useEffect(() => {
    if (activePlaceIdx === null || testimonyMode) return;
    setTimeLeft(30);
    setShowAllHeat(false);
    setFoundObjs({});

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowAllHeat(true);
          onReact('thermo', '삐빅! 시간 초과. 흔적 위치를 모두 보여 줄게. 빛나는 곳을 눌러 봐.', 'alert');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activePlaceIdx, testimonyMode]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPointerPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleObjClick = (objIdx: number) => {
    if (activePlaceIdx === null || foundObjs[objIdx]) return;
    const place = PLACES[activePlaceIdx];
    const ob = place.objs[objIdx];

    if (ob.bad) {
      onCorrect();
      const newFound = { ...foundObjs, [objIdx]: true };
      setFoundObjs(newFound);
      onReact('thermo', `삐빅! 지구를 데우는 흔적 발견: ${ob.label}!`, 'happy');

      const foundCount = Object.keys(newFound).length;
      if (foundCount >= 2) {
        onAddEvidence(place.evid);
        setTimeout(() => {
          setTestimonyMode(true);
          onReact(place.who, place.testimony, 'sad');
        }, 600);
      }
    } else {
      onWrong();
      setTimeLeft(t => Math.max(1, t - 3));
      onReact('luka', `${ob.label}은(는) 괜찮아 보여. 렌즈로 붉은 빛을 찾아봐!`, 'o');
    }
  };

  const handleFinishPlace = () => {
    if (activePlaceIdx === null) return;
    const nextVisited = { ...visited, [activePlaceIdx]: true };
    setVisited(nextVisited);
    setActivePlaceIdx(null);
    setTestimonyMode(false);

    if (Object.keys(nextVisited).length === PLACES.length) {
      const allEvids = PLACES.map(p => p.evid);
      setTimeout(() => onFinish(allEvids), 800);
    }
  };

  // If in a place's investigation
  if (activePlaceIdx !== null) {
    const place = PLACES[activePlaceIdx];
    const foundCount = Object.keys(foundObjs).length;

    if (testimonyMode) {
      return (
        <div className="panel max-w-xl text-center">
          <h2>
            <span className="tag">수사 보고</span>
            {place.name} 증언
          </h2>
          <div className="my-4 text-5xl">{place.em}</div>
          <div className="note text-left text-lg leading-relaxed mb-4">
            <b>{place.name}의 말:</b> "{place.testimony}"
          </div>
          <div className="p-3 bg-amber-100 border-2 border-amber-900 rounded-xl mb-4 font-bold text-amber-950">
            증거 카드 획득: {place.evid}
          </div>
          <button className="big" type="button" onClick={handleFinishPlace}>
            다음 장소로 계속하기
          </button>
        </div>
      );
    }

    return (
      <div className="panel max-w-3xl">
        <div className="flex justify-between items-center mb-2">
          <h2>
            <span className="tag">{place.em}</span>
            {place.name} 수사 중
          </h2>
          <div className="flex items-center gap-3">
            <span className="timer">{timeLeft}초</span>
            <span className="font-display text-lg text-amber-950">
              찾은 흔적 {foundCount} / 2
            </span>
          </div>
        </div>
        <p className="guide">
          렌즈를 움직여 붉게 빛나는 흔적 2개를 찾아 누르세요. 다른 물건을 누르면 시간이 3초 줄어요!
        </p>

        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          className="hunt"
          style={{ background: place.bg }}
        >
          {place.objs.map((ob, i) => (
            <button
              key={i}
              type="button"
              className={`obj ${foundObjs[i] ? 'found' : ''}`}
              style={{ left: `${ob.x}%`, top: `${ob.y}%` }}
              onClick={() => handleObjClick(i)}
              aria-label={ob.label}
            >
              {ob.em}
            </button>
          ))}

          {/* Thermal mask layer */}
          <div
            className={`heat ${showAllHeat ? 'all' : ''}`}
            style={{
              ['--x' as any]: `${pointerPos.x}px`,
              ['--y' as any]: `${pointerPos.y}px`
            }}
          >
            {place.objs
              .filter(ob => ob.bad)
              .map((ob, i) => (
                <b key={i} style={{ left: `${ob.x}%`, top: `${ob.y}%` }} />
              ))}
          </div>

          {/* Moving Lens */}
          <div
            className="lens"
            style={{
              ['--x' as any]: `${pointerPos.x}px`,
              ['--y' as any]: `${pointerPos.y}px`
            }}
          />
        </div>
      </div>
    );
  }

  // Location Selector
  return (
    <div className="panel max-w-3xl">
      <h2>
        <span className="tag">미션 2-1</span>
        다섯 장소 수사
      </h2>
      <p className="guide">
        수사할 장소를 고르세요. 기후 관측 고글을 끼면 지구를 데우는 흔적이 붉게 보여요. ({Object.keys(visited).length} / {PLACES.length})
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-3">
        {PLACES.map((p, i) => {
          const isDone = !!visited[i];
          return (
            <button
              key={i}
              type="button"
              disabled={isDone}
              onClick={() => setActivePlaceIdx(i)}
              className="opt flex flex-col items-center justify-center p-3 text-center"
              style={{ opacity: isDone ? 0.6 : 1 }}
            >
              <div className="text-4xl mb-1">{p.em}</div>
              <b className="text-base text-stone-900">{p.name}</b>
              {isDone ? (
                <span className="text-xs text-green-700 font-bold mt-1">✓ 수사 완료</span>
              ) : (
                <span className="text-xs text-amber-700 font-bold mt-1">출동 가능</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
