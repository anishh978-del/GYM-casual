import { createT } from '../lib/i18n.js';
import { useStore } from '../lib/store.jsx';

const CONFETTI = ['#15803d', '#f59e0b', '#1d4ed8', '#b91c1c', '#6d28d9', '#0f766e', '#db2777'];

export default function Celebration({ day, count, nextIso, onClose }) {
  const { settings, meta } = useStore();
  const lang = settings.lang;
  const t = createT(lang);
  const dayTitle = day ? (lang === 'en' ? day.titleEn : day.titleKn) : '';

  return (
    <div className="overlay celebration-overlay" role="dialog" aria-modal="true" aria-label={t('celebrateTitle')}>
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <span
            key={i}
            style={{
              left: `${(i * 37 + 8) % 96}%`,
              animationDelay: `${(i % 9) * 0.22}s`,
              background: CONFETTI[i % CONFETTI.length],
              transform: `rotate(${i * 27}deg)`,
            }}
          />
        ))}
      </div>
      <div className="overlay-card celebrate-card">
        <div className="celebrate-emoji" aria-hidden="true">
          🎉
        </div>
        <h2 className="celebrate-title">{t('celebrateTitle')}</h2>
        {t('celebrateEn') && <p className="celebrate-en">{t('celebrateEn')}</p>}
        <p className="celebrate-msg">{t('celebrateMsg')}</p>
        {dayTitle && <p className="celebrate-day">{dayTitle}</p>}
        <p className="celebrate-stats">{t('celebrateStats', { n: count })}</p>
        <p className="celebrate-by">{lang === 'en' ? meta.memberShortEn : meta.memberShortKn}</p>
        <div className="overlay-actions">
          <a className="btn btn-primary" href="#/">
            {t('homeBtn')}
          </a>
          {nextIso && (
            <a className="btn btn-soft" href={`#/day/${nextIso}`}>
              {t('nextDay')}
            </a>
          )}
        </div>
        <button type="button" className="link-btn" onClick={onClose}>
          {t('close')}
        </button>
      </div>
    </div>
  );
}
