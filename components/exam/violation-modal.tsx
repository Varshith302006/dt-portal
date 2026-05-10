"use client";

import { Button } from "@/components/ui/button";

export default function ViolationModal({
  title,
  message,
  count,
  onDismiss,
}: {
  title: string;
  message: string;
  count: number;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-2xl text-center space-y-5">
        <div className="text-6xl">🚨</div>

        <h2 className="text-2xl font-bold text-red-500">
          {title}
        </h2>

        <p className="text-sm text-muted-foreground leading-6">
          {message}
        </p>

        <div className="text-lg font-semibold">
          Violations: {count}/3
        </div>

        <Button
          className="bg-red-500 hover:bg-red-600 rounded-lg"
          onClick={onDismiss}
        >
          Continue Exam
        </Button>
      </div>
    </div>
  );
}