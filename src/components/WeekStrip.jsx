import { weekdayName, parseISO } from '../lib/dates.js';
import { createT } from '../lib/i18n.js';
import { useStore } from '../lib/store.jsx';

export default function WeekStrip({ items, today, readOnly = false }) {
  const { settings } = useStore();
  const t = createT(settings.lang);

  return (
    <section className="week-block" aria-label={t('navWeek')}>
      <div className="week-strip">
        {items.map((item) => {
          const label = weekdayName(item.iso, settings.lang, true);
          const classes = [
            'wk-cell',
            item.complete ? 'is-complete' : '',
            item.isToday ? 'is-today' : '',
            item.rest ? 'is-rest' : '',
            item.isFuture ? 'is-future' : '',
            !item.day ? 'is-empty' : '',
          ]
            .filter(Boolean)
            .join(' ');
          const status = item.complete
            ? t('complete')
            : item.rest
              ? t('rest')
              : `${item.done}/${item.total}`;
          const body = (
            <>
              <span className="wk-lbl">{label}</span>
              <span className="wk-dot">
                {item.complete ? '✓' : item.rest ? '🌙' : parseISO(item.iso).getDate()}
              </span>
            </>
          );
          if (readOnly) {
            return (
              <span key={item.iso} className={classes} aria-label={`${label} ${parseISO(item.iso).getDate()} – ${status}`}>
                {body}
              </span>
            );
          }
          return (
            <a
              key={item.iso}
              className={classes}
              href={`#/day/${item.iso}`}
              aria-current={item.isToday ? 'date' : undefined}
              aria-label={`${label} ${parseISO(item.iso).getDate()} – ${status}`}
            >
              {body}
            </a>
          );
        })}
      </div>
      <p className="week-legend">
        <span><b>✓</b> {t('complete')}</span>
        <span aria-hidden="true">·</span>
        <span>🌙 {t('rest')}</span>
        <span aria-hidden="true">·</span>
        <span className="legend-today">{t('todayChip')}</span>
      </p>
    </section>
  );
}
