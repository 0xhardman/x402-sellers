# Facilitator Aggregator

自动多facilitator切换系统，解决单点故障问题。

## 概述

Facilitator Aggregator 是一个智能的多facilitator管理系统，提供以下功能：

- ✅ **自动故障转移** - facilitator故障时自动切换到备用
- ✅ **优先级路由** - 按优先级顺序尝试facilitator
- ✅ **健康检查** - 定期检测facilitator可用性
- ✅ **重试机制** - 智能重试减少偶发性失败
- ✅ **监控和日志** - 详细的性能统计和日志记录

## 架构设计

### 核心组件

```
┌─────────────────────────────────────────┐
│         X402 Middleware                 │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   Smart Facilitator Config              │
│   - 检测是否启用aggregator               │
│   - 返回适当的配置                       │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   Facilitator Aggregator                │
│   ┌───────────────────────────────────┐ │
│   │  Priority Queue (优先级队列)      │ │
│   │  1. facilitator.x402.rs          │ │
│   │  2. facilitator.payai.network    │ │
│   │  3. Coinbase CDP                 │ │
│   └───────────────────────────────────┘ │
│                                         │
│   ┌─────────────┐  ┌─────────────┐    │
│   │ Health      │  │  Logger     │    │
│   │ Checker     │  │  System     │    │
│   └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────┘
```

### 故障转移流程

```
API 请求
  │
  ▼
尝试 Facilitator 1 (x402.rs)
  │
  ├─ 成功 ✓ → 返回结果
  │
  ├─ 失败 × → 重试 1 次
  │            │
  │            ├─ 成功 ✓ → 返回结果
  │            │
  │            └─ 失败 × → 尝试 Facilitator 2
  │
  ▼
尝试 Facilitator 2 (payai.network)
  │
  ├─ 成功 ✓ → 返回结果
  │
  ├─ 失败 × → 重试 1 次
  │            │
  │            ├─ 成功 ✓ → 返回结果
  │            │
  │            └─ 失败 × → 尝试 Facilitator 3
  │
  ▼
尝试 Facilitator 3 (Coinbase CDP)
  │
  ├─ 成功 ✓ → 返回结果
  │
  └─ 失败 × → 返回错误 (所有facilitator都失败)
```

## 配置指南

### 1. 环境变量配置

在 `.env.local` 中添加：

```bash
# ============================================
# 启用 Facilitator Aggregator
# ============================================
ENABLE_FACILITATOR_AGGREGATOR=true

# Facilitator 1: X402 RS (主facilitator)
FACILITATOR_1_URL=https://facilitator.x402.rs
FACILITATOR_1_ENABLED=true

# Facilitator 2: PayAI Network (备用)
FACILITATOR_2_URL=https://facilitator.payai.network
FACILITATOR_2_ENABLED=true

# Facilitator 3: Coinbase CDP (备备)
# 使用已配置的 CDP_API_KEY_ID 和 CDP_API_KEY_SECRET
FACILITATOR_3_ENABLED=true

# 行为设置
FACILITATOR_TIMEOUT_MS=5000                    # 每个facilitator的超时时间 (毫秒)
FACILITATOR_RETRIES=1                          # 每个facilitator重试次数
FACILITATOR_HEALTH_CHECK=true                  # 启用健康检查
FACILITATOR_HEALTH_CHECK_INTERVAL_MS=30000     # 健康检查间隔 (30秒)
FACILITATOR_MAX_CONSECUTIVE_FAILURES=3         # 连续失败多少次标记为不健康
FACILITATOR_LOGGING=true                       # 启用详细日志
```

### 2. 禁用 Aggregator (使用单facilitator)

```bash
# 设为 false 或注释掉这行即可回退到单facilitator模式
ENABLE_FACILITATOR_AGGREGATOR=false
```

## 使用方法

### 查看 Aggregator 状态

访问监控API端点：

```bash
# 获取完整状态 (健康、统计、日志、配置)
curl http://localhost:3000/api/facilitator-status

# 只获取健康状态
curl http://localhost:3000/api/facilitator-status?include=health

# 只获取统计信息
curl http://localhost:3000/api/facilitator-status?include=stats

# 只获取最近50条日志
curl http://localhost:3000/api/facilitator-status?include=logs&logLimit=50

# 只获取配置
curl http://localhost:3000/api/facilitator-status?include=config
```

### 手动触发健康检查

```bash
curl -X POST http://localhost:3000/api/facilitator-status \
  -H "Content-Type: application/json" \
  -d '{"action": "check-health"}'
```

### 状态响应示例

```json
{
  "enabled": true,
  "timestamp": "2025-01-01T00:00:00.000Z",
  "health": {
    "facilitators": [
      {
        "id": "x402-rs",
        "isHealthy": true,
        "consecutiveFailures": 0,
        "totalSuccesses": 145,
        "totalFailures": 2,
        "successRate": "98.64%",
        "averageResponseTimeMs": 234,
        "lastSuccessfulCheck": "2025-01-01T00:00:00.000Z"
      },
      {
        "id": "payai-network",
        "isHealthy": true,
        "consecutiveFailures": 0,
        "totalSuccesses": 23,
        "totalFailures": 1,
        "successRate": "95.83%",
        "averageResponseTimeMs": 412
      },
      {
        "id": "coinbase-cdp",
        "isHealthy": true,
        "consecutiveFailures": 0,
        "totalSuccesses": 5,
        "totalFailures": 0,
        "successRate": "100%",
        "averageResponseTimeMs": 189
      }
    ],
    "summary": {
      "total": 3,
      "healthy": 3,
      "unhealthy": 0
    }
  },
  "statistics": {
    "facilitators": [
      {
        "id": "x402-rs",
        "operations": {
          "verify": 120,
          "settle": 120,
          "supported": 12,
          "list": 0,
          "total": 252
        },
        "results": {
          "success": 145,
          "failure": 2,
          "successRate": "98.64%"
        },
        "performance": {
          "averageResponseTimeMs": 234
        }
      }
    ]
  }
}
```

## 监控指标

### 健康指标

- **isHealthy**: facilitator当前是否健康
- **consecutiveFailures**: 连续失败次数
- **totalSuccesses**: 总成功次数
- **totalFailures**: 总失败次数
- **successRate**: 成功率百分比
- **averageResponseTimeMs**: 平均响应时间 (毫秒)

### 性能指标

- **verifyCount**: verify操作次数
- **settleCount**: settle操作次数
- **supportedCount**: supported操作次数
- **listCount**: list操作次数

## 故障排查

### Aggregator未启用

**症状**: 访问 `/api/facilitator-status` 返回 `enabled: false`

**解决方案**:
1. 检查 `.env.local` 中 `ENABLE_FACILITATOR_AGGREGATOR=true`
2. 重启应用

### 所有facilitator都不健康

**症状**: API请求失败，错误信息 "No healthy facilitators available"

**解决方案**:
1. 检查网络连接
2. 查看facilitator URL是否正确
3. 手动触发健康检查: `POST /api/facilitator-status` with `{"action": "check-health"}`
4. 检查facilitator日志找出失败原因

### 频繁切换facilitator

**症状**: 日志显示不同facilitator频繁被使用

**可能原因**:
- 主facilitator不稳定
- 超时时间设置过短
- 网络问题

**解决方案**:
1. 增加 `FACILITATOR_TIMEOUT_MS` (例如从5000改为10000)
2. 增加 `FACILITATOR_RETRIES` (例如从1改为2)
3. 检查facilitator健康状态
4. 调整优先级或禁用不稳定的facilitator

### 响应时间过长

**症状**: API请求耗时很长

**可能原因**:
- 尝试了多个失败的facilitator
- 重试次数过多
- 超时时间设置过长

**解决方案**:
1. 禁用不健康的facilitator
2. 减少 `FACILITATOR_TIMEOUT_MS`
3. 减少 `FACILITATOR_RETRIES`

## 高级配置

### 添加自定义facilitator

在 `lib/create-facilitator-aggregator.ts` 中添加:

```typescript
// Facilitator 4: Custom Facilitator
const facilitator4Url = process.env.FACILITATOR_4_URL;
const facilitator4Enabled = process.env.FACILITATOR_4_ENABLED !== "false";

if (facilitator4Enabled && facilitator4Url) {
  facilitators.push({
    id: "custom",
    name: "Custom Facilitator",
    config: {
      url: facilitator4Url as `${string}://${string}`,
      createAuthHeaders: async () => ({
        verify: { "X-Custom-Auth": "your-token" },
        settle: { "X-Custom-Auth": "your-token" },
        supported: { "X-Custom-Auth": "your-token" },
      }),
    },
    priority: 4,
    enabled: true,
    timeoutMs: 5000,
  });
}
```

然后在 `.env.local` 中配置:

```bash
FACILITATOR_4_URL=https://your-custom-facilitator.com
FACILITATOR_4_ENABLED=true
```

### 调整优先级

修改 `priority` 值 (数字越小优先级越高):

```typescript
facilitators.push({
  // ...
  priority: 1, // 最高优先级
});
```

### 禁用特定facilitator

在 `.env.local` 中:

```bash
FACILITATOR_2_ENABLED=false  # 禁用 PayAI Network
```

## 最佳实践

### 1. 优先级设置

- **Priority 1**: 最快、最可靠的facilitator
- **Priority 2**: 备用facilitator
- **Priority 3+**: 额外的备份

### 2. 超时配置

```bash
# 快速失败，快速切换
FACILITATOR_TIMEOUT_MS=3000
FACILITATOR_RETRIES=1

# 或者更宽容的设置
FACILITATOR_TIMEOUT_MS=8000
FACILITATOR_RETRIES=2
```

### 3. 健康检查

```bash
# 频繁检查 (生产环境推荐)
FACILITATOR_HEALTH_CHECK_INTERVAL_MS=30000  # 30秒

# 减少检查频率 (开发环境)
FACILITATOR_HEALTH_CHECK_INTERVAL_MS=60000  # 60秒
```

### 4. 监控

- 定期查看 `/api/facilitator-status`
- 监控 `successRate` 和 `averageResponseTimeMs`
- 设置告警当 `unhealthy` facilitator数量过多时

### 5. 日志

```bash
# 开发环境：启用详细日志
FACILITATOR_LOGGING=true

# 生产环境：可以禁用以提高性能
FACILITATOR_LOGGING=false
```

## 性能影响

### 额外开销

- **健康检查**: 每30秒一次HTTP请求 (可配置)
- **内存**: 约1-2MB用于日志和统计数据
- **延迟**: 首次failover增加重试时间 (通常3-5秒)

### 优化建议

1. 使用快速的主facilitator以减少failover需求
2. 调整健康检查间隔平衡准确性和性能
3. 限制日志数量 (maxLogEntries)
4. 在生产环境禁用详细日志

## 文件结构

```
lib/
├── types/
│   └── facilitator.ts                    # 类型定义
├── facilitator-aggregator.ts             # 核心聚合器类
├── facilitator-health-checker.ts         # 健康检查系统
├── facilitator-logger.ts                 # 日志系统
├── create-facilitator-aggregator.ts      # 创建aggregator实例
├── create-smart-facilitator-config.ts    # 智能配置生成器
└── aggregator-facilitator-adapter.ts     # 适配器

app/api/
└── facilitator-status/
    └── route.ts                          # 监控API端点

middleware.ts                             # 集成点
.env.local                                # 配置文件
```

## 常见问题

### Q: Aggregator会自动恢复到主facilitator吗？

A: 是的。健康检查会持续监控所有facilitator。一旦主facilitator恢复健康，下次请求会优先使用它（因为它的优先级最高）。

### Q: 如何知道当前使用的是哪个facilitator？

A: 查看日志或访问 `/api/facilitator-status?include=logs` 查看最近的操作。

### Q: Aggregator会影响支付速度吗？

A: 正常情况下不会。只有当facilitator失败需要切换时，才会有额外的重试延迟。

### Q: 可以只用aggregator做监控，不做failover吗？

A: 可以。设置 `FACILITATOR_RETRIES=0` 并只配置一个facilitator，这样只会有健康监控，不会failover。

### Q: 健康检查会影响facilitator的请求配额吗？

A: 会，但影响很小。每30秒一次的`/supported`端点调用，通常facilitator都会提供这个免费端点。

## 技术支持

如有问题，请：
1. 查看 `/api/facilitator-status` 的详细状态
2. 检查应用日志中的 `[Facilitator]` 标记
3. 参考本文档的故障排查部分

## 更新日志

### v1.0.0 (2025-01-01)
- ✨ 初始版本
- ✅ 优先级failover机制
- ✅ 健康检查系统
- ✅ 监控和日志
- ✅ 支持3个facilitator (x402.rs, payai.network, Coinbase CDP)
