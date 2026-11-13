// Default program: one body part per day, Mon–Sat, rest on Sunday.
// Every name and step comes from PLAN_TEXT in src/lib/i18n.js so both
// languages stay in one place; this file only holds structure and targets.

import { PLAN_TEXT } from '../lib/i18n.js';

export const DAY_COLORS = {
  blue: { base: '#1d4ed8', soft: '#eff6ff', ink: '#1e3a8a' },
  green: { base: '#15803d', soft: '#f0fdf4', ink: '#14532d' },
  red: { base: '#b91c1c', soft: '#fef2f2', ink: '#7f1d1d' },
  purple: { base: '#6d28d9', soft: '#f5f3ff', ink: '#4c1d95' },
  orange: { base: '#b45309', soft: '#fffbeb', ink: '#78350f' },
  teal: { base: '#0f766e', soft: '#f0fdfa', ink: '#134e4a' },
  slate: { base: '#475569', soft: '#f8fafc', ink: '#334155' },
};

export const defaultMeta = { ...PLAN_TEXT.meta };

function buildExercise(dayId, id, target) {
  const text = PLAN_TEXT.exercises[`${dayId}/${id}`] || {};
  return {
    id,
    nameKn: text.nameKn || '',
    nameEn: text.nameEn || '',
    target,
    steps: structuredClone(text.steps || []),
  };
}

function buildDay(id, weekday, color, definitions) {
  return {
    id,
    weekday,
    ...PLAN_TEXT.days[id],
    color,
    exercises: definitions.map(([exerciseId, target]) => buildExercise(id, exerciseId, target)),
  };
}

export const defaultDays = [
  buildDay('day-1', 1, 'blue', [
    ['one-arm-row', { type: 'sets', sets: 3 }],
    ['deadlift', { type: 'sets', sets: 3 }],
    ['seated-row', { type: 'sets', sets: 3 }],
    ['lat-pulldown', { type: 'sets', sets: 3 }],
    ['low-pull', { type: 'sets', sets: 3 }],
    ['cardio', { type: 'time', seconds: 720, sets: 1 }],
    ['stretching', { type: 'time', seconds: 300, sets: 1 }],
  ]),
  buildDay('day-2', 2, 'green', [
    ['supported-squats', { type: 'reps', reps: 15, sets: 3 }],
    ['leg-press', { type: 'reps', reps: 15, sets: 3 }],
    ['leg-extension', { type: 'reps', reps: 15, sets: 3 }],
    ['leg-curl', { type: 'reps', reps: 15, sets: 3 }],
    ['hip-abductor', { type: 'reps', reps: 15, sets: 3 }],
    ['standing-calf', { type: 'reps', reps: 20, sets: 3 }],
    ['cycling', { type: 'time', seconds: 600, sets: 1 }],
    ['stretching', { type: 'time', seconds: 300, sets: 1 }],
  ]),
  buildDay('day-3', 3, 'red', [
    ['cardio', { type: 'time', seconds: 600, sets: 1 }],
    ['surya-namaskar', { type: 'reps', reps: 10, sets: 1 }],
    ['crunches', { type: 'reps', reps: 15, sets: 2 }],
    ['reverse-crunches', { type: 'reps', reps: 15, sets: 2 }],
    ['russian-twist', { type: 'reps', reps: 15, sets: 2 }],
    ['planks', { type: 'time', seconds: 30, sets: 3 }],
    ['cross-trainer', { type: 'time', seconds: 600, sets: 1 }],
  ]),
  buildDay('day-4', 4, 'purple', [
    ['chest-press', { type: 'sets', sets: 3 }],
    ['incline-db-press', { type: 'sets', sets: 3 }],
    ['pec-fly', { type: 'sets', sets: 3 }],
    ['pullover', { type: 'sets', sets: 3 }],
    ['pushups-modified', { type: 'sets', sets: 3 }],
    ['walking', { type: 'time', seconds: 600, sets: 1 }],
    ['stretching', { type: 'time', seconds: 300, sets: 1 }],
  ]),
  buildDay('day-5', 5, 'orange', [
    ['shoulder-press', { type: 'sets', sets: 3 }],
    ['lateral-raise', { type: 'sets', sets: 3 }],
    ['front-raise', { type: 'sets', sets: 3 }],
    ['rear-delt', { type: 'sets', sets: 3 }],
    ['shrugs', { type: 'sets', sets: 3 }],
    ['free-squats', { type: 'sets', sets: 3 }],
  ]),
  buildDay('day-6', 6, 'teal', [
    ['db-curl', { type: 'sets', sets: 3 }],
    ['hammer-curl', { type: 'sets', sets: 3 }],
    ['reverse-curl', { type: 'sets', sets: 3 }],
    ['triceps-single', { type: 'sets', sets: 3 }],
    ['triceps-pushdown', { type: 'sets', sets: 3 }],
    ['triceps-extension', { type: 'sets', sets: 3 }],
  ]),
  {
    id: 'day-7',
    weekday: 0,
    ...PLAN_TEXT.days['day-7'],
    color: 'slate',
    rest: true,
    exercises: [],
  },
];

export function defaultPlan() {
  return {
    meta: structuredClone(defaultMeta),
    days: structuredClone(defaultDays),
  };
}
