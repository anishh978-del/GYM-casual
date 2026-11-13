import { useEffect } from 'react';
import BottomNav from './components/BottomNav.jsx';
import Header from './components/Header.jsx';
import { createT } from './lib/i18n.js';
import { useRoute } from './lib/router.js';
import { useStore } from './lib/store.jsx';
import DayScreen from './screens/DayScreen.jsx';
import EditorScreen from './screens/EditorScreen.jsx';
import ExerciseScreen from './screens/ExerciseScreen.jsx';
import FamilyProgressScreen from './screens/FamilyProgressScreen.jsx';
import HelpScreen from './screens/HelpScreen.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import WeekScreen from './screens/WeekScreen.jsx';

function isFamilyView() {
  try {
    return new URLSearchParams(window.location.search).get('view') === 'family';
  } catch {
    return false;
  }
}

export default function App() {
  const route = useRoute();
  const { settings, storageError } = useStore();
  const t = createT(settings.lang);
  const familyView = isFamilyView();

  useEffect(() => {
    document.documentElement.lang = settings.lang === 'en' ? 'en' : 'kn';
    document.documentElement.style.fontSize = `${16 * settings.scale}px`;
    const title = createT(settings.lang);
    document.title = familyView ? `${title('familyTitle')} · ${title('appName')}` : title('appName');
  }, [settings.lang, settings.scale, familyView]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.key]);

  if (familyView) return <FamilyProgressScreen />;

  return (
    <div className="app">
      <Header />
      {storageError && (
        <p className="storage-warn" role="alert">⚠️ {t('storageFull')}</p>
      )}
      <main className="screen" key={route.key}>
        {route.name === 'home' && <HomeScreen />}
        {route.name === 'day' && <DayScreen iso={route.iso} />}
        {route.name === 'exercise' && <ExerciseScreen iso={route.iso} exId={route.exId} />}
        {route.name === 'week' && <WeekScreen />}
        {route.name === 'help' && <HelpScreen />}
        {route.name === 'editor' && <EditorScreen />}
      </main>
      {route.name !== 'editor' && <BottomNav />}
    </div>
  );
}
