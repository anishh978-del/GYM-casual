import { useEffect, useRef, useState } from 'react';
import { beep } from '../lib/audio.js';
import { createT } from '../lib/i18n.js';
import { useStore } from '../lib/store.jsx';
import { formatClock } from '../lib/format.js';

export default function RestTimer({ seconds = 60, onClose }) {
  const { settings } = useStore();
  const t = createT(settings.lang);
  const [remaining, setRemaining] = useState(seconds);
  const [done, setDone] = useState(false);
  const beeped = useRef(false);

  useEffect(() => {
    if (done) return undefined;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [done]);

  useEffect(() => {
    if (remaining === 0 && !done) {
      setDone(true);
      if (!beeped.current) {
        beeped.current = true;
        beep(3);
      }
    }
  }, [remaining, done]);

  const addTime = () => {
    beeped.current = false;
    setDone(false);
    setRemaining((r) => r + 15);
  };

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={t('restTitle')}>
      <div className={`overlay-card rest-card ${done ? 'is-finished' : ''}`}>
        <p className="eyebrow">{t('restTitle')}</p>
        <div className="rest-clock" aria-live="polite">
          {formatClock(remaining)}
        </div>
        <p className="rest-hint">{done ? t('restDone') : t('restHint')}</p>
        <div className="overlay-actions">
          <button type="button" className="btn btn-soft" onClick={addTime}>
            {t('add15')}
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            {done ? t('continueBtn') : t('skip')}
          </button>
        </div>
      </div>
    </div>
  );
}
