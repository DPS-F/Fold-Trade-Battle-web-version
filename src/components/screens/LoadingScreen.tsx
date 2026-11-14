import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { randomTip } from '../../data/tips';
import { useGameStore } from '../../state/gameStore';

export function LoadingScreen() {
  const [tip, setTip] = useState<string>(() => randomTip());
  const setScreen = useGameStore(s => s.setScreen);
  const markLoaded = useGameStore(s => s.markLoaded);

  useEffect(() => {
    const t = setTimeout(() => {
      markLoaded();
      setScreen('main-menu');
    }, 2400);
    return () => clearTimeout(t);
  }, [setScreen, markLoaded]);

  return (
    <div className="table-bg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="burned-title"
        style={{ fontSize: 'clamp(40px, 5vw, 72px)', marginBottom: 'auto', marginTop: 'auto' }}
      >
        Загрузка...
      </motion.div>

      <button
        onClick={() => setTip(t => randomTip(t))}
        style={{
          marginBottom: '8vh',
          maxWidth: '80vw',
          padding: '14px 24px',
          background: 'rgba(250, 243, 224, 0.95)',
          borderRadius: 3,
          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          color: 'var(--ink)',
          fontFamily: 'var(--font-typewriter)',
          fontSize: 13,
          textAlign: 'center',
          lineHeight: 1.5,
          cursor: 'pointer',
          zIndex: 10,
        }}
        title="Нажмите, чтобы увидеть другой совет"
      >
        <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 4, letterSpacing: '0.1em' }}>
          СОВЕТ · нажмите, чтобы сменить
        </div>
        {tip}
      </button>
    </div>
  );
}