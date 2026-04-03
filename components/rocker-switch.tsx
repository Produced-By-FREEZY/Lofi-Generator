"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "triggered" | "resetting" | "error";

const RESET_DELAY_MS = 3000;

export function RockerSwitch() {
  const [isOn, setIsOn] = useState(false);
  const [autoReset, setAutoReset] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  };

  useEffect(() => () => clearTimer(), []);

  const handleToggle = useCallback(async () => {
    // If auto-reset is OFF and switch is already on, allow manual reset
    if (isOn && !autoReset) {
      clearTimer();
      setIsOn(false);
      setStatus("idle");
      setErrorMessage(null);
      return;
    }
    // Only allow triggering from the "off" state
    if (isOn || status === "triggered" || status === "resetting") return;

    setIsOn(true);
    setStatus("triggered");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/trigger", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setErrorMessage(msg);
      setStatus("error");
    }

    // If auto-reset is enabled, switch back after 3 s
    if (autoReset) {
      clearTimer();
      setStatus((prev) => (prev === "error" ? "error" : "resetting"));
      resetTimerRef.current = setTimeout(() => {
        setIsOn(false);
        setStatus("idle");
        setErrorMessage(null);
      }, RESET_DELAY_MS);
    } else {
      // Stay on; allow the user to manually flip it back
      setStatus((prev) => (prev === "error" ? "error" : "triggered"));
    }
  }, [isOn, status, autoReset]);

  const statusLabel: Record<Status, string> = {
    idle: "READY",
    triggered: "TRIGGERING...",
    resetting: "RESETTING",
    error: "ERROR",
  };

  const statusColor: Record<Status, string> = {
    idle: "text-muted-foreground",
    triggered: "text-primary",
    resetting: "text-amber-400",
    error: "text-destructive-foreground",
  };

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Switch label */}
      <p className="text-xs font-mono tracking-[0.25em] text-muted-foreground uppercase select-none">
        Trigger
      </p>

      {/* The rocker switch */}
      <label className="switch-label" aria-label="Trigger switch">
        <span className={`switch${isOn ? " switch--on" : ""}`}>
          <input
            className="switch__input sr-only"
            type="checkbox"
            role="switch"
            aria-checked={isOn}
            checked={isOn}
            onChange={handleToggle}
            disabled={isOn}
          />
          <span className="switch__surface">
            <span className="switch__surface-glare" />
          </span>
          <span className="switch__inner-shadow" />
          <span className="switch__inner">
            <span className="switch__inner-glare" />
          </span>
          <span className="switch__rocker-shadow" />
          <span className="switch__rocker-sides">
            <span className="switch__rocker-sides-glare" />
          </span>
          <span className="switch__rocker">
            <span className="switch__rocker-glare" />
          </span>
          <span className="switch__light">
            <span className="switch__light-inner" />
          </span>
        </span>
      </label>

      {/* Status area */}
      <div className="flex flex-col items-center gap-2">
        <span
          className={`text-xs font-mono tracking-[0.2em] uppercase transition-colors duration-300 ${statusColor[status]}`}
        >
          {statusLabel[status]}
        </span>

        {status === "resetting" && (
          <div
            className="h-px bg-amber-400/30 rounded-full overflow-hidden"
            style={{ width: "120px" }}
            aria-hidden="true"
          >
            <div
              className="h-full bg-amber-400 rounded-full animate-progress"
              style={{ animationDuration: `${RESET_DELAY_MS}ms` }}
            />
          </div>
        )}

        {status === "error" && errorMessage && (
          <p className="text-xs text-destructive-foreground/70 font-mono max-w-xs text-center">
            {errorMessage}
          </p>
        )}
      </div>

      {/* Auto-reset toggle */}
      <div className="flex flex-col items-center gap-3">
        <div className="h-px w-24 bg-border" aria-hidden="true" />
        <label className="flex items-center gap-3 cursor-pointer select-none group">
          {/* pill track */}
          <span
            className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-border transition-colors duration-300"
            style={{
              backgroundColor: autoReset
                ? "oklch(0.72 0.19 145 / 0.25)"
                : "oklch(0.18 0.01 223)",
            }}
            aria-hidden="true"
          >
            {/* thumb */}
            <span
              className="absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full shadow-sm transition-all duration-300"
              style={{
                transform: autoReset ? "translateX(1rem)" : "translateX(0)",
                backgroundColor: autoReset
                  ? "oklch(0.72 0.19 145)"
                  : "oklch(0.45 0.008 223)",
                boxShadow: autoReset
                  ? "0 0 6px oklch(0.72 0.19 145 / 0.6)"
                  : "none",
              }}
            />
          </span>

          <input
            type="checkbox"
            className="sr-only"
            checked={autoReset}
            onChange={() => setAutoReset((v) => !v)}
            aria-label="Auto-reset"
          />

          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground group-hover:text-foreground transition-colors duration-200">
            Auto Reset
            <span
              className="ml-2 transition-colors duration-300"
              style={{
                color: autoReset ? "oklch(0.72 0.19 145)" : "oklch(0.45 0.008 223)",
              }}
            >
              {autoReset ? "ON" : "OFF"}
            </span>
          </span>
        </label>
      </div>
    </div>
  );
}
