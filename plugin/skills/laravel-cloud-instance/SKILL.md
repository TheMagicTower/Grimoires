---
name: laravel-cloud-instance
description: Laravel Cloud 인스턴스 관리
---

# /laravel-cloud:instance Spell

Laravel Cloud 인스턴스 관리 스펠입니다.

## Usage

```
/laravel-cloud:instance list             # 인스턴스 목록
/laravel-cloud:instance get              # 인스턴스 상세
/laravel-cloud:instance create           # 인스턴스 생성
/laravel-cloud:instance update           # 인스턴스 수정
/laravel-cloud:instance delete          # 인스턴스 삭제
/laravel-cloud:instance sizes           # 사용 가능한 인스턴스 크기
```

## Commands

### Instance
```bash
# 인스턴스 목록
cloud instance:list

# 인스턴스 상세 정보
cloud instance:get

# 인스턴스 생성
cloud instance:create

# 인스턴스 수정
cloud instance:update

# 인스턴스 삭제
cloud instance:delete
```

### Instance Sizes
```bash
# 사용 가능한 인스턴스 크기 목록
cloud instance:sizes
```

## Prerequisites

- Laravel Cloud CLI 설치: `composer global require laravel/cloud-cli`
- 인증 완료: `cloud auth`

## Examples

### 인스턴스 목록 조회
```
> /laravel-cloud:instance list
cloud instance:list
```

### 사용 가능한 크기 확인
```
> /laravel-cloud:instance sizes
cloud instance:sizes
```

### 새 인스턴스 생성
```
> /laravel-cloud:instance create
cloud instance:create
```

## Related Spells

| Spell | Description |
|-------|-------------|
| `/cast:laravel-cloud` | 통합 메뉴 |
| `/laravel-cloud:deploy` | 배포 |
| `/laravel-cloud:environment` | 환경 |
