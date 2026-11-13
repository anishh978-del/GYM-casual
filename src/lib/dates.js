import { DATE_NAMES } from './i18n.js';

const pad = (n) => String(n).padStart(2, '0');

export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO() {
  return toISODate(new Date());
}

export function parseISO(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(iso, days) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function weekdayOf(iso) {
  return parseISO(iso).getDay();
}

/** Monday-first week containing the given date. */
export function weekDatesISO(iso) {
  const d = parseISO(iso);
  const offset = (d.getDay() + 6) % 7;
  const monday = addDays(iso, -offset);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function weekdayName(iso, lang = 'kn', short = false) {
  const table = DATE_NAMES[lang] || DATE_NAMES.kn;
  return (short ? table.short : table.long)[weekdayOf(iso)];
}

export function formatDateLong(iso, lang = 'kn') {
  const d = parseISO(iso);
  const table = DATE_NAMES[lang] || DATE_NAMES.kn;
  return `${weekdayName(iso, lang)}, ${d.getDate()} ${table.months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShort(iso, lang = 'kn') {
  const d = parseISO(iso);
  const table = DATE_NAMES[lang] || DATE_NAMES.kn;
  return `${d.getDate()} ${table.monthsShort[d.getMonth()]}`;
}

export function formatRange(startISO, endISO, lang = 'kn') {
  const a = parseISO(startISO);
  const b = parseISO(endISO);
  const table = DATE_NAMES[lang] || DATE_NAMES.kn;
  if (a.getMonth() === b.getMonth()) {
    return `${a.getDate()} – ${b.getDate()} ${table.monthsShort[b.getMonth()]}`;
  }
  return `${a.getDate()} ${table.monthsShort[a.getMonth()]} – ${b.getDate()} ${table.monthsShort[b.getMonth()]}`;
}

export function formatProgramRange(startISO, endISO, lang = 'kn') {
  const a = parseISO(startISO);
  const b = parseISO(endISO);
  const table = DATE_NAMES[lang] || DATE_NAMES.kn;
  return `${pad(a.getDate())} ${table.monthsShort[a.getMonth()]} ${a.getFullYear()} – ${pad(b.getDate())} ${table.monthsShort[b.getMonth()]} ${b.getFullYear()}`;
}

export function isSameWeek(aISO, bISO) {
  return weekDatesISO(aISO)[0] === weekDatesISO(bISO)[0];
}
