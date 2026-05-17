# Swap Protection Agent — 开发流程文档

> 基于 PRD v1.0（2026-05-12），黑客松 MVP

---

## 一、开发总览

### 1.1 交付物

| 序号 | 模块 | 说明 |
|------|------|------|
| D1 | `packages/agent/` | Node.js + Express + TypeScript 分析服务 |
| D2 | `packages/nextjs/app/page.tsx` | 重构为用户输入 + 分析结果展示页面 |
| D3 | 联调验证 | 前端 ↔ Agent 通信正常，错误处理到位 |

### 1.2 阶段划分

```
Phase 1: Agent 服务搭建    →  独立可测试的 API
Phase 2: 前端页面重构      →  用户输入界面 + 结果展示
Phase 3: 前后端联调        →  端到端验证
Phase 4: 收尾 & 演示准备   →  文档、启动脚本、Demo 流程
```

---

## 二、Phase 1 — Agent 服务搭建

### 2.1 初始化 `packages/agent/`

**步骤：**

1. 创建目录结构
2. 编写 `package.json`
3. 编写 `tsconfig.json`
4. 编写 `src/index.ts`
5. 在根 `package.json` 添加 `agent` workspace
6. 安装依赖

**文件清单：**

```
packages/agent/
├── package.json        # 依赖：express, cors, ts-node-dev, typescript
├── tsconfig.json       # TypeScript 配置
└── src/
    └── index.ts        # Express 服务主文件
```

**`package.json` 关键字段：**
```json
{
  "name": "@se-2/agent",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.2.2"
  }
}
```

**`src/index.ts` 需要实现的端点：**

| 方法 | 路径 | 说明 | 响应 |
|------|------|------|------|
| GET | `/` | 健康检查 | `"Agent Running"` |
| POST | `/analyze` | 交易分析 | `{ bestDex, slippage, mevRisk }` |

**实现要点：**
- CORS 允许 `http://localhost:3000`
- POST `/analyze` 接收 `{ tokenIn, tokenOut, amount }`
- 当前返回模拟数据：`bestDex: "Uniswap"`, `slippage: "0.4%"`, `mevRisk: "LOW"`
- 请求参数校验：三个字段必填，amount > 0
- 请求日志（console.log）
- 错误时返回 4xx/5xx JSON 错误信息

**预计耗时：** 30 分钟

---

## 三、Phase 2 — 前端页面重构

### 3.1 修改 `packages/nextjs/app/page.tsx`

当前首页是 SE-2 默认模板页，需替换为 Swap Protection Agent 界面。

**页面结构设计：**

```
┌─────────────────────────────────────┐
│   Swap Protection Agent             │
│                                     │
│   Token In:    [____________]       │
│   Token Out:   [____________]       │
│   Amount:      [____________]       │
│                                     │
│   [ Analyze Trade ]                 │
│                                     │
│   ┌─ 分析结果 ─────────────────┐   │
│   │ Best DEX:   Uniswap        │   │
│   │ Slippage:   0.4%           │   │
│   │ MEV Risk:   LOW            │   │
│   └────────────────────────────┘   │
│                                     │
│   (加载中...) / (错误提示)          │
└─────────────────────────────────────┘
```

**实现逻辑：**

1. 三个 state：`tokenIn`, `tokenOut`, `amount`
2. POST 请求到 `http://localhost:4000/analyze`
3. 管理 loading / result / error 三个状态
4. 使用 DaisyUI 组件（`input`, `btn`, `card`, `badge` 等）

**状态流转：**

```
idle → loading → success (展示结果)
              → error   (展示错误)
```

**MEV 风险等级配色：**

| 等级 | 颜色 | DaisyUI Badge |
|------|------|---------------|
| LOW | 绿色 | `badge-success` |
| MEDIUM | 黄色 | `badge-warning` |
| HIGH | 红色 | `badge-error` |

**预计耗时：** 1 小时

### 3.2 可选：添加 Agent URL 配置

在 `packages/nextjs/scaffold.config.ts` 或 `.env` 中添加 `NEXT_PUBLIC_AGENT_URL` 配置，方便切换环境。

---

## 四、Phase 3 — 前后端联调

### 4.1 本地启动流程

```bash
# 终端 1：启动 Agent
cd packages/agent && yarn dev

# 终端 2：启动前端
yarn start
```

### 4.2 验证清单

- [ ] Agent 启动正常，`curl localhost:4000` 返回 "Agent Running"
- [ ] `curl -X POST localhost:4000/analyze -H "Content-Type: application/json" -d '{"tokenIn":"ETH","tokenOut":"USDC","amount":1}'` 返回正确 JSON
- [ ] 前端页面加载正常（`localhost:3000`）
- [ ] 输入测试数据点击 Analyze，正常返回并展示结果
- [ ] 关闭 Agent 后点击 Analyze，前端显示友好错误提示
- [ ] 输入无效参数（空字段、负数），显示错误

### 4.3 异常场景测试

| 场景 | 预期 |
|------|------|
| Agent 未启动 | 前端显示 "Agent 服务不可用" |
| 网络超时 | 前端显示超时提示 |
| 空字段提交 | Agent 返回 400，前端显示参数错误 |
| amount 为 0 或负数 | Agent 返回 400，前端显示参数错误 |

---

## 五、Phase 4 — 收尾

### 5.1 文档更新

- [ ] 更新项目 README，说明 Swap Protection Agent 是什么、如何启动
- [ ] 确认 `AGENTS.md` 中 agent 相关说明正确

### 5.2 演示流程脚本

```
1. yarn chain          # 可选：启动本地链
2. cd packages/agent && yarn dev   # 启动 Agent
3. yarn start          # 启动前端

4. 打开 localhost:3000
5. 输入 tokenIn: ETH, tokenOut: USDC, amount: 1
6. 点击 Analyze Trade
7. 展示分析结果
8. 演示错误处理：关闭 Agent，再次点击，展示错误提示
```

---

## 六、开发顺序建议

```
第一步：搭建 Agent 服务
  ├── 创建 packages/agent/ 目录和文件
  ├── 配置根 package.json workspaces
  └── 验证：curl 测试两个端点

第二步：重构前端页面
  ├── 修改 page.tsx
  ├── 使用 DaisyUI 组件构建 UI
  └── 验证：页面渲染正常

第三步：联调
  ├── 同时启动两个服务
  ├── 端到端测试
  └── 修复联调问题

第四步：收尾
  ├── 异常场景覆盖
  ├── UI 细节打磨
  └── 文档
```

---

## 七、关键风险

| 风险 | 缓解措施 |
|------|----------|
| Agent 端口冲突 | 使用 4000 端口，与前端 3000 不冲突 |
| CORS 问题 | Agent 启动时就配置 cors 中间件 |
| SE-2 已有 page.tsx 较复杂 | 先备份或基于现有结构渐进修改 |
| Monad RPC 不可用 | MVP 阶段全部用模拟数据，不依赖链 |

---

## 八、文件变更总览

| 文件 | 操作 | 说明 |
|------|------|------|
| `packages/agent/package.json` | 新建 | Agent 依赖与脚本 |
| `packages/agent/tsconfig.json` | 新建 | TS 配置 |
| `packages/agent/src/index.ts` | 新建 | Express 服务 |
| `package.json` | 修改 | 添加 agent workspace |
| `packages/nextjs/app/page.tsx` | 修改 | 替换为 Swap 分析界面 |
| `packages/nextjs/.env.example` | 可选新建 | Agent URL 配置 |

---

> 下一步：进入实施阶段，按 Phase 1 → 4 顺序执行。
