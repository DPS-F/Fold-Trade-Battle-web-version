import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { BoatModelData, FoldStep } from '../../data/foldData';
import { soundManager } from '../../audio/soundManager';

interface Props {
  boat: BoatModelData;
  onComplete: () => void;
  onFail: () => void;
}

export function OrigamiViewer({ boat, onComplete, onFail }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [message, setMessage] = useState('');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const paperRef = useRef<THREE.Mesh | null>(null);
  const originalVertices = useRef<Float32Array | null>(null);
  const dragStartRef = useRef<{x: number, y: number} | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#2a1f1a');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0xffeedd, 0.4);
    backLight.position.set(-5, -5, -5);
    scene.add(backLight);

    const tableGeo = new THREE.PlaneGeometry(30, 30);
    const tableMat = new THREE.MeshStandardMaterial({ color: '#5a3d2b', roughness: 1 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.rotation.x = -Math.PI / 2;
    table.position.y = -1.5;
    table.receiveShadow = true;
    scene.add(table);

    const segments = 32;
    const geometry = new THREE.PlaneGeometry(boat.size[0], boat.size[1], segments, segments);
    
    // ФИКС TS ОШИБКИ:
    originalVertices.current = new Float32Array(geometry.attributes.position.array);

    const material = new THREE.MeshStandardMaterial({
      color: 0xfaf3e0,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });

    const paper = new THREE.Mesh(geometry, material);
    paper.castShadow = true;
    paper.receiveShadow = true;
    
    const edges = new THREE.EdgesGeometry(geometry, 15);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xccbbaa, transparent: true, opacity: 0.15 }));
    paper.add(line);

    scene.add(paper);
    paperRef.current = paper;

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      if (mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [boat]);

  const applyFold = (step: FoldStep, progress: number) => {
    if (!paperRef.current || !originalVertices.current) return;
    const geo = paperRef.current.geometry;
    const positions = geo.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length; i++) positions[i] = originalVertices.current[i];

    for (let i = 0; i < currentStepIndex; i++) {
        rotateVertices(positions, boat.steps[i], 1);
    }
    if (progress > 0) {
        rotateVertices(positions, step, progress);
    }

    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();

    // --- АВТОЦЕНТРИРОВАНИЕ ---
    // Считаем новый центр масс и сдвигаем сам объект, чтобы он оставался в центре экрана
    geo.computeBoundingBox();
    if (geo.boundingBox) {
       const center = new THREE.Vector3();
       geo.boundingBox.getCenter(center);
       paperRef.current.position.set(-center.x, -center.y, 0);
    }
  };

  const rotateVertices = (positions: Float32Array, step: FoldStep, progress: number) => {
    const A = new THREE.Vector3(...step.lineStart);
    const B = new THREE.Vector3(...step.lineEnd);
    const axis = new THREE.Vector3().subVectors(B, A).normalize();
    
    const angle = step.targetAngle * progress;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const cosAInv = 1 - cosA;

    const normal = new THREE.Vector3(-axis.y, axis.x, 0).normalize();

    for (let i = 0; i < positions.length; i += 3) {
      const P = new THREE.Vector3(positions[i], positions[i+1], positions[i+2]);
      const AP = new THREE.Vector3().subVectors(P, A);
      const dot = AP.dot(normal);
      
      if (dot * step.movingSide > 0) {
        const cross = new THREE.Vector3().crossVectors(axis, AP);
        const dotAxis = axis.dot(AP);

        const newP = new THREE.Vector3()
          .addScaledVector(AP, cosA)
          .addScaledVector(cross, sinA)
          .addScaledVector(axis, dotAxis * cosAInv)
          .add(A);

        positions[i] = newP.x;
        positions[i+1] = newP.y;
        positions[i+2] = newP.z;
      }
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (currentStepIndex >= boat.steps.length) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setMessage('');
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current || currentStepIndex >= boat.steps.length) return;

    const step = boat.steps[currentStepIndex];
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const distance = Math.sqrt(dx*dx + dy*dy);

    if (distance < 15) return;

    const dragVec = new THREE.Vector2(dx, dy).normalize();
    const targetDir = new THREE.Vector2(step.dragDirection[0], step.dragDirection[1]).normalize();
    
    const dot = dragVec.dot(targetDir);

    if (dot > 0.5) {
      const progress = Math.min(1, distance / 250);
      setDragProgress(progress);
      applyFold(step, progress);
    } else if (dot < -0.5) {
      setMessage('Не туда! Тяните в указанном направлении.');
      setDragProgress(0);
      applyFold(step, 0);
    }
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const step = boat.steps[currentStepIndex];

    if (dragProgress > 0.7) {
      soundManager.stamp();
      applyFold(step, 1);
      setTimeout(() => {
        if (currentStepIndex + 1 < boat.steps.length) {
          setCurrentStepIndex(prev => prev + 1);
          setDragProgress(0);
        } else {
          soundManager.win();
          onComplete();
        }
      }, 300);
    } else {
      applyFold(step, 0);
      setDragProgress(0);
      
      if (dragStartRef.current) {
         handleError('Движение было слишком слабым или неверным.');
      }
    }
    dragStartRef.current = null;
  };

  const handleError = (msg: string) => {
    const newErrors = errors + 1;
    setErrors(newErrors);
    setMessage(msg);
    soundManager.crumple();
    
    if (newErrors >= 3) {
      soundManager.lose();
      onFail();
    } else {
      if (paperRef.current) {
        paperRef.current.position.x = 0.3;
        setTimeout(() => { if (paperRef.current) paperRef.current.position.x = -0.3; }, 50);
        setTimeout(() => { if (paperRef.current) paperRef.current.position.x = 0; }, 100);
      }
    }
  };

  return (
    <div 
      style={{ position: 'relative', width: '100%', height: '65vh', touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab', borderRadius: 8, overflow: 'hidden' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', background: 'rgba(250, 243, 224, 0.95)', padding: '12px 24px', borderRadius: 8, boxShadow: '0 4px 15px rgba(0,0,0,0.4)', width: '90%', maxWidth: 500 }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-typewriter)', color: 'var(--burned)' }}>
          Шаг {currentStepIndex + 1} из {boat.steps.length}
        </h3>
        <p style={{ margin: '5px 0 0', fontSize: 14, minHeight: 20 }}>
          {message || boat.steps[currentStepIndex]?.instruction || 'Готово!'}
        </p>
      </div>

      <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(250, 243, 224, 0.95)', padding: '12px 24px', borderRadius: 8, boxShadow: '0 4px 15px rgba(0,0,0,0.4)', width: '90%', maxWidth: 400 }}>
        <div style={{ width: '100%', height: 8, background: '#ddd', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${dragProgress * 100}%`, background: 'var(--accent-blue)', transition: 'width 0.1s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--accent-burgundy)', fontWeight: 'bold' }}>Ошибки: {errors} / 3</span>
          <span style={{ fontSize: 12, color: 'var(--accent-blue)' }}>Зажмите и тяните</span>
        </div>
      </div>
    </div>
  );
}