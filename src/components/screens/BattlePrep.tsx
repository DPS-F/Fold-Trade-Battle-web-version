import { useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { useBattleStore } from '../../state/battleStore';
import { RoundButton } from '../ui/RoundButton';
import { TemplatesGalleryOverlay } from '../overlays/TemplatesGalleryOverlay';
import { FoldingOverlay } from '../overlays/FoldingOverlay';
import { TEMPLATES } from '../../data/templates';
import { soundManager } from '../../audio/soundManager';

export function BattlePrep() {
  const setScreen = useGameStore(s => s.setScreen);
  const player = useGameStore(s => s.player);
  const openOverlay = useGameStore(s => s.openOverlay);
  const overlayStack = useGameStore(s => s.overlayStack);
  const closeOverlay = useGameStore(s => s.closeOverlay);
  
  const startBattle = useBattleStore(s => s.startBattle);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const isOpen = (id: string) => overlayStack[overlayStack.length - 1] === id;
  const canFight = player.fleet.length > 0;

  const handleStart = () => {
    if (!canFight) return;
    soundManager.flip();
    startBattle(player.fleet);
    setScreen('battle');
  };

  return (
    <div className="table-bg flex-center" style={{ flexDirection: 'column', gap: 24 }}>
      <div className="burned-title" style={{ position: 'absolute', top: '5%' }}>Бой</div>

      {/* Отображение текущего флота на столе */}
      <div style={{ position: 'absolute', top: '20%', left: '10%', right: '10%', display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
        {player.fleet.map((ship, i) => (
          <div key={ship.id} className="paper-sheet" style={{ padding: 20, width: 120, textAlign: 'center', transform: `rotate(${Math.sin(i) * 5}deg)` }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>⛵</div>
            <div style={{ fontFamily: 'var(--font-typewriter)', fontSize: 12 }}>{TEMPLATES[ship.templateId].name}</div>
          </div>
        ))}
        {player.fleet.length === 0 && (
          <div style={{ fontFamily: 'var(--font-typewriter)', opacity: 0.6 }}>У вас пока нет кораблей. Сложите их!</div>
        )}
      </div>

      <div className="paper-sheet" style={{ position: 'absolute', bottom: '10%', padding: 40, maxWidth: 600, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <button 
          className="rect-btn" 
          style={{ fontSize: 20, padding: '16px 40px', opacity: canFight ? 1 : 0.5 }}
          disabled={!canFight}
          onClick={handleStart}
        >
          Начать игру
        </button>
        
        <div style={{ display: 'flex', gap: 20 }}>
          <RoundButton icon="📐" label="Галерея шаблонов" onClick={() => openOverlay('templates-gallery')} />
          <RoundButton 
            icon="📄" 
            label="Складывание" 
            onClick={() => {
              if (selectedTemplate) openOverlay('folding-overlay');
              else alert('Сначала выберите шаблон в галерее!');
            }} 
          />
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '5%', right: '4%' }}>
        <button className="rect-btn" onClick={() => setScreen('main-menu')}>← В меню</button>
      </div>

      <TemplatesGalleryOverlay 
        open={isOpen('templates-gallery')} 
        onClose={closeOverlay} 
        onSelectTemplate={(id) => setSelectedTemplate(id)}
      />
      <FoldingOverlay 
        open={isOpen('folding-overlay')} 
        onClose={closeOverlay} 
        templateId={selectedTemplate}
      />
    </div>
  );
}