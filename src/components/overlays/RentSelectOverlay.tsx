import { useEffect, useState } from 'react';
import { Overlay } from '../ui/Overlay';
import { VISAS } from '../../data/visas';
import { useGameStore } from '../../state/gameStore';
import { RectButton } from '../ui/RectButton';
import { soundManager } from '../../audio/soundManager';
import { VisaCard } from '../ui/VisaCard';

interface Props {
  open: boolean;
  onClose: () => void;
  maxVisas: number;
  selected: string[];
  onChange: (visas: string[], total: number) => void;
}

export function RentSelectOverlay({ open, onClose, maxVisas, selected, onChange }: Props) {
  const player = useGameStore(s => s.player);
  const [discountId, setDiscountId] = useState<string | null>(null);

  useEffect(() => {
    if (open && !discountId) {
      const available = Object.keys(VISAS).filter(id => player.visasOwned.includes(id));
      if (available.length > 0) setDiscountId(available[Math.floor(Math.random() * available.length)]);
    }
  }, [open, player.visasOwned, discountId]);

  const ownedVisas = Object.values(VISAS).filter(v => player.visasOwned.includes(v.id));

  const toggleVisa = (id: string) => {
    let newSelected = [...selected];
    if (newSelected.includes(id)) newSelected = newSelected.filter(v => v !== id);
    else {
      if (newSelected.length < maxVisas) newSelected.push(id);
      else { alert(`Максимум визиток для вашего уровня: ${maxVisas}`); return; }
    }
    
    let total = 0;
    newSelected.forEach(vId => {
      const v = VISAS[vId];
      total += vId === discountId ? Math.floor(v.rentPrice * 0.5) : v.rentPrice;
    });

    soundManager.click();
    onChange(newSelected, total);
  };

  return (
    <Overlay open={open} title="Выбор аренды" onClose={onClose} width={700}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="hint-text">Выбрано: {selected.length} / {maxVisas}</span>
        <span className="hint-text">Скидка 50% на: <b style={{ color: 'var(--burned)' }}>{discountId ? VISAS[discountId].name : '...'}</b></span>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {ownedVisas.map(visa => {
          const isSelected = selected.includes(visa.id);
          const isDiscounted = visa.id === discountId;
          const price = isDiscounted ? Math.floor(visa.rentPrice * 0.5) : visa.rentPrice;

          return (
            <VisaCard 
              key={visa.id} 
              visa={visa} 
              pieces={player.visaPieces[visa.id] || 0} 
              isSelected={isSelected}
              price={price}
              onClick={() => toggleVisa(visa.id)}
            />
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <RectButton onClick={onClose}>Готово</RectButton>
      </div>
    </Overlay>
  );
}