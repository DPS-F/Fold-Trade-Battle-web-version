import type { ReactNode } from 'react';
import { soundManager } from '../../audio/soundManager';

interface RoundButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  title?: string;
}

export function RoundButton({ icon, label, onClick, title }: RoundButtonProps) {
  return (
    <button
      className="round-btn"
      title={title ?? label}
      onClick={() => { soundManager.click(); onClick(); }}
      onMouseEnter={() => soundManager.hover()}
    >
      <span className="icon">{icon}</span>
      <span>{label}</span>
    </button>
  );
}