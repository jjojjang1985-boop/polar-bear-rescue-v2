import React, { useState } from 'react';
import { shuffle } from '../../shuffle';
import type { PosterData } from '../../types';
import { sfx } from '../../audio';

const STICKERS = ['🐻‍❄️', '🌳', '🚲', '💡', '🌊', '🧊'];
const PRACTICES = [
  '가까운 거리는 걸어요',
  '전기를 아껴 써요',
  '일회용품을 줄여요',
  '분리배출해요',
  '숲을 지켜요'
];

const MARKET_ITEMS = [
  { t: '작아진 운동화', em: '👟', good: true },
  { t: '다 읽은 동화책', em: '📚', good: true },
  { t: '안 쓰는 장난감 자동차', em: '🚗', good: true },
  { t: '매일 쓰는 내 칫솔', em: '🪥', good: false },
  { t: '먹다 남은 과자', em: '🍪', good: false },
  { t: '내 안경', em: '👓', good: false }
];

export function MissionCampaign({
  onCorrect,
  onWrong,
  onFinish,
  onReact,
  onSavePoster
}: {
  onCorrect: () => void;
  onWrong: () => void;
  onFinish: () => void;
  onReact: (who: any, text: string, mood?: any) => void;
  onSavePoster: (poster: PosterData) => void;
}) {
  const [mode, setMode] = useState<'choose' | 'poster' | 'market'>('choose');

  // Poster state
  const [sticker, setSticker] = useState(STICKERS[0]);
  const [practice, setPractice] = useState(PRACTICES[0]);
  const [posterTitle, setPosterTitle] = useState('빙하를 지켜 주세요!');

  // Market state
  const [marketSelected, setMarketSelected] = useState<Record<number, boolean>>({});
  const [marketItems] = useState(() => shuffle(MARKET_ITEMS));

  const handleFinishPoster = () => {
    const posterData = {
      t: posterTitle || '빙하를 지켜 주세요!',
      s: sticker,
      p: practice
    };
    onSavePoster(posterData);
    onCorrect();
    sfx.win();
    onReact('danbi', '멋진 포스터야! 우리 동네 게시판에 붙여서 모두에게 알리자.', 'smile');
    setTimeout(onFinish, 1400);
  };

  const handleMarketPick = (idx: number, isGood: boolean) => {
    if (marketSelected[idx]) return;

    if (isGood) {
      onCorrect();
      const nextSelected = { ...marketSelected, [idx]: true };
      setMarketSelected(nextSelected);

      if (Object.keys(nextSelected).length >= 3) {
        sfx.win();
        onReact('luka', '알뜰 시장이 북적북적해! 다들 물건을 나누어 쓰고 있어.', 'grin');
        setTimeout(onFinish, 1400);
      }
    } else {
      onWrong();
      onReact('thermo', '삐빅! 그건 지금 나에게 꼭 필요한 물건이거나 위생상 나누기 어려워.', 'alert');
    }
  };

  if (mode === 'choose') {
    return (
      <div className="panel max-w-2xl text-center">
        <h2>
          <span className="tag">미션 4-2</span>
          알리기 작전
        </h2>
        <p className="guide">
          두 작전 중 하나를 골라 기후변화 대응 방법을 주변 사람들에게 널리 알려요.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          <button
            type="button"
            className="opt p-6 flex flex-col items-center justify-center text-center hover:scale-102"
            onClick={() => setMode('poster')}
          >
            <div className="text-6xl mb-2">🖼️</div>
            <b className="text-xl text-stone-900">홍보 포스터 만들기</b>
            <span className="text-xs text-stone-600 mt-1">
              멋진 그림과 구호로 포스터를 디자인해요
            </span>
          </button>

          <button
            type="button"
            className="opt p-6 flex flex-col items-center justify-center text-center hover:scale-102"
            onClick={() => setMode('market')}
          >
            <div className="text-6xl mb-2">🛍️</div>
            <b className="text-xl text-stone-900">알뜰 시장 열기</b>
            <span className="text-xs text-stone-600 mt-1">
              안 쓰는 물건을 모아 이웃과 나누어 써요
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'market') {
    const selectedCount = Object.keys(marketSelected).length;
    return (
      <div className="panel max-w-2xl">
        <h2>
          <span className="tag">미션 4-2</span>
          알뜰 시장 열기 ({selectedCount} / 3)
        </h2>
        <p className="guide">
          나에게는 필요 없지만 누군가에게 유용한 물건 3개를 골라 알뜰 시장에 내놓으세요.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
          {marketItems.map((item, i) => {
            const isPicked = !!marketSelected[i];
            return (
              <button
                key={i}
                type="button"
                disabled={isPicked}
                onClick={() => handleMarketPick(i, item.good)}
                className={`opt p-3 flex flex-col items-center text-center ${
                  isPicked ? 'ok' : ''
                }`}
                style={{ opacity: isPicked ? 0.6 : 1 }}
              >
                <div className="text-4xl mb-1">{item.em}</div>
                <div className="font-bold text-sm">{item.t}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Poster Mode
  return (
    <div className="panel max-w-3xl">
      <h2>
        <span className="tag">미션 4-2</span>
        홍보 포스터 만들기
      </h2>
      <p className="guide">
        그림과 실천 구호를 선택하고 제목을 붙여 기후변화 홍보 포스터를 완성하세요.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 items-start">
        {/* Editor controls */}
        <div>
          <label className="font-display text-base text-amber-950 block mb-1">
            1. 대표 그림 고르기
          </label>
          <div className="flex gap-2 flex-wrap mb-3">
            {STICKERS.map(s => (
              <button
                key={s}
                type="button"
                className={`chip text-2xl ${sticker === s ? 'sel' : ''}`}
                onClick={() => setSticker(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <label className="font-display text-base text-amber-950 block mb-1">
            2. 강조할 실천 구호
          </label>
          <div className="flex gap-2 flex-wrap mb-3">
            {PRACTICES.map(p => (
              <button
                key={p}
                type="button"
                className={`chip text-sm ${practice === p ? 'sel' : ''}`}
                onClick={() => setPractice(p)}
              >
                {p}
              </button>
            ))}
          </div>

          <label htmlFor="pTitleIn" className="font-display text-base text-amber-950 block mb-1">
            3. 포스터 제목
          </label>
          <input
            id="pTitleIn"
            type="text"
            maxLength={18}
            value={posterTitle}
            onChange={e => setPosterTitle(e.target.value)}
            className="w-full text-base p-2 border-2 border-amber-950 rounded-xl font-bold bg-white mb-4"
          />

          <button
            className="big green w-full"
            type="button"
            onClick={handleFinishPoster}
          >
            포스터 붙이기
          </button>
        </div>

        {/* Live Poster Preview */}
        <div className="poster">
          <div className="pt">{posterTitle || '빙하를 지켜 주세요!'}</div>
          <div className="pe">{sticker}</div>
          <div className="pp">{practice}</div>
        </div>
      </div>
    </div>
  );
}
