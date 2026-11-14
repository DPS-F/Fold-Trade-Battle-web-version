export function BinderClip() {
  return (
    <div className="binder-clip">
      <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="clipMetal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8c8c8" />
            <stop offset="50%" stopColor="#8a8a8a" />
            <stop offset="100%" stopColor="#5a5a5a" />
          </linearGradient>
        </defs>
        {/* тень */}
        <ellipse cx="50" cy="74" rx="42" ry="5" fill="rgba(0,0,0,0.3)" />
        {/* основа */}
        <rect x="10" y="20" width="80" height="46" rx="4" fill="url(#clipMetal)" stroke="#3a3a3a" strokeWidth="1.5" />
        {/* ручки */}
        <path d="M 18 20 Q 18 4 34 4 L 34 20" fill="none" stroke="#7a7a7a" strokeWidth="4" strokeLinecap="round" />
        <path d="M 82 20 Q 82 4 66 4 L 66 20" fill="none" stroke="#7a7a7a" strokeWidth="4" strokeLinecap="round" />
        {/* блик */}
        <rect x="14" y="24" width="72" height="6" rx="2" fill="rgba(255,255,255,0.35)" />
      </svg>
    </div>
  );
}