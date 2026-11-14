import { Overlay } from '../ui/Overlay';
import { ALL_TEMPLATES, TEMPLATES } from '../../data/templates';
import { useGameStore } from '../../state/gameStore';
import { soundManager } from '../../audio/soundManager';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (id: string) => void;
}

export function TemplatesGalleryOverlay({ open, onClose, onSelectTemplate }: Props) {
  const player = useGameStore(s => s.player);

  const handleSelect = (id: string) => {
    const template = TEMPLATES[id];
    if (!player.unlockedTemplates.includes(id)) {
      alert('Этот шаблон ещё не открыт!');
      return;
    }
    if (player.coins < template.cost || player.paper < template.paper) {
      alert('Недостаточно монет или бумаги для складывания!');
      return;
    }
    soundManager.click();
    onSelectTemplate(id);
    onClose();
  };

  return (
    <Overlay open={open} title="Галерея шаблонов" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minHeight: 400 }}>
        {ALL_TEMPLATES.map(template => {
          const isUnlocked = player.unlockedTemplates.includes(template.id);
          
          return (
            <div 
              key={template.id} 
              onClick={() => handleSelect(template.id)}
              style={{ 
                display: 'flex', gap: 20, padding: 16, 
                background: isUnlocked ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.05)', 
                border: '1px solid var(--paper-edge)', borderRadius: 4, 
                cursor: isUnlocked ? 'pointer' : 'not-allowed', opacity: isUnlocked ? 1 : 0.5 
              }}
            >
              <div style={{ width: 100, height: 100, background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                ⛵
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 8px', fontFamily: 'var(--font-typewriter)', fontSize: 18 }}>
                  {template.name} {!isUnlocked && '(Закрыто)'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                  <div>❤️ HP: {template.hp}</div>
                  <div>⚔️ Урон: {template.damage}</div>
                  <div>🪙 Стоимость: {template.cost}</div>
                  <div>📄 Бумага: {template.paper}</div>
                </div>
                <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>{template.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Overlay>
  );
}