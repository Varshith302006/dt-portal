"use client";

import { useEffect, useState } from "react";

export default function CountdownOverlay({
  onDone,
}: {
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);

  const values = ["3", "2", "1", "GO"];

  useEffect(() => {
    if (step >= values.length) {
      onDone();
      return;
    }

    const timer = setTimeout(() => {
      setStep((prev) => prev + 1);
    }, 900);

    return () => clearTimeout(timer);
  }, [step]);

  if (step >= values.length) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="h-40 w-40 rounded-full border-4 border-indigo-500 flex items-center justify-center animate-pulse bg-background shadow-2xl">
        <span className="text-6xl font-bold text-white">
          {values[step]}
        </span>
      </div>

      <p className="mt-6 text-lg text-white font-medium">
        Get Ready...
      </p>
    </div>
  );
}