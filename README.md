# Swap Protection Agent

<h4 align="center">
  <a href="https://github.com/Ciara-347/SwapGuard-Agent">GitHub</a> |
  Built with <a href="https://scaffoldeth.io">Scaffold-ETH 2</a>
</h4>

A trading analysis agent that helps you evaluate swap transactions before execution — know your best DEX route, estimated slippage, and MEV risk level before you confirm.

## What It Does

1. Enter your swap details: **token in**, **token out**, and **amount**
2. The Agent analyzes the trade against on-chain data
3. Get back: **recommended DEX**, **estimated slippage**, and **MEV risk level**

> MVP stage: currently uses mock data. On-chain integration coming next.

## Architecture

```
packages/
├── agent/          # Express + TypeScript analysis API (port 4000)
├── nextjs/         # React frontend (Next.js, port 3000)
└── hardhat/        # Smart contracts (Hardhat)
```

## Requirements

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/getting-started/install)
- [Git](https://git-scm.com/downloads)

## Quickstart

```bash
# 1. Install dependencies
yarn install

# 2. Start the Agent API (terminal 1)
yarn agent

# 3. Start the frontend (terminal 2)
yarn start
```

Then open **http://localhost:3000**, fill in the swap details (e.g. ETH → USDC, amount: 1), and click **Analyze Trade**.

## Demo Flow

```
1. yarn agent          # Terminal 1: Start Agent on port 4000
2. yarn start          # Terminal 2: Start frontend on port 3000

3. Open http://localhost:3000
4. Enter tokenIn: ETH, tokenOut: USDC, amount: 1
5. Click "Analyze Trade"
6. View analysis results: Best DEX, Slippage, MEV Risk
7. Demo error handling: stop the Agent, click Analyze again — see friendly error message
```

## Optional: Local Blockchain

If you need a local blockchain for contract interaction:

```bash
yarn chain          # Start local Hardhat network
yarn deploy         # Deploy smart contracts
```

## Agent API

| Method | Path       | Description        |
|--------|------------|--------------------|
| GET    | `/`        | Health check       |
| POST   | `/analyze` | Analyze a swap     |

### POST `/analyze`

Request:
```json
{ "tokenIn": "ETH", "tokenOut": "USDC", "amount": 1 }
```

Response:
```json
{ "bestDex": "Uniswap", "slippage": "0.4%", "mevRisk": "LOW" }
```

---

Built with [Scaffold-ETH 2](https://scaffoldeth.io) — NextJS, RainbowKit, Hardhat, Wagmi, Viem, TypeScript, Tailwind CSS + DaisyUI.
