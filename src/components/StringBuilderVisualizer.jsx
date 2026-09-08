
export default function StringBuilderVisualizer({ name, data }) {
  return (
    <div>
      <div className="arr-name">{name} (StringBuilder)</div>
      <div className="sb-val">"{data?.value ?? ''}"</div>
    </div>
  );
}
