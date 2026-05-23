"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getScoutStatus, startScout } from "@/lib/api";
import type {
  AgentId,
  BattlePlan,
  ScoutInput,
  ScoutPhase,
  ScoutStatus,
} from "@/lib/types";
import { sanitizeScoutReport } from "@/lib/sanitize-plan";

/** Minimum time on scouting screen so users see all agent steps */
const MIN_SCOUTING_MS = 14_000;

export function useScout() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<ScoutStatus | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentId>("general");
  const [progress, setProgress] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [completedSkills, setCompletedSkills] = useState<string[]>([]);
  const [failedSkills, setFailedSkills] = useState<string[]>([]);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [scoutPhase, setScoutPhase] = useState<ScoutPhase>("planning");
  const [battlePlan, setBattlePlan] = useState<BattlePlan | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const pollingRef = useRef(false);
  const scoutingStartedAt = useRef<number | null>(null);

  const poll = useCallback(async (id: string) => {
    if (pollingRef.current) return;
    pollingRef.current = true;

    try {
      while (pollingRef.current) {
        const next = await getScoutStatus(id);
        setStatus(next);

        if (next.status === "running") {
          if (next.active_agent) setActiveAgent(next.active_agent);
          if (next.progress) setProgress(next.progress);
          if (next.selected_skills?.length) setSelectedSkills(next.selected_skills);
          if (next.completed_skills) setCompletedSkills(next.completed_skills);
          if (next.failed_skills) setFailedSkills(next.failed_skills);
          if (next.active_skill !== undefined) setActiveSkill(next.active_skill);
          if (next.scout_phase) setScoutPhase(next.scout_phase);
        }

        if (next.status === "done" && next.result) {
          const started = scoutingStartedAt.current ?? Date.now();
          const waitMs = Math.max(0, MIN_SCOUTING_MS - (Date.now() - started));
          if (waitMs > 0) {
            setProgress("Strategist is compiling your Scout Report…");
            setActiveAgent("strategist");
            setScoutPhase("synthesis");
            setActiveSkill(null);
            await new Promise((r) => setTimeout(r, waitMs));
          }
          setBattlePlan(sanitizeScoutReport(next.result));
          setIsComplete(true);
          pollingRef.current = false;
          return;
        }

        if (next.status === "error") {
          setError(next.error ?? "Scout failed");
          setIsComplete(false);
          pollingRef.current = false;
          return;
        }

        await new Promise((r) => setTimeout(r, 900));
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
      setIsComplete(false);
      setActiveAgent("general");
      setProgress("Launching scout…");
      setSelectedSkills([]);
      setCompletedSkills([]);
      setFailedSkills([]);
      setActiveSkill(null);
      setScoutPhase("planning");
      scoutingStartedAt.current = Date.now();

      try {
        const { sessionId: id } = await startScout(input);
        setSessionId(id);
        setIsStarting(false);
        setProgress("The General is reading your company profile…");
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
    scoutingStartedAt.current = null;
    setSessionId(null);
    setStatus(null);
    setBattlePlan(null);
    setIsComplete(false);
    setError(null);
    setActiveAgent("general");
    setProgress("");
    setSelectedSkills([]);
    setCompletedSkills([]);
    setFailedSkills([]);
    setActiveSkill(null);
    setScoutPhase("planning");
  }, []);

  useEffect(() => {
    return () => {
      pollingRef.current = false;
    };
  }, []);

  const markComplete = useCallback(() => {
    setIsComplete(true);
  }, []);

  return {
    sessionId,
    status,
    activeAgent,
    progress,
    selectedSkills,
    completedSkills,
    failedSkills,
    activeSkill,
    scoutPhase,
    battlePlan,
    isComplete,
    error,
    isStarting,
    runScout,
    reset,
    setBattlePlan,
    markComplete,
  };
}
