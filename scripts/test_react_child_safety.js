import assert from "node:assert";
import { runJava } from "../src/engine/interpreter.js";
import { normalizeStepData } from "../src/utils/visualizerAdapter.js";
import { PRESET_SOLUTIONS } from "../src/data/problemTemplates.js";
import { MULTI_LANG_EXAMPLES } from "../src/engine/multiLangExamples.js";

console.log("=== RUNNING REACT CHILD SAFETY & SNAPSHOT UNWRAPPING AUDIT ===");

// 1. Audit all 44 predefined problem solutions
const problems = [
  ...Object.entries(PRESET_SOLUTIONS).map(([id, p]) => ({ id, name: p.name, code: p.code, inputs: p.inputs || {} })),
  ...Object.entries(MULTI_LANG_EXAMPLES).filter(([_, e]) => e.java).map(([id, e]) => ({ id, name: e.name, code: e.java, inputs: e.inputs?.javaInputs || {} }))
];

let totalStepsAudited = 0;

for (const prob of problems) {
  const { trace } = runJava(prob.code, prob.inputs);
  assert.ok(Array.isArray(trace) && trace.length > 0, `Problem ${prob.name} must produce trace`);

  let prev = null;
  for (let s = 0; s < trace.length; s++) {
    const step = trace[s];
    totalStepsAudited++;
    const norm = normalizeStepData(step, prev);

    // Verify all array pointers are numbers or resolved
    for (const arr of norm.arrays) {
      for (const p of arr.pointers) {
        assert.strictEqual(typeof p.index, "number", `Pointer index in ${arr.name} at step ${s} must be number`);
        assert.ok(!isNaN(p.index), `Pointer index in ${arr.name} at step ${s} must not be NaN`);
      }
    }

    // Verify explanation fields
    if (norm.explanation) {
      assert.strictEqual(typeof norm.explanation.lineText, "string");
      assert.strictEqual(typeof norm.explanation.summary, "string");
      assert.strictEqual(typeof norm.explanation.why, "string");
      for (const b of norm.explanation.bullets) {
        assert.strictEqual(typeof b, "string");
      }
    }

    prev = step;
  }
}

console.log(`✓ Audited ${problems.length} problems across ${totalStepsAudited} steps without any data model defects.`);
console.log("=== ALL REACT CHILD SAFETY TESTS PASSED! ===");
