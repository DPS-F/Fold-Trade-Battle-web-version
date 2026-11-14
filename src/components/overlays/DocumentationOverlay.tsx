import { useState } from 'react';
import { Overlay } from '../ui/Overlay';
import { DOC_SECTIONS } from '../../data/documentation';
import { soundManager } from '../../audio/soundManager';

export function DocumentationOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const section = DOC_SECTIONS[idx];

  const go = (i: number) => {
    soundManager.paper();
    setIdx(Math.max(0, Math.min(DOC_SECTIONS.length - 1, i)));
  };

  return (
    <Overlay open={open} title="Документация" onClose={onClose} width={860}>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        <aside style={{ borderRight: '1px dashed rgba(58,35,24,0.25)', paddingRight: 16 }}>
          <div className="form-label" style={{ marginBottom: 8 }}>Содержание</div>
          {DOC_SECTIONS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 10px',
                fontFamily: 'var(--font-typewriter)',
                fontSize: 12,
                background: i === idx ? 'rgba(180,150,100,0.25)' : 'transparent',
                borderRadius: 3,
                marginBottom: 2,
                color: 'var(--ink)',
              }}
            >
              {s.title}
            </button>
          ))}
        </aside>

        <article>
          <h3 style={{ fontFamily: 'var(--font-typewriter)', marginTop: 0 }}>{section.title}</h3>
          {section.paragraphs.map((p, i) => (
            <p key={i} style={{ lineHeight: 1.6, fontSize: 14 }}>{p}</p>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px dashed rgba(58,35,24,0.25)' }}>
            <button className="rect-btn" onClick={() => go(idx - 1)} disabled={idx === 0}>← Назад</button>
            <span style={{ fontFamily: 'var(--font-typewriter)', fontSize: 11, opacity: 0.6, alignSelf: 'center' }}>
              {idx + 1} / {DOC_SECTIONS.length}
            </span>
            <button className="rect-btn" onClick={() => go(idx + 1)} disabled={idx === DOC_SECTIONS.length - 1}>Вперёд →</button>
          </div>
        </article>
      </div>
    </Overlay>
  );
}