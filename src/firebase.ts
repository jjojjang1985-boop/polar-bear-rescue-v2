import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  query,
  orderBy,
  limit,
  where,
  getDocs,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection Validation as required by Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is unreachable.');
      return false;
    }
    // Document might not exist which is normal for test doc, connection itself succeeded
    return true;
  }
}

// Auto-run connection test on module load
testConnection();

export interface FirebaseLeaderboardItem {
  id: string;
  name: string;
  code: string;
  score: number;
  stars: number;
  avatar: 'a' | 'b' | 'c' | 'd';
  createdAt?: Timestamp | null;
  dateStr?: string;
}

/**
 * Subscribe to real-time leaderboard entries from Firestore
 */
export function subscribeToLeaderboard(
  onData: (items: FirebaseLeaderboardItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(
    collection(db, 'leaderboard'),
    orderBy('score', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    snapshot => {
      const results: FirebaseLeaderboardItem[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        let dateStr = '';
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          const d: Date = data.createdAt.toDate();
          dateStr = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
        } else {
          dateStr = new Date().toLocaleDateString('ko-KR');
        }

        results.push({
          id: docSnap.id,
          name: data.name || '레인저',
          code: data.code || '얼음별',
          score: typeof data.score === 'number' ? data.score : 0,
          stars: typeof data.stars === 'number' ? data.stars : 0,
          avatar: ['b', 'c', 'd'].includes(data.avatar) ? data.avatar : 'a',
          createdAt: data.createdAt || null,
          dateStr,
        });
      });
      onData(results);
    },
    error => {
      try {
        handleFirestoreError(error, OperationType.GET, 'leaderboard');
      } catch (e) {
        if (onError && e instanceof Error) {
          onError(e);
        }
      }
    }
  );
}

/**
 * Save new high score record to Firestore Leaderboard
 */
export async function saveScoreToFirestore(entry: {
  name: string;
  code: string;
  score: number;
  stars: number;
  avatar: 'a' | 'b' | 'c' | 'd';
}): Promise<string> {
  // Defensive input sanitization
  const cleanName = (entry.name || '북극레인저').trim().slice(0, 20);
  const cleanCode = (entry.code || '얼음별').trim().slice(0, 20);
  const cleanScore = Math.max(0, Math.min(100000, Math.round(entry.score)));
  const cleanStars = Math.max(0, Math.min(30, Math.round(entry.stars)));
  const cleanAvatar: 'a' | 'b' | 'c' | 'd' =
    entry.avatar === 'b' || entry.avatar === 'c' || entry.avatar === 'd' ? entry.avatar : 'a';

  const docId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, 'leaderboard', docId);

  try {
    await setDoc(docRef, {
      name: cleanName,
      code: cleanCode,
      score: cleanScore,
      stars: cleanStars,
      avatar: cleanAvatar,
      createdAt: serverTimestamp(),
    });
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `leaderboard/${docId}`);
  }
}

/**
 * Delete a score record (Admin only)
 */
export async function deleteScoreFromFirestore(docId: string): Promise<void> {
  const docRef = doc(db, 'leaderboard', docId);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `leaderboard/${docId}`);
  }
}

/**
 * Google Auth Helpers
 */
export async function signInWithGoogle(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };

/** 명예의 전당에 같은 이름이 이미 있는지 확인한다 (연결이 안 되면 false). */
export async function nameExistsOnline(name: string, timeoutMs = 3000): Promise<boolean> {
  try {
    const q = query(collection(db, 'leaderboard'), where('name', '==', name), limit(1));
    const timer = new Promise<boolean>(res => setTimeout(() => res(false), timeoutMs));
    return await Promise.race([getDocs(q).then(snap => !snap.empty), timer]);
  } catch {
    return false;
  }
}
