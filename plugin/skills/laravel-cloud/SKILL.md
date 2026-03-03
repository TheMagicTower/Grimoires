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
/cast:laravel-cloud background        # 백그라운드 프로세스 메뉴
/cast:laravel-cloud command           # 명령 실행 메뉴
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
1. CLI 설치 확인: `cloud --version`
2. 인증 상태 확인: `cloud auth:token --list`
3. 프로젝트 연결 확인: `cloud repo:config`

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

## Examples

### 배포하기
```
> /laravel-cloud:deploy
cloud deploy
```

### 데이터베이스 생성
```
> /laravel-cloud:db create
cloud database:create --name=myapp --type=postgres
```

### 환경 변수 설정
```
> /laravel-cloud:environment variables --set --key=APP_ENV --value=production
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
