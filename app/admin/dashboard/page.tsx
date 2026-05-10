"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Users,
  ClipboardList,
  BarChart3,
  BookOpen,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { supabase } from "@/lib/supabase";

export default function AdminDashboardPage() {

  const [stats, setStats] =
    useState({
      students: 0,
      subjects: 0,
      exams: 0,
      results: 0,
    });

  const [recentExams, setRecentExams] =
    useState<any[]>([]);

  useEffect(() => {

    fetchDashboardData();

  }, []);

  const fetchDashboardData =
    async () => {

      /* STUDENTS */

      const {
        count: studentsCount,
      } = await supabase
        .from("student")
        .select("*", {
          count: "exact",
          head: true,
        });

      /* SUBJECTS */

      const {
        count: subjectsCount,
      } = await supabase
        .from("subjects")
        .select("*", {
          count: "exact",
          head: true,
        });

      /* EXAMS */

      const {
        count: examsCount,
      } = await supabase
        .from("conduct_exam")
        .select("*", {
          count: "exact",
          head: true,
        });

      /* RESULTS */

      const {
        count: resultsCount,
      } = await supabase
        .from("exam_results")
        .select("*", {
          count: "exact",
          head: true,
        });

      /* RECENT EXAMS */

      const {
        data: exams,
      } = await supabase
        .from("conduct_exam")
        .select(`
          *,
          subjects (
            label
          )
        `)
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(5);

      setStats({
        students:
          studentsCount || 0,

        subjects:
          subjectsCount || 0,

        exams:
          examsCount || 0,

        results:
          resultsCount || 0,
      });

      setRecentExams(
        exams || []
      );

    };

  return (

    <div className="
      space-y-8
    ">

      {/* HEADER */}

      <div>

        <h1 className="
          text-4xl
          font-bold
          tracking-tight
        ">

          Dashboard

        </h1>

        <p className="
          text-muted-foreground
          mt-2
        ">

          Overview of exams,
          students and results.

        </p>

      </div>

      {/* STATS */}

      <div className="
        grid
        gap-6
        md:grid-cols-2
        xl:grid-cols-4
      ">

        {/* STUDENTS */}

        <Card className="
          rounded-2xl
          border-border/60
        ">

          <CardContent className="
            p-6
          ">

            <div className="
              flex
              items-center
              justify-between
            ">

              <div>

                <p className="
                  text-sm
                  text-muted-foreground
                ">

                  Students

                </p>

                <h2 className="
                  text-3xl
                  font-bold
                  mt-2
                ">

                  {
                    stats.students
                  }

                </h2>

              </div>

              <div className="
                w-12
                h-12
                rounded-xl
                bg-indigo-500/10
                text-indigo-500
                flex
                items-center
                justify-center
              ">

                <Users size={22} />

              </div>

            </div>

          </CardContent>

        </Card>

        {/* SUBJECTS */}

        <Card className="
          rounded-2xl
          border-border/60
        ">

          <CardContent className="
            p-6
          ">

            <div className="
              flex
              items-center
              justify-between
            ">

              <div>

                <p className="
                  text-sm
                  text-muted-foreground
                ">

                  Subjects

                </p>

                <h2 className="
                  text-3xl
                  font-bold
                  mt-2
                ">

                  {
                    stats.subjects
                  }

                </h2>

              </div>

              <div className="
                w-12
                h-12
                rounded-xl
                bg-violet-500/10
                text-violet-500
                flex
                items-center
                justify-center
              ">

                <BookOpen size={22} />

              </div>

            </div>

          </CardContent>

        </Card>

        {/* EXAMS */}

        <Card className="
          rounded-2xl
          border-border/60
        ">

          <CardContent className="
            p-6
          ">

            <div className="
              flex
              items-center
              justify-between
            ">

              <div>

                <p className="
                  text-sm
                  text-muted-foreground
                ">

                  Exams

                </p>

                <h2 className="
                  text-3xl
                  font-bold
                  mt-2
                ">

                  {
                    stats.exams
                  }

                </h2>

              </div>

              <div className="
                w-12
                h-12
                rounded-xl
                bg-green-500/10
                text-green-500
                flex
                items-center
                justify-center
              ">

                <ClipboardList size={22} />

              </div>

            </div>

          </CardContent>

        </Card>

        {/* RESULTS */}

        <Card className="
          rounded-2xl
          border-border/60
        ">

          <CardContent className="
            p-6
          ">

            <div className="
              flex
              items-center
              justify-between
            ">

              <div>

                <p className="
                  text-sm
                  text-muted-foreground
                ">

                  Results

                </p>

                <h2 className="
                  text-3xl
                  font-bold
                  mt-2
                ">

                  {
                    stats.results
                  }

                </h2>

              </div>

              <div className="
                w-12
                h-12
                rounded-xl
                bg-orange-500/10
                text-orange-500
                flex
                items-center
                justify-center
              ">

                <BarChart3 size={22} />

              </div>

            </div>

          </CardContent>

        </Card>

      </div>

      {/* RECENT EXAMS */}

      <Card className="
        rounded-2xl
        border-border/60
      ">

        <CardContent className="
          p-6
          space-y-6
        ">

          <div>

            <h2 className="
              text-xl
              font-semibold
            ">

              Recent Exams

            </h2>

            <p className="
              text-sm
              text-muted-foreground
              mt-1
            ">

              Latest created exams

            </p>

          </div>

          <div className="
            space-y-4
          ">

            {recentExams.map(
              (exam: any) => (

                <div
                  key={
                    exam.exam_id
                  }
                  className="
                    rounded-xl
                    border
                    border-border/60
                    p-5
                    flex
                    items-center
                    justify-between
                  "
                >

                  <div>

                    <h3 className="
                      font-semibold
                    ">

                      {
                        exam.exam_name
                      }

                    </h3>

                    <p className="
                      text-sm
                      text-muted-foreground
                      mt-1
                    ">

                      {
                        exam.subjects
                          ?.label
                      }

                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </CardContent>

      </Card>

    </div>

  );

}