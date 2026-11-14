import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBattleStore } from '../../state/battleStore';
import { useGameStore } from '../../state/gameStore';
import { TEMPLATES } from '../../data/templates';
import { BattleResultsOverlay } from '../overlays/BattleResultsOverlay';
import { soundManager } from '../../audio/soundManager';

export function BattleScreen() {
  const { 
    playerFleet, botFleet, phase, turn, winner, attacksLeft, log, rollInitiative, attack 
  } = useBattleStore();
  const [selectedAttacker, setSelectedAttacker] = useState<string | null>(null);

  const handleTargetClick = (targetId: string) => {
    if (phase !== 'player_turn') return;
    // В упрощенной версии атакует первый живой корабль, если не выбран конкретный
    const attackerId = selectedAttacker || playerFleet[0]?.id;
    if (attackerId) {
      soundManager.crumple();
      attack(attackerId, targetId);
      setSelectedAttacker(null); // Сбрасываем после атаки
    }
  };

  if (winner !== 'none') {
    return <BattleResultsOverlay winner={winner} />;
  }

  return (
    <div className="table-bg" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: 20 }}>
      
      {/* Верхняя панель статуса */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h2 className="burned-title">{phase === 'setup' ? 'Расстановка' : 'Бой'}</h2>
        {phase === 'setup' && <button className="rect-btn" onClick={rollInitiative}>Бросить кубик</button>}
        {phase === 'player_turn' && <div style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>Ваш ход! Осталось атак: {attacksLeft}</div>}
        {phase === 'bot_turn' && <div style={{ color: 'var(--accent-burgundy)', fontWeight: 'bold' }}>Ход противника...</div>}
      </div>

      <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Флот игрока (Слева) */}
        <div style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ textAlign: 'center', fontFamily: 'var(--font-typewriter)' }}>Ваш флот</h3>
          {playerFleet.map(ship => (
            <div 
              key={ship.id} 
              onClick={() => { if (phase === 'player_turn') setSelectedAttacker(ship.id); }}
              style={{
                padding: 10, background: 'var(--paper)', borderRadius: 8, 
                border: selectedAttacker === ship.id ? '3px solid var(--accent-blue)' : '1px solid var(--paper-edge)',
                cursor: phase === 'player_turn' ? 'pointer' : 'default',
                boxShadow: 'var(--shadow-soft)',
                opacity: ship.currentHp > 0 ? 1 : 0.3
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-typewriter)' }}>{TEMPLATES[ship.templateId].name}</span>
                <span>❤️ {ship.currentHp} / {ship.maxHp}</span>
              </div>
              <div style={{ height: 10, background: '#ddd', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(ship.currentHp / ship.maxHp) * 100}%`, background: 'var(--accent-blue)' }} />
              </div>
              <div style={{ textAlign: 'center', fontSize: 30, marginTop: 10 }}>⛵</div>
            </div>
          ))}
        </div>

        {/* Лог боя (Центр) */}
        <div style={{ width: '20%', textAlign: 'center', opacity: 0.8 }}>
          <div style={{ maxHeight: 300, overflowY: 'auto', fontSize: 12, fontFamily: 'var(--font-typewriter)' }}>
            {log.slice(-5).map((l, i) => <div key={i} style={{ marginBottom: 4 }}>{l}</div>)}
          </div>
        </div>

        {/* Флот бота (Справа) */}
        <div style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ textAlign: 'center', fontFamily: 'var(--font-typewriter)' }}>Флот противника</h3>
          {botFleet.map(ship => (
            <div 
              key={ship.id}
              onClick={() => handleTargetClick(ship.id)}
              style={{
                padding: 10, background: 'var(--paper)', borderRadius: 8,
                border: '1px solid var(--paper-edge)',
                cursor: phase === 'player_turn' ? 'crosshair' : 'default',
                boxShadow: 'var(--shadow-soft)',
                transform: phase === 'player_turn' ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-typewriter)' }}>{TEMPLATES[ship.templateId].name}</span>
                <span>❤️ {ship.currentHp} / {ship.maxHp}</span>
              </div>
              <div style={{ height: 10, background: '#ddd', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(ship.currentHp / ship.maxHp) * 100}%`, background: 'var(--accent-burgundy)' }} />
              </div>
              <div style={{ textAlign: 'center', fontSize: 30, marginTop: 10, transform: 'scaleX(-1)' }}>⛵</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}