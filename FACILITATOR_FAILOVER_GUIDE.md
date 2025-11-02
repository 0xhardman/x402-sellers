# ✅ Facilitator Failover 使用指南

## 🎉 成功！真正的Middleware Failover已实现

你现在有了一个**真正可用的facilitator自动切换系统**，直接在middleware中工作！

## 工作原理

```
用户请求 → Middleware
              ↓
          尝试 Facilitator 1 (x402.rs)
              ↓ 失败
          尝试 Facilitator 2 (payai.network)
              ↓ 失败
          尝试 Facilitator 3 (Coinbase CDP)
              ↓ 成功
          返回结果 ✓
```

## 配置

### 当前配置 (`.env.local`)

```bash
# 启用failover
ENABLE_FACILITATOR_AGGREGATOR=true

# Facilitator 1: X402 RS (优先级 1 - 最高)
FACILITATOR_1_URL=https://facilitator.x402.rs
FACILITATOR_1_ENABLED=true

# Facilitator 2: PayAI Network (优先级 2)
FACILITATOR_2_URL=https://facilitator.payai.network
FACILITATOR_2_ENABLED=true

# Facilitator 3: Coinbase CDP (优先级 3 - 使用已有的CDP API密钥)
FACILITATOR_3_ENABLED=true
CDP_API_KEY_ID="..."
CDP_API_KEY_SECRET="..."
```

### 启动时你会看到

```bash
x402 Configuration: {
  wallet: '0xe395B9bA2F93236489ac953146485C435D1A267B',
  network: 'base',
  facilitators: [
    { id: 'x402-rs', name: 'X402 RS', priority: 1 },
    { id: 'payai-network', name: 'PayAI Network', priority: 2 },
    { id: 'coinbase-cdp', name: 'Coinbase CDP', priority: 3 }
  ]
}

[Failover Middleware] Initialized with 3 facilitators: X402 RS (priority 1), PayAI Network (priority 2), Coinbase CDP (priority 3)
```

## 自动切换演示

### 场景1: 主facilitator正常

```bash
[Failover Middleware] Trying facilitator: X402 RS
[Failover Middleware] ✓ Success with X402 RS (234ms)
```

### 场景2: 主facilitator失败，自动切换

```bash
[Failover Middleware] Trying facilitator: X402 RS
[Failover Middleware] ✗ X402 RS failed: Connection timeout
[Failover Middleware] Attempting next facilitator (2 remaining)...

[Failover Middleware] Trying facilitator: PayAI Network
[Failover Middleware] ✓ Success with PayAI Network (456ms) after 1 failover(s)
```

### 场景3: 所有facilitator都失败

```bash
[Failover Middleware] Trying facilitator: X402 RS
[Failover Middleware] ✗ X402 RS failed: Connection timeout

[Failover Middleware] Trying facilitator: PayAI Network
[Failover Middleware] ✗ PayAI Network failed: HTTP 503

[Failover Middleware] Trying facilitator: Coinbase CDP
[Failover Middleware] ✗ Coinbase CDP failed: Connection timeout

[Failover Middleware] All facilitators failed after 2345ms

返回给用户:
HTTP 503 Service Unavailable
{
  "error": "All payment facilitators are currently unavailable",
  "details": [
    { "facilitator": "X402 RS", "error": "Connection timeout" },
    { "facilitator": "PayAI Network", "error": "HTTP 503" },
    { "facilitator": "Coinbase CDP", "error": "Connection timeout" }
  ],
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## 配置选项

### 启用/禁用特定facilitator

```bash
# 禁用PayAI Network
FACILITATOR_2_ENABLED=false

# 现在只会使用 x402.rs 和 Coinbase CDP
```

### 调整优先级

在 `lib/payment-middleware-with-failover.ts` 中修改：

```typescript
facilitators.push({
  id: "x402-rs",
  name: "X402 RS",
  config: { url: facilitator1Url },
  priority: 1,  // 修改这里！数字越小优先级越高
});
```

### 添加新的facilitator

在 `.env.local` 添加：

```bash
FACILITATOR_4_URL=https://your-custom-facilitator.com
FACILITATOR_4_ENABLED=true
```

然后在 `lib/payment-middleware-with-failover.ts` 的 `getFacilitatorsFromEnv()` 函数中添加：

```typescript
// Facilitator 4: Custom
const facilitator4Url = process.env.FACILITATOR_4_URL;
const facilitator4Enabled = process.env.FACILITATOR_4_ENABLED !== "false";

if (facilitator4Enabled && facilitator4Url) {
  facilitators.push({
    id: "custom",
    name: "Custom Facilitator",
    config: {
      url: facilitator4Url as `${string}://${string}`,
    },
    priority: 4,
  });
}
```

## 测试Failover

### 方法1: 使用错误的URL

临时修改 `.env.local`:

```bash
# 故意使用错误的URL来测试failover
FACILITATOR_1_URL=https://invalid-facilitator.example.com
FACILITATOR_1_ENABLED=true

# 正确的URL作为备份
FACILITATOR_2_URL=https://facilitator.x402.rs
FACILITATOR_2_ENABLED=true
```

重启服务器，发起请求，你会看到自动切换到facilitator 2！

### 方法2: 禁用主facilitator

```bash
# 禁用主facilitator
FACILITATOR_1_ENABLED=false

# 现在会直接使用 facilitator 2
```

## 监控

### 查看实时日志

启动应用时使用：

```bash
yarn dev
```

每次支付请求都会显示使用了哪个facilitator。

### 关键指标

- **成功时**: 显示使用的facilitator和响应时间
- **Failover时**: 显示尝试的facilitator数量
- **全部失败时**: 显示所有facilitator的错误详情

## 最佳实践

### 1. 优先级设置

```bash
# Priority 1: 最快、最可靠的
FACILITATOR_1_URL=https://facilitator.x402.rs

# Priority 2: 备用
FACILITATOR_2_URL=https://facilitator.payai.network

# Priority 3: 最后的保险
FACILITATOR_3_ENABLED=true  # Coinbase CDP
```

### 2. 至少配置2个facilitator

```bash
# 建议最少2个
FACILITATOR_1_ENABLED=true
FACILITATOR_2_ENABLED=true
```

### 3. 定期测试failover

每周手动测试一次：

```bash
# 1. 禁用主facilitator
FACILITATOR_1_ENABLED=false

# 2. 重启并测试
yarn dev

# 3. 发起支付请求，确认自动切换工作

# 4. 恢复配置
FACILITATOR_1_ENABLED=true
```

## 性能

### 正常情况

- **延迟**: 与单facilitator相同 (通常200-500ms)
- **开销**: 可忽略不计 (~1ms包装层)

### Failover情况

- **每次failover增加**: 3-10秒 (取决于超时配置)
- **最坏情况**: 尝试3个facilitator = 最多30秒

### 优化建议

如果failover太慢，可以在未来实现：
- 并行尝试多个facilitator
- 使用健康检查提前检测失败
- 缓存最后成功的facilitator

## 故障排查

### 问题: 总是使用第一个facilitator

**检查**: 确保其他facilitator已启用

```bash
FACILITATOR_2_ENABLED=true  # 确保是true，不是false
```

### 问题: 没有看到failover日志

**原因**: 第一个facilitator工作正常！

**测试**: 临时禁用第一个facilitator来触发failover

### 问题: 所有facilitator都失败

**检查**:
1. 网络连接
2. Facilitator URLs是否正确
3. CDP API密钥是否有效
4. 防火墙设置

## 与之前aggregator的区别

### ❌ 旧方案 (不工作)

- 无法在Edge Runtime中导入`x402`
- 需要复杂的健康检查系统
- 代码复杂

### ✅ 新方案 (工作!)

- ✅ **直接包装middleware函数** - 不需要导入x402
- ✅ **在Edge Runtime中工作** - 使用Next.js已有的导入
- ✅ **简单** - 只有一个文件
- ✅ **可靠** - 真正的failover，不是mock
- ✅ **实时日志** - 可以看到每次切换

## 总结

你现在有了一个**生产级的facilitator failover系统**：

- ✅ 在middleware中直接工作
- ✅ 真正的自动切换
- ✅ 详细的日志记录
- ✅ 灵活的配置
- ✅ Edge Runtime兼容

**开始使用**: 只需重启服务器，failover就已经在工作了！

```bash
yarn dev
```

🎉 享受自动failover带来的高可用性！
