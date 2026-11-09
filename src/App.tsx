import React, { useState, useEffect, useRef } from 'react';
import type { AvatarType, GameState, LeaderboardEntry, PosterData, ViewScreen } from './types';
import type { User } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  logOut,
  onAuthStateChanged,
  subscribeToLeaderboard,
  saveScoreToFirestore,
  deleteScoreFromFirestore
} from './firebase';
import { sfx, cue, setSoundEnabled, isSoundEnabled, getAudioContext } from './audio';
import confetti from 'canvas-confetti';
import { SceneFx, type SceneFxName, type SceneFxState } from './components/SceneFx';
import { BACKGROUNDS } from './svgs';
import { SCENE_IMAGES, SHOOT_IMAGES, preloadImages } from './assets';
import { STAGES, StageStep } from './stagesData';

// Screens & UI components
import { TitleScreen } from './components/TitleScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { MapScreen } from './components/MapScreen';
import { TowerAside } from './components/TowerAside';
import { DialogueBox } from './components/DialogueBox';
import {
  NotesModal,
  ClueCheckModal,
  RewardModal,
  StageResultModal,
  LeaderboardModal
} from './components/Modals';

// Missions
import { MissionSort } from './components/missions/MissionSort';
import { MissionSos } from './components/missions/MissionSos';
import { MissionGraph } from './components/missions/MissionGraph';
import { MissionGlacier } from './components/missions/MissionGlacier';
import { MissionSeaLevel } from './components/missions/MissionSeaLevel';
import { MissionMatch } from './components/missions/MissionMatch';
import { MissionHunt } from './components/missions/MissionHunt';
import { MissionEvidenceBoard } from './components/missions/MissionEvidenceBoard';
import { MissionChain } from './components/missions/MissionChain';
import { MissionScale } from './components/missions/MissionScale';
import { MissionSeaForest } from './components/missions/MissionSeaForest';
import { MissionCouncil } from './components/missions/MissionCouncil';
import { MissionWeek } from './components/missions/MissionWeek';
import { MissionCampaign } from './components/missions/MissionCampaign';
import { MissionRush } from './components/missions/MissionRush';
import { MissionPledge } from './components/missions/MissionPledge';
import { MissionCeremony } from './components/missions/MissionCeremony';
import { MissionBoss } from './components/missions/MissionBoss';
import { MissionShoot } from './components/missions/MissionShoot';
import { MissionEnding } from './components/missions/MissionEnding';
import { SkillArt, SkillBookModal, SkillPickModal } from './components/Skills';
import { SKILLS, STAGE_PICKS } from './skills';
import { QuizComponent } from './components/missions/QuizComponent';

const SAVE_KEY = 'pbr-save-v1';
const BOARD_KEY = 'pbr-board-v1';
const MAX_BLOCKS = 12;

interface Sparkle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export default function App() {
  // Main Game State
  const [game, setGame] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || '',
          code: parsed.code || '얼음별',
          avatar: parsed.avatar || 'a',
          unlocked: parsed.unlocked || 0,
          done: parsed.done || {},
          blocks: parsed.blocks ?? 6,
          clues: parsed.clues || {},
          seen: parsed.seen || {},
          gear: parsed.gear || [],
          stars: parsed.stars || {},
          scores: parsed.scores || {},
          pledge: parsed.pledge || [],
          sound: parsed.sound ?? true,
          cur: 0,
          mist: 0,
          pts: 0,
          combo: 0,
          towerOn: parsed.towerOn || false,
          campaign: parsed.campaign || null,
          poster: parsed.poster || null,
          evid: parsed.evid || []
        };
      }
    } catch {
      // Fallback
    }
    return {
      name: '',
      code: '얼음별',
      avatar: 'a',
      unlocked: 0,
      done: {},
      blocks: 6,
      clues: {},
      seen: {},
      gear: [],
      stars: {},
      scores: {},
      pledge: [],
      sound: true,
      cur: 0,
      mist: 0,
      pts: 0,
      combo: 0,
      towerOn: false,
      campaign: null,
      poster: null,
      evid: []
    };
  });

  // Current view screen
  const [viewScreen, setViewScreen] = useState<ViewScreen>('title');

  // Stage & Step progression
  const [stepIdx, setStepIdx] = useState(0);
  const [stageIntroActive, setStageIntroActive] = useState(false);
  const [currentBg, setCurrentBg] = useState('classroom');

  // Interactive Reactions (Dialogue override)
  const [reaction, setReaction] = useState<{
    who: any;
    text: string;
    mood?: any;
  } | null>(null);

  // FX & Visual states
  const [isFlashing, setIsFlashing] = useState(false);
  const [sceneFx, setSceneFx] = useState<SceneFxState | null>(null);
  // 대사 여러 줄 동안 화면에 남아 있는 등장인물 (엄마 곰, 달려가는 포리)
  const [actors, setActors] = useState<{ mom: boolean; pori: 'none' | 'run' | 'scared'; boss?: boolean } | null>(null);
  const sceneFxIdRef = useRef(0);
  const sceneFxTimerRef = useRef<number | undefined>(undefined);
  const [isShaking, setIsShaking] = useState(false);
  const [wobblePori, setWobblePori] = useState(false);
  const [happyPori, setHappyPori] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  // Modals
  const [showNotes, setShowNotes] = useState(false);
  const [showClueCheck, setShowClueCheck] = useState(false);
  const [showReward, setShowReward] = useState<string | null>(null);
  const [showPick, setShowPick] = useState<number | null>(null);
  const [showBook, setShowBook] = useState(false);
  const [newSkill, setNewSkill] = useState<string | null>(null);
  const [showStageResult, setShowStageResult] = useState<{
    title: string;
    stars: number;
    pts: number;
    blocks: number;
    mist: number;
    clues: number;
    hasNext: boolean;
    practice?: boolean;
  } | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Firebase Real-time Leaderboard & Auth states
  const [firebaseLeaderboard, setFirebaseLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isAdmin = currentUser?.email === 'jjojjang1985@gmail.com';

  // Note button reference for sparkle flying target
  const noteBtnRef = useRef<HTMLButtonElement>(null);
  const sparkleIdRef = useRef(0);

  // Preload illustrations so scene changes don't flicker
  useEffect(() => {
    preloadImages();
  }, []);

  // Real-time Firestore Leaderboard Subscription
  useEffect(() => {
    setIsFirebaseLoading(true);
    const unsubAuth = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });
    const unsubLeaderboard = subscribeToLeaderboard(
      items => {
        const entries: LeaderboardEntry[] = items.map(item => ({
          id: item.id,
          name: item.name,
          code: item.code,
          score: item.score,
          stars: item.stars,
          date: item.dateStr || new Date().toLocaleDateString('ko-KR'),
          avatar: item.avatar,
          isFirebase: true
        }));
        setFirebaseLeaderboard(entries);
        setIsFirebaseLoading(false);
      },
      err => {
        console.warn('Realtime leaderboard error:', err);
        setIsFirebaseLoading(false);
      }
    );

    return () => {
      unsubAuth();
      unsubLeaderboard();
    };
  }, []);

  // Save to localStorage whenever critical state updates
  useEffect(() => {
    try {
      const dataToSave = {
        name: game.name,
        code: game.code,
        avatar: game.avatar,
        unlocked: game.unlocked,
        done: game.done,
        blocks: game.blocks,
        clues: game.clues,
        seen: game.seen,
        gear: game.gear,
        stars: game.stars,
        scores: game.scores,
        pledge: game.pledge,
        sound: game.sound,
        towerOn: game.towerOn,
        campaign: game.campaign,
        poster: game.poster,
        evid: game.evid
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
    } catch {
      // Ignore
    }
  }, [game]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(prev => (prev === msg ? null : prev));
    }, 2000);
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 450);
  };

  const triggerFlash = () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 900);
  };

  // Add ice blocks
  const addBlock = (count = 1) => {
    if (!game.towerOn) return;
    setGame(g => ({ ...g, blocks: Math.min(MAX_BLOCKS, g.blocks + count) }));
    setHappyPori(true);
    setTimeout(() => setHappyPori(false), 700);
  };

  // Lose ice block
  const loseBlock = () => {
    if (!game.towerOn) return;
    sfx.crack();
    setGame(g => {
      const next = Math.max(0, g.blocks - 1);
      if (next === 0) {
        sfx.splash();
        triggerToast('빙하가 다 녹을 뻔했어요! 써모가 비상 얼음 3개를 보냈어요.');
        setTimeout(() => {
          setGame(prev => ({ ...prev, blocks: 3 }));
        }, 900);
      }
      return { ...g, blocks: next };
    });
    setWobblePori(true);
    setTimeout(() => setWobblePori(false), 600);
  };

  // Correct answer handling
  const handleCorrect = (silent = false) => {
    const nextCombo = game.combo + 1;
    const bonus = Math.min(nextCombo - 1, 5) * 20;
    const gained = 100 + bonus;
    setGame(g => ({
      ...g,
      combo: nextCombo,
      pts: g.pts + gained
    }));
    if (!silent) sfx.ok();
    addBlock(1);
    if (nextCombo >= 3) {
      triggerToast(`${nextCombo}연속 정답! +${gained}점 🔥`);
    }
  };

  // Wrong answer handling
  const handleWrong = () => {
    setGame(g => ({
      ...g,
      combo: 0,
      mist: g.mist + 1
    }));
    sfx.no();
    loseBlock();
    triggerShake();
  };

  // Dialogue Reaction trigger
  const handleReact = (who: any, text: string, mood?: any) => {
    setReaction({ who, text, mood });
  };

  // Clue Collection with Flying Sparkle animation
  const handleCollectClue = (keyword: string, sentence: string, el?: HTMLElement) => {
    if (game.clues[keyword]) return;

    sfx.clue();
    setGame(g => ({
      ...g,
      clues: { ...g.clues, [keyword]: sentence },
      pts: g.pts + 30
    }));

    if (el && noteBtnRef.current) {
      const r = el.getBoundingClientRect();
      const target = noteBtnRef.current.getBoundingClientRect();
      const newSparkle: Sparkle = {
        id: ++sparkleIdRef.current,
        x: r.left + r.width / 2,
        y: r.top,
        dx: target.left + target.width / 2 - r.left - r.width / 2,
        dy: target.top - r.top
      };
      setSparkles(prev => [...prev, newSparkle]);
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== newSparkle.id));
      }, 850);
    }
  };

  // Start a stage
  // 이미 끝낸 작전을 다시 하는 중인지 (연습 모드). 연습 시작 때의 빙하 블록 수를 기억해 두었다가 되돌린다.
  const practiceRef = useRef<{ blocks: number } | null>(null);
  const isPractice = viewScreen === 'game' && !!game.done[game.cur];

  const endPractice = () => {
    if (practiceRef.current) {
      const b = practiceRef.current.blocks;
      practiceRef.current = null;
      setGame(g => ({ ...g, blocks: b }));
    }
  };

  // 연습 도중 지도나 처음 화면으로 나가도 블록을 되돌린다
  useEffect(() => {
    if (viewScreen !== 'game') endPractice();
  }, [viewScreen]);

  const startStage = (idx: number) => {
    const stageDef = STAGES[idx];
    endPractice();
    if (game.done[idx]) practiceRef.current = { blocks: game.blocks };
    setGame(g => ({
      ...g,
      cur: idx,
      mist: 0,
      pts: 0,
      combo: 0
    }));
    setCurrentBg(stageDef.bg);
    setStepIdx(0);
    setReaction(null);
    setActors(null);
    setViewScreen('game');

    if (idx !== 0) {
      setStageIntroActive(true);
    } else {
      setStageIntroActive(false);
    }
  };

  // Total score calculation
  const totalScore = Object.values(game.scores).reduce((a, b) => a + b, 0);

  // Leaderboard helpers
  const getLeaderboard = (): LeaderboardEntry[] => {
    try {
      return JSON.parse(localStorage.getItem(BOARD_KEY) || '[]');
    } catch {
      return [];
    }
  };

  /** 명예의 전당 저장. 이 기기 순위와 온라인 저장 결과를 돌려준다. */
  const saveToLeaderboard = async (scoreOverride?: number): Promise<{ rank: number; online: boolean }> => {
    const starTotal = [1, 2, 3, 4, 5].reduce((a, i) => a + (game.stars[i] || 0), 0);
    const currentTotalScore = scoreOverride ?? totalScore;
    const entryName = game.name || '북극대원';
    const entryCode = game.code || '얼음별';
    const entryAvatar = game.avatar || 'a';
    const dateStr = new Date().toLocaleDateString('ko-KR');

    // 1. Local fallback save
    const list = getLeaderboard().filter(
      x => !(x.name === entryName && x.code === entryCode)
    );
    list.push({
      name: entryName,
      code: entryCode,
      score: currentTotalScore,
      stars: starTotal,
      date: dateStr,
      avatar: entryAvatar
    });
    list.sort((a, b) => b.score - a.score);
    try {
      localStorage.setItem(BOARD_KEY, JSON.stringify(list.slice(0, 50)));
    } catch {
      // Ignore
    }
    const rank = list.findIndex(x => x.name === entryName && x.code === entryCode) + 1;

    // 2. Realtime Firebase Firestore save
    try {
      // 인터넷이 느리거나 끊겨도 엔딩이 멈추지 않도록 5초까지만 기다린다.
      // (그 뒤에도 Firebase가 연결되면 기록은 자동으로 올라간다)
      const timeout = new Promise<never>((_, rej) => window.setTimeout(() => rej(new Error('timeout')), 5000));
      await Promise.race([saveScoreToFirestore({
        name: entryName,
        code: entryCode,
        score: currentTotalScore,
        stars: starTotal,
        avatar: entryAvatar
      }), timeout]);
      triggerToast('🌟 실시간 명예의 전당에 등록되었습니다!');
      return { rank, online: true };
    } catch (e) {
      console.error('Failed to save score to Firebase:', e);
      triggerToast('이 기기 순위표에 저장했어요. 온라인 기록은 연결되면 올라가요.');
      return { rank, online: false };
    }
  };
  const [endResult, setEndResult] = useState<{ rank: number; online: boolean } | null>(null);

  const handleSignInGoogle = async () => {
    try {
      const u = await signInWithGoogle();
      triggerToast(`환영합니다, ${u.displayName || u.email} 대원님!`);
    } catch (e) {
      console.error('Google sign in error:', e);
      triggerToast('구글 로그인에 실패했습니다.');
    }
  };

  const handleSignOutGoogle = async () => {
    try {
      await logOut();
      triggerToast('로그아웃되었습니다.');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const handleDeleteFirestoreEntry = async (id: string) => {
    try {
      await deleteScoreFromFirestore(id);
      triggerToast('랭킹 기록을 삭제했습니다.');
    } catch (e) {
      console.error('Delete error:', e);
      triggerToast('삭제 권한이 없거나 실패했습니다.');
    }
  };

  // Advance step in stage
  const curStage = STAGES[game.cur];
  const curStep: StageStep | undefined = curStage?.steps[stepIdx];

  // 대사에 맞춰 화면 효과와 음악을 함께 재생한다.
  // 이어지는 대사 동안 유지되는 효과(빛·경보·고글)는 다음으로 넘어갈 때 꺼진다.
  const STICKY_FX: SceneFxName[] = ['bookGlow', 'alarm', 'goggle', 'bossRise'];
  const showSceneFx = (name: SceneFxName, ms?: number) => {
    window.clearTimeout(sceneFxTimerRef.current);
    sceneFxIdRef.current += 1;
    setSceneFx({ name, id: sceneFxIdRef.current });
    if (ms) {
      sceneFxTimerRef.current = window.setTimeout(() => setSceneFx(null), ms);
    }
  };

  const playStoryCue = (name: string) => {
    switch (name) {
      case 'bookGlow':
        cue.bookGlow();
        showSceneFx('bookGlow');
        break;
      case 'flash':
        cue.portal();
        showSceneFx('portal', 1700);
        break;
      case 'alarm':
        cue.alarm();
        showSceneFx('alarm');
        break;
      case 'shadowPeek':
        cue.shadow();
        showSceneFx('shadowPeek', 2700);
        break;
      case 'goggle':
        cue.goggle();
        showSceneFx('goggle');
        break;
      case 'twist':
        cue.twist();
        showSceneFx('twist', 3600);
        break;
      case 'stageCrack':
        cue.crack();
        showSceneFx('crack', 2300);
        break;
      case 'towerOn':
        cue.tower();
        break;
      case 'momAppear':
        cue.momAppear();
        setActors({ mom: true, pori: 'none' });
        break;
      case 'poriRun':
        cue.poriRun();
        setActors({ mom: true, pori: 'run' });
        break;
      case 'bossRise':
        cue.bossRise();
        cue.bossTheme();
        triggerShake();
        setActors(a => (a ? { ...a, pori: 'scared', boss: true } : a));
        showSceneFx('bossRise');
        break;
      case 'winFlash':
        cue.fanfare();
        showSceneFx('win', 2300);
        try {
          confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 }, colors: ['#ffd84d', '#7fd3ff', '#ffffff', '#f2735a'] });
        } catch {
          // ignore
        }
        break;
    }
  };

  const advanceStep = () => {
    setReaction(null);
    setSceneFx(cur => (cur && STICKY_FX.includes(cur.name) ? null : cur));
    runStepsFrom(stepIdx + 1);
  };

  /** startIdx부터 배경·효과 단계를 처리하고, 화면에 보여 줄 첫 단계에서 멈춘다. */
  const runStepsFrom = (startIdx: number) => {
    let idx = startIdx;

    // 배경·효과 단계는 화면에 보여줄 내용이 없으므로 연달아 처리하고 넘어간다
    while (idx < curStage.steps.length) {
      const step = curStage.steps[idx];

      if (step.type === 'mission') setActors(null);
      if (step.type === 'bg') {
        setActors(null);
        setCurrentBg(step.bg);
        idx++;
        continue;
      }
      if (step.type === 'fx') {
        playStoryCue(step.name);
        if (step.name === 'stageCrack') triggerShake();
        if (step.name === 'towerOn') {
          setGame(g => ({ ...g, towerOn: true, blocks: 6 }));
        }
        idx++;
        continue;
      }
      if (step.type === 'pick') {
        // 연습 모드(이미 끝낸 작전)에서는 처음 고른 기술을 그대로 두고 넘어간다
        const already = (STAGE_PICKS[step.stage] || []).find(id => game.gear.includes(id));
        if (game.done[game.cur] && already) {
          triggerToast(`🔁 연습 모드라 기술은 처음 고른 ${SKILLS[already].ic} ${SKILLS[already].name} 그대로예요`);
          idx++;
          continue;
        }
        // 후보 기술 중 하나를 고르면 handlePickSkill → advanceStep 으로 이어진다
        cue.tower();
        setShowPick(step.stage);
        setStepIdx(idx);
        return;
      }
      if (step.type === 'reward') {
        // 보상 창을 닫으면 advanceStep이 다시 호출되어 다음 단계로 진행된다
        sfx.win();
        setGame(g => ({
          ...g,
          gear: g.gear.includes(step.gear) ? g.gear : [...g.gear, step.gear]
        }));
        setShowReward(step.gear);
        setStepIdx(idx);
        return;
      }

      setStepIdx(idx);
      return;
    }

    // Completed current stage
    finishStage(game.cur);
  };

  /** 작전 보상 기술 고르기: 같은 작전에서 예전에 고른 기술은 바꿔 끼운다 */
  const handlePickSkill = (id: string) => {
    const sameStage = STAGE_PICKS[showPick ?? 0] || [];
    setGame(g => ({
      ...g,
      gear: [...g.gear.filter(x => !sameStage.includes(x)), id]
    }));
    setShowPick(null);
    setNewSkill(id);
    window.setTimeout(() => setNewSkill(null), 2200);
    sfx.win();
    triggerToast(`${SKILLS[id].ic} ${SKILLS[id].name} 획득!`);
    advanceStep();
  };

  const finishStage = (stageIdx: number) => {
    const st = game.mist <= 2 ? 3 : game.mist <= 5 ? 2 : 1;
    const bonus = game.blocks * 10;
    const finalStageScore = game.pts + bonus;

    // 첫 도전 점수만 인정: 이미 끝낸 작전을 다시 한 경우(연습) 기록은 그대로 둔다
    const practice = !!game.done[stageIdx];
    const newStars = practice ? game.stars : { ...game.stars, [stageIdx]: st };
    const newScores = practice ? game.scores : { ...game.scores, [stageIdx]: finalStageScore };
    const nextUnlocked = Math.max(game.unlocked, stageIdx + 1);

    setGame(g => ({
      ...g,
      done: { ...g.done, [stageIdx]: true },
      unlocked: nextUnlocked,
      stars: newStars,
      scores: newScores
    }));

    if (stageIdx === STAGES.length - 1) {
      // 엔딩 화면에서 끝나므로 결과 창은 띄우지 않는다 (점수 저장은 '임무 완료'에서 이미 함)
      return;
    }

    setShowStageResult({
      title: STAGES[stageIdx].title,
      stars: st,
      pts: game.pts,
      blocks: game.blocks,
      mist: game.mist,
      clues: Object.keys(game.clues).length,
      hasNext: stageIdx < STAGES.length - 1,
      practice
    });
    if (practice) endPractice();
  };

  // Render current mission inside stage
  const renderCurrentMission = () => {
    if (!curStep || curStep.type !== 'mission') return null;

    switch (curStep.id) {
      case 'sort-1':
        return (
          <MissionSort
            tag="미션 1-1"
            title="날씨일까, 기후일까?"
            guide="카드를 읽고 날씨인지 기후인지 골라요. 키보드 ← → 키로도 할 수 있어요."
            bins={['날씨', '기후']}
            cards={[
              { text: '오늘 오후에 소나기가 와요.', em: '🌦️', bin: 0 },
              { text: '우리나라는 여름에 덥고 비가 많이 와요.', em: '🇰🇷', bin: 1 },
              { text: '내일은 바람이 강하게 불어요.', em: '🌬️', bin: 0 },
              { text: '사막 지역은 일 년 내내 비가 거의 오지 않아요.', em: '🏜️', bin: 1 },
              { text: '어제 아침에 눈이 왔어요.', em: '🌨️', bin: 0 },
              { text: '북극은 오랜 기간 동안 매우 추운 곳이에요.', em: '🧊', bin: 1 }
            ]}
            onCorrect={() => handleCorrect()}
            onWrong={handleWrong}
            onFinish={advanceStep}
            onReact={handleReact}
          />
        );

      case 'sos':
        return (
          <MissionSos
            onCorrect={() => handleCorrect()}
            onWrong={handleWrong}
            onFinish={advanceStep}
            onReact={handleReact}
          />
        );

      case 'graph':
        return (
          <MissionGraph
            onCorrect={() => handleCorrect()}
            onWrong={handleWrong}
            onFinish={advanceStep}
            onReact={handleReact}
          />
        );

      case 'glacier':
        return (
          <MissionGlacier
            onFinish={advanceStep}
            onReact={handleReact}
          />
        );

      case 'sealevel':
        return (
          <MissionSeaLevel
            onCorrect={() => handleCorrect()}
            onWrong={handleWrong}
            onFinish={advanceStep}
            onReact={handleReact}
          />
        );

      case 'match-1':
        return (
          <MissionMatch
            onCorrect={() => handleCorrect()}
            onWrong={handleWrong}
            onFinish={advanceStep}
            onReact={handleReact}
          />
        );

      case 'hunt':
        return (
          <MissionHunt
            onCorrect={() => handleCorrect()}
            onWrong={handleWrong}
            onFinish={evids => {
              setGame(g => ({ ...g, evid: evids }));
              advanceStep();
            }}
            onReact={handleReact}
            onAddEvidence={evid => {
              setGame(g => ({
                ...g,
                evid: g.evid.includes(evid) ? g.evid : [...g.evid, evid]
              }));
              triggerToast(`증거 카드 획득: ${evid}`);
            }}
          />
        );

      case 'evidence-board':
        return (
          <MissionEvidenceBoard
            evidences={game.evid.length > 0 ? game.evid : ['산업 활동', '산림 훼손', '교통수단 이용', '물과 에너지 낭비', '쓰레기 증가']}
            onCorrect={() => handleCorrect()}
            onWrong={handleWrong}
            onFinish={advanceStep}
            onReact={handleReact}
          />
        );

      case 'chain':
        return (
          <MissionChain
            onCorrect={() => handleCorrect()}
            onWrong={handleWrong}
            onFinish={advanceStep}
            onReact={handleReact}
          />
        );

      case 'sort-2':
        return (
          <MissionSort
            tag="미션 2-3"
            title="우리 생활 점검"
            guide="일주일 동안 한 행동이에요. 온실가스를 늘려 기후변화에 영향을 주는 행동인지 골라요."
            bins={['영향을 줘요', '영향을 주지 않아요']}
            cards={[
              { text: '양치할 때 물을 틀어 놓았어요.', em: '🚰', bin: 0 },
              { text: '학교까지 걸어서 갔어요.', em: '🚶', bin: 1 },
              { text: '빈 교실의 불을 켜 두었어요.', em: '💡', bin: 0 },
              { text: '갖고 있는 색연필이 있는데 또 샀어요.', em: '🖍️', bin: 0 },
              { text: '장바구니를 들고 장을 봤어요.', em: '🧺', bin: 1 },
              { text: '가까운 학원에 자동차를 타고 갔어요.', em: '🚗', bin: 0 },
              { text: '일회용 컵 대신 텀블러를 썼어요.', em: '🥤', bin: 1 },
              { text: '추운데 창문을 열고 난방을 세게 틀었어요.', em: '🪟', bin: 0 }
            ]}
            onCorrect={() => handleCorrect()}
            onWrong={handleWrong}
            onFinish={advanceStep}
            onReact={handleReact}
          />
        );

      case 'scale':
        return (
          <MissionScale
            onCorrect={() => handleCorrect()}
            onWrong={handleWrong}
            onFinish={advanceStep}
            onReact={handleReact}
          />
        );

      case 'seaforest':
        return (
          <MissionSeaForest
            onCorrect={() => handleCorrect()}
            onFinish={advanceStep}
            onReact={handleReact}
          />
        );

      case 'council':
        return (
          <MissionCouncil
            onCorrect={() => handleCorrect()}
            onWrong={handleWrong}
            onFinish={advanceStep}
            onReact={handleReact}
          />
        );

      case 'week':
        return (
          <MissionWeek
            onCorrect={() => handleCorrect()}
            onWrong={handleWrong}
            onFinish={advanceStep}
            onReact={handleReact}
          />
        );

      case 'campaign':
        return (
          <MissionCampaign
            onCorrect={() => handleCorrect()}
            onWrong={handleWrong}
            onFinish={advanceStep}
            onReact={handleReact}
            onSavePoster={poster => setGame(g => ({ ...g, poster }))}
          />
        );

      case 'boss':
        return (
          <MissionBoss
            owned={game.gear}
            onHeal={(n: number) => addBlock(n)}
            onCorrect={() => handleCorrect()}
            onWrong={handleWrong}
            onFinish={advanceStep}
            onReact={handleReact}
          />
        );

      case 'shoot':
        return (
          <MissionShoot
            onCorrect={() => handleCorrect()}
            onWrong={handleWrong}
            onFinish={advanceStep}
            onReact={handleReact}
          />
        );

      case 'rush':
        return (
          <MissionRush
            onCorrect={() => handleCorrect()}
            onWrong={handleWrong}
            onFinish={advanceStep}
            onReact={handleReact}
          />
        );

      case 'pledge':
        return (
          <MissionPledge
            onFinish={pledges => {
              setGame(g => ({ ...g, pledge: pledges }));
              advanceStep();
            }}
          />
        );

      case 'ceremony': {
        const board = getLeaderboard();
        const myRank =
          board.findIndex(x => x.name === game.name && x.code === game.code) + 1;
        return (
          <MissionCeremony
            name={game.name}
            code={game.code}
            avatar={game.avatar}
            stars={game.stars}
            totalScore={totalScore}
            pledges={game.pledge}
            rank={myRank > 0 ? myRank : 1}
            onShowLeaderboard={() => setShowLeaderboard(true)}
            onGoMap={() => setViewScreen('map')}
            onComplete={async () => {
              // 에필로그 점수까지 더한 최종 총점으로 기록한다 (finishStage와 같은 계산)
              const epi = game.done[game.cur] ? game.scores[game.cur] || 0 : game.pts + game.blocks * 10;
              const finalTotal =
                Object.entries(game.scores).reduce((a, [k, v]) => (Number(k) === game.cur ? a : a + v), 0) + epi;
              const r = await saveToLeaderboard(finalTotal);
              setEndResult(r);
              advanceStep();
            }}
          />
        );
      }

      case 'ending':
        return (
          <MissionEnding
            name={game.name}
            pledges={game.pledge}
            totalScore={totalScore}
            stars={game.stars}
            result={endResult}
            onMount={() => finishStage(game.cur)}
            onShowLeaderboard={() => setShowLeaderboard(true)}
            onGoTitle={() => setViewScreen('title')}
            onGoMap={() => setViewScreen('map')}
          />
        );

      default:
        return null;
    }
  };

  const sceneImage = SCENE_IMAGES[currentBg];
  // 지금까지 얻은 점수: 끝낸 작전 점수 + 지금 하는 작전에서 얻고 있는 점수
  const liveScore = isPractice
    ? totalScore
    : Object.entries(game.scores).reduce((a, [k, v]) => (Number(k) === game.cur ? a : a + v), 0) +
      Math.max(game.scores[game.cur] || 0, game.pts);
  const hudSkills = game.gear.filter(id => SKILLS[id] && SKILLS[id].kind !== 'item');
  const showDialogue = viewScreen === 'game' && !stageIntroActive && (!!reaction || curStep?.type === 'say');
  const STAGE_LABELS = ['프롤로그', '작전 1', '작전 2', '작전 3', '작전 4', '최종 결전', '에필로그'];

  return (
    <div className="app">
      {/* Toast Alert */}
      {toastMsg && <div className="toast">{toastMsg}</div>}

      {/* Flying Sparkles */}
      {sparkles.map(s => (
        <div
          key={s.id}
          className="sparkle"
          style={{
            left: `${s.x}px`,
            top: `${s.y}px`,
            color: '#f0a500',
            ['--dx' as any]: `${s.dx}px`,
            ['--dy' as any]: `${s.dy}px`
          }}
        >
          ★
        </div>
      ))}

      {/* Screen Views */}
      {viewScreen === 'title' && (
        <TitleScreen
          hasSave={!!game.name}
          playerName={game.name}
          onContinue={() => setViewScreen('map')}
          onNewGame={() => setViewScreen('register')}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {viewScreen === 'register' && (
        <RegisterScreen
          onRegister={(name, code, avatar) => {
            setGame(g => ({
              ...g,
              name,
              code,
              avatar,
              unlocked: 0,
              done: {},
              blocks: 6,
              clues: {},
              seen: {},
              gear: [],
              stars: {},
              scores: {},
              pledge: [],
              cur: 0
            }));
            startStage(0);
          }}
        />
      )}

      {viewScreen === 'map' && (
        <MapScreen
          name={game.name}
          code={game.code}
          unlocked={game.unlocked}
          done={game.done}
          stars={game.stars}
          totalScore={totalScore}
          onSelectStage={idx => startStage(idx)}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          onGoTitle={() => setViewScreen('title')}
          onUnlockAll={() => {
            setGame(g => ({ ...g, unlocked: STAGES.length - 1 }));
            triggerToast('모든 작전이 열렸습니다! (선생님 모드)');
          }}
        />
      )}

      {/* Scene background (full screen illustration) */}
      <div id="scene" className={`scene ${isShaking ? 'shake' : ''}`} aria-hidden="true">
        {sceneImage ? (
          <img key={currentBg} className="scene-img" src={sceneImage} alt="" draggable={false} />
        ) : (
          <div
            className="scene-svg"
            dangerouslySetInnerHTML={{ __html: BACKGROUNDS[currentBg] || BACKGROUNDS.classroom }}
          />
        )}
        <div className="scene-shade" />
        {actors && (
          <div className={`actors ${actors.boss ? 'boss-came' : ''}`}>
            {actors.mom && <img className="actor-mom" src={SHOOT_IMAGES.mom} alt="엄마 곰" draggable={false} />}
            {actors.pori !== 'none' && (
              <img className={`actor-pori ${actors.pori}`} src={SHOOT_IMAGES.pori} alt="포리" draggable={false} />
            )}
          </div>
        )}
        <SceneFx fx={sceneFx} />
        {isFlashing && <div className="flash" />}
      </div>

      {/* Top Header Bar */}
      <header id="top" className="topbar">
        <button type="button" id="brand" className="brand" onClick={() => setViewScreen('map')}>
          🌏 <span>지구수비대</span>
        </button>

        <ol id="pips" className="pips" aria-label="진행 단계">
          {STAGE_LABELS.map((label, i) => (
            <li
              key={i}
              className={`pip ${game.done[i] ? 'done' : ''} ${game.cur === i ? 'on' : ''}`}
              title={label}
            >
              <span className="pip-dot" />
              <span className="pip-label">{label}</span>
            </li>
          ))}
        </ol>

        <div className="hud">
          <div className="hud-score" title="지금까지 얻은 점수">
            ⭐ <b>{liveScore.toLocaleString()}</b>
            <span className="hud-unit">점</span>
          </div>
          <button
            type="button"
            className="hud-skills"
            onClick={() => setShowBook(true)}
            title="나의 기술 도감 보기"
            aria-label={`익힌 기술 ${hudSkills.length}개, 기술 도감 열기`}
          >
            <span className="hud-skills-label">기술</span>
            <span className="hud-count">✨ {hudSkills.length}</span>
            {hudSkills.length === 0 ? (
              <span className="hud-empty">없음</span>
            ) : (
              hudSkills.map(id => (
                <span key={id} className={`hud-skill ${newSkill === id ? 'new' : ''}`} title={SKILLS[id].name}>
                  <SkillArt id={id} />
                </span>
              ))
            )}
          </button>
        </div>

        <div className="topbar-btns">
          <button
            ref={noteBtnRef}
            className="tbtn"
            id="noteBtn"
            type="button"
            onClick={() => setShowNotes(true)}
            aria-label="단서 수첩"
          >
            📒 <span className="tbtn-label">단서 수첩</span>
            <span id="noteCount" className="tbtn-count">{Object.keys(game.clues).length}</span>
          </button>

          <button className="tbtn" type="button" onClick={() => setViewScreen('map')} aria-label="작전 지도">
            🗺️ <span className="tbtn-label">작전 지도</span>
          </button>

          <button
            className="tbtn"
            type="button"
            aria-label={game.sound ? '소리 끄기' : '소리 켜기'}
            onClick={() => {
              const nextSound = !game.sound;
              setGame(g => ({ ...g, sound: nextSound }));
              setSoundEnabled(nextSound);
              sfx.tick();
            }}
          >
            {game.sound ? '🔊' : '🔇'}
          </button>
        </div>
      </header>

      {/* Main Play Area: mission panels + ice tower */}
      <main id="main" className={`playfield ${game.towerOn ? 'has-tower' : ''}`}>
        <section id="stage" className="stage">
          <div id="layer" className="layer">
            {stageIntroActive ? (
              <div className="panel intro-card">
                <span className="tag">{curStage.label}</span>
                {isPractice && (
                  <span className="practice-tag">🔁 연습 모드 · 점수는 첫 도전 기록이 그대로 남아요</span>
                )}
                <h2>{curStage.title}</h2>
                <p className="guide">{curStage.goal}</p>
                <button
                  className="big"
                  type="button"
                  onClick={() => {
                    sfx.ok();
                    setStageIntroActive(false);
                    runStepsFrom(0);
                  }}
                >
                  출동하기! 🚀
                </button>
              </div>
            ) : curStep?.type === 'quiz' ? (
              <QuizComponent
                items={curStep.items}
                onCorrect={() => handleCorrect()}
                onWrong={handleWrong}
                onFinish={advanceStep}
                onReact={handleReact}
              />
            ) : (
              renderCurrentMission()
            )}
          </div>
        </section>

        <TowerAside
          blocks={game.blocks}
          towerOn={game.towerOn}
          poriMood={game.blocks <= 2 ? 'scared' : game.blocks >= 9 ? 'joy' : 'happy'}
          wobble={wobblePori}
          happy={happyPori}
        />
      </main>

      {/* Bottom Dialogue Box */}
      {showDialogue && (
        <div className="dlg-dock">
          {reaction ? (
            <DialogueBox
              who={reaction.who}
              text={reaction.text}
              mood={reaction.mood || 'happy'}
              avatar={game.avatar}
              playerName={game.name}
              playerCode={game.code}
              clues={game.clues}
              onKeywordClick={handleCollectClue}
              onAdvance={() => setReaction(null)}
            />
          ) : curStep?.type === 'say' ? (
            <DialogueBox
              who={curStep.who}
              text={curStep.text}
              mood={curStep.mood}
              avatar={game.avatar}
              playerName={game.name}
              playerCode={game.code}
              clues={game.clues}
              mustClue={curStep.must}
              onKeywordClick={handleCollectClue}
              onAdvance={advanceStep}
            />
          ) : null}
        </div>
      )}

      {/* Modals */}
      {showNotes && (
        <NotesModal
          clues={game.clues}
          onClose={() => setShowNotes(false)}
        />
      )}

      {showClueCheck && curStage && (
        <ClueCheckModal
          requiredClues={curStage.clues}
          clues={game.clues}
          seen={game.seen}
          onCollect={handleCollectClue}
          onStartQuiz={() => {
            setShowClueCheck(false);
          }}
        />
      )}

      {showPick !== null && <SkillPickModal stage={showPick} onPick={handlePickSkill} />}

      {showBook && <SkillBookModal owned={game.gear} onClose={() => setShowBook(false)} />}

      {showReward && (
        <RewardModal
          gearId={showReward}
          onClose={() => {
            setShowReward(null);
            if (curStep?.type === 'reward') advanceStep();
          }}
        />
      )}

      {showStageResult && (
        <StageResultModal
          stageTitle={showStageResult.title}
          stars={showStageResult.stars}
          pts={showStageResult.pts}
          blocks={showStageResult.blocks}
          mistakes={showStageResult.mist}
          cluesCount={showStageResult.clues}
          hasNext={showStageResult.hasNext}
          practice={showStageResult.practice}
          onNext={() => {
            setShowStageResult(null);
            startStage(game.cur + 1);
          }}
          onMap={() => {
            setShowStageResult(null);
            setViewScreen('map');
          }}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          entries={firebaseLeaderboard}
          localEntries={getLeaderboard()}
          myName={game.name}
          myCode={game.code}
          isLoading={isFirebaseLoading}
          currentUser={currentUser}
          isAdmin={isAdmin}
          onSignInGoogle={handleSignInGoogle}
          onSignOutGoogle={handleSignOutGoogle}
          onDeleteEntry={handleDeleteFirestoreEntry}
          onClose={() => setShowLeaderboard(false)}
          onClearLocal={() => {
            try {
              localStorage.removeItem(BOARD_KEY);
            } catch {
              // Ignore
            }
            triggerToast('로컬 순위표를 초기화했습니다.');
          }}
        />
      )}
    </div>
  );
}
