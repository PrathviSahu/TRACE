
export default function StackVisualizer({ name, data }) {
  const items = data?.items ?? [];
  if (items.length === 0) return (
    <div>
      <div className="arr-name">{name} (Stack) — empty</div>
    </div>
  );
  return (
    <div>
      <div className="arr-name">{name} (Stack)</div>
      <div className="stack-wrap">
        {[...items].reverse().map((v, i) => (
          <div key={i} className="stack-cell">
            <span>{String(v)}</span>
            {i === 0 && <span className="top-badge">← top</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
