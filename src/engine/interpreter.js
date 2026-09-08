
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
    this.srcLines = [];
    this.prevVars = {};
  }

  run(src, inputs={}) {
    this.trace    = [];
    this.steps    = 0;
    this.depth    = 0;
    this.outputs  = [];
    this.methods  = new Map();
    this.srcLines = src.split('\n');

    const ast  = parse(src);
    const genv = new Env();

    // Collect method declarations
    for (const node of ast.body) {
      if (node.kind === 'MethodDecl') this.methods.set(node.name, node);
    }

    // Find and call main method (first public method)
    const mainM = this.findMainMethod(ast);
    if (!mainM) throw new Error('No method found. Paste a complete Java class or method.');

    // Build argument list from inputs
    const args = this.buildArgs(mainM, inputs);
    this.callStack = [mainM.name + '(' + mainM.params.map(p=>p.name).join(', ') + ')'];

    let retVal;
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

    // Final step
    this.emit(this.srcLines.length, 'done', {
      explanation: { type:'done', returnValue: retVal },
      returnValue: retVal,
    }, genv);

    return { trace: this.trace, output: this.outputs, returnValue: retVal };
  }

  findMainMethod(ast) {
    // prefer the first non-void public method
    for (const n of ast.body) if (n.kind==='MethodDecl') return n;
    return null;
  }

  buildArgs(method, inputs) {
    return method.params.map((p,i) => {
      const raw = inputs[p.name] ?? inputs[i];
      if (raw === undefined) return p.ptype?.isArray ? [] : 0;
      return this.parseInput(raw, p.ptype);
    });
  }

  parseInput(raw, ptype) {
    if (typeof raw !== 'string') return raw;
    raw = raw.trim();
    if (ptype?.isArray) {
      // [1,2,3] or 1,2,3
      const inner = raw.startsWith('[') ? raw.slice(1,-1) : raw;
      return inner.split(',').map(s => {
        const n = s.trim();
        if (n === 'true') return true;
        if (n === 'false') return false;
        const num = Number(n);
        return isNaN(num) ? n.replace(/^"|"$/g,'') : num;
      });
    }
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    const n = Number(raw);
    return isNaN(n) ? raw.replace(/^"|"$/g,'') : n;
  }

  // ── Snapshot helpers ─────────────────────────────────────────
  snapshotVars(env) {
    const snap = env.snapshot();
    const vars = {};
    const arrays = {};
    const collections = {};
    for (const [k,v] of Object.entries(snap)) {
      if (v.isArray && Array.isArray(v.value)) {
        arrays[k] = { values: [...v.value], type: v.type };
      } else if (v.value && typeof v.value === 'object' && v.value.__type) {
        collections[k] = { ...v.value };
      } else {
        vars[k] = { value: v.value, type: v.type };
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

    this.trace.push({
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
    });
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
      case 'ReturnStmt':return this.execReturn(node, env);
      case 'Break':     throw new BreakSignal();
      case 'Continue':  throw new ContinueSignal();
      default: break;
    }
  }

  execVarDecl(node, env) {
    for (const decl of node.decls) {
      let val = decl.init ? this.evalExpr(decl.init, env) : (decl.isArray ? [] : 0);
      const isArr = decl.isArray || Array.isArray(val);
      const isCol = val && typeof val === 'object' && val.__type;
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
      case 'Cast': return this.evalCast(node, env);
      default: return null;
    }
  }

  evalId(node, env) {
    try { return env.get(node.name).value; }
    catch(_) { return undefined; }
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
      default: return null;
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
        case 'SLASH_ASSIGN':   rval = rval===0 ? 0 : Math.trunc(cur/rval); break;
        case 'PERCENT_ASSIGN': rval = cur%rval; break;
        case 'AND_ASSIGN':     rval = cur & rval; break;
        case 'OR_ASSIGN':      rval = cur | rval; break;
      }
    }
    this.assignTo(node.left, rval, env);
    return rval;
  }

  assignTo(target, value, env) {
    if (target.kind === 'Identifier') {
      if (env.has(target.name)) env.set(target.name, value);
      else env.define(target.name, value);
    } else if (target.kind === 'ArrayAccess') {
      const arr = this.evalExpr(target.object, env);
      const idx = this.evalExpr(target.index, env);
      if (Array.isArray(arr)) arr[idx] = value;
    } else if (target.kind === 'MemberAccess') {
      // collection set operations handled in method calls
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
    // Integer.MAX_VALUE / MIN_VALUE
    if (node.object.kind==='Identifier') {
      const objName = node.object.name;
      if (objName==='Integer') {
        if (node.member==='MAX_VALUE') return 2147483647;
        if (node.member==='MIN_VALUE') return -2147483648;
      }
      if (objName==='Long') {
        if (node.member==='MAX_VALUE') return 9007199254740991;
        if (node.member==='MIN_VALUE') return -9007199254740991;
      }
      // array.length
      try {
        const obj = env.get(objName).value;
        if (node.member==='length') {
          if (Array.isArray(obj)) return obj.length;
          if (typeof obj==='string') return obj.length;
          if (obj && typeof obj==='object' && obj.__type) return obj.size ?? 0;
        }
        if (obj && typeof obj==='object' && obj.__type) return this.collectionGet(obj, node.member);
      } catch(_){}
    }
    const obj = this.evalExpr(node.object, env);
    if (node.member==='length') {
      if (Array.isArray(obj)) return obj.length;
      if (typeof obj==='string') return obj.length;
    }
    return null;
  }

  evalMethodCall(node, env) {
    // System.out.println / print
    if (node.object?.kind==='MemberAccess' && node.object.object?.kind==='Identifier') {
      const cls = node.object.object.name;
      const mid = node.object.member;
      if (cls==='System' && (mid==='out') && (node.method==='println'||node.method==='print')) {
        const arg = node.args[0] ? this.evalExpr(node.args[0], env) : '';
        const line = String(arg);
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
    if (this.methods.has(node.name))
      return this.callUserMethod(node.name, node.args.map(a=>this.evalExpr(a,env)), env, node.line);
    return null;
  }

  callUserMethod(name, argVals, callerEnv, line) {
    if (this.depth >= MAX_DEPTH) throw new Error(`StackOverflowError: recursion too deep`);
    const method = this.methods.get(name);
    const env = new Env();
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

  evalObjectCreate(node, env) {
    const args = node.args.map(a=>this.evalExpr(a,env));
    const cls = node.className;
    // Collections
    if (cls==='ArrayList' || cls==='LinkedList' || cls==='Vector')
      return { __type:'ArrayList', items:[], name:cls };
    if (cls==='Stack')
      return { __type:'Stack', items:[] };
    if (cls==='Queue' || cls==='ArrayDeque' || cls==='PriorityQueue' || cls==='LinkedList')
      return { __type:'Queue', items:[], name:cls };
    if (cls==='HashMap' || cls==='TreeMap' || cls==='LinkedHashMap')
      return { __type:'HashMap', entries:new Map(), name:cls };
    if (cls==='HashSet' || cls==='TreeSet' || cls==='LinkedHashSet')
      return { __type:'HashSet', items:new Set(), name:cls };
    if (cls==='StringBuilder' || cls==='StringBuffer')
      return { __type:'StringBuilder', value:'' };
    // Default: plain object
    return { __type:cls, args };
  }

  callCollectionMethod(obj, method, args, line, env) {
    switch(obj.__type) {
      case 'ArrayList': return this.arrayListMethod(obj, method, args);
      case 'Stack':     return this.stackMethod(obj, method, args, line, env);
      case 'Queue':     return this.queueMethod(obj, method, args, line, env);
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
    switch(method) {
      case 'put':         { obj.entries.set(args[0], args[1]); return args[1]; }
      case 'get':         return obj.entries.get(args[0]) ?? null;
      case 'getOrDefault': return obj.entries.has(args[0]) ? obj.entries.get(args[0]) : args[1];
      case 'containsKey': return obj.entries.has(args[0]);
      case 'containsValue': return [...obj.entries.values()].includes(args[0]);
      case 'remove':      { const v=obj.entries.get(args[0]); obj.entries.delete(args[0]); return v; }
      case 'size':        return obj.entries.size;
      case 'isEmpty':     return obj.entries.size===0;
      case 'keySet':      return { __type:'ArrayList', items:[...obj.entries.keys()] };
      case 'values':      return { __type:'ArrayList', items:[...obj.entries.values()] };
      case 'entrySet':    return { __type:'ArrayList', items:[...obj.entries.entries()].map(([k,v])=>({k,v})) };
      case 'clear':       obj.entries.clear(); return null;
      case 'merge':       {
        const existing = obj.entries.get(args[0]);
        const newVal = existing===undefined ? args[1] : args[1]+existing;
        obj.entries.set(args[0], newVal); return newVal;
      }
      case 'forEach': return null;
    }
    return null;
  }

  hashSetMethod(obj, method, args) {
    switch(method) {
      case 'add':      obj.items.add(args[0]); return !obj.items.has(args[0]);
      case 'remove':   return obj.items.delete(args[0]);
      case 'contains': return obj.items.has(args[0]);
      case 'size':     return obj.items.size;
      case 'isEmpty':  return obj.items.size===0;
      case 'clear':    obj.items.clear(); return null;
    }
    return null;
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
      if (Array.isArray(v.value)) state[k] = [...v.value];
      else if (v.value && typeof v.value==='object' && v.value.__type) state[k] = JSON.stringify(v.value);
      else state[k] = v.value;
    }
    return state;
  }

  findChanged(before, after) {
    const changed = [];
    for (const [k,v] of Object.entries(after)) {
      const bv = before[k];
      if (JSON.stringify(bv) !== JSON.stringify(v)) changed.push({ name:k, from:bv, to:v });
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
    const m = {PLUS:'+',MINUS:'-',STAR:'*',SLASH:'/',PERCENT:'%',EQ:'==',NEQ:'!=',LT:'<',GT:'>',LTE:'<=',GTE:'>=',AND:'&&',OR:'||'};
    return m[op] ?? op;
  }
}

export function runJava(src, inputs={}) {
  const interp = new Interpreter();
  return interp.run(src, inputs);
}
