import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBusinessStore } from '../../state/businessStore';
import { useGameStore } from '../../state/gameStore';
import { BOARD } from '../../data/board';
import { VISAS } from '../../data/visas';
import { MarketOverlay } from '../overlays/MarketOverlay';
import { ProductionOverlay } from '../overlays/ProductionOverlay';
import { MyVisasOverlay } from '../overlays/MyVisasOverlay';
import { BusinessResultsOverlay } from '../overlays/BusinessResultsOverlay';
import { PinballMinigame } from '../minigame/PinballMinigame';

export function BusinessBattle() {
  const players = useBusinessStore(s => s.players);
  const turnIndex = useBusinessStore(s => s.turnIndex);
  const phase = useBusinessStore(s => s.phase);
  const lastRoll = useBusinessStore(s => s.lastRoll);
  const winnerId = useBusinessStore(s => s.winnerId);
  const log = useBusinessStore(s => s.log);
  const rollDice = useBusinessStore(s => s.rollDice);
  
  const tokenSkin = useGameStore(s => s.player.tokenSkin);
  const openOverlay = useGameStore(s => s.openOverlay);
  const overlayStack = useGameStore(s => s.overlayStack);
  const closeOverlay = useGameStore(s => s.closeOverlay);

  const isOpen = (id: string) => overlayStack[overlayStack.length - 1] === id;

  const currentPlayer = players[turnIndex];
  const isPlayerTurn = !currentPlayer?.isBot;
  const cell = BOARD[currentPlayer?.position || 0];

  useEffect(() => {
    if (isPlayerTurn && phase === 'action' && currentPlayer) {
      if (cell === 'market') openOverlay('market');
      if (cell === 'production') openOverlay('production');
    }
  }, [isPlayerTurn, phase, cell, currentPlayer, openOverlay]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isPlayerTurn && phase === 'idle' && overlayStack.length === 0) {
        if (e.key.toLowerCase() === 'm') openOverlay('market');
        if (e.key.toLowerCase() === 'i') openOverlay('my-visas');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPlayerTurn, phase, openOverlay, overlayStack.length]);

  const closeIfAction = () => {
    closeOverlay();
    const state = useBusinessStore.getState();
    if (state.phase === 'action' && !state.players[state.turnIndex].isBot) {
      state.endTurn();
    }
  };

  const handleMarketClose = () => closeIfAction();
  const handleProductionClose = () => closeIfAction();
  const handleMyVisasClose = () => closeOverlay();

  if (winnerId) {
    return <BusinessResultsOverlay winnerId={winnerId} />;
  }

  const getPlayerPosStyle = (index: number) => {
    const total = players.length;
    if (total === 1) return { bottom: 20, left: '50%', transform: 'translateX(-50%)' };
    if (total === 2) {
      if (index === 0) return { bottom: 20, left: '50%', transform: 'translateX(-50%)' };
      return { top: 20, left: '50%', transform: 'translateX(-50%)' };
    }
    if (total === 3) {
      if (index === 0) return { bottom: 20, left: '50%', transform: 'translateX(-50%)' };
      if (index === 1) return { top: 20, left: '50%', transform: 'translateX(-50%)' };
      return { left: 20, top: '50%', transform: 'translateY(-50%)' };
    }
    if (index === 0) return { bottom: 20, left: '50%', transform: 'translateX(-50%)' };
    if (index === 1) return { top: 20, left: '50%', transform: 'translateX(-50%)' };
    if (index === 2) return { left: 20, top: '50%', transform: 'translateY(-50%)' };
    return { right: 20, top: '50%', transform: 'translateY(-50%)' };
  };

  // Функция для стиля фишки
  const getTokenStyle = (isBot: boolean) => {
    if (isBot) return { background: 'var(--accent-burgundy)', border: '2px solid #fff' };
    if (tokenSkin === 'gold') return { background: 'linear-gradient(135deg, #FFD700, #FFA500)', border: '2px solid #FFF', boxShadow: '0 0 10px #FFD700' };
    if (tokenSkin === 'silver') return { background: 'linear-gradient(135deg, #E0E0E0, #A0A0A0)', border: '2px solid #FFF', boxShadow: '0 0 10px #E0E0E0' };
    return { background: 'var(--accent-blue)', border: '2px solid #fff' };
  };

  return (
    <div className="table-bg" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      
      {/* МИНИ-ИГРА С ШАРИКОМ */}
      <PinballMinigame />

      {/* ЛЕВАЯ ПАНЕЛЬ: Логи и Кнопки */}
      <div style={{ position: 'absolute', left: 20, top: 20, width: 260, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: 'var(--paper)', padding: 12, borderRadius: 8, boxShadow: 'var(--shadow-soft)', border: '2px solid var(--paper-edge)' }}>
          <div style={{ fontFamily: 'var(--font-typewriter)', fontSize: 14, fontWeight: 'bold', marginBottom: 8, borderBottom: '1px dashed #ccc', paddingBottom: 4 }}>
            Действия ботов:
          </div>
          <div style={{ maxHeight: 250, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {log.length === 0 ? (
              <div style={{ fontSize: 12, opacity: 0.5, fontStyle: 'italic' }}>Ожидание действий...</div>
            ) : (
              log.map((l, i) => <div key={i} style={{ fontSize: 12, fontFamily: 'var(--font-typewriter)' }}>{l}</div>)
            )}
          </div>
        </div>

        <div style={{ background: 'var(--paper)', padding: 12, borderRadius: 8, boxShadow: 'var(--shadow-soft)', border: '2px solid var(--paper-edge)' }}>
           <button className="rect-btn" style={{ width: '100%', marginBottom: 8 }} onClick={() => openOverlay('my-visas')}>Мои визитки (I)</button>
           <button className="rect-btn" style={{ width: '100%' }} onClick={() => openOverlay('market')} disabled={isPlayerTurn && phase === 'action'}>Рынок (M)</button>
        </div>
      </div>

      {/* ЦЕНТР: Поле и Кубик */}
      <div style={{ 
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        width: '100%', maxWidth: 650, aspectRatio: '1 / 1', 
        background: '#e8dbc5', border: '12px solid var(--wood-dark)', borderRadius: 12, 
        boxShadow: 'var(--shadow-deep)', padding: 8, display: 'grid', 
        gridTemplateColumns: 'repeat(10, 1fr)', gridTemplateRows: 'repeat(10, 1fr)', gap: 2,
        zIndex: 5
      }}>
        {BOARD.map((cellType, i) => {
          let row = 0, col = 0;
          if (i < 10) { row = 1; col = i + 1; }
          else if (i < 18) { row = i - 8; col = 10; }
          else if (i < 28) { row = 10; col = 10 - (i - 18); }
          else { row = 10 - (i - 27); col = 1; }
          const isVertical = col === 1 || col === 10;
          const isFlipped = col === 10 || row === 1;

          return (
            <div key={i} style={{ gridRow: row, gridColumn: col, background: cellType === 'start' ? '#d4af37' : cellType === 'market' ? '#f4ebd9' : cellType === 'production' ? '#dcc39f' : cellType === 'penalty' ? '#c49b7b' : '#faf3e0', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, textAlign: 'center', fontFamily: 'var(--font-typewriter)', position: 'relative', writingMode: isVertical ? 'vertical-rl' : 'horizontal-tb', transform: isFlipped && isVertical ? 'rotate(180deg)' : 'none' }}>
              <span style={{ opacity: 0.8, pointerEvents: 'none', transform: (!isVertical && isFlipped) ? 'rotate(180deg)' : 'none' }}>{cellType === 'start' ? 'Старт' : cellType === 'market' ? 'Рынок' : cellType === 'production' ? 'Произв.' : cellType === 'penalty' ? 'Штраф' : 'Прогулка'}</span>
              {players.map(p => p.position === i ? (
                <motion.div 
                  key={p.id} 
                  layoutId={`token_${p.id}`} 
                  style={{ 
                    width: 14, height: 14, borderRadius: '50%', position: 'absolute', zIndex: 10,
                    ...getTokenStyle(p.isBot)
                  }} 
                />
              ) : null)}
            </div>
          );
        })}
        <div style={{ gridRow: '2 / 10', gridColumn: '2 / 10', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)', borderRadius: 8 }}>
          {players.map((p, idx) => {
            const isHuman = !p.isBot;
            return (
              <div key={p.id} onClick={() => { if (isHuman) openOverlay('my-visas'); }} style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: isHuman ? 'pointer' : 'default', ...getPlayerPosStyle(idx) }}>
                <div style={{ fontFamily: 'var(--font-typewriter)', fontWeight: isPlayerTurn && isHuman ? 'bold' : 'normal', background: 'rgba(255,255,255,0.85)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(0,0,0,0.1)', textAlign: 'center', minWidth: 80 }}>
                  <div style={{ fontSize: 10 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: p.isBot ? 'var(--accent-burgundy)' : 'var(--accent-blue)' }}>🪙 {p.scraps}</div>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {p.visas.map(vId => <div key={vId} style={{ width: 40, height: 60, background: p.closedVisas.includes(vId) ? '#e9d8b0' : '#faf3e0', border: '1px solid var(--burned)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, padding: 2, textAlign: 'center', transform: p.closedVisas.includes(vId) ? 'rotate(180deg)' : 'none' }}>{VISAS[vId].name}</div>)}
                </div>
              </div>
            );
          })}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5 }}>
            {phase === 'rolling' ? <motion.div animate={{ rotate: 360 }} style={{ width: 60, height: 60, background: 'white', border: '2px solid var(--burned)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>{lastRoll}</motion.div> : <button className="round-btn" style={{ width: 80, height: 80 }} onClick={rollDice} disabled={!isPlayerTurn || phase !== 'idle'}>Бросок</button>}
          </div>
        </div>
      </div>

      <MarketOverlay open={isOpen('market')} onClose={handleMarketClose} />
      <ProductionOverlay open={isOpen('production')} onClose={handleProductionClose} />
      <MyVisasOverlay open={isOpen('my-visas')} onClose={handleMyVisasClose} />
    </div>
  );
}