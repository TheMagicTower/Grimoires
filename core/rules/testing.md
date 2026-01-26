# Testing Rules

테스트 관련 코드 품질 규칙입니다. TDD 워크플로우 및 테스트 커버리지 기준을 정의합니다.

---

## 1. Coverage Requirements

### 1.1 Coverage Thresholds

| Metric | Minimum | Warning | Blocking |
|--------|---------|---------|----------|
| Line Coverage | 80% | < 80% | < 70% |
| Branch Coverage | 70% | < 70% | < 60% |
| Function Coverage | 80% | < 80% | < 70% |
| Statement Coverage | 80% | < 80% | < 70% |

**Jest 설정 예시**:

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 70,
      functions: 80,
      statements: 80
    }
  }
};
```

**Severity**: High (for blocking thresholds)

---

### 1.2 Coverage Exclusions

다음은 커버리지에서 제외할 수 있습니다:

| Category | Pattern | Reason |
|----------|---------|--------|
| Config files | `*.config.js` | 테스트 불필요 |
| Type definitions | `*.d.ts` | 런타임 코드 아님 |
| Test files | `*.test.ts`, `*.spec.ts` | 테스트 자체 |
| Generated | `*.generated.*` | 자동 생성 코드 |
| Mocks | `__mocks__/**` | 테스트 유틸 |

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__mocks__/**'
  ]
};
```

---

## 2. TDD Workflow

### 2.1 RED → GREEN → REFACTOR

```
┌─────────────────────────────────────┐
│              1. RED                  │
│   - 요구사항 분석                     │
│   - 테스트 케이스 설계                │
│   - 실패하는 테스트 작성              │
│   - 실패 확인 ✗                      │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│             2. GREEN                 │
│   - 최소 구현                        │
│   - 테스트 통과만을 목표              │
│   - 테스트 통과 ✓                    │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│           3. REFACTOR                │
│   - 코드 품질 개선                   │
│   - SOLID/DRY 적용                   │
│   - 테스트 유지 ✓                    │
└─────────────────────────────────────┘
              │
              └──────► 다음 기능으로
```

### 2.2 Test-First Principle (High)

> "Write tests before implementation."

**위반 탐지**:
- 구현 코드만 있고 테스트 없음
- 테스트 커밋이 구현 후에 별도로 발생

**체크리스트**:
- [ ] 기능 요구사항에서 테스트 케이스 도출
- [ ] 테스트 먼저 작성
- [ ] 테스트 실패 확인
- [ ] 최소 구현으로 통과
- [ ] 리팩토링

**Severity**: High

---

### 2.3 Test Naming Convention (Medium)

> "Test names should clearly describe the expected behavior."

**패턴**: `describe('Subject', () => { it('should action when condition', ...) })`

**예시**:

```typescript
// ❌ Bad: 모호한 이름
describe('UserService', () => {
  it('test1', () => { /* ... */ });
  it('works correctly', () => { /* ... */ });
});

// ✅ Good: 명확한 이름
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', () => { /* ... */ });
    it('should throw ValidationError when email is invalid', () => { /* ... */ });
    it('should hash password before saving', () => { /* ... */ });
  });

  describe('findById', () => {
    it('should return user when found', () => { /* ... */ });
    it('should return null when not found', () => { /* ... */ });
  });
});
```

**Severity**: Medium

---

## 3. Test Categories

### 3.1 Unit Tests

> "Test individual units in isolation."

**특징**:
- 단일 함수/클래스 테스트
- 외부 의존성 모킹
- 빠른 실행 (< 100ms per test)
- 80% 이상 커버리지 목표

**예시**:

```typescript
// src/utils/formatDate.ts
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// src/utils/formatDate.test.ts
describe('formatDate', () => {
  it('should format date to YYYY-MM-DD', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    expect(formatDate(date)).toBe('2024-01-15');
  });

  it('should handle midnight correctly', () => {
    const date = new Date('2024-01-15T00:00:00Z');
    expect(formatDate(date)).toBe('2024-01-15');
  });
});
```

### 3.2 Integration Tests

> "Test interactions between components."

**특징**:
- 여러 컴포넌트 조합 테스트
- 실제 DB 또는 테스트 DB 사용
- API 엔드포인트 테스트
- 중간 속도 (< 1s per test)

**예시**:

```typescript
// src/api/users.integration.test.ts
import { createTestApp } from '../test/helpers';
import { prisma } from '../db';

describe('Users API', () => {
  let app: Express;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('POST /api/users', () => {
    it('should create a user and return 201', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body.email).toBe('test@example.com');

      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' }
      });
      expect(user).not.toBeNull();
    });
  });
});
```

### 3.3 E2E Tests

> "Test the entire application flow from user perspective."

**특징**:
- 실제 브라우저 또는 시뮬레이션
- 전체 사용자 시나리오
- 느린 실행 (수 초 per test)
- Critical path 위주

**예시**:

```typescript
// e2e/auth.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can sign up and log in', async ({ page }) => {
    // Sign up
    await page.goto('/signup');
    await page.fill('[name="email"]', 'new@example.com');
    await page.fill('[name="password"]', 'securePassword123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');

    // Log out
    await page.click('[data-testid="logout"]');
    await expect(page).toHaveURL('/login');

    // Log in
    await page.fill('[name="email"]', 'new@example.com');
    await page.fill('[name="password"]', 'securePassword123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
  });
});
```

---

## 4. Test Quality Rules

### 4.1 Test Independence (High)

> "Each test should be independent and not rely on other tests."

**위반 탐지**:
- 테스트 간 상태 공유
- 테스트 실행 순서 의존
- 글로벌 변수 수정

**예시**:

```typescript
// ❌ Bad: 테스트 간 의존
let user: User;

it('should create user', async () => {
  user = await createUser({ name: 'Test' });
  expect(user).toBeDefined();
});

it('should update user', async () => {
  // 이전 테스트에 의존!
  user.name = 'Updated';
  await updateUser(user);
  expect(user.name).toBe('Updated');
});

// ✅ Good: 독립적인 테스트
describe('User', () => {
  let user: User;

  beforeEach(async () => {
    user = await createUser({ name: 'Test' });
  });

  afterEach(async () => {
    await deleteUser(user.id);
  });

  it('should update user', async () => {
    user.name = 'Updated';
    await updateUser(user);
    expect(user.name).toBe('Updated');
  });
});
```

**Severity**: High

---

### 4.2 Arrange-Act-Assert (Medium)

> "Structure tests with clear phases."

**예시**:

```typescript
it('should calculate total price with discount', () => {
  // Arrange
  const cart = new ShoppingCart();
  cart.addItem({ name: 'Book', price: 100, quantity: 2 });
  const discount = new PercentageDiscount(10);

  // Act
  const total = cart.calculateTotal(discount);

  // Assert
  expect(total).toBe(180); // 200 - 10%
});
```

**Severity**: Medium

---

### 4.3 Avoid Test Duplication (Medium)

> "Use parameterized tests for similar test cases."

**예시**:

```typescript
// ❌ Bad: 중복된 테스트
it('should validate email: test@example.com', () => {
  expect(isValidEmail('test@example.com')).toBe(true);
});

it('should validate email: user@domain.org', () => {
  expect(isValidEmail('user@domain.org')).toBe(true);
});

// ✅ Good: 파라미터화된 테스트
describe('isValidEmail', () => {
  const validEmails = [
    'test@example.com',
    'user@domain.org',
    'name.surname@company.co.uk'
  ];

  const invalidEmails = [
    'invalid',
    '@nodomain.com',
    'no@tld'
  ];

  it.each(validEmails)('should accept valid email: %s', (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  it.each(invalidEmails)('should reject invalid email: %s', (email) => {
    expect(isValidEmail(email)).toBe(false);
  });
});
```

**Severity**: Medium

---

### 4.4 Meaningful Assertions (High)

> "Assertions should verify actual behavior, not implementation details."

**위반 탐지**:
- 구현 세부사항 검증
- 너무 많은 mock 검증
- 결과보다 호출 검증

**예시**:

```typescript
// ❌ Bad: 구현 세부사항 검증
it('should process order', async () => {
  const mockDb = jest.fn();
  const mockEmail = jest.fn();

  await processOrder(order, mockDb, mockEmail);

  expect(mockDb).toHaveBeenCalledWith('INSERT INTO orders...');
  expect(mockEmail).toHaveBeenCalledWith(expect.any(Object));
});

// ✅ Good: 동작 검증
it('should process order and send confirmation', async () => {
  const order = await processOrder(orderData);

  expect(order.status).toBe('processed');
  expect(order.confirmationSent).toBe(true);

  const savedOrder = await db.orders.findById(order.id);
  expect(savedOrder).not.toBeNull();
});
```

**Severity**: High

---

### 4.5 Test Error Cases (High)

> "Always test error scenarios, not just happy paths."

**체크리스트**:
- [ ] 유효하지 않은 입력
- [ ] 경계 조건
- [ ] 네트워크 오류
- [ ] 타임아웃
- [ ] 권한 오류

**예시**:

```typescript
describe('UserService.createUser', () => {
  // Happy path
  it('should create user with valid data', async () => {
    const user = await createUser({ email: 'test@test.com', name: 'Test' });
    expect(user.id).toBeDefined();
  });

  // Error cases
  it('should throw on duplicate email', async () => {
    await createUser({ email: 'test@test.com', name: 'Test' });

    await expect(
      createUser({ email: 'test@test.com', name: 'Other' })
    ).rejects.toThrow('Email already exists');
  });

  it('should throw on invalid email format', async () => {
    await expect(
      createUser({ email: 'invalid', name: 'Test' })
    ).rejects.toThrow('Invalid email format');
  });

  it('should throw on empty name', async () => {
    await expect(
      createUser({ email: 'test@test.com', name: '' })
    ).rejects.toThrow('Name is required');
  });
});
```

**Severity**: High

---

## 5. Mocking Rules

### 5.1 Mock External Dependencies (Medium)

> "Mock external services and I/O operations in unit tests."

**Mock 대상**:
- HTTP 요청
- 데이터베이스
- 파일 시스템
- 시간/날짜
- 랜덤 값

**예시**:

```typescript
// Mock HTTP
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.get.mockResolvedValue({ data: { user: 'test' } });

// Mock Date
jest.useFakeTimers();
jest.setSystemTime(new Date('2024-01-01'));

// Mock random
jest.spyOn(Math, 'random').mockReturnValue(0.5);
```

### 5.2 Avoid Over-mocking (Medium)

> "Don't mock everything - test real behavior when possible."

**위반 탐지**:
- 테스트 대상 자체를 mock
- 너무 많은 mock으로 테스트 신뢰성 저하

**Severity**: Medium

---

## 6. Severity Reference

| Rule | Severity |
|------|----------|
| Coverage Threshold (blocking) | High |
| Test-First Principle | High |
| Test Independence | High |
| Meaningful Assertions | High |
| Test Error Cases | High |
| Test Naming | Medium |
| Arrange-Act-Assert | Medium |
| Avoid Duplication | Medium |
| Mock External | Medium |
| Avoid Over-mocking | Medium |

---

*Version: 0.3.0*
*Last Updated: 2026-01-26*
