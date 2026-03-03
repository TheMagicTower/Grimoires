---
name: laravel-cloud-domain
description: Laravel Cloud 도메인 관리
---

# /cast:laravel-cloud:domain Spell

Laravel Cloud 도메인 관리 스펠입니다.

## Usage

```
/cast:laravel-cloud:domain list               # 도메인 목록
/cast:laravel-cloud:domain create            # 도메인 생성
/cast:laravel-cloud:domain verify            # 도메인 검증
/cast:laravel-cloud:domain delete            # 도메인 삭제
```

## Commands

### Domain
```bash
# 도메인 목록
cloud domain:list

# 도메인 생성
cloud domain:create

# 도메인 검증
cloud domain:verify

# 도메인 삭제
cloud domain:delete
```

## Prerequisites

- Laravel Cloud CLI 설치: `composer global require laravel/cloud-cli`
- 인증 완료: `cloud auth`

## Examples

### 도메인 목록 조회
```
> /cast:laravel-cloud:domain list
cloud domain:list
```

### 새 도메인 추가
```
> /cast:laravel-cloud:domain create
cloud domain:create
```

### 도메인 검증
```
> /cast:laravel-cloud:domain verify --domain=example.com
cloud domain:verify
```

## Related Spells

| Spell | Description |
|-------|-------------|
| `/cast:laravel-cloud` | 통합 메뉴 |
| `/cast:laravel-cloud:deploy` | 배포 |
| `/cast:laravel-cloud:bucket` | 스토리지 |
