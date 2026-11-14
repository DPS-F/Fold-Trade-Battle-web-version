import type { Visa } from '../../data/types';
import { GOODS } from '../../data/goods';

interface Props {
  visa: Visa;
  pieces: number;
  onClick?: () => void;
  isSelected?: boolean;
  price?: number;
}

export function VisaCard({ visa, pieces, onClick, isSelected, price }: Props) {
  const isUnlocked = pieces >= visa.piecesRequired;
  
  // Определяем цвет рамки по редкости
  const rarityColors = {
    simple: '#a0a0a0',
    rare: '#4a90e2',
    epic: '#9b59b6',
    legendary: '#f1c40f',
    collection: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)'
  };

  const borderColor = visa.rarity === 'collection' ? 'transparent' : rarityColors[visa.rarity];

  return (
    <div
      onClick={onClick}
      style={{
        width: 200,
        height: 280,
        background: 'linear-gradient(135deg, #faf3e0 0%, #f0e4c8 100%)',
        border: isSelected ? '3px solid var(--accent-blue)' : `3px solid ${borderColor}`,
        borderRadius: 8,
        padding: 16,
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-soft)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s',
        transform: isSelected ? 'translateY(-5px)' : 'none',
      }}
    >
      {/* Фон для коллекционной */}
      {visa.rarity === 'collection' && (
        <div style={{ position: 'absolute', inset: 0, background: rarityColors.collection, opacity: 0.1, zIndex: 0 }} />
      )}

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Шапка визитки */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ fontSize: 24 }}>📇</div>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'gray' }}>
            {visa.rarity}
          </div>
        </div>

        {/* Имя */}
        <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--font-typewriter)', fontSize: 18, lineHeight: 1.1 }}>
          {isUnlocked ? visa.name : '???'}
        </h3>
        
        {/* Описание */}
        <p style={{ margin: 0, fontSize: 11, opacity: 0.8, flex: 1 }}>
          {isUnlocked ? visa.description : 'Соберите визитку, чтобы узнать подробности.'}
        </p>

        {/* Характеристики */}
        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px dashed rgba(0,0,0,0.2)', fontSize: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>Производит:</span>
            <strong>{GOODS[visa.produces].name}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Нужно:</span>
            <strong>{isUnlocked ? GOODS[visa.requires[0]].name : '???'}</strong>
          </div>
        </div>

        {/* Цена (для аренды) */}
        {price !== undefined && (
          <div style={{ marginTop: 8, textAlign: 'center', fontWeight: 'bold', color: 'var(--burned)' }}>
            Аренда: {price} 🪙
          </div>
        )}

        {/* Прогресс кусков */}
        {!isUnlocked && (
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 11 }}>
            Кусков: {pieces} / {visa.piecesRequired}
          </div>
        )}
      </div>
    </div>
  );
}