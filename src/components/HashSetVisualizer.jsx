
export default function HashSetVisualizer({ name, data }) {
  const items = [...(data?.items ?? new Set())];
  return (
    <div>
      <div className="arr-name">{name} ({data?.name ?? 'HashSet'})</div>
      <div className="hs-chips">
        {items.length === 0 ? <span style={{fontSize:11,color:'var(--txt3)'}}>empty</span>
          : items.map((v, i) => <span key={i} className="hs-chip">{String(v)}</span>)}
      </div>
    </div>
  );
}
