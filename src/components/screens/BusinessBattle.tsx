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

export function BusinessBattle() {
  const players = useBusinessStore(s => s.players);
  const turnIndex = useBusinessStore(s => s.turnIndex);
  const phase = useBusinessStore(s => s.phase);
  const lastRoll = useBusinessStore(s => s.lastRoll);
  const winnerId = useBusinessStore(s => s.winnerId);
  const rollDice = useBusinessStore(s => s.rollDice);

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

  return (
    <div className="table-bg flex-center" style={{ padding: 40 }}>
      {/* Счетчик обрезков ИГРОКА */}
      <div
        style={{
          position: 'absolute', top: 20, right: 20, background: 'var(--paper)',
          padding: '10px 20px', borderRadius: 4, fontFamily: 'var(--font-typewriter)',
          fontSize: 20, boxShadow: 'var(--shadow-soft)', border: '1px solid var(--paper-edge)',
          color: 'var(--accent-blue)', fontWeight: 'bold'
        }}
      >
        Ваши обрезки: 🪙 {players.find(p => !p.isBot)?.scraps || 0}
      </div>

      <div
        style={{
          position: 'absolute', top: 20, left: 20, background: 'var(--paper)',
          padding: '10px 20px', borderRadius: 4, fontFamily: 'var(--font-typewriter)',
          boxShadow: 'var(--shadow-soft)', border: '1px solid var(--paper-edge)',
        }}
      >
        Ход: {currentPlayer?.name} {isPlayerTurn && '(Ваш)'}
      </div>

      <div
        style={{
          position: 'relative', width: '100%', maxWidth: 900, aspectRatio: '1 / 1',
          background: '#e8dbc5', border: '16px solid var(--wood-dark)',
          borderRadius: 12, boxShadow: 'var(--shadow-deep), inset 0 0 40px rgba(0,0,0,0.1)',
          padding: 12, display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)',
          gridTemplateRows: 'repeat(10, 1fr)', gap: 3,
        }}
      >
        {BOARD.map((cellType, i) => {
          let row = 0, col = 0;
          if (i < 10) { row = 1; col = i + 1; }
          else if (i < 18) { row = i - 8; col = 10; }
          else if (i < 28) { row = 10; col = 10 - (i - 18); }
          else { row = 10 - (i - 27); col = 1; }

          const isVertical = col === 1 || col === 10;
          const isFlipped = col === 10 || row === 1;

          return (
            <div
              key={i}
              style={{
                gridRow: row, gridColumn: col,
                background: cellType === 'start' ? '#d4af37' : cellType === 'market' ? '#f4ebd9'
                    : cellType === 'production' ? '#dcc39f' : cellType === 'penalty' ? '#c49b7b' : '#faf3e0',
                border: '1px solid rgba(0,0,0,0.15)', borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, textAlign: 'center', fontFamily: 'var(--font-typewriter)',
                position: 'relative', boxShadow: 'inset 0 0 4px rgba(0,0,0,0.05)',
                writingMode: isVertical ? 'vertical-rl' : 'horizontal-tb',
                transform: isFlipped && isVertical ? 'rotate(180deg)' : 'none',
              }}
            >
              <span style={{ opacity: 0.8, pointerEvents: 'none', transform: (!isVertical && isFlipped) ? 'rotate(180deg)' : 'none' }}>
                {cellType === 'start' ? 'Старт' : cellType === 'market' ? 'Рынок'
                  : cellType === 'production' ? 'Произв.' : cellType === 'penalty' ? 'Штраф' : 'Прогулка'}
              </span>

              {players.map(p => {
                if (p.position !== i) return null;
                return (
                  <motion.div
                    key={p.id} layoutId={`token_${p.id}`}
                    style={{
                      width: 16, height: 16, borderRadius: '50%',
                      background: p.isBot ? 'var(--accent-burgundy)' : 'var(--accent-blue)',
                      position: 'absolute', zIndex: 10, boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                      border: '2px solid #fff',
                    }}
                  />
                );
              })}
            </div>
          );
        })}

        <div
          style={{
            gridRow: '2 / 10', gridColumn: '2 / 10', position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
            borderRadius: 8,
          }}
        >
          {players.map((p, idx) => {
            const isHuman = !p.isBot;
            return (
              <div
                key={p.id} onClick={() => { if (isHuman) openOverlay('my-visas'); }}
                style={{
                  position: 'absolute', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 6, cursor: isHuman ? 'pointer' : 'default',
                  ...getPlayerPosStyle(idx),
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-typewriter)', fontWeight: isPlayerTurn && isHuman ? 'bold' : 'normal',
                    background: 'rgba(255,255,255,0.85)', padding: '4px 12px',
                    borderRadius: 4, border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    textAlign: 'center', minWidth: 100
                  }}
                >
                  <div>{p.name}</div>
                  {/* Выводим деньги ботов и игрока прямо под именем */}
                  <div style={{ 
                    fontSize: 12, 
                    color: p.isBot ? 'var(--accent-burgundy)' : 'var(--accent-blue)',
                    marginTop: 2 
                  }}>
                    🪙 {p.scraps}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {p.visas.map(vId => (
                    <div
                      key={vId}
                      style={{
                        width: 60, height: 90,
                        background: p.closedVisas.includes(vId) ? '#e9d8b0' : '#faf3e0',
                        border: '1px solid var(--burned)', borderRadius: 4,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, padding: 4, textAlign: 'center',
                        opacity: p.closedVisas.includes(vId) ? 1 : 0.7,
                        transform: p.closedVisas.includes(vId) ? 'rotate(180deg)' : 'none',
                        transition: 'all 0.3s', boxShadow: 'var(--shadow-soft)',
                      }}
                    >
                      {VISAS[vId].name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5 }}>
            {phase === 'rolling' ? (
              <motion.div
                animate={{ rotate: [0, 90, 180, 270, 360], scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6 }}
                style={{
                  width: 80, height: 80, background: 'white', border: '3px solid var(--burned)',
                  borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 40, fontFamily: 'var(--font-typewriter)', boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                }}
              >
                {lastRoll}
              </motion.div>
            ) : (
              <button
                className="round-btn" style={{ width: 100, height: 100, border: '3px solid var(--burned)' }}
                onClick={rollDice} disabled={!isPlayerTurn || phase !== 'idle'}
              >
                Бросок
              </button>
            )}
            <div style={{ marginTop: 16, fontFamily: 'var(--font-typewriter)', fontSize: 14, background: 'rgba(255,255,255,0.8)', padding: '4px 12px', borderRadius: 4 }}>
              Выпало: {lastRoll || '-'}
            </div>
          </div>
        </div>
      </div>

      <MarketOverlay open={isOpen('market')} onClose={handleMarketClose} />
      <ProductionOverlay open={isOpen('production')} onClose={handleProductionClose} />
      <MyVisasOverlay open={isOpen('my-visas')} onClose={handleMyVisasClose} />
    </div>
  );
}