import { Overlay } from '../ui/Overlay';
import { RectButton } from '../ui/RectButton';
import { useGameStore } from '../../state/gameStore';
import { useBusinessStore } from '../../state/businessStore';
import { useEffect } from 'react';
import { soundManager } from '../../audio/soundManager';

export function BusinessResultsOverlay({ winnerId }: { winnerId: string }) {
  const setScreen = useGameStore(s => s.setScreen);
  const registerBusinessWin = useGameStore(s => s.registerBusinessWin);
  
  // Получаем количество игроков, чтобы понять, была ли это игра против 3 ботов
  const players = useBusinessStore(s => s.players);
  
  const isPlayerWinner = winnerId === 'player';
  const wonVs3 = players.length === 4; // 1 игрок + 3 бота

  useEffect(() => {
    if (isPlayerWinner) {
      soundManager.win();
      // Передаем 2 аргумента, как теперь требует gameStore
      registerBusinessWin(1000, wonVs3); 
    } else {
      soundManager.lose();
    }
  }, [isPlayerWinner, registerBusinessWin, wonVs3]);

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
        
        {isPlayerWinner && (
          <div style={{ margin: '24px 0', fontSize: 18, fontFamily: 'var(--font-typewriter)' }}>
            Награда: 50 монет + 1 бумага
          </div>
        )}

        <div style={{ marginTop: 40 }}>
          <RectButton onClick={() => setScreen('main-menu')}>В главное меню</RectButton>
        </div>
      </div>
    </div>
  );
}