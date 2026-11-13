import { useState } from 'react';
import Celebration from '../components/Celebration.jsx';
import ExerciseMedia from '../components/ExerciseMedia.jsx';
import Toast from '../components/Toast.jsx';
import { DAY_COLORS } from '../data/plan.js';
import { addDays, formatDateShort, weekdayName } from '../lib/dates.js';
import { formatTarget } from '../lib/format.js';
import { createT, localizedName, localizedTitle } from '../lib/i18n.js';
import {
  dayForDate,
  dayIsRest,
  dayNumber,
  doneCountFor,
  isDayComplete,
  recordFor,
} from '../lib/planUtils.js';
import { useStore } from '../lib/store.jsx';

function nextWorkoutISO(days, iso) {
  for (let i = 1; i <= 8; i += 1) {
    const candidate = addDays(iso, i);
    const day = dayForDate(days, candidate);
    if (day && !day.rest && day.exercises?.length) return candidate;
  }
  return null;
}

export default function DayScreen({ iso }) {
  const { days, progress, settings, toggleDone, markCelebrated } = useStore();
  const lang = settings.lang;
  const t = createT(lang);
  const [toast, setToast] = useState('');
  const [celebrating, setCelebrating] = useState(false);

  const day = dayForDate(days, iso);
  const record = recordFor(progress, iso);
  const total = day?.exercises?.length || 0;
  const done = day ? doneCountFor(day, record) : 0;
  const rest = day ? dayIsRest(day) : false;
  const complete = day ? isDayComplete(day, record) : false;
  const colors = DAY_COLORS[day?.color] || DAY_COLORS.slate;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const doneSet = new Set(record.done || []);
  const dayTitle = day ? localizedTitle(day, lang) : '';

  const handleTick = (exercise) => {
    const wasDone = doneSet.has(exercise.id);
    toggleDone(iso, exercise);
    if (!wasDone) {
      const nextDone = day.exercises.every((e) => (e.id === exercise.id ? true : doneSet.has(e.id)));
      if (nextDone) {
        markCelebrated(iso);
        setCelebrating(true);
      } else {
        setToast(t('doneToast'));
      }
    }
  };

  if (!day) {
    return (
      <div className="day-screen">
        <div className="sub-head">
          <a className="back-btn" href="#/">← {t('back')}</a>
          <span className="sub-date">{formatDateShort(iso, lang)}</span>
        </div>
        <section className="card empty-card">
          <div className="empty-emoji" aria-hidden="true">🗓️</div>
          <h2>{t('noPlanToday')}</h2>
          <p>{t('noPlanHint')}</p>
          <a className="btn btn-soft" href="#/editor">⚙️ {t('openEditor')}</a>
        </section>
      </div>
    );
  }

  return (
    <div
      className="day-screen"
      style={{ '--day-base': colors.base, '--day-soft': colors.soft, '--day-ink': colors.ink }}
    >
      <div className="sub-head">
        <a className="back-btn" href="#/">← {t('back')}</a>
        <span className="sub-date">
          {weekdayName(iso, lang)}, {formatDateShort(iso, lang)}
        </span>
      </div>

      <section className="day-banner">
        <p className="eyebrow">
          {t('dayN', { n: dayNumber(days, day) })} · {weekdayName(iso, lang)}
        </p>
        <h1>{dayTitle || t('untitledDay')}</h1>
        {lang === 'kn' && day.titleEn && <p className="day-banner-en">{day.titleEn}</p>}

        {!rest && total > 0 && (
          <div className="day-banner-progress">
            <div className="bar" aria-hidden="true">
              <span style={{ width: `${pct}%` }} />
            </div>
            <p>{complete ? t('allDone') : t('dayProgress', { done, total })}</p>
          </div>
        )}
      </section>

      {rest && (
        <section className="card rest-card-inline">
          <div className="empty-emoji" aria-hidden="true">😊</div>
          <h2>{t('restToday')}</h2>
          <p>{t('restHint')}</p>
        </section>
      )}

      {!rest && total === 0 && (
        <section className="card empty-card">
          <div className="empty-emoji" aria-hidden="true">📝</div>
          <h2>{t('noExercises')}</h2>
          <a className="btn btn-soft" href="#/editor">⚙️ {t('openEditor')}</a>
        </section>
      )}

      {!rest && total > 0 && (
        <ol className="ex-list">
          {day.exercises.map((exercise, index) => {
            const isDone = doneSet.has(exercise.id);
            const name = localizedName(exercise, lang) || t('untitledExercise');
            return (
              <li key={exercise.id} className={`ex-card ${isDone ? 'is-done' : ''}`}>
                <a className="ex-main" href={`#/day/${iso}/ex/${exercise.id}`}>
                  <span className="ex-num" aria-hidden="true">{index + 1}</span>
                  <span className="ex-thumb">
                    <ExerciseMedia exercise={exercise} size="thumb" playing={false} />
                  </span>
                  <span className="ex-text">
                    <strong>{name}</strong>
                    {lang === 'kn' && exercise.nameEn && <small>{exercise.nameEn}</small>}
                    <span className="ex-target">{formatTarget(exercise.target, lang)}</span>
                  </span>
                </a>
                <button
                  type="button"
                  className={`tick ${isDone ? 'is-on' : ''}`}
                  aria-pressed={isDone}
                  aria-label={`${name}: ${isDone ? t('tickUndo') : t('tickDone')}`}
                  onClick={() => handleTick(exercise)}
                >
                  <span className="tick-mark" aria-hidden="true">{isDone ? '✓' : ''}</span>
                  <span className="tick-label">{isDone ? t('tickUndo') : t('tickDone')}</span>
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {complete && (
        <div className="day-complete-row">
          <span className="done-banner">✅ {t('allDone')}</span>
          <a className="btn btn-soft" href="#/week">📅 {t('viewWeek')}</a>
        </div>
      )}

      {celebrating && (
        <Celebration
          day={day}
          count={total}
          nextIso={nextWorkoutISO(days, iso)}
          onClose={() => setCelebrating(false)}
        />
      )}

      <Toast message={toast} onDone={() => setToast('')} />
    </div>
  );
}
