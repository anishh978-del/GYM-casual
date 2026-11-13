import { DAY_COLORS } from '../data/plan.js';
import { formatDateLong, formatProgramRange, todayISO } from '../lib/dates.js';
import { createT, localizedTitle } from '../lib/i18n.js';
import {
  dayForDate,
  dayIsRest,
  dayNumber,
  doneCountFor,
  isDayComplete,
  recordFor,
  streakFor,
  weekOverview,
} from '../lib/planUtils.js';
import { useStore } from '../lib/store.jsx';
import WeekStrip from '../components/WeekStrip.jsx';

export default function HomeScreen() {
  const { meta, days, progress, settings } = useStore();
  const lang = settings.lang;
  const t = createT(lang);
  const today = todayISO();
  const day = dayForDate(days, today);
  const record = recordFor(progress, today);
  const week = weekOverview(days, progress, today, today);
  const streak = streakFor(days, progress, today);

  const name =
    lang === 'en'
      ? meta.memberShortEn || meta.memberEn
      : meta.memberShortKn || meta.memberKn;
  const title = day ? localizedTitle(day, lang) : '';
  const titleEn = day?.titleEn || '';
  const total = day?.exercises?.length || 0;
  const done = day ? doneCountFor(day, record) : 0;
  const rest = day ? dayIsRest(day) : false;
  const complete = day ? isDayComplete(day, record) : false;
  const colors = DAY_COLORS[day?.color] || DAY_COLORS.slate;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const primary = complete
    ? { href: '#/week', main: t('viewWeek'), sub: t('viewWeekSub') }
    : { href: `#/day/${today}`, main: t('start'), sub: t('startSub') };

  return (
    <div className="home">
      <div className="home-top">
        <h1 className="greeting">{t('greeting', { name })}</h1>
        <p className="today-date">{formatDateLong(today, lang)}</p>
      </div>

      {!day && (
        <section className="card empty-card">
          <div className="empty-emoji" aria-hidden="true">🗓️</div>
          <h2>{t('noPlanToday')}</h2>
          <p>{t('noPlanHint')}</p>
          <a className="btn btn-soft" href="#/editor">⚙️ {t('openEditor')}</a>
        </section>
      )}

      {day && rest && (
        <section
          className="hero-card rest-hero"
          style={{ '--day-base': colors.base, '--day-soft': colors.soft, '--day-ink': colors.ink }}
        >
          <div className="rest-emoji" aria-hidden="true">😊</div>
          <h2 className="hero-title">{t('restToday')}</h2>
          {lang === 'kn' && titleEn && <p className="hero-en">{titleEn}</p>}
          <p className="rest-hint">{t('restHint')}</p>
        </section>
      )}

      {day && !rest && (
        <section
          className={`hero-card ${complete ? 'is-complete' : ''}`}
          style={{ '--day-base': colors.base, '--day-soft': colors.soft, '--day-ink': colors.ink }}
        >
          <div className="hero-head">
            <div className="hero-heading">
              <p className="hero-eyebrow">
                {t('todayLabel')} · {t('dayN', { n: dayNumber(days, day) })}
              </p>
              <h2 className="hero-title">{title || t('untitledDay')}</h2>
              {lang === 'kn' && titleEn && <p className="hero-en">{titleEn}</p>}
            </div>
            <span className="hero-count">{t('exercisesCount', { n: total })}</span>
          </div>

          <div className="hero-body">
            {total > 0 && (
              <div className="hero-progress">
                <div className="bar" aria-hidden="true">
                  <span style={{ width: `${pct}%` }} />
                </div>
                <p>{t('dayProgress', { done, total })}</p>
              </div>
            )}

            {complete && (
              <div className="done-banner">
                <span aria-hidden="true">✅</span> {t('allDone')}
              </div>
            )}
            <a className="btn btn-primary btn-start" href={primary.href}>
              <span className="start-main">{primary.main}</span>
              <span className="start-sub">{primary.sub}</span>
            </a>
          </div>
        </section>
      )}

      <section className="week-progress" aria-label={t('navWeek')}>
        <div className="week-progress-main">
          <strong>{t('weekProgress', { done: week.done, total: week.total })}</strong>
          <div className="bar" aria-hidden="true">
            <span style={{ width: `${week.total ? (week.done / week.total) * 100 : 0}%` }} />
          </div>
        </div>
        <span className={`streak ${streak > 0 ? 'is-hot' : ''}`}>
          {streak > 0 ? `🔥 ${t('streakLabel', { n: streak })}` : t('streakZero')}
        </span>
      </section>

      <WeekStrip items={week.items} today={today} />

      <a className="btn btn-ghost view-week" href="#/week">
        📅 {t('viewWeek')}
      </a>

      <p className="program-note">
        <span>{meta.gym}</span>
        <span aria-hidden="true">·</span>
        <span>{meta.program}</span>
        <span aria-hidden="true">·</span>
        <span>{formatProgramRange(meta.start, meta.end, lang)}</span>
      </p>
    </div>
  );
}
