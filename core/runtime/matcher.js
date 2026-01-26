#!/usr/bin/env node
/**
 * Matcher Expression Parser
 *
 * Evaluates matcher expressions from hooks.json against tool context.
 * Supports a safe DSL for matching tool operations.
 *
 * @version 0.3.0
 */

/**
 * Token types for the matcher DSL
 */
const TokenType = {
  IDENTIFIER: 'IDENTIFIER',
  STRING: 'STRING',
  OPERATOR: 'OPERATOR',
  LOGICAL: 'LOGICAL',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  EOF: 'EOF'
};

/**
 * Tokenizer for matcher expressions
 */
class Tokenizer {
  constructor(input) {
    this.input = input;
    this.pos = 0;
    this.tokens = [];
  }

  tokenize() {
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

  skipWhitespace() {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }

  isIdentifierStart(char) {
    return /[a-zA-Z_]/.test(char);
  }

  isOperatorStart() {
    const remaining = this.input.slice(this.pos);
    return /^(==|!=|matches|!matches|startsWith|endsWith|contains|in)/.test(remaining);
  }

  isLogicalStart() {
    const remaining = this.input.slice(this.pos);
    return /^(&&|\|\||!)/.test(remaining);
  }

  readString(quote) {
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

  readOperator() {
    // Order matters: longer operators first to avoid partial matches
    const operators = ['==', '!=', '!matches', 'matches', 'startsWith', 'endsWith', 'contains', 'in'];
    for (const op of operators) {
      if (this.input.slice(this.pos).startsWith(op)) {
        this.pos += op.length;
        return { type: TokenType.OPERATOR, value: op };
      }
    }
    throw new Error(`Unknown operator at position ${this.pos}`);
  }

  readLogical() {
    const logicals = ['&&', '||', '!'];
    for (const log of logicals) {
      if (this.input.slice(this.pos).startsWith(log)) {
        this.pos += log.length;
        return { type: TokenType.LOGICAL, value: log };
      }
    }
    throw new Error(`Unknown logical at position ${this.pos}`);
  }

  readIdentifier() {
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
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  parse() {
    return this.parseExpression();
  }

  current() {
    return this.tokens[this.pos];
  }

  consume(type) {
    if (this.current().type === type) {
      return this.tokens[this.pos++];
    }
    throw new Error(`Expected ${type}, got ${this.current().type}`);
  }

  parseExpression() {
    return this.parseOr();
  }

  parseOr() {
    let left = this.parseAnd();

    while (this.current().type === TokenType.LOGICAL && this.current().value === '||') {
      this.consume(TokenType.LOGICAL);
      const right = this.parseAnd();
      left = { type: 'OR', left, right };
    }

    return left;
  }

  parseAnd() {
    let left = this.parseUnary();

    while (this.current().type === TokenType.LOGICAL && this.current().value === '&&') {
      this.consume(TokenType.LOGICAL);
      const right = this.parseUnary();
      left = { type: 'AND', left, right };
    }

    return left;
  }

  parseUnary() {
    if (this.current().type === TokenType.LOGICAL && this.current().value === '!') {
      this.consume(TokenType.LOGICAL);
      const operand = this.parseUnary();
      return { type: 'NOT', operand };
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    if (this.current().type === TokenType.LPAREN) {
      this.consume(TokenType.LPAREN);
      const expr = this.parseExpression();
      this.consume(TokenType.RPAREN);
      return expr;
    }

    return this.parseComparison();
  }

  parseComparison() {
    const left = this.consume(TokenType.IDENTIFIER);
    const op = this.consume(TokenType.OPERATOR);
    const right = this.current().type === TokenType.STRING
      ? this.consume(TokenType.STRING)
      : this.consume(TokenType.IDENTIFIER);

    return {
      type: 'COMPARISON',
      left: left.value,
      operator: op.value,
      right: right.value
    };
  }
}

/**
 * Evaluator for parsed AST
 */
class Evaluator {
  constructor(context) {
    this.context = context;
  }

  evaluate(ast) {
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
        throw new Error(`Unknown AST type: ${ast.type}`);
    }
  }

  evaluateComparison(ast) {
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

  resolveValue(identifier) {
    // Support nested properties like "tool.name"
    const parts = identifier.split('.');
    let value = this.context;

    for (const part of parts) {
      if (value === undefined || value === null) return undefined;
      value = value[part];
    }

    return value;
  }

  matches(str, pattern) {
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
 * @param {string} expression - The matcher expression
 * @param {Object} context - The context to match against
 * @returns {boolean} - Whether the expression matches
 */
function match(expression, context) {
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
    console.error(`Matcher error: ${error.message}`);
    return false; // On error, don't match (safe default)
  }
}

/**
 * Validate a matcher expression
 * @param {string} expression - The expression to validate
 * @returns {{ valid: boolean, error?: string }}
 */
function validate(expression) {
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
    return { valid: false, error: error.message };
  }
}

module.exports = {
  match,
  validate,
  Tokenizer,
  Parser,
  Evaluator
};
