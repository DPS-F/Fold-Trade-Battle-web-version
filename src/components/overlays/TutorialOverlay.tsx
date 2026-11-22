import { useState } from 'react';
import { Overlay } from '../ui/Overlay';
import { RectButton } from '../ui/RectButton';
import { useGameStore } from '../../state/gameStore';

const TUTORIAL_STEPS = [
  { title: "Добро пожаловать!", desc: "Вы - бумажный магнат и адмирал. Ваша цель - строить бизнес-империю, складывать бумажный флот и сражаться за контракты. Давайте разберемся с основами.", image: "📄" },
  { title: "Бизнес-схватка", desc: "Это настольная игра на поле. Ходите по клеткам (Рынок, Производство, Штраф). Зарабатывайте обрезки (деньги), производите товары и закрывайте визитки. Кто закроет все свои визитки первым - победит.", image: "🎲" },
  { title: "Складывание", desc: "Перед боем нужно сложить корабли из бумаги. Это мини-игра на внимательность. Ошибетесь 3 раза - лист сомнется, а ресурсы пропадут. Флот расходуется после каждого боя!", image: "✂️" },
  { title: "Бумажный бой", desc: "Тактический пошаговый бой. У кораблей есть Скорость (⚡), HP и Урон. Быстрые корабли ходят первыми. Выбирайте цели с умом. На легких уровнях боты прощают ошибки, на сложных - безжалостны.", image: "⚔️" },
  { title: "Интерфейс", desc: "Внизу экрана - важные кнопки: Награды (ежедневки), Достижения, Документация и Сохранить. В бизнес-схватке нажимайте 'M' для рынка и 'I' для инвентаря, когда ждете хода.", image: "🖱️" }
];

export function TutorialOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const finishTutorial = useGameStore(s => s.finishTutorial);

  const handleNext = () => {
    if (step < TUTORIAL_STEPS.length - 1) setStep(s => s + 1);
    else handleFinish();
  };

  const handleFinish = () => {
    finishTutorial();
    onClose();
  };

  const current = TUTORIAL_STEPS[step];

  return (
    <Overlay open={open} title="Обучение" onClose={handleFinish} width={600}>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 80, marginBottom: 20 }}>{current.image}</div>
        <h3 style={{ fontFamily: 'var(--font-typewriter)', fontSize: 24, color: 'var(--burned)', marginBottom: 12 }}>{current.title}</h3>
        <p style={{ fontSize: 14, lineHeight: 1.6, minHeight: 80 }}>{current.desc}</p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px dashed rgba(58,35,24,0.25)' }}>
        <RectButton onClick={handleFinish} style={{ background: 'transparent', border: 'none', boxShadow: 'none', opacity: 0.6 }}>Пропустить обучение</RectButton>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-typewriter)', fontSize: 12 }}>{step + 1} / {TUTORIAL_STEPS.length}</span>
          <RectButton onClick={handleNext}>{step === TUTORIAL_STEPS.length - 1 ? 'Начать игру' : 'Далее →'}</RectButton>
        </div>
      </div>
    </Overlay>
  );
}