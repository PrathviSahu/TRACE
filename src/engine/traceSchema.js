// ─────────────────────────────────────────────────────────────
//  TRACE — Formal Trace Step Schema & Contract Validator
//  Enforces the contract between the runtime execution engine
//  and downstream visualizers/adapters.
// ─────────────────────────────────────────────────────────────

export class TraceContractError extends Error {
  constructor(message, stepIndex, field = null) {
    super(`Trace Contract Violation at step ${stepIndex}${field ? ` (field "${field}")` : ""}: ${message}`);
    this.name = "TraceContractError";
    this.stepIndex = stepIndex;
    this.field = field;
  }
}

export function validateTraceStep(step, stepIndex = 0) {
  if (!step || typeof step !== "object") {
    throw new TraceContractError("Trace step must be a non-null object", stepIndex);
  }

  if (typeof step.step !== "number") {
    throw new TraceContractError("Missing or invalid 'step' (must be number)", stepIndex, "step");
  }

  if (typeof step.line !== "number") {
    throw new TraceContractError("Missing or invalid 'line' (must be number)", stepIndex, "line");
  }

  if (typeof step.type !== "string" || !step.type) {
    throw new TraceContractError("Missing or invalid 'type' (must be non-empty string)", stepIndex, "type");
  }

  if (!step.variables || typeof step.variables !== "object") {
    throw new TraceContractError("Missing or invalid 'variables' map", stepIndex, "variables");
  }

  if (!step.arrays || typeof step.arrays !== "object") {
    throw new TraceContractError("Missing or invalid 'arrays' map", stepIndex, "arrays");
  }

  if (!step.collections || typeof step.collections !== "object") {
    throw new TraceContractError("Missing or invalid 'collections' map", stepIndex, "collections");
  }

  if (!Array.isArray(step.callStack)) {
    throw new TraceContractError("Missing or invalid 'callStack' (must be array)", stepIndex, "callStack");
  }

  return true;
}

export function validateTrace(trace) {
  if (!Array.isArray(trace)) {
    throw new Error("Trace must be an array of steps");
  }
  for (let i = 0; i < trace.length; i++) {
    validateTraceStep(trace[i], i);
  }
  return true;
}
