import { useEffect } from 'react';
import { useGameStore } from '../../state/gameStore';
import { useBattleStore } from '../../state/battleStore';
import { RectButton } from '../ui/RectButton';
import { soundManager } from '../../audio/soundManager';

export function BattleResultsOverlay({ winner }: { winner: 'player' | 'bot' }) {
  const setScreen = useGameStore(s => s.setScreen);
  const registerBattleWin = useGameStore(s => s.registerBattleWin);
  const updateFleet = useGameStore(s => s.updateFleet);
  
  const isPlayerWinner = winner === 'player';

  useEffect(() => {
    if (isPlayerWinner) {
      soundManager.win();
      // Внутри registerBattleWin уже 75% шанс куска
      registerBattleWin(false, false); 
    } else {
      soundManager.lose();
      useGameStore.getState().addCoins(10); // Утешение
    }

    // ФЛОТ СГОРАЕТ ПОЛНОСТЬЮ
    updateFleet([]);

  }, [isPlayerWinner, registerBattleWin, updateFleet]);

  return (
    <div className="overlay-backdrop">
      <div className="overlay-paper" style={{ border: isPlayerWinner ? '8px solid var(--gold)' : 'none', textAlign: 'center', padding: 60 }}>
        <h2 style={{ fontFamily: 'var(--font-typewriter)', fontSize: 32, color: 'var(--burned)' }}>
          {isPlayerWinner ? 'Победа!' : 'Поражение...'}
        </h2>
        <div style={{ margin: '24px 0', fontSize: 16, fontFamily: 'var(--font-typewriter)' }}>
          {isPlayerWinner ? 'Награда: 50 монет (и шанс 75% на кусок визитки)' : 'Утешительный приз: 10 монет'}
          <br/><br/>
          <span style={{ color: 'var(--accent-burgundy)', fontSize: 14 }}>Весь выставленный флот израсходован.</span>
        </div>
        <div style={{ marginTop: 40 }}>
          <RectButton onClick={() => setScreen('main-menu')}>В главное меню</RectButton>
        </div>
      </div>
    </div>
  );
}