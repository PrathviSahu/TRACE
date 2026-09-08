
export default function HashMapVisualizer({ name, data }) {
  const entries = [...(data?.entries ?? new Map())];
  return (
    <div>
      <div className="arr-name">{name} ({data?.name ?? 'HashMap'})</div>
      {entries.length === 0 ? <div style={{fontSize:11,color:'var(--txt3)'}}>empty</div> : (
        <table className="hm-table">
          <thead><tr><th>Key</th><th></th><th>Value</th></tr></thead>
          <tbody>
            {entries.map(([k, v], i) => (
              <tr key={i}>
                <td className="hm-key">{String(k)}</td>
                <td className="hm-arrow">→</td>
                <td>{String(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
