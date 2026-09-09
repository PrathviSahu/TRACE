function parseInputString(text) {
  if (!text || typeof text !== "string") return {};
  const trimmed = text.trim();
  if (!trimmed) return {};
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch (_) {}
  }
  const result = {};
  const lines = trimmed.split(/\n|,\s*(?=[a-zA-Z_$][a-zA-Z0-9_$]*\s*[:=])/).map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    const match = line.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[:=]\s*(.+)$/);
    if (match) {
      const key = match[1];
      const rawVal = match[2].trim();
      try {
        result[key] = JSON.parse(rawVal);
      } catch (_) {
        if (/^-?\d+$/.test(rawVal)) result[key] = parseInt(rawVal, 10);
        else if (/^-?\d*\.\d+$/.test(rawVal)) result[key] = parseFloat(rawVal);
        else if (rawVal === "true") result[key] = true;
        else if (rawVal === "false") result[key] = false;
        else result[key] = rawVal.replace(/^["']|["']$/g, "");
      }
    }
  }
  return result;
}

import { validateTraceStep } from "./traceSchema.js";

// ─────────────────────────────────────────────────────────────
//  TRACE — Java Interpreter
//  Tree-walking interpreter that produces an execution trace
// ─────────────────────────────────────────────────────────────
import { parse } from './parser.js';

const MAX_STEPS     = 8000;
const MAX_DEPTH     = 200;
const MAX_ARRAY_VIZ = 50;

// ── Signal objects (thrown to unwind the call stack) ─────────
class ReturnSignal  { constructor(v){ this.value = v; } }
class BreakSignal   {}
class ContinueSignal{}

// ── Environment (variable scope) ────────────────────────────
class Env {
  constructor(parent=null) {
    this.parent = parent;
    this.vars   = new Map(); // name → {value, type, isArray}
  }
  define(name, value, type='any', isArray=false) {
    this.vars.set(name, { value, type, isArray });
  }
  get(name) {
    if (this.vars.has(name)) return this.vars.get(name);
    if (this.parent) return this.parent.get(name);
    throw new Error(`Undefined variable: ${name}`);
  }
  set(name, value) {
    if (this.vars.has(name)) { this.vars.get(name).value = value; return; }
    if (this.parent) { this.parent.set(name, value); return; }
    throw new Error(`Undefined variable: ${name}`);
  }
  has(name) { return this.vars.has(name) || (this.parent ? this.parent.has(name) : false); }

  snapshot() {
    // collect all visible vars from this scope up to root
    const result = {};
    let env = this;
    while (env) {
      for (const [k,v] of env.vars) {
        if (!(k in result)) result[k] = { value: v.value, type: v.type, isArray: v.isArray };
      }
      env = env.parent;
    }
    return result;
  }
}

// ── Interpreter ──────────────────────────────────────────────
class Interpreter {
  constructor() {
    this.trace    = [];
    this.steps    = 0;
    this.depth    = 0;
    this.outputs  = [];
    this.methods  = new Map();
    this.classes  = new Map();
    this.globalEnv = null;
    this.srcLines = [];
    this.prevVars = {};
  }

  run(src, inputs={}) {
    this.trace    = [];
    this.steps    = 0;
    this.depth    = 0;
    this.outputs  = [];
    this.methods  = new Map();
    this.classes  = new Map();
    this.srcLines = src.split('\n');

    const ast  = parse(src);
    const genv = new Env();
    this.globalEnv = genv;

    // Collect method and class declarations
    for (const node of ast.body) {
      if (node.kind === 'MethodDecl') {
        this.methods.set(node.name, node);
      } else if (node.kind === 'ClassDecl') {
        this.classes.set(node.name, node);
        if (node.methods) {
          for (const m of node.methods) this.methods.set(m.name, m);
        }
      }
    }

    const topLevelStmts = ast.body.filter(n => n.kind !== 'MethodDecl' && n.kind !== 'ClassDecl');
    const mainM = this.findMainMethod(ast);

    let retVal;

    if (topLevelStmts.length > 0) {
      this.callStack = ['<main>'];
      try {
        for (const stmt of topLevelStmts) {
          this.execStmt(stmt, genv);
        }
        if (mainM && mainM.name === 'main') {
          const args = this.buildArgs(mainM, inputs);
          const env = new Env(genv);
          for (let i = 0; i < mainM.params.length; i++) {
            const p = mainM.params[i];
            env.define(p.name, args[i], p.ptype?.base ?? 'any', p.ptype?.isArray ?? false);
          }
          this.callStack.push(mainM.name + '(' + mainM.params.map(p=>p.name).join(', ') + ')');
          retVal = this.execBlock(mainM.body, env);
        }
      } catch(e) {
        if (e instanceof ReturnSignal) retVal = e.value;
        else throw e;
      }
    } else if (mainM) {
      const args = this.buildArgs(mainM, inputs);
      this.callStack = [mainM.name + '(' + mainM.params.map(p=>p.name).join(', ') + ')'];
      try {
        const env = new Env(genv);
        for (let i=0; i<mainM.params.length; i++) {
          const p = mainM.params[i];
          env.define(p.name, args[i], p.ptype?.base ?? 'any', p.ptype?.isArray ?? false);
        }
        retVal = this.execBlock(mainM.body, env);
      } catch(e) {
        if (e instanceof ReturnSignal) retVal = e.value;
        else throw e;
      }
    } else {
      throw new Error('No method found. Paste a complete Java class or method.');
    }

    // Final step
    this.emit(this.srcLines.length, 'done', {
      explanation: { type:'done', returnValue: retVal },
      returnValue: retVal,
    }, genv);

    return { trace: this.trace, output: this.outputs, returnValue: retVal };
  }

  findMainMethod(ast) {
    for (const n of ast.body) {
      if (n.kind === 'MethodDecl') return n;
      if (n.kind === 'ClassDecl' && n.methods && n.methods.length > 0) {
        const main = n.methods.find(m => m.name === 'main') || n.methods[0];
        if (main) return main;
      }
    }
    return null;
  }

  buildArgs(method, inputs) {
    const usedKeys = new Set();
    const args = [];

    for (let i = 0; i < method.params.length; i++) {
      const p = method.params[i];
      let raw = inputs[p.name] ?? inputs[i];
      if (raw !== undefined) {
        usedKeys.add(p.name);
        usedKeys.add(String(i));
      } else {
        // Look for an unused input that matches the type (array vs scalar)
        const isArr = p.ptype?.isArray;
        for (const [k, v] of Object.entries(inputs)) {
          if (!usedKeys.has(k)) {
            const strVal = typeof v === "string" ? v.trim() : "";
            const valIsArr = Array.isArray(v) || strVal.startsWith("[");
            if (isArr ? valIsArr : !valIsArr) {
              raw = v;
              usedKeys.add(k);
              break;
            }
          }
        }
      }

      if (raw === undefined) {
        args.push(p.ptype?.isArray ? [] : 0);
      } else {
        args.push(this.parseInput(raw, p.ptype));
      }
    }
    return args;
  }

  parseInput(raw, ptype) {
    if (typeof raw !== 'string') return raw;
    raw = raw.trim();

    // Try parsing as JSON first (works for [1,2,3], [[1,2],[3,4]], numbers, booleans, strings)
    try {
      const jsonStr = raw.replace(/'/g, '"');
      const parsed = JSON.parse(jsonStr);
      return parsed;
    } catch (_) {}

    if (ptype?.isArray) {
      if (raw.startsWith('[')) {
        // Handle 2D nested array bracket structure
        if (raw.startsWith('[[')) {
          const inner = raw.slice(1, -1).trim();
          const subArrays = [];
          let depth = 0;
          let cur = '';
          for (let i = 0; i < inner.length; i++) {
            const ch = inner[i];
            if (ch === '[') depth++;
            else if (ch === ']') depth--;
            cur += ch;
            if (depth === 0 && (ch === ']' || i === inner.length - 1)) {
              const cleaned = cur.trim().replace(/^,\s*/, '');
              if (cleaned) {
                subArrays.push(this.parseInput(cleaned, { isArray: true }));
              }
              cur = '';
            }
          }
          if (subArrays.length > 0) return subArrays;
        }

        const inner = raw.slice(1, -1);
        return inner.split(',').map(s => {
          const n = s.trim();
          if (n === 'true') return true;
          if (n === 'false') return false;
          const num = Number(n);
          return isNaN(num) ? n.replace(/^"|"$/g, '') : num;
        });
      }
      return raw.split(',').map(s => {
        const n = s.trim();
        const num = Number(n);
        return isNaN(num) ? n : num;
      });
    }
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    const n = Number(raw);
    return isNaN(n) ? raw.replace(/^"|"$/g, '') : n;
  }

  // ── Snapshot helpers ─────────────────────────────────────────
  safeSnapshotValue(val, depth=0, seen=new WeakSet()) {
    if (val === null || val === undefined) return val;
    if (typeof val !== 'object') return val;
    if (seen.has(val) || depth > 3) return `<${val.__type || 'Object'}>`;
    seen.add(val);

    if (Array.isArray(val)) {
      return val.slice(0, 50).map(item => this.safeSnapshotValue(item, depth + 1, seen));
    }

    if (val.fields) {
      const snapFields = {};
      for (const [fName, fVal] of Object.entries(val.fields)) {
        snapFields[fName] = this.safeSnapshotValue(fVal, depth + 1, seen);
      }
      return { __type: val.__type, ...snapFields };
    }
    return val;
  }

  snapshotVars(env) {
    const snap = env.snapshot();
    const vars = {};
    const arrays = {};
    const collections = {};
    const builtInCollections = new Set(['ArrayList','Stack','Queue','HashMap','HashSet','StringBuilder','ArrayDeque','PriorityQueue','Vector','TreeMap','TreeSet','LinkedHashMap','LinkedHashSet']);

    for (const [k,v] of Object.entries(snap)) {
      if (k === 'this') continue;
      if (v.isArray && Array.isArray(v.value)) {
        arrays[k] = { values: [...v.value], type: v.type };
      } else if (v.value && typeof v.value === 'object' && builtInCollections.has(v.value.__type)) {
        collections[k] = {
          ...v.value,
          items: v.value.items instanceof Set ? Array.from(v.value.items) : (Array.isArray(v.value.items) ? [...v.value.items] : v.value.items),
          entries: v.value.entries instanceof Map ? new Map(v.value.entries) : (Array.isArray(v.value.entries) ? [...v.value.entries] : v.value.entries),
          lastOp: v.value.lastOp ? { ...v.value.lastOp } : null,
        };
      } else {
        vars[k] = { value: this.safeSnapshotValue(v.value), type: v.type };
      }
    }
    // detect pointer variables for each array
    for (const [arrName, arrInfo] of Object.entries(arrays)) {
      const pointers = {};
      for (const [varName, varInfo] of Object.entries(vars)) {
        const val = varInfo.value;
        if (typeof val === 'number' && Number.isInteger(val) && val >= 0 && val < arrInfo.values.length) {
          pointers[varName] = val;
        }
      }
      arrInfo.pointers = pointers;
    }
    return { vars, arrays, collections };
  }

  emit(line, type, extra={}, env=null) {
    this.steps++;
    if (this.steps > MAX_STEPS) throw new Error('MAX_STEPS: possible infinite loop');
    const srcLine = this.srcLines[(line||1)-1]?.trim() ?? '';
    const snap = env ? this.snapshotVars(env) : { vars:{}, arrays:{}, collections:{} };

    // detect changes
    const changedVars = {};
    for (const [k,v] of Object.entries(snap.vars)) {
      if (this.prevVars[k] !== undefined && this.prevVars[k] !== v.value)
        changedVars[k] = { from: this.prevVars[k], to: v.value };
    }
    for (const [k,v] of Object.entries(snap.vars)) this.prevVars[k] = v.value;

    const stepObj = {
      step: this.steps,
      line,
      statement: srcLine,
      type,
      variables: snap.vars,
      arrays: snap.arrays,
      collections: snap.collections,
      callStack: [...this.callStack],
      outputs: [...this.outputs],
      changedVars,
      returnValue: undefined,
      ...extra,
    };
    validateTraceStep(stepObj, this.steps);
    this.trace.push(stepObj);
  }

  // ── Statement execution ──────────────────────────────────────
  execBlock(block, env) {
    for (const stmt of block.body) {
      this.execStmt(stmt, env);
    }
  }

  execStmt(node, env) {
    if (!node) return;
    switch(node.kind) {
      case 'Block':     return this.execBlock(node, env);
      case 'EmptyStmt': return;
      case 'VarDecl':   return this.execVarDecl(node, env);
      case 'ExprStmt':  return this.execExprStmt(node, env);
      case 'IfStmt':    return this.execIf(node, env);
      case 'WhileStmt': return this.execWhile(node, env);
      case 'DoWhileStmt': return this.execDoWhile(node, env);
      case 'ForStmt':   return this.execFor(node, env);
      case 'ForEachStmt': return this.execForEach(node, env);
      case 'ReturnStmt':return this.execReturn(node, env);
      case 'Break':     throw new BreakSignal();
      case 'Continue':  throw new ContinueSignal();
      case 'EmptyStmt': break;
      default:
        throw new RuntimeError(`Unsupported statement construct '${node.kind}' at line ${node.line || "?"}.`, node.line);
    }
  }

  execVarDecl(node, env) {
    for (const decl of node.decls) {
      let val;
      if (decl.init) {
        val = this.evalExpr(decl.init, env);
      } else if (decl.isArray) {
        val = [];
      } else {
        const baseType = node.typeExpr?.base;
        if (['int','long','double','float','char','byte','short'].includes(baseType)) val = 0;
        else if (baseType === 'boolean') val = false;
        else val = null;
      }
      const isArr = decl.isArray || Array.isArray(val);
      const isCol = val && typeof val === 'object' && ['ArrayList','Stack','Queue','HashMap','HashSet','StringBuilder','ArrayDeque','PriorityQueue','Vector'].includes(val.__type);
      env.define(decl.name, val, node.typeExpr?.base ?? 'any', isArr || isCol);
      const expl = this.makeExplanation('decl', { name:decl.name, value:val, type:node.typeExpr?.base });
      this.emit(node.line, 'declaration', { explanation: expl }, env);
    }
  }

  execExprStmt(node, env) {
    const before = this.captureState(env);
    const val = this.evalExpr(node.expr, env);
    const after = this.captureState(env);
    const changed = this.findChanged(before, after);
    if (changed.length > 0 || node.expr.kind === 'MethodCall' || node.expr.kind==='PostInc' || node.expr.kind==='PostDec' || node.expr.kind==='PreInc' || node.expr.kind==='PreDec') {
      const expl = this.makeExplanation('expr', { node:node.expr, changed, env });
      this.emit(node.line, 'expression', { explanation: expl }, env);
    }
  }

  execIf(node, env) {
    const condVal = this.evalExpr(node.test, env);
    const exprStr = this.nodeToString(node.test, env);
    const expl = this.makeExplanation('condition_if', { expression: this.astToSource(node.test), expanded: exprStr, result: condVal });
    this.emit(node.line, 'condition', { explanation: expl, conditionResult: condVal }, env);
    if (condVal) {
      this.execStmt(node.consequent, env);
    } else if (node.alternate) {
      this.execStmt(node.alternate, env);
    }
  }

  execWhile(node, env) {
    while (true) {
      const condVal = this.evalExpr(node.test, env);
      const exprStr = this.nodeToString(node.test, env);
      const expl = this.makeExplanation('condition_while', { expression: this.astToSource(node.test), expanded: exprStr, result: condVal });
      this.emit(node.line, 'loop_condition', { explanation: expl, conditionResult: condVal }, env);
      if (!condVal) break;
      try { this.execStmt(node.body, env); }
      catch(e) { if (e instanceof BreakSignal) break; if (e instanceof ContinueSignal) continue; throw e; }
    }
  }

  execDoWhile(node, env) {
    do {
      try { this.execStmt(node.body, env); }
      catch(e) { if (e instanceof BreakSignal) break; if (e instanceof ContinueSignal) {} else throw e; }
      const condVal = this.evalExpr(node.test, env);
      this.emit(node.line, 'loop_condition', { explanation: { type:'condition_while', expression: this.astToSource(node.test), expanded: this.nodeToString(node.test, env), result: condVal }, conditionResult: condVal }, env);
      if (!condVal) break;
    } while (true);
  }

  execFor(node, env) {
    const forEnv = new Env(env);
    if (node.init) {
      if (node.init.kind === 'VarDecl') this.execVarDecl(node.init, forEnv);
      else if (node.init.kind === 'ExprStmt') this.execExprStmt(node.init, forEnv);
    }
    while (true) {
      if (node.test) {
        const condVal = this.evalExpr(node.test, forEnv);
        const exprStr = this.nodeToString(node.test, forEnv);
        const expl = this.makeExplanation('condition_for', { expression: this.astToSource(node.test), expanded: exprStr, result: condVal });
        this.emit(node.line, 'loop_condition', { explanation: expl, conditionResult: condVal }, forEnv);
        if (!condVal) break;
      }
      try { this.execStmt(node.body, forEnv); }
      catch(e) { if (e instanceof BreakSignal) break; if (e instanceof ContinueSignal) {} else throw e; }
      for (const u of node.updates) {
        const before = this.captureState(forEnv);
        this.evalExpr(u, forEnv);
        const after = this.captureState(forEnv);
        const changed = this.findChanged(before, after);
        if (changed.length > 0) {
          this.emit(node.line, 'update', { explanation: this.makeExplanation('expr', { node:u, changed }) }, forEnv);
        }
      }
    }
  }

  execForEach(node, env) {
    const iterableVal = this.evalExpr(node.iterable, env);
    let items = [];
    if (Array.isArray(iterableVal)) {
      items = iterableVal;
    } else if (iterableVal && typeof iterableVal === "object") {
      if (iterableVal.__type === "HashSet" || iterableVal.__type === "TreeSet" || iterableVal.__type === "LinkedHashSet") {
        items = Array.from(iterableVal.items ? iterableVal.items.values() : []);
      } else if (iterableVal.items && Array.isArray(iterableVal.items)) {
        items = iterableVal.items;
      } else if (iterableVal.items instanceof Set) {
        items = Array.from(iterableVal.items.values());
      } else if (iterableVal instanceof Set) {
        items = Array.from(iterableVal.values());
      }
    }

    const forEnv = new Env(env);
    const iterName = this.astToSource(node.iterable);
    for (const item of items) {
      forEnv.define(node.varName, item, node.typeExpr?.base ?? "any", false);
      const expl = this.makeExplanation("for_each", {
        item,
        varName: node.varName,
        iterableName: iterName
      });
      this.emit(node.line, "loop_iteration", {
        statement: `for (${node.varName} : ${iterName})`,
        explanation: expl
      }, forEnv);

      try {
        this.execStmt(node.body, forEnv);
      } catch (e) {
        if (e instanceof BreakSignal) break;
        if (e instanceof ContinueSignal) {} else throw e;
      }
    }
  }

  execReturn(node, env) {
    const val = node.value ? this.evalExpr(node.value, env) : undefined;
    const expl = this.makeExplanation('return', { value: val });
    this.emit(node.line, 'return', { explanation: expl, returnValue: val }, env);
    throw new ReturnSignal(val);
  }

  // ── Expression evaluation ────────────────────────────────────
  evalExpr(node, env) {
    if (!node) return null;
    switch(node.kind) {
      case 'Literal': return node.value;
      case 'Identifier': return this.evalId(node, env);
      case 'BinOp': return this.evalBinOp(node, env);
      case 'Unary': return this.evalUnary(node, env);
      case 'PostInc': return this.evalPostfix(node, env, 1);
      case 'PostDec': return this.evalPostfix(node, env, -1);
      case 'PreInc':  { const v = this.evalExpr(node.operand, env)+1; this.assignTo(node.operand, v, env); return v; }
      case 'PreDec':  { const v = this.evalExpr(node.operand, env)-1; this.assignTo(node.operand, v, env); return v; }
      case 'Assign': return this.evalAssign(node, env);
      case 'Ternary': { const c=this.evalExpr(node.cond,env); return c ? this.evalExpr(node.then,env) : this.evalExpr(node.else,env); }
      case 'ArrayAccess': return this.evalArrayAccess(node, env);
      case 'MemberAccess': return this.evalMemberAccess(node, env);
      case 'MethodCall': return this.evalMethodCall(node, env);
      case 'FuncCall': return this.evalFuncCall(node, env);
      case 'ArrayCreate': return this.evalArrayCreate(node, env);
      case 'ArrayLiteral': return node.items.map(i => this.evalExpr(i, env));
      case 'ObjectCreate': return this.evalObjectCreate(node, env);
      case 'Lambda': return this.evalLambda(node, env);
      case 'Cast': return this.evalCast(node, env);
      default:
        throw new RuntimeError(`Unsupported expression construct '${node.kind}' at line ${node.line || "?"}.`, node.line);
    }
  }

  evalId(node, env) {
    try { return env.get(node.name).value; }
    catch(_) {
      if (env.has('this')) {
        const thisObj = env.get('this').value;
        if (thisObj && typeof thisObj === 'object') {
          if (thisObj.fields && Object.prototype.hasOwnProperty.call(thisObj.fields, node.name)) {
            return thisObj.fields[node.name];
          }
          if (Object.prototype.hasOwnProperty.call(thisObj, node.name)) {
            return thisObj[node.name];
          }
        }
      }
      return undefined;
    }
  }

  evalBinOp(node, env) {
    // short-circuit for && and ||
    if (node.op === 'AND') { const l=this.evalExpr(node.left,env); return l ? this.evalExpr(node.right,env) : false; }
    if (node.op === 'OR')  { const l=this.evalExpr(node.left,env); return l ? true : this.evalExpr(node.right,env); }
    const l = this.evalExpr(node.left, env);
    const r = this.evalExpr(node.right, env);
    switch(node.op) {
      case 'PLUS':    return (typeof l==='string'||typeof r==='string') ? String(l)+String(r) : l+r;
      case 'MINUS':   return l-r;
      case 'STAR':    return l*r;
      case 'SLASH':   return r===0 ? (() => { throw new Error('Division by zero'); })() : Math.trunc(l/r);
      case 'PERCENT': return l%r;
      case 'EQ':      return l===r;
      case 'NEQ':     return l!==r;
      case 'LT':      return l<r;
      case 'GT':      return l>r;
      case 'LTE':     return l<=r;
      case 'GTE':     return l>=r;
      case 'CARET':   return l ^ r;
      case 'AMP':     return l & r;
      case 'PIPE':    return l | r;
      case 'SHIFT_LEFT':           return l << r;
      case 'SHIFT_RIGHT':          return l >> r;
      case 'UNSIGNED_SHIFT_RIGHT': return l >>> r;
      default:
        throw new RuntimeError(`Unsupported binary operator '${node.op}' at line ${node.line || "?"}.`, node.line);
    }
  }

  evalUnary(node, env) {
    const v = this.evalExpr(node.operand, env);
    if (node.op==='!') return !v;
    if (node.op==='-') return -v;
    if (node.op==='~') return ~v;
    return v;
  }

  evalPostfix(node, env, delta) {
    const old = this.evalExpr(node.operand, env);
    this.assignTo(node.operand, old+delta, env);
    return old; // post: return old value
  }

  evalAssign(node, env) {
    let rval = this.evalExpr(node.right, env);
    if (node.op !== 'ASSIGN') {
      const cur = this.evalExpr(node.left, env);
      switch(node.op) {
        case 'PLUS_ASSIGN':    rval = (typeof cur==='string'||typeof rval==='string') ? String(cur)+String(rval) : cur+rval; break;
        case 'MINUS_ASSIGN':   rval = cur-rval; break;
        case 'STAR_ASSIGN':    rval = cur*rval; break;
        case 'SLASH_ASSIGN':
          if (rval === 0) throw new Error('ArithmeticException: / by zero');
          rval = Math.trunc(cur / rval);
          break;
        case 'PERCENT_ASSIGN': rval = cur % rval; break;
        case 'AND_ASSIGN':     rval = cur & rval; break;
        case 'OR_ASSIGN':      rval = cur | rval; break;
        case 'SHIFT_LEFT_ASSIGN':           rval = cur << rval; break;
        case 'SHIFT_RIGHT_ASSIGN':          rval = cur >> rval; break;
        case 'UNSIGNED_SHIFT_RIGHT_ASSIGN': rval = cur >>> rval; break;
      }
    }
    this.assignTo(node.left, rval, env);
    return rval;
  }

  assignTo(target, value, env) {
    if (target.kind === 'Identifier') {
      if (env.has(target.name)) {
        env.set(target.name, value);
      } else if (env.has('this')) {
        const thisObj = env.get('this').value;
        if (thisObj && typeof thisObj === 'object') {
          if (!thisObj.fields) thisObj.fields = {};
          thisObj.fields[target.name] = value;
          thisObj[target.name] = value;
          return;
        }
        env.define(target.name, value);
      } else {
        env.define(target.name, value);
      }
    } else if (target.kind === 'ArrayAccess') {
      const arr = this.evalExpr(target.object, env);
      const idx = this.evalExpr(target.index, env);
      if (Array.isArray(arr)) arr[idx] = value;
    } else if (target.kind === 'MemberAccess') {
      const obj = this.evalExpr(target.object, env);
      if (obj === null || obj === undefined || typeof obj !== 'object') {
        throw new Error(`NullPointerException: Cannot set field "${target.member}" on null object`);
      }
      if (!obj.fields) obj.fields = {};
      obj.fields[target.member] = value;
      obj[target.member] = value;
    }
  }

  evalArrayAccess(node, env) {
    const arr = this.evalExpr(node.object, env);
    const idx = this.evalExpr(node.index, env);
    if (!Array.isArray(arr)) throw new Error(`Not an array`);
    if (idx < 0 || idx >= arr.length) throw new Error(`ArrayIndexOutOfBoundsException: index ${idx}, length ${arr.length}`);
    return arr[idx];
  }

  evalMemberAccess(node, env) {
    // Integer / Long / Math constants
    if (node.object.kind === 'Identifier') {
      const objName = node.object.name;
      if (objName === 'Integer') {
        if (node.member === 'MAX_VALUE') return 2147483647;
        if (node.member === 'MIN_VALUE') return -2147483648;
      }
      if (objName === 'Long') {
        if (node.member === 'MAX_VALUE') return 9007199254740991;
        if (node.member === 'MIN_VALUE') return -9007199254740991;
      }
      if (objName === 'Math') {
        if (node.member === 'PI') return Math.PI;
        if (node.member === 'E') return Math.E;
      }
    }

    const obj = this.evalExpr(node.object, env);
    if (obj === null || obj === undefined) {
      throw new Error(`NullPointerException: Cannot read field "${node.member}" because object is null`);
    }

    if (node.member === 'length') {
      if (Array.isArray(obj)) return obj.length;
      if (typeof obj === 'string') return obj.length;
      if (obj && typeof obj === 'object' && obj.__type) return obj.size ?? obj.items?.length ?? 0;
    }

    if (typeof obj === 'object') {
      if (obj.fields && Object.prototype.hasOwnProperty.call(obj.fields, node.member)) {
        return obj.fields[node.member];
      }
      if (Object.prototype.hasOwnProperty.call(obj, node.member)) {
        return obj[node.member];
      }
      if (obj.__type && typeof this.collectionGet === 'function') {
        const cVal = this.collectionGet(obj, node.member);
        if (cVal !== undefined && cVal !== null) return cVal;
      }
      return null;
    }

    return null;
  }

  evalMethodCall(node, env) {
    // System.out.println / print
    if (node.object?.kind==='MemberAccess' && node.object.object?.kind==='Identifier') {
      const cls = node.object.object.name;
      const mid = node.object.member;
      if (cls==='System' && (mid==='out') && (node.method==='println'||node.method==='print')) {
        const arg = node.args[0] !== undefined ? this.evalExpr(node.args[0], env) : '';
        const line = arg === null ? 'null' : (typeof arg === 'object' && arg.__type ? (arg.name || arg.__type) : String(arg));
        this.outputs.push(line);
        this.emit(node.line, 'output', { explanation: { type:'output', value:line } }, env);
        return null;
      }
    }
    // Math.xxx
    if (node.object?.kind==='Identifier' && node.object.name==='Math') {
      const args = node.args.map(a=>this.evalExpr(a,env));
      switch(node.method) {
        case 'max': return Math.max(...args);
        case 'min': return Math.min(...args);
        case 'abs': return Math.abs(args[0]);
        case 'pow': return Math.pow(args[0],args[1]);
        case 'sqrt': return Math.sqrt(args[0]);
        case 'floor': return Math.floor(args[0]);
        case 'ceil': return Math.ceil(args[0]);
        case 'log': return Math.log(args[0]);
      }
    }
    // Arrays.sort, Arrays.fill
    if (node.object?.kind==='Identifier' && node.object.name==='Arrays') {
      const args = node.args.map(a=>this.evalExpr(a,env));
      if (node.method==='sort' && Array.isArray(args[0])) { args[0].sort((a,b)=>a-b); return null; }
      if (node.method==='fill' && Array.isArray(args[0])) { args[0].fill(args[1]); return null; }
      if (node.method==='copyOf') return [...(args[0]||[])].slice(0, args[1]);
    }
    // Collections.sort, reverseOrder
    if (node.object?.kind==='Identifier' && node.object.name==='Collections') {
      const args = node.args.map(a=>this.evalExpr(a,env));
      if (node.method==='reverseOrder') return { __type:'Comparator', order:'reverse' };
      if (node.method==='sort' && args[0]?.__type==='ArrayList') { args[0].items.sort((a,b)=>a-b); return null; }
      if (node.method==='reverse' && args[0]?.__type==='ArrayList') { args[0].items.reverse(); return null; }
      if (node.method==='min') return Math.min(...(args[0]?.__type ? args[0].items : []));
      if (node.method==='max') return Math.max(...(args[0]?.__type ? args[0].items : []));
    }
    // String methods
    if (node.object) {
      const obj = this.evalExpr(node.object, env);
      const args = node.args.map(a=>this.evalExpr(a,env));
      if (typeof obj==='string') {
        switch(node.method) {
          case 'length':    return obj.length;
          case 'charAt':    return obj[args[0]] ?? '';
          case 'equals':    return obj===args[0];
          case 'equalsIgnoreCase': return obj.toLowerCase()===String(args[0]).toLowerCase();
          case 'contains':  return obj.includes(args[0]);
          case 'indexOf':   return obj.indexOf(args[0]);
          case 'lastIndexOf': return obj.lastIndexOf(args[0]);
          case 'substring': return args.length>1 ? obj.slice(args[0],args[1]) : obj.slice(args[0]);
          case 'toLowerCase': return obj.toLowerCase();
          case 'toUpperCase': return obj.toUpperCase();
          case 'trim':      return obj.trim();
          case 'split':     return obj.split(args[0]);
          case 'replace':   return obj.replaceAll(args[0], args[1]);
          case 'toCharArray': return obj.split('');
          case 'valueOf':   return String(args[0]);
          case 'isEmpty':   return obj.length===0;
          case 'startsWith': return obj.startsWith(args[0]);
          case 'endsWith':  return obj.endsWith(args[0]);
        }
      }
      // Collection methods
      if (obj && typeof obj==='object' && obj.__type) {
        return this.callCollectionMethod(obj, node.method, args, node.line, env);
      }
      // Array method calls (e.g. after new int[]{...})
      if (Array.isArray(obj)) {
        if (node.method==='length') return obj.length;
        if (node.method==='clone') return [...obj];
      }
    }
    // User-defined method call
    if (node.object?.kind==='Identifier' || !node.object) {
      const methName = node.method;
      if (this.methods.has(methName)) {
        return this.callUserMethod(methName, node.args.map(a=>this.evalExpr(a,env)), env, node.line);
      }
    }
    // Integer methods
    if (node.object?.kind==='Identifier' && node.object.name==='Integer') {
      const args = node.args.map(a=>this.evalExpr(a,env));
      if (node.method==='parseInt') return parseInt(args[0]);
      if (node.method==='valueOf') return parseInt(args[0]);
      if (node.method==='toString') return String(args[0]);
      if (node.method==='compare') return args[0]-args[1];
      if (node.method==='max') return Math.max(args[0],args[1]);
      if (node.method==='min') return Math.min(args[0],args[1]);
      if (node.method==='bitCount') { let n=args[0],c=0; while(n){c+=n&1;n>>>=1;} return c; }
    }
    // Character methods
    if (node.object?.kind==='Identifier' && node.object.name==='Character') {
      const args = node.args.map(a=>this.evalExpr(a,env));
      if (node.method==='isLetter') return /[a-zA-Z]/.test(args[0]);
      if (node.method==='isDigit') return /[0-9]/.test(args[0]);
      if (node.method==='isAlphabetic') return /[a-zA-Z]/.test(args[0]);
      if (node.method==='toLowerCase') return String(args[0]).toLowerCase();
      if (node.method==='toUpperCase') return String(args[0]).toUpperCase();
    }
    return null;
  }

  evalFuncCall(node, env) {
    if (node.name === 'println' || node.name === 'print') {
      const arg = node.args[0] !== undefined ? this.evalExpr(node.args[0], env) : '';
      const line = arg === null ? 'null' : (typeof arg === 'object' && arg.__type ? (arg.name || arg.__type) : String(arg));
      this.outputs.push(line);
      this.emit(node.line, 'output', { explanation: { type:'output', value:line } }, env);
      return null;
    }
    if (this.methods.has(node.name))
      return this.callUserMethod(node.name, node.args.map(a=>this.evalExpr(a,env)), env, node.line);
    return null;
  }

  callUserMethod(name, argVals, callerEnv, line) {
    if (this.depth >= MAX_DEPTH) throw new Error(`StackOverflowError: recursion too deep`);
    const method = this.methods.get(name);
    const env = new Env(callerEnv || this.globalEnv || null);
    for (let i=0; i<method.params.length; i++)
      env.define(method.params[i].name, argVals[i] ?? null, method.params[i].ptype?.base ?? 'any', method.params[i].ptype?.isArray);
    this.callStack.push(name+'('+argVals.map(v=>Array.isArray(v)?`[${v.join(',')}]`:v).join(', ')+')');
    this.depth++;
    this.emit(line, 'call', { explanation: { type:'call', name, args:argVals } }, env);
    let retVal = undefined;
    try {
      this.execBlock(method.body, env);
    } catch(e) {
      if (e instanceof ReturnSignal) retVal = e.value;
      else throw e;
    }
    this.callStack.pop();
    this.depth--;
    return retVal;
  }

  evalArrayCreate(node, env) {
    if (node.items && node.items.length > 0)
      return node.items.map(i => this.evalExpr(i, env));
    const size = node.size ? this.evalExpr(node.size, env) : 0;
    const fill = node.elType==='boolean' ? false : (node.elType==='String' ? null : 0);
    return Array(Math.min(size, 10000)).fill(fill);
  }

  evalLambda(node, env) {
    return (...args) => {
      const lambdaEnv = new Env(env);
      (node.params || []).forEach((p, idx) => {
        lambdaEnv.define(p, args[idx]);
      });
      return this.evalExpr(node.body, lambdaEnv);
    };
  }

  evalObjectCreate(node, env) {
    const args = node.args.map(a => this.evalExpr(a, env));
    const cls = node.className;
    // Collections
    if (cls==='ArrayList' || cls==='LinkedList' || cls==='Vector')
      return { __type:'ArrayList', items:[], name:cls };
    if (cls==='Stack')
      return { __type:'Stack', items:[] };
    if (cls==='Queue' || cls==='ArrayDeque')
      return { __type:'Queue', items:[], name:cls };
    if (cls==='PriorityQueue') {
      let comparator = null;
      for (const a of args) {
        if (typeof a === 'function') comparator = a;
        else if (a && typeof a === 'object' && a.__type === 'Comparator') comparator = a;
      }
      return { __type:'PriorityQueue', items:[], name:cls, comparator };
    }
    if (cls==='HashMap' || cls==='TreeMap' || cls==='LinkedHashMap')
      return { __type:'HashMap', entries:new Map(), name:cls };
    if (cls==='HashSet' || cls==='TreeSet' || cls==='LinkedHashSet')
      return { __type:'HashSet', items:new Set(), name:cls };
    if (cls==='StringBuilder' || cls==='StringBuffer')
      return { __type:'StringBuilder', value:'' };

    // General Java object instance
    const instance = {
      __type: cls,
      fields: {},
      args,
    };

    // If explicit class declaration exists
    const classDecl = this.classes?.get(cls);
    if (classDecl) {
      if (classDecl.fields) {
        for (const fieldStmt of classDecl.fields) {
          for (const decl of fieldStmt.decls) {
            let defVal = null;
            if (decl.init) {
              defVal = this.evalExpr(decl.init, env);
            } else if (decl.isArray) {
              defVal = [];
            } else {
              const baseType = fieldStmt.typeExpr?.base;
              if (['int','long','double','float','char','byte','short'].includes(baseType)) defVal = 0;
              else if (baseType === 'boolean') defVal = false;
              else defVal = null;
            }
            instance.fields[decl.name] = defVal;
            instance[decl.name] = defVal;
          }
        }
      }

      let matchingCtor = null;
      if (classDecl.constructors && classDecl.constructors.length > 0) {
        matchingCtor = classDecl.constructors.find(c => c.params.length === args.length)
          || classDecl.constructors[0];
      }

      if (matchingCtor) {
        const ctorEnv = new Env(this.globalEnv || env);
        ctorEnv.define('this', instance, cls);
        for (let i = 0; i < matchingCtor.params.length; i++) {
          const p = matchingCtor.params[i];
          ctorEnv.define(p.name, args[i] ?? null, p.ptype?.base ?? 'any', p.ptype?.isArray ?? false);
        }
        this.callStack.push(`${cls}(${args.map(a => String(a)).join(', ')})`);
        this.depth++;
        try {
          this.execBlock(matchingCtor.body, ctorEnv);
        } catch(e) {
          if (!(e instanceof ReturnSignal)) throw e;
        }
        this.callStack.pop();
        this.depth--;
        return instance;
      }
    }

    // Standard DSA defaults for implicit or undeclared classes
    if (cls === 'ListNode') {
      const val = args[0] !== undefined ? args[0] : 0;
      const next = args[1] !== undefined ? args[1] : null;
      instance.fields.val = val;
      instance.fields.next = next;
      instance.val = val;
      instance.next = next;
      return instance;
    }

    if (cls === 'TreeNode') {
      const val = args[0] !== undefined ? args[0] : 0;
      const left = args[1] !== undefined ? args[1] : null;
      const right = args[2] !== undefined ? args[2] : null;
      instance.fields.val = val;
      instance.fields.left = left;
      instance.fields.right = right;
      instance.val = val;
      instance.left = left;
      instance.right = right;
      return instance;
    }

    if (cls === 'Node') {
      const val = args[0] !== undefined ? args[0] : 0;
      const next = args[1] !== undefined ? args[1] : null;
      instance.fields.val = val;
      instance.fields.next = next;
      instance.val = val;
      instance.next = next;
      return instance;
    }

    // Fallback: positional assignment if fields exist on class
    if (classDecl && classDecl.fields) {
      const fieldNames = [];
      for (const fieldStmt of classDecl.fields) {
        for (const decl of fieldStmt.decls) fieldNames.push(decl.name);
      }
      for (let i = 0; i < args.length && i < fieldNames.length; i++) {
        instance.fields[fieldNames[i]] = args[i];
        instance[fieldNames[i]] = args[i];
      }
    }

    return instance;
  }

  callCollectionMethod(obj, method, args, line, env) {
    switch(obj.__type) {
      case 'ArrayList': return this.arrayListMethod(obj, method, args);
      case 'Stack':     return this.stackMethod(obj, method, args, line, env);
      case 'Queue':     return this.queueMethod(obj, method, args, line, env);
      case 'PriorityQueue': return this.priorityQueueMethod(obj, method, args, line, env);
      case 'HashMap':   return this.hashMapMethod(obj, method, args, line, env);
      case 'HashSet':   return this.hashSetMethod(obj, method, args, line, env);
      case 'StringBuilder': return this.sbMethod(obj, method, args);
    }
    return null;
  }

  arrayListMethod(obj, method, args) {
    switch(method) {
      case 'add':    if(args.length===2){obj.items[args[0]]=args[1];}else{obj.items.push(args[0]);} return null;
      case 'get':    return obj.items[args[0]];
      case 'set':    { const old=obj.items[args[0]]; obj.items[args[0]]=args[1]; return old; }
      case 'remove': { const v=Number.isInteger(args[0])&&args[0]<obj.items.length?obj.items.splice(args[0],1)[0]:(() => { const i=obj.items.indexOf(args[0]); if(i>=0)obj.items.splice(i,1); return args[0]; })(); return v; }
      case 'size':   return obj.items.length;
      case 'isEmpty': return obj.items.length===0;
      case 'contains': return obj.items.includes(args[0]);
      case 'indexOf': return obj.items.indexOf(args[0]);
      case 'clear':  obj.items=[]; return null;
      case 'toArray': return [...obj.items];
      case 'sort':   obj.items.sort((a,b)=>a-b); return null;
    }
    return null;
  }

  stackMethod(obj, method, args, line, env) {
    switch(method) {
      case 'push':    obj.items.push(args[0]); return args[0];
      case 'pop':     if(obj.items.length===0) throw new Error('EmptyStackException'); return obj.items.pop();
      case 'peek':    if(obj.items.length===0) throw new Error('EmptyStackException'); return obj.items[obj.items.length-1];
      case 'isEmpty': return obj.items.length===0;
      case 'size':    return obj.items.length;
    }
    return null;
  }

  priorityQueueMethod(obj, method, args, line, env) {
    switch (method) {
      case 'offer':
      case 'add': {
        const val = args[0];
        if (val === null || val === undefined) {
          throw new Error('NullPointerException: PriorityQueue does not permit null elements');
        }
        obj.items.push(val);
        this.pqSiftUp(obj, obj.items.length - 1);
        return true;
      }
      case 'peek': {
        if (obj.items.length === 0) return null;
        return obj.items[0];
      }
      case 'element': {
        if (obj.items.length === 0) throw new Error('NoSuchElementException');
        return obj.items[0];
      }
      case 'poll': {
        if (obj.items.length === 0) return null;
        const root = obj.items[0];
        const last = obj.items.pop();
        if (obj.items.length > 0) {
          obj.items[0] = last;
          this.pqSiftDown(obj, 0);
        }
        return root;
      }
      case 'remove': {
        if (args.length === 0) {
          if (obj.items.length === 0) throw new Error('NoSuchElementException');
          return this.priorityQueueMethod(obj, 'poll', [], line, env);
        }
        const target = args[0];
        const idx = obj.items.findIndex(item => this.pqElementsEqual(item, target));
        if (idx === -1) return false;
        if (idx === obj.items.length - 1) {
          obj.items.pop();
          return true;
        }
        obj.items[idx] = obj.items.pop();
        this.pqSiftDown(obj, idx);
        this.pqSiftUp(obj, idx);
        return true;
      }
      case 'size': {
        return obj.items.length;
      }
      case 'isEmpty': {
        return obj.items.length === 0;
      }
      case 'clear': {
        obj.items = [];
        return null;
      }
      case 'contains': {
        const target = args[0];
        return obj.items.some(item => this.pqElementsEqual(item, target));
      }
      case 'toArray': {
        return [...obj.items];
      }
    }
    return null;
  }

  pqElementsEqual(a, b) {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every((v, i) => v === b[i]);
    }
    if (a && typeof a === 'object' && b && typeof b === 'object') {
      if (a.val !== undefined && b.val !== undefined) return a.val === b.val;
      if (a.fields?.val !== undefined && b.fields?.val !== undefined) return a.fields.val === b.fields.val;
    }
    return false;
  }

  comparePriorityQueue(obj, a, b) {
    if (typeof obj.comparator === 'function') {
      const res = obj.comparator(a, b);
      return typeof res === 'number' ? res : 0;
    }
    if (obj.comparator && obj.comparator.__type === 'Comparator' && obj.comparator.order === 'reverse') {
      return this.defaultCompare(b, a);
    }
    return this.defaultCompare(a, b);
  }

  defaultCompare(a, b) {
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    if (typeof a === 'string' && typeof b === 'string') {
      return a < b ? -1 : a > b ? 1 : 0;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] !== b[i]) return a[i] - b[i];
      }
      return a.length - b.length;
    }
    if (a && typeof a === 'object' && b && typeof b === 'object') {
      const valA = a.val !== undefined ? a.val : (a.fields?.val !== undefined ? a.fields.val : null);
      const valB = b.val !== undefined ? b.val : (b.fields?.val !== undefined ? b.fields.val : null);
      if (valA !== null && valB !== null) {
        return valA - valB;
      }
    }
    return a < b ? -1 : a > b ? 1 : 0;
  }

  pqSiftUp(obj, idx) {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.comparePriorityQueue(obj, obj.items[idx], obj.items[parent]) < 0) {
        const tmp = obj.items[idx];
        obj.items[idx] = obj.items[parent];
        obj.items[parent] = tmp;
        idx = parent;
      } else {
        break;
      }
    }
  }

  pqSiftDown(obj, idx) {
    const len = obj.items.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;

      if (left < len && this.comparePriorityQueue(obj, obj.items[left], obj.items[smallest]) < 0) {
        smallest = left;
      }
      if (right < len && this.comparePriorityQueue(obj, obj.items[right], obj.items[smallest]) < 0) {
        smallest = right;
      }

      if (smallest !== idx) {
        const tmp = obj.items[idx];
        obj.items[idx] = obj.items[smallest];
        obj.items[smallest] = tmp;
        idx = smallest;
      } else {
        break;
      }
    }
  }

  queueMethod(obj, method, args, line, env) {
    switch(method) {
      case 'offer': case 'add': case 'push': obj.items.push(args[0]); return true;
      case 'poll': case 'pop': if(obj.items.length===0) return null; return obj.items.shift();
      case 'peek': case 'element': return obj.items[0] ?? null;
      case 'isEmpty': return obj.items.length===0;
      case 'size':    return obj.items.length;
    }
    return null;
  }

  hashMapMethod(obj, method, args, line, env) {
    let result = null;
    switch(method) {
      case 'put':         { obj.entries.set(args[0], args[1]); result = args[1]; break; }
      case 'get':         { result = obj.entries.get(args[0]) ?? null; break; }
      case 'getOrDefault': { result = obj.entries.has(args[0]) ? obj.entries.get(args[0]) : args[1]; break; }
      case 'containsKey': { result = obj.entries.has(args[0]); break; }
      case 'containsValue': { result = [...obj.entries.values()].includes(args[0]); break; }
      case 'remove':      { const v = obj.entries.get(args[0]); obj.entries.delete(args[0]); result = v; break; }
      case 'size':        { result = obj.entries.size; break; }
      case 'isEmpty':     { result = obj.entries.size === 0; break; }
      case 'keySet':      return { __type:'ArrayList', items:[...obj.entries.keys()] };
      case 'values':      return { __type:'ArrayList', items:[...obj.entries.values()] };
      case 'entrySet':    return { __type:'ArrayList', items:[...obj.entries.entries()].map(([k,v])=>({k,v})) };
      case 'clear':       { obj.entries.clear(); result = null; break; }
      case 'merge':       {
        const existing = obj.entries.get(args[0]);
        let newVal;
        if (existing === undefined) {
          newVal = args[1];
        } else if (typeof args[2] === 'function') {
          newVal = args[2](existing, args[1]);
        } else {
          newVal = existing + args[1];
        }
        obj.entries.set(args[0], newVal);
        result = newVal;
        break;
      }
      case 'forEach':     return null;
      default:            return null;
    }
    obj.lastOp = { method, args: [...args], result, line };
    return result;
  }

  hashSetMethod(obj, method, args, line) {
    let result = null;
    switch(method) {
      case 'add':      { const had = obj.items.has(args[0]); obj.items.add(args[0]); result = !had; break; }
      case 'remove':   { result = obj.items.delete(args[0]); break; }
      case 'contains': { result = obj.items.has(args[0]); break; }
      case 'size':     { result = obj.items.size; break; }
      case 'isEmpty':  { result = obj.items.size === 0; break; }
      case 'clear':    { obj.items.clear(); result = null; break; }
      default:         return null;
    }
    obj.lastOp = { method, args: [...args], result, line };
    return result;
  }

  sbMethod(obj, method, args) {
    switch(method) {
      case 'append':  obj.value+=String(args[0]); return obj;
      case 'toString': return obj.value;
      case 'length': return obj.value.length;
      case 'charAt': return obj.value[args[0]];
      case 'reverse': obj.value=obj.value.split('').reverse().join(''); return obj;
      case 'deleteCharAt': obj.value=obj.value.slice(0,args[0])+obj.value.slice(args[0]+1); return obj;
      case 'insert': obj.value=obj.value.slice(0,args[0])+args[1]+obj.value.slice(args[0]); return obj;
      case 'delete': obj.value=obj.value.slice(0,args[0])+obj.value.slice(args[1]); return obj;
      case 'substring': return args.length>1 ? obj.value.slice(args[0],args[1]) : obj.value.slice(args[0]);
    }
    return obj;
  }

  evalCast(node, env) {
    const v = this.evalExpr(node.operand, env);
    if (node.castType==='int') return Math.trunc(Number(v));
    if (node.castType==='double'||node.castType==='float') return Number(v);
    if (node.castType==='char') return typeof v==='number' ? String.fromCharCode(v) : v;
    return v;
  }

  collectionGet(obj, member) {
    if (member==='size') return obj.entries?.size ?? obj.items?.length ?? obj.items?.size ?? 0;
    return null;
  }

  // ── Capture state for change detection ───────────────────────
  captureState(env) {
    const snap = env.snapshot();
    const state = {};
    for (const [k,v] of Object.entries(snap)) {
      if (Array.isArray(v.value)) {
        state[k] = [...v.value];
      } else if (v.value && typeof v.value === 'object') {
        try {
          state[k] = JSON.stringify(this.safeSnapshotValue(v.value));
        } catch(_) {
          state[k] = String(v.value);
        }
      } else {
        state[k] = v.value;
      }
    }
    return state;
  }

  findChanged(before, after) {
    const changed = [];
    for (const [k,v] of Object.entries(after)) {
      const bv = before[k];
      if (bv !== v) changed.push({ name:k, from:bv, to:v });
    }
    return changed;
  }

  // ── Explanation builder ───────────────────────────────────────
  makeExplanation(type, ctx={}) {
    switch(type) {
      case 'decl': {
        const valStr = Array.isArray(ctx.value) ? `[${ctx.value.join(', ')}]` : String(ctx.value);
        return { type:'declaration', title:'Variable declared', text:`${ctx.name} = ${valStr}`, name:ctx.name, value:ctx.value };
      }
      case 'expr': {
        if (ctx.changed?.length > 0) {
          const c = ctx.changed[0];
          const fromStr = Array.isArray(c.from) ? `[${c.from?.join?.(',')}]` : String(c.from);
          const toStr   = Array.isArray(c.to)   ? `[${c.to?.join?.(',')}]`   : String(c.to);
          return { type:'assignment', title:'Value changed', text:`${c.name}: ${fromStr} → ${toStr}`, changes: ctx.changed };
        }
        return { type:'expression', title:'Expression evaluated', text:'Statement executed' };
      }
      case 'condition_if': {
        const res = ctx.result;
        return { type:'condition', title: res ? 'Condition: TRUE' : 'Condition: FALSE',
          expression:ctx.expression, expanded:ctx.expanded, result:res,
          text:`${ctx.expression}\n= ${ctx.expanded}\n→ ${res}` };
      }
      case 'for_each': {
        return {
          type: 'loop_iteration',
          title: `For-each: ${ctx.varName} = ${ctx.item}`,
          text: `Iterating over ${ctx.iterableName}, current item is ${ctx.item}`
        };
      }
      case 'condition_while': case 'condition_for': {
        const res = ctx.result;
        return { type:'loop_condition', title: res ? 'Loop continues' : 'Loop ends',
          expression:ctx.expression, expanded:ctx.expanded, result:res,
          text:`${ctx.expression} = ${ctx.expanded} → ${res ? 'continue' : 'exit loop'}` };
      }
      case 'return': {
        const valStr = Array.isArray(ctx.value) ? `[${ctx.value.join(', ')}]` : String(ctx.value);
        return { type:'return', title:'Method returned', text:`return ${valStr}`, value:ctx.value };
      }
      case 'call': return { type:'call', title:`Calling ${ctx.name}()`, text:`Entering method ${ctx.name}`, name:ctx.name };
      case 'output': return { type:'output', title:'Output', text:`println: ${ctx.value}`, value:ctx.value };
      case 'done': {
        const valStr = Array.isArray(ctx.returnValue) ? `[${ctx.returnValue?.join?.(', ')}]` : String(ctx.returnValue ?? '');
        return { type:'done', title:'Execution complete', text:`Result: ${valStr}`, value:ctx.returnValue };
      }
      default: return { type, title:type, text:'' };
    }
  }

  // ── AST → source string helpers ──────────────────────────────
  astToSource(node) {
    if (!node) return '';
    switch(node.kind) {
      case 'Literal': return String(node.value);
      case 'Identifier': return node.name;
      case 'BinOp': return `${this.astToSource(node.left)} ${this.opToStr(node.op)} ${this.astToSource(node.right)}`;
      case 'Unary': return `${node.op}${this.astToSource(node.operand)}`;
      case 'PostInc': return `${this.astToSource(node.operand)}++`;
      case 'PostDec': return `${this.astToSource(node.operand)}--`;
      case 'ArrayAccess': return `${this.astToSource(node.object)}[${this.astToSource(node.index)}]`;
      case 'MemberAccess': return `${this.astToSource(node.object)}.${node.member}`;
      case 'MethodCall': return `${this.astToSource(node.object)}.${node.method}(...)`;
      default: return '?';
    }
  }

  nodeToString(node, env) {
    // Evaluate and stringify for display
    try {
      const val = this.evalExpr(node, env);
      return String(val);
    } catch(_) { return '?'; }
  }

  opToStr(op) {
    const m = {PLUS:'+',MINUS:'-',STAR:'*',SLASH:'/',PERCENT:'%',EQ:'==',NEQ:'!=',LT:'<',GT:'>',LTE:'<=',GTE:'>=',AND:'&&',OR:'||',SHIFT_LEFT:'<<',SHIFT_RIGHT:'>>',UNSIGNED_SHIFT_RIGHT:'>>>'};
    return m[op] ?? op;
  }
}

export function runJava(src, rawInputs={}) {
  const inputs = typeof rawInputs === "string" ? parseInputString(rawInputs) : (rawInputs || {});
  const interp = new Interpreter();
  return interp.run(src, inputs);
}
