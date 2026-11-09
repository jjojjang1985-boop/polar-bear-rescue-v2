import React, { useState } from 'react';
import type { AvatarType } from '../types';
import { sfx } from '../audio';
import { AVATAR_FACES, SCENE_IMAGES } from '../assets';

interface RegisterScreenProps {
  onRegister: (name: string, code: string, avatar: AvatarType) => void;
}

const AVATAR_CHOICES: [AvatarType, string][] = [
  ['a', '단발 대원'],
  ['b', '소년 대원'],
  ['c', '친구 대원'],
  ['d', '안경 대원']
];

const CODENAMES = ['얼음별', '빙하수호자', '오로라', '눈보라', '북극성', '펭귄킥'];

export function RegisterScreen({ onRegister }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState(CODENAMES[0]);
  const [avatar, setAvatar] = useState<AvatarType>('a');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg('이름을 꼭 입력해 주세요!');
      sfx.no();
      return;
    }
    sfx.win();
    onRegister(trimmed, code, avatar);
  };

  return (
    <div className="screen register-screen">
      <img className="screen-art register-art" src={SCENE_IMAGES.hq} alt="" draggable={false} />
      <div className="register-wrap">
        <h1 className="logo register-logo">지구수비대 수련생 등록</h1>

        <form
          onSubmit={handleSubmit}
          className="panel register-panel text-left"
        >
          {/* Name input */}
          <label htmlFor="nmIn" className="font-display text-lg text-amber-950 block mb-1">
            이름
          </label>
          <input
            id="nmIn"
            type="text"
            maxLength={8}
            placeholder="이름을 입력하세요 (최대 8자)"
            value={name}
            onChange={e => {
              setName(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            className="w-full text-lg p-3 rounded-2xl border-3 border-amber-950 font-bold bg-white mb-3"
            autoComplete="off"
            autoFocus
          />
          {errorMsg && (
            <p className="text-sm font-bold text-rose-700 mb-2">{errorMsg}</p>
          )}

          {/* Codename Chips */}
          <label className="font-display text-lg text-amber-950 block mb-1">
            코드네임
          </label>
          <div className="flex gap-2 flex-wrap mb-4">
            {CODENAMES.map(c => (
              <button
                key={c}
                type="button"
                className={`chip ${code === c ? 'sel' : ''}`}
                onClick={() => {
                  setCode(c);
                  sfx.tick();
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Avatar Selection */}
          <label className="font-display text-lg text-amber-950 block mb-1">
            내 모습 선택
          </label>
          <div className="av-grid mb-6">
            {AVATAR_CHOICES.map(([id, label]) => (
              <div key={id} className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  className={`av ${avatar === id ? 'sel' : ''}`}
                  onClick={() => {
                    setAvatar(id);
                    sfx.tick();
                  }}
                  aria-label={label}
                >
                  <img src={AVATAR_FACES[id]} alt="" className="av-img" draggable={false} />
                </button>
                <span className="text-xs font-bold text-amber-950">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button className="big w-full py-3" type="submit">
              수련생으로 입단하기! 🎖️
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
