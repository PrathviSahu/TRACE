
// ─────────────────────────────────────────────────────────────
//  TRACE — Java Lexer
//  Tokenises a subset of Java sufficient for LeetCode problems
// ─────────────────────────────────────────────────────────────

export const T = {
  // primitives / types
  INT:'INT', BOOLEAN:'BOOLEAN', STRING_KW:'STRING_KW', CHAR:'CHAR',
  DOUBLE:'DOUBLE', LONG:'LONG', FLOAT:'FLOAT', VOID:'VOID',
  // structure
  CLASS:'CLASS', PUBLIC:'PUBLIC', PRIVATE:'PRIVATE', PROTECTED:'PROTECTED',
  STATIC:'STATIC', FINAL:'FINAL',
  // control
  IF:'IF', ELSE:'ELSE', WHILE:'WHILE', FOR:'FOR', DO:'DO',
  RETURN:'RETURN', BREAK:'BREAK', CONTINUE:'CONTINUE',
  // values
  NEW:'NEW', NULL:'NULL', TRUE:'TRUE', FALSE:'FALSE',
  // compound ops
  PLUS_PLUS:'PLUS_PLUS', MINUS_MINUS:'MINUS_MINUS',
  PLUS_ASSIGN:'PLUS_ASSIGN', MINUS_ASSIGN:'MINUS_ASSIGN',
  STAR_ASSIGN:'STAR_ASSIGN', SLASH_ASSIGN:'SLASH_ASSIGN', PERCENT_ASSIGN:'PERCENT_ASSIGN',
  AND_ASSIGN:'AND_ASSIGN', OR_ASSIGN:'OR_ASSIGN',
  // comparisons
  EQ:'EQ', NEQ:'NEQ', LTE:'LTE', GTE:'GTE', LT:'LT', GT:'GT',
  AND:'AND', OR:'OR', NOT:'NOT',
  // bitwise ops
  CARET:'CARET', AMP:'AMP', PIPE:'PIPE', TILDE:'TILDE',
  // single-char ops
  ASSIGN:'ASSIGN', PLUS:'PLUS', MINUS:'MINUS', STAR:'STAR',
  SLASH:'SLASH', PERCENT:'PERCENT', ARROW:'ARROW',
  // delimiters
  LPAREN:'LPAREN', RPAREN:'RPAREN', LBRACE:'LBRACE', RBRACE:'RBRACE',
  LBRACKET:'LBRACKET', RBRACKET:'RBRACKET',
  SEMICOLON:'SEMICOLON', COMMA:'COMMA', DOT:'DOT', COLON:'COLON',
  QUESTION:'QUESTION', ELLIPSIS:'ELLIPSIS',
  // atoms
  ID:'ID', NUMBER:'NUMBER', STRING_LIT:'STRING_LIT', CHAR_LIT:'CHAR_LIT',
  EOF:'EOF',
};

const KEYWORDS = new Map([
  ['int',T.INT],['boolean',T.BOOLEAN],['String',T.STRING_KW],
  ['char',T.CHAR],['double',T.DOUBLE],['long',T.LONG],['float',T.FLOAT],
  ['void',T.VOID],['class',T.CLASS],['public',T.PUBLIC],['private',T.PRIVATE],
  ['protected',T.PROTECTED],['static',T.STATIC],['final',T.FINAL],
  ['if',T.IF],['else',T.ELSE],['while',T.WHILE],['for',T.FOR],['do',T.DO],
  ['return',T.RETURN],['break',T.BREAK],['continue',T.CONTINUE],
  ['new',T.NEW],['null',T.NULL],['true',T.TRUE],['false',T.FALSE],
]);

export function tokenize(src) {
  const tokens = [];
  let i = 0;
  const lineStarts = [0];
  for (let k = 0; k < src.length; k++) if (src[k] === '\n') lineStarts.push(k + 1);

  function lineOf(pos) {
    let lo = 0, hi = lineStarts.length - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; lineStarts[m] <= pos ? lo = m : hi = m - 1; }
    return lo + 1;
  }

  while (i < src.length) {
    const start = i;
    const ln = lineOf(i);
    let c = src[i];

    // whitespace
    if (/\s/.test(c)) { i++; continue; }

    // single-line comment
    if (c === '/' && src[i+1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    // block comment
    if (c === '/' && src[i+1] === '*') {
      i += 2;
      while (i < src.length - 1 && !(src[i] === '*' && src[i+1] === '/')) i++;
      i += 2;
      continue;
    }
    // string literal
    if (c === '"') {
      i++; let v = '';
      while (i < src.length && src[i] !== '"') {
        if (src[i] === '\\') { i++; v += src[i]; } else v += src[i];
        i++;
      }
      i++;
      tokens.push({ type: T.STRING_LIT, value: v, line: ln });
      continue;
    }
    // char literal
    if (c === "'") {
      i++; let v = '';
      if (src[i] === '\\') { i++; v = src[i]; } else v = src[i];
      i++;
      if (src[i] === "'") i++;
      tokens.push({ type: T.CHAR_LIT, value: v, line: ln });
      continue;
    }
    // numbers
    if (/[0-9]/.test(c)) {
      let n = '';
      while (i < src.length && /[0-9._]/.test(src[i])) n += src[i++];
      if (i < src.length && /[LlFfDd]/.test(src[i])) i++;
      tokens.push({ type: T.NUMBER, value: parseFloat(n.replace(/_/g,'')), line: ln });
      continue;
    }
    // identifiers / keywords
    if (/[a-zA-Z_$]/.test(c)) {
      let id = '';
      while (i < src.length && /[\w$]/.test(src[i])) id += src[i++];
      tokens.push({ type: KEYWORDS.get(id) ?? T.ID, value: id, line: ln });
      continue;
    }

    // operators & delimiters
    i++;
    switch (c) {
      case '+': if (src[i]==='+'){tokens.push({type:T.PLUS_PLUS,line:ln});i++;}
               else if(src[i]==='='){tokens.push({type:T.PLUS_ASSIGN,line:ln});i++;}
               else tokens.push({type:T.PLUS,line:ln}); break;
      case '-': if (src[i]==='-'){tokens.push({type:T.MINUS_MINUS,line:ln});i++;}
               else if(src[i]==='>'){tokens.push({type:T.ARROW,line:ln});i++;}
               else if(src[i]==='='){tokens.push({type:T.MINUS_ASSIGN,line:ln});i++;}
               else tokens.push({type:T.MINUS,line:ln}); break;
      case '*': src[i]==='='?(tokens.push({type:T.STAR_ASSIGN,line:ln}),i++):tokens.push({type:T.STAR,line:ln}); break;
      case '/': src[i]==='='?(tokens.push({type:T.SLASH_ASSIGN,line:ln}),i++):tokens.push({type:T.SLASH,line:ln}); break;
      case '%': src[i]==='='?(tokens.push({type:T.PERCENT_ASSIGN,line:ln}),i++):tokens.push({type:T.PERCENT,line:ln}); break;
      case '=': src[i]==='='?(tokens.push({type:T.EQ,line:ln}),i++):tokens.push({type:T.ASSIGN,line:ln}); break;
      case '!': src[i]==='='?(tokens.push({type:T.NEQ,line:ln}),i++):tokens.push({type:T.NOT,line:ln}); break;
      case '<': src[i]==='='?(tokens.push({type:T.LTE,line:ln}),i++):tokens.push({type:T.LT,line:ln}); break;
      case '>': src[i]==='='?(tokens.push({type:T.GTE,line:ln}),i++):tokens.push({type:T.GT,line:ln}); break;
      case '^': tokens.push({type:T.CARET,line:ln}); break;
      case '~': tokens.push({type:T.TILDE,line:ln}); break;
      case '&': src[i]==='&'?(tokens.push({type:T.AND,line:ln}),i++):(src[i]==='='?(tokens.push({type:T.AND_ASSIGN,line:ln}),i++):tokens.push({type:T.AMP,line:ln})); break;
      case '|': src[i]==='|'?(tokens.push({type:T.OR,line:ln}),i++):(src[i]==='='?(tokens.push({type:T.OR_ASSIGN,line:ln}),i++):tokens.push({type:T.PIPE,line:ln})); break;
      case '?': tokens.push({type:T.QUESTION,line:ln}); break;
      case ':': tokens.push({type:T.COLON,line:ln}); break;
      case '(': tokens.push({type:T.LPAREN,line:ln}); break;
      case ')': tokens.push({type:T.RPAREN,line:ln}); break;
      case '{': tokens.push({type:T.LBRACE,line:ln}); break;
      case '}': tokens.push({type:T.RBRACE,line:ln}); break;
      case '[': tokens.push({type:T.LBRACKET,line:ln}); break;
      case ']': tokens.push({type:T.RBRACKET,line:ln}); break;
      case ';': tokens.push({type:T.SEMICOLON,line:ln}); break;
      case ',': tokens.push({type:T.COMMA,line:ln}); break;
      case '.':
        if (src[i]==='.' && src[i+1]==='.') { tokens.push({type:T.ELLIPSIS,line:ln}); i+=2; }
        else tokens.push({type:T.DOT,line:ln});
        break;
      default: break; // skip unknown chars
    }
  }
  tokens.push({ type: T.EOF, line: lineOf(src.length) });
  return tokens;
}
