import { Overlay } from '../ui/Overlay';
import { useGameStore } from '../../state/gameStore';
import { RectButton } from '../ui/RectButton';
import { LEVELS } from '../../data/progression';

export function LevelMapOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const player = useGameStore(s => s.player);
  const triggerEnding = useGameStore(s => s.triggerEnding);

  const renderEnding = (id: string, title: string, desc: string, condition: boolean) => (
    <div style={{ 
      padding: 16, marginBottom: 12, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 8,
      background: condition ? 'rgba(201, 162, 39, 0.15)' : 'rgba(0,0,0,0.05)',
      border: `2px solid ${condition ? 'var(--gold)' : 'transparent'}`,
      opacity: condition ? 1 : 0.6
    }}>
      <h4 style={{ margin: 0, fontFamily: 'var(--font-typewriter)', color: condition ? 'var(--burned)' : 'inherit' }}>
        {condition ? '🏆 ' : '🔒 '} {title}
      </h4>
      <p style={{ margin: 0, fontSize: 12 }}>{desc}</p>
      {condition && player.endings.includes(id) && (
        <div style={{ marginTop: 8 }}>
          <RectButton onClick={() => { onClose(); triggerEnding(id); }} style={{ fontSize: 11, padding: '4px 10px' }}>Посмотреть концовку</RectButton>
        </div>
      )}
    </div>
  );

  return (
    <Overlay open={open} title="Карта прогресса" onClose={onClose} width={800}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-typewriter)', marginTop: 0 }}>Текущий уровень: {player.level}</h3>
          <p style={{ fontSize: 13, marginBottom: 16 }}>
            Для перехода на следующий уровень нужно победить:
            <br/><b style={{ color: 'var(--accent-blue)' }}>Бизнес-схваток: {player.businessWins % (player.level)} / {player.level}</b>
            <br/><b style={{ color: 'var(--accent-burgundy)' }}>Боёв: {player.battleWins % (player.level)} / {player.level}</b>
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {LEVELS.map((lvl, i) => (
              <div key={lvl.level} style={{ 
                padding: 8, textAlign: 'center', borderRadius: 4,
                background: player.level === lvl.level ? 'var(--accent-blue)' : (player.level > lvl.level ? 'var(--gold)' : 'rgba(0,0,0,0.1)'),
                color: player.level === lvl.level ? 'white' : 'var(--ink)',
                fontFamily: 'var(--font-typewriter)', fontSize: 12,
                border: lvl.isBoss ? '2px solid var(--accent-burgundy)' : 'none'
              }}>
                Ур. {lvl.level}
                {lvl.isBoss && <div style={{ fontSize: 9 }}>БОСС</div>}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontFamily: 'var(--font-typewriter)', marginTop: 0 }}>Концовки</h3>
          {renderEnding('level_12', 'Путь Магната', 'Достигните 12 уровня компании.', player.level === 12 || player.endings.includes('level_12'))}
          {renderEnding('all_visas', 'Полная коллекция', 'Соберите все 10 визиток.', player.visasOwned.length === 10 || player.endings.includes('all_visas'))}
          {renderEnding('all_achievements', 'Совершенство', 'Выполните все достижения.', player.achievements.length === 30 || player.endings.includes('all_achievements'))}
          {renderEnding('true_ending', 'Истинный Бумажный Магнат', 'Откройте все 3 предыдущие концовки.', player.endings.includes('true_ending'))}
        </div>
      </div>
    </Overlay>
  );
}