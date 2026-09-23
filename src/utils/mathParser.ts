// Zero-dependency mathematical expression tokenizer, parser, and evaluator for Desmos Engine

export interface EvalContext {
  x: number;
  [variable: string]: number;
}

type TokenType =
  | 'NUMBER'
  | 'IDENTIFIER'
  | 'OPERATOR'
  | 'LPAREN'
  | 'RPAREN'
  | 'COMMA'
  | 'EOF';

interface Token {
  type: TokenType;
  value: string;
}

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
};

const MATH_FUNCTIONS: Record<string, (...args: number[]) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  abs: Math.abs,
  exp: Math.exp,
  ln: Math.log,
  log: (x: number) => Math.log10(x),
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  sign: Math.sign,
};

// Tokenizer with implicit multiplication insertion
export function tokenize(rawInput: string): Token[] {
  const input = rawInput.trim();
  const tokens: Token[] = [];
  let i = 0;

  const isDigit = (c: string) => /[0-9]/.test(c);
  const isAlpha = (c: string) => /[a-zA-Z_]/.test(c);

  while (i < input.length) {
    const c = input[i];

    if (/\s/.test(c)) {
      i++;
      continue;
    }

    if (isDigit(c) || (c === '.' && i + 1 < input.length && isDigit(input[i + 1]))) {
      let num = '';
      while (i < input.length && (isDigit(input[i]) || input[i] === '.')) {
        num += input[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: num });
      continue;
    }

    if (isAlpha(c)) {
      let ident = '';
      while (i < input.length && (isAlpha(input[i]) || isDigit(input[i]))) {
        ident += input[i];
        i++;
      }
      tokens.push({ type: 'IDENTIFIER', value: ident });
      continue;
    }

    if ('+-*/^%'.includes(c)) {
      tokens.push({ type: 'OPERATOR', value: c });
      i++;
      continue;
    }

    if (c === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }

    if (c === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    if (c === ',') {
      tokens.push({ type: 'COMMA', value: ',' });
      i++;
      continue;
    }

    // Skip unknown symbols
    i++;
  }

  // Insert implicit multiplication tokens
  const processed: Token[] = [];
  for (let j = 0; j < tokens.length; j++) {
    const curr = tokens[j];
    processed.push(curr);

    if (j < tokens.length - 1) {
      const next = tokens[j + 1];

      // e.g. 2x, 2(x), )x, )(, x(
      const isCurrMultiplier =
        curr.type === 'NUMBER' ||
        curr.type === 'IDENTIFIER' ||
        curr.type === 'RPAREN';

      const isNextMultiplicand =
        next.type === 'IDENTIFIER' ||
        (next.type === 'NUMBER' && curr.type === 'RPAREN') ||
        next.type === 'LPAREN';

      if (isCurrMultiplier && isNextMultiplicand) {
        // Exception: If curr is a function identifier and next is LPAREN, it's a function call, not multiplication
        const isFunctionCall =
          curr.type === 'IDENTIFIER' &&
          curr.value.toLowerCase() in MATH_FUNCTIONS &&
          next.type === 'LPAREN';

        if (!isFunctionCall) {
          processed.push({ type: 'OPERATOR', value: '*' });
        }
      }
    }
  }

  processed.push({ type: 'EOF', value: '' });
  return processed;
}

// AST Nodes
export type ASTNode =
  | { type: 'Number'; value: number }
  | { type: 'Variable'; name: string }
  | { type: 'UnaryOp'; op: '-' | '+'; expr: ASTNode }
  | { type: 'BinaryOp'; op: '+' | '-' | '*' | '/' | '^' | '%'; left: ASTNode; right: ASTNode }
  | { type: 'FunctionCall'; name: string; args: ASTNode[] };

// Recursive Descent Parser
class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private consume(): Token {
    return this.tokens[this.pos++];
  }

  private match(type: TokenType, value?: string): boolean {
    const token = this.peek();
    if (token.type === type && (value === undefined || token.value === value)) {
      this.consume();
      return true;
    }
    return false;
  }

  parse(): ASTNode {
    const node = this.parseExpression();
    if (this.peek().type !== 'EOF') {
      throw new Error(`Unexpected token: ${this.peek().value}`);
    }
    return node;
  }

  // Precedence level 1: addition and subtraction
  private parseExpression(): ASTNode {
    let left = this.parseTerm();

    while (this.peek().type === 'OPERATOR' && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.consume().value as '+' | '-';
      const right = this.parseTerm();
      left = { type: 'BinaryOp', op, left, right };
    }

    return left;
  }

  // Precedence level 2: multiplication, division, modulo
  private parseTerm(): ASTNode {
    let left = this.parseExponent();

    while (this.peek().type === 'OPERATOR' && (this.peek().value === '*' || this.peek().value === '/' || this.peek().value === '%')) {
      const op = this.consume().value as '*' | '/' | '%';
      const right = this.parseExponent();
      left = { type: 'BinaryOp', op, left, right };
    }

    return left;
  }

  // Precedence level 3: power/exponentiation (right-associative)
  private parseExponent(): ASTNode {
    const left = this.parseUnary();

    if (this.peek().type === 'OPERATOR' && this.peek().value === '^') {
      this.consume();
      const right = this.parseExponent(); // right recursion
      return { type: 'BinaryOp', op: '^', left, right };
    }

    return left;
  }

  // Precedence level 4: unary operations (+, -)
  private parseUnary(): ASTNode {
    if (this.peek().type === 'OPERATOR' && (this.peek().value === '-' || this.peek().value === '+')) {
      const op = this.consume().value as '-' | '+';
      const expr = this.parseUnary();
      return { type: 'UnaryOp', op, expr };
    }

    return this.parsePrimary();
  }

  // Precedence level 5: primary (numbers, variables, functions, parentheses)
  private parsePrimary(): ASTNode {
    const token = this.peek();

    if (token.type === 'NUMBER') {
      this.consume();
      return { type: 'Number', value: parseFloat(token.value) };
    }

    if (token.type === 'IDENTIFIER') {
      const ident = this.consume().value;
      const lower = ident.toLowerCase();

      // Check if it's a function call e.g. sin(x)
      if (this.peek().type === 'LPAREN' && lower in MATH_FUNCTIONS) {
        this.consume(); // consume '('
        const args: ASTNode[] = [];
        if (this.peek().type !== 'RPAREN') {
          args.push(this.parseExpression());
          while (this.match('COMMA')) {
            args.push(this.parseExpression());
          }
        }
        if (!this.match('RPAREN')) {
          throw new Error(`Expected ')' after function arguments for ${ident}`);
        }
        return { type: 'FunctionCall', name: lower, args };
      }

      // Check if constant
      if (lower in CONSTANTS) {
        return { type: 'Number', value: CONSTANTS[lower] };
      }

      // Otherwise, variable reference
      return { type: 'Variable', name: ident };
    }

    if (token.type === 'LPAREN') {
      this.consume();
      const expr = this.parseExpression();
      if (!this.match('RPAREN')) {
        throw new Error("Missing closing parenthesis ')'");
      }
      return expr;
    }

    throw new Error(`Unexpected token '${token.value || 'end of input'}'`);
  }
}

// AST Evaluator
export function evaluateAST(node: ASTNode, context: EvalContext): number {
  switch (node.type) {
    case 'Number':
      return node.value;

    case 'Variable': {
      if (node.name === 'x') {
        return context.x ?? 0;
      }
      if (node.name in context) {
        return context[node.name];
      }
      const lower = node.name.toLowerCase();
      if (lower in CONSTANTS) {
        return CONSTANTS[lower];
      }
      return 0; // Default undefined variable to 0
    }

    case 'UnaryOp': {
      const val = evaluateAST(node.expr, context);
      return node.op === '-' ? -val : val;
    }

    case 'BinaryOp': {
      const left = evaluateAST(node.left, context);
      const right = evaluateAST(node.right, context);
      switch (node.op) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': return right === 0 ? NaN : left / right;
        case '%': return left % right;
        case '^': return Math.pow(left, right);
      }
      return NaN;
    }

    case 'FunctionCall': {
      const fn = MATH_FUNCTIONS[node.name];
      if (!fn) return NaN;
      const evaluatedArgs = node.args.map((arg) => evaluateAST(arg, context));
      return fn(...evaluatedArgs);
    }
  }
}

// Parsed Compiled Function
export interface CompiledExpression {
  ast: ASTNode;
  evaluate: (x: number, vars?: Record<string, number>) => number;
  rawExpression: string;
}

// Cleans input (strips "y =", "f(x) =", etc.)
export function cleanEquationString(input: string): { cleanedExpr: string; assignedVar?: string; isAssignment: boolean } {
  let trimmed = input.trim();

  // Match slider assignments e.g. "a = 2.5" or "m = -1"
  const sliderMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9_]*)\s*=\s*([-+]?[0-9]*\.?[0-9]+)$/);
  if (sliderMatch) {
    return {
      cleanedExpr: sliderMatch[2],
      assignedVar: sliderMatch[1],
      isAssignment: true,
    };
  }

  // Remove "y =" or "f(x) =" or "g(x) ="
  trimmed = trimmed.replace(/^[yY]\s*=\s*/, '');
  trimmed = trimmed.replace(/^[a-zA-Z]\([xX]\)\s*=\s*/, '');

  return { cleanedExpr: trimmed, isAssignment: false };
}

// Check if string is a 2D point e.g. "(2, 3)" or "(-1.5, 4)"
export function parsePointString(input: string, vars: Record<string, number> = {}): { x: number; y: number } | null {
  const trimmed = input.trim();
  const pointMatch = trimmed.match(/^\(\s*([^,]+)\s*,\s*([^)]+)\s*\)$/);
  if (!pointMatch) return null;

  try {
    const xExpr = compileMathExpression(pointMatch[1]);
    const yExpr = compileMathExpression(pointMatch[2]);
    const x = xExpr.evaluate(0, vars);
    const y = yExpr.evaluate(0, vars);
    if (isNaN(x) || isNaN(y)) return null;
    return { x, y };
  } catch {
    return null;
  }
}

export function compileMathExpression(rawInput: string): CompiledExpression {
  const { cleanedExpr } = cleanEquationString(rawInput);
  if (!cleanedExpr) {
    throw new Error('Empty expression');
  }

  const tokens = tokenize(cleanedExpr);
  const parser = new Parser(tokens);
  const ast = parser.parse();

  return {
    ast,
    rawExpression: cleanedExpr,
    evaluate: (x: number, vars: Record<string, number> = {}) => {
      const context: EvalContext = { x, ...vars };
      return evaluateAST(ast, context);
    },
  };
}

// Numerical Calculus Utilities
export function numericalDerivative(
  fn: (x: number) => number,
  x: number,
  h: number = 0.0001
): number {
  const fPlus = fn(x + h);
  const fMinus = fn(x - h);
  return (fPlus - fMinus) / (2 * h);
}

// Numerical Definite Integral (Simpson's 3/8 or composite Simpson's rule)
export function numericalIntegral(
  fn: (x: number) => number,
  a: number,
  b: number,
  n: number = 100
): number {
  if (a === b) return 0;
  if (a > b) return -numericalIntegral(fn, b, a, n);

  const steps = n % 2 === 0 ? n : n + 1; // Must be even
  const h = (b - a) / steps;
  let sum = fn(a) + fn(b);

  for (let i = 1; i < steps; i++) {
    const x = a + i * h;
    const y = fn(x);
    if (isNaN(y) || !isFinite(y)) continue;
    sum += i % 2 === 0 ? 2 * y : 4 * y;
  }

  return (h / 3) * sum;
}

// Find Roots and Critical Points (local extrema) in visible viewport
export interface CurveFeaturePoint {
  x: number;
  y: number;
  type: 'root' | 'y-intercept' | 'min' | 'max';
  label: string;
}

export function findCurveFeatures(
  fn: (x: number) => number,
  minX: number,
  maxX: number,
  samples: number = 150
): CurveFeaturePoint[] {
  const features: CurveFeaturePoint[] = [];
  const step = (maxX - minX) / samples;

  // 1. Y-intercept if 0 is in bounds
  if (minX <= 0 && maxX >= 0) {
    const y0 = fn(0);
    if (!isNaN(y0) && isFinite(y0)) {
      features.push({
        x: 0,
        y: y0,
        type: 'y-intercept',
        label: `(0, ${y0.toFixed(2)})`,
      });
    }
  }

  let prevX = minX;
  let prevY = fn(prevX);
  let prevSlope = numericalDerivative(fn, prevX, step * 0.1);

  for (let i = 1; i <= samples; i++) {
    const currX = minX + i * step;
    const currY = fn(currX);
    if (isNaN(currY) || !isFinite(currY)) {
      prevX = currX;
      prevY = currY;
      continue;
    }

    // Check for sign change (Root)
    if (!isNaN(prevY) && isFinite(prevY) && prevY * currY <= 0 && Math.abs(currY - prevY) < 10) {
      // Linear interpolation to refine root
      const rootX = prevX - prevY * ((currX - prevX) / (currY - prevY));
      if (Math.abs(fn(rootX)) < 0.1) {
        features.push({
          x: rootX,
          y: 0,
          type: 'root',
          label: `(${rootX.toFixed(2)}, 0)`,
        });
      }
    }

    // Check for local extrema (slope sign change)
    const currSlope = numericalDerivative(fn, currX, step * 0.1);
    if (!isNaN(prevSlope) && !isNaN(currSlope) && isFinite(prevSlope) && isFinite(currSlope)) {
      if (prevSlope * currSlope < 0 && Math.abs(currSlope - prevSlope) < 10) {
        const isMax = prevSlope > 0 && currSlope < 0;
        const extremumX = (prevX + currX) / 2;
        const extremumY = fn(extremumX);
        if (!isNaN(extremumY) && isFinite(extremumY)) {
          features.push({
            x: extremumX,
            y: extremumY,
            type: isMax ? 'max' : 'min',
            label: `${isMax ? 'Max' : 'Min'}: (${extremumX.toFixed(2)}, ${extremumY.toFixed(2)})`,
          });
        }
      }
    }

    prevX = currX;
    prevY = currY;
    prevSlope = currSlope;
  }

  return features;
}

// Convert common user mathematical expressions to clean KaTeX LaTeX
export function formatExpressionToLatex(expr: string): string {
  let s = expr.trim();
  if (!s) return '';

  // Preserve y = or f(x) =
  let prefix = '';
  if (/^[yY]\s*=\s*/.test(s)) {
    prefix = 'y = ';
    s = s.replace(/^[yY]\s*=\s*/, '');
  } else if (/^[a-zA-Z]\([xX]\)\s*=\s*/.test(s)) {
    const fnMatch = s.match(/^([a-zA-Z]\([xX]\))\s*=\s*/);
    if (fnMatch) {
      prefix = `${fnMatch[1]} = `;
      s = s.replace(/^([a-zA-Z]\([xX]\))\s*=\s*/, '');
    }
  }

  // Powers: x^2 -> x^{2}
  s = s.replace(/\^([a-zA-Z0-9]+)/g, '^{$1}');
  // Trigonometry & standard functions
  s = s.replace(/\bsin\b/g, '\\sin');
  s = s.replace(/\bcos\b/g, '\\cos');
  s = s.replace(/\btan\b/g, '\\tan');
  s = s.replace(/\bsqrt\b/g, '\\sqrt');
  s = s.replace(/\babs\b/g, '\\text{abs}');
  s = s.replace(/\bexp\b/g, '\\exp');
  s = s.replace(/\bln\b/g, '\\ln');
  s = s.replace(/\blog\b/g, '\\log');
  s = s.replace(/\bpi\b/g, '\\pi');
  s = s.replace(/\btau\b/g, '\\tau');
  // Simple fractions e.g. 1/2 -> \frac{1}{2}
  s = s.replace(/([0-9a-zA-Z]+)\/([0-9a-zA-Z]+)/g, '\\frac{$1}{$2}');
  // Multiplication
  s = s.replace(/\*/g, ' \\cdot ');

  return prefix + s;
}
