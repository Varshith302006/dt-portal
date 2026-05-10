"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import Link from "next/link";

import {
  LayoutDashboard,
  ClipboardList,
  Upload,
  KeyRound,
  BarChart3,
  Users,
  Shield,
  LogOut,
  Menu,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { supabase } from "@/lib/supabase";

export default function AdminDashboardPage() {

  const router = useRouter();

  const [admin, setAdmin] =
    useState<any>(null);

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

    const storedAdmin =
      localStorage.getItem(
        "admin"
      );

    if (!storedAdmin) {

      router.push("/");

      return;

    }

    const parsed =
      JSON.parse(storedAdmin);

    setAdmin(parsed);

    fetchDashboardData();

  }, []);

  const fetchDashboardData =
    async () => {

      const {
        count: studentsCount,
      } = await supabase
        .from("student")
        .select("*", {
          count: "exact",
          head: true,
        });

      const {
        count: subjectsCount,
      } = await supabase
        .from("subjects")
        .select("*", {
          count: "exact",
          head: true,
        });

      const {
        count: examsCount,
      } = await supabase
        .from("conduct_exam")
        .select("*", {
          count: "exact",
          head: true,
        });

      const {
        count: resultsCount,
      } = await supabase
        .from("exam_results")
        .select("*", {
          count: "exact",
          head: true,
        });

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

  const handleLogout = () => {

    localStorage.removeItem(
      "admin"
    );

    router.push("/");

  };

  return (

    <div className="
      min-h-screen
      bg-background
      text-foreground
      flex
    ">

      {/* SIDEBAR */}

      <aside className="
        w-72
        border-r
        border-border
        bg-card
        flex
        flex-col
      ">

        {/* LOGO */}

        <div className="
          h-20
          px-6
          border-b
          border-border
          flex
          items-center
          gap-4
        ">

          <div className="
            w-12
            h-12
            rounded-2xl
            bg-gradient-to-br
            from-indigo-500
            to-violet-600
            flex
            items-center
            justify-center
            text-white
          ">

            <Shield size={24} />

          </div>

          <div>

            <h1 className="
              text-xl
              font-bold
              tracking-tight
            ">

              Admin Panel

            </h1>

            <p className="
              text-xs
              text-muted-foreground
              mt-1
            ">

              DT Management

            </p>

          </div>

        </div>

        {/* NAVIGATION */}

        <div className="
          flex-1
          p-4
          space-y-2
        ">

          {/* DASHBOARD */}

          <Link
            href="/admin/dashboard"
            className="
              h-12
              px-4
              rounded-xl
              flex
              items-center
              gap-3
              bg-indigo-500
              text-white
              font-medium
            "
          >

            <LayoutDashboard size={20} />

            Dashboard

          </Link>

          {/* CREATE EXAM */}

          <Link
            href="/admin/dashboard/create-exam"
            className="
              h-12
              px-4
              rounded-xl
              flex
              items-center
              gap-3
              hover:bg-muted
              transition-all
              font-medium
            "
          >

            <ClipboardList size={20} />

            Create Exams

          </Link>

          {/* UPLOAD QUESTIONS */}

          <Link
            href="/admin/dashboard/UploadQuestions"
            className="
              h-12
              px-4
              rounded-xl
              flex
              items-center
              gap-3
              hover:bg-muted
              transition-all
              font-medium
            "
          >

            <Upload size={20} />

            Upload Questions

          </Link>

          {/* EXAM KEYS */}

          <Link
            href="/admin/dashboard/exam-keys"
            className="
              h-12
              px-4
              rounded-xl
              flex
              items-center
              gap-3
              hover:bg-muted
              transition-all
              font-medium
            "
          >

            <KeyRound size={20} />

            Exam Keys

          </Link>

          {/* EXAM RESULTS */}

          <Link
            href="/admin/dashboard/exam-results"
            className="
              h-12
              px-4
              rounded-xl
              flex
              items-center
              gap-3
              hover:bg-muted
              transition-all
              font-medium
            "
          >

            <BarChart3 size={20} />

            Exam Results

          </Link>

          {/* STUDENTS */}

          <Link
            href="/admin/dashboard/students"
            className="
              h-12
              px-4
              rounded-xl
              flex
              items-center
              gap-3
              hover:bg-muted
              transition-all
              font-medium
            "
          >

            <Users size={20} />

            Student Management

          </Link>

          {/* ADMINS */}

          <Link
            href="/admin/dashboard/admin-management"
            className="
              h-12
              px-4
              rounded-xl
              flex
              items-center
              gap-3
              hover:bg-muted
              transition-all
              font-medium
            "
          >

            <Shield size={20} />

            Admin Management

          </Link>

        </div>

        {/* FOOTER */}

        <div className="
          p-4
          border-t
          border-border
        ">

          <div className="
            rounded-2xl
            border
            border-border
            p-4
            flex
            items-center
            justify-between
          ">

            <div>

              <h3 className="
                font-semibold
                text-sm
              ">

                {
                  admin?.ad_name
                }

              </h3>

              <p className="
                text-xs
                text-muted-foreground
                mt-1
              ">

                Administrator

              </p>

            </div>

            <Button
              onClick={
                handleLogout
              }
              size="icon"
              variant="outline"
              className="
                rounded-xl
              "
            >

              <LogOut size={18} />

            </Button>

          </div>

        </div>

      </aside>

      {/* MAIN */}

      <main className="
        flex-1
        overflow-y-auto
      ">

        {/* TOP HEADER */}

        <div className="
          h-20
          px-8
          border-b
          border-border
          flex
          items-center
          justify-between
        ">

          <div>

            <h1 className="
              text-2xl
              font-bold
              tracking-tight
            ">

              Dashboard

            </h1>

            <p className="
              text-sm
              text-muted-foreground
              mt-1
            ">

              Welcome back,
              {" "}
              {
                admin?.ad_name
              }

            </p>

          </div>

        </div>

        {/* CONTENT */}

        <div className="
          p-8
          space-y-8
        ">

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

                    <ClipboardList size={22} />

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
                  (exam) => (

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

      </main>

    </div>

  );

}