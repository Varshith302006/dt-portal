"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";

import {
  DialogTitle,
} from "@/components/ui/dialog";

export default function InstructionsModal({
  open,
  examName,
  duration,
  onStart,
}: {
  open: boolean;
  examName: string;
  duration: number;
  onStart: () => void;
}) {
  const [checked, setChecked] = useState(false);

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden">

        <DialogTitle className="hidden">
          Exam Instructions
        </DialogTitle>

        <div className="h-2 bg-gradient-to-r from-indigo-500 to-violet-600" />

        <div className="p-8 space-y-8">

          <div>
            <h2 className="text-3xl font-bold">
              Exam Instructions
            </h2>

            <p className="text-muted-foreground mt-2">
              {examName}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {[
              "Fullscreen mandatory",
              "No tab switching",
              "No copy/paste",
              "Developer tools blocked",
              "3 violations max",
              "Auto submit on timeout",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border p-4 text-sm"
              >
                {item}
              </div>
            ))}

          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              checked={checked}
              onCheckedChange={() =>
                setChecked(!checked)
              }
            />

            <p className="text-sm">
              I agree to all exam rules.
            </p>
          </div>

          <Button
            disabled={!checked}
            className="w-full rounded-lg bg-indigo-500 hover:bg-indigo-600"
            onClick={onStart}
          >
            Start Exam ({duration} Minutes)
          </Button>

        </div>

      </DialogContent>
    </Dialog>
  );
}