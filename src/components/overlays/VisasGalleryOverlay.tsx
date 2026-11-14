import { useState } from 'react';
import { Overlay } from '../ui/Overlay';
import { ALL_VISAS } from '../../data/visas';
import { useGameStore } from '../../state/gameStore';
import { soundManager } from '../../audio/soundManager';
import { VisaCard } from '../ui/VisaCard';

export function VisasGalleryOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const player = useGameStore(s => s.player);
  const [page, setPage] = useState(0);

  const visasPerPage = 2;
  const totalPages = Math.ceil(ALL_VISAS.length / visasPerPage);
  const currentVisas = ALL_VISAS.slice(page * visasPerPage, (page + 1) * visasPerPage);

  return (
    <Overlay open={open} title="Галерея визиток" onClose={onClose}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, minHeight: 300 }}>
        {currentVisas.map(visa => (
          <VisaCard 
            key={visa.id} 
            visa={visa} 
            pieces={player.visaPieces[visa.id] || 0} 
          />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px dashed rgba(58,35,24,0.25)' }}>
        <button className="rect-btn" onClick={() => { soundManager.paper(); setPage(p => Math.max(0, p - 1)); }} disabled={page === 0}>← Назад</button>
        <span style={{ alignSelf: 'center', fontFamily: 'var(--font-typewriter)' }}>{page + 1} / {totalPages}</span>
        <button className="rect-btn" onClick={() => { soundManager.paper(); setPage(p => Math.min(totalPages - 1, p + 1)); }} disabled={page === totalPages - 1}>Вперед →</button>
      </div>
    </Overlay>
  );
}