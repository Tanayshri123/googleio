"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getScoutStatus, startScout } from "@/lib/api";
import type { AgentId, BattlePlan, ScoutInput, ScoutStatus } from "@/lib/types";

export function useScout() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<ScoutStatus | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentId>("general");
  const [progress, setProgress] = useState<string>("");
  const [battlePlan, setBattlePlan] = useState<BattlePlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const pollingRef = useRef(false);

  const poll = useCallback(async (id: string) => {
    if (pollingRef.current) return;
    pollingRef.current = true;

    try {
      while (pollingRef.current) {
        const next = await getScoutStatus(id);
        setStatus(next);
        if (next.active_agent) setActiveAgent(next.active_agent);
        if (next.progress) setProgress(next.progress);

        if (next.status === "done" && next.result) {
          setBattlePlan(next.result);
          pollingRef.current = false;
          return;
        }
        if (next.status === "error") {
          setError(next.error ?? "Scout failed");
          pollingRef.current = false;
          return;
        }
        await new Promise((r) => setTimeout(r, 800));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Polling failed");
      pollingRef.current = false;
    }
  }, []);

  const runScout = useCallback(
    async (input: ScoutInput) => {
      setIsStarting(true);
      setError(null);
      setBattlePlan(null);
      setActiveAgent("general");
      setProgress("Launching scout…");

      try {
        const { sessionId: id } = await startScout(input);
        setSessionId(id);
        setIsStarting(false);
        await poll(id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to start");
        setIsStarting(false);
      }
    },
    [poll],
  );

  const reset = useCallback(() => {
    pollingRef.current = false;
    setSessionId(null);
    setStatus(null);
    setBattlePlan(null);
    setError(null);
    setActiveAgent("general");
    setProgress("");
  }, []);

  useEffect(() => {
    return () => {
      pollingRef.current = false;
    };
  }, []);

  return {
    sessionId,
    status,
    activeAgent,
    progress,
    battlePlan,
    error,
    isStarting,
    runScout,
    reset,
    setBattlePlan,
  };
}
