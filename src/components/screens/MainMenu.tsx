import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../state/gameStore';
import { RoundButton } from '../ui/RoundButton';
import { WoodOrganizer } from '../ui/WoodOrganizer';
import { ProfileOverlay } from '../overlays/ProfileOverlay';
import { DocumentationOverlay } from '../overlays/DocumentationOverlay';
import { SaveLoadOverlay } from '../overlays/SaveLoadOverlay';
import { FeedbackOverlay } from '../overlays/FeedbackOverlay';
import { ConversionOverlay } from '../overlays/ConversionOverlay';
import { SettingsOverlay } from '../overlays/SettingsOverlay';
import { MetaOverlay } from '../overlays/MetaOverlay';
import { AchievementsOverlay } from '../overlays/AchievementsOverlay';
import { LevelMapOverlay } from '../overlays/LevelMapOverlay';
import { TutorialOverlay } from '../overlays/TutorialOverlay';
import { EndingOverlay } from '../overlays/EndingOverlay';
import { soundManager } from '../../audio/soundManager';
import { RectButton } from '../ui/RectButton';
import { BattlePassOverlay } from '../overlays/BattlePassOverlay';
import { RatingOverlay } from '../overlays/RatingOverlay';

export function MainMenu() {
  const player = useGameStore(s => s.player);
  const overlayStack = useGameStore(s => s.overlayStack);
  const openOverlay = useGameStore(s => s.openOverlay);
  const closeOverlay = useGameStore(s => s.closeOverlay);
  const setScreen = useGameStore(s => s.setScreen);

  const [hoverPaper, setHoverPaper] = useState<'business' | 'battle' | null>(null);

  // Автозапуск туториала для новых игроков
  useEffect(() => {
    if (!player.tutorialCompleted) {
      openOverlay('tutorial');
    }
  }, [player.tutorialCompleted, openOverlay]);

  const isOpen = (id: string) => overlayStack[overlayStack.length - 1] === id;

  const goBusiness = () => { soundManager.flip(); setScreen('business-prep'); };
  const goBattle = () => { soundManager.flip(); setScreen('battle-prep'); };

  return (
    <div className="table-bg" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div className="burned-title" style={{ position: 'absolute', top: '5%', left: '4%', maxWidth: '40%', lineHeight: 1.05 }}>
        Fold, Trade<br />&amp; Battle
      </div>

      <div style={{ position: 'absolute', top: '5%', right: '4%', display: 'flex', gap: 12 }}>
        <WoodOrganizer icon="🪙" value={player.coins} title="Монеты" onClick={() => openOverlay('conversion')} />
        <WoodOrganizer icon="💎" value={player.diamonds} title="Алмазы" onClick={() => openOverlay('conversion')} />
      </div>

      <div style={{ position: 'absolute', top: '22%', bottom: '22%', left: '4%', right: '4%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
        <motion.div
          className="paper-sheet"
          onMouseEnter={() => { setHoverPaper('business'); soundManager.paper(); }}
          onMouseLeave={() => setHoverPaper(null)}
          onClick={goBusiness}
          style={{ width: '38%', height: '85%', cursor: 'pointer', pointerEvents: 'auto', padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
          animate={{ rotate: hoverPaper === 'business' ? 0 : -1.5, y: hoverPaper === 'business' ? -8 : 0 }}
        >
          <div className="burned-title" style={{ fontSize: 32, marginBottom: 16 }}>Бизнес-схватка</div>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--ink-soft)', lineHeight: 1.4 }}>
            Заключайте сделки,<br />закрывайте визитки,<br />зарабатывайте обрезки.
          </div>
          <div style={{ marginTop: 24, fontFamily: 'var(--font-typewriter)', fontSize: 11, opacity: 0.55, letterSpacing: '0.1em' }}>НАЖМИТЕ, ЧТОБЫ НАЧАТЬ</div>
        </motion.div>

        {/* Центральная кнопка карты уровней */}
        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <button 
            onClick={() => openOverlay('level-map')}
            style={{ 
              width: 100, height: 100, borderRadius: '50%', border: '3px solid var(--gold)',
              background: 'linear-gradient(135deg, #8b5e3c 0%, #3a2318 100%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(0,0,0,0.4)', cursor: 'pointer', transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontSize: 32 }}>🗺️</span>
            <span style={{ fontFamily: 'var(--font-typewriter)', color: 'white', fontSize: 10, marginTop: 4 }}>УРОВЕНЬ {player.level}</span>
          </button>
          
          {player.endings.includes('true_ending') && (
            <RectButton onClick={() => useGameStore.getState().triggerEnding('true_ending')} style={{ background: 'var(--gold)', color: 'var(--burned)', fontWeight: 'bold' }}>
              Титры
            </RectButton>
          )}
        </div>

        <motion.div
          className="paper-sheet"
          onMouseEnter={() => { setHoverPaper('battle'); soundManager.paper(); }}
          onMouseLeave={() => setHoverPaper(null)}
          onClick={goBattle}
          style={{ width: '38%', height: '85%', cursor: 'pointer', pointerEvents: 'auto', padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
          animate={{ rotate: hoverPaper === 'battle' ? 0 : 1.5, y: hoverPaper === 'battle' ? -8 : 0 }}
        >
          <div className="burned-title" style={{ fontSize: 32, marginBottom: 16 }}>Бой</div>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--ink-soft)', lineHeight: 1.4 }}>
            Складывайте флот<br />и сражайтесь<br />за контракты.
          </div>
          <div style={{ marginTop: 24, fontFamily: 'var(--font-typewriter)', fontSize: 11, opacity: 0.55, letterSpacing: '0.1em' }}>НАЖМИТЕ, ЧТОБЫ НАЧАТЬ</div>
        </motion.div>
      </div>

      <div style={{ position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 24 }}>
        <RoundButton icon="🎁" label="Награды" onClick={() => openOverlay('meta-rewards')} />
        <RoundButton icon="🎫" label="Баттл-пасс" onClick={() => openOverlay('battle-pass')} />
        <RoundButton icon="🏅" label="Рейтинг" onClick={() => openOverlay('rating')} />
        <RoundButton icon="🏆" label="Достижения" onClick={() => openOverlay('achievements')} />
        <RoundButton icon="📖" label="Документация" onClick={() => openOverlay('documentation')} />
        <RoundButton icon="💾" label="Сохранить" onClick={() => openOverlay('save-load')} />
        <RoundButton icon="✉️" label="Обратная связь" onClick={() => openOverlay('feedback')} />
      </div>

      <div style={{ position: 'absolute', bottom: '5%', left: '4%' }}>
        <RoundButton icon="👤" label="Профиль" onClick={() => openOverlay('profile')} />
      </div>
      <div style={{ position: 'absolute', bottom: '5%', right: '4%' }}>
        <RoundButton icon="⚙️" label="Настройки" onClick={() => openOverlay('settings')} />
      </div>

      <ProfileOverlay open={isOpen('profile')} onClose={closeOverlay} />
      <DocumentationOverlay open={isOpen('documentation')} onClose={closeOverlay} />
      <SaveLoadOverlay open={isOpen('save-load')} onClose={closeOverlay} />
      <FeedbackOverlay open={isOpen('feedback')} onClose={closeOverlay} />
      <ConversionOverlay open={isOpen('conversion')} onClose={closeOverlay} />
      <SettingsOverlay open={isOpen('settings')} onClose={closeOverlay} />
      <MetaOverlay open={isOpen('meta-rewards')} onClose={closeOverlay} />
      <AchievementsOverlay open={isOpen('achievements')} onClose={closeOverlay} />
      <LevelMapOverlay open={isOpen('level-map')} onClose={closeOverlay} />
      <TutorialOverlay open={isOpen('tutorial')} onClose={closeOverlay} />
      <EndingOverlay open={isOpen('ending')} onClose={closeOverlay} />
      <BattlePassOverlay open={isOpen('battle-pass')} onClose={closeOverlay} />
      <RatingOverlay open={isOpen('rating')} onClose={closeOverlay} />
    </div>
  );
}