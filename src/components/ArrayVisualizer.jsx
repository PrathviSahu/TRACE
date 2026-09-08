
import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export default function ArrayVisualizer({ name, values, pointers = {}, prevValues = null }) {
  const ptrRefs = useRef({});

  // GSAP animate pointer movement
  useGSAP(() => {
    for (const [varName, idx] of Object.entries(pointers)) {
      const el = ptrRefs.current[varName];
      if (!el) continue;
      const targetLeft = idx * 46;
      gsap.to(el, { x: targetLeft, duration: 0.35, ease: 'power2.out', overwrite: true });
    }
  }, { dependencies: [JSON.stringify(pointers)] });

  if (!values || values.length === 0) return null;
  const shown = values.slice(0, 50);

  return (
    <div className="arr-section">
      <div className="arr-name">{name}</div>
      <div className="arr-indices">
        {shown.map((_, i) => <div key={i} className="arr-idx">{i}</div>)}
      </div>
      <div className="arr-cells">
        {shown.map((v, i) => {
          const changed = prevValues && prevValues[i] !== v;
          const isPtr   = Object.values(pointers).includes(i);
          return (
            <div key={i} className={`arr-cell ${isPtr ? 'hl' : ''} ${changed ? 'mod' : ''}`}>
              {String(v ?? '')}
            </div>
          );
        })}
      </div>
      {Object.keys(pointers).length > 0 && (
        <div className="arr-ptrs" style={{ position:'relative', height:28 }}>
          {Object.entries(pointers).map(([varName, idx]) => (
            <div
              key={varName}
              ref={el => ptrRefs.current[varName] = el}
              className="arr-ptr"
              style={{ position:'absolute', left: 0, top: 0, width: 44 }}
            >
              <span className="ptr-arrow">▲</span>
              <span className="ptr-label">{varName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
