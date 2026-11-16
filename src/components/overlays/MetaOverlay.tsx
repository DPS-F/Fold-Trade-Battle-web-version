import { useState } from 'react';
import { Overlay } from '../ui/Overlay';
import { useGameStore } from '../../state/gameStore';
import { RectButton } from '../ui/RectButton';
import { soundManager } from '../../audio/soundManager';
import { ALL_QUESTS } from '../../data/quests';

export function MetaOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const player = useGameStore(s => s.player);
  const claimDailyBonus = useGameStore(s => s.claimDailyBonus);
  const spinWheel = useGameStore(s => s.spinWheel);
  const claimQuestReward = useGameStore(s => s.claimQuestReward);

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const today = new Date().toDateString();
  const canClaimDaily = player.lastLoginDate !== today;
  const isFreeSpin = player.lastWheelSpinDate !== today;
  const canSpin = isFreeSpin || player.diamonds >= 1;

  const handleClaimDaily = () => {
    if (!canClaimDaily) return;
    claimDailyBonus(100, 2);
    soundManager.stamp();
    alert('Вы получили: 100 монет и 2 бумаги!\nКвесты на сегодня обновлены.');
  };

  const handleSpin = () => {
    if (isSpinning || !canSpin) return;
    setIsSpinning(true);
    setSpinResult(null);

    const sectors = [
      { type: 'coins', amount: 50, label: '50 🪙' },
      { type: 'visaPiece', amount: 1, label: 'Кусок 📇' },
      { type: 'paper', amount: 3, label: '3 📄' },
      { type: 'diamonds', amount: 1, label: '1 💎' },
      { type: 'coins', amount: 150, label: '150 🪙' },
    ];

    const winningIndex = Math.floor(Math.random() * sectors.length);
    const extraRotations = 5 * 360;
    const sectorAngle = 360 / sectors.length;
    const targetRotation = rotation + extraRotations + (360 - winningIndex * sectorAngle);

    setRotation(targetRotation);
    soundManager.click();

    setTimeout(() => {
      const reward = sectors[winningIndex];
      spinWheel(reward.type, reward.amount);
      setSpinResult(reward.label);
      setIsSpinning(false);
      soundManager.win();
    }, 3000);
  };

  return (
    <Overlay open={open} title="Ежедневные награды" onClose={onClose} width={800}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        
        <div style={{ padding: 20, background: 'rgba(255,255,255,0.5)', border: '1px solid var(--paper-edge)', borderRadius: 4, textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-typewriter)' }}>Бонус за вход</h3>
          <p style={{ fontSize: 14 }}>100 монет и 2 бумаги раз в день.</p>
          <RectButton disabled={!canClaimDaily} onClick={handleClaimDaily}>
            {canClaimDaily ? 'Забрать бонус' : 'Уже получено'}
          </RectButton>
        </div>

        <div style={{ padding: 20, background: 'rgba(255,255,255,0.5)', border: '1px solid var(--paper-edge)', borderRadius: 4, textAlign: 'center', overflow: 'hidden' }}>
          <h3 style={{ fontFamily: 'var(--font-typewriter)' }}>Колесо фортуны</h3>
          
          <div style={{ position: 'relative', width: 140, height: 140, margin: '10px auto' }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%',
              background: 'conic-gradient(#c9a227 0deg 72deg, #d4af37 72deg 144deg, #f0e4c8 144deg 216deg, #a87b54 216deg 288deg, #e0cfa4 288deg 360deg)',
              border: '4px solid var(--burned)',
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
            }} />
            <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', fontSize: 24, zIndex: 10 }}>▼</div>
          </div>

          {spinResult ? (
            <div style={{ fontSize: 16, fontFamily: 'var(--font-typewriter)', color: 'green', marginBottom: 10 }}>Выигрыш: {spinResult}</div>
          ) : <div style={{ height: 24 }} />}

          <RectButton onClick={handleSpin} disabled={isSpinning || !canSpin}>
            {isSpinning ? 'Крутится...' : isFreeSpin ? 'Крутить (Бесплатно)' : 'Крутить (1 💎)'}
          </RectButton>
        </div>
      </div>

      <div style={{ padding: 20, background: 'rgba(255,255,255,0.5)', border: '1px solid var(--paper-edge)', borderRadius: 4 }}>
        <h3 style={{ fontFamily: 'var(--font-typewriter)', marginTop: 0, marginBottom: 16 }}>Ежедневные квесты</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {player.dailyQuests.map(qId => {
            const q = ALL_QUESTS.find(x => x.id === qId);
            if (!q) return null;
            const prog = player.questProgress[qId] || 0;
            const isClaimed = player.questsClaimed.includes(qId);
            const isComplete = prog >= q.target;

            return (
              <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: isClaimed ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.6)', border: '1px solid var(--paper-edge)', borderRadius: 4 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-typewriter)', fontSize: 13, textDecoration: isClaimed ? 'line-through' : 'none' }}>{q.title}</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>Прогресс: {Math.min(prog, q.target)} / {q.target}</div>
                </div>
                <RectButton 
                  disabled={!isComplete || isClaimed} 
                  onClick={() => claimQuestReward(qId)}
                  style={{ padding: '6px 12px', fontSize: 12 }}
                >
                  {isClaimed ? 'Получено' : `Забрать ${q.rewardCoins} 🪙`}
                </RectButton>
              </div>
            );
          })}
          {player.dailyQuests.length === 0 && <div style={{ textAlign: 'center', opacity: 0.5 }}>Заберите ежедневный бонус, чтобы получить квесты.</div>}
        </div>
      </div>
    </Overlay>
  );
}