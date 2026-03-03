---
name: laravel-cloud-background
description: Laravel Cloud 백그라운드 프로세스 관리
---

# /cast:laravel-cloud:background Spell

Laravel Cloud 백그라운드 프로세스 관리 스펠입니다.

## Usage

```
/cast:laravel-cloud:background list            # 백그라운드 프로세스 목록
/cast:laravel-cloud:background create        # 백그라운드 프로세스 생성
/cast:laravel-cloud:background delete        # 백그라운드 프로세스 삭제
```

## Commands

### Background Process
```bash
# 백그라운드 프로세스 목록
cloud background-process:list

# 백그라운드 프로세스 생성
cloud background-process:create

# 백그라운드 프로세스 삭제
cloud background-process:delete
```

## Prerequisites

- Laravel Cloud CLI 설치: `composer global require laravel/cloud-cli`
- 인증 완료: `cloud auth`

## Examples

### 백그라운드 프로세스 목록 조회
```
> /cast:laravel-cloud:background list
cloud background-process:list
```

### 새 백그라운드 프로세스 생성
```
> /cast:laravel-cloud:background create
cloud background-process:create
```

### 백그라운드 프로세스 삭제
```
> /cast:laravel-cloud:background delete
cloud background-process:delete
```

## Related Spells

| Spell | Description |
|-------|-------------|
| `/cast:laravel-cloud` | 통합 메뉴 |
| `/cast:laravel-cloud:deploy` | 배포 |
| `/cast:laravel-cloud:command` | 명령 실행 |
