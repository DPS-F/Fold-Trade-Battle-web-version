import { Overlay } from '../ui/Overlay';
import { useGameStore } from '../../state/gameStore';
import { soundManager } from '../../audio/soundManager';
import { useEffect } from 'react';

export function SettingsOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const settings = useGameStore(s => s.player.settings);
  const update = useGameStore(s => s.updateSettings);

  useEffect(() => {
    soundManager.setVolumes(settings.sfxVolume, settings.musicVolume);
  }, [settings.sfxVolume, settings.musicVolume]);

  return (
    <Overlay open={open} title="Настройки" onClose={onClose}>
      <div style={{ display: 'grid', gap: 20 }}>
        <Slider label={`Громкость музыки: ${Math.round(settings.musicVolume * 100)}%`} value={settings.musicVolume} onChange={(v) => update({ musicVolume: v })} />
        <Slider label={`Громкость звуков: ${Math.round(settings.sfxVolume * 100)}%`} value={settings.sfxVolume} onChange={(v) => update({ sfxVolume: v })} />
        <Slider label={`Масштаб интерфейса: ${Math.round(settings.uiScale * 100)}%`} min={0.8} max={1.3} step={0.05} value={settings.uiScale} onChange={(v) => update({ uiScale: v })} />

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={settings.animations}
            onChange={(e) => update({ animations: e.target.checked })}
          />
          <span style={{ fontFamily: 'var(--font-typewriter)', fontSize: 13 }}>Включить анимации</span>
        </label>
      </div>
    </Overlay>
  );
}

function Slider({ label, value, onChange, min = 0, max = 1, step = 0.01 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--burned)' }}
      />
    </div>
  );
}