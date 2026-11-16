import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBattleStore } from '../../state/battleStore';
import { TEMPLATES } from '../../data/templates';
import { BattleResultsOverlay } from '../overlays/BattleResultsOverlay';
import { soundManager } from '../../audio/soundManager';

export function BattleScreen() {
  const { 
    playerFleet, botFleet, phase, winner, log, round, activeUnitId, attack, passTurn, initiativeHolder
  } = useBattleStore();
  
  const activeUnit = [...playerFleet, ...botFleet].find(u => u.id === activeUnitId);

  const handleTargetClick = (targetId: string) => {
    if (phase !== 'player_turn') return;
    soundManager.crumple();
    attack(targetId);
  };

  if (winner !== 'none') {
    return <BattleResultsOverlay winner={winner} />;
  }

  return (
    <div className="table-bg" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: 20 }}>
      
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h2 className="burned-title">{phase === 'setup' ? 'Бой' : `Раунд ${round}`}</h2>
        <div style={{ fontSize: 14, fontFamily: 'var(--font-typewriter)' }}>
          Инициатива: {initiativeHolder === 'player' ? 'У вас' : 'У бота'}
        </div>
        {phase === 'player_turn' && <div style={{ color: 'var(--accent-blue)', fontWeight: 'bold', marginTop: 10 }}>Активация: Ваш {TEMPLATES[activeUnit?.templateId || 'scout'].name}</div>}
        {phase === 'bot_turn' && <div style={{ color: 'var(--accent-burgundy)', fontWeight: 'bold', marginTop: 10 }}>Ход противника...</div>}
      </div>

      <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Флот игрока */}
        <div style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ textAlign: 'center', fontFamily: 'var(--font-typewriter)' }}>Ваш флот</h3>
          {playerFleet.map(ship => (
            <div key={ship.id} style={{
                padding: 10, background: 'var(--paper)', borderRadius: 8, 
                border: activeUnitId === ship.id ? '3px solid var(--accent-blue)' : '1px solid var(--paper-edge)',
                boxShadow: 'var(--shadow-soft)',
                opacity: ship.currentHp > 0 ? 1 : 0.3
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-typewriter)' }}>{TEMPLATES[ship.templateId].name}</span>
                <span>❤️ {ship.currentHp} / {ship.maxHp} | ⚡ {ship.spd}</span>
              </div>
              <div style={{ height: 10, background: '#ddd', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(ship.currentHp / ship.maxHp) * 100}%`, background: 'var(--accent-blue)' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Лог */}
        <div style={{ width: '20%', textAlign: 'center', opacity: 0.8 }}>
          <div style={{ maxHeight: 300, overflowY: 'auto', fontSize: 12, fontFamily: 'var(--font-typewriter)' }}>
            {log.slice(-6).map((l, i) => <div key={i} style={{ marginBottom: 4 }}>{l}</div>)}
          </div>
        </div>

        {/* Флот бота */}
        <div style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ textAlign: 'center', fontFamily: 'var(--font-typewriter)' }}>Флот противника</h3>
          {botFleet.map(ship => (
            <div 
              key={ship.id}
              onClick={() => handleTargetClick(ship.id)}
              style={{
                padding: 10, background: 'var(--paper)', borderRadius: 8,
                border: activeUnitId === ship.id ? '3px solid var(--accent-burgundy)' : '1px solid var(--paper-edge)',
                cursor: phase === 'player_turn' ? 'crosshair' : 'default',
                boxShadow: 'var(--shadow-soft)',
                transform: phase === 'player_turn' ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-typewriter)' }}>{TEMPLATES[ship.templateId].name}</span>
                <span>❤️ {ship.currentHp} / {ship.maxHp} | ⚡ {ship.spd}</span>
              </div>
              <div style={{ height: 10, background: '#ddd', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(ship.currentHp / ship.maxHp) * 100}%`, background: 'var(--accent-burgundy)' }} />
              </div>
            </div>
          ))}
        </div>

      </div>

      {phase === 'player_turn' && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button className="rect-btn" onClick={passTurn}>Пропустить ход</button>
        </div>
      )}
    </div>
  );
}