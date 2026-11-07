import React, { useEffect, useState, useRef } from 'react';
import type { AvatarType, MoodType, SpeakerId } from '../types';
import { CHARACTER_INFO, getCharacterSVG } from '../svgs';
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

  const portraitSvg = !isNarrator ? getCharacterSVG(who, mood, avatar) : '';

  return (
    <footer
      id="dlg"
      onClick={handleClick}
      className={`relative grid items-center select-none cursor-pointer ${
        isFinished ? 'ready' : ''
      }`}
      style={{
        background: '#fffaf0',
        borderRadius: '26px',
        minHeight: '148px',
        padding: '12px 20px 12px 14px',
        border: '3.5px solid var(--line)',
        boxShadow: '0 6px 0 var(--line), 0 14px 26px rgba(74,42,18,.25)',
        gridTemplateColumns: isNarrator ? '1fr' : '110px 1fr',
        gap: '16px'
      }}
    >
      {!isNarrator && (
        <div
          id="portrait"
          className="talk"
          style={{
            width: '110px',
            height: '110px',
            borderRadius: '24px',
            background: `radial-gradient(circle at 40% 30%, #fff, ${speakerMeta.bg})`,
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden',
            border: '3px solid var(--line)'
          }}
          dangerouslySetInnerHTML={{ __html: portraitSvg }}
        />
      )}

      <div className="flex-1">
        {!isNarrator && (
          <div
            id="who"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              color: 'var(--line)',
              background: 'var(--sun)',
              display: 'inline-block',
              padding: '2px 14px',
              borderRadius: '999px',
              marginBottom: '6px',
              border: '2.5px solid var(--line)'
            }}
          >
            {displayName}
          </div>
        )}
        <div
          id="text"
          className={isNarrator ? 'narr' : ''}
          style={{
            fontSize: '19px',
            lineHeight: '1.6',
            minHeight: '3em',
            wordBreak: 'keep-all',
            fontWeight: isNarrator ? 400 : 700,
            color: isNarrator ? '#7a5a43' : 'var(--ink)'
          }}
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

      {isFinished && (
        <div
          id="next"
          style={{
            position: 'absolute',
            right: '18px',
            bottom: '10px',
            fontFamily: 'var(--font-display)',
            fontSize: '15px',
            color: 'var(--coral)',
            animation: 'nudge 1s infinite'
          }}
        >
          눌러서 계속 ▶
        </div>
      )}
    </footer>
  );
}
