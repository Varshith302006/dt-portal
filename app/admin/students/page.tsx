"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

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

const SECTIONS = [
  { id: 1, label: "A" },
  { id: 2, label: "B" },
  { id: 3, label: "C" },
  { id: 4, label: "D" },
  { id: 5, label: "E" },
  { id: 6, label: "F" },
];

const semLabel = (
  id: number
) =>
  SEMESTERS.find(
    (s) =>
      s.id === Number(id)
  )?.label || `Sem ${id}`;

const sectionLabel = (
  id: number
) =>
  SECTIONS.find(
    (s) =>
      s.id === Number(id)
  )?.label || id;

export default function StudentManagementPage() {

  const [
    students,
    setStudents,
  ] = useState<any[]>([]);

  const [
    branches,
    setBranches,
  ] = useState<any[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filterSem,
    setFilterSem,
  ] = useState("");

  const [
    filterBranch,
    setFilterBranch,
  ] = useState("");

  const [
    filterSection,
    setFilterSection,
  ] = useState("");

  const [
    showAdd,
    setShowAdd,
  ] = useState(false);

  const [
    editing,
    setEditing,
  ] = useState<any>(null);

  const [
    form,
    setForm,
  ] = useState<any>({
    st_id: "",
    st_name: "",
    sem_id: "",
    branch_id: "",
    section: "",
    password: "",
  });

  useEffect(() => {

    fetchStudents();

  }, []);

  useEffect(() => {

    if (!filterSem) {

      setBranches([]);

      return;

    }

    fetchBranches();

  }, [filterSem]);

  const fetchBranches =
    async () => {

      const {
        data,
      } = await supabase
        .from(
          "branches"
        )
        .select("*")
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

  const fetchStudents =
    useCallback(
      async () => {

        setLoading(
          true
        );

        let q =
          supabase
            .from(
              "student"
            )
            .select(`
              *,
              branch:branch_id (
                id,
                label
              )
            `)
            .order(
              "st_id"
            );

        if (
          search.trim()
        ) {

          q = q.ilike(
            "st_id",
            `%${search.trim()}%`
          );

        }

        if (
          filterSem
        ) {

          q = q.eq(
            "sem_id",
            Number(
              filterSem
            )
          );

        }

        if (
          filterBranch
        ) {

          q = q.eq(
            "branch_id",
            Number(
              filterBranch
            )
          );

        }

        if (
          filterSection
        ) {

          q = q.eq(
            "section",
            Number(
              filterSection
            )
          );

        }

        const {
          data,
        } =
          await q;

        setStudents(
          data || []
        );

        setLoading(
          false
        );

      },

      [
        search,
        filterSem,
        filterBranch,
        filterSection,
      ]
    );

  const resetForm =
    () => {

      setForm({
        st_id: "",
        st_name: "",
        sem_id: "",
        branch_id: "",
        section: "",
        password: "",
      });

      setEditing(
        null
      );

    };

  const saveStudent =
    async () => {

      if (
        !form.st_id ||
        !form.st_name
      ) {

        return;
      }

      const payload = {
        st_id:
          form.st_id,
        st_name:
          form.st_name,
        sem_id:
          Number(
            form.sem_id
          ),
        branch_id:
          Number(
            form.branch_id
          ),
        section:
          Number(
            form.section
          ),
        password:
          form.password,
      };

      if (
        editing
      ) {

        await supabase
          .from(
            "student"
          )
          .update(
            payload
          )
          .eq(
            "st_id",
            editing
          );

      }

      else {

        await supabase
          .from(
            "student"
          )
          .insert(
            payload
          );

      }

      setShowAdd(
        false
      );

      resetForm();

      fetchStudents();

    };

  const deleteStudent =
    async (
      id: string
    ) => {

      if (
        !window.confirm(
          "Delete student?"
        )
      ) return;

      await supabase
        .from(
          "student"
        )
        .delete()
        .eq(
          "st_id",
          id
        );

      fetchStudents();

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
        space-y-5
      ">

        <div className="
          flex
          flex-col
          gap-4
          lg:flex-row
        ">

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target
                  .value
              )
            }
            placeholder="Search roll number..."
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
            onClick={
              fetchStudents
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
            onClick={() => {

              resetForm();

              setShowAdd(
                true
              );

            }}
            className="
              h-12
              rounded-2xl
              bg-green-600
              px-6
              font-semibold
              text-white
            "
          >

            Add Student

          </button>

        </div>

        {/* SELECTS */}

        <div className="
          flex
          flex-wrap
          gap-4
        ">

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
              min-w-[220px]
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
              min-w-[220px]
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

          <select
            value={
              filterSection
            }
            onChange={(
              e
            ) =>
              setFilterSection(
                e.target
                  .value
              )
            }
            className="
              h-12
              min-w-[220px]
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
              All Sections
            </option>

            {SECTIONS.map(
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

        </div>

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

              Students

            </h2>

            <p className="
              text-sm
              text-muted-foreground
            ">

              {
                students.length
              }
              {" "}
              records

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

            Loading students...

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
                bg-muted/20
              ">

                <tr>

                  {[
                    "#",
                    "Roll No",
                    "Name",
                    "Semester",
                    "Branch",
                    "Section",
                    "Actions",
                  ].map(
                    (
                      h
                    ) => (

                      <th
                        key={h}
                        className="
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

                {students.map(
                  (
                    s: any,
                    idx: number
                  ) => (

                    <tr
                      key={
                        s.st_id
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
                          bg-indigo-500/10
                          px-3
                          py-1
                          font-semibold
                          text-indigo-500
                        ">

                          {
                            s.st_id
                          }

                        </span>

                      </td>

                      <td className="
                        px-5
                        py-4
                        font-medium
                      ">

                        {
                          s.st_name
                        }

                      </td>

                      <td className="
                        px-5
                        py-4
                      ">

                        {semLabel(
                          s.sem_id
                        )}

                      </td>

                      <td className="
                        px-5
                        py-4
                      ">

                        {
                          s.branch
                            ?.label ||
                          "—"
                        }

                      </td>

                      <td className="
                        px-5
                        py-4
                      ">

                        {sectionLabel(
                          s.section
                        )}

                      </td>

                      <td className="
                        px-5
                        py-4
                      ">

                        <div className="
                          flex
                          gap-2
                        ">

                          <button
                            onClick={() => {

                              setEditing(
                                s.st_id
                              );

                              setForm({
                                ...s,

                                sem_id:
                                  String(
                                    s.sem_id
                                  ),

                                branch_id:
                                  String(
                                    s.branch_id
                                  ),

                                section:
                                  String(
                                    s.section
                                  ),
                              });

                              setShowAdd(
                                true
                              );

                            }}
                            className="
                              rounded-xl
                              bg-indigo-500/10
                              px-4
                              py-2
                              text-xs
                              font-semibold
                              text-indigo-500
                            "
                          >

                            Edit

                          </button>

                          <button
                            onClick={() =>
                              deleteStudent(
                                s.st_id
                              )
                            }
                            className="
                              rounded-xl
                              bg-red-500/10
                              px-4
                              py-2
                              text-xs
                              font-semibold
                              text-red-500
                            "
                          >

                            Delete

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* MODAL */}

      {showAdd && (

        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/70
          p-4
        ">

          <div className="
            w-full
            max-w-xl
            rounded-3xl
            border
            border-border
            bg-card
            p-8
            space-y-5
          ">

            <div className="
              flex
              items-center
              justify-between
            ">

              <h2 className="
                text-2xl
                font-bold
              ">

                {
                  editing
                    ? "Edit Student"
                    : "Add Student"
                }

              </h2>

              <button
                onClick={() =>
                  setShowAdd(
                    false
                  )
                }
                className="
                  text-muted-foreground
                "
              >

                ✕

              </button>

            </div>

            <div className="
              grid
              gap-4
            ">

              <input
                placeholder="Roll Number"
                value={
                  form.st_id
                }
                disabled={
                  !!editing
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    st_id:
                      e.target
                        .value,
                  })
                }
                className="
                  h-12
                  rounded-2xl
                  border
                  border-border
                  bg-background
                  px-4
                "
              />

              <input
                placeholder="Student Name"
                value={
                  form.st_name
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    st_name:
                      e.target
                        .value,
                  })
                }
                className="
                  h-12
                  rounded-2xl
                  border
                  border-border
                  bg-background
                  px-4
                "
              />

              <select
                value={
                  form.sem_id
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    sem_id:
                      e.target
                        .value,
                  })
                }
                className="
                  h-12
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
                  Select Semester
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

              <select
                value={
                  form.branch_id
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    branch_id:
                      e.target
                        .value,
                  })
                }
                className="
                  h-12
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
                  Select Branch
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

              <select
                value={
                  form.section
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    section:
                      e.target
                        .value,
                  })
                }
                className="
                  h-12
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
                  Select Section
                </option>

                {SECTIONS.map(
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

              <input
                placeholder="Password"
                value={
                  form.password
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    password:
                      e.target
                        .value,
                  })
                }
                className="
                  h-12
                  rounded-2xl
                  border
                  border-border
                  bg-background
                  px-4
                "
              />

            </div>

            <div className="
              flex
              justify-end
              gap-3
              pt-2
            ">

              <button
                onClick={() =>
                  setShowAdd(
                    false
                  )
                }
                className="
                  h-12
                  rounded-2xl
                  border
                  border-border
                  px-6
                "
              >

                Cancel

              </button>

              <button
                onClick={
                  saveStudent
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

                {
                  editing
                    ? "Save Changes"
                    : "Add Student"
                }

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}