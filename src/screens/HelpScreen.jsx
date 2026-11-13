import { createT } from '../lib/i18n.js';
import { useStore } from '../lib/store.jsx';

export default function HelpScreen() {
  const { meta, settings } = useStore();
  const lang = settings.lang;
  const t = createT(lang);
  const trainer = lang === 'en' ? meta.trainerEn : meta.trainerKn;
  const phone = String(meta.phone || '').trim();
  const tel = phone.replace(/[^\d+]/g, '');

  const [creditBefore, creditAfter] = t('credits', { db: '|' }).split('|');

  const topics = [
    { icon: '💡', title: t('helpSetTitle'), text: t('helpSetText') },
    { icon: '🔁', title: t('helpRepsTitle'), text: t('helpRepsText') },
    { icon: '🧘', title: t('helpRestTitle'), text: t('helpRestText') },
  ];

  return (
    <div className="help-screen">
      <div className="screen-heading">
        <h1>{t('helpTitle')}</h1>
        <p className="week-range">{t('helpIntro')}</p>
      </div>

      <div className="help-list">
        {topics.map((topic) => (
          <section key={topic.title} className="card help-card">
            <span className="help-icon" aria-hidden="true">{topic.icon}</span>
            <h2>{topic.title}</h2>
            <p>{topic.text}</p>
          </section>
        ))}
      </div>

      <section className="card trainer-card">
        <h2 className="card-title">{t('trainerTitle')}</h2>
        <p className="trainer-name">{trainer}</p>
        <p className="trainer-gym">{meta.gym}</p>
        {tel ? (
          <a className="btn btn-primary call-btn" href={`tel:${tel}`}>
            📞 {t('callTrainer', { name: trainer })}
          </a>
        ) : (
          <>
            <button type="button" className="btn btn-primary call-btn" disabled>
              📞 {t('callTrainer', { name: trainer })}
            </button>
            <p className="trainer-hint">{t('noPhone')}</p>
          </>
        )}
      </section>

      <section className="card about-card">
        <dl>
          <div>
            <dt>{t('ageLabel')}</dt>
            <dd>{meta.age} {t('years')}</dd>
          </div>
          <div>
            <dt>{t('programLabel')}</dt>
            <dd>{meta.program}</dd>
          </div>
          <div>
            <dt>{t('gymLabel')}</dt>
            <dd>{meta.gym}</dd>
          </div>
        </dl>
        <p className="offline-note">📶 {t('offlineNote')}</p>
      </section>

      <p className="credits">
        {creditBefore}
        <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noreferrer">
          free-exercise-db
        </a>
        {creditAfter}
      </p>
    </div>
  );
}
