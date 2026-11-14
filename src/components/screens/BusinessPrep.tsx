import { useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { useBusinessStore } from '../../state/businessStore';
import { getLevelData, getMaxVisasAllowed } from '../../data/progression';
import { VISAS } from '../../data/visas';
import { RoundButton } from '../ui/RoundButton';
import { VisasGalleryOverlay } from '../overlays/VisasGalleryOverlay';
import { RentSelectOverlay } from '../overlays/RentSelectOverlay';
import { soundManager } from '../../audio/soundManager';

export function BusinessPrep() {
  const setScreen = useGameStore(s => s.setScreen);
  const player = useGameStore(s => s.player);
  const openOverlay = useGameStore(s => s.openOverlay);
  const overlayStack = useGameStore(s => s.overlayStack);
  const closeOverlay = useGameStore(s => s.closeOverlay);
  
  const startMatch = useBusinessStore(s => s.startMatch);

  // Выбранные визитки (для передачи в схватку)
  const [selectedVisas, setSelectedVisas] = useState<string[]>([]);
  const [rentTotal, setRentTotal] = useState(0);

  const levelData = getLevelData(player.level);
  const maxVisas = getMaxVisasAllowed(player.level);
  const isOpen = (id: string) => overlayStack[overlayStack.length - 1] === id;

  const handleStart = () => {
    if (selectedVisas.length === 0) return;
    if (player.coins < rentTotal) {
      alert('Недостаточно монет для оплаты аренды!');
      return;
    }
    
    // Списываем аренду
    useGameStore.getState().addCoins(-rentTotal);
    soundManager.flip();
    
    // Инициализируем схватку
    startMatch(selectedVisas, levelData.botsCount, levelData.botDifficulty);
    setScreen('business-battle');
  };

  return (
    <div className="table-bg flex-center" style={{ flexDirection: 'column', gap: 24 }}>
      <div className="burned-title" style={{ position: 'absolute', top: '5%' }}>Бизнес-схватка</div>

      <div className="paper-sheet" style={{ padding: 40, maxWidth: 600, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <button 
          className="rect-btn" 
          style={{ fontSize: 20, padding: '16px 40px', opacity: selectedVisas.length > 0 && player.coins >= rentTotal ? 1 : 0.5 }}
          disabled={selectedVisas.length === 0 || player.coins < rentTotal}
          onClick={handleStart}
        >
          Начать игру
        </button>
        
        {selectedVisas.length > 0 && (
          <div style={{ fontFamily: 'var(--font-typewriter)', color: 'var(--burned)' }}>
            Аренда: {rentTotal} 🪙
          </div>
        )}
        
        <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
          <RoundButton icon="📇" label="Галерея визиток" onClick={() => openOverlay('visas-gallery')} />
          <RoundButton icon="🏷️" label="Выбор аренды" onClick={() => openOverlay('rent-select')} />
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '5%', right: '4%' }}>
        <button className="rect-btn" onClick={() => setScreen('main-menu')}>← В меню</button>
      </div>

      <VisasGalleryOverlay 
        open={isOpen('visas-gallery')} 
        onClose={closeOverlay} 
      />
      <RentSelectOverlay 
        open={isOpen('rent-select')} 
        onClose={closeOverlay} 
        maxVisas={maxVisas}
        selected={selectedVisas}
        onChange={(visas, total) => {
          setSelectedVisas(visas);
          setRentTotal(total);
        }}
      />
    </div>
  );
}