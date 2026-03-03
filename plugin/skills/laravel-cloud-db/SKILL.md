---
name: laravel-cloud-db
description: Laravel Cloud 데이터베이스 관리
---

# /cast:laravel-cloud:db Spell

Laravel Cloud 데이터베이스 관리 스펠입니다.

## Usage

```
/cast:laravel-cloud:db list                    # DB 목록
/cast:laravel-cloud:db create                  # DB 생성
/cast:laravel-cloud:db open                   # 로컬 연결
/cast:laravel-cloud:db cluster list           # 클러스터 목록
/cast:laravel-cloud:db cluster create          # 클러스터 생성
/cast:laravel-cloud:db cluster delete         # 클러스터 삭제
/cast:laravel-cloud:db snapshot list          # 스냅샷 목록
/cast:laravel-cloud:db snapshot create        # 스냅샷 생성
/cast:laravel-cloud:db restore                # 복원
```

## Commands

### Database
```bash
# 데이터베이스 목록
cloud database:list

# 데이터베이스 생성
cloud database:create

# 로컬에서 데이터베이스 연결
cloud database:open
```

### Database Cluster
```bash
# 클러스터 목록
cloud database-cluster:list

# 클러스터 생성
cloud database-cluster:create

# 클러스터 삭제
cloud database-cluster:delete
```

### Database Snapshot
```bash
# 스냅샷 목록
cloud database-snapshot:list

# 스냅샷 생성
cloud database-snapshot:create

# 데이터베이스 복원
cloud database-restore:create
```

## Prerequisites

- Laravel Cloud CLI 설치: `composer global require laravel/cloud-cli`
- 인증 완료: `cloud auth`

## Examples

### 데이터베이스 목록 조회
```
> /cast:laravel-cloud:db list
cloud database:list
```

### 새 데이터베이스 생성
```
> /cast:laravel-cloud:db create
cloud database:create
```

### 로컬에서 DB 연결 (터널링)
```
> /cast:laravel-cloud:db open
cloud database:open
```

### 스냅샷 생성
```
> /cast:laravel-cloud:db snapshot create
cloud database-snapshot:create --name=before-migration
```

## Related Spells

| Spell | Description |
|-------|-------------|
| `/cast:laravel-cloud` | 통합 메뉴 |
| `/cast:laravel-cloud:environment` | 환경 변수 |
| `/cast:laravel-cloud:deploy` | 배포 |
