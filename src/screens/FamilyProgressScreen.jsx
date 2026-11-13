import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header.jsx';
import WeekStrip from '../components/WeekStrip.jsx';
import { subscribeSnapshot } from '../lib/cloudSync.js';
import { formatDateLong, todayISO } from '../lib/dates.js';
import { createT, localizedTitle } from '../lib/i18n.js';
import {
  dayForDate,
  dayIsRest,
  doneCountFor,
  exercisesTotal,
  isDayComplete,
  recordFor,
  streakFor,
  weekOverview,
} from '../lib/planUtils.js';
import { useStore } from '../lib/store.jsx';

const CACHE_KEY = 'sapna-family:cache';

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(snapshot) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    /* read-only views still work without a cache */
  }
}

export default function FamilyProgressScreen() {
  const { settings, cloudConfigured } = useStore();
  const lang = settings.lang;
  const t = createT(lang);
  const cached = useMemo(readCache, []);
  const [snapshot, setSnapshot] = useState(cached);
  const [status, setStatus] = useState(() => {
    if (!cloudConfigured) return cached ? 'cached' : 'noconfig';
    return cached ? 'cached' : 'loading';
  });
  const [failed, setFailed] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!cloudConfigured) {
      setStatus(cached ? 'cached' : 'noconfig');
      return undefined;
    }
    let cancelled = false;
    let unsubscribe = null;
    setFailed(null);
    if (!cached) setStatus('loading');
    subscribeSnapshot(
      (data) => {
        if (cancelled) return;
        if (!data) {
          setStatus('nodata');
          return;
        }
        setSnapshot(data);
        writeCache(data);
        setStatus(data.fromCache ? 'cached' : 'live');
      },
      (error) => {
        if (cancelled) return;
        const fallback = readCache();
        setFailed(error);
        if (fallback) setSnapshot(fallback);
        setStatus(fallback ? 'cached' : 'error');
      },
    )
      .then((fn) => {
        if (cancelled) fn();
        else unsubscribe = fn;
      })
      .catch((error) => {
        if (cancelled) return;
        const fallback = readCache();
        setFailed(error);
        if (fallback) setSnapshot(fallback);
        setStatus(fallback ? 'cached' : 'error');
      });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [cloudConfigured, reloadKey, cached]);

  const today = snapshot?.today || todayISO();
  const days = snapshot?.days || [];
  const progress = snapshot?.progress || {};
  const day = dayForDate(days, today);
  const record = recordFor(progress, today);
  const total = exercisesTotal(day);
  const done = day ? doneCountFor(day, record) : 0;
  const rest = day ? dayIsRest(day) : false;
  const complete = day ? isDayComplete(day, record) : false;
  const week = weekOverview(days, progress, today, today);
  const streak = streakFor(days, progress, today);
  const name =
    (lang === 'en'
      ? snapshot?.member?.shortEn || snapshot?.member?.nameEn
      : snapshot?.member?.shortKn || snapshot?.member?.nameKn) || '';

  const retry = () => {
    setStatus('loading');
    setReloadKey((n) => n + 1);
  };

  return (
    <div className="app family-app">
      <Header readOnly />
      <main className="screen family-screen">
        <div className="family-head">
          <span className="family-badge">👀 {t('familyBadge')}</span>
          <h1>{t('familyTitle')}</h1>
          {name ? <p className="family-name">{t('familyHeading', { name })}</p> : null}
          <p className="family-intro">{t('familyIntro')}</p>
        </div>

        {status === 'noconfig' && (
          <section className="card family-message">
            <div className="empty-emoji" aria-hidden="true">☁️</div>
            <h2>{t('syncTitle')}</h2>
            <p>{t('familyNoConfig')}</p>
          </section>
        )}

        {status === 'loading' && (
          <section className="card family-message">
            <p className="family-loading">{t('familyLoading')}</p>
          </section>
        )}

        {status === 'nodata' && (
          <section className="card family-message">
            <div className="empty-emoji" aria-hidden="true">📶</div>
            <h2>{t('familyNoData')}</h2>
            <button type="button" className="btn btn-soft" onClick={retry}>
              ↻ {t('familyRetry')}
            </button>
          </section>
        )}

        {status === 'error' && (
          <section className="card family-message">
            <div className="empty-emoji" aria-hidden="true">⚠️</div>
            <h2>{t('familyError')}</h2>
            {failed?.code === 'permission-denied' && <p>{t('familyNoPermission')}</p>}
            <button type="button" className="btn btn-soft" onClick={retry}>
              ↻ {t('familyRetry')}
            </button>
          </section>
        )}

        {snapshot && status !== 'noconfig' && status !== 'loading' && status !== 'nodata' && status !== 'error' && (
          <>
            <div className="family-meta">
              <span className={`family-chip ${status === 'live' ? 'is-live' : ''}`}>
                <span className="family-dot" aria-hidden="true" />
                {status === 'live' ? t('familyLive') : t('familyCached')}
              </span>
              {snapshot.updatedAt ? (
                <span className="family-updated">
                  {t('familyLastUpdated', {
                    time: new Date(snapshot.updatedAt).toLocaleString(lang === 'en' ? 'en-IN' : 'kn-IN'),
                  })}
                </span>
              ) : null}
            </div>

            <p className="family-date">{formatDateLong(today, lang)}</p>

            <section className="family-summary">
              <article className="card family-stat">
                <span className="family-stat-label">{t('familyToday')}</span>
                <strong>{day ? localizedTitle(day, lang) : t('familyNoPlan')}</strong>
                <span className="family-stat-note">
                  {rest
                    ? `🌙 ${t('rest')}`
                    : complete
                      ? `✓ ${t('complete')}`
                      : t('exercisesDone', { done, total })}
                </span>
              </article>
              <article className="card family-stat">
                <span className="family-stat-label">{t('familyStreak')}</span>
                <strong className={streak > 0 ? 'is-hot' : ''}>
                  {streak > 0 ? `🔥 ${t('streakLabel', { n: streak })}` : t('streakZero')}
                </strong>
              </article>
              <article className="card family-stat">
                <span className="family-stat-label">{t('familyThisWeek')}</span>
                <strong>{t('weekSummary', { done: week.done, total: week.total })}</strong>
              </article>
            </section>

            <WeekStrip items={week.items} today={today} readOnly />

            <p className="family-footnote">📶 {t('offlineNote')}</p>
          </>
        )}
      </main>
    </div>
  );
}
