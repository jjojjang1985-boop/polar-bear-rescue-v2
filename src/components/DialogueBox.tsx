import React, { useEffect, useState, useRef } from 'react';
import type { AvatarType, MoodType, SpeakerId } from '../types';
import { CHARACTER_INFO, getCharacterSVG } from '../svgs';
import { getFaceImage } from '../assets';
import { sfx } from '../audio';

interface DialogueBoxProps {
  who: SpeakerId;
  text: string;
  mood?: MoodType;
  avatar: AvatarType;
  playerName: string;
  playerCode: string;
  clues: Record<string, string>;
  mustClue?: string;
  onKeywordClick: (keyword: string, sentence: string, el: HTMLElement) => void;
  onAdvance: () => void;
}

export function DialogueBox({
  who,
  text,
  mood = 'happy',
  avatar,
  playerName,
  playerCode,
  clues,
  mustClue,
  onKeywordClick,
  onAdvance
}: {
  who: SpeakerId;
  text: string;
  mood?: MoodType;
  avatar: AvatarType;
  playerName: string;
  playerCode: string;
  clues: Record<string, string>;
  mustClue?: string;
  onKeywordClick: (keyword: string, sentence: string, el: HTMLElement) => void;
  onAdvance: () => void;
}) {
  const [revealedChars, setRevealedChars] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showMustTip, setShowMustTip] = useState(false);
  const isNarrator = who === 'narr';
  const speakerMeta = CHARACTER_INFO[who] || CHARACTER_INFO.narr;
  const displayName = speakerMeta.name
    .replace('{name}', playerName || '대원')
    .replace('{code}', playerCode || '얼음별');

  // Process tokens: split by **keyword**
  const formattedText = text
    .replace(/{name}/g, playerName || '대원')
    .replace(/{code}/g, playerCode || '얼음별');

  const cleanFullSentence = formattedText.replace(/\*\*/g, '');

  const tokens = React.useMemo(() => {
    const parts = formattedText.split(/(\*\*[^*]+\*\*)/);
    let count = 0;
    return parts.map(part => {
      if (!part) return { type: 'text', str: '', startIdx: count, endIdx: count };
      if (part.startsWith('**') && part.endsWith('**')) {
        const kw = part.slice(2, -2);
        const start = count;
        count += kw.length;
        return { type: 'kw', str: kw, startIdx: start, endIdx: count };
      } else {
        const start = count;
        count += part.length;
        return { type: 'text', str: part, startIdx: start, endIdx: count };
      }
    });
  }, [formattedText]);

  const totalChars = tokens.length > 0 ? tokens[tokens.length - 1].endIdx : 0;

  useEffect(() => {
    setRevealedChars(0);
    setIsFinished(false);
    setShowMustTip(false);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setRevealedChars(current);
      if (current % 3 === 0) {
        sfx.blip();
      }
      if (current >= totalChars) {
        setIsFinished(true);
        clearInterval(interval);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [formattedText, totalChars]);

  const handleClick = () => {
    if (!isFinished) {
      setRevealedChars(totalChars);
      setIsFinished(true);
      return;
    }

    if (mustClue && !clues[mustClue]) {
      setShowMustTip(true);
      return;
    }

    sfx.tick();
    onAdvance();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'BUTTON') return;
        e.preventDefault();
        handleClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFinished, mustClue, clues, totalChars]);

  const faceImg = !isNarrator ? getFaceImage(who, avatar) : null;
  const portraitSvg = !isNarrator && !faceImg ? getCharacterSVG(who, mood, avatar) : '';

  return (
    <footer
      id="dlg"
      onClick={handleClick}
      className={`dlg ${isNarrator ? 'is-narr' : ''} ${isFinished ? 'ready' : ''}`}
    >
      {!isNarrator && (
        <div
          id="portrait"
          className="dlg-face talk"
          style={{ background: speakerMeta.bg }}
        >
          {faceImg ? (
            <img src={faceImg} alt={displayName} draggable={false} />
          ) : (
            <div className="dlg-face-svg" dangerouslySetInnerHTML={{ __html: portraitSvg }} />
          )}
        </div>
      )}

      <div className="dlg-body">
        {!isNarrator && (
          <div id="who" className="dlg-name">
            {displayName}
          </div>
        )}
        <div
          id="text"
          className={`dlg-text ${isNarrator ? 'narr' : ''}`}
        >
          {tokens.map((tok, ti) => {
            if (tok.startIdx >= revealedChars) return null;
            const sliceEnd = Math.min(tok.endIdx, revealedChars);
            const visibleText = tok.str.slice(0, sliceEnd - tok.startIdx);

            if (tok.type === 'kw') {
              const isGot = !!clues[tok.str];
              return (
                <button
                  key={ti}
                  type="button"
                  className={`kw ${isGot ? 'got' : ''}`}
                  onClick={e => {
                    e.stopPropagation();
                    onKeywordClick(tok.str, cleanFullSentence, e.currentTarget);
                    if (!isFinished) {
                      setRevealedChars(totalChars);
                      setIsFinished(true);
                    }
                  }}
                >
                  {visibleText}
                </button>
              );
            }
            return <span key={ti}>{visibleText}</span>;
          })}
        </div>
      </div>

      {showMustTip && (
        <div className="hint-tip">
          반짝이는 노란 단어를 눌러 단서를 저장하세요!
        </div>
      )}

      <button
        type="button"
        id="next"
        className={`dlg-next ${isFinished ? 'on' : ''}`}
        onClick={e => {
          e.stopPropagation();
          handleClick();
        }}
        aria-label="다음 대사"
      >
        다음 ▶
      </button>
    </footer>
  );
}
