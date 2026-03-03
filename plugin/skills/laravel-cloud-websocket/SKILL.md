---
name: laravel-cloud-websocket
description: Laravel Cloud 웹소켓 관리
---

# /cast:laravel-cloud-websocket Spell

Laravel Cloud 웹소켓 클러스터 및 애플리케이션 관리 스펠입니다.

## Usage

```
/cast:laravel-cloud-websocket cluster list    # 웹소켓 클러스터 목록
/cast:laravel-cloud-websocket cluster create # 웹소켓 클러스터 생성
/cast:laravel-cloud-websocket cluster delete # 웹소켓 클러스터 삭제
/cast:laravel-cloud-websocket app list       # 웹소켓 앱 목록
/cast:laravel-cloud-websocket app create    # 웹소켓 앱 생성
/cast:laravel-cloud-websocket app delete   # 웹소켓 앱 삭제
```

## Commands

### WebSocket Cluster
```bash
# 웹소켓 클러스터 목록
cloud websocket-cluster:list

# 웹소켓 클러스터 생성
cloud websocket-cluster:create

# 웹소켓 클러스터 삭제
cloud websocket-cluster:delete
```

### WebSocket Application
```bash
# 웹소켓 앱 목록
cloud websocket-application:list

# 웹소켓 앱 생성
cloud websocket-application:create

# 웹소켓 앱 삭제
cloud websocket-application:delete
```

## Prerequisites

- Laravel Cloud CLI 설치: `composer global require laravel/cloud-cli`
- 인증 완료: `cloud auth`

## Examples

### 웹소켓 클러스터 목록 조회
```
> /cast:laravel-cloud-websocket cluster list
cloud websocket-cluster:list
```

### 새 웹소켓 클러스터 생성
```
> /cast:laravel-cloud-websocket cluster create
cloud websocket-cluster:create
```

### 웹소켓 앱 생성
```
> /cast:laravel-cloud-websocket app create
cloud websocket-application:create
```

## Related Spells

| Spell | Description |
|-------|-------------|
| `/cast:laravel-cloud` | 통합 메뉴 |
| `/cast:laravel-cloud-deploy` | 배포 |
| `/cast:laravel-cloud-environment` | 환경 |
