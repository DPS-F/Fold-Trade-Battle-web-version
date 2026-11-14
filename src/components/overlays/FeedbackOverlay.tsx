import { useState } from 'react';
import { Overlay } from '../ui/Overlay';
import { RectButton } from '../ui/RectButton';
import { soundManager } from '../../audio/soundManager';

const GITHUB_ISSUE_URL = 'https://github.com/Black-Cassette/fold-trade-battle/issues/new';

export function FeedbackOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('Обратная связь');
  const [text, setText] = useState('');

  const submit = () => {
    const body = encodeURIComponent(`${text}\n\n---\nОтправлено из игры Fold, Trade & Battle.`);
    const t = encodeURIComponent(`[Feedback] ${title || 'Без названия'}`);
    window.open(`${GITHUB_ISSUE_URL}?title=${t}&body=${body}`, '_blank', 'noopener');
    soundManager.stamp();
  };

  return (
    <Overlay open={open} title="Обратная связь" onClose={onClose}>
      <div style={{ display: 'grid', gap: 14 }}>
        <div>
          <label className="form-label">Название обращения ({title.length} / 20)</label>
          <input
            className="form-input"
            value={title}
            maxLength={20}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Текст обращения ({text.length} / 300)</label>
          <textarea
            className="form-input"
            value={text}
            maxLength={300}
            rows={6}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="hint-text">Откроется GitHub Issue. Контакт разработчика: @Black_Cassette</span>
          <RectButton onClick={submit} disabled={!title.trim() || !text.trim()}>Отправить →</RectButton>
        </div>
      </div>
    </Overlay>
  );
}