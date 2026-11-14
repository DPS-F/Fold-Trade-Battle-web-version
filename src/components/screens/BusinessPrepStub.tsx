import { useGameStore } from '../../state/gameStore';

export function BusinessPrepStub() {
  const setScreen = useGameStore(s => s.setScreen);
  return (
    <div className="table-bg flex-center" style={{ flexDirection: 'column', gap: 24 }}>
      <div className="burned-title">Бизнес-схватка</div>
      <div className="paper-sheet" style={{ padding: 40, maxWidth: 500, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-typewriter)', fontSize: 14 }}>
          Раздел в разработке — следующий этап.
        </p>
        <p style={{ marginTop: 12, fontSize: 12, opacity: 0.6 }}>
          Здесь появятся «Галерея визиток», «Выбор аренды» и сама схватка.
        </p>
        <button className="rect-btn" style={{ marginTop: 24 }} onClick={() => setScreen('main-menu')}>
          ← В главное меню
        </button>
      </div>
    </div>
  );
}