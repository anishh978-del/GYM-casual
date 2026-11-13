import { useState } from 'react';
import { DAY_COLORS } from '../data/plan.js';
import { addDays, formatDateShort, isSameWeek, parseISO, todayISO, weekdayName } from '../lib/dates.js';
import { createT, localizedTitle } from '../lib/i18n.js';
import { streakFor, weekOverview } from '../lib/planUtils.js';
import { useStore } from '../lib/store.jsx';

export default function WeekScreen() {
  const { days, progress, settings } = useStore();
  const lang = settings.lang;
  const t = createT(lang);
  const today = todayISO();
  const [anchor, setAnchor] = useState(today);
  const week = weekOverview(days, progress, anchor, today);
  const streak = streakFor(days, progress, today);
  const isCurrent = isSameWeek(anchor, today);
  const pct = week.total ? Math.round((week.done / week.total) * 100) : 0;

  return (
    <div className="week-screen">
      <div className="screen-heading">
        <h1>{t('weekTitle')}</h1>
      </div>

      <section className="card week-summary">
        <div className="summary-main">
          <span className="summary-big">{week.done}/{week.total}</span>
          <span className="summary-label">{t('weekSummary', { done: week.done, total: week.total })}</span>
          <div className="bar" aria-hidden="true">
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>
        <span className={`streak ${streak > 0 ? 'is-hot' : ''}`}>
          {streak > 0 ? `🔥 ${t('streakLabel', { n: streak })}` : t('streakZero')}
        </span>
      </section>

      <div className="week-nav">
        <button
          type="button"
          className="btn btn-soft week-nav-btn"
          onClick={() => setAnchor(addDays(anchor, -7))}
          aria-label={t('prevWeek')}
        >
          ←
        </button>
        <div className="week-nav-center">
          <span className="week-nav-label">
            {formatDateShort(week.dates[0], lang)} – {formatDateShort(week.dates[6], lang)}
          </span>
          {!isCurrent && (
            <button type="button" className="week-today-btn" onClick={() => setAnchor(today)}>
              {t('todayChip')}
            </button>
          )}
        </div>
        <button
          type="button"
          className="btn btn-soft week-nav-btn"
          onClick={() => setAnchor(addDays(anchor, 7))}
          aria-label={t('nextWeek')}
        >
          →
        </button>
      </div>

      <ol className="week-list">
        {week.items.map((item) => {
          const colors = DAY_COLORS[item.day?.color] || DAY_COLORS.slate;
          const title = item.day ? localizedTitle(item.day, lang) || t('untitledDay') : t('noPlanToday');
          const status = item.complete
            ? `✓ ${t('complete')}`
            : item.rest
              ? `🌙 ${t('rest')}`
              : `${item.done}/${item.total}`;
          return (
            <li key={item.iso}>
              <a
                className={`week-row ${item.isToday ? 'is-today' : ''} ${item.rest ? 'is-rest' : ''} ${item.isFuture ? 'is-future' : ''}`}
                href={`#/day/${item.iso}`}
                style={{ '--day-base': colors.base, '--day-soft': colors.soft, '--day-ink': colors.ink }}
                aria-current={item.isToday ? 'date' : undefined}
              >
                <span className="wr-date">
                  <span className="wr-wd">{weekdayName(item.iso, lang, true)}</span>
                  <span className="wr-num">{parseISO(item.iso).getDate()}</span>
                </span>
                <span className="wr-body">
                  <span className="wr-title">{title}</span>
                  <span className="wr-meta">
                    {item.isToday && <span className="today-chip">{t('todayChip')}</span>}
                    {!item.rest && item.day && t('exercisesDone', { done: item.done, total: item.total })}
                  </span>
                </span>
                <span className={`wr-status ${item.complete ? 'is-done' : ''}`}>{status}</span>
                <span className="wr-chevron" aria-hidden="true">›</span>
              </a>
            </li>
          );
        })}
      </ol>

      <p className="week-footnote">{t('offlineNote')}</p>
    </div>
  );
}
