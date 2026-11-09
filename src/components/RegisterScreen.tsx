import React, { useState } from 'react';
import type { AvatarType } from '../types';
import { sfx } from '../audio';
import { AVATAR_FACES, SCENE_IMAGES } from '../assets';
import { nameExistsOnline } from '../firebase';

interface RegisterScreenProps {
  onRegister: (name: string, code: string, avatar: AvatarType) => void;
}

const AVATAR_CHOICES: [AvatarType, string][] = [
  ['a', '1번 캐릭터'],
  ['b', '2번 캐릭터'],
  ['c', '3번 캐릭터'],
  ['d', '4번 캐릭터']
];

const CODENAMES = ['얼음별', '북극성', '오로라', '빙하수호자', '펭귄킥', '초록번개', '햇살방패', '바다거북', '눈꽃요정', '탄소사냥꾼'];

export function RegisterScreen({ onRegister }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState(CODENAMES[0]);
  const [checking, setChecking] = useState(false);
  // 같은 이름 안내를 이미 보여 준 이름 (한 번 더 누르면 그대로 입단)
  const [warnedName, setWarnedName] = useState('');
  const [avatar, setAvatar] = useState<AvatarType>('a');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checking) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg('이름을 꼭 입력해 주세요!');
      sfx.no();
      return;
    }
    if (warnedName !== trimmed) {
      setChecking(true);
      let dup = false;
      try {
        const local = JSON.parse(localStorage.getItem('pbr-board-v1') || '[]') as { name?: string }[];
        dup = Array.isArray(local) && local.some(x => x && x.name === trimmed);
      } catch {
        // 로컬 기록이 없으면 넘어간다
      }
      if (!dup) dup = await nameExistsOnline(trimmed);
      setChecking(false);
      if (dup) {
        setWarnedName(trimmed);
        setErrorMsg('');
        sfx.no();
        return;
      }
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
              if (warnedName) setWarnedName('');
            }}
            className="w-full text-lg p-3 rounded-2xl border-3 border-amber-950 font-bold bg-white mb-3"
            autoComplete="off"
            autoFocus
          />
          {errorMsg && (
            <p className="text-sm font-bold text-rose-700 mb-2">{errorMsg}</p>
          )}
          {warnedName && warnedName === name.trim() && (
            <div className="dup-name-note mb-3" role="alert">
              <b>앗, 명예의 전당에 '{warnedName}' 대원이 이미 있어요!</b>
              <br />
              이름 뒤에 번호나 성을 붙여 볼까요? (예: {warnedName}3, 김{warnedName})
              <br />
              <span className="text-xs">그래도 이 이름으로 할 거면 아래 버튼을 한 번 더 눌러요.</span>
            </div>
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
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button className="big w-full py-3" type="submit" disabled={checking}>
              {checking ? '대원 명부 확인 중…' : warnedName && warnedName === name.trim() ? '이 이름 그대로 입단하기 🎖️' : '수련생으로 입단하기! 🎖️'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
