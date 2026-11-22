import { Overlay } from '../ui/Overlay';
import { useGameStore } from '../../state/gameStore';
import { BATTLE_PASS_REWARDS } from '../../data/battlePass';
import { RectButton } from '../ui/RectButton';

export function BattlePassOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const player = useGameStore(s => s.player);
  const claimBPReward = useGameStore(s => s.claimBPReward);

  return (
    <Overlay open={open} title="Баттл-пасс" onClose={onClose} width={600}>
      <div style={{ marginBottom: 20, textAlign: 'center', fontFamily: 'var(--font-typewriter)' }}>
        Текущий уровень: <b>{player.bpLevel} / 14</b> <br/>
        <span style={{ fontSize: 12, opacity: 0.7 }}>Выполняйте все 5 ежедневных квестов, чтобы повысить уровень!</span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {BATTLE_PASS_REWARDS.map(reward => {
          const isUnlocked = player.bpLevel >= reward.level;
          const isClaimed = player.bpClaimedLevels.includes(reward.level);
          
          return (
            <div key={reward.level} style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px',
              background: isClaimed ? 'rgba(0,0,0,0.05)' : isUnlocked ? 'rgba(201, 162, 39, 0.15)' : 'rgba(255,255,255,0.4)',
              border: `1px solid ${isClaimed ? 'transparent' : isUnlocked ? 'var(--gold)' : 'var(--paper-edge)'}`,
              borderRadius: 4, opacity: isClaimed ? 0.6 : 1
            }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ fontFamily: 'var(--font-typewriter)', fontSize: 18, fontWeight: 'bold', width: 30 }}>
                  {reward.level}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-typewriter)', fontSize: 14 }}>{reward.label}</div>
                  {reward.rewardType === 'skin_gold' && <div style={{ fontSize: 11, color: 'green' }}>+ Доступ к секретному режиму</div>}
                </div>
              </div>
              <RectButton 
                disabled={!isUnlocked || isClaimed} 
                onClick={() => claimBPReward(reward.level)}
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                {isClaimed ? 'Получено' : 'Забрать'}
              </RectButton>
            </div>
          );
        })}
      </div>
    </Overlay>
  );
}