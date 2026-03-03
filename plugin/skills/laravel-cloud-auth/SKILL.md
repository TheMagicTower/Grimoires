---
name: laravel-cloud-auth
description: Laravel Cloud CLI 인증 관리
---

# /laravel-cloud:auth Spell

Laravel Cloud CLI 인증 관리 스펠입니다.

## Usage

```
/laravel-cloud:auth                       # 브라우저 OAuth 인증
/laravel-cloud:auth token --list          # 토큰 목록
/laravel-cloud:auth token --add           # 토큰 추가
/laravel-cloud:auth token --remove        # 토큰 제거
```

## Commands

### Auth
```bash
# 브라우저 기반 OAuth 인증
cloud auth
```

### Auth Token
```bash
# 저장된 토큰 목록
cloud auth:token --list

# 토큰 추가
cloud auth:token --add

# 토큰 제거
cloud auth:token --remove
```

## Prerequisites

- Laravel Cloud CLI 설치: `composer global require laravel/cloud-cli`

## Pre-flight

1. CLI 설치 확인: `cloud --version`

## Examples

### 브라우저 인증
```
> /laravel-cloud:auth
cloud auth
```

### 토큰 추가
```
> /laravel-cloud:auth token --add
cloud auth:token --add
```

### 토큰 목록 확인
```
> /laravel-cloud:auth token --list
cloud auth:token --list
```

### 토큰 제거
```
> /laravel-cloud:auth token --remove
cloud auth:token --remove
```

## Related Spells

| Spell | Description |
|-------|-------------|
| `/cast:laravel-cloud` | 통합 메뉴 |
| `/laravel-cloud:deploy` | 배포 |
| `/laravel-cloud:environment` | 환경 |
