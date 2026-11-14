import { Overlay } from '../ui/Overlay';
import { RectButton } from '../ui/RectButton';
import { useGameStore, saveToStorage } from '../../state/gameStore';
import { soundManager } from '../../audio/soundManager';
import type { PlayerState } from '../../state/gameStore';

export function SaveLoadOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const player = useGameStore(s => s.player);

  const onSave = () => {
    if (!confirm('Прошлое сохранение будет перезаписано. Продолжить?')) return;
    saveToStorage(player);
    soundManager.stamp();
    alert('Прогресс сохранён.');
  };

  const onExport = () => {
    const payload = {
      version: 1,
      player,
      checksum: simpleChecksum(JSON.stringify(player)),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fold-trade-battle-save-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    soundManager.click();
  };

  const onImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed?.player) throw new Error('Нет поля player');
        if (parsed.checksum && parsed.checksum !== simpleChecksum(JSON.stringify(parsed.player))) {
          if (!confirm('Checksum не совпадает. Это может быть ручная правка. Всё равно загрузить?')) return;
        }
        const merged: PlayerState = { ...player, ...parsed.player };
        saveToStorage(merged);
        alert('Прогресс выгружен. Игра будет перезагружена.');
        location.reload();
      } catch (e) {
        alert('Выгрузка не удалась: файл повреждён или имеет неверный формат.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Overlay open={open} title="Сохранить / Выгрузить" onClose={onClose}>
      <div style={{ display: 'grid', gap: 18 }}>
        <div>
          <div className="form-label">Локальное сохранение</div>
          <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 10px' }}>
            Сохраняет текущий прогресс в браузере. Прошлое сохранение будет перезаписано.
          </p>
          <RectButton onClick={onSave}>Сохранить прогресс</RectButton>
        </div>

        <div style={{ borderTop: '1px dashed rgba(58,35,24,0.25)', paddingTop: 16 }}>
          <div className="form-label">Файл сохранения</div>
          <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 10px' }}>
            Экспорт в JSON с checksum. Это не криптографическая защита, но защита от случайной правки.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <RectButton onClick={onExport}>Выгрузить в файл</RectButton>
            <label className="rect-btn" style={{ display: 'inline-flex', alignItems: 'center' }}>
              Загрузить из файла
              <input
                type="file"
                accept="application/json"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onImport(f);
                  e.currentTarget.value = '';
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function simpleChecksum(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(16);
}