"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");

  const [studentError, setStudentError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [loginError, setLoginError] = useState("");

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // VALIDATION
  const validate = () => {
    let valid = true;

    setStudentError("");
    setPasswordError("");
    setLoginError("");

    if (!studentId.trim()) {
      setStudentError("ID is required");
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      valid = false;
    }

    return valid;
  };

  // LOGIN
  const handleLogin = async () => {

    if (!validate()) return;

    setLoading(true);

    /* ------------------------------- */
    /* CHECK ADMIN FIRST */
    /* ------------------------------- */

    const {
      data: adminData,
    } = await supabase
      .from("admin")
      .select("*")
      .eq(
        "ad_id",
        studentId
      )
      .eq(
        "password",
        password
      )
      .single();

    // ADMIN FOUND
    if (adminData) {

      setLoading(false);

      localStorage.setItem(
        "admin",
        JSON.stringify(
          adminData
        )
      );

      router.push(
        "/admin/dashboard"
      );

      return;

    }

    /* ------------------------------- */
    /* CHECK STUDENT */
    /* ------------------------------- */

    const {
      data: studentData,
      error,
    } = await supabase
      .from("student")
      .select("*")
      .eq(
        "st_id",
        studentId
      )
      .eq(
        "password",
        password
      )
      .single();

    setLoading(false);

    if (
      error ||
      !studentData
    ) {

      setLoginError(
        "Invalid credentials"
      );

      return;

    }

    localStorage.setItem(
      "student",
      JSON.stringify(
        studentData
      )
    );

    /* STORE LOGIN LOG */

    const {
      data: branchData,
    } = await supabase
      .from(
        "branches"
      )
      .select(
        "label"
      )
      .eq(
        "id",
        studentData.branch_id
      )
      .single();

    await supabase
      .from(
        "login_logs"
      )
      .insert([
        {
          st_id:
            studentData.st_id,

          st_name:
            studentData.st_name,

          semester:
            `Semester ${studentData.sem_id}`,

          branch:
            branchData
              ?.label || "",

          login_time:
            new Date(
              Date.now() +
              (5.5 * 60 * 60 * 1000)
            ).toISOString(),

          device:
            /Mobi|Android/i.test(
              navigator.userAgent
            )

              ? "Mobile"

              : "Desktop",

          browser:
            navigator.userAgent,

          ip_address:
            "",
        },
      ]);

    const now =
      new Date().toISOString();

    const {
      data: exams,
    } = await supabase
      .from("conduct_exam")
      .select("*")
      .lte(
        "start_time",
        now
      )
      .gte(
        "end_time",
        now
      );

    if (
      exams &&
      exams.length > 0
    ) {

      localStorage.setItem(
        "active_exam",
        JSON.stringify(
          exams[0]
        )
      );

      router.push(
        "/exam-key"
      );

    }

    else {

      router.push(
        "/dashboard"
      );

    }

  };

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors">

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">

        {/* LOGO */}
        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold">
            DT
          </div>

          <div>
            <h1 className="text-lg font-semibold text-foreground">
              DT Portal
            </h1>

            <p className="text-xs text-muted-foreground">
              Definition & Terminology
            </p>
          </div>

        </div>

        <ThemeToggle />

      </div>

      {/* LOGIN CONTAINER */}
      <div className="flex-1 flex items-center justify-center p-6">

        <Card className="w-full max-w-md border border-border bg-card shadow-2xl">

          <CardContent className="p-8 space-y-6">

            {/* HEADER */}
            <div>

              <h2 className="text-3xl font-bold text-foreground">
                Sign In
              </h2>

              <p className="text-muted-foreground text-sm mt-2">
                Enter your Crediantials below to login to your account
              </p>

              {/* LOGIN ERROR */}
              {loginError && (
                <div className="mt-4 flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">

                  <AlertCircle size={16} />

                  {loginError}

                </div>
              )}

            </div>

            {/* EMAIL */}
            <div className="space-y-2">

              <label className="text-sm font-medium text-foreground">
                Roll No.
              </label>

              <Input
                placeholder="25951A0500"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="bg-background"
              />

              {studentError && (
                <p className="text-red-500 text-sm">
                  {studentError}
                </p>
              )}

            </div>

            {/* PASSWORD */}
            <div className="space-y-2">

              <label className="text-sm font-medium text-foreground">
                Password
              </label>

              <div className="relative">

                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >

                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

              {passwordError && (
                <p className="text-red-500 text-sm">
                  {passwordError}
                </p>
              )}

            </div>

            {/* BUTTON */}
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-11 text-base bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90"
            >

              {loading ? "Signing In..." : "Sign In"}

            </Button>


          </CardContent>

        </Card>

      </div>

    </div>
  );
}