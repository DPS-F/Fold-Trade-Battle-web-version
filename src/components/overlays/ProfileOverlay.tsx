import { useState } from 'react';
import { Overlay } from '../ui/Overlay';
import { RectButton } from '../ui/RectButton';
import { useGameStore } from '../../state/gameStore';
import { soundManager } from '../../audio/soundManager';

export function ProfileOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const player = useGameStore(s => s.player);
  const setPlayerName = useGameStore(s => s.setPlayerName);
  const setPlayerGender = useGameStore(s => s.setPlayerGender);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(player.name);

  const saveName = () => {
    setPlayerName(nameDraft.trim() || 'Игрок');
    setEditingName(false);
    soundManager.stamp();
  };

  return (
    <Overlay open={open} title="Профиль" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 28, alignItems: 'center' }}>
        <div
          style={{
            width: 140, height: 140, borderRadius: '50%',
            background: 'linear-gradient(135deg, #e9d8b0 0%, #b89660 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 72, boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)',
            cursor: 'pointer',
          }}
          title="Сменить пол"
          onClick={() => {
            setPlayerGender(player.gender === 'male' ? 'female' : 'male');
            soundManager.click();
          }}
        >
          {player.gender === 'male' ? '👨' : '👩'}
        </div>

        <div>
          <div className="form-label">Имя игрока (до 20 символов)</div>
          {editingName ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="form-input"
                value={nameDraft}
                maxLength={20}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveName(); }}
                autoFocus
              />
              <RectButton onClick={saveName}>Ок</RectButton>
              <RectButton onClick={() => { setEditingName(false); setNameDraft(player.name); }}>Отмена</RectButton>
            </div>
          ) : (
            <div
              style={{ fontSize: 22, fontFamily: 'var(--font-typewriter)', cursor: 'pointer', padding: '6px 0' }}
              onClick={() => { setEditingName(true); setNameDraft(player.name); }}
              title="Нажмите, чтобы изменить"
            >
              {player.name} ✎
            </div>
          )}

          <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Stat label="Уровень компании" value={player.level} />
            <Stat label="Циклов пройдено" value={`${player.cyclesDone} / 33`} />
            <Stat label="Открыто визиток" value={`${player.visasOwned.length} / 10`} />
            <Stat label="Достижений" value={`${player.achievements.length}`} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px dashed rgba(58,35,24,0.25)' }}>
        <div className="form-label">Сброс прогресса</div>
        <RectButton onClick={() => {
          if (confirm('Сбросить весь прогресс? Действие необратимо.')) {
            localStorage.removeItem('ftb-save-v1');
            location.reload();
          }
        }}>Сбросить прогресс</RectButton>
      </div>
    </Overlay>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ padding: 10, background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(180,150,100,0.4)', borderRadius: 3 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.08em', opacity: 0.6, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 18, fontFamily: 'var(--font-typewriter)', marginTop: 4 }}>{value}</div>
    </div>
  );
}