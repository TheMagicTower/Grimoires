# Coding Style Rules

코드 스타일 및 가독성 관련 규칙입니다. 일관된 코드 작성과 유지보수성을 위한 가이드라인을 정의합니다.

---

## 1. File Organization

### 1.1 File Structure (Medium)

> "Organize files with a consistent structure."

**권장 구조**:

```typescript
// 1. Imports (외부 → 내부 → 타입)
import React from 'react';                    // 외부 라이브러리
import { useQuery } from '@tanstack/query';   // 외부 라이브러리

import { Button } from '@/components/ui';     // 내부 절대 경로
import { formatDate } from '../utils';        // 상대 경로

import type { User } from '@/types';          // 타입 import

// 2. Constants
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 5000;

// 3. Types/Interfaces
interface Props {
  userId: string;
  onSelect: (user: User) => void;
}

// 4. Helper functions (private)
function formatUserName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

// 5. Main export
export function UserCard({ userId, onSelect }: Props) {
  // Implementation
}

// 6. Sub-components (if any)
function UserAvatar({ url }: { url: string }) {
  // Implementation
}
```

**Severity**: Medium

---

### 1.2 Import Order (Low)

> "Maintain consistent import ordering."

**순서**:
1. React/framework imports
2. External library imports
3. Internal absolute imports
4. Relative imports
5. Type imports
6. Style imports

**ESLint 설정**:

```javascript
// .eslintrc.js
{
  rules: {
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'type'
      ],
      'newlines-between': 'always',
      alphabetize: { order: 'asc' }
    }]
  }
}
```

**Severity**: Low

---

### 1.3 Export Conventions (Medium)

> "Be consistent with export styles."

**권장**:
- 단일 export: `export default`
- 다중 export: Named exports
- Re-exports: Barrel files (index.ts)

**예시**:

```typescript
// ❌ Bad: 혼합된 export 스타일
export default function Component() {}
export const helper = () => {};
export default class Service {}  // 같은 파일에 default 두 개

// ✅ Good: 일관된 스타일
// components/Button.tsx
export function Button() {}

// components/index.ts (barrel file)
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';

// 사용
import { Button, Input, Modal } from '@/components';
```

**Severity**: Medium

---

## 2. Naming Conventions

### 2.1 Variable Naming (High)

> "Use descriptive and consistent variable names."

| Type | Convention | Examples |
|------|------------|----------|
| Variable | camelCase | `userName`, `isValid`, `itemCount` |
| Constant | UPPER_SNAKE | `MAX_SIZE`, `API_URL`, `DEFAULT_TIMEOUT` |
| Boolean | is/has/can/should prefix | `isActive`, `hasPermission`, `canEdit` |
| Array | plural nouns | `users`, `items`, `selectedIds` |
| Function | verb prefix | `getUser`, `handleClick`, `validateEmail` |

**예시**:

```typescript
// ❌ Bad: 불명확한 이름
const d = new Date();
const arr = users.filter(u => u.a);
const flag = true;
const temp = calculate();

// ✅ Good: 명확한 이름
const currentDate = new Date();
const activeUsers = users.filter(user => user.isActive);
const isAuthenticated = true;
const discountedPrice = calculateDiscount(originalPrice);
```

**Severity**: High

---

### 2.2 Function Naming (High)

> "Function names should describe their action."

| Pattern | Use Case | Examples |
|---------|----------|----------|
| `get*` | 데이터 조회 | `getUser`, `getOrderById` |
| `set*` | 값 설정 | `setTheme`, `setUserPreference` |
| `is*` / `has*` | 불린 반환 | `isValid`, `hasPermission` |
| `handle*` | 이벤트 핸들러 | `handleClick`, `handleSubmit` |
| `on*` | 콜백 props | `onClick`, `onSelect` |
| `create*` | 생성 | `createUser`, `createOrder` |
| `update*` | 수정 | `updateProfile`, `updateStatus` |
| `delete*` | 삭제 | `deleteUser`, `removeItem` |
| `fetch*` | API 호출 | `fetchUsers`, `fetchOrderDetails` |
| `validate*` | 검증 | `validateEmail`, `validateForm` |
| `format*` | 포맷팅 | `formatDate`, `formatCurrency` |
| `parse*` | 파싱 | `parseJSON`, `parseQueryString` |
| `to*` | 변환 | `toString`, `toArray` |

**예시**:

```typescript
// ❌ Bad: 동작이 불명확
function userData() {}
function process() {}
function doStuff() {}

// ✅ Good: 동작이 명확
function fetchUserData() {}
function processPayment() {}
function validateAndSubmitForm() {}
```

**Severity**: High

---

### 2.3 Class/Interface Naming (Medium)

> "Use PascalCase for types and classes."

| Type | Convention | Examples |
|------|------------|----------|
| Class | PascalCase, noun | `UserService`, `OrderRepository` |
| Interface | PascalCase | `UserData`, `OrderConfig` |
| Type | PascalCase | `RequestOptions`, `ApiResponse` |
| Enum | PascalCase | `Status`, `UserRole` |
| Enum values | UPPER_SNAKE or PascalCase | `PENDING`, `Active` |

**예시**:

```typescript
// ❌ Bad
interface userData {}
type api_response = {}
enum status { pending, active }

// ✅ Good
interface UserData {
  id: string;
  email: string;
}

type ApiResponse<T> = {
  data: T;
  error?: string;
}

enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
}
```

**Severity**: Medium

---

## 3. Code Formatting

### 3.1 Line Length (Low)

> "Keep lines reasonably short."

**기준**: 최대 100자 (80자 권장)

**예시**:

```typescript
// ❌ Bad: 너무 긴 라인
const result = someVeryLongFunctionName(firstParameter, secondParameter, thirdParameter, fourthParameter);

// ✅ Good: 적절히 분할
const result = someVeryLongFunctionName(
  firstParameter,
  secondParameter,
  thirdParameter,
  fourthParameter
);
```

**Severity**: Low

---

### 3.2 Indentation (Low)

> "Use consistent indentation."

**규칙**:
- 2 spaces (권장) 또는 4 spaces
- Tabs vs spaces: 프로젝트 표준 따름
- 중첩 깊이: 최대 4레벨

**Severity**: Low

---

### 3.3 Braces Style (Low)

> "Be consistent with brace placement."

**권장**: K&R 스타일 (같은 줄에 여는 괄호)

```typescript
// ✅ K&R 스타일
function example() {
  if (condition) {
    doSomething();
  } else {
    doOther();
  }
}

// 단일 라인 허용 케이스
if (simple) return value;
const fn = (x) => x * 2;
```

**Severity**: Low

---

## 4. Comments

### 4.1 When to Comment (Medium)

> "Code should be self-documenting; use comments for 'why', not 'what'."

**좋은 주석**:
- 비즈니스 규칙 설명
- 복잡한 알고리즘 의도
- 비자명한 workaround 이유
- TODO/FIXME (임시)

**나쁜 주석**:
- 코드가 무엇을 하는지 설명
- 오래된/잘못된 정보
- 주석 처리된 코드

**예시**:

```typescript
// ❌ Bad: 무엇을 하는지 설명
// 사용자 이메일 검증
function validateEmail(email: string) {
  // 이메일에 @가 있는지 확인
  return email.includes('@');
}

// ✅ Good: 왜 이렇게 하는지 설명
/**
 * 간단한 이메일 형식 검증
 *
 * RFC 5322 완전 준수는 의도적으로 피함:
 * 대부분의 사용자 입력 오류는 @ 누락이며,
 * 완전한 검증은 이메일 발송으로 수행함
 */
function validateEmail(email: string) {
  return email.includes('@');
}

// ✅ Good: Workaround 설명
// Safari에서 flex gap 미지원으로 margin 사용
// TODO: Safari 14.1+ 지원 시 gap으로 교체 (#123)
```

**Severity**: Medium

---

### 4.2 JSDoc Comments (Medium)

> "Document public APIs with JSDoc."

**예시**:

```typescript
/**
 * 사용자를 생성합니다.
 *
 * @param data - 사용자 생성 데이터
 * @returns 생성된 사용자 객체
 * @throws {ValidationError} 이메일이 유효하지 않은 경우
 * @throws {DuplicateError} 이메일이 이미 존재하는 경우
 *
 * @example
 * ```ts
 * const user = await createUser({
 *   email: 'user@example.com',
 *   name: 'John Doe'
 * });
 * ```
 */
export async function createUser(data: CreateUserInput): Promise<User> {
  // Implementation
}
```

**Severity**: Medium

---

### 4.3 TODO/FIXME Comments (Low)

> "Use consistent TODO format with tracking."

**형식**: `// TODO(author): description (#issue)`

**예시**:

```typescript
// TODO(john): Implement caching for performance (#234)
// FIXME(jane): Memory leak when component unmounts (#345)
// HACK: Workaround for library bug, remove when v2.0 released (#456)
```

**Severity**: Low

---

## 5. Error Handling

### 5.1 Explicit Error Handling (High)

> "Handle errors explicitly, don't silence them."

**예시**:

```typescript
// ❌ Bad: 에러 무시
try {
  await riskyOperation();
} catch (e) {
  // 아무것도 안 함
}

// ❌ Bad: 일반적인 catch
try {
  await riskyOperation();
} catch (e) {
  console.log(e);
}

// ✅ Good: 명시적 처리
try {
  await riskyOperation();
} catch (error) {
  if (error instanceof ValidationError) {
    showValidationMessage(error.message);
  } else if (error instanceof NetworkError) {
    showRetryOption();
  } else {
    logger.error('Unexpected error', { error });
    throw error;  // 또는 적절히 처리
  }
}
```

**Severity**: High

---

### 5.2 Error Messages (Medium)

> "Provide helpful error messages."

**예시**:

```typescript
// ❌ Bad: 모호한 메시지
throw new Error('Error');
throw new Error('Invalid');
throw new Error('Failed');

// ✅ Good: 구체적인 메시지
throw new Error('User not found with ID: ' + userId);
throw new ValidationError('Email format invalid: expected user@domain.com');
throw new AuthError('Token expired. Please log in again.');
```

**Severity**: Medium

---

### 5.3 Custom Error Classes (Medium)

> "Use custom error classes for different error types."

**예시**:

```typescript
// Custom error classes
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 'NOT_FOUND', 404);
  }
}

// 사용
throw new NotFoundError('User', userId);
throw new ValidationError('Invalid email format', 'email');
```

**Severity**: Medium

---

## 6. TypeScript Best Practices

### 6.1 Avoid `any` (High)

> "Use proper types instead of `any`."

**예시**:

```typescript
// ❌ Bad
function process(data: any): any {
  return data.map((item: any) => item.value);
}

// ✅ Good
interface Item {
  value: number;
}

function process(data: Item[]): number[] {
  return data.map(item => item.value);
}

// ✅ Good: unknown for truly unknown types
function parseJSON(json: string): unknown {
  return JSON.parse(json);
}
```

**Severity**: High

---

### 6.2 Use Type Inference (Low)

> "Let TypeScript infer types when obvious."

**예시**:

```typescript
// ❌ Bad: 불필요한 타입 명시
const name: string = 'John';
const count: number = 42;
const items: string[] = ['a', 'b', 'c'];

// ✅ Good: 타입 추론 활용
const name = 'John';
const count = 42;
const items = ['a', 'b', 'c'];

// ✅ Good: 필요할 때만 명시
const emptyArray: string[] = [];
const map = new Map<string, User>();
```

**Severity**: Low

---

### 6.3 Prefer Interfaces for Objects (Low)

> "Use interfaces for object shapes, types for unions/intersections."

**예시**:

```typescript
// ✅ Interface for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Type for unions
type Status = 'pending' | 'active' | 'completed';

// ✅ Type for complex types
type UserWithPosts = User & { posts: Post[] };
type AsyncResult<T> = T | Promise<T>;
```

**Severity**: Low

---

## 7. Severity Reference

| Rule | Severity |
|------|----------|
| Variable Naming | High |
| Function Naming | High |
| Explicit Error Handling | High |
| Avoid `any` | High |
| File Structure | Medium |
| Export Conventions | Medium |
| Class/Interface Naming | Medium |
| When to Comment | Medium |
| JSDoc Comments | Medium |
| Error Messages | Medium |
| Custom Error Classes | Medium |
| Import Order | Low |
| Line Length | Low |
| Indentation | Low |
| Braces Style | Low |
| TODO/FIXME | Low |
| Type Inference | Low |
| Interface vs Type | Low |

---

*Version: 0.3.0*
*Last Updated: 2026-01-26*
