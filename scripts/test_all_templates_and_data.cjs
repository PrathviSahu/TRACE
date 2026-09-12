const { runJava } = require("../src/engine/interpreter.js");
const { PRESET_SOLUTIONS } = require("../src/data/problemTemplates.js");
const { PROBLEM_SOLUTIONS } = require("../src/data/problemSolutions.js");
const { PROBLEM_DESCRIPTIONS } = require("../src/data/problemDescriptions.js");
const { CURATED_PROBLEM_PATTERNS } = require("../src/data/patternMapping.js");
const { ROADMAP_PROBLEMS } = require("../src/data/roadmapProblems.js");

console.log("=== Comprehensive TRACE Data Verification ===");
console.log(`Total Templates: ${Object.keys(PRESET_SOLUTIONS).length}`);
console.log(`Total Multi-Approach Solutions: ${Object.keys(PROBLEM_SOLUTIONS).length}`);
console.log(`Total Problem Descriptions: ${Object.keys(PROBLEM_DESCRIPTIONS).length}`);

// 1. Test every template with runJava
console.log("\n--- Testing All Templates in TRACE Interpreter ---");
let tmplPassed = 0;
let tmplFailed = 0;

for (const [id, tmpl] of Object.entries(PRESET_SOLUTIONS)) {
  try {
    const res = runJava(tmpl.code, tmpl.inputs || {});
    if (res.error) {
      console.log(`❌ LC #${id} (${tmpl.name}): ERROR: ${res.error}`);
      tmplFailed++;
    } else {
      tmplPassed++;
    }
  } catch (err) {
    console.log(`❌ LC #${id} (${tmpl.name}): EXCEPTION: ${err.message}`);
    tmplFailed++;
  }
}
console.log(`Templates Result: ${tmplPassed} PASSED, ${tmplFailed} FAILED out of ${Object.keys(PRESET_SOLUTIONS).length}`);

// 2. Validate Multi-Approach Solutions
console.log("\n--- Validating Multi-Approach Solutions ---");
let solValid = 0;
let solInvalid = 0;

for (const [id, sol] of Object.entries(PROBLEM_SOLUTIONS)) {
  if (!sol.approaches || !Array.isArray(sol.approaches) || sol.approaches.length !== 3) {
    console.log(`❌ LC #${id}: approaches count is ${sol.approaches ? sol.approaches.length : 0} (expected 3)`);
    solInvalid++;
    continue;
  }
  let ok = true;
  for (const app of sol.approaches) {
    if (!app.name || !app.label || !app.idea || !app.complexity || !app.code) {
      console.log(`❌ LC #${id}: missing required fields in approach '${app.name}'`);
      ok = false;
      break;
    }
  }
  if (ok) solValid++;
  else solInvalid++;
}
console.log(`Solutions Result: ${solValid} VALID, ${solInvalid} INVALID out of ${Object.keys(PROBLEM_SOLUTIONS).length}`);

// 3. Validate Descriptions
console.log("\n--- Validating Problem Descriptions ---");
let descValid = 0;
let descInvalid = 0;

for (const [id, desc] of Object.entries(PROBLEM_DESCRIPTIONS)) {
  if (!desc.title || !desc.difficulty || !desc.category || !desc.description || !desc.examples || !desc.constraints) {
    console.log(`❌ LC #${id}: missing required fields in description`);
    descInvalid++;
  } else {
    descValid++;
  }
}
console.log(`Descriptions Result: ${descValid} VALID, ${descInvalid} INVALID out of ${Object.keys(PROBLEM_DESCRIPTIONS).length}`);

// Overall status
if (tmplFailed === 0 && solInvalid === 0 && descInvalid === 0) {
  console.log("\n🎉 ALL TESTS PASSED PERFECTLY!");
  process.exit(0);
} else {
  console.log("\n⚠️ SOME CHECKS FAILED!");
  process.exit(1);
}
