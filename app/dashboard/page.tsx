"use client";

import { useEffect, useState } from "react";

import {
  Calendar,
  Clock3,
  FileText,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { supabase } from "@/lib/supabase";

import { useRouter } from "next/navigation";

export default function DashboardPage() {

  const router = useRouter();

  const [student, setStudent] = useState<any>(null);

  const [activeExams, setActiveExams] = useState<any[]>([]);

  useEffect(() => {

    const storedStudent =
      localStorage.getItem("student");

    if (storedStudent) {

      const parsed =
        JSON.parse(storedStudent);

      setStudent(parsed);

      fetchExams(parsed);

    }

  }, []);

  const fetchExams = async (
    user: any
  ) => {

    const now =
      new Date().toISOString();

    const { data } = await supabase
      .from("conduct_exam")
      .select(`
        *,
        subjects (
          label
        )
      `)
      .eq("sem_id", user.sem_id)
      .eq("branch_id", user.branch_id)
      .lte("start_time", now)
      .gte("end_time", now);

    setActiveExams(data || []);
  };

  const formatDate = (
    date: string
  ) => {

    // UTC DATE
    const utcDate = new Date(date);

    // ADD 5 HOURS 30 MINUTES
    const istDate = new Date(
      utcDate.getTime() + (5.5 * 60 * 60 * 1000)
    );

    return istDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );

  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>

        <h1 className="text-3xl font-bold tracking-tight">

          Exams

        </h1>

        <p className="text-muted-foreground mt-1">

          Active exams assigned to you.

        </p>

      </div>

      {/* NO EXAMS */}
      {activeExams.length === 0 ? (

        <Card className="rounded-lg border-dashed">

          <CardContent className="p-12 text-center">

            <h3 className="text-lg font-semibold">

              No Active Exams

            </h3>

            <p className="text-sm text-muted-foreground mt-2">

              There are currently no active exams available.

            </p>

          </CardContent>

        </Card>

      ) : (

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {activeExams.map((exam) => (

            <Card
              key={exam.exam_id}
              className="
                rounded-lg
                border-border/60
                hover:border-indigo-500/30
                transition-all
                bg-card
              "
            >

              <CardContent className="p-6 space-y-6">

                {/* STATUS */}
                <div className="flex items-center justify-between">

                  <div className="
                    text-xs
                    px-3
                    py-1
                    rounded-md
                    bg-green-500/10
                    text-green-500
                    border
                    border-green-500/20
                    font-medium
                  ">

                    Active

                  </div>

                </div>

                {/* TITLE */}
                <div>

                  <h2 className="text-xl font-semibold">

                    {exam.exam_name}

                  </h2>

                  <p className="text-sm text-muted-foreground mt-1">

                    {exam.subjects?.label}

                  </p>

                </div>

                {/* DETAILS */}
                <div className="space-y-3 text-sm">

                  {/* START */}
                  <div className="flex items-center gap-3 text-muted-foreground">

                    <Calendar size={16} />

                    <span>

                      Starts At:{" "}
                      {formatDate(exam.start_time)}

                    </span>

                  </div>

                  {/* END */}
                  <div className="flex items-center gap-3 text-muted-foreground">

                    <Calendar size={16} />

                    <span>

                      Ends At:{" "}
                      {formatDate(exam.end_time)}

                    </span>

                  </div>

                </div>

                {/* BUTTON */}
                <Button
                  className="
                    w-full
                    rounded-md
                    bg-gradient-to-r
                    from-indigo-500
                    to-violet-600
                    hover:opacity-90
                    cursor-pointer
                  "
                  onClick={() =>
                    router.push(
                      `/exam/${exam.exam_id}`
                    )
                  }
                >

                  Start Exam

                </Button>

              </CardContent>

            </Card>

          ))}

        </div>

      )}

    </div>
  );
}
