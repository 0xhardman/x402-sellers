# ⚡ 超时问题已修复！

## 问题

之前facilitator请求等待超过**62秒**才超时，这太慢了！

```
[Failover Middleware] ✓ Success with X402 RS (62440ms)  ❌ 太慢！
```

## 解决方案

添加了**5秒超时**机制：

1. **默认超时**: 5秒（可配置）
2. **每个facilitator独立超时**: 可以为每个设置不同的超时
3. **超时后自动failover**: 超时立即尝试下一个facilitator

## 现在的行为

### 成功情况（正常速度）

```bash
[Failover Middleware] Trying facilitator: X402 RS (timeout: 5000ms)
[Failover Middleware] ✓ Success with X402 RS (234ms)  ✅ 快！
```

### 超时自动切换

```bash
[Failover Middleware] Trying facilitator: X402 RS (timeout: 5000ms)
[Failover Middleware] ✗ X402 RS failed: Timeout after 5000ms
[Failover Middleware] Attempting next facilitator (2 remaining)...

[Failover Middleware] Trying facilitator: PayAI Network (timeout: 5000ms)
[Failover Middleware] ✓ Success with PayAI Network (456ms) after 1 failover(s)
```

## 配置

### 全局超时（`.env`）

```bash
# 所有facilitator的默认超时
FACILITATOR_TIMEOUT_MS=5000  # 5秒
```

### 每个facilitator独立超时

如果某个facilitator特别慢，可以给它更长的超时：

```bash
# 自定义每个facilitator的超时
FACILITATOR_1_TIMEOUT_MS=3000   # X402 RS: 3秒（更快）
FACILITATOR_2_TIMEOUT_MS=5000   # PayAI: 5秒（标准）
FACILITATOR_3_TIMEOUT_MS=10000  # Coinbase CDP: 10秒（更宽容）
```

## 重启服务器

**必须重启才能生效！**

```bash
# 停止当前服务器 (Ctrl+C 或 kill进程)
# 然后重新启动
yarn dev
```

## 测试

重启后，发起一个支付请求，你会看到：

```bash
[Failover Middleware] Trying facilitator: X402 RS (timeout: 5000ms)
# 应该在几百毫秒内完成，或者5秒后超时
```

## 推荐设置

### 生产环境

```bash
# 快速失败，快速切换
FACILITATOR_TIMEOUT_MS=3000  # 3秒
```

### 开发环境

```bash
# 更宽容，减少误报
FACILITATOR_TIMEOUT_MS=10000  # 10秒
```

### 最佳平衡

```bash
# 推荐！平衡速度和可靠性
FACILITATOR_TIMEOUT_MS=5000  # 5秒（当前设置）
```

## 性能影响

### 之前

- ❌ 单个facilitator失败 = 等待60+秒
- ❌ 3个facilitator都慢 = 180+秒
- ❌ 用户体验极差

### 现在

- ✅ 单个facilitator失败 = 最多等待5秒后切换
- ✅ 3个facilitator都失败 = 最多15秒（5秒 × 3）
- ✅ 正常情况 = 几百毫秒（无变化）

## 故障排查

### 问题：仍然很慢

**检查**: 服务器是否重启？

```bash
# 确保重启了
yarn dev
```

### 问题：看不到timeout日志

**检查**: 是否是facilitator真的太慢？

```bash
# 临时设置更短的超时来测试
FACILITATOR_TIMEOUT_MS=1000  # 1秒
```

### 问题：经常超时

**可能**: facilitator确实很慢或网络问题

**解决**: 增加超时时间

```bash
FACILITATOR_TIMEOUT_MS=10000  # 10秒
```

或者禁用慢的facilitator：

```bash
FACILITATOR_1_ENABLED=false  # 禁用慢的
```

## 总结

✅ **5秒超时** - 快速失败检测
✅ **自动failover** - 超时后立即尝试下一个
✅ **可配置** - 每个facilitator独立设置
✅ **生产就绪** - 合理的默认值

**现在重启服务器，享受快速的failover吧！** 🚀
