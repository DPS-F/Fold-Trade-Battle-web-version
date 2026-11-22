import { useState, useEffect } from 'react';
import { Overlay } from '../ui/Overlay';
import { useGameStore } from '../../state/gameStore';
import { TEMPLATES } from '../../data/templates';
import { OrigamiViewer } from '../folding/OrigamiViewer';
import { CLASSIC_BOAT_3D, FRIGATE_3D, BATTLESHIP_3D } from '../../data/foldData';

interface Props {
  open: boolean;
  onClose: () => void;
  templateId: string | null;
}

export function FoldingOverlay({ open, onClose, templateId }: Props) {
  const player = useGameStore(s => s.player);
  const addCoins = useGameStore(s => s.addCoins);
  const addPaper = useGameStore(s => s.addPaper);
  const updateFleet = useGameStore(s => s.updateFleet);
  const finishTutorial = useGameStore(s => s.finishTutorial);

  const [isStarted, setIsStarted] = useState(false);
  const template = templateId ? TEMPLATES[templateId] : null;

  useEffect(() => {
    if (open && template) {
      addCoins(-template.cost);
      addPaper(-template.paper);
      setIsStarted(false);
    }
  }, [open, template]);

  if (!open || !template) return null;

  const handleComplete = () => {
    const newShip = {
      id: `ship_${Date.now()}`,
      templateId: template.id,
      maxHp: template.hp,
    };
    updateFleet([...player.fleet, newShip]);
    alert(`Корабль ${template.name} успешно сложен!`);
    
    if (!player.tutorialCompleted) finishTutorial();
    onClose();
  };

  const handleFail = () => {
    alert('Бумага смялась! Ресурсы потрачены впустую.');
    onClose();
  };

  // --- ВЫБОР МОДЕЛИ В ЗАВИСИМОСТИ ОТ ШАБЛОНА ---
  let boatData = CLASSIC_BOAT_3D;
  if (template.id === 'frigate') boatData = FRIGATE_3D;
  if (template.id === 'battleship') boatData = BATTLESHIP_3D;
  
  // Передаем актуальное имя (на случай, если в шаблоне оно отличается)
  boatData.name = template.name;

  return (
    <Overlay open={open} title={`Складывание: ${template.name}`} onClose={onClose} width={950}>
      
      {!isStarted ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>
             {template.id === 'scout' ? '⛵' : template.id === 'frigate' ? '🚢' : '🛳️'}
          </div>
          <h3 style={{ fontFamily: 'var(--font-typewriter)', color: 'var(--burned)' }}>Готовы сложить {template.name}?</h3>
          <p style={{ fontSize: 14, maxWidth: 400, margin: '0 auto 20px' }}>
            Вам нужно будет выполнить {boatData.steps.length} шагов по складыванию бумаги. Внимательно следуйте инструкциям.
          </p>
          <button className="rect-btn" onClick={() => setIsStarted(true)} style={{ padding: '12px 30px', fontSize: 16 }}>
            Начать складывание
          </button>
        </div>
      ) : (
        <OrigamiViewer 
          boat={boatData} 
          onComplete={handleComplete} 
          onFail={handleFail} 
        />
      )}

      <div style={{ marginTop: 20, textAlign: 'center', borderTop: '1px dashed rgba(58,35,24,0.25)', paddingTop: 16 }}>
        <button className="rect-btn" onClick={() => {
          if (confirm('Прервать складывание? Ресурсы не вернутся.')) onClose();
        }} style={{ opacity: 0.7 }}>Отмена</button>
      </div>
    </Overlay>
  );
}