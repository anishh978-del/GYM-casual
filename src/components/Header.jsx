import { createT } from '../lib/i18n.js';
import { navigate } from '../lib/router.js';
import { SCALE_STEPS, useStore } from '../lib/store.jsx';

export default function Header({ readOnly = false }) {
  const { settings, setLang, changeScale } = useStore();
  const t = createT(settings.lang);
  const scaleIndex = SCALE_STEPS.indexOf(settings.scale);
  const brandContent = (
    <>
      <span className="brand-mark" aria-hidden="true">🧘</span>
      <span className="brand-text">{t('appName')}</span>
    </>
  );

  return (
    <header className="app-header">
      {readOnly ? (
        <span className="brand" aria-label={t('appName')}>{brandContent}</span>
      ) : (
        <a className="brand" href="#/" aria-label={t('appName')}>{brandContent}</a>
      )}
      <div className="header-tools">
        <div className="lang-toggle" role="group" aria-label={t('language')}>
          <button
            type="button"
            className={settings.lang === 'kn' ? 'is-active' : ''}
            aria-pressed={settings.lang === 'kn'}
            onClick={() => setLang('kn')}
          >
            {t('langKannada')}
          </button>
          <button
            type="button"
            className={settings.lang === 'en' ? 'is-active' : ''}
            aria-pressed={settings.lang === 'en'}
            onClick={() => setLang('en')}
          >
            {t('langEnglish')}
          </button>
        </div>
        <div className="text-tools" role="group" aria-label={t('language')}>
          <button
            type="button"
            aria-label={t('smallerText')}
            disabled={scaleIndex <= 0}
            onClick={() => changeScale(-1)}
          >
            A−
          </button>
          <button
            type="button"
            aria-label={t('largerText')}
            disabled={scaleIndex >= SCALE_STEPS.length - 1}
            onClick={() => changeScale(1)}
          >
            A+
          </button>
        </div>
        {!readOnly && (
          <button
            type="button"
            className="gear-btn"
            aria-label={t('openEditor')}
            title={t('openEditor')}
            onClick={() => navigate('/editor')}
          >
            ⚙️
          </button>
        )}
      </div>
    </header>
  );
}
