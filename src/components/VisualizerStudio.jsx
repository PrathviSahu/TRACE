import { useTraceStore } from '../store/traceStore.js';

export default function VisualizerStudio() {
  const {
    viewMode,
    setViewMode,
    trace,
    currentStep,
    next,
    prev,
    play,
    isPlaying,
    goToStep
  } = useTraceStore();

  const totalSteps = trace ? trace.length : 0;
  const currentStepNum = totalSteps > 0 ? currentStep + 1 : 0;
  const stepData = trace && trace[currentStep] ? trace[currentStep] : null;

  // Extract array data
  const arrayData = stepData?.dataStructures?.array || {
    name: 'nums',
    values: [2, 7, 11, 15],
    pointers: [{ name: 'i', index: 0 }]
  };

  // Extract hashmap data
  const mapData = stepData?.dataStructures?.hashmap || {
    name: 'map',
    entries: [{ key: '2', value: 0 }]
  };

  // Extract explanation data
  const explanation = stepData?.explanation || {
    lineText: 'Line 5: for i in range(len(nums))',
    summary: 'We start the loop with i = 0 to iterate through the array.',
    bullets: [
      'len(nums) = 4',
      'range(4) → 0, 1, 2, 3',
      'Current value: nums[0] = 2'
    ],
    why: 'We use a loop to check each number and find its complement.'
  };

  return (
    <div className="viz-studio-card">
      {/* ── Top View Mode Tabs ────────────────────────────────── */}
      <div className="viz-tabs-row">
        <button
          className={`viz-tab-btn ${viewMode === 'visualization' ? 'active' : ''}`}
          onClick={() => setViewMode('visualization')}
        >
          Visualization
        </button>
        <button
          className={`viz-tab-btn ${viewMode === 'dry-run' ? 'active' : ''}`}
          onClick={() => setViewMode('dry-run')}
        >
          Dry Run
        </button>
        <button
          className={`viz-tab-btn ${viewMode === 'code-flow' ? 'active' : ''}`}
          onClick={() => setViewMode('code-flow')}
        >
          Code Flow
        </button>
      </div>

      {/* ── Execution Controls Bar ────────────────────────────── */}
      <div className="viz-controls-row">
        <div className="step-counter-badge">
          Step {currentStepNum} of {totalSteps || 8}
        </div>

        <div className="playback-btns">
          <button
            className="ctrl-icon-btn"
            onClick={prev}
            disabled={currentStep <= 0}
            title="Previous step"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="11 19 2 12 11 5 11 19" />
              <polygon points="22 19 13 12 22 5 22 19" />
            </svg>
          </button>

          <button
            className="play-pause-btn"
            onClick={play}
            title={isPlaying ? 'Pause execution' : 'Play execution'}
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          <button
            className="ctrl-icon-btn"
            onClick={next}
            disabled={totalSteps === 0 || currentStep >= totalSteps - 1}
            title="Next step"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="13 19 22 12 13 5 13 19" />
              <polygon points="2 19 11 12 2 5 2 19" />
            </svg>
          </button>
        </div>

        <div className="timeline-slider-box">
          <input
            type="range"
            min="0"
            max={Math.max(0, totalSteps - 1)}
            value={currentStep}
            onChange={(e) => goToStep(Number(e.target.value))}
            className="timeline-range-input"
          />
        </div>
      </div>

      {/* ── Main Visualization Body (Split Canvas) ────────────── */}
      <div className="viz-body-split">
        {/* Left Canvas: Data Structures */}
        <div className="ds-canvas">
          {/* Array Visualizer */}
          <div className="ds-block">
            <div className="ds-title">Array: {arrayData.name}</div>
            <div className="array-boxes-wrap">
              <div className="array-indices-row">
                {arrayData.values.map((_, idx) => (
                  <div key={idx} className="array-idx-cell">{idx}</div>
                ))}
              </div>
              <div className="array-cells-row">
                {arrayData.values.map((val, idx) => {
                  const hasPointer = arrayData.pointers?.some(p => p.index === idx);
                  return (
                    <div
                      key={idx}
                      className={`array-val-cell ${hasPointer ? 'active-cell' : ''}`}
                    >
                      {val}
                    </div>
                  );
                })}
              </div>
              {/* Pointer Arrows */}
              <div className="array-pointers-row">
                {arrayData.values.map((_, idx) => {
                  const pt = arrayData.pointers?.find(p => p.index === idx);
                  return (
                    <div key={idx} className="pointer-slot">
                      {pt && (
                        <div className="pointer-arrow-wrap">
                          <span className="pointer-arrow">↑</span>
                          <span className="pointer-label">{pt.name} = {pt.index}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* HashMap Visualizer */}
          <div className="ds-block" style={{ marginTop: 24 }}>
            <div className="ds-title">HashMap: {mapData.name}</div>
            <div className="hashmap-table-wrap">
              <div className="hashmap-hd-row">
                <div className="hashmap-th">Key</div>
                <div className="hashmap-th">Value</div>
              </div>
              {mapData.entries && mapData.entries.length > 0 ? (
                mapData.entries.map((ent, idx) => (
                  <div key={idx} className="hashmap-row">
                    <div className="hashmap-td key-td">{ent.key}</div>
                    <div className="hashmap-td val-td">{ent.value}</div>
                  </div>
                ))
              ) : (
                <div className="hashmap-row empty-map-row">
                  <div className="hashmap-td key-td" style={{ opacity: 0.5 }}>—</div>
                  <div className="hashmap-td val-td" style={{ opacity: 0.5 }}>—</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Canvas: Current Step Explanation Card */}
        <div className="step-explanation-card">
          <div className="step-expl-title">Current Step</div>
          <div className="step-expl-line">{explanation.lineText}</div>
          <div className="step-expl-summary">{explanation.summary}</div>

          <div className="step-expl-section">
            <div className="step-section-heading">What's Happening?</div>
            <ul className="step-bullets-list">
              {(explanation.bullets || []).map((b, idx) => (
                <li key={idx}>{b}</li>
              ))}
            </ul>
          </div>

          <div className="why-callout-box">
            <div className="why-title">
              <span>💡</span> Why?
            </div>
            <div className="why-text">{explanation.why}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
