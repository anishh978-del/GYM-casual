import { useState } from 'react';
import ExerciseMedia from '../components/ExerciseMedia.jsx';
import { DAY_COLORS } from '../data/plan.js';
import { IMAGE_PAIRS } from '../data/exerciseMedia.js';
import { todayISO, weekdayName } from '../lib/dates.js';
import { formatTarget } from '../lib/format.js';
import { createT, localizedName, localizedTitle } from '../lib/i18n.js';
import { sanitizeDays } from '../lib/planUtils.js';
import { useStore } from '../lib/store.jsx';

const SESSION_KEY = 'sapna-editor-unlocked';
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAY_ISO = ['2026-11-08', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07'];

const COLOR_KEYS = ['blue', 'green', 'red', 'purple', 'orange', 'teal', 'slate'];
const COLOR_LABEL_KEYS = {
  blue: 'colorBlue',
  green: 'colorGreen',
  red: 'colorRed',
  purple: 'colorPurple',
  orange: 'colorOrange',
  teal: 'colorTeal',
  slate: 'colorSlate',
};

const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const newExercise = () => ({
  id: uid('ex'),
  nameKn: '',
  nameEn: '',
  target: { type: 'reps', reps: 15, sets: 3 },
  steps: [
    { kn: '', en: '' },
    { kn: '', en: '' },
    { kn: '', en: '' },
  ],
});

export default function EditorScreen() {
  const [unlocked, setUnlocked] = useState(readUnlocked);
  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;
  return <EditorBody />;
}

function readUnlocked() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function PinGate({ onUnlock }) {
  const { settings, checkPin } = useStore();
  const t = createT(settings.lang);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    if (checkPin(pin)) {
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        /* session storage may be unavailable */
      }
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="editor-screen pin-screen">
      <div className="sub-head">
        <a className="back-btn" href="#/">← {t('back')}</a>
      </div>
      <section className="card pin-card">
        <div className="pin-emoji" aria-hidden="true">🔒</div>
        <h1>{t('openEditor')}</h1>
        <p className="pin-hint">{t('enterPin')}</p>
        <form onSubmit={submit} className="pin-form">
          <input
            className={`pin-input ${error ? 'is-error' : ''}`}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            autoFocus
            aria-label={t('pinLabel')}
            onChange={(event) => {
              setPin(event.target.value.replace(/\D/g, '').slice(0, 4));
              setError(false);
            }}
          />
          {error && <p className="form-error" role="alert">{t('wrongPin')}</p>}
          <button type="submit" className="btn btn-primary" disabled={pin.length !== 4}>
            🔓 {t('continueBtn')}
          </button>
        </form>
      </section>
    </div>
  );
}

function EditorBody() {
  const { meta, days, settings, updateDays, updateMeta, resetPlan, replacePlan, setSetting } = useStore();
  const lang = settings.lang;
  const t = createT(lang);
  const tEn = createT('en');
  const [tab, setTab] = useState('days');
  const [editing, setEditing] = useState(null);

  const saveDay = (day, isNew) => {
    const clean = { ...day, titleKn: day.titleKn.trim(), titleEn: day.titleEn.trim() };
    updateDays(isNew ? [...days, clean] : days.map((d) => (d.id === clean.id ? clean : d)));
    setEditing(null);
  };

  const deleteDay = (id) => {
    if (!window.confirm(t('deleteDayConfirm'))) return;
    updateDays(days.filter((d) => d.id !== id));
    setEditing(null);
  };

  const moveDay = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= days.length) return;
    const next = [...days];
    [next[index], next[target]] = [next[target], next[index]];
    updateDays(next);
  };

  const addDay = () => {
    const used = new Set(days.map((d) => d.weekday));
    const weekday = WEEKDAY_ORDER.find((w) => !used.has(w)) ?? days.length % 7;
    setEditing({
      isNew: true,
      day: {
        id: uid('day'),
        weekday,
        titleKn: '',
        titleEn: '',
        color: 'blue',
        rest: false,
        exercises: [],
      },
    });
  };

  if (editing) {
    return (
      <DayForm
        day={editing.day}
        isNew={editing.isNew}
        onSave={(day) => saveDay(day, editing.isNew)}
        onDelete={deleteDay}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="editor-screen">
      <div className="sub-head">
        <a className="back-btn" href="#/">← {t('back')}</a>
        <span className="sub-date">⚙️ {t('openEditor')}</span>
      </div>

      <div className="editor-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'days'}
          className={tab === 'days' ? 'is-active' : ''}
          onClick={() => setTab('days')}
        >
          {t('tabDays')}
          {lang === 'kn' && <small>{tEn('tabDays')}</small>}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'profile'}
          className={tab === 'profile' ? 'is-active' : ''}
          onClick={() => setTab('profile')}
        >
          {t('tabProfile')}
          {lang === 'kn' && <small>{tEn('tabProfile')}</small>}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'data'}
          className={tab === 'data' ? 'is-active' : ''}
          onClick={() => setTab('data')}
        >
          {t('tabData')}
          {lang === 'kn' && <small>{tEn('tabData')}</small>}
        </button>
      </div>

      {tab === 'days' && (
        <section className="editor-section">
          <p className="editor-hint">{t('editorDaysHint')}</p>
          <button type="button" className="btn btn-primary add-day-btn" onClick={addDay}>
            {t('addDay')}
          </button>
          <ul className="editor-days">
            {days.map((day, index) => {
              const colors = DAY_COLORS[day.color] || DAY_COLORS.slate;
              return (
                <li key={day.id} className="editor-day">
                  <span className="ed-swatch" style={{ background: colors.base }} aria-hidden="true" />
                  <span className="ed-day-main">
                    <strong>{localizedTitle(day, lang) || t('untitledDay')}</strong>
                    <small>
                      {weekdayName(WEEKDAY_ISO[day.weekday], lang)} ·{' '}
                      {day.rest ? '🌙' : t('exercisesCount', { n: day.exercises.length })}
                    </small>
                  </span>
                  <span className="ed-actions">
                    <button
                      type="button"
                      aria-label={t('editDay')}
                      onClick={() => setEditing({ isNew: false, day })}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      aria-label={t('moveUp')}
                      disabled={index === 0}
                      onClick={() => moveDay(index, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={t('moveDown')}
                      disabled={index === days.length - 1}
                      onClick={() => moveDay(index, 1)}
                    >
                      ↓
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {tab === 'profile' && (
        <ProfileTab
          meta={meta}
          settings={settings}
          onSaveMeta={updateMeta}
          onSavePin={(pin) => setSetting({ pin })}
        />
      )}

      {tab === 'data' && (
        <DataTab
          meta={meta}
          days={days}
          onReset={resetPlan}
          onImport={(nextMeta, nextDays) => replacePlan(nextMeta, nextDays)}
        />
      )}
    </div>
  );
}

function DayForm({ day, isNew, onSave, onDelete, onCancel }) {
  const { settings } = useStore();
  const t = createT(settings.lang);
  const lang = settings.lang;
  const [draft, setDraft] = useState(() => structuredClone(day));
  const [exEditing, setExEditing] = useState(null);

  const patch = (next) => setDraft((d) => ({ ...d, ...next }));

  const setExercise = (index, exercise) => {
    setDraft((d) => ({
      ...d,
      exercises: d.exercises.map((e, i) => (i === index ? exercise : e)),
    }));
  };

  const saveExercise = (exercise) => {
    if (exEditing.index >= 0) setExercise(exEditing.index, exercise);
    else setDraft((d) => ({ ...d, exercises: [...d.exercises, exercise] }));
    setExEditing(null);
  };

  const deleteExercise = (index) => {
    if (!window.confirm(t('deleteExerciseConfirm'))) return;
    setDraft((d) => ({ ...d, exercises: d.exercises.filter((_, i) => i !== index) }));
  };

  const moveExercise = (index, direction) => {
    setDraft((d) => {
      const target = index + direction;
      if (target < 0 || target >= d.exercises.length) return d;
      const exercises = [...d.exercises];
      [exercises[index], exercises[target]] = [exercises[target], exercises[index]];
      return { ...d, exercises };
    });
  };

  if (exEditing) {
    return (
      <ExerciseForm
        exercise={exEditing.exercise}
        isNew={exEditing.index < 0}
        onSave={saveExercise}
        onCancel={() => setExEditing(null)}
      />
    );
  }

  const heading = isNew ? t('newDay') : localizedTitle(draft, lang) || t('untitledDay');

  return (
    <div className="editor-screen">
      <div className="sub-head">
        <button type="button" className="back-btn" onClick={onCancel}>← {t('back')}</button>
        <span className="sub-date">{heading}</span>
      </div>

      <section className="card form-card">
        <h1 className="form-title">{heading}</h1>

        <div className="field-grid">
          {lang === 'kn' && (
            <label className="field">
              <span>{t('nameKn')}</span>
              <input
                value={draft.titleKn}
                onChange={(e) => patch({ titleKn: e.target.value })}
                placeholder={t('dayKnPlaceholder')}
              />
            </label>
          )}
          <label className="field">
            <span>{t('nameEn')}</span>
            <input
              value={draft.titleEn}
              onChange={(e) => patch({ titleEn: e.target.value })}
              placeholder={t('dayEnPlaceholder')}
            />
          </label>
          <label className="field">
            <span>{t('weekdayField')}</span>
            <select value={draft.weekday} onChange={(e) => patch({ weekday: Number(e.target.value) })}>
              {WEEKDAY_ORDER.map((value) => (
                <option key={value} value={value}>
                  {weekdayName(WEEKDAY_ISO[value], lang)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t('colorField')}</span>
            <select value={draft.color} onChange={(e) => patch({ color: e.target.value })}>
              {COLOR_KEYS.map((key) => (
                <option key={key} value={key}>{t(COLOR_LABEL_KEYS[key])}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="check-row">
          <input
            type="checkbox"
            checked={Boolean(draft.rest)}
            onChange={(e) => patch({ rest: e.target.checked })}
          />
          <span>{t('restDayField')}</span>
        </label>

        {!draft.rest && (
          <div className="editor-exercises">
            <div className="editor-ex-head">
              <h2>{t('exercisesHeading')}</h2>
              <span>{draft.exercises.length}</span>
            </div>
            {draft.exercises.length === 0 && (
              <p className="editor-hint">{t('noExercisesEditor')}</p>
            )}
            <ol className="editor-ex-list">
              {draft.exercises.map((exercise, index) => (
                <li key={exercise.id} className="editor-ex">
                  <span className="ed-num" aria-hidden="true">{index + 1}</span>
                  <span className="ed-name">
                    <strong>{localizedName(exercise, lang) || t('untitledExercise')}</strong>
                    <small>
                      {lang === 'kn' && exercise.nameEn ? `${exercise.nameEn} · ` : ''}
                      {formatTarget(exercise.target, lang)}
                    </small>
                  </span>
                  <span className="ed-actions">
                    <button
                      type="button"
                      aria-label={t('editExercise')}
                      onClick={() => setExEditing({ index, exercise })}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      aria-label={t('moveUp')}
                      disabled={index === 0}
                      onClick={() => moveExercise(index, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={t('moveDown')}
                      disabled={index === draft.exercises.length - 1}
                      onClick={() => moveExercise(index, 1)}
                    >
                      ↓
                    </button>
                    <button type="button" aria-label={t('deleteExercise')} onClick={() => deleteExercise(index)}>
                      🗑
                    </button>
                  </span>
                </li>
              ))}
            </ol>
            <button
              type="button"
              className="btn btn-soft"
              onClick={() => setExEditing({ index: -1, exercise: newExercise() })}
            >
              {t('addExercise')}
            </button>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={() => onSave(draft)}>
            {t('save')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {t('close')}
          </button>
          {!isNew && (
            <button type="button" className="btn btn-danger" onClick={() => onDelete(draft.id)}>
              🗑 {t('deleteDay')}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function ExerciseForm({ exercise, isNew, onSave, onCancel }) {
  const { settings } = useStore();
  const t = createT(settings.lang);
  const lang = settings.lang;
  const [draft, setDraft] = useState(() => structuredClone(exercise));
  const [error, setError] = useState('');

  const patch = (next) => setDraft((d) => ({ ...d, ...next }));
  const patchTarget = (next) => setDraft((d) => ({ ...d, target: { ...d.target, ...next } }));
  const target = draft.target || { type: 'sets', sets: 3 };

  const changeType = (type) => {
    const sets = Math.max(1, Number(target.sets) || 1);
    if (type === 'sets') patchTarget({ type, sets });
    else if (type === 'reps') patchTarget({ type, reps: Number(target.reps) || 15, sets });
    else patchTarget({ type, seconds: Number(target.seconds) || 60, sets });
  };

  const updateStep = (index, next) =>
    patch({ steps: draft.steps.map((step, i) => (i === index ? { ...step, ...next } : step)) });
  const addStep = () => patch({ steps: [...draft.steps, { kn: '', en: '' }] });
  const removeStep = (index) => patch({ steps: draft.steps.filter((_, i) => i !== index) });

  const media = draft.media;
  const mode = media?.type || 'auto';

  const changeMode = (nextMode) => {
    if (nextMode === 'auto') patch({ media: undefined });
    else if (nextMode === 'pair') patch({ media: { type: 'pair', datasetId: IMAGE_PAIRS[0].id } });
    else if (nextMode === 'youtube') patch({ media: { type: 'youtube', url: '' } });
    else patch({ media: { type: nextMode, src: '' } });
  };

  const upload = (file) => {
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      setError(t('fileTooLarge'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setError('');
      patch({
        media: {
          type: file.type.startsWith('video') ? 'video' : 'image',
          src: reader.result,
          name: file.name,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!draft.nameKn.trim() && !draft.nameEn.trim()) {
      setError(t('enterNameError'));
      return;
    }
    if (media?.type === 'youtube' && !/youtu\.?be/.test(media.url || '')) {
      setError(t('youtubeError'));
      return;
    }
    if ((media?.type === 'video' || media?.type === 'image') && !media.src) {
      setError(t('chooseFileError'));
      return;
    }
    const seconds = Math.max(5, Number(target.seconds) || 60);
    const cleanTarget =
      target.type === 'time'
        ? { type: 'time', seconds, sets: Math.max(1, Number(target.sets) || 1) }
        : target.type === 'reps'
          ? {
              type: 'reps',
              reps: Math.max(1, Number(target.reps) || 1),
              sets: Math.max(1, Number(target.sets) || 1),
            }
          : { type: 'sets', sets: Math.max(1, Number(target.sets) || 1) };

    const steps = (draft.steps || [])
      .map((step) => ({ kn: step.kn.trim(), en: step.en.trim() }))
      .filter((step) => step.kn || step.en);

    onSave({
      ...draft,
      nameKn: draft.nameKn.trim(),
      nameEn: draft.nameEn.trim(),
      target: cleanTarget,
      steps,
    });
  };

  const heading = isNew ? t('newExercise') : localizedName(draft, lang) || t('untitledExercise');

  return (
    <div className="editor-screen">
      <div className="sub-head">
        <button type="button" className="back-btn" onClick={onCancel}>← {t('back')}</button>
        <span className="sub-date">{heading}</span>
      </div>

      <section className="card form-card">
        <h1 className="form-title">{heading}</h1>

        <div className="field-grid">
          {lang === 'kn' && (
            <label className="field">
              <span>{t('nameKn')}</span>
              <input
                value={draft.nameKn}
                onChange={(e) => patch({ nameKn: e.target.value })}
                placeholder={t('exerciseKnPlaceholder')}
              />
            </label>
          )}
          <label className="field">
            <span>{t('nameEn')}</span>
            <input
              value={draft.nameEn}
              onChange={(e) => patch({ nameEn: e.target.value })}
              placeholder={t('exerciseEnPlaceholder')}
            />
          </label>
        </div>

        <h2 className="form-section-title">{t('targetSection')}</h2>
        <div className="field-grid">
          <label className="field">
            <span>{t('typeField')}</span>
            <select value={target.type} onChange={(e) => changeType(e.target.value)}>
              <option value="sets">{t('optionSetsOnly')}</option>
              <option value="reps">{t('optionRepsSets')}</option>
              <option value="time">{t('optionTime')}</option>
            </select>
          </label>
          <label className="field">
            <span>{t('setsField')}</span>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              value={target.sets ?? 1}
              onChange={(e) => patchTarget({ sets: Number(e.target.value) })}
            />
          </label>
          {target.type === 'reps' && (
            <label className="field">
              <span>{t('repsField')}</span>
              <input
                type="number"
                min="1"
                inputMode="numeric"
                value={target.reps ?? 15}
                onChange={(e) => patchTarget({ reps: Number(e.target.value) })}
              />
            </label>
          )}
          {target.type === 'time' && (
            <>
              <label className="field">
                <span>{t('minutesField')}</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={Math.floor((Number(target.seconds) || 0) / 60)}
                  onChange={(e) => {
                    const minutes = Math.max(0, Number(e.target.value) || 0);
                    patchTarget({ seconds: minutes * 60 + ((Number(target.seconds) || 0) % 60) });
                  }}
                />
              </label>
              <label className="field">
                <span>{t('secondsField')}</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  inputMode="numeric"
                  value={(Number(target.seconds) || 0) % 60}
                  onChange={(e) => {
                    const seconds = Math.min(59, Math.max(0, Number(e.target.value) || 0));
                    patchTarget({ seconds: Math.floor((Number(target.seconds) || 0) / 60) * 60 + seconds });
                  }}
                />
              </label>
            </>
          )}
        </div>

        <h2 className="form-section-title">{t('stepsSection')}</h2>
        <div className="steps-editor">
          {draft.steps.map((step, index) => (
            <div key={index} className="step-edit">
              <span className="ed-num" aria-hidden="true">{index + 1}</span>
              {lang === 'kn' && (
                <label className="field">
                  <span>{t('kannadaLabel')}</span>
                  <input value={step.kn} onChange={(e) => updateStep(index, { kn: e.target.value })} />
                </label>
              )}
              <label className="field">
                <span>{t('englishLabel')}</span>
                <input value={step.en} onChange={(e) => updateStep(index, { en: e.target.value })} />
              </label>
              <button
                type="button"
                className="icon-btn"
                aria-label={t('removeStep')}
                onClick={() => removeStep(index)}
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost" onClick={addStep}>
            {t('addStep')}
          </button>
        </div>

        <h2 className="form-section-title">{t('demoMedia')}</h2>
        <div className="field-grid">
          <label className="field">
            <span>{t('sourceField')}</span>
            <select value={mode} onChange={(e) => changeMode(e.target.value)}>
              <option value="auto">{t('optionAuto')}</option>
              <option value="pair">{t('optionPair')}</option>
              <option value="youtube">{t('optionYoutube')}</option>
              <option value="video">{t('optionVideo')}</option>
              <option value="image">{t('optionImage')}</option>
            </select>
          </label>

          {mode === 'pair' && (
            <label className="field">
              <span>{t('datasetExercise')}</span>
              <select
                value={media.datasetId}
                onChange={(e) => patch({ media: { type: 'pair', datasetId: e.target.value } })}
              >
                {IMAGE_PAIRS.map((pair) => (
                  <option key={pair.id} value={pair.id}>{pair.name}</option>
                ))}
              </select>
            </label>
          )}

          {mode === 'youtube' && (
            <label className="field field-wide">
              <span>{t('youtubeLink')}</span>
              <input
                type="url"
                placeholder="https://youtu.be/…"
                value={media.url || ''}
                onChange={(e) => patch({ media: { type: 'youtube', url: e.target.value } })}
              />
            </label>
          )}

          {(mode === 'video' || mode === 'image') && (
            <label className="field field-wide">
              <span>{t('chooseFile')}</span>
              <input
                type="file"
                accept={mode === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/gif,image/*'}
                onChange={(e) => upload(e.target.files?.[0])}
              />
            </label>
          )}
        </div>

        {mode === 'auto' && (
          <p className="editor-hint">{t('autoMediaHint')}</p>
        )}
        {(mode === 'video' || mode === 'image') && media?.name && (
          <p className="editor-hint">{t('savedVideoHint', { name: media.name })}</p>
        )}

        <div className="media-preview">
          <ExerciseMedia exercise={draft} playing={false} />
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={save}>
            {t('save')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {t('close')}
          </button>
        </div>
      </section>
    </div>
  );
}

function ProfileTab({ meta, settings, onSaveMeta, onSavePin }) {
  const { sync, syncNow, cloudConfigured, setSetting } = useStore();
  const t = createT(settings.lang);
  const lang = settings.lang;
  const [draft, setDraft] = useState(() => ({ ...meta }));
  const [pin, setPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');
  const [saved, setSaved] = useState(false);

  const patch = (next) => {
    setDraft((d) => ({ ...d, ...next }));
    setSaved(false);
  };

  const save = () => {
    onSaveMeta({ ...draft, age: Math.max(1, Number(draft.age) || 1) });
    setSaved(true);
  };

  const savePin = () => {
    if (!/^\d{4}$/.test(pin)) {
      setPinMsg(t('pinDigitsError'));
      return;
    }
    onSavePin(pin);
    setPin('');
    setPinMsg(t('pinUpdated'));
  };

  const fields = [
    ...(lang === 'kn'
      ? [
          ['memberKn', t('memberNameKn')],
          ['memberShortKn', t('shortNameKn')],
        ]
      : []),
    ['memberEn', t('memberNameEn')],
    ['memberShortEn', t('shortNameEn')],
    ['gym', t('gymField')],
    ...(lang === 'kn' ? [['trainerKn', t('trainerKnField')]] : []),
    ['trainerEn', t('trainerEnField')],
    ['program', t('programField')],
  ];

  const statusText = {
    unconfigured: t('syncUnconfigured'),
    off: t('syncOff'),
    offline: t('syncOffline'),
    syncing: t('syncSyncing'),
    synced: t('syncSynced'),
    error: t('syncError'),
    idle: t('syncIdle'),
  }[sync.status] || t('syncIdle');

  const lastSynced = sync.lastSyncedAt
    ? t('syncedAt', {
        time: new Date(sync.lastSyncedAt).toLocaleTimeString(lang === 'en' ? 'en-IN' : 'kn-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
    : '';

  return (
    <section className="card form-card">
      <h1 className="form-title">{t('profileTitle')}</h1>
      <div className="field-grid">
        {fields.map(([key, label]) => (
          <label key={key} className="field">
            <span>{label}</span>
            <input value={draft[key] ?? ''} onChange={(e) => patch({ [key]: e.target.value })} />
          </label>
        ))}
        <label className="field">
          <span>{t('ageField')}</span>
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={draft.age ?? ''}
            onChange={(e) => patch({ age: e.target.value })}
          />
        </label>
        <label className="field">
          <span>{t('phoneField')}</span>
          <input
            type="tel"
            inputMode="tel"
            placeholder="+91…"
            value={draft.phone ?? ''}
            onChange={(e) => patch({ phone: e.target.value })}
          />
        </label>
        <label className="field">
          <span>{t('startField')}</span>
          <input type="date" value={draft.start ?? ''} onChange={(e) => patch({ start: e.target.value })} />
        </label>
        <label className="field">
          <span>{t('endField')}</span>
          <input type="date" value={draft.end ?? ''} onChange={(e) => patch({ end: e.target.value })} />
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-primary" onClick={save}>
          {t('saveProfile')}
        </button>
        {saved && <span className="saved-note">{t('savedNote')}</span>}
      </div>

      <h2 className="form-section-title">{t('syncTitle')}</h2>
      <label className="check-row">
        <input
          type="checkbox"
          checked={settings.sync !== false}
          onChange={(e) => setSetting({ sync: e.target.checked })}
        />
        <span>{t('syncEnable')}</span>
      </label>
      <p className="editor-hint">{t('syncHint')}</p>
      <div className="sync-row">
        <span className={`sync-status is-${sync.status}`}>{statusText}</span>
        <button
          type="button"
          className="btn btn-soft"
          disabled={!cloudConfigured || sync.status === 'syncing'}
          onClick={syncNow}
        >
          ⟳ {t('syncNow')}
        </button>
      </div>
      {lastSynced && <p className="editor-hint">{lastSynced}</p>}

      <h2 className="form-section-title">{t('changePin')}</h2>
      <div className="pin-change">
        <input
          className="pin-input small"
          type="tel"
          inputMode="numeric"
          maxLength={4}
          placeholder="••••"
          value={pin}
          aria-label={t('newPin')}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
            setPinMsg('');
          }}
        />
        <button type="button" className="btn btn-soft" onClick={savePin} disabled={settings.pin === pin}>
          {t('savePin')}
        </button>
      </div>
      {pinMsg && <p className="editor-hint">{pinMsg}</p>}
    </section>
  );
}

function DataTab({ meta, days, onReset, onImport }) {
  const { settings } = useStore();
  const t = createT(settings.lang);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');

  const buildJson = () =>
    JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), meta, days }, null, 2);

  const download = () => {
    const blob = new Blob([buildJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sapna-fitness-plan-${todayISO()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMsg(t('downloadedMsg'));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildJson());
      setMsg(t('copiedMsg'));
    } catch {
      setMsg(t('copyFailedMsg'));
    }
  };

  const applyImport = (raw) => {
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data.days) || data.days.length === 0) throw new Error('no days');
      if (!window.confirm(t('replaceConfirm'))) return;
      onImport(data.meta || {}, sanitizeDays(data.days));
      setMsg(t('importedMsg'));
      setText('');
    } catch {
      setMsg(t('invalidJsonMsg'));
    }
  };

  const importFile = async (file) => {
    if (!file) return;
    try {
      applyImport(await file.text());
    } catch {
      setMsg(t('fileReadMsg'));
    }
  };

  const reset = () => {
    if (!window.confirm(t('resetConfirm'))) return;
    onReset();
    setMsg(t('resetDoneMsg'));
  };

  return (
    <section className="card form-card">
      <h1 className="form-title">{t('dataTitle')}</h1>
      <p className="editor-hint">{t('dataHint')}</p>

      <div className="form-actions">
        <button type="button" className="btn btn-primary" onClick={download}>
          {t('exportJson')}
        </button>
        <button type="button" className="btn btn-soft" onClick={copy}>
          {t('copyJson')}
        </button>
      </div>

      <h2 className="form-section-title">{t('importTitle')}</h2>
      <label className="field">
        <span>{t('importFile')}</span>
        <input type="file" accept="application/json,.json" onChange={(e) => importFile(e.target.files?.[0])} />
      </label>
      <label className="field">
        <span>{t('orPaste')}</span>
        <textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <button
        type="button"
        className="btn btn-soft"
        disabled={!text.trim()}
        onClick={() => applyImport(text)}
      >
        {t('importPasted')}
      </button>

      <h2 className="form-section-title">{t('resetTitle')}</h2>
      <button type="button" className="btn btn-danger" onClick={reset}>
        {t('resetDefault')}
      </button>

      {msg && <p className="saved-note" role="status">{msg}</p>}
    </section>
  );
}
