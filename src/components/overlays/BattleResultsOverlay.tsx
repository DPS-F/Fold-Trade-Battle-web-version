import { useEffect } from 'react';
import { useGameStore } from '../../state/gameStore';
import { useBattleStore } from '../../state/battleStore';
import { RectButton } from '../ui/RectButton';
import { soundManager } from '../../audio/soundManager';
import type { FleetShip } from '../../state/gameStore';
import { getLevelData } from '../../data/progression';

export function BattleResultsOverlay({ winner }: { winner: 'player' | 'bot' }) {
  const setScreen = useGameStore(s => s.setScreen);
  const registerBattleWin = useGameStore(s => s.registerBattleWin);
  const playerFleet = useBattleStore(s => s.playerFleet);
  const botFleet = useBattleStore(s => s.botFleet);
  const updateFleet = useGameStore(s => s.updateFleet);
  const playerLevel = useGameStore(s => s.player.level);
  
  const isPlayerWinner = winner === 'player';
  const isBoss = getLevelData(playerLevel).isBoss;

  useEffect(() => {
    if (isPlayerWinner) {
      soundManager.win();
      const flawless = playerFleet.every(s => s.currentHp === s.maxHp);
      registerBattleWin(isBoss, flawless);
    } else {
      soundManager.lose();
    }

    const survivingShips: FleetShip[] = playerFleet
      .filter(s => s.currentHp > 0)
      .map(s => ({ id: s.id, templateId: s.templateId, maxHp: s.maxHp }));
    
    updateFleet(survivingShips);

    if (!isPlayerWinner) {
      useGameStore.getState().addCoins(10);
    }
  }, [isPlayerWinner, registerBattleWin, playerFleet, updateFleet, isBoss]);

  return (
    <div className="overlay-backdrop">
      <div className="overlay-paper" style={{ 
        border: isPlayerWinner ? '8px solid var(--gold)' : 'none', 
        textAlign: 'center',
        padding: 60
      }}>
        <h2 style={{ fontFamily: 'var(--font-typewriter)', fontSize: 32, color: 'var(--burned)' }}>
          {isPlayerWinner ? 'Победа!' : 'Хорошая попытка, в другой раз получится!'}
        </h2>
        
        <div style={{ margin: '24px 0', fontSize: 16, fontFamily: 'var(--font-typewriter)' }}>
          {isPlayerWinner ? (
            <>
              Награда: 50 монет <br/>
              Выпал кусок визитки!
            </>
          ) : (
            <>
              Утешительный приз: 10 монет <br/>
              Выжившие корабли остались в строю.
            </>
          )}
        </div>

        <div style={{ marginTop: 40 }}>
          <RectButton onClick={() => setScreen('main-menu')}>В главное меню</RectButton>
        </div>
      </div>
    </div>
  );
}