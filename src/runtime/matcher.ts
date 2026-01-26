/**
 * Matcher Expression Parser
 *
 * Evaluates matcher expressions from hooks.json against tool context.
 * Supports a safe DSL for matching tool operations.
 *
 * @version 0.3.1
 */

// Token types for the matcher DSL
export const TokenType = {
  IDENTIFIER: 'IDENTIFIER',
  STRING: 'STRING',
  OPERATOR: 'OPERATOR',
  LOGICAL: 'LOGICAL',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  EOF: 'EOF'
} as const;

export type TokenTypeValue = typeof TokenType[keyof typeof TokenType];

export interface Token {
  type: TokenTypeValue;
  value: string | null;
}

export type MatcherOperator =
  | '=='
  | '!='
  | 'matches'
  | '!matches'
  | 'startsWith'
  | 'endsWith'
  | 'contains'
  | 'in';

export type LogicalOperator = '&&' | '||' | '!';

export interface ComparisonNode {
  type: 'COMPARISON';
  left: string;
  operator: MatcherOperator;
  right: string;
}

export interface AndNode {
  type: 'AND';
  left: ASTNode;
  right: ASTNode;
}

export interface OrNode {
  type: 'OR';
  left: ASTNode;
  right: ASTNode;
}

export interface NotNode {
  type: 'NOT';
  operand: ASTNode;
}

export type ASTNode = ComparisonNode | AndNode | OrNode | NotNode;

export interface MatcherValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Tokenizer for matcher expressions
 */
export class Tokenizer {
  private input: string;
  private pos: number;
  private tokens: Token[];

  constructor(input: string) {
    this.input = input;
    this.pos = 0;
    this.tokens = [];
  }

  tokenize(): Token[] {
    while (this.pos < this.input.length) {
      this.skipWhitespace();
      if (this.pos >= this.input.length) break;

      const char = this.input[this.pos];

      if (char === '(') {
        this.tokens.push({ type: TokenType.LPAREN, value: '(' });
        this.pos++;
      } else if (char === ')') {
        this.tokens.push({ type: TokenType.RPAREN, value: ')' });
        this.pos++;
      } else if (char === "'" || char === '"') {
        this.tokens.push(this.readString(char));
      } else if (this.isOperatorStart()) {
        this.tokens.push(this.readOperator());
      } else if (this.isLogicalStart()) {
        this.tokens.push(this.readLogical());
      } else if (this.isIdentifierStart(char)) {
        this.tokens.push(this.readIdentifier());
      } else {
        this.pos++;
      }
    }

    this.tokens.push({ type: TokenType.EOF, value: null });
    return this.tokens;
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }

  private isIdentifierStart(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isOperatorStart(): boolean {
    const remaining = this.input.slice(this.pos);
    return /^(==|!=|matches|!matches|startsWith|endsWith|contains|in)/.test(remaining);
  }

  private isLogicalStart(): boolean {
    const remaining = this.input.slice(this.pos);
    return /^(&&|\|\||!)/.test(remaining);
  }

  private readString(quote: string): Token {
    this.pos++; // skip opening quote
    let value = '';
    while (this.pos < this.input.length && this.input[this.pos] !== quote) {
      if (this.input[this.pos] === '\\' && this.pos + 1 < this.input.length) {
        this.pos++;
        value += this.input[this.pos];
      } else {
        value += this.input[this.pos];
      }
      this.pos++;
    }
    this.pos++; // skip closing quote
    return { type: TokenType.STRING, value };
  }

  private readOperator(): Token {
    // Order matters: longer operators first to avoid partial matches
    const operators: MatcherOperator[] = ['==', '!=', '!matches', 'matches', 'startsWith', 'endsWith', 'contains', 'in'];
    for (const op of operators) {
      if (this.input.slice(this.pos).startsWith(op)) {
        this.pos += op.length;
        return { type: TokenType.OPERATOR, value: op };
      }
    }
    throw new Error(`Unknown operator at position ${this.pos}`);
  }

  private readLogical(): Token {
    const logicals: LogicalOperator[] = ['&&', '||', '!'];
    for (const log of logicals) {
      if (this.input.slice(this.pos).startsWith(log)) {
        this.pos += log.length;
        return { type: TokenType.LOGICAL, value: log };
      }
    }
    throw new Error(`Unknown logical at position ${this.pos}`);
  }

  private readIdentifier(): Token {
    let value = '';
    while (this.pos < this.input.length && /[a-zA-Z0-9_]/.test(this.input[this.pos])) {
      value += this.input[this.pos];
      this.pos++;
    }
    return { type: TokenType.IDENTIFIER, value };
  }
}

/**
 * Parser for matcher expressions
 */
export class Parser {
  private tokens: Token[];
  private pos: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.pos = 0;
  }

  parse(): ASTNode {
    return this.parseExpression();
  }

  private current(): Token {
    return this.tokens[this.pos];
  }

  private consume(type: TokenTypeValue): Token {
    if (this.current().type === type) {
      return this.tokens[this.pos++];
    }
    throw new Error(`Expected ${type}, got ${this.current().type}`);
  }

  private parseExpression(): ASTNode {
    return this.parseOr();
  }

  private parseOr(): ASTNode {
    let left = this.parseAnd();

    while (this.current().type === TokenType.LOGICAL && this.current().value === '||') {
      this.consume(TokenType.LOGICAL);
      const right = this.parseAnd();
      left = { type: 'OR', left, right };
    }

    return left;
  }

  private parseAnd(): ASTNode {
    let left = this.parseUnary();

    while (this.current().type === TokenType.LOGICAL && this.current().value === '&&') {
      this.consume(TokenType.LOGICAL);
      const right = this.parseUnary();
      left = { type: 'AND', left, right };
    }

    return left;
  }

  private parseUnary(): ASTNode {
    if (this.current().type === TokenType.LOGICAL && this.current().value === '!') {
      this.consume(TokenType.LOGICAL);
      const operand = this.parseUnary();
      return { type: 'NOT', operand };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): ASTNode {
    if (this.current().type === TokenType.LPAREN) {
      this.consume(TokenType.LPAREN);
      const expr = this.parseExpression();
      this.consume(TokenType.RPAREN);
      return expr;
    }

    return this.parseComparison();
  }

  private parseComparison(): ComparisonNode {
    const left = this.consume(TokenType.IDENTIFIER);
    const op = this.consume(TokenType.OPERATOR);
    const right = this.current().type === TokenType.STRING
      ? this.consume(TokenType.STRING)
      : this.consume(TokenType.IDENTIFIER);

    return {
      type: 'COMPARISON',
      left: left.value!,
      operator: op.value as MatcherOperator,
      right: right.value!
    };
  }
}

/**
 * Evaluator for parsed AST
 */
export class Evaluator {
  private context: Record<string, unknown>;

  constructor(context: Record<string, unknown>) {
    this.context = context;
  }

  evaluate(ast: ASTNode): boolean {
    switch (ast.type) {
      case 'AND':
        return this.evaluate(ast.left) && this.evaluate(ast.right);
      case 'OR':
        return this.evaluate(ast.left) || this.evaluate(ast.right);
      case 'NOT':
        return !this.evaluate(ast.operand);
      case 'COMPARISON':
        return this.evaluateComparison(ast);
      default:
        throw new Error(`Unknown AST type: ${(ast as ASTNode).type}`);
    }
  }

  private evaluateComparison(ast: ComparisonNode): boolean {
    const left = this.resolveValue(ast.left);
    const right = ast.right;

    switch (ast.operator) {
      case '==':
        return left === right;
      case '!=':
        return left !== right;
      case 'matches':
        return this.matches(left, right);
      case '!matches':
        return !this.matches(left, right);
      case 'startsWith':
        return typeof left === 'string' && left.startsWith(right);
      case 'endsWith':
        return typeof left === 'string' && left.endsWith(right);
      case 'contains':
        return typeof left === 'string' && left.includes(right);
      case 'in':
        // Check if left value is in a comma-separated list
        const values = right.split(',').map(v => v.trim());
        return values.includes(String(left));
      default:
        throw new Error(`Unknown operator: ${ast.operator}`);
    }
  }

  private resolveValue(identifier: string): unknown {
    // Support nested properties like "tool.name"
    const parts = identifier.split('.');
    let value: unknown = this.context;

    for (const part of parts) {
      if (value === undefined || value === null) return undefined;
      value = (value as Record<string, unknown>)[part];
    }

    return value;
  }

  private matches(str: unknown, pattern: string): boolean {
    if (typeof str !== 'string') return false;
    try {
      const regex = new RegExp(pattern);
      return regex.test(str);
    } catch {
      // Treat as simple string match if not valid regex
      return str.includes(pattern);
    }
  }
}

/**
 * Main matcher function
 * @param expression - The matcher expression
 * @param context - The context to match against
 * @returns Whether the expression matches
 */
export function match(expression: string, context: Record<string, unknown>): boolean {
  if (!expression || expression.trim() === '') {
    return true; // Empty matcher always matches
  }

  try {
    const tokenizer = new Tokenizer(expression);
    const tokens = tokenizer.tokenize();

    const parser = new Parser(tokens);
    const ast = parser.parse();

    const evaluator = new Evaluator(context);
    return evaluator.evaluate(ast);
  } catch (error) {
    console.error(`Matcher error: ${(error as Error).message}`);
    return false; // On error, don't match (safe default)
  }
}

/**
 * Validate a matcher expression
 * @param expression - The expression to validate
 * @returns Validation result with valid flag and optional error
 */
export function validate(expression: string): MatcherValidationResult {
  if (!expression || expression.trim() === '') {
    return { valid: true };
  }

  try {
    const tokenizer = new Tokenizer(expression);
    const tokens = tokenizer.tokenize();

    const parser = new Parser(tokens);
    parser.parse();

    return { valid: true };
  } catch (error) {
    return { valid: false, error: (error as Error).message };
  }
}
