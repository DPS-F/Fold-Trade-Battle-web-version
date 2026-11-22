import { Overlay } from '../ui/Overlay';
import { RectButton } from '../ui/RectButton';
import { useGameStore } from '../../state/gameStore';

export function EndingOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const activeEnding = useGameStore(s => s.player.activeEnding);
  
  const content = {
    level_12: {
      title: 'Путь Магната',
      icon: '👑',
      text: 'Вы прошли все 12 уровней, построили огромную империю и доказали, что являетесь настоящим бумажным магнатом. Ваше имя вписано в историю Архипелага!',
      subtext: 'Спасибо, что играли в Fold, Trade & Battle. Поделитесь своими впечатлениями через кнопку "Обратная связь"!'
    },
    all_visas: {
      title: 'Полная Коллекция',
      icon: '📇',
      text: 'Вы собрали все 10 визиток! От простых до легендарных. Теперь вся экономика бумажного мира лежит у ваших ног.',
      subtext: 'Коллекционер - это призвание. Теперь вы знаете о торговле всё.'
    },
    all_achievements: {
      title: 'Совершенство',
      icon: '🏆',
      text: 'Вы выполнили абсолютно все достижения в игре. Каждое сражение, каждая сделка, каждый сложенный корабль - всё было безупречно.',
      subtext: 'Вы настоящий перфекционист и мастер своего дела.'
    },
    true_ending: {
      title: 'Истинный Бумажный Магнат',
      icon: '🌟',
      text: 'Вы достигли 12 уровня, собрали все визитки и выполнили все достижения. Вы увидели все грани этой игры.',
      subtext: 'Но история на этом не заканчивается... или заканчивается? Спасибо за 100% прохождение!'
    }
  }[activeEnding || 'level_12'];

  if (!content) return null;

  return (
    <Overlay open={open} onClose={onClose} width={600}>
      <div style={{ 
        textAlign: 'center', padding: '40px 20px',
        border: '4px solid var(--gold)', borderRadius: 8, background: 'rgba(250, 243, 224, 1)',
        boxShadow: 'inset 0 0 50px rgba(201, 162, 39, 0.3)'
      }}>
        <div style={{ fontSize: 100, marginBottom: 20, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}>{content.icon}</div>
        <h2 style={{ fontFamily: 'var(--font-typewriter)', fontSize: 32, color: 'var(--burned)', marginBottom: 16 }}>{content.title}</h2>
        <p style={{ fontFamily: 'var(--font-hand)', fontSize: 24, lineHeight: 1.4, marginBottom: 24 }}>{content.text}</p>
        <p style={{ fontFamily: 'var(--font-typewriter)', fontSize: 12, color: 'var(--accent-burgundy)', marginBottom: 32 }}>{content.subtext}</p>
        
        <RectButton onClick={onClose} style={{ padding: '12px 40px', fontSize: 16 }}>Вернуться в игру</RectButton>
      </div>
    </Overlay>
  );
}