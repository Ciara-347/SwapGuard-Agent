"use client";

import { useRef, useState } from "react";
import type { NextPage } from "next";

const AGENT_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type MevRisk = "LOW" | "MEDIUM" | "HIGH";

type AnalysisResult = {
  bestDex: string;
  slippage: string;
  mevRisk: MevRisk;
};

const MEV_BADGE: Record<MevRisk, string> = {
  LOW: "badge-success",
  MEDIUM: "badge-warning",
  HIGH: "badge-error",
};

const Home: NextPage = () => {
  const [tokenIn, setTokenIn] = useState("");
  const [tokenOut, setTokenOut] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAnalyze = async () => {
    if (!tokenIn.trim() || !tokenOut.trim() || !amount) {
      setError("Please fill in all fields");
      setResult(null);
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Amount must be a positive number");
      setResult(null);
      return;
    }

    abortRef.current?.abort();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const controller = new AbortController();
    abortRef.current = controller;
    timeoutRef.current = setTimeout(() => controller.abort(), 15_000);

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`${AGENT_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenIn: tokenIn.trim(), tokenOut: tokenOut.trim(), amount: numAmount }),
        signal: controller.signal,
      });
      if (!res.ok) {
        let message = "Unknown error";
        try {
          const errData = await res.json();
          message = errData.error || message;
        } catch {}
        throw new Error(message);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Request timed out. Please try again.");
        return;
      }
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError("Agent service is unavailable. Please make sure the agent is running on port 4000.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10 px-5">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Swap Protection Agent</h1>
        <p className="text-lg text-base-content/60 mt-2">Before you swap, know your risk</p>
      </div>

      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body gap-4">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Token In</span>
            </div>
            <input
              type="text"
              placeholder="ETH"
              className="input input-bordered w-full"
              value={tokenIn}
              onChange={e => setTokenIn(e.target.value)}
            />
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Token Out</span>
            </div>
            <input
              type="text"
              placeholder="USDC"
              className="input input-bordered w-full"
              value={tokenOut}
              onChange={e => setTokenOut(e.target.value)}
            />
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Amount</span>
            </div>
            <input
              type="number"
              placeholder="1.0"
              className="input input-bordered w-full"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
              step="any"
            />
          </label>

          <button className="btn btn-primary w-full" onClick={handleAnalyze} disabled={loading}>
            {loading && <span className="loading loading-spinner"></span>}
            {loading ? "Analyzing..." : "Analyze Trade"}
          </button>

          {error && (
            <div className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {result && !error && (
            <div className="bg-base-200 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Best DEX</span>
                <span className="font-bold">{result.bestDex}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Estimated Slippage</span>
                <span className="font-bold">{result.slippage}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">MEV Risk</span>
                <span className={`badge ${MEV_BADGE[result.mevRisk]} badge-lg`}>{result.mevRisk}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
