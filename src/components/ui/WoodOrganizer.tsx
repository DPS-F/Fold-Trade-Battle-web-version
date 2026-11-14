import { soundManager } from '../../audio/soundManager';

interface WoodOrganizerProps {
  icon: string;
  value: number;
  title: string;
  onClick?: () => void;
}

export function WoodOrganizer({ icon, value, title, onClick }: WoodOrganizerProps) {
  return (
    <div
      className="wood-organizer"
      onClick={() => { soundManager.click(); onClick?.(); }}
      onMouseEnter={() => soundManager.hover()}
      title={title}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
    >
      <span className="icon">{icon}</span>
      <span>{value.toLocaleString('ru-RU')}</span>
    </div>
  );
}