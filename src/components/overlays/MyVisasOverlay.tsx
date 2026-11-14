import { Overlay } from '../ui/Overlay';
import { useBusinessStore } from '../../state/businessStore';
import { VISAS } from '../../data/visas';
import { GOODS } from '../../data/goods';
import { RectButton } from '../ui/RectButton';

export function MyVisasOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const players = useBusinessStore(s => s.players);
  const turnIndex = useBusinessStore(s => s.turnIndex);
  const closeVisa = useBusinessStore(s => s.closeVisa);
  
  const humanPlayer = players.find(p => !p.isBot) || players[0];
  const isPlayerTurn = !players[turnIndex]?.isBot;

  if (!humanPlayer) return null;

  return (
    <Overlay open={open} title="Мои визитки" onClose={onClose}>
      <div style={{ display: 'grid', gap: 16 }}>
        {humanPlayer.visas.map(vId => {
          const visa = VISAS[vId];
          const isClosed = humanPlayer.closedVisas.includes(vId);
          
          if (isClosed) {
            return (
              <div key={vId} style={{ padding: 16, background: 'var(--gold)', color: 'var(--burned)', borderRadius: 4, textAlign: 'center', fontFamily: 'var(--font-typewriter)' }}>
                {visa.name} — ЗАКРЫТА
              </div>
            );
          }

          const reqGood = visa.requires[0];
          const have = humanPlayer.inventory[reqGood] || 0;
          const need = visa.requiredAmount;
          const canClose = have >= need && isPlayerTurn;

          return (
            <div key={vId} style={{ padding: 16, background: 'rgba(255,255,255,0.5)', border: '1px solid var(--paper-edge)', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 8px', fontFamily: 'var(--font-typewriter)' }}>{visa.name}</h4>
                <div style={{ fontSize: 12 }}>
                  Для закрытия нужно: {GOODS[reqGood].name} — {have} / {need} шт.
                </div>
              </div>
              <RectButton disabled={!canClose} onClick={() => closeVisa(vId)}>Закрыть визитку</RectButton>
            </div>
          );
        })}

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed rgba(58,35,24,0.25)' }}>
          <h4 style={{ fontFamily: 'var(--font-typewriter)' }}>Инвентарь:</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {Object.entries(humanPlayer.inventory).filter(([_, amt]) => amt > 0).map(([gId, amt]) => (
              <li key={gId} style={{ background: 'rgba(0,0,0,0.05)', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
                {GOODS[gId].name}: {amt}
              </li>
            ))}
            {Object.keys(humanPlayer.inventory).length === 0 && <li style={{ opacity: 0.5 }}>Пусто</li>}
          </ul>
        </div>
      </div>
    </Overlay>
  );
}