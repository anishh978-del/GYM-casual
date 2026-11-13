import { TARGET_WORDS } from './i18n.js';

export function formatDuration(seconds, lang = 'kn') {
  const w = TARGET_WORDS[lang] || TARGET_WORDS.kn;
  if (seconds >= 60 && seconds % 60 === 0) {
    return `${seconds / 60} ${w.min}`;
  }
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    return `${m} ${w.min} ${seconds % 60} ${w.sec}`;
  }
  return `${seconds} ${w.sec}`;
}

export function formatTarget(target, lang = 'kn') {
  const w = TARGET_WORDS[lang] || TARGET_WORDS.kn;
  if (!target) return '';
  const sets = target.sets ?? 1;
  if (target.type === 'sets') {
    return `${sets} ${w.sets}`;
  }
  if (target.type === 'reps') {
    return sets > 1 ? `${target.reps} ${w.reps} × ${sets} ${w.sets}` : `${target.reps} ${w.reps}`;
  }
  if (target.type === 'time') {
    const d = formatDuration(target.seconds, lang);
    return sets > 1 ? `${d} × ${sets} ${w.sets}` : d;
  }
  return '';
}

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function setsFor(exercise) {
  return Math.max(1, exercise?.target?.sets || 1);
}

export function targetSummary(exercise, lang = 'kn') {
  return formatTarget(exercise?.target, lang);
}
