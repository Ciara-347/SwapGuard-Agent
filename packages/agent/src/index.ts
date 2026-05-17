import dotenv from "dotenv";
dotenv.config();

import express, { type Request, type Response } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Agent Running");
});

app.post("/analyze", (req: Request, res: Response) => {
  const { tokenIn, tokenOut, amount } = req.body;

  console.log(`[analyze] tokenIn=${tokenIn} tokenOut=${tokenOut} amount=${amount}`);

  if (!tokenIn || !tokenOut || amount === undefined || amount === null) {
    res.status(400).json({ error: "Missing required fields: tokenIn, tokenOut, amount" });
    return;
  }

  if (typeof amount !== "number" || amount <= 0) {
    res.status(400).json({ error: "amount must be a positive number" });
    return;
  }

  res.json({
    bestDex: "Uniswap",
    slippage: "0.4%",
    mevRisk: "LOW" as const,
  });
});

app.listen(PORT, () => {
  console.log(`Agent server running on port ${PORT}`);
});
