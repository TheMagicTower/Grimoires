# Laravel Cloud CLI Skill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Laravel Cloud CLI 스킬을 Grimoires에 추가하여 `/cast:laravel-cloud` 및 `/laravel-cloud:*` 명령으로 Laravel Cloud 기능을 사용할 수 있도록 합니다.

**Architecture:** Grimoires의 plugin/skills/ 구조를 따르며, 통합 스펠(`laravel-cloud`)과 개별 기능 스펠(deploy, db, environment 등)로 나뉩니다. 각 스펠은 YAML frontmatter로 메타데이터를 정의하고 markdown으로 상세 내용을 기술합니다.

**Tech Stack:** Grimoires 스킬 포맷 (Markdown + YAML frontmatter)

---

## Phase 1: 통합 스펠 및 핵심 기능 (deploy, db, environment)

### Task 1: 통합 스펠 `/cast:laravel-cloud` 생성

**Files:**
- Create: `plugin/skills/laravel-cloud/SKILL.md`

**Step 1: Create laravel-cloud SKILL.md**

```markdown
---
name: laravel-cloud
description: Laravel Cloud CLI 통합 관리 (배포, DB, 환경, 인스턴스 등)
---

# /cast:laravel-cloud Spell

Laravel Cloud CLI의 통합 인터페이스입니다.

## Usage

```
/cast:laravel-cloud                    # 대화형 메뉴
/cast:laravel-cloud deploy             # 배포 메뉴
/cast:laravel-cloud db                 # 데이터베이스 메뉴
/cast:laravel-cloud environment        # 환경 메뉴
/cast:laravel-cloud instance          # 인스턴스 메뉴
/cast:laravel-cloud cache              # 캐시 메뉴
/cast:laravel-cloud bucket             # 스토리지 메뉴
/cast:laravel-cloud domain             # 도메인 메뉴
/cast:laravel-cloud websocket          # 웹소켓 메뉴
/cast:laravel-cloud background         # 백그라운드 프로세스 메뉴
/cast:laravel-cloud command            # 명령 실행 메뉴
```

## Interactive Menu

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

## Prerequisites

1. Laravel Cloud CLI 설치:
   ```bash
   composer global require laravel/cloud-cli
   ```

2. 인증:
   ```bash
   cloud auth                    # 브라우저 OAuth
   cloud auth:token --add       # 토큰 추가
   ```

## Pre-flight Checks

모든 명령 실행 전:
1. CLI 설치 확인
2. 인증 상태 확인
3. 프로젝트 연결 확인

## Available Commands

### Deploy & Ship
- `cloud deploy` - 애플리케이션 배포
- `cloud deploy --open` - 배포 후 브라우저 열기
- `cloud deploy:monitor` - 배포 모니터링
- `cloud ship` - 앱 생성, 환경 설정, 배포

### Database
- `cloud database:list` - DB 목록
- `cloud database:create` - DB 생성
- `cloud database:open` - 로컬 연결
- `cloud database-cluster:*` - 클러스터 관리
- `cloud database-snapshot:*` - 스냅샷 관리

### Environment
- `cloud environment:list` - 환경 목록
- `cloud environment:create` - 환경 생성
- `cloud environment:variables` - 환경 변수
- `cloud environment:logs` - 로그 확인

### Instance
- `cloud instance:list` - 인스턴스 목록
- `cloud instance:create` - 인스턴스 생성
- `cloud instance:sizes` - 사용 가능한 크기

### Cache
- `cloud cache:list` - 캐시 목록
- `cloud cache:create` - 캐시 생성

### Storage
- `cloud bucket:list` - 버킷 목록
- `cloud bucket:create` - 버킷 생성

### Domain
- `cloud domain:list` - 도메인 목록
- `cloud domain:create` - 도메인 생성

### WebSocket
- `cloud websocket-cluster:*` - 웹소켓 클러스터
- `cloud websocket-application:*` - 웹소켓 앱

### Background Process
- `cloud background-process:*` - 백그라운드 프로세스

### Command
- `cloud command:run` - 명령 실행
- `cloud command:list` - 명령 목록

### Utility
- `cloud dashboard` - 대시보드 열기
- `cloud browser` - 브라우저 열기
- `cloud ip:addresses` - IP 주소 조회

## JSON Output

CI/CD를 위한 JSON 출력 지원:
```bash
cloud instance:list --json
cloud environment:variables --json --action=set --key=APP_ENV --value=production
```

## Related Spells

| Spell | Description |
|-------|-------------|
| `/laravel-cloud:deploy` | 배포 전용 |
| `/laravel-cloud:db` | 데이터베이스 전용 |
| `/laravel-cloud:environment` | 환경 전용 |
| `/laravel-cloud:instance` | 인스턴스 전용 |
| `/laravel-cloud:cache` | 캐시 전용 |
| `/laravel-cloud:bucket` | 스토리지 전용 |
| `/laravel-cloud:domain` | 도메인 전용 |
| `/laravel-cloud:websocket` | 웹소켓 전용 |
| `/laravel-cloud:background` | 백그라운드 전용 |
| `/laravel-cloud:command` | 명령 실행 전용 |
```
```

**Step 2: Commit**

```bash
git add plugin/skills/laravel-cloud/SKILL.md
git commit -m "feat: add /cast:laravel-cloud integrated spell"
```

---

### Task 2: 개별 스펠 생성 (Phase 1)

#### 2.1 `/laravel-cloud:deploy` 스펠

**Files:**
- Create: `plugin/skills/laravel-cloud-deploy/SKILL.md`

**Step 1: Create SKILL.md**

```markdown
---
name: laravel-cloud-deploy
description: Laravel Cloud 배포 관리 (cloud deploy, cloud ship)
---

# /laravel-cloud:deploy Spell

Laravel Cloud 애플리케이션 배포 스펠입니다.

## Usage

```
/laravel-cloud:deploy                    # 배포 실행
/laravel-cloud:deploy --open             # 배포 후 브라우저 열기
/laravel-cloud:deploy --monitor          # 배포 모니터링
/laravel-cloud:ship                       # 앱 생성 + 환경 설정 + 배포
```

## Commands

### cloud deploy
애플리케이션을 배포합니다.

```bash
cloud deploy
cloud deploy --open
```

### cloud deploy:monitor
진행 중인 배포를 모니터링합니다.

```bash
cloud deploy:monitor
```

### cloud ship
앱 생성, 환경 설정, 배포를 한 번에 수행합니다.

```bash
cloud ship
```

## Prerequisites

- Laravel Cloud CLI 설치: `composer global require laravel/cloud-cli`
- 인증 완료: `cloud auth`

## Pre-flight

1. CLI 설치 확인
2. 인증 상태 확인
3. repo:config로 프로젝트 연결 확인
```

#### 2.2 `/laravel-cloud:db` 스펠

**Files:**
- Create: `plugin/skills/laravel-cloud-db/SKILL.md`

```markdown
---
name: laravel-cloud-db
description: Laravel Cloud 데이터베이스 관리
---

# /laravel-cloud:db Spell

Laravel Cloud 데이터베이스 관리 스펠입니다.

## Usage

```
/laravel-cloud:db list                    # DB 목록
/laravel-cloud:db create                  # DB 생성
/laravel-cloud:db open                   # 로컬 연결
/laravel-cloud:db cluster list           # 클러스터 목록
/laravel-cloud:db cluster create         # 클러스터 생성
/laravel-cloud:db snapshot list          # 스냅샷 목록
/laravel-cloud:db snapshot create        # 스냅샷 생성
/laravel-cloud:db restore                # 복원
```

## Commands

### Database
```bash
cloud database:list
cloud database:create
cloud database:open
```

### Database Cluster
```bash
cloud database-cluster:list
cloud database-cluster:create
cloud database-cluster:delete
```

### Database Snapshot
```bash
cloud database-snapshot:list
cloud database-snapshot:create
cloud database-restore:create
```

## Related Spells

| Spell | Description |
|-------|-------------|
| `/cast:laravel-cloud` | 통합 메뉴 |
| `/laravel-cloud:environment` | 환경 변수 |
```

#### 2.3 `/laravel-cloud:environment` 스펠

**Files:**
- Create: `plugin/skills/laravel-cloud-environment/SKILL.md`

```markdown
---
name: laravel-cloud-environment
description: Laravel Cloud 환경 관리
---

# /laravel-cloud:environment Spell

Laravel Cloud 환경 관리 스펠입니다.

## Usage

```
/laravel-cloud:environment list           # 환경 목록
/laravel-cloud:environment get            # 환경 상세
/laravel-cloud:environment create         # 환경 생성
/laravel-cloud:environment update         # 환경 수정
/laravel-cloud:environment delete         # 환경 삭제
/laravel-cloud:environment variables     # 환경 변수
/laravel-cloud:environment logs           # 로그 확인
```

## Commands

### Environment
```bash
cloud environment:list
cloud environment:get
cloud environment:create
cloud environment:update
cloud environment:delete
```

### Environment Variables
```bash
cloud environment:variables
cloud environment:variables --json --action=set --key=KEY --value=value
cloud environment:variables --json --action=get --key=KEY
cloud environment:variables --json --action=delete --key=KEY
```

### Logs
```bash
cloud environment:logs
cloud environment:logs --follow
```

## Related Spells

| Spell | Description |
|-------|-------------|
| `/cast:laravel-cloud` | 통합 메뉴 |
| `/laravel-cloud:db` | 데이터베이스 |
| `/laravel-cloud:deploy` | 배포 |
```

**Step 2: Commit Phase 1**

```bash
git add plugin/skills/laravel-cloud-deploy/SKILL.md plugin/skills/laravel-cloud-db/SKILL.md plugin/skills/laravel-cloud-environment/SKILL.md
git commit -m "feat: add laravel-cloud deploy, db, environment spells (Phase 1)"
```

---

## Phase 2: 인프라 기능 (instance, cache, bucket)

### Task 3: `/laravel-cloud:instance` 스펠

**Files:**
- Create: `plugin/skills/laravel-cloud-instance/SKILL.md`

### Task 4: `/laravel-cloud:cache` 스펠

**Files:**
- Create: `plugin/skills/laravel-cloud-cache/SKILL.md`

### Task 5: `/laravel-cloud:bucket` 스펠

**Files:**
- Create: `plugin/skills/laravel-cloud-bucket/SKILL.md`

**Step 3: Commit Phase 2**

```bash
git add plugin/skills/laravel-cloud-*/
git commit -m "feat: add laravel-cloud instance, cache, bucket spells (Phase 2)"
```

---

## Phase 3: 앱 관리 (domain, websocket, background)

### Task 6: `/laravel-cloud:domain` 스펠

**Files:**
- Create: `plugin/skills/laravel-cloud-domain/SKILL.md`

### Task 7: `/laravel-cloud:websocket` 스펠

**Files:**
- Create: `plugin/skills/laravel-cloud-websocket/SKILL.md`

### Task 8: `/laravel-cloud:background` 스펠

**Files:**
- Create: `plugin/skills/laravel-cloud-background/SKILL.md`

**Step 4: Commit Phase 3**

```bash
git add plugin/skills/laravel-cloud-*/
git commit -m "feat: add laravel-cloud domain, websocket, background spells (Phase 3)"
```

---

## Phase 4: 유틸리티 (command, utility)

### Task 9: `/laravel-cloud:command` 스펠

**Files:**
- Create: `plugin/skills/laravel-cloud-command/SKILL.md`

### Task 10: 스펠 등록 확인

**Files:**
- Modify: `plugin/skills/*/SKILL.md` (필요시)
- Check: `scripts/setup-skills.sh`

**Step 5: Commit Phase 4**

```bash
git add plugin/skills/laravel-cloud-command/SKILL.md
git commit -m "feat: add laravel-cloud command spell (Phase 4)"
```

---

## Task Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | 통합 스펠 `/cast:laravel-cloud` | plugin/skills/laravel-cloud/SKILL.md |
| 2 | Phase 1: deploy, db, environment | 3 SKILL.md files |
| 3 | Phase 2: instance, cache, bucket | 3 SKILL.md files |
| 4 | Phase 3: domain, websocket, background | 3 SKILL.md files |
| 5 | Phase 4: command | 1 SKILL.md file |

---

*Plan created: 2026-03-03*
