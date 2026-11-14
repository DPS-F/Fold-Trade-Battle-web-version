import { Overlay } from '../ui/Overlay';
import { useBusinessStore } from '../../state/businessStore';
import { VISAS } from '../../data/visas';
import { GOODS } from '../../data/goods';
import { RectButton } from '../ui/RectButton';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ProductionOverlay({ open, onClose }: Props) {
  const players = useBusinessStore(s => s.players);
  const turnIndex = useBusinessStore(s => s.turnIndex);
  const produce = useBusinessStore(s => s.produce);
  const player = players[turnIndex];

  if (!player) return null;

  const handleProduce = (vId: string, amount: number) => {
    if (produce(vId, amount)) {
      onClose();
    } else {
      alert('Недостаточно обрезков для производства!');
    }
  };

  return (
    <Overlay open={open} title="Производство" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {player.visas.map(vId => {
          const visa = VISAS[vId];
          const good = GOODS[visa.produces];
          return (
            <div
              key={vId}
              style={{
                padding: 16,
                background: 'rgba(255,255,255,0.5)',
                border: '1px solid var(--paper-edge)',
                borderRadius: 4,
              }}
            >
              <h4 style={{ margin: '0 0 8px', fontFamily: 'var(--font-typewriter)' }}>
                {visa.name}
              </h4>
              <div style={{ fontSize: 12, marginBottom: 12 }}>
                Производит: {good.name} (База: {good.basePrice} 🪙)
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <RectButton onClick={() => handleProduce(vId, 1)}>
                  1 шт (бесплатно)
                </RectButton>
                <RectButton onClick={() => handleProduce(vId, 2)}>
                  2 шт (50%)
                </RectButton>
                <RectButton onClick={() => handleProduce(vId, 3)}>
                  3 шт (50%+100%)
                </RectButton>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button className="rect-btn" onClick={onClose}>
          Пропустить
        </button>
      </div>
    </Overlay>
  );
}