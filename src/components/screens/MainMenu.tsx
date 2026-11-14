import { useState } from 'react';
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
import { soundManager } from '../../audio/soundManager';

export function MainMenu() {
  const player = useGameStore(s => s.player);
  const overlayStack = useGameStore(s => s.overlayStack);
  const openOverlay = useGameStore(s => s.openOverlay);
  const closeOverlay = useGameStore(s => s.closeOverlay);
  const setScreen = useGameStore(s => s.setScreen);

  const [hoverPaper, setHoverPaper] = useState<'business' | 'battle' | null>(null);

  const isOpen = (id: string) => overlayStack[overlayStack.length - 1] === id;

  const goBusiness = () => {
    soundManager.flip();
    setScreen('business-prep');
  };
  const goBattle = () => {
    soundManager.flip();
    setScreen('battle-prep');
  };

  return (
    <div className="table-bg" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        className="burned-title"
        style={{ position: 'absolute', top: '5%', left: '4%', maxWidth: '40%', lineHeight: 1.05 }}
      >
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

      {/* Центральные кнопки */}
      <div style={{ position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 24 }}>
        <RoundButton icon="🎁" label="Награды" onClick={() => openOverlay('meta-rewards')} />
        <RoundButton icon="🏆" label="Достижения" onClick={() => openOverlay('achievements')} />
        <RoundButton icon="📖" label="Документация" onClick={() => openOverlay('documentation')} />
        <RoundButton icon="💾" label="Сохранить" onClick={() => openOverlay('save-load')} />
        <RoundButton icon="✉️" label="Обратная связь" onClick={() => openOverlay('feedback')} />
      </div>

      {/* Угловые кнопки */}
      <div style={{ position: 'absolute', bottom: '5%', left: '4%' }}>
        <RoundButton icon="👤" label="Профиль" onClick={() => openOverlay('profile')} />
      </div>
      <div style={{ position: 'absolute', bottom: '5%', right: '4%' }}>
        <RoundButton icon="⚙️" label="Настройки" onClick={() => openOverlay('settings')} />
      </div>

      {/* Оверлеи */}
      <ProfileOverlay open={isOpen('profile')} onClose={closeOverlay} />
      <DocumentationOverlay open={isOpen('documentation')} onClose={closeOverlay} />
      <SaveLoadOverlay open={isOpen('save-load')} onClose={closeOverlay} />
      <FeedbackOverlay open={isOpen('feedback')} onClose={closeOverlay} />
      <ConversionOverlay open={isOpen('conversion')} onClose={closeOverlay} />
      <SettingsOverlay open={isOpen('settings')} onClose={closeOverlay} />
      <MetaOverlay open={isOpen('meta-rewards')} onClose={closeOverlay} />
      <AchievementsOverlay open={isOpen('achievements')} onClose={closeOverlay} />
    </div>
  );
}