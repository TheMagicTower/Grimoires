# Cost Management Guide

Grimoires 시스템의 API 비용을 모니터링하고 최적화하는 가이드입니다.

---

## 1. Overview

### 1.1 Cost Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GRIMOIRES COST STRUCTURE                         │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      Archmage (Claude)                           │    │
│  │                                                                  │    │
│  │  Input: $15/1M tokens    Output: $75/1M tokens                  │    │
│  │  Typical session: 50K in + 10K out = $1.50                      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │    Codex     │ │   Gemini     │ │   Stitch     │ │  Reviewer    │   │
│  │   (OpenAI)   │ │  (Google)    │ │              │ │  (Claude)    │   │
│  ├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤   │
│  │ In: $30/1M   │ │ In: $1.25/1M │ │ In: $15/1M   │ │ In: $15/1M   │   │
│  │ Out: $60/1M  │ │ Out: $5/1M   │ │ Out: $75/1M  │ │ Out: $75/1M  │   │
│  ├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤   │
│  │ ~$0.50/task  │ │ ~$0.10/task  │ │ ~$0.30/task  │ │ ~$0.10/task  │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                                          │
│  Estimated Daily Cost: $5-15 (active development)                       │
│  Estimated Monthly Cost: $100-300                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Cost Distribution

```
Typical Feature Development Cost Breakdown:

┌────────────────────────────────────────────────────┐
│                                                    │
│  Archmage      ████████████████░░░░  40% ($2.00)  │
│  Codex         ████████████░░░░░░░░  30% ($1.50)  │
│  Gemini        ████████░░░░░░░░░░░░  20% ($1.00)  │
│  Stitch        ███░░░░░░░░░░░░░░░░░   7% ($0.35)  │
│  Reviewer      █░░░░░░░░░░░░░░░░░░░   3% ($0.15)  │
│                                                    │
│  Total: ~$5.00 per feature                        │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 2. Budget Management

### 2.1 Budget Tiers

| Tier | Daily | Weekly | Monthly | Use Case |
|------|-------|--------|---------|----------|
| **Starter** | $5 | $25 | $75 | Light usage, learning |
| **Standard** | $10 | $50 | $150 | Regular development |
| **Professional** | $25 | $125 | $400 | Heavy usage, teams |
| **Enterprise** | Custom | Custom | Custom | Large organizations |

### 2.2 Budget Allocation Strategy

```yaml
# Recommended allocation by Familiar
allocation:
  archmage: 40%    # Orchestration, planning
  codex: 30%       # Code generation (most expensive per token)
  gemini: 20%      # Analysis (cheapest per token, large context)
  stitch: 7%       # UI generation
  reviewer: 3%     # Code review
```

### 2.3 Budget Alerts

| Level | Threshold | Action |
|-------|-----------|--------|
| **Info** | 50% | Log only |
| **Warning** | 70% | Console notification |
| **Critical** | 90% | Throttle non-essential |
| **Exceeded** | 100% | Pause operations |

---

## 3. Cost Tracking

### 3.1 Per-Request Tracking

```json
{
  "request_id": "req-123",
  "timestamp": "2026-01-25T10:30:00Z",
  "familiar": "codex",
  "operation": "implement_feature",
  "tokens": {
    "input": 5000,
    "output": 2000
  },
  "cost": {
    "input": 0.15,    // $0.03 * 5
    "output": 0.12,   // $0.06 * 2
    "total": 0.27
  },
  "context": {
    "workflow_id": "wf-456",
    "task": "Add user authentication"
  }
}
```

### 3.2 Session Summary

```markdown
## Session Cost Summary

**Session ID**: session-2026-01-25-001
**Duration**: 2 hours 15 minutes

### Total Cost: $4.85

| Familiar | Requests | Tokens (in/out) | Cost |
|----------|----------|-----------------|------|
| Archmage | 15 | 45K / 8K | $1.28 |
| Codex | 8 | 32K / 15K | $1.86 |
| Gemini | 5 | 120K / 10K | $0.20 |
| Stitch | 3 | 12K / 6K | $0.63 |
| Reviewer | 6 | 18K / 4K | $0.57 |
| **Total** | 37 | 227K / 43K | $4.54 |

### Top Expensive Operations
1. Feature implementation (Codex) - $0.85
2. Architecture analysis (Gemini) - $0.45
3. Component generation (Stitch) - $0.42

### Budget Status
- Daily: $4.85 / $10.00 (48.5%)
- Weekly: $18.50 / $50.00 (37%)
- Monthly: $45.20 / $150.00 (30.1%)
```

### 3.3 Trend Analysis

```
Weekly Cost Trend:
─────────────────────────────────────────────────────►
$15│                          ┌───┐
   │                    ┌───┐ │   │
$10│              ┌───┐ │   │ │   │ ┌───┐
   │        ┌───┐ │   │ │   │ │   │ │   │
 $5│  ┌───┐ │   │ │   │ │   │ │   │ │   │
   │  │   │ │   │ │   │ │   │ │   │ │   │
 $0└──┴───┴─┴───┴─┴───┴─┴───┴─┴───┴─┴───┴──►
      Mon   Tue   Wed   Thu   Fri   Sat   Sun

Average: $8.50/day
Trend: +5% vs last week
```

---

## 4. Cost Optimization Strategies

### 4.1 Model Selection

```
┌─────────────────────────────────────────────────────────────┐
│                    MODEL ROUTING                             │
│                                                              │
│  Task Complexity Assessment                                  │
│           │                                                  │
│     ┌─────┴─────┐                                           │
│     ▼           ▼                                           │
│   Simple     Complex                                        │
│ (score<3)   (score>=7)                                      │
│     │           │                                           │
│     ▼           ▼                                           │
│  ┌───────┐  ┌───────┐                                       │
│  │ Haiku │  │ Opus  │                                       │
│  │ $0.25 │  │ $15   │  (per 1M input)                      │
│  │ /1M   │  │ /1M   │                                       │
│  └───────┘  └───────┘                                       │
│                                                              │
│  Savings: Up to 60x on simple tasks                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Routing Rules**:

| Task Type | Recommended Model | Reason |
|-----------|-------------------|--------|
| Simple fixes | Haiku | 저렴, 충분한 성능 |
| Code generation | Sonnet | 균형 |
| Complex architecture | Opus | 높은 정확도 필요 |
| Analysis | Gemini | 대용량 컨텍스트, 저렴 |

### 4.2 Caching Strategy

```yaml
caching:
  # 캐시 가능한 항목
  cacheable:
    - gemini_analysis (TTL: 1 hour)
    - type_definitions (TTL: session)
    - design_tokens (TTL: 24 hours)
    - file_hashes (TTL: until change)

  # 캐시 히트 시 절감
  savings:
    gemini_analysis: $0.10-0.50 per hit
    repeated_reviews: $0.05-0.15 per hit

  # 예상 절감
  estimated_savings: 15-25% of total cost
```

### 4.3 Request Optimization

```
┌─────────────────────────────────────────────────────────────┐
│                 REQUEST OPTIMIZATION                         │
│                                                              │
│  1. Batch Small Requests                                    │
│     ┌───┐ ┌───┐ ┌───┐        ┌─────────────┐               │
│     │ A │ │ B │ │ C │   →    │   A + B + C │               │
│     └───┘ └───┘ └───┘        └─────────────┘               │
│     3 requests ($0.30)    vs  1 request ($0.15)            │
│                               Savings: 50%                  │
│                                                              │
│  2. Reduce Context Size                                     │
│     Full file (10K) → Relevant portion (2K)                │
│     Savings: 80% on input tokens                            │
│                                                              │
│  3. Structured Responses                                    │
│     Verbose text (5K) → JSON structure (1K)                │
│     Savings: 80% on output tokens                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Smart Scheduling

```yaml
scheduling:
  # 비용 효율적인 시간대 활용
  off_peak:
    enabled: true
    defer_non_urgent: true
    batch_window: 30  # minutes

  # 작업 우선순위
  priority_based:
    critical: immediate
    high: within_5min
    medium: can_batch
    low: off_peak_only

  # 중복 제거
  deduplication:
    enabled: true
    window: 300  # seconds
    similar_threshold: 0.9
```

---

## 5. Cost-Saving Mode

### 5.1 Activation Triggers

| Trigger | Threshold | Action |
|---------|-----------|--------|
| Budget warning | 70% | Soft throttle |
| Budget critical | 90% | Hard throttle |
| Unusual spike | 200% avg | Alert + review |

### 5.2 Throttling Actions

```
Normal Mode                    Cost-Saving Mode
────────────                   ────────────────
All operations                 Essential only
Opus for complex               Sonnet for all
Full analysis                  Quick analysis
Real-time review               Batched review
All Familiars                  Core Familiars only
```

### 5.3 Emergency Procedures

```
Budget Exceeded
      │
      ▼
┌───────────────────────────┐
│ 1. Pause non-critical     │
│    operations             │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ 2. Complete in-progress   │
│    tasks only             │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ 3. Notify user            │
│    with summary           │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ 4. Wait for budget        │
│    reset or increase      │
└───────────────────────────┘
```

---

## 6. Reporting & Analytics

### 6.1 Daily Report

```markdown
# Daily Cost Report - 2026-01-25

## Summary
- **Total Cost**: $8.45
- **Budget Used**: 84.5%
- **Requests**: 42
- **Tokens**: 285K input / 52K output

## By Familiar
| Familiar | Cost | % of Total | vs Avg |
|----------|------|------------|--------|
| Archmage | $3.20 | 37.9% | +5% |
| Codex | $2.85 | 33.7% | +12% |
| Gemini | $1.40 | 16.6% | -8% |
| Stitch | $0.65 | 7.7% | Normal |
| Reviewer | $0.35 | 4.1% | -15% |

## Top Operations
1. Auth system refactor (Codex) - $1.20
2. Security analysis (Gemini) - $0.85
3. Dashboard UI (Stitch) - $0.65

## Efficiency Metrics
- Cache hit rate: 23%
- Estimated savings from cache: $1.85
- Batching savings: $0.45

## Recommendations
- High Codex usage today. Consider batching similar tasks.
- Security analysis ran 3 times. Enable caching for analysis.
```

### 6.2 Weekly Trends

```
Cost by Day:
Mon ████████░░░░░░░░░░░░ $8.00
Tue ████████████░░░░░░░░ $12.00
Wed ██████████░░░░░░░░░░ $10.00
Thu ████████████████░░░░ $16.00  ← Spike
Fri ██████░░░░░░░░░░░░░░ $6.00
Sat ██░░░░░░░░░░░░░░░░░░ $2.00
Sun █░░░░░░░░░░░░░░░░░░░ $1.00

Weekly Total: $55.00
Weekly Budget: $50.00
Status: OVER BUDGET (+10%)

Thursday Spike Analysis:
- Large refactoring task
- Multiple retries due to errors
- Recommendation: Break into smaller tasks
```

### 6.3 Monthly Summary

```markdown
# Monthly Cost Summary - January 2026

## Overview
- **Total Cost**: $125.40
- **Budget**: $150.00
- **Utilization**: 83.6%
- **Trend**: -5% vs December

## Cost Breakdown by Category
```
Feature Development:  ██████████████░░░░░░ 65% ($81.51)
Bug Fixes:           █████░░░░░░░░░░░░░░░ 20% ($25.08)
Analysis:            ███░░░░░░░░░░░░░░░░░ 10% ($12.54)
Other:               █░░░░░░░░░░░░░░░░░░░  5% ($6.27)
```

## Efficiency Improvements
- Cache implementation saved: $18.50
- Model routing saved: $12.30
- Batching saved: $8.40
- **Total Savings**: $39.20 (23.8% reduction)

## Recommendations for Next Month
1. Increase cache TTL for stable analyses
2. Consider Gemini for more code reviews (cheaper)
3. Enable off-peak scheduling for non-urgent tasks
```

---

## 7. Best Practices

### 7.1 Daily Habits

- [ ] 세션 시작 시 예산 상태 확인
- [ ] 큰 작업 전 예상 비용 검토
- [ ] 세션 종료 시 비용 요약 확인

### 7.2 Weekly Reviews

- [ ] 주간 비용 트렌드 분석
- [ ] 비정상 스파이크 조사
- [ ] 최적화 기회 식별

### 7.3 Monthly Planning

- [ ] 예산 vs 실제 비용 비교
- [ ] 다음 달 예산 조정
- [ ] 비용 절감 전략 업데이트

---

## 8. Configuration Reference

```yaml
# runes/config/cost-monitor.yaml

# 빠른 설정 프리셋
presets:
  conservative:
    daily_limit: 5.00
    auto_throttle: true
    prefer_cheap_models: true

  balanced:
    daily_limit: 10.00
    auto_throttle: true
    smart_routing: true

  performance:
    daily_limit: 25.00
    auto_throttle: false
    prefer_quality: true
```

---

*Version: 0.1.0*
*Last Updated: 2026-01-25*
