import { Overlay } from '../ui/Overlay';
import { useGameStore } from '../../state/gameStore';
import { ALL_ACHIEVEMENTS } from '../../data/achievements';

export function AchievementsOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const player = useGameStore(s => s.player);

  return (
    <Overlay open={open} title="Достижения" onClose={onClose} width={600}>
      <div style={{ display: 'grid', gap: 12 }}>
        {ALL_ACHIEVEMENTS.map(ach => {
          const isUnlocked = player.achievements.includes(ach.id);
          return (
            <div key={ach.id} style={{ 
              padding: 16, display: 'flex', gap: 16, alignItems: 'center',
              background: isUnlocked ? 'rgba(201, 162, 39, 0.15)' : 'rgba(255,255,255,0.4)', 
              border: `1px solid ${isUnlocked ? 'var(--gold)' : 'var(--paper-edge)'}`, borderRadius: 4 
            }}>
              <div style={{ fontSize: 32, filter: isUnlocked ? 'none' : 'grayscale(1)' }}>
                {isUnlocked ? '🏆' : '🔒'}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px', fontFamily: 'var(--font-typewriter)' }}>{ach.title}</h4>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{ach.description}</div>
              </div>
              {!isUnlocked && <div style={{ fontSize: 11, opacity: 0.5, textAlign: 'right' }}>Награда:<br/>{ach.rewardCoins} 🪙 {ach.rewardDiamonds ? `+ ${ach.rewardDiamonds} 💎` : ''}</div>}
            </div>
          );
        })}
      </div>
    </Overlay>
  );
}