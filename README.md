# Swap Protection Agent

<h4 align="center">
  <a href="https://github.com/Ciara-347/SwapGuard-Agent">GitHub</a> |
  Built with <a href="https://scaffoldeth.io">Scaffold-ETH 2</a>
</h4>

<!--
  项目一句话简介
  面向 DeFi 交易者的 swap 交易保护分析工具，
  在用户确认交易前提供 DEX 最优路径、滑点预估和 MEV 风险评估。
-->

**Swap Protection Agent** 是一款面向 DeFi 交易者的链上 swap 分析工具。  
在用户点击"确认交易"之前，它帮助用户了解：**走哪个 DEX 最划算**、**滑点大概多少**、**是否面临 MEV 风险**。

> 🔬 **当前阶段：MVP（最小可行产品）**，使用模拟数据。链上数据集成将在下一阶段完成。

---

## 📑 目录

- [项目背景](#项目背景)
- [系统架构](#系统架构)
- [技术栈](#技术栈)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [演示流程](#演示流程)
- [Agent API](#agent-api)
- [项目结构](#项目结构)
- [路线图](#路线图)
- [本地区块链（可选）](#本地区块链可选)

---

## 项目背景

<!--
  痛点说明：DeFi 交易者在 swap 时面临三个核心问题
  - 信息不对称：不知道该选哪个 DEX 最优
  - 滑点不透明：实际成交价与预期偏差大
  - MEV（抢先交易 / 三明治攻击）难以感知
-->

DeFi 用户在链上执行 swap 时，通常面临三个痛点：

| 痛点 | 说明 |
|------|------|
| **路径不透明** | 不同 DEX 之间的报价差异大，用户难以判断哪个最优 |
| **滑点不确定** | 链上状态瞬息万变，预估滑点与实际成交存在偏差 |
| **MEV 风险** | 三明治攻击、抢先交易等 MEV 行为可能导致额外损失 |

Swap Protection Agent 的目标是**在交易执行前给出清晰的风险画像**，让用户做出更明智的决策。

---

## 系统架构

<!--
  三层架构：
  1. Next.js 前端 —— 用户交互界面
  2. Express Agent —— 分析服务 API
  3. Hardhat —— 智能合约（可选，本地测试用）
-->

```
┌──────────────────────────────────────────────┐
│                 用户浏览器                      │
│              http://localhost:3000            │
│          (Next.js + React + DaisyUI)          │
└──────────────────┬───────────────────────────┘
                   │  POST /analyze
                   │  { tokenIn, tokenOut, amount }
                   ▼
┌──────────────────────────────────────────────┐
│              Agent API (Express)              │
│              http://localhost:4000            │
│                                              │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐ │
│  │ DEX 路由 │  │ 滑点预估  │  │ MEV 检测  │ │
│  │  (mock)  │  │  (mock)   │  │  (mock)   │ │
│  └──────────┘  └───────────┘  └───────────┘ │
└──────────────────────────────────────────────┘
```

```
packages/
├── agent/          # Express + TypeScript 分析 API（端口 4000）
├── nextjs/         # React 前端，Next.js App Router（端口 3000）
└── hardhat/        # Solidity 智能合约（Hardhat + hardhat-deploy）
```

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端** | Next.js 15 + React 19 | App Router，`"use client"` |
| **UI** | Tailwind CSS + DaisyUI 5 | 组件优先，深色主题 |
| **Web3** | RainbowKit + Wagmi + Viem | 钱包连接与合约交互 |
| **后端** | Express + TypeScript | RESTful API，分析服务 |
| **合约** | Solidity + Hardhat | 智能合约开发与部署 |
| **包管理** | Yarn 4 (workspaces) | Monorepo 管理 |

---

## 环境要求

<!--
  Node.js >= 20.18.3 是 SE-2 框架的硬性要求
  Yarn 4 通过 Corepack 自动启用，无需全局安装
-->

- [Node.js](https://nodejs.org/) >= **20.18.3**
- [Yarn](https://yarnpkg.com/) >= **4.x**（项目已内置，Corepack 自动激活）
- [Git](https://git-scm.com/)

---

## 快速开始

<!--
  三步启动：
  1. 安装依赖
  2. 启动 Agent
  3. 启动前端
-->

```bash
# 1. 安装依赖（首次运行）
yarn install

# 2. 启动 Agent API（终端 1）
yarn agent

# 3. 启动前端（终端 2）
yarn start
```

打开 **http://localhost:3000**，输入 swap 参数（如 ETH → USDC，数量 1），点击 **Analyze Trade** 即可看到分析结果。

---

## 演示流程

<!--
  完整的 Demo 操作步骤，包括正常流程和错误演示
-->

```
终端 1：yarn agent          # 启动 Agent，监听 4000 端口
终端 2：yarn start          # 启动前端，监听 3000 端口

浏览器操作：
1. 打开 http://localhost:3000
2. Token In 输入：    ETH
3. Token Out 输入：   USDC
4. Amount 输入：      1
5. 点击 "Analyze Trade"
6. 查看结果：Best DEX → Uniswap, Slippage → 0.4%, MEV Risk → LOW

错误演示：
7. 关闭终端 1（停止 Agent）
8. 再次点击 "Analyze Trade"
9. 查看友好错误提示："Agent service is unavailable..."
```

---

## Agent API

<!--
  Agent 服务提供两个端点：
  - GET /    健康检查
  - POST /analyze  交易分析（当前返回模拟数据）
-->

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/` | 健康检查，返回 `"Agent Running"` |
| `POST` | `/analyze` | 分析 swap 交易，返回最优路径、滑点、MEV 风险 |

### POST `/analyze`

**请求：**

```json
{
  "tokenIn": "ETH",
  "tokenOut": "USDC",
  "amount": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `tokenIn` | string | ✅ | 输入代币符号 |
| `tokenOut` | string | ✅ | 输出代币符号 |
| `amount` | number | ✅ | 交易数量（正数） |

**响应（200）：**

```json
{
  "bestDex": "Uniswap",
  "slippage": "0.4%",
  "mevRisk": "LOW"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `bestDex` | string | 推荐的最优 DEX |
| `slippage` | string | 预估滑点（百分比） |
| `mevRisk` | `"LOW"` `"MEDIUM"` `"HIGH"` | MEV 风险等级 |

**错误响应（400）：**

```json
{
  "error": "Missing required fields: tokenIn, tokenOut, amount"
}
```

---

## 项目结构

<!--
  完整的项目文件树，标注每个关键文件的作用
-->

```
SwapGuard-Agent/
├── packages/
│   ├── agent/                        # [后端] 分析服务
│   │   ├── src/
│   │   │   └── index.ts              # Express 服务入口，定义 / 和 /analyze 路由
│   │   ├── package.json              # 依赖：express, cors, ts-node-dev
│   │   └── tsconfig.json             # TypeScript 配置（ES2022 + CommonJS）
│   │
│   ├── nextjs/                       # [前端] Web 应用
│   │   ├── app/
│   │   │   ├── layout.tsx            # 根布局（RainbowKit + Theme Provider）
│   │   │   └── page.tsx              # 首页：swap 输入表单 + 分析结果
│   │   ├── components/               # SE-2 通用组件（ScaffoldEthApp, ThemeProvider）
│   │   ├── hooks/scaffold-eth/       # SE-2 自定义 hooks（合约读写、事件监听）
│   │   ├── contracts/                # 合约 ABI（自动生成 + 手动添加）
│   │   ├── scaffold.config.ts        # 目标网络、RPC、WalletConnect 配置
│   │   └── package.json              # Next.js + RainbowKit + Wagmi + DaisyUI
│   │
│   └── hardhat/                      # [合约] Solidity 开发
│       ├── contracts/
│       │   └── YourContract.sol      # 示例合约（SE-2 模板）
│       ├── deploy/                   # hardhat-deploy 部署脚本
│       └── hardhat.config.ts         # Hardhat 配置（本地 / 测试网）
│
├── AGENTS.md                         # AI Agent 开发指引
├── package.json                      # Monorepo 根配置（workspaces + 脚本）
├── .gitignore                        # Git 忽略规则
└── README.md                         # 本文件
```

---

## 路线图

<!--
  分阶段开发计划：
  Phase 1-3  ✅ 已完成
  Phase 4-6  🔜 计划中
-->

| 阶段 | 内容 | 状态 |
|------|------|------|
| **Phase 1** | Agent 服务搭建（Express + TypeScript + 模拟数据） | ✅ 完成 |
| **Phase 2** | 前端页面重构（用户输入 + 分析结果展示 + 错误处理） | ✅ 完成 |
| **Phase 3** | 前后端联调（端到端验证 + 异常场景覆盖） | ✅ 完成 |
| **Phase 4** | 接入链上数据（DEX 报价聚合 + 真实滑点计算） | 🔜 计划中 |
| **Phase 5** | MEV 风险检测（mempool 监控 + 三明治攻击识别） | 🔜 计划中 |
| **Phase 6** | 交易执行（钱包签名 + 最优路径路由） | 💡 远期规划 |

---

## 本地区块链（可选）

<!--
  如果不需要合约交互可跳过。
  yarn chain 启动 Hardhat 本地节点，yarn deploy 部署示例合约。
-->

仅在需要智能合约交互时执行：

```bash
yarn chain          # 启动 Hardhat 本地链（端口 8545）
yarn deploy         # 部署合约到本地链
```

---

<p align="center">
  Built with <a href="https://scaffoldeth.io">Scaffold-ETH 2</a> — NextJS · RainbowKit · Hardhat · Wagmi · Viem · TypeScript · Tailwind · DaisyUI
</p>
