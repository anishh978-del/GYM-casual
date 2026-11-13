import { addDays, parseISO, weekDatesISO } from './dates.js';
import { setsFor } from './format.js';

export function dayForDate(days, iso) {
  const weekday = parseISO(iso).getDay();
  return days.find((d) => d.weekday === weekday) || null;
}

export function dayNumber(days, day) {
  const i = days.findIndex((d) => d.id === day?.id);
  return i >= 0 ? i + 1 : 0;
}

export function emptyRecord() {
  return { done: [], sets: {}, celebrated: false };
}

export function recordFor(progress, iso) {
  return progress?.[iso] || emptyRecord();
}

export function isExerciseDone(progress, iso, exerciseId) {
  return recordFor(progress, iso).done.includes(exerciseId);
}

export function doneCountFor(day, record) {
  if (!day) return 0;
  const done = new Set(record.done || []);
  return day.exercises.filter((e) => done.has(e.id)).length;
}

export function isDayComplete(day, record) {
  if (!day || !day.exercises || day.exercises.length === 0) return false;
  const done = new Set(record.done || []);
  return day.exercises.every((e) => done.has(e.id));
}

export function setsDoneFor(exercise, record) {
  return Math.min(setsFor(exercise), record.sets?.[exercise.id] || 0);
}

export function isTimed(exercise) {
  return exercise?.target?.type === 'time';
}

export function dayIsRest(day) {
  return Boolean(day?.rest) || (day?.exercises?.length === 0 && day?.rest !== false);
}

export function exercisesTotal(day) {
  return day?.exercises?.length || 0;
}

/** Week overview from Monday to Sunday for the week containing anchorISO. */
export function weekOverview(days, progress, anchorISO, today = anchorISO) {
  const dates = weekDatesISO(anchorISO);
  let total = 0;
  let done = 0;
  const items = dates.map((iso) => {
    const day = dayForDate(days, iso);
    const record = recordFor(progress, iso);
    const rest = Boolean(day?.rest);
    const complete = Boolean(day) && !rest && isDayComplete(day, record);
    const count = day ? doneCountFor(day, record) : 0;
    const exTotal = exercisesTotal(day);
    if (day && !rest) {
      total += 1;
      if (complete) done += 1;
    }
    return {
      iso,
      day,
      record,
      rest,
      complete,
      done: count,
      total: exTotal,
      isToday: iso === today,
      isFuture: iso > today,
    };
  });
  return { items, done, total, dates };
}

/**
 * Consecutive completed workout days, walking backwards from today.
 * Rest days are skipped, an unfinished today does not break yesterday's streak.
 */
export function streakFor(days, progress, today) {
  let streak = 0;
  for (let i = 0; i < 90; i += 1) {
    const iso = addDays(today, -i);
    const day = dayForDate(days, iso);
    if (!day || day.rest) continue;
    if (isDayComplete(day, recordFor(progress, iso))) {
      streak += 1;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export function nextDateISO(iso) {
  return addDays(iso, 1);
}

export function sanitizeDays(days) {
  if (!Array.isArray(days)) return [];
  return days
    .filter((d) => d && typeof d === 'object')
    .map((d, i) => ({
      id: String(d.id || `day-${Date.now()}-${i}`),
      weekday: Number.isInteger(d.weekday) ? d.weekday : (i % 7),
      titleKn: String(d.titleKn || ''),
      titleEn: String(d.titleEn || ''),
      color: typeof d.color === 'string' ? d.color : 'slate',
      rest: Boolean(d.rest),
      exercises: Array.isArray(d.exercises)
        ? d.exercises
            .filter((e) => e && typeof e === 'object')
            .map((e, j) => ({
              id: String(e.id || `ex-${Date.now()}-${j}`),
              nameKn: String(e.nameKn || ''),
              nameEn: String(e.nameEn || ''),
              target: e.target && typeof e.target === 'object' ? e.target : { type: 'sets', sets: 3 },
              steps: Array.isArray(e.steps)
                ? e.steps.map((s) => ({ kn: String(s?.kn || ''), en: String(s?.en || '') }))
                : [],
              ...(e.media ? { media: e.media } : {}),
            }))
        : [],
    }));
}
