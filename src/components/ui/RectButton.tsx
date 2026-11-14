import type { ReactNode } from 'react';
import { soundManager } from '../../audio/soundManager';

interface RectButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  style?: React.CSSProperties;
}

export function RectButton({ children, onClick, disabled, type = 'button', style }: RectButtonProps) {
  return (
    <button
      type={type}
      className="rect-btn"
      disabled={disabled}
      style={style}
      onClick={() => { if (!disabled) { soundManager.click(); onClick?.(); } }}
      onMouseEnter={() => { if (!disabled) soundManager.hover(); }}
    >
      {children}
    </button>
  );
}