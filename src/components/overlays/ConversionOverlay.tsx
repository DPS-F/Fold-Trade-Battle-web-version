import { Overlay } from '../ui/Overlay';
import { RectButton } from '../ui/RectButton';
import { useGameStore } from '../../state/gameStore';
import { soundManager } from '../../audio/soundManager';

export function ConversionOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const player = useGameStore(s => s.player);
  const c2d = useGameStore(s => s.convertCoinsToDiamonds);
  const d2c = useGameStore(s => s.convertDiamondsToCoins);

  return (
    <Overlay open={open} title="Конвертация" onClose={onClose}>
      <div style={{ display: 'grid', gap: 24 }}>
        <div style={{ padding: 16, background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(180,150,100,0.4)', borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-typewriter)', fontSize: 16 }}>300 🪙 → 1 💎</div>
            <div className="hint-text">Сейчас: {player.coins} 🪙 · {player.diamonds} 💎</div>
          </div>
          <RectButton
            disabled={player.coins < 300}
            onClick={() => {
              if (c2d()) soundManager.stamp();
            }}
          >Конвертировать</RectButton>
        </div>

        <div style={{ padding: 16, background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(180,150,100,0.4)', borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-typewriter)', fontSize: 16 }}>1 💎 → 150 🪙</div>
            <div className="hint-text">Сейчас: {player.coins} 🪙 · {player.diamonds} 💎</div>
          </div>
          <RectButton
            disabled={player.diamonds < 1}
            onClick={() => {
              if (d2c()) soundManager.stamp();
            }}
          >Конвертировать</RectButton>
        </div>
      </div>
    </Overlay>
  );
}