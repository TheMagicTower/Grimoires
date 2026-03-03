---
name: laravel-cloud-deploy
description: Laravel Cloud 배포 관리 (cloud deploy, cloud ship)
---

# /cast:laravel-cloud-deploy Spell

Laravel Cloud 애플리케이션 배포 스펠입니다.

## Usage

```
/cast:laravel-cloud-deploy                    # 배포 실행
/cast:laravel-cloud-deploy --open             # 배포 후 브라우저 열기
/cast:laravel-cloud-deploy --monitor          # 배포 모니터링
/cast:laravel-cloud-ship                       # 앱 생성 + 환경 설정 + 배포
```

## Commands

### cloud deploy
애플리케이션을 배포합니다.

```bash
# 기본 배포
cloud deploy

# 배포 후 브라우저에서 열기
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

1. CLI 설치 확인: `cloud --version`
2. 인증 상태 확인: `cloud auth:token --list`
3. repo:config로 프로젝트 연결 확인

## Examples

### 일반 배포
```
> /cast:laravel-cloud-deploy
cloud deploy
```

### 배포 후 브라우저 열기
```
> /cast:laravel-cloud-deploy --open
cloud deploy --open
```

### 전체 배포 워크플로우
```
> /cast:laravel-cloud-ship
cloud ship
```

## Related Spells

| Spell | Description |
|-------|-------------|
| `/cast:laravel-cloud` | 통합 메뉴 |
| `/cast:laravel-cloud-environment` | 환경 변수 |
| `/cast:laravel-cloud-db` | 데이터베이스 |
