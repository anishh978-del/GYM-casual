import { useEffect, useRef, useState } from 'react';
import ExerciseMedia from '../components/ExerciseMedia.jsx';
import RestTimer from '../components/RestTimer.jsx';
import Toast from '../components/Toast.jsx';
import { beep } from '../lib/audio.js';
import { formatClock, formatDuration, formatTarget, setsFor } from '../lib/format.js';
import { speakText, useSpeechVoice } from '../lib/hooks.js';
import { createT, localizedName, localizedSteps } from '../lib/i18n.js';
import {
  dayForDate,
  isExerciseDone,
  setsDoneFor,
} from '../lib/planUtils.js';
import { useStore } from '../lib/store.jsx';

export default function ExerciseScreen({ iso, exId }) {
  const { days, progress, settings, setSets, setDone, toggleDone } = useStore();
  const lang = settings.lang;
  const t = createT(lang);
  const voice = useSpeechVoice(lang);

  const [playing, setPlaying] = useState(true);
  const [slow, setSlow] = useState(false);
  const [restOpen, setRestOpen] = useState(false);
  const [toast, setToast] = useState('');

  const day = dayForDate(days, iso);
  const list = day?.exercises || [];
  const index = list.findIndex((e) => e.id === exId);
  const exercise = index >= 0 ? list[index] : null;

  useEffect(() => {
    setPlaying(true);
    setToast('');
  }, [exId]);

  if (!day || !exercise) {
    return (
      <div className="exercise-screen">
        <div className="sub-head">
          <a className="back-btn" href={`#/day/${iso}`}>← {t('back')}</a>
        </div>
        <section className="card empty-card">
          <div className="empty-emoji" aria-hidden="true">🤔</div>
          <h2>{t('noExercises')}</h2>
          <a className="btn btn-soft" href={`#/day/${iso}`}>{t('back')}</a>
        </section>
      </div>
    );
  }

  const record = progress?.[iso] || { done: [], sets: {} };
  const name = localizedName(exercise, lang) || t('untitledExercise');
  const steps = localizedSteps(exercise, lang);
  const total = setsFor(exercise);
  const doneSets = setsDoneFor(exercise, record);
  const isDone = isExerciseDone(progress, iso, exercise.id);
  const timed = exercise.target?.type === 'time';
  const prev = index > 0 ? list[index - 1] : null;
  const next = index < list.length - 1 ? list[index + 1] : null;
  const prevHref = prev ? `#/day/${iso}/ex/${prev.id}` : `#/day/${iso}`;
  const nextHref = next ? `#/day/${iso}/ex/${next.id}` : `#/day/${iso}`;

  const tapSet = (i) => {
    const nextCount = i + 1 <= doneSets ? i : i + 1;
    setSets(iso, exercise, nextCount);
    if (nextCount > doneSets && nextCount < total) {
      setRestOpen(true);
    } else if (nextCount >= total) {
      setToast(t('doneToast'));
    }
  };

  const speakSteps = () => {
    if (!voice || steps.length === 0) return;
    speakText(voice, `${name}. ${steps.map((step) => step.main).join(' ')}`, lang);
  };

  return (
    <div className="exercise-screen">
      <div className="sub-head">
        <a className="back-btn" href={`#/day/${iso}`}>← {t('back')}</a>
        <span className="sub-date">{index + 1} / {list.length}</span>
      </div>

      {isDone && (
        <div className="done-banner">
          <span aria-hidden="true">✅</span> {t('exerciseDone')}
        </div>
      )}

      <section className="media-card">
        <ExerciseMedia exercise={exercise} size="large" playing={playing} slow={slow} />
        <div className="media-controls">
          <button
            type="button"
            className={`media-btn ${playing ? 'is-on' : ''}`}
            aria-pressed={playing}
            onClick={() => setPlaying((p) => !p)}
          >
            <span aria-hidden="true">{playing ? '⏸' : '▶'}</span>{' '}
            {playing ? t('pause') : t('play')}
          </button>
          <button
            type="button"
            className={`media-btn ${slow ? 'is-on' : ''}`}
            aria-pressed={slow}
            onClick={() => setSlow((s) => !s)}
          >
            <span aria-hidden="true">{slow ? '🐢' : '⚡'}</span>{' '}
            {slow ? t('slow') : t('normal')}
          </button>
        </div>
      </section>

      <div className="exercise-title">
        <h1>{name}</h1>
        {lang === 'kn' && exercise.nameEn && <p className="exercise-en">{exercise.nameEn}</p>}
        <div className="title-row">
          <span className="target-chip">{formatTarget(exercise.target, lang)}</span>
          {voice && steps.length > 0 && (
            <button type="button" className="listen-btn" onClick={speakSteps}>
              🔊 {t('listen')}
            </button>
          )}
        </div>
      </div>

      <section className="card steps-card">
        <h2 className="card-title">{t('howTo')}</h2>
        {steps.length > 0 ? (
          <ol className="steps">
            {steps.map((step, i) => (
              <li key={i}>
                <span className="step-num" aria-hidden="true">{i + 1}</span>
                <span className="step-text">
                  <span className="step-kn">{step.main}</span>
                  {step.sub && <span className="step-en">{step.sub}</span>}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="tracker-hint">{t('noSteps')}</p>
        )}
      </section>

      <section className="card tracker-card">
        <h2 className="card-title">{timed ? t('timerTitle') : t('setsTitle')}</h2>
        {timed ? (
          <TimedTracker
            iso={iso}
            exercise={exercise}
            record={record}
            onRest={() => setRestOpen(true)}
            onToast={setToast}
          />
        ) : (
          <>
            <div className="set-grid">
              {Array.from({ length: total }, (_, i) => {
                const on = i < doneSets;
                return (
                  <button
                    key={i}
                    type="button"
                    className={`set-btn ${on ? 'is-done' : ''}`}
                    aria-pressed={on}
                    aria-label={`${t('setN', { n: i + 1 })}${on ? ' ✓' : ''}`}
                    onClick={() => tapSet(i)}
                  >
                    <span className="set-circle" aria-hidden="true">{on ? '✓' : i + 1}</span>
                    <span className="set-cap">{t('setN', { n: i + 1 })}</span>
                  </button>
                );
              })}
            </div>
            <p className="tracker-hint">{t('tapSetHint')}</p>
          </>
        )}

        <div className="tracker-actions">
          <button type="button" className="btn btn-soft" onClick={() => setRestOpen(true)}>
            ⏱ {t('restBtn')}
          </button>
          {!isDone ? (
            <button type="button" className="btn btn-outline" onClick={() => setDone(iso, exercise, true)}>
              ✓ {t('markDone')}
            </button>
          ) : (
            <button type="button" className="btn btn-outline" onClick={() => toggleDone(iso, exercise)}>
              {t('markUndone')}
            </button>
          )}
        </div>
      </section>

      <div className="safety-banner" role="note">
        <span className="safety-icon" aria-hidden="true">✋</span>
        <span className="safety-text">
          <strong>{t('safety')}</strong>
          {t('safetyEn') && <small>{t('safetyEn')}</small>}
        </span>
      </div>

      <div className="exercise-nav">
        <a className="btn btn-soft" href={prevHref}>
          {t('prev')}
        </a>
        <a className="btn btn-primary" href={nextHref}>
          {next ? t('next') : t('finish')}
        </a>
      </div>

      {restOpen && <RestTimer seconds={60} onClose={() => setRestOpen(false)} />}
      <Toast message={toast} onDone={() => setToast('')} />
    </div>
  );
}

function TimedTracker({ iso, exercise, record, onRest, onToast }) {
  const { settings, progress, setSets, setDone, toggleDone } = useStore();
  const lang = settings.lang;
  const t = createT(lang);
  const total = setsFor(exercise);
  const doneSets = setsDoneFor(exercise, record);
  const seconds = exercise.target?.seconds || 60;
  const isDone = isExerciseDone(progress, iso, exercise.id);

  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const finished = useRef(false);

  useEffect(() => {
    if (doneSets >= total) {
      setRunning(false);
      return;
    }
    setRemaining(seconds);
    setRunning(false);
    finished.current = false;
  }, [seconds, doneSets, total]);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (remaining > 0 || !running || finished.current) return;
    finished.current = true;
    setRunning(false);
    beep(3);
    const nextCount = Math.min(total, doneSets + 1);
    setSets(iso, exercise, nextCount);
    if (nextCount < total) onRest();
    else onToast(t('doneToast'));
  }, [remaining, running]);

  const reset = () => {
    setRunning(false);
    setRemaining(seconds);
    finished.current = false;
  };

  return (
    <div className="timed">
      <div className="timer-clock" aria-live="polite">
        {doneSets >= total ? '✓' : formatClock(remaining)}
      </div>
      <p className="timer-sub">
        {formatDuration(seconds, lang)} · {doneSets}/{total} {t('setsTitle')}
      </p>
      <div className="mini-sets" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i < doneSets ? 'is-done' : ''} />
        ))}
      </div>

      <div className="timer-controls">
        <button
          type="button"
          className="btn btn-primary"
          disabled={doneSets >= total}
          onClick={() => setRunning((r) => !r)}
        >
          {running ? t('timerPause') : remaining < seconds ? t('timerResume') : t('timerStart')}
        </button>
        <button type="button" className="btn btn-soft" onClick={reset}>
          {t('timerReset')}
        </button>
      </div>

      <div className="tracker-actions">
        <button
          type="button"
          className="btn btn-outline"
          disabled={isDone}
          onClick={() => setDone(iso, exercise, true)}
        >
          {t('finishWithoutTimer')}
        </button>
        {isDone && (
          <button type="button" className="btn btn-outline" onClick={() => toggleDone(iso, exercise)}>
            {t('markUndone')}
          </button>
        )}
      </div>
    </div>
  );
}
