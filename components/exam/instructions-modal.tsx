"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface SecurityCheck {
  label: string;
  passed: boolean;
}

export default function InstructionsModal({
  examName,
  duration,
  onStart,
}: {
  examName: string;
  duration: number;
  onStart: () => void;
}) {
  const [checked, setChecked] = useState(false);
  const [devtoolsOpen, setDevtoolsOpen] = useState(false);

  const [checks, setChecks] =
    useState<SecurityCheck[]>([]);

  useEffect(() => {
    let interval:
      ReturnType<
        typeof setInterval
      >;

    const runChecks = () => {
      /* ─── DEVTOOLS DETECTION ─── */
      const widthThreshold =
        window.outerWidth - window.innerWidth > 160;

      const heightThreshold =
        window.outerHeight - window.innerHeight > 160;

      const devtoolsDetected =
        widthThreshold || heightThreshold;

      setDevtoolsOpen(devtoolsDetected);

      /* ─── REAL CHECKS ─── */
      const browserOk =
        /Chrome|Edg/.test(navigator.userAgent);

      const fullscreenOk =
        !!document.documentElement.requestFullscreen;

      const onlineOk = navigator.onLine;

      const resolutionOk =
        window.innerWidth >= 1024 &&
        window.innerHeight >= 650;

      const focusOk = !document.hidden;

      setChecks([
        {
          label: "Browser Support",
          passed: browserOk,
        },
        {
          label: "Fullscreen Access",
          passed: fullscreenOk,
        },
        {
          label: "Internet Connection",
          passed: onlineOk,
        },
        {
          label: "Screen Resolution",
          passed: resolutionOk,
        },
        {
          label: "Devtools Tools",
          passed: !devtoolsDetected,
        },
        {
          label: "Window Focus",
          passed: focusOk,
        },
      ]);
    };

    runChecks();

    interval = setInterval(() => {
      runChecks();
    }, 1000);

    window.addEventListener("resize", runChecks);
    window.addEventListener("online", runChecks);
    window.addEventListener("offline", runChecks);
    document.addEventListener(
      "visibilitychange",
      runChecks
    );

    return () => {
      clearInterval(interval);

      window.removeEventListener(
        "resize",
        runChecks
      );

      window.removeEventListener(
        "online",
        runChecks
      );

      window.removeEventListener(
        "offline",
        runChecks
      );

      document.removeEventListener(
        "visibilitychange",
        runChecks
      );
    };
  }, []);

  const passedCount = useMemo(
    () => checks.filter((c) => c.passed).length,
    [checks]
  );

  const allChecksPassed = useMemo(
    () =>
      checks.length > 0 &&
      checks.every((c) => c.passed),
    [checks]
  );

  const rules = [
    "Fullscreen remains active during the exam.",
    "Tab switching and focus loss are monitored.",
    "Copy, paste, shortcuts, and devtools are blocked.",
    "Questions lock after the maximum submit limit.",
    "Answers are graded using keyword matching.",
    "Security monitoring remains active throughout the exam.",
  ];

  /* ─────────────────────────────────────────────
     DEVTOOLS BLOCK SCREEN
  ───────────────────────────────────────────── */


  return (
    <div className="min-h-screen w-full overflow-y-auto bg-gradient-to-br from-zinc-100 via-white to-indigo-50 dark:from-black dark:via-zinc-950 dark:to-indigo-950/20">

      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute left-[-120px] top-[-120px] h-[380px] w-[380px] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="absolute bottom-[-140px] right-[-140px] h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-3xl" />

      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1450px] px-4 py-5 lg:px-8 lg:py-8">

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/90 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">

          {/* top border */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

          {/* header */}
          <div className="border-b border-zinc-200 px-5 py-5 dark:border-zinc-800 lg:px-8">

            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

              {/* left */}
              <div className="space-y-3">

                <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 dark:border-indigo-900 dark:bg-indigo-950/40">

                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400">
                    Secure Examination Environment
                  </span>

                </div>

                <div>

                  <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Exam Readiness Check
                  </h1>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {examName}
                  </p>

                </div>

              </div>

              {/* right */}
              <div className="flex flex-wrap gap-3">

                <div className="min-w-[150px] rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">

                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                    Duration
                  </p>

                  <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {duration} Minutes
                  </p>

                </div>

                <div className="min-w-[150px] rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">

                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                    Monitoring
                  </p>

                  <p className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    Active
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* body */}
          <div className="grid 2xl:grid-cols-[1fr_0.85fr]">

            {/* left */}
            <div className="border-b border-zinc-200 p-5 dark:border-zinc-800 2xl:border-b-0 2xl:border-r lg:p-8">

              <div className="space-y-5">

                <div>

                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Exam Rules
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Please review the exam rules before continuing.
                  </p>

                </div>

                {/* rules */}
                <div className="grid gap-3 sm:grid-cols-2">

                  {rules.map((rule, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
                    >

                      <div className="mb-3 h-1 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />

                      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                        {rule}
                      </p>

                    </div>
                  ))}

                </div>

                {/* notice */}
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">

                  <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    Fullscreen, focus tracking, and browser monitoring remain active during the exam.
                    Repeated violations may automatically end the session.
                  </p>

                </div>

              </div>

            </div>

            {/* right */}
            <div className="p-5 lg:p-8">

              <div className="space-y-5">

                {/* readiness */}
                <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                        Environment Status
                      </p>

                      <h2 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {allChecksPassed
                          ? "Secure Session Ready"
                          : "Verification Required"}
                      </h2>

                    </div>

                    <div
                      className={`mt-1 h-3 w-3 rounded-full ${allChecksPassed
                        ? "bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.7)]"
                        : "bg-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.7)]"
                        }`}
                    />

                  </div>

                  {/* progress */}
                  <div className="mt-5">

                    <div className="mb-2 flex items-center justify-between">

                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        System Readiness
                      </span>

                      <span className="font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {passedCount}/{checks.length}
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                        style={{
                          width: `${(passedCount / checks.length) * 100}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

                {/* checks */}
                <div className="space-y-2.5">

                  {checks.map((check) => (
                    <div
                      key={check.label}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-300 ${check.passed
                        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20"
                        : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20"
                        }`}
                    >

                      <div>

                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {check.label}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {check.passed
                            ? "Verified"
                            : "Detected"}
                        </p>

                      </div>

                      <div
                        className={`h-3 w-3 rounded-full ${check.passed
                          ? "bg-emerald-500"
                          : "bg-red-500"
                          }`}
                      />

                    </div>
                  ))}

                </div>

                {/* agreement */}
                <div
                  onClick={() => setChecked(!checked)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${checked
                    ? "border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/30"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                    }`}
                >

                  <div className="flex items-start gap-4">

                    <Checkbox
                      checked={checked}
                      onCheckedChange={() =>
                        setChecked(!checked)
                      }
                      className="mt-0.5"
                    />

                    <div>

                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Candidate Agreement
                      </p>

                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        I understand and agree to the exam rules.
                      </p>

                    </div>

                  </div>

                </div>

                {/* button */}
                <div className="space-y-3">

                  <Button
                    disabled={!checked || !allChecksPassed}
                    onClick={onStart}
                    className="h-13 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Launch Secure Examination
                  </Button>

                  {!allChecksPassed && (
                    <p className="text-center text-xs text-red-500">
                      Complete all checks before starting the exam.
                    </p>
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}