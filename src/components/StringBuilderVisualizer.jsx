
export default function StringBuilderVisualizer({ name, data }) {
  return (
    <div>
      <div className="arr-name">{name} (StringBuilder)</div>
      <div className="sb-val">"{typeof data?.value === "object" ? JSON.stringify(data.value) : String(data?.value ?? "")}"</div>
    </div>
  );
}
