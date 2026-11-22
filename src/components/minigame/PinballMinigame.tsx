import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { soundManager } from '../../audio/soundManager';

export function PinballMinigame() {
  const ballRef = useRef<HTMLDivElement>(null);
  const holeRef = useRef<HTMLDivElement>(null);
  
  const pos = useRef({ x: 100, y: 100 });
  const vel = useRef({ x: 0, y: 0 });
  const mouse = useRef({ x: -1000, y: -1000 });
  const holePos = useRef({ x: 200, y: 200 });
  
  const [ballColor, setBallColor] = useState('#ff7700');
  const registerPinballPocket = useGameStore(s => s.registerPinballPocket);

  const resetBall = () => {
     // Спавн в случайных углах экрана (вне поля)
     const corners = [
       { x: 80, y: 80 },
       { x: window.innerWidth - 80, y: 80 },
       { x: 80, y: window.innerHeight - 80 },
       { x: window.innerWidth - 80, y: window.innerHeight - 80 }
     ];
     const c = corners[Math.floor(Math.random() * corners.length)];
     pos.current = { ...c };
     vel.current = { x: 0, y: 0 };
     
     // Красивый случайный цвет
     const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#f368e0', '#ff9f43'];
     setBallColor(colors[Math.floor(Math.random() * colors.length)]);
  };
  
  const resetHole = () => {
      // Спавн лунки в случайном месте вне центрального поля
      let hx, hy;
      do {
          hx = Math.random() * (window.innerWidth - 100) + 50;
          hy = Math.random() * (window.innerHeight - 100) + 50;
      } while (hx > window.innerWidth/2 - 300 && hx < window.innerWidth/2 + 300 && hy > window.innerHeight/2 - 300 && hy < window.innerHeight/2 + 300);

      holePos.current = { x: hx, y: hy };
      if (holeRef.current) {
          holeRef.current.style.left = `${hx}px`;
          holeRef.current.style.top = `${hy}px`;
      }
  };

  useEffect(() => {
    resetBall();
    resetHole();

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove);

    let animId: number;
    const loop = () => {
      // Физика движения
      pos.current.x += vel.current.x;
      pos.current.y += vel.current.y;
      
      // Трение
      vel.current.x *= 0.99;
      vel.current.y *= 0.99;

      // Отскок от краев экрана
      if (pos.current.x < 30) { pos.current.x = 30; vel.current.x *= -0.8; }
      if (pos.current.x > window.innerWidth - 30) { pos.current.x = window.innerWidth - 30; vel.current.x *= -0.8; }
      if (pos.current.y < 30) { pos.current.y = 30; vel.current.y *= -0.8; }
      if (pos.current.y > window.innerHeight - 30) { pos.current.y = window.innerHeight - 30; vel.current.y *= -0.8; }

      // Отскок от центрального поля (чтобы не мешать играть)
      const boardSize = 650;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const bl = cx - boardSize / 2;
      const br = cx + boardSize / 2;
      const bt = cy - boardSize / 2;
      const bb = cy + boardSize / 2;

      if (pos.current.x > bl - 20 && pos.current.x < br + 20 && pos.current.y > bt - 20 && pos.current.y < bb + 20) {
          const dLeft = Math.abs(pos.current.x - bl);
          const dRight = Math.abs(pos.current.x - br);
          const dTop = Math.abs(pos.current.y - bt);
          const dBottom = Math.abs(pos.current.y - bb);
          const minD = Math.min(dLeft, dRight, dTop, dBottom);
          
          if (minD === dLeft) { pos.current.x = bl - 21; vel.current.x = -Math.abs(vel.current.x); }
          else if (minD === dRight) { pos.current.x = br + 21; vel.current.x = Math.abs(vel.current.x); }
          else if (minD === dTop) { pos.current.y = bt - 21; vel.current.y = -Math.abs(vel.current.y); }
          else { pos.current.y = bb + 21; vel.current.y = Math.abs(vel.current.y); }
      }

      // Отталкивание от курсора (пинок)
      const dx = pos.current.x - mouse.current.x;
      const dy = pos.current.y - mouse.current.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100 && dist > 0) {
          const force = (100 - dist) / 100;
          vel.current.x += (dx / dist) * force * 2;
          vel.current.y += (dy / dist) * force * 2;
      }

      // Проверка попадания в лунку
      const hdx = pos.current.x - holePos.current.x;
      const hdy = pos.current.y - holePos.current.y;
      if (Math.sqrt(hdx*hdx + hdy*hdy) < 25) {
          soundManager.stamp();
          registerPinballPocket();
          resetBall();
          resetHole();
      }

      if (ballRef.current) {
        ballRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }
      
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [registerPinballPocket]);

  const handleClick = (e: React.MouseEvent) => {
     e.stopPropagation();
     // Случайный импульс при клике
     const angle = Math.random() * Math.PI * 2;
     const speed = 4 + Math.random() * 4;
     vel.current = {
         x: Math.cos(angle) * speed,
         y: Math.sin(angle) * speed
     };
     soundManager.click();
  };

  return (
    <>
      {/* Лунка */}
      <div 
        ref={holeRef}
        style={{
          position: 'fixed', width: 40, height: 40, borderRadius: '50%',
          background: 'radial-gradient(circle, #111 30%, #444 100%)',
          boxShadow: 'inset 0 6px 12px rgba(0,0,0,0.8), 0 0 15px rgba(0,0,0,0.5)',
          pointerEvents: 'none', zIndex: 100, transform: 'translate(-20px, -20px)'
        }}
      />
      {/* Шарик */}
      <div 
        ref={ballRef} 
        onClick={handleClick}
        style={{
          position: 'fixed', top: 0, left: 0, width: 26, height: 26,
          borderRadius: '50%', background: ballColor, zIndex: 101,
          boxShadow: `0 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(0,0,0,0.3), inset 4px 4px 10px rgba(255,255,255,0.6)`,
          cursor: 'pointer', transform: 'translate(-100px, -100px)'
        }}
      />
    </>
  );
}