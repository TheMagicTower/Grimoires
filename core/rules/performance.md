# Performance Rules

성능 관련 코드 검증 규칙입니다. 효율적인 코드 작성과 성능 최적화 가이드라인을 정의합니다.

---

## 1. Frontend Performance

### 1.1 Bundle Size (High)

> "Keep bundle sizes small for fast initial load."

**기준**:

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Initial JS | < 100KB | > 200KB | > 500KB |
| Total JS | < 300KB | > 500KB | > 1MB |
| CSS | < 50KB | > 100KB | > 200KB |

**위반 탐지**:
- 대용량 라이브러리 전체 import
- 불필요한 polyfill
- 중복된 의존성

**예시**:

```typescript
// ❌ Bad: 전체 라이브러리 import
import _ from 'lodash';
import moment from 'moment';

// ✅ Good: 필요한 것만 import
import debounce from 'lodash/debounce';
import { format } from 'date-fns';

// ✅ Good: 동적 import
const ChartLib = lazy(() => import('heavy-chart-library'));
```

**Severity**: High

---

### 1.2 Image Optimization (Medium)

> "Optimize images for web delivery."

**체크리스트**:
- [ ] 적절한 포맷 사용 (WebP, AVIF)
- [ ] 반응형 이미지 (`srcset`)
- [ ] Lazy loading
- [ ] 적절한 압축

**예시**:

```tsx
// ❌ Bad: 최적화되지 않은 이미지
<img src="/large-image.png" />

// ✅ Good: 최적화된 이미지
<img
  src="/image.webp"
  srcSet="/image-400.webp 400w, /image-800.webp 800w"
  sizes="(max-width: 600px) 400px, 800px"
  loading="lazy"
  alt="Description"
/>

// Next.js
<Image
  src="/image.jpg"
  width={800}
  height={600}
  placeholder="blur"
  alt="Description"
/>
```

**Severity**: Medium

---

### 1.3 Render Performance (High)

> "Avoid unnecessary re-renders."

**위반 탐지 패턴**:
- inline 함수를 props로 전달
- 매 렌더마다 새 객체/배열 생성
- 불필요한 상태 업데이트

**예시**:

```tsx
// ❌ Bad: 매번 새 함수/객체 생성
function Parent() {
  return (
    <Child
      onClick={() => doSomething()}
      style={{ color: 'red' }}
      data={[1, 2, 3]}
    />
  );
}

// ✅ Good: 메모이제이션
function Parent() {
  const handleClick = useCallback(() => doSomething(), []);
  const style = useMemo(() => ({ color: 'red' }), []);
  const data = useMemo(() => [1, 2, 3], []);

  return <Child onClick={handleClick} style={style} data={data} />;
}

// ✅ Good: React.memo for pure components
const Child = React.memo(function Child({ onClick, style, data }) {
  // ...
});
```

**Severity**: High

---

### 1.4 Virtualization (Medium)

> "Use virtualization for long lists."

**기준**: 100개 이상의 아이템 렌더링 시 가상화 권장

**예시**:

```tsx
// ❌ Bad: 모든 아이템 렌더링
function List({ items }) {
  return (
    <ul>
      {items.map(item => <ListItem key={item.id} item={item} />)}
    </ul>
  );
}

// ✅ Good: 가상화 사용
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <ListItem
            key={items[virtualItem.index].id}
            item={items[virtualItem.index]}
            style={{
              transform: `translateY(${virtualItem.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

**Severity**: Medium

---

## 2. Backend Performance

### 2.1 N+1 Query Problem (High)

> "Avoid N+1 queries in database access."

**위반 탐지**:
- 루프 안에서 쿼리 실행
- 관계 데이터 개별 조회

**예시**:

```typescript
// ❌ Bad: N+1 쿼리
async function getPostsWithAuthors() {
  const posts = await db.post.findMany();

  for (const post of posts) {
    post.author = await db.user.findUnique({
      where: { id: post.authorId }
    });
  }

  return posts;
}

// ✅ Good: Join/Include 사용
async function getPostsWithAuthors() {
  return db.post.findMany({
    include: { author: true }
  });
}

// ✅ Good: DataLoader 패턴
const userLoader = new DataLoader(async (ids: number[]) => {
  const users = await db.user.findMany({
    where: { id: { in: ids } }
  });
  return ids.map(id => users.find(u => u.id === id));
});
```

**Severity**: High

---

### 2.2 Query Optimization (Medium)

> "Write efficient database queries."

**체크리스트**:
- [ ] 필요한 필드만 SELECT
- [ ] 적절한 인덱스 사용
- [ ] LIMIT 사용
- [ ] 복잡한 쿼리는 EXPLAIN 분석

**예시**:

```typescript
// ❌ Bad: 모든 필드 조회
const users = await db.user.findMany();

// ✅ Good: 필요한 필드만
const users = await db.user.findMany({
  select: { id: true, name: true, email: true }
});

// ❌ Bad: 전체 조회 후 필터링
const activeUsers = users.filter(u => u.active);

// ✅ Good: DB에서 필터링
const activeUsers = await db.user.findMany({
  where: { active: true },
  take: 100  // 페이지네이션
});
```

**Severity**: Medium

---

### 2.3 Caching Strategy (Medium)

> "Implement appropriate caching for frequently accessed data."

**캐싱 레벨**:

| Level | Use Case | TTL Example |
|-------|----------|-------------|
| Memory | Hot data | Seconds-Minutes |
| Redis | Shared cache | Minutes-Hours |
| CDN | Static assets | Hours-Days |
| Browser | Client cache | Varies |

**예시**:

```typescript
// In-memory cache
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 300 });

async function getUser(id: string) {
  const cached = cache.get<User>(`user:${id}`);
  if (cached) return cached;

  const user = await db.user.findUnique({ where: { id } });
  cache.set(`user:${id}`, user);
  return user;
}

// Redis cache
import Redis from 'ioredis';
const redis = new Redis();

async function getCachedData(key: string, fetcher: () => Promise<any>) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetcher();
  await redis.setex(key, 3600, JSON.stringify(data));
  return data;
}
```

**Severity**: Medium

---

### 2.4 Connection Pooling (High)

> "Use connection pooling for database connections."

**예시**:

```typescript
// ❌ Bad: 매 요청마다 새 연결
async function handleRequest() {
  const client = new Client(connectionString);
  await client.connect();
  const result = await client.query('SELECT ...');
  await client.end();
  return result;
}

// ✅ Good: Connection pool 사용
import { Pool } from 'pg';
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function handleRequest() {
  const client = await pool.connect();
  try {
    return await client.query('SELECT ...');
  } finally {
    client.release();
  }
}
```

**Severity**: High

---

## 3. Algorithm Performance

### 3.1 Time Complexity (High)

> "Choose efficient algorithms for operations."

**복잡도 기준**:

| Complexity | Acceptable For |
|------------|----------------|
| O(1) | Any size |
| O(log n) | Any size |
| O(n) | < 100K items |
| O(n log n) | < 10K items |
| O(n²) | < 1K items |
| O(n³) | < 100 items |

**예시**:

```typescript
// ❌ Bad: O(n²) 중복 체크
function hasDuplicates(arr: number[]): boolean {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}

// ✅ Good: O(n) Set 사용
function hasDuplicates(arr: number[]): boolean {
  return new Set(arr).size !== arr.length;
}

// ❌ Bad: O(n) 배열 검색
const index = arr.indexOf(target);

// ✅ Good: O(1) Map/Set 사용 (빈번한 검색 시)
const set = new Set(arr);
const hasTarget = set.has(target);
```

**Severity**: High

---

### 3.2 Space Complexity (Medium)

> "Be mindful of memory usage."

**예시**:

```typescript
// ❌ Bad: 불필요한 중간 배열
const result = arr
  .map(x => x * 2)
  .filter(x => x > 10)
  .map(x => x.toString());

// ✅ Good: 단일 순회
const result: string[] = [];
for (const x of arr) {
  const doubled = x * 2;
  if (doubled > 10) {
    result.push(doubled.toString());
  }
}

// ✅ Good: 또는 generator 사용
function* processItems(arr: number[]) {
  for (const x of arr) {
    const doubled = x * 2;
    if (doubled > 10) {
      yield doubled.toString();
    }
  }
}
```

**Severity**: Medium

---

## 4. Async Performance

### 4.1 Parallel Execution (High)

> "Execute independent async operations in parallel."

**예시**:

```typescript
// ❌ Bad: 순차 실행
async function fetchData() {
  const users = await fetchUsers();
  const posts = await fetchPosts();
  const comments = await fetchComments();
  return { users, posts, comments };
}

// ✅ Good: 병렬 실행
async function fetchData() {
  const [users, posts, comments] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchComments(),
  ]);
  return { users, posts, comments };
}

// ✅ Good: 일부 실패 허용
async function fetchData() {
  const results = await Promise.allSettled([
    fetchUsers(),
    fetchPosts(),
    fetchComments(),
  ]);

  return {
    users: results[0].status === 'fulfilled' ? results[0].value : [],
    posts: results[1].status === 'fulfilled' ? results[1].value : [],
    comments: results[2].status === 'fulfilled' ? results[2].value : [],
  };
}
```

**Severity**: High

---

### 4.2 Debounce/Throttle (Medium)

> "Rate limit expensive operations."

**예시**:

```typescript
import { debounce, throttle } from 'lodash';

// ❌ Bad: 매 키입력마다 검색
input.addEventListener('input', async (e) => {
  const results = await search(e.target.value);
  displayResults(results);
});

// ✅ Good: Debounce로 마지막 입력 후 실행
const debouncedSearch = debounce(async (query: string) => {
  const results = await search(query);
  displayResults(results);
}, 300);

input.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

// ✅ Good: Throttle로 주기적 실행
const throttledScroll = throttle(() => {
  updateScrollPosition();
}, 100);

window.addEventListener('scroll', throttledScroll);
```

**Severity**: Medium

---

### 4.3 Request Batching (Medium)

> "Batch multiple small requests into one."

**예시**:

```typescript
// ❌ Bad: 개별 요청
async function fetchUserDetails(userIds: string[]) {
  return Promise.all(
    userIds.map(id => fetch(`/api/users/${id}`))
  );
}

// ✅ Good: 배치 요청
async function fetchUserDetails(userIds: string[]) {
  return fetch('/api/users/batch', {
    method: 'POST',
    body: JSON.stringify({ ids: userIds }),
  });
}

// ✅ Good: DataLoader 패턴
const userLoader = new DataLoader(async (ids: string[]) => {
  const users = await fetchUsersBatch(ids);
  return ids.map(id => users.find(u => u.id === id));
});

// 사용: 자동으로 배치됨
const user1 = await userLoader.load('1');
const user2 = await userLoader.load('2');
```

**Severity**: Medium

---

## 5. Memory Management

### 5.1 Memory Leaks (High)

> "Prevent memory leaks in long-running processes."

**위반 탐지**:
- 정리되지 않는 이벤트 리스너
- 클리어되지 않는 타이머
- 증가하는 캐시
- 순환 참조

**예시**:

```typescript
// ❌ Bad: 정리되지 않는 리스너
function Component() {
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    // cleanup 없음!
  }, []);
}

// ✅ Good: cleanup 포함
function Component() {
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
}

// ✅ Good: WeakMap으로 순환 참조 방지
const cache = new WeakMap();

function cacheResult(obj: object, result: any) {
  cache.set(obj, result);
}
```

**Severity**: High

---

### 5.2 Large Object Handling (Medium)

> "Handle large data efficiently."

**예시**:

```typescript
// ❌ Bad: 대용량 파일 메모리 로드
const content = fs.readFileSync('huge-file.json', 'utf-8');
const data = JSON.parse(content);

// ✅ Good: Stream 사용
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import JSONStream from 'jsonstream';

const stream = createReadStream('huge-file.json')
  .pipe(JSONStream.parse('*'));

for await (const item of stream) {
  processItem(item);
}
```

**Severity**: Medium

---

## 6. Severity Reference

| Rule | Severity |
|------|----------|
| Bundle Size | High |
| Render Performance | High |
| N+1 Query | High |
| Connection Pooling | High |
| Time Complexity | High |
| Parallel Execution | High |
| Memory Leaks | High |
| Image Optimization | Medium |
| Virtualization | Medium |
| Query Optimization | Medium |
| Caching Strategy | Medium |
| Space Complexity | Medium |
| Debounce/Throttle | Medium |
| Request Batching | Medium |
| Large Object Handling | Medium |

---

*Version: 0.3.0*
*Last Updated: 2026-01-26*
