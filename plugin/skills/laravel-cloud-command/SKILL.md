---
name: laravel-cloud-command
description: Laravel Cloud 원격 명령 실행
---

# /laravel-cloud:command Spell

Laravel Cloud 원격 명령 실행 스펠입니다.

## Usage

```
/laravel-cloud:command run                # 명령 실행
/laravel-cloud:command list              # 명령 목록
/laravel-cloud:command get               # 명령 결과 조회
```

## Commands

### Command Run
```bash
# 원격에서 명령 실행
cloud command:run
```

### Command List
```bash
# 실행된 명령 목록
cloud command:list
```

### Command Get
```bash
# 명령 실행 결과 조회
cloud command:get
```

## Prerequisites

- Laravel Cloud CLI 설치: `composer global require laravel/cloud-cli`
- 인증 완료: `cloud auth`

## Examples

### 명령 실행
```
> /laravel-cloud:command run
cloud command:run
```

### 명령 결과 조회
```
> /laravel-cloud:command get
cloud command:get
```

## Related Spells

| Spell | Description |
|-------|-------------|
| `/cast:laravel-cloud` | 통합 메뉴 |
| `/laravel-cloud:environment` | 환경 |
| `/laravel-cloud:deploy` | 배포 |
