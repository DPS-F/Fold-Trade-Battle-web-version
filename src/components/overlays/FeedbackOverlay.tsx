import { useState } from 'react';
import { Overlay } from '../ui/Overlay';
import { RectButton } from '../ui/RectButton';
import { soundManager } from '../../audio/soundManager';

export function FeedbackOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('Обратная связь');
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullText = `Название: ${title}\n\nТекст:\n${text}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      soundManager.stamp();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleGitHub = () => {
    // Замените на вашу реальную ссылку на репозиторий
    const repoUrl = 'https://github.com/DPS-F/Fold-Trade-Battle-web-version/issues/new';
    const body = encodeURIComponent(`${text}\n\n---\nОтправлено из игры Fold, Trade & Battle.`);
    const t = encodeURIComponent(`[Feedback] ${title || 'Без названия'}`);
    window.open(`${repoUrl}?title=${t}&body=${body}`, '_blank', 'noopener');
    soundManager.click();
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
            placeholder="Опишите баг или идею..."
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <div className="hint-text" style={{ maxWidth: '50%' }}>
            Вы можете скопировать текст и отправить его нам в Telegram <b>@Black_Cassette</b> или создать Issue на GitHub.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <RectButton onClick={handleCopy} disabled={!title.trim() || !text.trim()}>
              {copied ? 'Скопировано!' : 'Копировать'}
            </RectButton>
            <RectButton onClick={handleGitHub} disabled={!title.trim() || !text.trim()}>
              GitHub Issue
            </RectButton>
          </div>
        </div>
      </div>
    </Overlay>
  );
}