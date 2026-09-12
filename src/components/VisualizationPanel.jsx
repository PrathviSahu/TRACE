import MatrixVisualizer from './MatrixVisualizer.jsx';

import { useTraceStore } from '../store/traceStore.js';
import ArrayVisualizer from './ArrayVisualizer.jsx';
import StackVisualizer from './StackVisualizer.jsx';
import QueueVisualizer from './QueueVisualizer.jsx';
import HashMapVisualizer from './HashMapVisualizer.jsx';
import HashSetVisualizer from './HashSetVisualizer.jsx';
import StringBuilderVisualizer from './StringBuilderVisualizer.jsx';
import VariablesPanel from './VariablesPanel.jsx';
import CallStack from './CallStack.jsx';
import ExplanationPanel from './ExplanationPanel.jsx';
import OutputPanel from './OutputPanel.jsx';

export default function VisualizationPanel() {
  const trace       = useTraceStore(s => s.trace);
  const currentStep = useTraceStore(s => s.currentStep);
  const status      = useTraceStore(s => s.status);
  const error       = useTraceStore(s => s.error);

  const step     = trace[currentStep];
  const prevStep = trace[currentStep - 1];

  const arrays      = step?.arrays ?? {};
  const collections = step?.collections ?? {};
  const prevArrays  = prevStep?.arrays ?? {};

  const hasArrays = Object.keys(arrays).length > 0;
  const hasCols   = Object.keys(collections).length > 0;

  if (status === 'idle') return (
    <div className="right-panels">
      <div className="panel-empty" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:'var(--txt3)'}}>
        Paste Java code and click Run to start visualizing
      </div>
    </div>
  );

  if (status === 'running') return (
    <div className="right-panels">
      <div className="panel-empty" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
        <div className="spinner" />
        <span>Executing…</span>
      </div>
    </div>
  );

  if (status === 'error') return (
    <div className="right-panels">
      <div className="error-box">
        <strong>Execution Error</strong>
        <code>{error}</code>
      </div>
    </div>
  );

  return (
    <div className="right-panels">
      <div className="viz-top">
        {/* Arrays */}
        {hasArrays && Object.entries(arrays).map(([name, info]) => {
          const is2D = Array.isArray(info.values) && info.values.length > 0 && Array.isArray(info.values[0]);
          if (is2D) {
            return (
              <MatrixVisualizer
                key={name}
                name={name}
                matrix={info.values}
                variables={step?.variables}
                pointers={info.pointers ?? {}}
              />
            );
          }
          return (
            <ArrayVisualizer
              key={name}
              name={name}
              values={info.values}
              pointers={info.pointers ?? {}}
              prevValues={prevArrays[name]?.values}
            />
          );
        })}

        {/* Collections */}
        {hasCols && Object.entries(collections).map(([name, data]) => {
          if (!data?.__type) return null;
          switch(data.__type) {
            case 'Stack':        return <StackVisualizer key={name} name={name} data={data} />;
            case 'Queue':        return <QueueVisualizer key={name} name={name} data={data} />;
            case 'HashMap':      return <HashMapVisualizer key={name} name={name} data={data} />;
            case 'HashSet':      return <HashSetVisualizer key={name} name={name} data={data} />;
            case 'StringBuilder': return <StringBuilderVisualizer key={name} name={name} data={data} />;
            case 'ArrayList':    return (
              <ArrayVisualizer key={name} name={`${name} (ArrayList)`} values={data.items ?? []} pointers={{}} />
            );
            default: return null;
          }
        })}

        {/* Variables */}
        <div>
          <div className="ph" style={{borderRadius:'5px 5px 0 0'}}>
            <span className="ph-title">Variables</span>
          </div>
          <VariablesPanel />
        </div>

        {/* Call Stack */}
        <div>
          <div className="ph" style={{borderRadius:'5px 5px 0 0'}}>
            <span className="ph-title">Call Stack</span>
          </div>
          <CallStack />
        </div>
      </div>

      <div className="viz-bottom">
        <div className="ph"><span className="ph-title">What Just Happened?</span></div>
        <ExplanationPanel />
        <div className="ph" style={{borderTop:'1px solid var(--border)'}}><span className="ph-title">Output</span></div>
        <OutputPanel />
      </div>
    </div>
  );
}
