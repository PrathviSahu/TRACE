import React, { useMemo } from 'react';

/**
 * 2D Grid / Matrix Visualizer
 * Beautifully renders 2D arrays, DP tables, and grid graphs.
 * Supports row/col headers, coordinate pointer highlighting (i, j, r, c),
 * and dynamic heatmap shading.
 */
export default function MatrixVisualizer({ name, matrix, variables = {}, pointers = {} }) {
  if (!matrix || !Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    return null;
  }

  const numRows = matrix.length;
  const numCols = matrix[0].length;

  // Detect active coordinates from variables or pointers
  const activeCoord = useMemo(() => {
    // Check direct pointer tuples first e.g. pointers[name] = [r, c]
    if (pointers && pointers[name] && Array.isArray(pointers[name])) {
      return { r: pointers[name][0], c: pointers[name][1] };
    }

    // Check variable pairs: (r, c), (row, col), (i, j), (x, y)
    const getVal = (k) => {
      const v = variables[k];
      if (v === undefined || v === null) return undefined;
      const val = typeof v === 'object' && 'value' in v ? v.value : v;
      return typeof val === 'number' ? val : undefined;
    };

    const r1 = getVal('r') ?? getVal('row');
    const c1 = getVal('c') ?? getVal('col');
    if (r1 !== undefined && c1 !== undefined && r1 >= 0 && r1 < numRows && c1 >= 0 && c1 < numCols) {
      return { r: r1, c: c1, labels: ['(r, c)'] };
    }

    const iVal = getVal('i');
    const jVal = getVal('j');
    if (iVal !== undefined && jVal !== undefined && iVal >= 0 && iVal < numRows && jVal >= 0 && jVal < numCols) {
      return { r: iVal, c: jVal, labels: ['(i, j)'] };
    }

    return null;
  }, [variables, pointers, name, numRows, numCols]);

  // Determine min and max numerical values for heatmap normalization
  const { minVal, maxVal, isNumeric } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let numCount = 0;
    let total = 0;

    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        total++;
        const val = matrix[r][c];
        if (typeof val === 'number' && !isNaN(val)) {
          numCount++;
          if (val < min) min = val;
          if (val > max) max = val;
        }
      }
    }

    const numeric = numCount > total * 0.7 && max > min;
    return { minVal: min, maxVal: max, isNumeric: numeric };
  }, [matrix, numRows, numCols]);

  // Compute heatmap style for cell
  const getCellBg = (val, isActive) => {
    if (isActive) {
      return 'rgba(56, 217, 197, 0.28)'; // Cyan highlight
    }
    if (typeof val === 'boolean') {
      return val ? 'rgba(74, 222, 128, 0.18)' : 'rgba(239, 68, 68, 0.12)';
    }
    if (val === '1' || val === 1) {
      return 'rgba(99, 102, 241, 0.18)'; // Matrix island or connection
    }
    if (val === '0' || val === 0) {
      return 'rgba(255, 255, 255, 0.02)';
    }
    if (isNumeric && typeof val === 'number') {
      const ratio = (val - minVal) / (maxVal - minVal);
      // Heatmap gradient from subtle dark blue to rich emerald
      return `rgba(99, 102, 241, ${0.08 + ratio * 0.45})`;
    }
    return 'rgba(255, 255, 255, 0.04)';
  };

  return (
    <div className="matrix-visualizer-card" style={{
      marginBottom: 20,
      background: 'var(--bg-card, #161b22)',
      border: '1px solid var(--border-subtle, #21262d)',
      borderRadius: 8,
      padding: '12px 16px',
      overflowX: 'auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        fontSize: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600, color: 'var(--txt-bright, #f0f6fc)' }}>{name}</span>
          <span style={{
            fontSize: 10,
            padding: '2px 6px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
            borderRadius: 4,
            fontWeight: 600,
            fontFamily: 'var(--font-mono, monospace)'
          }}>
            2D Matrix ({numRows} × {numCols})
          </span>
        </div>

        {activeCoord && (
          <div style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono, monospace)',
            color: 'var(--accent-cyan, #38d9c5)',
            background: 'rgba(56, 217, 197, 0.12)',
            padding: '2px 8px',
            borderRadius: 4,
            border: '1px solid rgba(56, 217, 197, 0.3)'
          }}>
            Active Cell: [{activeCoord.r}][{activeCoord.c}] = <b>{String(matrix[activeCoord.r]?.[activeCoord.c])}</b>
          </div>
        )}
      </div>

      {/* Grid Container */}
      <div style={{ display: 'inline-block', minWidth: '100%' }}>
        <table style={{
          borderCollapse: 'separate',
          borderSpacing: 4,
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 11.5,
          userSelect: 'none',
          margin: '0 auto'
        }}>
          <thead>
            <tr>
              <th style={{ color: 'var(--txt-dim, #6e7681)', padding: '4px 6px', fontSize: 10 }}>r \ c</th>
              {Array.from({ length: numCols }, (_, c) => (
                <th
                  key={c}
                  style={{
                    color: activeCoord?.c === c ? 'var(--accent-cyan, #38d9c5)' : 'var(--txt-dim, #6e7681)',
                    padding: '4px 8px',
                    fontSize: 10,
                    fontWeight: activeCoord?.c === c ? 700 : 500
                  }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, r) => (
              <tr key={r}>
                <td style={{
                  color: activeCoord?.r === r ? 'var(--accent-cyan, #38d9c5)' : 'var(--txt-dim, #6e7681)',
                  fontWeight: activeCoord?.r === r ? 700 : 500,
                  fontSize: 10,
                  textAlign: 'center',
                  paddingRight: 6
                }}>
                  {r}
                </td>
                {row.map((cellVal, c) => {
                  const isActive = activeCoord?.r === r && activeCoord?.c === c;
                  const bg = getCellBg(cellVal, isActive);

                  return (
                    <td
                      key={c}
                      style={{
                        minWidth: 38,
                        height: 32,
                        textAlign: 'center',
                        background: bg,
                        color: isActive ? 'var(--accent-cyan, #38d9c5)' : 'var(--txt-bright, #f0f6fc)',
                        fontWeight: isActive ? 700 : 500,
                        border: isActive
                          ? '1.5px solid var(--accent-cyan, #38d9c5)'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 4,
                        boxShadow: isActive ? '0 0 10px rgba(56, 217, 197, 0.4)' : 'none',
                        transition: 'all 0.2s ease',
                        cursor: 'default'
                      }}
                      title={`[${r}][${c}] = ${cellVal}`}
                    >
                      {cellVal === true ? 'T' : cellVal === false ? 'F' : String(cellVal ?? '')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
