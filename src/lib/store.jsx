import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { defaultPlan } from '../data/plan.js';
import { isCloudConfigured } from '../data/firebaseConfig.js';
import { pushSnapshot } from './cloudSync.js';
import { setsFor } from './format.js';
import { sanitizeDays } from './planUtils.js';

const STORAGE_KEY = 'sapna-fitness:v1';
const LEGACY_STORAGE_KEY = 'vani-fitness:v1';
const LAST_SYNC_KEY = 'sapna-fitness:lastSync';

const DEFAULT_SETTINGS = {
  lang: 'kn', // Kannada first
  scale: 1, // text scale, 1 → 1.125 → 1.25
  pin: '1234',
  sync: true, // only runs when firebaseConfig is filled in
};

const SCALE_STEPS = [1, 1.125, 1.25];

function freshState() {
  const plan = defaultPlan();
  return { meta: plan.meta, days: plan.days, progress: {}, settings: { ...DEFAULT_SETTINGS } };
}

function migrateMeta(meta) {
  const next = { ...meta };
  for (const [key, value] of Object.entries(next)) {
    if (typeof value === 'string') {
      next[key] = value.replaceAll('ವಾಣಿ', 'ಸಪ್ನಾ').replaceAll('Vani', 'Sapna');
    }
  }
  return next;
}

function loadState() {
  let saved = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) saved = JSON.parse(raw);
  } catch {
    saved = null;
  }
  const base = freshState();
  if (!saved) return base;
  return {
    meta: migrateMeta({ ...base.meta, ...(saved.meta || {}) }),
    days: Array.isArray(saved.days) && saved.days.length ? sanitizeDays(saved.days) : base.days,
    progress: saved.progress && typeof saved.progress === 'object' ? saved.progress : {},
    settings: {
      ...DEFAULT_SETTINGS,
      ...(saved.settings || {}),
      pin: /^\d{4}$/.test(saved.settings?.pin) ? saved.settings.pin : DEFAULT_SETTINGS.pin,
    },
  };
}

function readLastSync() {
  try {
    return Number(localStorage.getItem(LAST_SYNC_KEY)) || 0;
  } catch {
    return 0;
  }
}

function initialSyncStatus() {
  if (!isCloudConfigured()) return 'unconfigured';
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'offline';
  return 'idle';
}

function cloneRecord(rec) {
  return {
    done: Array.isArray(rec?.done) ? [...rec.done] : [],
    sets: rec?.sets && typeof rec.sets === 'object' ? { ...rec.sets } : {},
    celebrated: Boolean(rec?.celebrated),
  };
}

function withRecord(progress, iso, change) {
  const next = cloneRecord(progress[iso]);
  change(next);
  return { ...progress, [iso]: next };
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(loadState);
  const [storageError, setStorageError] = useState(false);
  const [syncState, setSyncState] = useState(() => ({
    status: initialSyncStatus(),
    lastSyncedAt: readLastSync(),
  }));
  const saveTimer = useRef(null);

  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setStorageError(false);
      } catch {
        setStorageError(true);
      }
    }, 150);
    return () => clearTimeout(saveTimer.current);
  }, [state]);

  const setSetting = useCallback((patch) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const setLang = useCallback((lang) => setSetting({ lang }), [setSetting]);

  const changeScale = useCallback((direction) => {
    setState((s) => {
      const i = SCALE_STEPS.indexOf(s.settings.scale);
      const nextIndex = Math.min(
        SCALE_STEPS.length - 1,
        Math.max(0, (i === -1 ? 0 : i) + direction),
      );
      return { ...s, settings: { ...s.settings, scale: SCALE_STEPS[nextIndex] } };
    });
  }, []);

  const setDone = useCallback((iso, exercise, done) => {
    const total = setsFor(exercise);
    setState((s) => ({
      ...s,
      progress: withRecord(s.progress, iso, (rec) => {
        const set = new Set(rec.done);
        if (done) {
          set.add(exercise.id);
          rec.sets[exercise.id] = total;
        } else {
          set.delete(exercise.id);
          rec.sets[exercise.id] = 0;
        }
        rec.done = [...set];
      }),
    }));
  }, []);

  const toggleDone = useCallback((iso, exercise) => {
    setState((s) => {
      const doneNow = Boolean(s.progress[iso]?.done?.includes(exercise.id));
      return {
        ...s,
        progress: withRecord(s.progress, iso, (rec) => setDoneRecord(rec, exercise, !doneNow)),
      };
    });
  }, []);

  const setSets = useCallback((iso, exercise, count) => {
    const total = setsFor(exercise);
    const clamped = Math.max(0, Math.min(total, count));
    setState((s) => ({
      ...s,
      progress: withRecord(s.progress, iso, (rec) => {
        rec.sets[exercise.id] = clamped;
        const set = new Set(rec.done);
        if (clamped >= total) set.add(exercise.id);
        else set.delete(exercise.id);
        rec.done = [...set];
      }),
    }));
  }, []);

  const markCelebrated = useCallback((iso) => {
    setState((s) => ({
      ...s,
      progress: withRecord(s.progress, iso, (rec) => {
        rec.celebrated = true;
      }),
    }));
  }, []);

  const updateDays = useCallback((days) => {
    setState((s) => ({ ...s, days }));
  }, []);

  const updateMeta = useCallback((meta) => {
    setState((s) => ({ ...s, meta }));
  }, []);

  const resetPlan = useCallback(() => {
    const plan = defaultPlan();
    setState((s) => ({ ...s, meta: plan.meta, days: plan.days }));
  }, []);

  const replacePlan = useCallback((meta, days) => {
    setState((s) => ({ ...s, meta: { ...s.meta, ...meta }, days }));
  }, []);

  const checkPin = useCallback((pin) => /^\d{4}$/.test(pin) && pin === state.settings.pin, [state.settings.pin]);

  const pushNow = useCallback(
    async (force = false) => {
      if (!force && !state.settings.sync) return;
      if (!isCloudConfigured()) {
        setSyncState((s) => (s.status === 'unconfigured' ? s : { ...s, status: 'unconfigured' }));
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        setSyncState((s) => (s.status === 'offline' ? s : { ...s, status: 'offline' }));
        return;
      }
      setSyncState((s) => ({ ...s, status: 'syncing' }));
      try {
        const at = await pushSnapshot(state.meta, state.days, state.progress);
        try {
          localStorage.setItem(LAST_SYNC_KEY, String(at));
        } catch {
          /* cache the timestamp only when storage allows it */
        }
        setSyncState({ status: 'synced', lastSyncedAt: at });
      } catch {
        setSyncState((s) => ({ ...s, status: 'error' }));
      }
    },
    [state.meta, state.days, state.progress, state.settings.sync],
  );

  useEffect(() => {
    if (!state.settings.sync) {
      setSyncState((s) => (s.status === 'off' ? s : { ...s, status: 'off' }));
      return undefined;
    }
    if (!isCloudConfigured()) {
      setSyncState((s) => (s.status === 'unconfigured' ? s : { ...s, status: 'unconfigured' }));
      return undefined;
    }
    const timer = setTimeout(() => {
      pushNow();
    }, 2500);
    return () => clearTimeout(timer);
  }, [state.meta, state.days, state.progress, state.settings.sync, pushNow]);

  useEffect(() => {
    const onOnline = () => {
      setSyncState((s) => (s.status === 'offline' ? { ...s, status: 'idle' } : s));
      pushNow();
    };
    const onOffline = () => setSyncState((s) => ({ ...s, status: 'offline' }));
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [pushNow]);

  const syncNow = useCallback(() => {
    pushNow(true);
  }, [pushNow]);

  const value = useMemo(
    () => ({
      meta: state.meta,
      days: state.days,
      progress: state.progress,
      settings: state.settings,
      storageError,
      sync: syncState,
      cloudConfigured: isCloudConfigured(),
      syncNow,
      setLang,
      setSetting,
      changeScale,
      setDone,
      toggleDone,
      setSets,
      markCelebrated,
      updateDays,
      updateMeta,
      resetPlan,
      replacePlan,
      checkPin,
    }),
    [state, storageError, syncState, syncNow, setLang, setSetting, changeScale, setDone, toggleDone, setSets, markCelebrated, updateDays, updateMeta, resetPlan, replacePlan, checkPin],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function setDoneRecord(rec, exercise, done) {
  const total = setsFor(exercise);
  const set = new Set(rec.done);
  if (done) {
    set.add(exercise.id);
    rec.sets[exercise.id] = total;
  } else {
    set.delete(exercise.id);
    rec.sets[exercise.id] = 0;
  }
  rec.done = [...set];
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export { SCALE_STEPS };
