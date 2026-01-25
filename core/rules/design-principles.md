# Design Principles Rules

Reviewer Familiar가 코드 검증에 사용하는 설계 원칙 규칙 정의입니다.

---

## 1. SOLID Principles

### 1.1 Single Responsibility Principle (SRP)

> "A class should have only one reason to change."

**설명**: 클래스/함수는 하나의 책임만 가져야 합니다.

**위반 탐지**:
- 함수가 여러 작업을 순차적으로 수행
- 클래스가 관련 없는 메서드를 포함
- "and"가 필요한 함수/클래스 설명

**예시**:

```typescript
// ❌ Bad: 여러 책임
class UserService {
  createUser(data: UserData) { /* ... */ }
  sendWelcomeEmail(user: User) { /* ... */ }
  generateReport(users: User[]) { /* ... */ }
}

// ✅ Good: 단일 책임
class UserService {
  createUser(data: UserData) { /* ... */ }
}

class EmailService {
  sendWelcomeEmail(user: User) { /* ... */ }
}

class ReportService {
  generateUserReport(users: User[]) { /* ... */ }
}
```

**Severity**: High

---

### 1.2 Open/Closed Principle (OCP)

> "Software entities should be open for extension, but closed for modification."

**설명**: 기존 코드 수정 없이 기능을 확장할 수 있어야 합니다.

**위반 탐지**:
- 새 기능 추가 시 기존 코드 수정 필요
- switch/if-else 체인으로 타입 분기
- 하드코딩된 조건문

**예시**:

```typescript
// ❌ Bad: 새 결제 방식 추가 시 수정 필요
function processPayment(type: string, amount: number) {
  if (type === 'credit') {
    // credit card logic
  } else if (type === 'paypal') {
    // paypal logic
  }
  // 새 방식 추가마다 여기 수정 필요
}

// ✅ Good: 확장에 열림, 수정에 닫힘
interface PaymentProcessor {
  process(amount: number): Promise<Result>;
}

class CreditCardProcessor implements PaymentProcessor {
  async process(amount: number) { /* ... */ }
}

class PayPalProcessor implements PaymentProcessor {
  async process(amount: number) { /* ... */ }
}

// 새 방식 추가 시 새 클래스만 생성
class CryptoProcessor implements PaymentProcessor {
  async process(amount: number) { /* ... */ }
}
```

**Severity**: Medium

---

### 1.3 Liskov Substitution Principle (LSP)

> "Subtypes must be substitutable for their base types."

**설명**: 자식 클래스는 부모 클래스를 대체할 수 있어야 합니다.

**위반 탐지**:
- 자식 클래스가 부모 메서드를 빈 구현으로 오버라이드
- 자식이 부모보다 더 제한적인 전제조건 요구
- instanceof 체크 후 다른 동작

**예시**:

```typescript
// ❌ Bad: Square는 Rectangle을 대체할 수 없음
class Rectangle {
  setWidth(w: number) { this.width = w; }
  setHeight(h: number) { this.height = h; }
}

class Square extends Rectangle {
  setWidth(w: number) {
    this.width = w;
    this.height = w; // 예상치 못한 동작
  }
}

// ✅ Good: 별도의 타입으로 분리
interface Shape {
  getArea(): number;
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  getArea() { return this.width * this.height; }
}

class Square implements Shape {
  constructor(private side: number) {}
  getArea() { return this.side * this.side; }
}
```

**Severity**: High

---

### 1.4 Interface Segregation Principle (ISP)

> "Clients should not be forced to depend on interfaces they do not use."

**설명**: 인터페이스는 작고 구체적이어야 합니다.

**위반 탐지**:
- 구현체가 사용하지 않는 메서드를 빈 구현
- 하나의 거대한 인터페이스
- "Fat interface" 패턴

**예시**:

```typescript
// ❌ Bad: 모든 것을 포함하는 거대 인터페이스
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  code(): void;
  design(): void;
}

// Robot은 eat, sleep을 구현할 수 없음
class Robot implements Worker {
  work() { /* ... */ }
  eat() { throw new Error('Robots cannot eat'); }
  sleep() { throw new Error('Robots cannot sleep'); }
  // ...
}

// ✅ Good: 분리된 인터페이스
interface Workable {
  work(): void;
}

interface Feedable {
  eat(): void;
}

interface Sleepable {
  sleep(): void;
}

class Human implements Workable, Feedable, Sleepable {
  work() { /* ... */ }
  eat() { /* ... */ }
  sleep() { /* ... */ }
}

class Robot implements Workable {
  work() { /* ... */ }
}
```

**Severity**: Medium

---

### 1.5 Dependency Inversion Principle (DIP)

> "High-level modules should not depend on low-level modules. Both should depend on abstractions."

**설명**: 구체적인 구현이 아닌 추상화에 의존해야 합니다.

**위반 탐지**:
- 직접 `new` 키워드로 의존성 생성
- 구체 클래스에 직접 의존
- 테스트 시 모킹 어려움

**예시**:

```typescript
// ❌ Bad: 구체 클래스에 직접 의존
class UserService {
  private db = new MySQLDatabase(); // 직접 의존

  getUser(id: string) {
    return this.db.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// ✅ Good: 추상화에 의존
interface Database {
  query(sql: string): Promise<any>;
}

class UserService {
  constructor(private db: Database) {} // 주입받음

  getUser(id: string) {
    return this.db.query(`SELECT * FROM users WHERE id = ?`, [id]);
  }
}

// 사용 시
const mysqlDb = new MySQLDatabase();
const userService = new UserService(mysqlDb);

// 테스트 시
const mockDb = new MockDatabase();
const testService = new UserService(mockDb);
```

**Severity**: High

---

## 2. General Principles

### 2.1 DRY (Don't Repeat Yourself)

> "Every piece of knowledge must have a single, unambiguous, authoritative representation within a system."

**설명**: 동일한 로직을 반복하지 마세요.

**위반 탐지**:
- 동일한 코드 블록이 3회 이상 반복
- 비슷한 함수가 여러 개 존재
- 매직 넘버/스트링 반복 사용

**예시**:

```typescript
// ❌ Bad: 반복되는 검증 로직
function validateEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function checkUserEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 중복!
  if (!regex.test(email)) throw new Error('Invalid email');
}

// ✅ Good: 단일 정의
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function validateEmail(email: string): void {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email');
  }
}
```

**Severity**: Medium

---

### 2.2 KISS (Keep It Simple, Stupid)

> "Simplicity is the ultimate sophistication."

**설명**: 가장 단순한 해결책을 선택하세요.

**위반 탐지**:
- 불필요한 추상화 계층
- 과도한 디자인 패턴 적용
- 이해하기 어려운 "영리한" 코드

**예시**:

```typescript
// ❌ Bad: 과도한 복잡성
class NumberAdderFactory {
  createAdder() {
    return new NumberAdder();
  }
}

class NumberAdder {
  add(a: number, b: number): number {
    return new AdditionStrategy().execute(a, b);
  }
}

class AdditionStrategy {
  execute(a: number, b: number): number {
    return a + b;
  }
}

// ✅ Good: 단순함
function add(a: number, b: number): number {
  return a + b;
}
```

**Severity**: Medium

---

### 2.3 YAGNI (You Aren't Gonna Need It)

> "Always implement things when you actually need them, never when you just foresee that you need them."

**설명**: 현재 필요한 것만 구현하세요.

**위반 탐지**:
- 사용되지 않는 파라미터/옵션
- "나중을 위한" 빈 메서드
- 미래 요구사항을 위한 추상화

**예시**:

```typescript
// ❌ Bad: 필요하지 않은 기능
interface UserOptions {
  name: string;
  email: string;
  futureField1?: string;  // "나중에 쓸 거야"
  futureField2?: string;  // "언젠가 필요할 거야"
  enableFeatureX?: boolean; // 아직 없는 기능
}

// ✅ Good: 현재 필요한 것만
interface UserOptions {
  name: string;
  email: string;
}
```

**Severity**: Low

---

### 2.4 Separation of Concerns

> "Each module should address a separate concern."

**설명**: 관심사를 분리하여 모듈화하세요.

**위반 탐지**:
- UI 로직과 비즈니스 로직 혼합
- 데이터 접근과 비즈니스 규칙 혼합
- 한 파일에 여러 레이어 로직

**예시**:

```typescript
// ❌ Bad: 관심사 혼합
async function handleSubmit(formData: FormData) {
  // UI 로직
  showSpinner();

  // 검증 로직
  if (!formData.email.includes('@')) {
    showError('Invalid email');
    return;
  }

  // 데이터 접근
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(formData)
  });

  // 또 UI 로직
  hideSpinner();
  showSuccess('User created');
}

// ✅ Good: 관심사 분리
// validation.ts
function validateUserData(data: UserData): ValidationResult { /* ... */ }

// api.ts
async function createUser(data: UserData): Promise<User> { /* ... */ }

// ui.ts
async function handleSubmit(formData: FormData) {
  const validation = validateUserData(formData);
  if (!validation.valid) {
    showError(validation.errors);
    return;
  }

  setLoading(true);
  try {
    await createUser(formData);
    showSuccess('User created');
  } finally {
    setLoading(false);
  }
}
```

**Severity**: Medium

---

### 2.5 Law of Demeter

> "Only talk to your immediate friends."

**설명**: 객체는 직접 아는 객체와만 상호작용해야 합니다.

**위반 탐지**:
- 메서드 체이닝 깊이 > 2
- `a.getB().getC().doSomething()` 패턴
- 내부 구조 노출

**예시**:

```typescript
// ❌ Bad: 깊은 체이닝
function getCustomerCity(order: Order): string {
  return order.getCustomer().getAddress().getCity();
}

// ✅ Good: 직접 메서드 제공
class Order {
  getCustomerCity(): string {
    return this.customer.getCity();
  }
}

class Customer {
  getCity(): string {
    return this.address.city;
  }
}

function getCustomerCity(order: Order): string {
  return order.getCustomerCity();
}
```

**Severity**: Low

---

### 2.6 Curly's Law

> "A thing should do one thing and do it well."

**설명**: 변수, 함수, 클래스는 하나의 의미만 가져야 합니다.

**위반 탐지**:
- 변수가 여러 용도로 재사용
- 함수가 컨텍스트에 따라 다른 동작
- 모호한 네이밍

**예시**:

```typescript
// ❌ Bad: 하나의 변수가 여러 의미
let data = fetchUserData();
data = transformData(data);
data = validateData(data);
// 'data'가 어떤 상태인지 불명확

// ✅ Good: 명확한 의미
const rawUserData = fetchUserData();
const transformedData = transformData(rawUserData);
const validatedData = validateData(transformedData);
```

**Severity**: Low

---

### 2.7 Fail Fast

> "If a failure is going to happen, make it happen as early as possible."

**설명**: 오류는 가능한 빨리 발생시키세요.

**위반 탐지**:
- 함수 중간/끝에서 입력 검증
- 오류 무시 후 진행
- 늦은 예외 발생

**예시**:

```typescript
// ❌ Bad: 늦은 검증
function processOrder(order: Order) {
  // 많은 처리...
  calculateTax(order);
  applyDiscounts(order);

  // 여기서야 검증
  if (!order.items || order.items.length === 0) {
    throw new Error('Order must have items');
  }

  // 더 많은 처리...
}

// ✅ Good: 빠른 검증
function processOrder(order: Order) {
  // 먼저 검증
  if (!order.items || order.items.length === 0) {
    throw new Error('Order must have items');
  }

  if (!order.customerId) {
    throw new Error('Customer ID required');
  }

  // 검증 통과 후 처리
  calculateTax(order);
  applyDiscounts(order);
  // ...
}
```

**Severity**: Medium

---

### 2.8 POLA (Principle of Least Astonishment)

> "A component should behave in a way that most users will expect it to behave."

**설명**: 예상 가능한 방식으로 동작해야 합니다.

**위반 탐지**:
- 함수 이름과 다른 동작
- 숨겨진 부작용
- 비직관적인 반환값

**예시**:

```typescript
// ❌ Bad: 놀라운 동작
function getUser(id: string) {
  const user = db.findUser(id);
  user.lastAccessed = new Date(); // 부작용!
  db.save(user);                  // 'get'인데 저장?
  return user;
}

// ✅ Good: 예상 가능한 동작
function getUser(id: string) {
  return db.findUser(id); // 순수하게 조회만
}

function updateLastAccessed(user: User) {
  user.lastAccessed = new Date();
  return db.save(user);
}
```

**Severity**: Medium

---

### 2.9 Composition over Inheritance

> "Favor object composition over class inheritance."

**설명**: 상속보다 합성을 선호하세요.

**위반 탐지**:
- 상속 깊이 > 2
- "is-a" 관계가 아닌데 상속 사용
- 부모 기능 일부만 필요한 상속

**예시**:

```typescript
// ❌ Bad: 깊은 상속
class Animal { }
class Mammal extends Animal { }
class Dog extends Mammal { }
class Bulldog extends Dog { }
class FrenchBulldog extends Bulldog { }

// ✅ Good: 합성
interface Walkable {
  walk(): void;
}

interface Barkable {
  bark(): void;
}

class Dog implements Walkable, Barkable {
  private walker = new WalkBehavior();
  private barker = new BarkBehavior();

  walk() { this.walker.walk(); }
  bark() { this.barker.bark(); }
}
```

**Severity**: Medium

---

### 2.10 Defensive Programming

> "Assume nothing, verify everything."

**설명**: 입력과 상태를 항상 검증하세요.

**위반 탐지**:
- 외부 입력 무검증 사용
- null/undefined 체크 없음
- 타입 단언 남용 (`as`)

**예시**:

```typescript
// ❌ Bad: 방어 없음
function greetUser(user: User) {
  console.log(`Hello, ${user.name.toUpperCase()}`);
  // user가 null이면? name이 없으면?
}

// ✅ Good: 방어적 프로그래밍
function greetUser(user: User | null | undefined) {
  if (!user) {
    console.log('Hello, Guest');
    return;
  }

  const name = user.name ?? 'User';
  console.log(`Hello, ${name.toUpperCase()}`);
}
```

**Severity**: High

---

### 2.11 Boy Scout Rule

> "Leave the code better than you found it."

**설명**: 코드를 수정할 때 주변도 조금씩 개선하세요.

**위반 탐지**:
- 변경 후 품질 메트릭 악화
- 새 코드 스멜 추가
- 기존 문제 무시

**측정 방법**:
```
변경 전 품질 점수 vs 변경 후 품질 점수
- Complexity
- Duplication
- Test coverage
```

**Severity**: Low

---

## 3. Modularity Rules

### 3.1 File Size Limits

| Metric | Limit | Severity |
|--------|-------|----------|
| Lines per file | 300 | Medium |
| Lines per function | 50 | Medium |
| Parameters per function | 5 | Low |
| Nesting depth | 4 | Medium |

### 3.2 Complexity Limits

| Metric | Limit | Severity |
|--------|-------|----------|
| Cyclomatic complexity | 10 | High |
| Cognitive complexity | 15 | Medium |
| Coupling (afferent) | 10 | Medium |
| Coupling (efferent) | 10 | Medium |

---

## 4. Naming Conventions

### 4.1 Variables & Functions

| Type | Convention | Example |
|------|------------|---------|
| Variable | camelCase | `userName`, `isValid` |
| Function | camelCase, verb | `getUser`, `validateEmail` |
| Boolean | is/has/can prefix | `isActive`, `hasPermission` |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_URL` |

### 4.2 Classes & Types

| Type | Convention | Example |
|------|------------|---------|
| Class | PascalCase, noun | `UserService`, `OrderRepository` |
| Interface | PascalCase | `Serializable`, `UserData` |
| Type | PascalCase | `RequestOptions`, `ApiResponse` |
| Enum | PascalCase | `Status`, `Color` |

### 4.3 Files & Directories

| Type | Convention | Example |
|------|------------|---------|
| Component file | PascalCase | `UserProfile.tsx` |
| Utility file | camelCase | `formatDate.ts` |
| Test file | *.test.ts | `auth.test.ts` |
| Directory | kebab-case | `user-management/` |

---

## 5. Severity Reference

| Principle | Default Severity |
|-----------|-----------------|
| SRP | High |
| OCP | Medium |
| LSP | High |
| ISP | Medium |
| DIP | High |
| DRY | Medium |
| KISS | Medium |
| YAGNI | Low |
| Separation of Concerns | Medium |
| Law of Demeter | Low |
| Curly's Law | Low |
| Fail Fast | Medium |
| POLA | Medium |
| Composition over Inheritance | Medium |
| Defensive Programming | High |
| Boy Scout Rule | Low |

---

*Version: 0.1.0*
*Last Updated: 2026-01-25*
