"use client";

import { Button } from "@/components/ui/button";

export default function DevtoolsBlocked({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="max-w-md rounded-2xl border bg-card p-10 text-center shadow-xl space-y-5">
        <div className="text-6xl">🚫</div>

        <h2 className="text-2xl font-bold text-red-500">
          Developer Tools Detected
        </h2>

        <p className="text-muted-foreground text-sm leading-6">
          Please close Developer Tools before starting the exam.
        </p>

        <Button
          className="bg-indigo-500 hover:bg-indigo-600 rounded-lg"
          onClick={onRetry}
        >
          Check Again
        </Button>
      </div>
    </div>
  );
}