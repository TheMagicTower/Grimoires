# Security Rules

보안 관련 코드 검증 규칙입니다. Reviewer Familiar가 보안 취약점을 탐지하는 데 사용합니다.

---

## 1. Secret Management

### 1.1 Hardcoded Secrets (Critical)

> "Never hardcode secrets in source code."

**설명**: API 키, 비밀번호, 토큰 등을 코드에 직접 작성하지 마세요.

**위반 탐지 패턴**:
```regex
# OpenAI API Keys
/['"]sk-[a-zA-Z0-9]{20,}['"]/

# GitHub Tokens
/['"]ghp_[a-zA-Z0-9]{36}['"]/                    # Personal Access Token
/['"]github_pat_[a-zA-Z0-9_]{22,}['"]/           # Fine-grained Token

# Slack Tokens
/['"]xox[baprs]-[a-zA-Z0-9-]{10,}['"]/

# AWS Access Keys
/['"]AKIA[A-Z0-9]{16}['"]/

# Google API Keys
/['"]AIza[a-zA-Z0-9_-]{35}['"]/

# Stripe Keys
/['"]sk_(?:live|test)_[a-zA-Z0-9]{24,}['"]/

# Passwords
/(?:password|passwd|pwd)\s*[=:]\s*['"][^'"]{8,}['"]/i

# Private Keys
/-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/
```

**예시**:

```typescript
// ❌ Bad: 하드코딩된 시크릿
const API_KEY = "sk-1234567890abcdef1234567890abcdef";
const DB_PASSWORD = "super_secret_password";

// ✅ Good: 환경 변수 사용
const API_KEY = process.env.OPENAI_API_KEY;
const DB_PASSWORD = process.env.DB_PASSWORD;

// ✅ Good: 시크릿 매니저 사용
const API_KEY = await secretManager.getSecret('openai-api-key');
```

**Severity**: Critical

---

### 1.2 Environment Variable Validation (High)

> "Always validate environment variables at startup."

**설명**: 필수 환경 변수가 설정되었는지 앱 시작 시 검증하세요.

**위반 탐지**:
- 검증 없이 `process.env` 직접 사용
- 누락된 환경 변수로 런타임 에러 발생 가능

**예시**:

```typescript
// ❌ Bad: 검증 없이 사용
const dbUrl = process.env.DATABASE_URL;
await connect(dbUrl); // undefined일 수 있음

// ✅ Good: 시작 시 검증
function validateEnv() {
  const required = ['DATABASE_URL', 'API_KEY', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

validateEnv();
const dbUrl = process.env.DATABASE_URL!;
```

**Severity**: High

---

### 1.3 .env File Protection (Medium)

> "Never commit .env files to version control."

**위반 탐지**:
- `.gitignore`에 `.env*` 패턴 누락
- `.env` 파일이 git에 추가됨

**체크리스트**:
- [ ] `.gitignore`에 `.env*` 포함
- [ ] `.env.example`만 커밋
- [ ] CI/CD에서 시크릿 주입

**Severity**: Medium

---

## 2. Input Validation

### 2.1 SQL Injection Prevention (Critical)

> "Never interpolate user input into SQL queries."

**위반 탐지 패턴**:
```regex
/`.*\$\{[^}]+\}.*`.*(?:query|execute)/
/['"].*\+.*['"].*(?:SELECT|INSERT|UPDATE|DELETE)/i
```

**예시**:

```typescript
// ❌ Bad: SQL 인젝션 취약
const query = `SELECT * FROM users WHERE id = ${userId}`;
const query2 = "SELECT * FROM users WHERE name = '" + userName + "'";

// ✅ Good: 파라미터화된 쿼리
const query = 'SELECT * FROM users WHERE id = $1';
await db.query(query, [userId]);

// ✅ Good: ORM 사용
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

**Severity**: Critical

---

### 2.2 XSS Prevention (Critical)

> "Always sanitize user input before rendering in HTML."

**위반 탐지**:
- `innerHTML` 직접 사용
- `dangerouslySetInnerHTML` 사용자 입력으로 설정
- 템플릿에서 이스케이프 없이 변수 출력

**예시**:

```typescript
// ❌ Bad: XSS 취약
element.innerHTML = userInput;
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// ✅ Good: 텍스트로 설정
element.textContent = userInput;
<div>{userComment}</div>

// ✅ Good: 필요시 sanitize
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userHtml);
<div dangerouslySetInnerHTML={{ __html: clean }} />
```

**Severity**: Critical

---

### 2.3 Path Traversal Prevention (High)

> "Validate and sanitize file paths from user input."

**위반 탐지**:
- 사용자 입력을 파일 경로에 직접 사용
- `../` 패턴 체크 없음

**예시**:

```typescript
// ❌ Bad: 경로 조작 취약
const filePath = `./uploads/${req.params.filename}`;
fs.readFile(filePath);

// ✅ Good: 경로 검증
import path from 'path';

const filename = path.basename(req.params.filename);
if (filename !== req.params.filename) {
  throw new Error('Invalid filename');
}

const filePath = path.join('./uploads', filename);
const realPath = fs.realpathSync(filePath);

if (!realPath.startsWith(fs.realpathSync('./uploads'))) {
  throw new Error('Path traversal detected');
}
```

**Severity**: High

---

### 2.4 Command Injection Prevention (Critical)

> "Never pass user input directly to shell commands."

**위반 탐지**:
- `exec`, `spawn`에 사용자 입력 직접 전달
- 셸 메타문자 필터링 없음

**예시**:

```typescript
// ❌ Bad: 명령어 인젝션 취약
exec(`ls ${userInput}`);
spawn('sh', ['-c', `echo ${userInput}`]);

// ✅ Good: 배열로 인자 전달
spawn('ls', [sanitizedPath], { shell: false });

// ✅ Good: 화이트리스트 검증
const allowedCommands = ['list', 'status', 'info'];
if (!allowedCommands.includes(userInput)) {
  throw new Error('Invalid command');
}
```

**Severity**: Critical

---

## 3. Authentication & Authorization

### 3.1 JWT Best Practices (High)

> "Follow secure JWT implementation practices."

**체크리스트**:
- [ ] 충분히 긴 시크릿 키 사용 (256비트 이상)
- [ ] 적절한 만료 시간 설정
- [ ] 알고리즘 명시적 지정 (none 알고리즘 차단)
- [ ] Refresh token 구현
- [ ] 토큰 블랙리스트 고려

**예시**:

```typescript
// ❌ Bad: 취약한 JWT 설정
const token = jwt.sign(payload, 'short');
const decoded = jwt.decode(token); // verify 없이 decode

// ✅ Good: 안전한 JWT 설정
const token = jwt.sign(payload, process.env.JWT_SECRET, {
  algorithm: 'HS256',
  expiresIn: '15m',
  issuer: 'my-app'
});

const decoded = jwt.verify(token, process.env.JWT_SECRET, {
  algorithms: ['HS256'],
  issuer: 'my-app'
});
```

**Severity**: High

---

### 3.2 Password Hashing (Critical)

> "Always use strong hashing algorithms for passwords."

**위반 탐지**:
- MD5, SHA1 사용
- 평문 비밀번호 저장
- salt 없는 해싱

**예시**:

```typescript
// ❌ Bad: 취약한 해싱
import crypto from 'crypto';
const hash = crypto.createHash('md5').update(password).digest('hex');

// ❌ Bad: 평문 저장
await db.user.create({ data: { password: plainPassword } });

// ✅ Good: bcrypt 사용
import bcrypt from 'bcrypt';
const saltRounds = 12;
const hash = await bcrypt.hash(password, saltRounds);

// 검증
const isValid = await bcrypt.compare(inputPassword, storedHash);
```

**Severity**: Critical

---

### 3.3 Access Control (High)

> "Implement proper authorization checks for all protected resources."

**위반 탐지**:
- 인증만 하고 권한 검사 없음
- 직접 객체 참조 (IDOR)
- 역할 기반 접근 제어 누락

**예시**:

```typescript
// ❌ Bad: 권한 검사 없음
app.get('/api/documents/:id', authenticate, async (req, res) => {
  const doc = await db.document.findUnique({ where: { id: req.params.id } });
  res.json(doc);
});

// ✅ Good: 소유권 확인
app.get('/api/documents/:id', authenticate, async (req, res) => {
  const doc = await db.document.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id  // 소유권 확인
    }
  });

  if (!doc) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.json(doc);
});

// ✅ Good: 역할 기반 접근 제어
app.delete('/api/users/:id', authenticate, authorize(['admin']), async (req, res) => {
  await db.user.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
```

**Severity**: High

---

## 4. Data Protection

### 4.1 Sensitive Data Logging (High)

> "Never log sensitive information."

**위반 탐지**:
- 비밀번호, 토큰, 카드 번호 로깅
- 요청/응답 전체를 그대로 로깅

**예시**:

```typescript
// ❌ Bad: 민감한 데이터 로깅
console.log('Login attempt:', { email, password });
logger.info('Request:', req.body);

// ✅ Good: 민감한 데이터 마스킹
console.log('Login attempt:', { email, password: '***' });
logger.info('Request:', maskSensitive(req.body));

function maskSensitive(obj: any) {
  const sensitiveKeys = ['password', 'token', 'secret', 'creditCard'];
  const masked = { ...obj };

  for (const key of sensitiveKeys) {
    if (key in masked) {
      masked[key] = '***';
    }
  }

  return masked;
}
```

**Severity**: High

---

### 4.2 HTTPS Enforcement (High)

> "Always use HTTPS in production."

**체크리스트**:
- [ ] 모든 HTTP → HTTPS 리다이렉트
- [ ] HSTS 헤더 설정
- [ ] 안전한 쿠키 설정 (Secure, HttpOnly, SameSite)

**예시**:

```typescript
// Express middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// Security headers
import helmet from 'helmet';
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true
  }
}));

// Secure cookies
res.cookie('session', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 3600000
});
```

**Severity**: High

---

### 4.3 CORS Configuration (Medium)

> "Configure CORS properly for your API."

**위반 탐지**:
- `origin: '*'` 사용
- credentials와 함께 와일드카드 origin

**예시**:

```typescript
// ❌ Bad: 과도하게 허용적인 CORS
app.use(cors({ origin: '*', credentials: true }));

// ✅ Good: 명시적 origin 설정
app.use(cors({
  origin: ['https://myapp.com', 'https://www.myapp.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Severity**: Medium

---

## 5. Dependency Security

### 5.1 Dependency Audit (Medium)

> "Regularly audit dependencies for vulnerabilities."

**체크 방법**:
```bash
npm audit
yarn audit
pnpm audit
```

**체크리스트**:
- [ ] CI/CD에 audit 포함
- [ ] 고위험 취약점 즉시 수정
- [ ] 정기적인 의존성 업데이트

**Severity**: Medium

---

### 5.2 Lock File Integrity (Medium)

> "Always commit lock files and verify integrity."

**체크리스트**:
- [ ] `package-lock.json` 또는 `yarn.lock` 커밋
- [ ] CI에서 `npm ci` 또는 `yarn --frozen-lockfile` 사용
- [ ] 의심스러운 lock file 변경 리뷰

**Severity**: Medium

---

## 6. Severity Reference

| Rule | Severity | Auto-block |
|------|----------|------------|
| Hardcoded Secrets | Critical | Yes |
| SQL Injection | Critical | Yes |
| XSS | Critical | Yes |
| Command Injection | Critical | Yes |
| Password Hashing | Critical | Yes |
| JWT Best Practices | High | No |
| Path Traversal | High | No |
| Access Control | High | No |
| Sensitive Logging | High | No |
| HTTPS Enforcement | High | No |
| Environment Validation | High | No |
| CORS Configuration | Medium | No |
| Dependency Audit | Medium | No |
| Lock File Integrity | Medium | No |
| .env Protection | Medium | No |

---

*Version: 0.3.0*
*Last Updated: 2026-01-26*
