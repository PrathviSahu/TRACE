
export default function QueueVisualizer({ name, data }) {
  const items = data?.items ?? [];
  return (
    <div>
      <div className="arr-name">{name} ({data?.name ?? 'Queue'})</div>
      <div className="queue-wrap">
        <span className="queue-lbl">front→</span>
        {items.length === 0 ? <span style={{color:'var(--txt3)',fontSize:12}}>empty</span> :
          items.map((v, i) => <div key={i} className="queue-cell">{String(v)}</div>)}
        <span className="queue-lbl">←rear</span>
      </div>
    </div>
  );
}
