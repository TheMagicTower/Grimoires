---
name: laravel-cloud-bucket
description: Laravel Cloud 객체 스토리지 (버킷) 관리
---

# /cast:laravel-cloud:bucket Spell

Laravel Cloud 객체 스토리지(버킷) 관리 스펠입니다.

## Usage

```
/cast:laravel-cloud:bucket list               # 버킷 목록
/cast:laravel-cloud:bucket create            # 버킷 생성
/cast:laravel-cloud:bucket delete            # 버킷 삭제
/cast:laravel-cloud:bucket key list          # 버킷 키 목록
/cast:laravel-cloud:bucket key create       # 버킷 키 생성
```

## Commands

### Bucket
```bash
# 버킷 목록
cloud bucket:list

# 버킷 생성
cloud bucket:create

# 버킷 삭제
cloud bucket:delete
```

### Bucket Key
```bash
# 버킷 키 목록
cloud bucket-key:list

# 버킷 키 생성
cloud bucket-key:create
```

## Prerequisites

- Laravel Cloud CLI 설치: `composer global require laravel/cloud-cli`
- 인증 완료: `cloud auth`

## Examples

### 버킷 목록 조회
```
> /cast:laravel-cloud:bucket list
cloud bucket:list
```

### 새 버킷 생성
```
> /cast:laravel-cloud:bucket create
cloud bucket:create
```

### 버킷 키 생성
```
> /cast:laravel-cloud:bucket key create
cloud bucket-key:create
```

## Related Spells

| Spell | Description |
|-------|-------------|
| `/cast:laravel-cloud` | 통합 메뉴 |
| `/cast:laravel-cloud:cache` | 캐시 |
| `/cast:laravel-cloud:domain` | 도메인 |
