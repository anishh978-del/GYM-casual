// Optional Firestore mirror of the local progress. The app never waits for the
// network: localStorage stays the source of truth and this module only pushes a
// compact summary and lets the family page listen to it.

import { CLOUD_COLLECTION, CLOUD_DOC_ID, firebaseConfig, isCloudConfigured } from '../data/firebaseConfig.js';
import { addDays, todayISO } from './dates.js';
import { streakFor, weekOverview } from './planUtils.js';

const HISTORY_DAYS = 120;
let libsPromise = null;

async function getLibs() {
  if (!isCloudConfigured()) throw new Error('Firebase is not configured');
  if (!libsPromise) {
    libsPromise = Promise.all([import('firebase/app'), import('firebase/firestore')])
      .then(([app, firestore]) => {
        const instance = app.getApps().length ? app.getApps()[0] : app.initializeApp(firebaseConfig);
        return { app, firestore, db: firestore.getFirestore(instance) };
      })
      .catch((error) => {
        libsPromise = null;
        throw error;
      });
  }
  return libsPromise;
}

function summarizeDays(days) {
  return (days || []).map((day) => ({
    id: day.id,
    weekday: day.weekday,
    titleKn: day.titleKn,
    titleEn: day.titleEn,
    color: day.color,
    rest: Boolean(day.rest),
    exercises: (day.exercises || []).map((exercise) => ({
      id: exercise.id,
      nameKn: exercise.nameKn,
      nameEn: exercise.nameEn,
      target: exercise.target,
    })),
  }));
}

function recentProgress(progress, today) {
  const cutoff = addDays(today, -HISTORY_DAYS);
  const out = {};
  for (const [iso, record] of Object.entries(progress || {})) {
    if (iso < cutoff) continue;
    out[iso] = {
      done: Array.isArray(record?.done) ? record.done : [],
      sets: record?.sets && typeof record.sets === 'object' ? record.sets : {},
      celebrated: Boolean(record?.celebrated),
    };
  }
  return out;
}

export function buildSnapshot(meta, days, progress, now = Date.now()) {
  const today = todayISO();
  const week = weekOverview(days, progress, today, today);
  return {
    version: 1,
    updatedAt: now,
    member: {
      nameKn: meta?.memberKn || '',
      nameEn: meta?.memberEn || '',
      shortKn: meta?.memberShortKn || '',
      shortEn: meta?.memberShortEn || '',
    },
    profile: {
      gym: meta?.gym || '',
      program: meta?.program || '',
      trainerKn: meta?.trainerKn || '',
      trainerEn: meta?.trainerEn || '',
      start: meta?.start || '',
      end: meta?.end || '',
      age: meta?.age ?? '',
    },
    today,
    days: summarizeDays(days),
    progress: recentProgress(progress, today),
    streak: streakFor(days, progress, today),
    week: { done: week.done, total: week.total },
  };
}

export async function pushSnapshot(meta, days, progress) {
  const { db, firestore } = await getLibs();
  const snapshot = buildSnapshot(meta, days, progress);
  await firestore.setDoc(
    firestore.doc(db, CLOUD_COLLECTION, CLOUD_DOC_ID),
    snapshot,
  );
  return snapshot.updatedAt;
}

export async function subscribeSnapshot(onData, onError) {
  const { db, firestore } = await getLibs();
  return firestore.onSnapshot(
    firestore.doc(db, CLOUD_COLLECTION, CLOUD_DOC_ID),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData({ ...snap.data(), fromCache: Boolean(snap.metadata?.fromCache) });
    },
    (error) => onError(error),
  );
}
