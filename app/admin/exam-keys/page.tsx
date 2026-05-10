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
  "07",
  "08",
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

  return (

    <div className="
      space-y-8
    ">


      {/* CARDS */}

      {loading ? (

        <div className="
          h-64
          flex
          items-center
          justify-center
          text-indigo-500
          font-semibold
          text-lg
          rounded-3xl
          border
          border-border
          bg-card
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
                      `/admin/exam-keys/sem/${sem.id}`
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
                      ] || ""
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

  );

}