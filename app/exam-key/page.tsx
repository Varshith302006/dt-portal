"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  KeyRound,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { supabase } from "@/lib/supabase";

export default function ExamKeyPage() {
  const router = useRouter();

  const [key, setKey] = useState("");

  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    msg: "",
    type: "success",
  });

  const [examName, setExamName] = useState("");

  // SHOW TOAST
  const showToast = (
    msg: string,
    type: "success" | "error"
  ) => {
    setToast({
      show: true,
      msg,
      type,
    });

    setTimeout(() => {
      setToast((t) => ({
        ...t,
        show: false,
      }));
    }, 3000);
  };

  // LOAD EXAM
  useEffect(() => {
    const exam = localStorage.getItem("active_exam");

    if (!exam) {
      router.push("/dashboard");
      return;
    }

    const parsedExam = JSON.parse(exam);

    setExamName(parsedExam.exam_name);
  }, [router]);

  // VERIFY KEY
  const handleVerify = async () => {
    const user = JSON.parse(
      localStorage.getItem("student") || "{}"
    );

    const exam = JSON.parse(
      localStorage.getItem("active_exam") || "{}"
    );

    if (!user?.st_id) {
      showToast(
        "Session expired. Please login again.",
        "error"
      );

      return;
    }

    if (!key.trim()) {
      showToast(
        "Please enter your exam key",
        "error"
      );

      return;
    }

    setLoading(true);

    // CHECK KEY
    const { data } = await supabase
      .from("exam_keys")
      .select("*")
      .eq("st_id", user.st_id)
      .eq("exam_id", exam.exam_id)
      .eq("exam_key", key.trim())
      .eq("is_used", false)
      .limit(1)
      .maybeSingle();

    // INVALID
    if (!data) {
      setLoading(false);

      showToast(
        "Invalid or already used key",
        "error"
      );

      return;
    }

    // MARK USED
    await supabase
      .from("exam_keys")
      .update({
        is_used: true,
      })
      .eq("st_id", user.st_id)
      .eq("exam_key", key.trim());

    // SAVE VERIFIED
    localStorage.setItem(
      "key_verified",
      "true"
    );

    setLoading(false);

    showToast(
      "Key verified successfully",
      "success"
    );

    setTimeout(() => {
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">

      <Card className="w-full max-w-md border border-border bg-card shadow-2xl">

        <CardContent className="p-8 space-y-6">


          {/* HEADER */}
          <div className="text-center">

            <h1 className="mt-4 text-3xl font-bold">
              Enter Your Exam Key
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Your faculty will provide the key at the
              start of the exam.
            </p>

          </div>

          {/* ACTIVE EXAM */}
          <div className="rounded-xl border border-border bg-muted/40 p-4">

            <p className="text-xs text-muted-foreground">
              Active Exam
            </p>

            <h2 className="mt-1 font-semibold">
              {examName}
            </h2>

          </div>

          {/* INPUT */}
          <div className="space-y-2">

            <label className="text-sm font-medium">
              Exam Key
            </label>

            <Input
              placeholder="Enter exam key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleVerify()
              }
              maxLength={20}
              className="h-11 text-center tracking-[0.25em]"
            />

          </div>

          {/* BUTTON */}
          <Button
            onClick={handleVerify}
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-indigo-500 to-violet-600"
          >

            {loading
              ? "Verifying..."
              : "Verify & Continue"}

          </Button>

          {/* FOOTER NOTE */}
          <div className="flex items-center justify-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">

            <ShieldCheck size={14} />

            Each key is single-use and tied to your ID

          </div>

        </CardContent>

      </Card>

      {/* TOAST */}
      {toast.show && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg transition-all
          ${
            toast.type === "success"
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >

          <div className="flex items-center gap-2">

            <AlertCircle size={16} />

            {toast.msg}

          </div>

        </div>
      )}

    </div>
  );
}