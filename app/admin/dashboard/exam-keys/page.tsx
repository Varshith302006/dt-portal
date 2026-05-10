"use client";

import React, {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

const SEM_ICONS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
];

export default function ExamKeysPage() {

  const router = useRouter();

  const [
    semesters,
    setSemesters,
  ] = useState<any[]>([]);

  const [
    examCounts,
    setExamCounts,
  ] = useState<any>({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    darkMode,
    setDarkMode,
  ] = useState(false);

  /* ----------------------------- */
  /* THEME */
  /* ----------------------------- */

  useEffect(() => {

    if (darkMode) {

      document.documentElement.classList.add(
        "dark"
      );

    }

    else {

      document.documentElement.classList.remove(
        "dark"
      );

    }

  }, [darkMode]);

  /* ----------------------------- */
  /* FETCH */
  /* ----------------------------- */

  useEffect(() => {

    fetchAll();

  }, []);

  const fetchAll =
    async () => {

      setLoading(true);

      const [
        semRes,
        examRes,
      ] = await Promise.all([

        supabase
          .from("semesters")
          .select("*")
          .order("id"),

        supabase
          .from("conduct_exam")
          .select("sem_id"),

      ]);

      setSemesters(
        semRes.data || []
      );

      const counts: any =
        {};

      (
        examRes.data || []
      ).forEach((e: any) => {

        counts[e.sem_id] =
          (
            counts[e.sem_id] ||
            0
          ) + 1;

      });

      setExamCounts(counts);

      setLoading(false);

    };

  /* ----------------------------- */
  /* LOGOUT */
  /* ----------------------------- */

  const handleLogout =
    () => {

      localStorage.clear();

      router.push("/");

    };

  /* ----------------------------- */
  /* UI */
  /* ----------------------------- */

  return (

    <div className="
      min-h-screen
      bg-background
      text-foreground
    ">

      {/* NAVBAR */}

      <div className="
        h-20
        border-b
        border-border
        px-8
        flex
        items-center
        justify-between
        bg-card
      ">

        {/* LEFT */}

        <div className="
          flex
          items-center
          gap-4
        ">

          <div className="
            w-12
            h-12
            rounded-2xl
            bg-indigo-500/10
            text-indigo-500
            flex
            items-center
            justify-center
            font-bold
            text-lg
          ">

            DT

          </div>

          <div>

            <h1 className="
              text-2xl
              font-bold
              tracking-tight
            ">

              Exam Keys

            </h1>

            <p className="
              text-sm
              text-muted-foreground
              mt-1
            ">

              Assessment Portal

            </p>

          </div>

        </div>

        {/* RIGHT */}

        <div className="
          flex
          items-center
          gap-3
        ">

          {/* THEME */}

          <button
            onClick={() =>
              setDarkMode(
                !darkMode
              )
            }
            className="
              h-11
              px-4
              rounded-xl
              border
              border-border
              bg-card
              hover:border-indigo-500
              transition-all
              text-sm
              font-semibold
              cursor-pointer
            "
          >

            {
              darkMode
                ? "☀"
                : "☾"
            }

          </button>

          {/* BACK */}

          <button
            onClick={() =>
              router.push(
                "/admin/dashboard"
              )
            }
            className="
              h-11
              px-5
              rounded-xl
              border
              border-border
              bg-card
              hover:border-indigo-500
              transition-all
              text-sm
              font-semibold
              cursor-pointer
            "
          >

            Back to Dashboard

          </button>

          {/* LOGOUT */}

          <button
            onClick={
              handleLogout
            }
            className="
              h-11
              px-5
              rounded-xl
              border
              border-red-500/20
              text-red-500
              hover:bg-red-500/10
              transition-all
              text-sm
              font-semibold
              cursor-pointer
            "
          >

            Logout

          </button>

        </div>

      </div>

      {/* CONTENT */}

      <div className="
        max-w-7xl
        mx-auto
        px-8
        py-10
      ">

        {/* HEADER */}

        <div className="
          mb-10
        ">

          <div className="
            flex
            items-center
            gap-3
            mb-4
          ">

            <div className="
              w-12
              h-[2px]
              rounded-full
              bg-indigo-500
            " />

            <span className="
              text-xs
              uppercase
              tracking-[0.2em]
              text-muted-foreground
              font-semibold
            ">

              Admin · Exam Management

            </span>

          </div>

          <h2 className="
            text-5xl
            font-bold
            tracking-tight
          ">

            Select a
            {" "}
            <span className="
              text-indigo-500
            ">

              Semester

            </span>

          </h2>

          <p className="
            mt-4
            text-muted-foreground
          ">

            Choose a semester
            to view exams
            and student keys.

          </p>

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="
            h-64
            flex
            items-center
            justify-center
            text-indigo-500
            font-semibold
            text-lg
          ">

            Loading semesters...

          </div>

        ) : (

          <div className="
            grid
            gap-6
            md:grid-cols-2
            xl:grid-cols-3
          ">

            {semesters.map(
              (
                sem: any,
                idx: number
              ) => {

                const count =
                  examCounts[
                    sem.id
                  ] || 0;

                return (

                  <div
                    key={
                      sem.id
                    }
                    onClick={() =>
                      router.push(
                        `/admin/dashboard/exam-keys/sem/${sem.id}`
                      )
                    }
                    className="
                      relative
                      overflow-hidden
                      rounded-3xl
                      border
                      border-border
                      bg-card
                      p-8
                      cursor-pointer
                      transition-all
                      hover:-translate-y-1
                      hover:border-indigo-500
                      hover:shadow-xl
                    "
                  >

                    {/* NUMBER */}

                    <div className="
                      text-6xl
                      font-black
                      text-indigo-500/10
                      leading-none
                      mb-6
                    ">

                      {
                        SEM_ICONS[
                          idx
                        ] || "00"
                      }

                    </div>

                    {/* TITLE */}

                    <h3 className="
                      text-2xl
                      font-bold
                      tracking-tight
                    ">

                      {
                        sem.label ||
                        sem.sem_name
                      }

                    </h3>

                    <p className="
                      mt-3
                      text-sm
                      text-muted-foreground
                      leading-relaxed
                    ">

                      Click to view
                      exams and
                      student keys.

                    </p>

                    {/* STATS */}

                    <div className="
                      mt-6
                      inline-flex
                      items-center
                      rounded-full
                      bg-indigo-500/10
                      text-indigo-500
                      px-4
                      py-2
                      text-xs
                      font-semibold
                    ">

                      {count}
                      {" "}
                      exam
                      {count !== 1
                        ? "s"
                        : ""}

                    </div>

                    {/* ARROW */}

                    <div className="
                      absolute
                      bottom-6
                      right-6
                      text-muted-foreground
                      text-xl
                    ">

                      →

                    </div>

                  </div>

                );

              }
            )}

          </div>

        )}

      </div>

    </div>

  );

}