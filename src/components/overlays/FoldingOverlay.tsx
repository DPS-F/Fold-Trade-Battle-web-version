import { useState, useEffect } from 'react';
import { Overlay } from '../ui/Overlay';
import { useGameStore } from '../../state/gameStore';
import { TEMPLATES } from '../../data/templates';
import { soundManager } from '../../audio/soundManager';

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

  const [sequence, setSequence] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState(0);
  
  const template = templateId ? TEMPLATES[templateId] : null;
  
  // Инициализация головоломки
  useEffect(() => {
    if (open && template) {
      // Генерируем последовательность от 1 до N (где N зависит от шаблона)
      const len = template.hp / 2; // Scout = 5 шагов, Frigate = 10, Battleship = 15
      const seq = Array.from({ length: len }, (_, i) => i + 1);
      // Перемешиваем для визуала, но нажимать надо по порядку 1,2,3...
      const shuffled = [...seq].sort(() => Math.random() - 0.5);
      
      setSequence(shuffled);
      setCurrentStep(1);
      setErrors(0);

      // Списываем ресурсы
      addCoins(-template.cost);
      addPaper(-template.paper);
    }
  }, [open, template]);

  if (!open || !template) return null;

  const handleClick = (num: number) => {
    if (num === currentStep) {
      soundManager.click();
      if (currentStep === template.hp / 2) {
        // Успех!
        soundManager.win();
        const newShip = {
          id: `ship_${Date.now()}`,
          templateId: template.id,
          maxHp: template.hp,
        };
        updateFleet([...player.fleet, newShip]);
        alert('Корабль успешно сложен!');
        onClose();
      } else {
        setCurrentStep(s => s + 1);
      }
    } else {
      // Ошибка
      soundManager.crumple();
      const newErrors = errors + 1;
      setErrors(newErrors);
      if (newErrors >= 3) {
        alert('Вы допустили 3 ошибки. Лист смят, ресурсы потрачены впустую!');
        onClose();
      }
    }
  };

  return (
    <Overlay open={open} title={`Складывание: ${template.name}`} onClose={onClose}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 14 }}>Нажимайте на цифры по порядку (1, 2, 3...). Ошибки: {errors} / 3</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 10 }}>
          {Array.from({ length: template.hp / 2 }).map((_, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i < currentStep - 1 ? 'green' : '#ccc' }} />
          ))}
        </div>
      </div>

      {/* Сетка "точек сгиба" */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: 20, 
        maxWidth: 400, 
        margin: '0 auto',
        perspective: '1000px',
        transition: 'all 0.3s ease',
        filter: errors > 0 ? `blur(${errors * 0.5}px) grayscale(${errors * 0.3})` : 'none',
        transform: errors > 0 ? `scale(${1 - errors * 0.05}) rotate(${errors * 2}deg)` : 'none',
        backgroundColor: errors > 0 ? 'rgba(0,0,0,0.05)' : 'transparent',
        padding: 20,
        borderRadius: 8
      }}>
        {sequence.map(num => (
          <button
            key={num}
            onClick={() => handleClick(num)}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: currentStep > num ? '#d4af37' : 'var(--paper)',
              border: '2px dashed var(--burned)',
              fontSize: 24, fontFamily: 'var(--font-typewriter)',
              boxShadow: 'var(--shadow-soft)',
              transition: 'all 0.2s',
              transform: currentStep > num ? 'scale(0.9) rotate(10deg)' : 'none',
              opacity: currentStep > num ? 0.5 : 1,
            }}
            disabled={currentStep > num}
          >
            {num}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 30, textAlign: 'center' }}>
        <button className="rect-btn" onClick={() => {
          if (confirm('Прервать складывание? Ресурсы не вернутся.')) onClose();
        }}>Отмена</button>
      </div>
    </Overlay>
  );
}