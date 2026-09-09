
// ─────────────────────────────────────────────────────────────
//  TRACE — Java Parser  (recursive-descent, LeetCode subset)
// ─────────────────────────────────────────────────────────────
import { T, tokenize } from './lexer.js';

const PRIM_TYPES = new Set([T.INT,T.BOOLEAN,T.STRING_KW,T.CHAR,T.DOUBLE,T.LONG,T.FLOAT,T.VOID]);
const MOD_KW    = new Set([T.PUBLIC,T.PRIVATE,T.PROTECTED,T.STATIC,T.FINAL]);

class Parser {
  constructor(tokens) {
    this.tok = tokens;
    this.p   = 0;
  }
  peek(off=0)  { return this.tok[Math.min(this.p+off, this.tok.length-1)]; }
  cur()        { return this.tok[this.p]; }
  advance()    { const t = this.tok[this.p]; if (t.type !== T.EOF) this.p++; return t; }
  check(type)  { return this.cur().type === type; }
  checkAny(...types) { return types.includes(this.cur().type); }
  match(...types) {
    for (const t of types) if (this.check(t)) { this.advance(); return true; }
    return false;
  }
  expect(type, msg) {
    if (!this.check(type)) throw new Error(`Line ${this.cur().line}: expected ${msg ?? type}, got '${this.cur().value ?? this.cur().type}'`);
    return this.advance();
  }
  ln() { return this.cur().line; }

  // ── Top level ────────────────────────────────────────────────
  parse() {
    const prog = { kind:'Program', body:[], line:1 };
    while (!this.check(T.EOF)) {
      while (MOD_KW.has(this.cur().type)) this.advance();
      if (this.check(T.EOF)) break;

      if (this.check(T.CLASS)) {
        prog.body.push(this.parseClassDecl());
      } else {
        prog.body.push(this.parseTopLevelItem());
      }
    }
    return prog;
  }

  parseClassDecl() {
    const ln = this.ln();
    this.advance(); // class
    const className = this.expect(T.ID, 'class name').value;
    // skip extends/implements clauses until class body
    while (!this.check(T.LBRACE) && !this.check(T.EOF)) {
      this.advance();
    }
    this.expect(T.LBRACE, '{');
    const fields = [];
    const constructors = [];
    const methods = [];
    while (!this.check(T.EOF) && !this.check(T.RBRACE)) {
      while (MOD_KW.has(this.cur().type)) this.advance();
      if (this.check(T.RBRACE) || this.check(T.EOF)) break;
      const member = this.parseMethodOrField(className);
      if (!member) continue;
      if (member.kind === 'VarDecl') fields.push(member);
      else if (member.kind === 'ConstructorDecl') constructors.push(member);
      else if (member.kind === 'MethodDecl') methods.push(member);
      else methods.push(member);
    }
    if (this.check(T.RBRACE)) this.advance();
    return { kind:'ClassDecl', name:className, fields, constructors, methods, line:ln };
  }

  parseTopLevelItem() {
    const ln = this.ln();
    while (MOD_KW.has(this.cur().type)) this.advance();
    const savedP = this.p;
    const typeExpr = this.parseTypeExpr();
    if (typeExpr && this.check(T.ID) && this.peek(1).type === T.LPAREN) {
      const name = this.advance().value;
      this.advance(); // ('(')
      const params = this.parseParams();
      this.expect(T.RPAREN, ')');
      const body = this.parseBlock();
      return { kind:'MethodDecl', name, params, retType:typeExpr, body, line:ln };
    }
    this.p = savedP;
    return this.parseStatement();
  }

  parseMethodOrField(enclosingClassName) {
    const ln = this.ln();
    while (MOD_KW.has(this.cur().type)) this.advance();
    // return type or constructor name
    const retType = this.parseTypeExpr();
    if (!retType) return this.parseStatement();

    // Check if constructor: ClassName(...) { ... }
    if (this.check(T.LPAREN)) {
      this.advance();
      const params = this.parseParams();
      this.expect(T.RPAREN, ')');
      const body = this.parseBlock();
      return { kind:'ConstructorDecl', name:retType.base, params, body, line:ln };
    }

    const name = this.expect(T.ID, 'method or field name').value;
    if (this.check(T.LPAREN)) {
      // method declaration
      this.advance();
      const params = this.parseParams();
      this.expect(T.RPAREN, ')');
      const body = this.parseBlock();
      return { kind:'MethodDecl', name, params, retType, body, line:ln };
    }
    // field — treat as var decl
    this.p -= 1; // back up to name
    return this.parseVarDecl(retType, ln);
  }

  parseParams() {
    const params = [];
    if (this.check(T.RPAREN)) return params;
    do {
      const t = this.parseTypeExpr();
      const n = this.expect(T.ID,'param name').value;
      params.push({ kind:'Param', ptype:t, name:n });
    } while (this.match(T.COMMA));
    return params;
  }

  // ── Type expressions ────────────────────────────────────────
  parseTypeExpr() {
    if (!PRIM_TYPES.has(this.cur().type) && this.cur().type !== T.ID) return null;
    const base = this.advance();
    let typeStr = base.value;
    // generics  <Integer, Integer>
    if (this.check(T.LT)) {
      let depth = 0;
      while (!this.check(T.EOF)) {
        const t = this.cur().type;
        if (t === T.LT) depth++;
        else if (t === T.GT) { depth--; if (depth <= 0) { this.advance(); break; } }
        else if (t === T.SHIFT_RIGHT) { depth -= 2; if (depth <= 0) { this.advance(); break; } }
        else if (t === T.UNSIGNED_SHIFT_RIGHT) { depth -= 3; if (depth <= 0) { this.advance(); break; } }
        this.advance();
      }
    }
    // array brackets
    let isArray = false;
    while (this.check(T.LBRACKET) && this.peek(1).type === T.RBRACKET) {
      this.advance(); this.advance(); isArray = true;
    }
    return { base: typeStr, isArray };
  }

  // ── Statements ───────────────────────────────────────────────
  parseBlock() {
    const ln = this.ln();
    this.expect(T.LBRACE,'{');
    const stmts = [];
    while (!this.check(T.RBRACE) && !this.check(T.EOF))
      stmts.push(this.parseStatement());
    this.expect(T.RBRACE,'}');
    return { kind:'Block', body:stmts, line:ln };
  }

  parseStatement() {
    const ln = this.ln();
    // if
    if (this.check(T.IF))       return this.parseIf();
    // while
    if (this.check(T.WHILE))    return this.parseWhile();
    // for
    if (this.check(T.FOR))      return this.parseFor();
    // do-while
    if (this.check(T.DO))       return this.parseDoWhile();
    // return
    if (this.check(T.RETURN))   return this.parseReturn();
    // break/continue
    if (this.check(T.BREAK))    { this.advance(); this.match(T.SEMICOLON); return {kind:'Break',line:ln}; }
    if (this.check(T.CONTINUE)) { this.advance(); this.match(T.SEMICOLON); return {kind:'Continue',line:ln}; }
    // block
    if (this.check(T.LBRACE))   return this.parseBlock();
    // loose semicolon
    if (this.check(T.SEMICOLON)){ this.advance(); return {kind:'EmptyStmt',line:ln}; }
    // variable declaration?
    if (this.isVarDecl())       return this.parseVarDeclStatement();
    // expression statement
    return this.parseExprStatement();
  }

  isVarDecl() {
    if (PRIM_TYPES.has(this.cur().type) && this.cur().type !== T.VOID) return true;
    // ClassName varName — two consecutive identifiers
    if (this.cur().type === T.ID && this.peek(1).type === T.ID) return true;
    // ClassName<...> varName
    if (this.cur().type === T.ID && this.peek(1).type === T.LT) return true;
    return false;
  }

  parseVarDeclStatement() {
    const ln = this.ln();
    const typeExpr = this.parseTypeExpr();
    return this.parseVarDecl(typeExpr, ln);
  }

  parseVarDecl(typeExpr, ln) {
    const decls = [];
    do {
      const name = this.expect(T.ID,'variable name').value;
      // optional [] after name
      let isArr = typeExpr?.isArray ?? false;
      while (this.check(T.LBRACKET) && this.peek(1).type === T.RBRACKET) {
        this.advance(); this.advance(); isArr = true;
      }
      let init = null;
      if (this.match(T.ASSIGN)) init = this.parseExpr();
      decls.push({ name, init, isArray: isArr });
    } while (this.match(T.COMMA));
    this.match(T.SEMICOLON);
    return { kind:'VarDecl', typeExpr, decls, line:ln };
  }

  parseIf() {
    const ln = this.ln();
    this.advance(); // if
    this.expect(T.LPAREN,'(');
    const test = this.parseExpr();
    this.expect(T.RPAREN,')');
    const consequent = this.parseBodyStmt();
    let alternate = null;
    if (this.check(T.ELSE)) {
      this.advance();
      alternate = this.parseBodyStmt();
    }
    return { kind:'IfStmt', test, consequent, alternate, line:ln };
  }

  parseBodyStmt() {
    if (this.check(T.LBRACE)) return this.parseBlock();
    return this.parseStatement();
  }

  parseWhile() {
    const ln = this.ln();
    this.advance(); // while
    this.expect(T.LPAREN,'(');
    const test = this.parseExpr();
    this.expect(T.RPAREN,')');
    const body = this.parseBodyStmt();
    return { kind:'WhileStmt', test, body, line:ln };
  }

  parseDoWhile() {
    const ln = this.ln();
    this.advance(); // do
    const body = this.parseBodyStmt();
    this.expect(T.WHILE,'while');
    this.expect(T.LPAREN,'(');
    const test = this.parseExpr();
    this.expect(T.RPAREN,')');
    this.match(T.SEMICOLON);
    return { kind:'DoWhileStmt', test, body, line:ln };
  }

  parseFor() {
    const ln = this.ln();
    this.advance(); // for
    this.expect(T.LPAREN, '(');

    // Enhanced for-each loop: for (Type varName : iterable)
    if (this.isVarDecl()) {
      const savedP = this.p;
      try {
        const typeExpr = this.parseTypeExpr();
        if (this.check(T.ID)) {
          const varName = this.advance().value;
          if (this.match(T.COLON)) {
            const iterable = this.parseExpr();
            this.expect(T.RPAREN, ')');
            const body = this.parseBodyStmt();
            return { kind: 'ForEachStmt', typeExpr, varName, iterable, body, line: ln };
          }
        }
      } catch (_) {}
      this.p = savedP;
    }

    // init
    let init = null;
    if (!this.check(T.SEMICOLON)) {
      if (this.isVarDecl()) init = this.parseVarDeclStatement();
      else init = this.parseExprStatement();
    } else this.advance();
    // condition
    let test = null;
    if (!this.check(T.SEMICOLON)) test = this.parseExpr();
    this.expect(T.SEMICOLON,';');
    // update
    const updates = [];
    while (!this.check(T.RPAREN) && !this.check(T.EOF))
      updates.push(this.parseExpr()), this.match(T.COMMA);
    this.expect(T.RPAREN,')');
    const body = this.parseBodyStmt();
    return { kind:'ForStmt', init, test, updates, body, line:ln };
  }

  parseReturn() {
    const ln = this.ln();
    this.advance(); // return
    let val = null;
    if (!this.check(T.SEMICOLON) && !this.check(T.RBRACE)) val = this.parseExpr();
    this.match(T.SEMICOLON);
    return { kind:'ReturnStmt', value:val, line:ln };
  }

  parseExprStatement() {
    const ln = this.ln();
    const expr = this.parseExpr();
    this.match(T.SEMICOLON);
    return { kind:'ExprStmt', expr, line:ln };
  }

  // ── Expressions ─────────────────────────────────────────────
  parseExpr() { return this.parseAssign(); }

  parseAssign() {
    const ln = this.ln();
    const left = this.parseTernary();
    const ASSIGN_OPS = [T.ASSIGN,T.PLUS_ASSIGN,T.MINUS_ASSIGN,T.STAR_ASSIGN,T.SLASH_ASSIGN,T.PERCENT_ASSIGN,T.AND_ASSIGN,T.OR_ASSIGN,T.SHIFT_LEFT_ASSIGN,T.SHIFT_RIGHT_ASSIGN,T.UNSIGNED_SHIFT_RIGHT_ASSIGN];
    if (ASSIGN_OPS.includes(this.cur().type)) {
      const op = this.advance().type;
      const right = this.parseAssign();
      return { kind:'Assign', op, left, right, line:ln };
    }
    return left;
  }

  parseTernary() {
    const ln = this.ln();
    const cond = this.parseOr();
    if (this.match(T.QUESTION)) {
      const then = this.parseExpr();
      this.expect(T.COLON,':');
      const else_ = this.parseTernary();
      return { kind:'Ternary', cond, then, else:else_, line:ln };
    }
    return cond;
  }

  parseOr()  { return this.parseBinary([T.OR],  () => this.parseAnd()); }
  parseAnd() { return this.parseBinary([T.AND], () => this.parseBitwiseOr()); }
  parseBitwiseOr()  { return this.parseBinary([T.PIPE],  () => this.parseBitwiseXor()); }
  parseBitwiseXor() { return this.parseBinary([T.CARET], () => this.parseBitwiseAnd()); }
  parseBitwiseAnd() { return this.parseBinary([T.AMP],   () => this.parseEq()); }
  parseEq()  { return this.parseBinary([T.EQ,T.NEQ], () => this.parseRel()); }
  parseRel() { return this.parseBinary([T.LT,T.GT,T.LTE,T.GTE], () => this.parseShift()); }
  parseShift() { return this.parseBinary([T.SHIFT_LEFT,T.SHIFT_RIGHT,T.UNSIGNED_SHIFT_RIGHT], () => this.parseAdd()); }
  parseAdd() { return this.parseBinary([T.PLUS,T.MINUS], () => this.parseMul()); }
  parseMul() { return this.parseBinary([T.STAR,T.SLASH,T.PERCENT], () => this.parseUnary()); }

  parseBinary(ops, child) {
    const ln = this.ln();
    let left = child();
    while (ops.includes(this.cur().type)) {
      const op = this.advance().type;
      const right = child();
      left = { kind:'BinOp', op, left, right, line:ln };
    }
    return left;
  }

  parseUnary() {
    const ln = this.ln();
    if (this.check(T.NOT))   { this.advance(); return { kind:'Unary', op:'!', operand:this.parseUnary(), line:ln }; }
    if (this.check(T.TILDE)) { this.advance(); return { kind:'Unary', op:'~', operand:this.parseUnary(), line:ln }; }
    if (this.check(T.MINUS)) { this.advance(); return { kind:'Unary', op:'-', operand:this.parseUnary(), line:ln }; }
    if (this.check(T.PLUS))  { this.advance(); return { kind:'Unary', op:'+', operand:this.parseUnary(), line:ln }; }
    if (this.check(T.PLUS_PLUS))  { this.advance(); return { kind:'PreInc', op:'++', operand:this.parsePostfix(), line:ln }; }
    if (this.check(T.MINUS_MINUS)){ this.advance(); return { kind:'PreDec', op:'--', operand:this.parsePostfix(), line:ln }; }
    // cast: (int) expr
    if (this.check(T.LPAREN) && PRIM_TYPES.has(this.peek(1).type) && this.peek(2).type === T.RPAREN) {
      this.advance(); const castType = this.advance().value; this.advance();
      return { kind:'Cast', castType, operand:this.parseUnary(), line:ln };
    }
    return this.parsePostfix();
  }

  parsePostfix() {
    let node = this.parsePrimary();
    const ln = this.ln();
    while (true) {
      if (this.check(T.PLUS_PLUS))  { this.advance(); node = { kind:'PostInc', operand:node, line:ln }; }
      else if (this.check(T.MINUS_MINUS)){ this.advance(); node = { kind:'PostDec', operand:node, line:ln }; }
      else if (this.check(T.LBRACKET)) {
        this.advance();
        const idx = this.parseExpr();
        this.expect(T.RBRACKET,']');
        node = { kind:'ArrayAccess', object:node, index:idx, line:ln };
      }
      else if (this.check(T.DOT)) {
        this.advance();
        const member = this.expect(T.ID,'member name').value;
        if (this.check(T.LPAREN)) {
          this.advance();
          const args = this.parseArgList();
          this.expect(T.RPAREN,')');
          node = { kind:'MethodCall', object:node, method:member, args, line:ln };
        } else {
          node = { kind:'MemberAccess', object:node, member, line:ln };
        }
      }
      else if (this.check(T.LPAREN) && node.kind==='Identifier') {
        this.advance();
        const args = this.parseArgList();
        this.expect(T.RPAREN,')');
        node = { kind:'FuncCall', name:node.name, args, line:ln };
      }
      else break;
    }
    return node;
  }

  parsePrimary() {
    const ln = this.ln();
    const t = this.cur();

    if (t.type === T.NUMBER)     { this.advance(); return { kind:'Literal', vtype:'number', value:t.value, line:ln }; }
    if (t.type === T.STRING_LIT) { this.advance(); return { kind:'Literal', vtype:'string', value:t.value, line:ln }; }
    if (t.type === T.CHAR_LIT)   { this.advance(); return { kind:'Literal', vtype:'char', value:t.value, line:ln }; }
    if (t.type === T.TRUE)       { this.advance(); return { kind:'Literal', vtype:'boolean', value:true, line:ln }; }
    if (t.type === T.FALSE)      { this.advance(); return { kind:'Literal', vtype:'boolean', value:false, line:ln }; }
    if (t.type === T.NULL)       { this.advance(); return { kind:'Literal', vtype:'null', value:null, line:ln }; }

    if (t.type === T.ID)         { this.advance(); return { kind:'Identifier', name:t.value, line:ln }; }

    // ( expr ) or lambda: (a, b) -> expr or () -> expr
    if (t.type === T.LPAREN) {
      let isLambda = false;
      let lambdaParams = [];
      if (this.tok[this.p + 1]?.type === T.RPAREN && this.tok[this.p + 2]?.type === T.ARROW) {
        isLambda = true;
      } else {
        const candidateParams = [];
        let valid = true;
        let curr = this.p + 1;
        while (curr < this.tok.length && this.tok[curr].type !== T.RPAREN) {
          if (this.tok[curr].type === T.ID) {
            candidateParams.push(this.tok[curr].value);
            curr++;
            if (this.tok[curr]?.type === T.COMMA) {
              curr++;
            } else if (this.tok[curr]?.type !== T.RPAREN) {
              valid = false;
              break;
            }
          } else {
            valid = false;
            break;
          }
        }
        if (valid && candidateParams.length > 0 && this.tok[curr]?.type === T.RPAREN && this.tok[curr + 1]?.type === T.ARROW) {
          isLambda = true;
          lambdaParams = candidateParams;
        }
      }

      if (isLambda) {
        this.advance(); // consume LPAREN
        while (!this.check(T.RPAREN)) this.advance();
        this.expect(T.RPAREN, ')');
        this.expect(T.ARROW, '->');
        const body = this.parseExpr();
        return { kind: 'Lambda', params: lambdaParams, body, line: ln };
      }

      this.advance();
      const e = this.parseExpr();
      this.expect(T.RPAREN,')');
      return e;
    }

    // new array / object
    if (t.type === T.NEW) {
      this.advance();
      const typeTok = this.advance();
      const typeName = typeTok.value;
      // skip generics
      if (this.check(T.LT)) {
        let d=0;
        while(!this.check(T.EOF)){const x=this.cur().type;if(x===T.LT)d++;else if(x===T.GT){d--;if(d===0){this.advance();break;}}this.advance();}
      }
      if (this.check(T.LBRACKET)) {
        this.advance();
        let size = null;
        if (!this.check(T.RBRACKET)) size = this.parseExpr();
        this.expect(T.RBRACKET,']');
        // {initializer}
        if (this.check(T.LBRACE)) {
          this.advance();
          const items = this.parseArgList();
          this.expect(T.RBRACE,'}');
          return { kind:'ArrayCreate', elType:typeName, size, items, line:ln };
        }
        return { kind:'ArrayCreate', elType:typeName, size, items:[], line:ln };
      }
      // object creation: new ArrayList<>() or new TreeNode(val)
      if (this.check(T.LPAREN)) {
        this.advance();
        const args = this.parseArgList();
        this.expect(T.RPAREN,')');
        return { kind:'ObjectCreate', className:typeName, args, line:ln };
      }
    }

    // {initializer} at top level
    if (t.type === T.LBRACE) {
      this.advance();
      const items = this.parseArgList();
      this.expect(T.RBRACE,'}');
      return { kind:'ArrayLiteral', items, line:ln };
    }

    // unknown — skip and return null literal
    this.advance();
    return { kind:'Literal', vtype:'null', value:null, line:ln };
  }

  parseArgList() {
    const args = [];
    if (this.check(T.RPAREN) || this.check(T.RBRACE)) return args;
    do { args.push(this.parseExpr()); } while (this.match(T.COMMA));
    return args;
  }
}

export function parse(src) {
  const tokens = tokenize(src);
  const parser = new Parser(tokens);
  return parser.parse();
}
