import { useEffect, useState } from 'react';

export function parseHash(hash) {
  const raw = String(hash || '').replace(/^#/, '');
  const parts = raw.split('/').filter(Boolean);
  if (parts[0] === 'week') return { name: 'week', key: raw };
  if (parts[0] === 'help') return { name: 'help', key: raw };
  if (parts[0] === 'editor') return { name: 'editor', key: raw };
  if (parts[0] === 'day' && parts[1]) {
    if (parts[2] === 'ex' && parts[3]) {
      return { name: 'exercise', iso: parts[1], exId: parts[3], key: raw };
    }
    return { name: 'day', iso: parts[1], key: raw };
  }
  return { name: 'home', key: 'home' };
}

export function navigate(to) {
  const target = `#${to.startsWith('/') ? to : `/${to}`}`;
  if (window.location.hash === target) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.location.hash = target;
  }
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}
