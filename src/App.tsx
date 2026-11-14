import { useEffect } from 'react';
import { useGameStore } from './state/gameStore';
import { LoadingScreen } from './components/screens/LoadingScreen';
import { MainMenu } from './components/screens/MainMenu';
import { BusinessPrep } from './components/screens/BusinessPrep';
import { BusinessBattle } from './components/screens/BusinessBattle';
import { BattlePrep } from './components/screens/BattlePrep';
import { BattleScreen } from './components/screens/BattleScreen';
import { soundManager } from './audio/soundManager';

export function App() {
  const screen = useGameStore(s => s.screen);
  const overlayStack = useGameStore(s => s.overlayStack);
  const settings = useGameStore(s => s.player.settings);

  useEffect(() => {
    document.documentElement.style.fontSize = `${16 * settings.uiScale}px`;
  }, [settings.uiScale]);

  useEffect(() => {
    soundManager.setVolumes(settings.sfxVolume, settings.musicVolume);
    const unlockAudio = () => {
      soundManager.startMusic();
      window.removeEventListener('click', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    return () => {
      window.removeEventListener('click', unlockAudio);
      soundManager.stopMusic();
    };
  }, [settings.sfxVolume, settings.musicVolume]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (overlayStack.length > 0) return;
      if (screen === 'main-menu' || screen === 'loading') return;
      if (confirm('Вернуться в главное меню?')) {
        useGameStore.getState().setScreen('main-menu');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, overlayStack.length]);

  if (screen === 'loading') return <LoadingScreen />;
  if (screen === 'main-menu') return <MainMenu />;
  if (screen === 'business-prep') return <BusinessPrep />;
  if (screen === 'business-battle') return <BusinessBattle />;
  if (screen === 'battle-prep') return <BattlePrep />;
  if (screen === 'battle') return <BattleScreen />;

  return <MainMenu />;
}