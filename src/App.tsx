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
import { sfx, setSoundEnabled, isSoundEnabled, getAudioContext } from './audio';
import { BACKGROUNDS } from './svgs';
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
  const [isShaking, setIsShaking] = useState(false);
  const [wobblePori, setWobblePori] = useState(false);
  const [happyPori, setHappyPori] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  // Modals
  const [showNotes, setShowNotes] = useState(false);
  const [showClueCheck, setShowClueCheck] = useState(false);
  const [showReward, setShowReward] = useState<string | null>(null);
  const [showStageResult, setShowStageResult] = useState<{
    title: string;
    stars: number;
    pts: number;
    blocks: number;
    mist: number;
    clues: number;
    hasNext: boolean;
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
  const startStage = (idx: number) => {
    const stageDef = STAGES[idx];
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

  const saveToLeaderboard = async () => {
    const starTotal = [1, 2, 3, 4].reduce((a, i) => a + (game.stars[i] || 0), 0);
    const currentTotalScore = totalScore;
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

    // 2. Realtime Firebase Firestore save
    try {
      await saveScoreToFirestore({
        name: entryName,
        code: entryCode,
        score: currentTotalScore,
        stars: starTotal,
        avatar: entryAvatar
      });
      triggerToast('🌟 파이어베이스 실시간 명예의 전당에 등록되었습니다!');
    } catch (e) {
      console.error('Failed to save score to Firebase:', e);
    }
  };

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

  const advanceStep = () => {
    setReaction(null);
    const nextIdx = stepIdx + 1;
    if (nextIdx < curStage.steps.length) {
      const nextStep = curStage.steps[nextIdx];

      // Execute immediate side-effects
      if (nextStep.type === 'bg') {
        setCurrentBg(nextStep.bg);
        setStepIdx(nextIdx + 1);
        return;
      }
      if (nextStep.type === 'fx') {
        if (nextStep.name === 'flash' || nextStep.name === 'winFlash') triggerFlash();
        if (nextStep.name === 'stageCrack') {
          sfx.crack();
          triggerShake();
        }
        if (nextStep.name === 'towerOn') {
          setGame(g => ({ ...g, towerOn: true, blocks: 6 }));
          sfx.win();
        }
        setStepIdx(nextIdx + 1);
        return;
      }
      if (nextStep.type === 'reward') {
        sfx.win();
        setGame(g => ({
          ...g,
          gear: g.gear.includes(nextStep.gear) ? g.gear : [...g.gear, nextStep.gear]
        }));
        setShowReward(nextStep.gear);
        setStepIdx(nextIdx + 1);
        return;
      }

      setStepIdx(nextIdx);
    } else {
      // Completed current stage
      finishStage(game.cur);
    }
  };

  const finishStage = (stageIdx: number) => {
    const st = game.mist <= 2 ? 3 : game.mist <= 5 ? 2 : 1;
    const bonus = game.blocks * 10;
    const finalStageScore = game.pts + bonus;

    const newStars = { ...game.stars, [stageIdx]: Math.max(game.stars[stageIdx] || 0, st) };
    const newScores = { ...game.scores, [stageIdx]: Math.max(game.scores[stageIdx] || 0, finalStageScore) };
    const nextUnlocked = Math.max(game.unlocked, stageIdx + 1);

    setGame(g => ({
      ...g,
      done: { ...g.done, [stageIdx]: true },
      unlocked: nextUnlocked,
      stars: newStars,
      scores: newScores
    }));

    if (stageIdx === 5) {
      // Epilogue finished
      saveToLeaderboard();
      setViewScreen('map');
      return;
    }

    setShowStageResult({
      title: STAGES[stageIdx].title,
      stars: st,
      pts: game.pts,
      blocks: game.blocks,
      mist: game.mist,
      clues: Object.keys(game.clues).length,
      hasNext: stageIdx < 5
    });
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
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col max-w-[1320px] mx-auto overflow-hidden">
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
            setGame(g => ({ ...g, unlocked: 5 }));
            triggerToast('모든 작전이 열렸습니다! (선생님 모드)');
          }}
        />
      )}

      {/* Top Header Bar */}
      <header id="top" className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0">
        <div id="brand" className="cursor-pointer" onClick={() => setViewScreen('map')}>
          북극곰 구조대
        </div>

        <div id="pips" className="hidden sm:flex gap-1.5 ml-2">
          {['프롤로그', '작전 1', '작전 2', '작전 3', '작전 4', '에필로그'].map((name, i) => (
            <span
              key={i}
              className={`pip ${game.done[i] ? 'done' : ''} ${game.cur === i ? 'on' : ''}`}
            >
              {name}
            </span>
          ))}
        </div>

        <div className="flex-1" />

        <button
          ref={noteBtnRef}
          className="tbtn"
          id="noteBtn"
          type="button"
          onClick={() => setShowNotes(true)}
        >
          단서 수첩 <span id="noteCount">{Object.keys(game.clues).length}</span>
        </button>

        <button
          className="tbtn"
          type="button"
          onClick={() => setViewScreen('map')}
        >
          작전 지도
        </button>

        <button
          className="tbtn"
          type="button"
          onClick={() => {
            const nextSound = !game.sound;
            setGame(g => ({ ...g, sound: nextSound }));
            setSoundEnabled(nextSound);
            sfx.tick();
          }}
        >
          {game.sound ? '소리 켬' : '소리 끔'}
        </button>
      </header>

      {/* Main Play Area */}
      <main id="main" className="grid grid-cols-[1fr_86px] sm:grid-cols-[1fr_150px] gap-3 px-3 sm:px-4 flex-1 min-h-0">
        <section
          id="stage"
          className={`relative rounded-3xl overflow-hidden min-h-0 border-4 border-amber-950 shadow-xl ${
            isShaking ? 'shake' : ''
          }`}
        >
          {/* Background SVG */}
          <div
            id="bg"
            className="absolute inset-0 pointer-events-none"
            dangerouslySetInnerHTML={{
              __html: BACKGROUNDS[currentBg] || BACKGROUNDS.classroom
            }}
          />

          {/* Layer: Mission or Stage Intro Banner */}
          <div
            id="layer"
            className="absolute inset-0 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          >
            {stageIntroActive ? (
              <div className="panel max-w-xl text-center">
                <span className="tag">{curStage.label}</span>
                <h2 className="justify-center text-3xl my-3">{curStage.title}</h2>
                <p className="guide text-lg">{curStage.goal}</p>
                <div className="flex justify-center mt-4">
                  <button
                    className="big"
                    type="button"
                    onClick={() => {
                      sfx.ok();
                      setStageIntroActive(false);
                    }}
                  >
                    출동하기! 🚀
                  </button>
                </div>
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

          {/* Flash FX */}
          {isFlashing && <div className="flash" />}
        </section>

        {/* Ice Tower Aside */}
        <TowerAside
          blocks={game.blocks}
          towerOn={game.towerOn}
          poriMood={game.blocks <= 2 ? 'scared' : game.blocks >= 9 ? 'joy' : 'happy'}
          wobble={wobblePori}
          happy={happyPori}
        />
      </main>

      {/* Bottom Dialogue Box */}
      {viewScreen === 'game' && !stageIntroActive && (
        <div className="px-3 sm:px-4 py-2.5">
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
          ) : (
            <div className="h-4" />
          )}
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

      {showReward && (
        <RewardModal
          gearId={showReward}
          onClose={() => setShowReward(null)}
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
