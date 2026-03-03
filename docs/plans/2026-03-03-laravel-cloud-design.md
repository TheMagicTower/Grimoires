# Laravel Cloud CLI Skill Design

**Date:** 2026-03-03
**Status:** Approved

---

## 1. Overview

Laravel Cloud CLI 스킬은 Laravel Cloud 플랫폼의 CLI 도구를 Grimoires와 통합하여 자동화합니다. 단일 통합 스펠과 개별 기능 스펠을 모두 제공합니다.

---

## 2. Architecture

### 2.1 Call Patterns

| Pattern | Example | Description |
|---------|---------|-------------|
| Integrated | `/cast:laravel-cloud` | 대화형 메뉴로 전체 기능 접근 |
| Individual | `/laravel-cloud:deploy` | 개별 기능 직접 호출 |
| Sub-command | `/laravel-cloud:db create` | 하위 명령 실행 |

### 2.2 Component Structure

```
core/spells/
├── cast-laravel-cloud.md      # 통합 스펠
├── laravel-cloud/
│   ├── deploy.md              # 배포 스펠
│   ├── db.md                  # 데이터베이스 스펠
│   ├── environment.md         # 환경 스펠
│   ├── instance.md            # 인스턴스 스펠
│   ├── cache.md               # 캐시 스펠
│   ├── bucket.md              # 스토리지 스펠
│   ├── domain.md              # 도메인 스펠
│   ├── websocket.md           # 웹소켓 스펠
│   ├── background.md          # 백그라운드 프로세스 스펠
│   └── command.md             # 명령 실행 스펠
```

---

## 3. Individual Spells

### 3.1 `/laravel-cloud:deploy`

**Commands:**
- `cloud deploy` - 애플리케이션 배포
- `cloud deploy --open` - 배포 후 브라우저 열기
- `cloud deploy:monitor` - 배포 모니터링
- `cloud ship` - 앱 생성, 환경 설정, 배포 (통합)

### 3.2 `/laravel-cloud:db`

**Commands:**
- `cloud database:list` - 데이터베이스 목록
- `cloud database:create` - 데이터베이스 생성
- `cloud database:open` - 로컬에서 데이터베이스 연결
- `cloud database-cluster:list` - 클러스터 목록
- `cloud database-cluster:create` - 클러스터 생성
- `cloud database-snapshot:*` - 스냅샷 관리

### 3.3 `/laravel-cloud:environment`

**Commands:**
- `cloud environment:list` - 환경 목록
- `cloud environment:create` - 환경 생성
- `cloud environment:variables` - 환경 변수 관리
- `cloud environment:logs` - 로그 확인

### 3.4 `/laravel-cloud:instance`

**Commands:**
- `cloud instance:list` - 인스턴스 목록
- `cloud instance:create` - 인스턴스 생성
- `cloud instance:update` - 인스턴스 수정
- `cloud instance:delete` - 인스턴스 삭제
- `cloud instance:sizes` - 사용 가능한 크기 목록

### 3.5 `/laravel-cloud:cache`

**Commands:**
- `cloud cache:list` - 캐시 목록
- `cloud cache:create` - 캐시 생성
- `cloud cache:update` - 캐시 수정
- `cloud cache:delete` - 캐시 삭제
- `cloud cache:types` - 사용 가능한 캐시 유형

### 3.6 `/laravel-cloud:bucket`

**Commands:**
- `cloud bucket:list` - 버킷 목록
- `cloud bucket:create` - 버킷 생성
- `cloud bucket:delete` - 버킷 삭제
- `cloud bucket-key:*` - 버킷 키 관리

### 3.7 `/laravel-cloud:domain`

**Commands:**
- `cloud domain:list` - 도메인 목록
- `cloud domain:create` - 도메인 생성
- `cloud domain:verify` - 도메인 검증
- `cloud domain:delete` - 도메인 삭제

### 3.8 `/laravel-cloud:websocket`

**Commands:**
- `cloud websocket-cluster:list` - 웹소켓 클러스터 목록
- `cloud websocket-cluster:create` - 웹소켓 클러스터 생성
- `cloud websocket-application:list` - 웹소켓 앱 목록
- `cloud websocket-application:create` - 웹소켓 앱 생성

### 3.9 `/laravel-cloud:background`

**Commands:**
- `cloud background-process:list` - 백그라운드 프로세스 목록
- `cloud background-process:create` - 백그라운드 프로세스 생성
- `cloud background-process:delete` - 백그라운드 프로세스 삭제

### 3.10 `/laravel-cloud:command`

**Commands:**
- `cloud command:run` - 일회성 명령어 실행
- `cloud command:list` - 명령어 목록
- `cloud command:get` - 명령어 실행 결과 조회

---

## 4. Integrated Spell: `/cast:laravel-cloud`

### 4.1 Interactive Menu

```
🔮 Laravel Cloud CLI

Select operation category:
[1] Deploy & Ship
[2] Database
[3] Environment
[4] Instance
[5] Cache
[6] Storage (Bucket)
[7] Domain
[8] WebSocket
[9] Background Process
[10] Command Runner
[11] Utility (dashboard, browser, IP)
[12] Exit
```

### 4.2 JSON Output Support

모든 명령에 `--json` 플래그 자동 적용选项支持 for CI/CD:

```yaml
# 예: 환경 변수 설정
cloud environment:variables --json --action=set --key=APP_ENV --value=production
```

---

## 5. Prerequisites & Validation

### 5.1 Required Tools

- `cloud` - Laravel Cloud CLI (composer global require laravel/cloud-cli)
- `composer` - PHP 의존성 관리
- Git - 버전 관리

### 5.2 Authentication

- `cloud auth` - 브라우저 OAuth 인증
- `cloud auth:token --add` - 토큰 기반 인증

### 5.3 Pre-flight Checks

1. Laravel Cloud CLI 설치 확인
2. 인증 상태 확인 (`cloud auth:token --list`)
3. 프로젝트 연결 확인 (`cloud repo:config`)

---

## 6. Error Handling

| Error | Handling |
|-------|----------|
| CLI not installed | 설치 안내 및 명령 제공 |
| Not authenticated | 인증 프로세스 시작 |
| Command failed | 에러 메시지 파싱, FixHive 연동 |
| Deployment failed | 로그 분석, 재시도 옵션 |

---

## 7. Related Spells

| Spell | Relationship |
|-------|--------------|
| `/cast:summon` | Laravel 프로젝트 감지 시 제안 |
| `/cast:dev` | Laravel Cloud 배포 통합 가능 |
| `/cast:fix` | Laravel Cloud 에러 해결 |

---

## 8. Implementation Priority

1. **Phase 1** - `/cast:laravel-cloud` + deploy, db, environment
2. **Phase 2** - instance, cache, bucket
3. **Phase 3** - domain, websocket, background
4. **Phase 4** - command, utility

---

*Approved: 2026-03-03*
