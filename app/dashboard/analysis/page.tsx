"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { supabase } from "@/lib/supabase";

export default function AnalysisPage() {

  const [student, setStudent] =
    useState<any>(null);

  const [results, setResults] =
    useState<any[]>([]);

  const [pendingExams, setPendingExams] =
    useState<any[]>([]);

  useEffect(() => {

    const stored =
      localStorage.getItem("student");

    if (stored) {

      const parsed =
        JSON.parse(stored);

      setStudent(parsed);

      fetchAnalysis(parsed);

    }

  }, []);

  const fetchAnalysis = async (
    user: any
  ) => {

    // RESULTS
    const { data: resultData } =
      await supabase
        .from("exam_results")
        .select(`
          *,
          conduct_exam (
            exam_name,
            start_time,
            end_time
          )
        `)
        .eq("st_id", user.st_id)
        .order("submitted_at", {
          ascending: false,
        });

    setResults(resultData || []);

    // ALL EXAMS
    const { data: examsData } =
      await supabase
        .from("conduct_exam")
        .select("*")
        .eq("sem_id", user.sem_id)
        .eq("branch_id", user.branch_id);

    // SUBMITTED EXAMS
    const submittedIds =
      (resultData || []).map(
        (r: any) => r.exam_id
      );

    // FILTER PENDING
    const pending =
      (examsData || []).filter(
        (exam: any) =>
          !submittedIds.includes(
            exam.exam_id
          )
      );

    setPendingExams(pending);

  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>

        <h1 className="text-3xl font-bold tracking-tight">

          Analysis

        </h1>

        <p className="text-muted-foreground mt-1">

          Track your exam performance
          and activity.

        </p>

      </div>

      {/* STATS */}
      <div className="
        grid
        gap-4
        md:grid-cols-2
      ">

        {/* ATTENDED */}
        <Card
          className="
            rounded-lg
            border-border/60
            hover:border-indigo-500/30
            transition-all
          "
        >

          <CardContent className="p-5">

            <p className="text-sm text-muted-foreground">

              Attended Exams

            </p>

            <h2 className="text-3xl font-bold mt-2">

              {results.length}

            </h2>

          </CardContent>

        </Card>

        {/* PENDING */}
        <Card
          className="
            rounded-lg
            border-border/60
            hover:border-indigo-500/30
            transition-all
          "
        >

          <CardContent className="p-5">

            <p className="text-sm text-muted-foreground">

              Pending Exams

            </p>

            <h2 className="text-3xl font-bold mt-2">

              {pendingExams.length}

            </h2>

          </CardContent>

        </Card>

      </div>

      {/* RECENT RESULTS */}
      <div className="space-y-4">

        <div>

          <h2 className="text-xl font-semibold">

            Recent Results

          </h2>

          <p className="text-sm text-muted-foreground">

            Latest submitted exams.

          </p>

        </div>

        {results.length === 0 ? (

          <Card
            className="
              rounded-lg
              border-dashed
              border-border/60
            "
          >

            <CardContent className="p-10 text-center">

              <p className="text-muted-foreground">

                No exam results available.

              </p>

            </CardContent>

          </Card>

        ) : (

          <div className="space-y-4">

            {results.map((result) => (

              <Card
                key={result.id}
                className="
                  rounded-lg
                  border-border/60
                  hover:border-indigo-500/30
                  transition-all
                "
              >

                <CardContent className="p-5">

                  <div className="
                    flex
                    flex-col
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                    gap-4
                  ">

                    {/* LEFT */}
                    <div>

                      <h3 className="font-semibold text-lg">

                        {
                          result.conduct_exam
                            ?.exam_name
                        }

                      </h3>

                      <p className="
                        text-sm
                        text-muted-foreground
                        mt-1
                      ">

                        Submitted Successfully

                      </p>

                    </div>

                    {/* RIGHT */}
                    <div className="
                      flex
                      flex-wrap
                      items-center
                      gap-3
                    ">

                      <Badge
                        variant="secondary"
                        className="rounded-md"
                      >

                        Score:{" "}
                        {
                          result.total_marks
                        }

                      </Badge>

                      <Badge
                        variant="outline"
                        className="rounded-md"
                      >

                        Grade:{" "}
                        {
                          result.final_grade
                        }

                      </Badge>

                      <Badge
                        className="
                          rounded-md
                          bg-indigo-500
                          hover:bg-indigo-500
                        "
                      >

                        {
                          result.avg_match_pct
                        }%

                      </Badge>

                    </div>

                  </div>

                </CardContent>

              </Card>

            ))}

          </div>

        )}

      </div>

      {/* NOT ATTENDED */}
      <div className="space-y-4">

        <div>

          <h2 className="text-xl font-semibold">

            Not Attended Exams

          </h2>

          <p className="text-sm text-muted-foreground">

            Exams not submitted yet.

          </p>

        </div>

        {pendingExams.length === 0 ? (

          <Card
            className="
              rounded-lg
              border-dashed
              border-border/60
            "
          >

            <CardContent className="p-10 text-center">

              <p className="text-muted-foreground">

                No pending exams.

              </p>

            </CardContent>

          </Card>

        ) : (

          <div className="space-y-4">

            {pendingExams.map((exam) => (

              <Card
                key={exam.exam_id}
                className="
                  rounded-lg
                  border-border/60
                  hover:border-indigo-500/30
                  transition-all
                "
              >

                <CardContent className="p-5">

                  <div className="
                    flex
                    items-center
                    justify-between
                    gap-4
                  ">

                    <div>

                      <h3 className="font-semibold">

                        {exam.exam_name}

                      </h3>

                      <p className="
                        text-sm
                        text-muted-foreground
                        mt-1
                      ">

                        Not Submitted

                      </p>

                    </div>

                    <Badge
                      variant="destructive"
                      className="rounded-md"
                    >

                      Pending

                    </Badge>

                  </div>

                </CardContent>

              </Card>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}