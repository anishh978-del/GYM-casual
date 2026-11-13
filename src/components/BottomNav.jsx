import { createT } from '../lib/i18n.js';
import { useRoute } from '../lib/router.js';
import { useStore } from '../lib/store.jsx';

export default function BottomNav() {
  const { settings } = useStore();
  const t = createT(settings.lang);
  const route = useRoute();
  const active = route.name;

  return (
    <nav className="bottom-nav" aria-label={t('appName')}>
      <a className={`nav-item ${active === 'home' || active === 'day' || active === 'exercise' ? 'is-active' : ''}`} href="#/">
        <span className="nav-icon" aria-hidden="true">🏠</span>
        <span className="nav-label">{t('navToday')}</span>
      </a>
      <a className={`nav-item ${active === 'week' ? 'is-active' : ''}`} href="#/week">
        <span className="nav-icon" aria-hidden="true">📅</span>
        <span className="nav-label">{t('navWeek')}</span>
      </a>
      <a className={`nav-item ${active === 'help' ? 'is-active' : ''}`} href="#/help">
        <span className="nav-icon" aria-hidden="true">❓</span>
        <span className="nav-label">{t('navHelp')}</span>
      </a>
    </nav>
  );
}
