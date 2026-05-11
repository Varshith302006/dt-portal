"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import * as XLSX from "xlsx";

import { supabase } from "@/lib/supabase";

const SEMESTERS = [
  { id: 1, label: "Semester 1" },
  { id: 2, label: "Semester 2" },
  { id: 3, label: "Semester 3" },
  { id: 4, label: "Semester 4" },
  { id: 5, label: "Semester 5" },
  { id: 6, label: "Semester 6" },
  { id: 7, label: "Semester 7" },
  { id: 8, label: "Semester 8" },
];

const semLabel = (
  id: number
) =>
  SEMESTERS.find(
    (s) =>
      s.id === Number(id)
  )?.label ??
  `Sem ${id}`;

function marksClass(
  marks: number
) {

  if (marks >= 4) {

    return "text-green-500";

  }

  if (marks >= 2) {

    return "text-yellow-500";

  }

  return "text-red-500";

}

export default function ExamResultsPage() {

  const [
    searchRoll,
    setSearchRoll,
  ] = useState("");

  const [
    filterMode,
    setFilterMode,
  ] = useState("all");

  const [
    filterSem,
    setFilterSem,
  ] = useState("");

  const [
    filterBranch,
    setFilterBranch,
  ] = useState("");

  const [
    filterExamId,
    setFilterExamId,
  ] = useState("");

  const [
    results,
    setResults,
  ] = useState<any[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    exams,
    setExams,
  ] = useState<any[]>([]);

  const [
    branches,
    setBranches,
  ] = useState<any[]>([]);

  useEffect(() => {

    fetchExams();

  }, []);

  useEffect(() => {

    if (!filterSem) {

      setBranches([]);

      return;

    }

    fetchBranches();

  }, [filterSem]);

  const fetchExams =
    async () => {

      const {
        data,
      } = await supabase
        .from(
          "conduct_exam"
        )
        .select(`
          exam_id,
          exam_name
        `)
        .order(
          "exam_id",
          {
            ascending:
              false,
          }
        );

      setExams(
        data || []
      );

    };

  const fetchBranches =
    async () => {

      const {
        data,
      } = await supabase
        .from(
          "branches"
        )
        .select(`
          id,
          label
        `)
        .eq(
          "semester_id",
          Number(
            filterSem
          )
        )
        .order("label");

      setBranches(
        data || []
      );

    };

  const fetchResults =
    useCallback(
      async (
        mode =
          filterMode
      ) => {

        setLoading(
          true
        );

        let q =
          supabase
            .from(
              "exam_results"
            )
            .select(`
              id,
              exam_id,
              st_id,
              total_marks,
              submitted_at,

              student:st_id (
                st_id,
                st_name,
                sem_id,
                branch_id,
                section,

                branch:branch_id (
                  id,
                  label
                )
              ),

              exam:exam_id (
                exam_id,
                exam_name,

                subject:subject_id (
                  id,
                  label
                )
              )
            `)
            .order(
              "submitted_at",
              {
                ascending:
                  false,
              }
            );

        if (
          mode ===
            "exam" &&
          filterExamId
        ) {

          q = q.eq(
            "exam_id",
            Number(
              filterExamId
            )
          );

        }

        if (
          searchRoll.trim()
        ) {

          q = q.ilike(
            "st_id",
            `%${searchRoll.trim()}%`
          );

        }

        const {
          data,
          error,
        } =
          await q.limit(
            500
          );

        setLoading(
          false
        );

        if (error) {

          return;

        }

        let rows =
          data || [];

        if (
          mode ===
            "sem" &&
          filterSem
        ) {

          rows =
            rows.filter(
              (
                r: any
              ) =>
                r.student
                  ?.sem_id ===
                Number(
                  filterSem
                )
            );

        }

        if (
          mode ===
            "branch" &&
          filterSem
        ) {

          rows =
            rows.filter(
              (
                r: any
              ) =>
                r.student
                  ?.sem_id ===
                Number(
                  filterSem
                )
            );

          if (
            filterBranch
          ) {

            rows =
              rows.filter(
                (
                  r: any
                ) =>
                  r.student
                    ?.branch_id ===
                  Number(
                    filterBranch
                  )
              );

          }

        }

        setResults(
          rows
        );

      },

      [
        filterMode,
        filterSem,
        filterBranch,
        filterExamId,
        searchRoll,
      ]
    );

  useEffect(() => {

    fetchResults(
      "all"
    );

  }, []);

  const downloadExcel =
    () => {

      const rows =
        results.map(
          (
            r: any
          ) => ({

            "Exam ID":
              r.exam_id,

            "Exam Name":
              r.exam
                ?.exam_name,

            "Roll Number":
              r.st_id,

            "Student Name":
              r.student
                ?.st_name,

            Semester:
              semLabel(
                r.student
                  ?.sem_id
              ),

            Branch:
              r.student
                ?.branch
                ?.label,

            Section:
              r.student
                ?.section,

            Subject:
              r.exam
                ?.subject
                ?.label,

            Marks:
              r.total_marks,

          })
        );

      const ws =
        XLSX.utils.json_to_sheet(
          rows
        );

      const wb =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Results"
      );

      XLSX.writeFile(
        wb,
        "Exam_Results.xlsx"
      );

    };

  return (

    <div className="
      space-y-8
    ">


      {/* FILTERS */}

      <div className="
        rounded-3xl
        border
        border-border
        bg-card
        p-6
        space-y-6
      ">

        <div className="
          flex
          flex-col
          gap-4
          lg:flex-row
        ">

          <input
            type="text"
            value={
              searchRoll
            }
            onChange={(
              e
            ) =>
              setSearchRoll(
                e.target
                  .value
              )
            }
            placeholder="Search by roll number"
            className="
              h-12
              flex-1
              rounded-2xl
              border
              border-border
              bg-background
              px-4
              outline-none
              focus:border-indigo-500
            "
          />

          <button
            onClick={() =>
              fetchResults(
                filterMode
              )
            }
            className="
              h-12
              rounded-2xl
              bg-indigo-500
              px-6
              font-semibold
              text-white
            "
          >

            Search

          </button>

          <button
            onClick={
              downloadExcel
            }
            disabled={
              results.length ===
              0
            }
            className="
              h-12
              rounded-2xl
              bg-green-600
              px-6
              font-semibold
              text-white
              disabled:opacity-50
            "
          >

            Download Excel

          </button>

        </div>

        {/* FILTER BUTTONS */}

        <div className="
          flex
          flex-wrap
          gap-3
        ">

          {[
            "all",
            "sem",
            "branch",
            "exam",
          ].map(
            (
              mode
            ) => (

              <button
                key={mode}
                onClick={() => {

                  setFilterMode(
                    mode
                  );

                  setFilterSem(
                    ""
                  );

                  setFilterBranch(
                    ""
                  );

                  setFilterExamId(
                    ""
                  );

                }}
                className={`
                  h-10
                  rounded-full
                  px-5
                  text-sm
                  font-semibold

                  ${
                    filterMode ===
                    mode

                      ? "bg-indigo-500 text-white"

                      : "border border-border bg-background"
                  }
                `}
              >

                {
                  mode ===
                  "all"
                    ? "All Results"
                    : mode ===
                      "sem"
                    ? "By Semester"
                    : mode ===
                      "branch"
                    ? "By Branch"
                    : "By Exam"
                }

              </button>

            )
          )}

        </div>

        {/* SELECTS */}

        {filterMode !==
          "all" && (

          <div className="
            flex
            flex-wrap
            gap-4
          ">

            {(filterMode ===
              "sem" ||
              filterMode ===
                "branch") && (

              <select
                value={
                  filterSem
                }
                onChange={(
                  e
                ) =>
                  setFilterSem(
                    e.target
                      .value
                  )
                }
                className="
                  h-12
                  min-w-[200px]
                  rounded-2xl
                  border
                  border-border
                  bg-[#111111]
                  text-white
                  px-4
                  color-scheme-dark
                "
              >

                <option value="">
                  All Semesters
                </option>

                {SEMESTERS.map(
                  (
                    s
                  ) => (

                    <option
                      key={
                        s.id
                      }
                      value={
                        s.id
                      }
                    >

                      {
                        s.label
                      }

                    </option>

                  )
                )}

              </select>

            )}

            {filterMode ===
              "branch" && (

              <select
                value={
                  filterBranch
                }
                onChange={(
                  e
                ) =>
                  setFilterBranch(
                    e.target
                      .value
                  )
                }
                className="
                  h-12
                  min-w-[200px]
                  rounded-2xl
                  border
                  border-border
                  bg-[#111111]
                  text-white
                  px-4
                  color-scheme-dark
                "
              >

                <option value="">
                  All Branches
                </option>

                {branches.map(
                  (
                    b: any
                  ) => (

                    <option
                      key={
                        b.id
                      }
                      value={
                        b.id
                      }
                    >

                      {
                        b.label
                      }

                    </option>

                  )
                )}

              </select>

            )}

            {filterMode ===
              "exam" && (

              <select
                value={
                  filterExamId
                }
                onChange={(
                  e
                ) =>
                  setFilterExamId(
                    e.target
                      .value
                  )
                }
                className="
                  h-12
                  min-w-[240px]
                  rounded-2xl
                  border
                  border-border
                  bg-[#111111]
                  text-white
                  px-4
                  color-scheme-dark
                "
              >

                <option value="">
                  All Exams
                </option>

                {exams.map(
                  (
                    e: any
                  ) => (

                    <option
                      key={
                        e.exam_id
                      }
                      value={
                        e.exam_id
                      }
                    >

                      #
                      {
                        e.exam_id
                      }
                      {" - "}
                      {
                        e.exam_name
                      }

                    </option>

                  )
                )}

              </select>

            )}

            <button
              onClick={() =>
                fetchResults(
                  filterMode
                )
              }
              className="
                h-12
                rounded-2xl
                bg-indigo-500
                px-6
                font-semibold
                text-white
              "
            >

              Apply Filter

            </button>

          </div>

        )}

      </div>

      {/* TABLE */}

      <div className="
        rounded-3xl
        border
        border-border
        bg-card
        overflow-hidden
      ">

        <div className="
          flex
          items-center
          justify-between
          border-b
          border-border
          px-6
          py-5
        ">

          <div>

            <h2 className="
              text-lg
              font-semibold
            ">

              Result Records

            </h2>

            <p className="
              text-sm
              text-muted-foreground
            ">

              {
                results.length
              }
              {" "}
              results found

            </p>

          </div>

        </div>

        {loading ? (

          <div className="
            py-20
            text-center
            text-indigo-500
            font-semibold
          ">

            Loading results...

          </div>

        ) : results.length ===
          0 ? (

          <div className="
            py-20
            text-center
            text-muted-foreground
          ">

            No results found

          </div>

        ) : (

          <div className="
            overflow-x-auto
          ">

            <table className="
              w-full
              text-sm
            ">

              <thead className="
                border-b
                border-border
                bg-muted/30
              ">

                <tr>

                  {[
                    "#",
                    "Exam ID",
                    "Exam Name",
                    "Roll Number",
                    "Student",
                    "Semester",
                    "Branch",
                    "Section",
                    "Subject",
                    "Marks",
                    "Submitted",
                  ].map(
                    (
                      h
                    ) => (

                      <th
                        key={h}
                        className="
                          whitespace-nowrap
                          px-5
                          py-4
                          text-left
                          text-xs
                          font-bold
                          uppercase
                          tracking-wider
                          text-muted-foreground
                        "
                      >

                        {h}

                      </th>

                    )
                  )}

                </tr>

              </thead>

              <tbody>

                {results.map(
                  (
                    r: any,
                    idx: number
                  ) => {

                    const submitted =
                      r.submitted_at

                        ? new Date(
                            new Date(
                              r.submitted_at
                            ).getTime() 
                          ).toLocaleString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month:
                                "short",
                              year:
                                "numeric",
                              hour:
                                "2-digit",
                              minute:
                                "2-digit",
                              hour12:
                                true,
                            }
                          )

                        : "—";

                    return (

                      <tr
                        key={
                          r.id
                        }
                        className="
                          border-b
                          border-border/50
                          hover:bg-muted/20
                        "
                      >

                        <td className="
                          px-5
                          py-4
                          text-muted-foreground
                        ">

                          {
                            idx + 1
                          }

                        </td>

                        <td className="
                          px-5
                          py-4
                        ">

                          <span className="
                            rounded-lg
                            bg-violet-500/10
                            px-3
                            py-1
                            font-semibold
                            text-violet-500
                          ">

                            #
                            {
                              r.exam_id
                            }

                          </span>

                        </td>

                        <td className="
                          px-5
                          py-4
                          font-medium
                        ">

                          {
                            r.exam
                              ?.exam_name ||
                            "—"
                          }

                        </td>

                        <td className="
                          px-5
                          py-4
                        ">

                          <span className="
                            rounded-lg
                            bg-indigo-500/10
                            px-3
                            py-1
                            font-semibold
                            text-indigo-500
                          ">

                            {
                              r.st_id
                            }

                          </span>

                        </td>

                        <td className="
                          px-5
                          py-4
                          font-medium
                        ">

                          {
                            r.student
                              ?.st_name ||
                            "—"
                          }

                        </td>

                        <td className="
                          px-5
                          py-4
                        ">

                          {semLabel(
                            r.student
                              ?.sem_id
                          )}

                        </td>

                        <td className="
                          px-5
                          py-4
                        ">

                          {
                            r.student
                              ?.branch
                              ?.label ||
                            "—"
                          }

                        </td>

                        <td className="
                          px-5
                          py-4
                        ">

                          {
                            r.student
                              ?.section ||
                            "—"
                          }

                        </td>

                        <td className="
                          px-5
                          py-4
                        ">

                          {
                            r.exam
                              ?.subject
                              ?.label ||
                            "—"
                          }

                        </td>

                        <td className="
                          px-5
                          py-4
                          font-bold
                        ">

                          <span
                            className={marksClass(
                              r.total_marks
                            )}
                          >

                            {
                              r.total_marks ??
                              "—"
                            }

                          </span>

                        </td>

                        <td className="
                          whitespace-nowrap
                          px-5
                          py-4
                          text-muted-foreground
                        ">

                          {
                            submitted
                          }

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>

  );

}