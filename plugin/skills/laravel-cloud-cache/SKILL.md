---
name: laravel-cloud-cache
description: Laravel Cloud 캐시 관리
---

# /laravel-cloud:cache Spell

Laravel Cloud 캐시 관리 스펠입니다.

## Usage

```
/laravel-cloud:cache list                # 캐시 목록
/laravel-cloud:cache create              # 캐시 생성
/laravel-cloud:cache update              # 캐시 수정
/laravel-cloud:cache delete             # 캐시 삭제
/laravel-cloud:cache types              # 사용 가능한 캐시 유형
```

## Commands

### Cache
```bash
# 캐시 목록
cloud cache:list

# 캐시 생성
cloud cache:create

# 캐시 수정
cloud cache:update

# 캐시 삭제
cloud cache:delete
```

### Cache Types
```bash
# 사용 가능한 캐시 유형 목록
cloud cache:types
```

## Prerequisites

- Laravel Cloud CLI 설치: `composer global require laravel/cloud-cli`
- 인증 완료: `cloud auth`

## Examples

### 캐시 목록 조회
```
> /laravel-cloud:cache list
cloud cache:list
```

### 사용 가능한 캐시 유형 확인
```
> /laravel-cloud:cache types
cloud cache:types
```

### 새 캐시 생성
```
> /laravel-cloud:cache create
cloud cache:create
```

## Related Spells

| Spell | Description |
|-------|-------------|
| `/cast:laravel-cloud` | 통합 메뉴 |
| `/laravel-cloud:bucket` | 스토리지 |
| `/laravel-cloud:instance` | 인스턴스 |
