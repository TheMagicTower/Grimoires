---
name: laravel-cloud-environment
description: Laravel Cloud 환경 관리
---

# /laravel-cloud:environment Spell

Laravel Cloud 환경 관리 스펠입니다.

## Usage

```
/laravel-cloud:environment list           # 환경 목록
/laravel-cloud:environment get            # 환경 상세
/laravel-cloud:environment create        # 환경 생성
/laravel-cloud:environment update         # 환경 수정
/laravel-cloud:environment delete        # 환경 삭제
/laravel-cloud:environment variables     # 환경 변수
/laravel-cloud:environment logs           # 로그 확인
```

## Commands

### Environment
```bash
# 환경 목록
cloud environment:list

# 환경 상세 정보
cloud environment:get

# 환경 생성
cloud environment:create

# 환경 수정
cloud environment:update

# 환경 삭제
cloud environment:delete
```

### Environment Variables
```bash
# 환경 변수 조회
cloud environment:variables

# 환경 변수 설정 (JSON)
cloud environment:variables --json --action=set --key=KEY --value=value

# 환경 변수 가져오기
cloud environment:variables --json --action=get --key=KEY

# 환경 변수 삭제
cloud environment:variables --json --action=delete --key=KEY
```

### Logs
```bash
# 로그 확인
cloud environment:logs

# 로그 실시간 확인
cloud environment:logs --follow
```

## Prerequisites

- Laravel Cloud CLI 설치: `composer global require laravel/cloud-cli`
- 인증 완료: `cloud auth`

## Examples

### 환경 목록 조회
```
> /laravel-cloud:environment list
cloud environment:list
```

### 환경 변수 설정
```
> /laravel-cloud:environment variables --set --key=APP_ENV --value=production
cloud environment:variables --json --action=set --key=APP_ENV --value=production
```

### 로그 확인
```
> /laravel-cloud:environment logs
cloud environment:logs
```

### 새 환경 생성
```
> /laravel-cloud:environment create --name=staging
cloud environment:create
```

## Related Spells

| Spell | Description |
|-------|-------------|
| `/cast:laravel-cloud` | 통합 메뉴 |
| `/laravel-cloud:db` | 데이터베이스 |
| `/laravel-cloud:deploy` | 배포 |
