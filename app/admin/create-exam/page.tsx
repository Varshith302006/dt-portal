"use client";

import React, {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700;800&display=swap');

.create-page *{
  box-sizing:border-box;
  font-family:'Chakra Petch',sans-serif;
}

.ce-card{
  width:100%;
  background:var(--card);
  border:1px solid var(--border);
  border-radius:20px;
  padding:32px;
  display:flex;
  flex-direction:column;
  gap:24px;
  overflow:visible;
}

.ce-card-label{
  font-size:12px;
  font-weight:700;
  color:hsl(var(--muted-foreground));
  text-transform:uppercase;
  letter-spacing:.08em;
  border-bottom:1px solid hsl(var(--border));
  padding-bottom:14px;
}

.ce-row{
  display:grid;
  grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  gap:18px;
  align-items:start;
}

.ce-field{
  display:flex;
  flex-direction:column;
  gap:8px;
  position:relative;
  min-width:0;
}

.ce-field label{
  display:flex;
  align-items:center;
  gap:6px;
  font-size:14px;
  font-weight:600;
  color:hsl(var(--foreground));
}

.ce-dot{
  width:6px;
  height:6px;
  border-radius:999px;
  background:#6366f1;
}

.ce-required{
  color:#ef4444;
}

.ce-input,
.ce-select{
  width:100%;
  height:50px;
  border-radius:12px;
  border:1px solid hsl(var(--border));
  background:hsl(var(--background));
  color:hsl(var(--foreground));
  padding:0 14px;
  outline:none;
  font-size:14px;
  transition:.15s ease;
}

.ce-input:focus,
.ce-select:focus{
  border-color:#6366f1;
  box-shadow:0 0 0 3px rgba(99,102,241,.15);
}

.ce-select{
  appearance:none;
  cursor:pointer;
}

.ce-subj-wrap{
  position:relative;
  width:100%;
}

.ce-subj-trigger{
  width:100%;
  min-height:50px;
  border:1px solid hsl(var(--border));
  border-radius:12px;
  background:hsl(var(--background));
  color:hsl(var(--foreground));
  padding:0 14px;
  display:flex;
  align-items:center;
  cursor:pointer;
  font-size:14px;
}

.ce-subj-dropdown{
  position:absolute;
  top:58px;
  left:0;

  width:100%;

  max-height:240px;

  overflow-y:auto;

  background:var(--card);

  border:1px solid hsl(var(--border));

  border-radius:14px;

  box-shadow:
    0 12px 40px rgba(0,0,0,.45);

  z-index:9999;

  padding:6px;

  scrollbar-width:none;
}

.ce-subj-dropdown::-webkit-scrollbar{
  display:none;
}
  .ce-subj-dropdown label{
  margin:0;
}

.ce-subj-item{
  width:100%;
  display:flex;
  align-items:center;
  gap:10px;
  padding:12px 14px;
  font-size:14px;
  cursor:pointer;
  border-radius:10px;
}

.ce-subj-item:hover{
  background:rgba(99,102,241,.08);
}

.ce-subj-item input{
  width:15px;
  height:15px;
  accent-color:#6366f1;
}

.ce-chips{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  margin-top:10px;
}

.ce-chip{
  display:flex;
  align-items:center;
  gap:6px;
  padding:6px 10px;
  border-radius:999px;
  background:rgba(99,102,241,.12);
  color:#6366f1;
  font-size:12px;
  font-weight:600;
}

.ce-chip button{
  border:none;
  background:none;
  color:inherit;
  cursor:pointer;
}

.ce-btn{
  width:100%;
  height:54px;
  border:none;
  border-radius:14px;
  background:#6366f1;
  color:#ffffff;
  font-size:15px;
  font-weight:700;
  cursor:pointer;
  transition:.2s;
}

.ce-btn:hover{
  background:#4f46e5;
}

.ce-btn:disabled{
  opacity:.6;
  cursor:not-allowed;
}

.ce-toast{
  position:fixed;
  right:24px;
  bottom:24px;
  padding:14px 18px;
  border-radius:14px;
  color:#ffffff;
  font-size:14px;
  font-weight:600;
  z-index:9999;
}

.ce-toast.success{
  background:#16a34a;
}

.ce-toast.error{
  background:#dc2626;
}

@media(max-width:768px){

  .ce-row{
    display:grid;
    grid-template-columns:minmax(0,1fr) minmax(0,1fr);
    gap:18px;
    align-items:start;
  }

  .ce-card{
    padding:22px;
    overflow:visible;
  }

}
`;

export default function CreateExamPage() {

  const [examName, setExamName] =
    useState("");

  const [sem, setSem] =
    useState("");

  const [branch, setBranch] =
    useState("");

  const [section, setSection] =
    useState("");

  const [subjects, setSubjects] =
    useState<string[]>([]);

  const [startTime, setStartTime] =
    useState("");

  const [duration, setDuration] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showSubjects, setShowSubjects] =
    useState(false);

  const [semList, setSemList] =
    useState<any[]>([]);

  const [branchList, setBranchList] =
    useState<any[]>([]);

  const [subjectList, setSubjectList] =
    useState<any[]>([]);

  const [user, setUser] =
    useState<any>(null);

  const [toast, setToast] =
    useState<{
      show: boolean;
      msg: string;
      type: string;
    }>({
      show: false,
      msg: "",
      type: "success",
    });

  useEffect(() => {

    const stored =
      localStorage.getItem(
        "admin"
      );

    if (stored) {

      setUser(
        JSON.parse(stored)
      );

    }

  }, []);

  useEffect(() => {

    const handleClickOutside = (
      e: MouseEvent
    ) => {

      const target =
        e.target as HTMLElement;

      if (
        !target.closest(
          ".ce-subject-field"
        )
      ) {

        setShowSubjects(false);

      }

    };

    document.addEventListener(
      "click",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "click",
        handleClickOutside
      );

  }, []);

  useEffect(() => {

    fetchData();

  }, []);

  const fetchData =
    async () => {

      const {
        data: semData,
      } = await supabase
        .from("semesters")
        .select("*");

      const {
        data: branchData,
      } = await supabase
        .from("branches")
        .select("*");

      const {
        data: subjectData,
      } = await supabase
        .from("subjects")
        .select("*");

      setSemList(
        semData || []
      );

      setBranchList(
        branchData || []
      );

      setSubjectList(
        subjectData || []
      );

    };

  const showToast = (
    msg: string,
    type: string
  ) => {

    setToast({
      show: true,
      msg,
      type,
    });

    setTimeout(() => {

      setToast((prev) => ({
        ...prev,
        show: false,
      }));

    }, 3000);

  };

  const removeSubject = (
    id: string,
    e: React.MouseEvent
  ) => {

    e.stopPropagation();

    setSubjects(
      subjects.filter(
        (s) => s !== id
      )
    );

  };

  const handleCreate =
    async () => {

      if (
        !examName ||
        !sem ||
        !branch ||
        !section ||
        !subjects.length ||
        !startTime ||
        !duration
      ) {

        showToast(
          "Please fill all fields",
          "error"
        );

        return;

      }

      setLoading(true);

      try {

        const endTime =
          new Date(
            new Date(
              startTime
            ).getTime() +
            parseInt(
              duration
            ) *
            60000
          ).toISOString();

        const {
          data: students,
        } = await supabase
          .from("student")
          .select("st_id")
          .eq(
            "sem_id",
            parseInt(sem)
          )
          .eq(
            "branch_id",
            parseInt(branch)
          )
          .eq(
            "section",
            section
          );

        if (
          !students?.length
        ) {

          showToast(
            "No students found",
            "error"
          );

          setLoading(false);

          return;

        }


        /* -------------------------------- */
        /* REUSE ACTIVE KEYS */
        /* OR GENERATE NEW */
        /* -------------------------------- */

        const generateKey =
          () =>
            Math.random()
              .toString(36)
              .substring(2, 8)
              .toUpperCase();

        const studentKeys:
          Record<
            string,
            string
          > = {};

        const currentTime =
          new Date()
            .toISOString();

        /* CHECK ACTIVE KEY */

        for (
          const s of students
        ) {

          const {
            data: existingKey,
          } = await supabase
            .from(
              "exam_keys"
            )
            .select(`
      exam_key,
      conduct_exam!inner(
        end_time
      )
    `)
            .eq(
              "st_id",
              s.st_id
            )
            .gte(
              "conduct_exam.end_time",
              currentTime
            )
            .limit(1)
            .single();

          if (
            existingKey
              ?.exam_key
          ) {

            /* REUSE OLD ACTIVE KEY */

            studentKeys[
              s.st_id
            ] =
              existingKey.exam_key;

          }

          else {

            /* GENERATE NEW KEY */

            studentKeys[
              s.st_id
            ] = generateKey();

          }

        }

        /* -------------------------------- */
        /* CREATE SUBJECT EXAMS */
        /* -------------------------------- */

        for (
          let sub of subjects
        ) {

          /* ONE ROW PER SUBJECT */

          const {
            data: examData,
            error:
            examError,
          } = await supabase
            .from(
              "conduct_exam"
            )
            .insert([
              {
                exam_name:
                  examName,

                sem_id:
                  parseInt(
                    sem
                  ),

                branch_id:
                  parseInt(
                    branch
                  ),

                section,

                subject_id:
                  parseInt(
                    sub
                  ),

                start_time:
                  new Date(
                    startTime
                  ).toISOString(),

                end_time:
                  endTime,

                duration_minutes:
                  parseInt(
                    duration
                  ),

                ad_id:
                  user?.ad_id ||
                  null,
              },
            ])
            .select()
            .single();

          if (
            examError
          ) {

            showToast(
              examError.message,
              "error"
            );

            setLoading(
              false
            );

            return;

          }

          /* -------------------------------- */
          /* ONE KEY ROW PER SUBJECT */
          /* -------------------------------- */

          const keyRows =
            students.map(
              (
                s: any
              ) => ({

                exam_id:
                  examData.exam_id,

                st_id:
                  s.st_id,

                /* SAME ACTIVE KEY */

                exam_key:
                  studentKeys[
                  s.st_id
                  ],

                is_used:
                  false,

              })
            );

          const {
            error:
            keyError,
          } = await supabase
            .from(
              "exam_keys"
            )
            .insert(
              keyRows
            );

          if (
            keyError
          ) {

            showToast(
              keyError.message,
              "error"
            );

            setLoading(
              false
            );

            return;

          }

        }

        /* -------------------------------- */
        /* DELETE EXPIRED KEYS */
        /* -------------------------------- */

        const now =
          new Date()
            .toISOString();

        const {
          data: expiredExams,
        } = await supabase
          .from(
            "conduct_exam"
          )
          .select(
            "exam_id"
          )
          .lt(
            "end_time",
            now
          );

        if (
          expiredExams &&
          expiredExams.length >
          0
        ) {

          const expiredIds =
            expiredExams.map(
              (
                e: any
              ) => e.exam_id
            );

          await supabase
            .from(
              "exam_keys"
            )
            .delete()
            .in(
              "exam_id",
              expiredIds
            );

        }

        /* -------------------------------- */
        /* SUCCESS */
        /* -------------------------------- */

        showToast(
          "Exam created successfully",
          "success"
        );

        setExamName("");
        setSem("");
        setBranch("");
        setSection("");
        setSubjects([]);
        setStartTime("");
        setDuration("");

        setLoading(
          false
        );

      }

      catch {

        showToast(
          "Something went wrong",
          "error"
        );

        setLoading(
          false
        );

      }

    };

  const selectedSubjectNames =
    subjectList.filter(
      (s: any) =>
        subjects.includes(
          String(
            s.id
          )
        )
    );

  return (

    <>
      <style>{styles}</style>

      <div className="
        create-page
        space-y-8
      ">


        {/* CARD */}

        <div className="ce-card">

          <div className="
            ce-card-label
          ">

            EXAM DETAILS

          </div>

          {/* EXAM */}

          <div className="
            ce-field
          ">

            <label>

              <span className="
                ce-dot
              " />

              Exam Name

              <span className="
                ce-required
              ">

                *

              </span>

            </label>

            <select
              className="
                ce-select
              "
              value={
                examName
              }
              onChange={(
                e: any
              ) =>
                setExamName(
                  e.target
                    .value
                )
              }
            >

              <option value="">
                Select Exam
              </option>

              <option value="DT 1">
                DT 1
              </option>

              <option value="DT 2">
                DT 2
              </option>

            </select>

          </div>

          {/* ROW */}

          <div className="
            ce-row
          ">

            {/* SEM */}

            <div className="
              ce-field
            ">

              <label>

                <span className="
                  ce-dot
                " />

                Semester

                <span className="
                  ce-required
                ">

                  *

                </span>

              </label>

              <select
                className="
                  ce-select
                "
                value={sem}
                onChange={(
                  e: any
                ) => {

                  setSem(
                    e.target
                      .value
                  );

                  setBranch("");

                  setSubjects([]);

                }}
              >

                <option value="">
                  Select Semester
                </option>

                {semList.map(
                  (
                    s: any,
                    index: number
                  ) => (

                    <option
                      key={`${s.id}-${index}`}
                      value={s.id}
                    >

                      {
                        s.label
                      }

                    </option>

                  )
                )}

              </select>

            </div>

            {/* BRANCH */}

            <div className="
              ce-field
            ">

              <label>

                <span className="
                  ce-dot
                " />

                Branch

                <span className="
                  ce-required
                ">

                  *

                </span>

              </label>

              <select
                className="
                  ce-select
                "
                value={
                  branch
                }
                disabled={
                  !sem
                }
                onChange={(
                  e: any
                ) => {

                  setBranch(
                    e.target
                      .value
                  );

                  setSubjects([]);

                }}
              >

                <option value="">
                  Select Branch
                </option>

                {branchList
                  .filter(
                    (
                      b: any
                    ) =>
                      b.semester_id ===
                      parseInt(
                        sem
                      )
                  )
                  .map(
                    (
                      b: any,
                      index: number
                    ) => (

                      <option
                        key={`${b.id}-${index}`}
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

            </div>

          </div>

          {/* SUBJECT */}

          <div className="
            ce-row
          ">

            <div className="
              ce-field
              ce-subject-field
            ">

              <label>

                <span className="
                  ce-dot
                " />

                Subjects

                <span className="
                  ce-required
                ">

                  *

                </span>

              </label>

              <div className="
                ce-subj-wrap
              ">

                <div
                  className="
                    ce-subj-trigger
                  "
                  onClick={() =>
                    branch &&
                    setShowSubjects(
                      !showSubjects
                    )
                  }
                >

                  {subjects.length
                    ? `${subjects.length} selected`
                    : "Select Subjects"}

                </div>

                {showSubjects && (

                  <div className="
                    ce-subj-dropdown
                  ">

                    {subjectList
                      .filter(
                        (
                          s: any
                        ) =>

                          s.branch_id ===
                          parseInt(
                            branch
                          ) &&

                          s.sem_id ===
                          parseInt(
                            sem
                          )
                      )
                      .map(
                        (
                          s: any,
                          index: number
                        ) => (

                          <label
                            key={`${s.id}-${index}`}
                            className="
                              ce-subj-item
                            "
                          >

                            <input
                              type="checkbox"
                              checked={subjects.includes(
                                String(
                                  s.id
                                )
                              )}
                              onChange={(
                                e: any
                              ) => {

                                const id =
                                  String(
                                    s.id
                                  );

                                if (
                                  e
                                    .target
                                    .checked
                                ) {

                                  setSubjects(
                                    [
                                      ...subjects,
                                      id,
                                    ]
                                  );

                                }

                                else {

                                  setSubjects(
                                    subjects.filter(
                                      (
                                        sub
                                      ) =>
                                        sub !==
                                        id
                                    )
                                  );

                                }

                              }}
                            />

                            {
                              s.label
                            }

                          </label>

                        )
                      )}

                  </div>

                )}

              </div>

              {selectedSubjectNames.length >
                0 && (

                  <div className="
                  ce-chips
                ">

                    {selectedSubjectNames.map(
                      (
                        s: any,
                        index: number
                      ) => (

                        <div
                          key={`${s.id}-${index}`}
                          className="
                          ce-chip
                        "
                        >

                          {
                            s.label
                          }

                          <button
                            onClick={(
                              e: any
                            ) =>
                              removeSubject(
                                String(
                                  s.id
                                ),
                                e
                              )
                            }
                          >

                            ✕

                          </button>

                        </div>

                      )
                    )}

                  </div>

                )}

            </div>

            {/* SECTION */}

            <div className="
              ce-field
            ">

              <label>

                <span className="
                  ce-dot
                " />

                Section

                <span className="
                  ce-required
                ">

                  *

                </span>

              </label>

              <input
                className="
                  ce-input
                "
                placeholder="A"
                value={
                  section
                }
                onChange={(
                  e: any
                ) =>
                  setSection(
                    e.target
                      .value
                  )
                }
              />

            </div>

          </div>

          {/* ROW */}

          <div className="
            ce-row
          ">

            {/* TIME */}

            <div className="
              ce-field
            ">

              <label>

                <span className="
                  ce-dot
                " />

                Start Time

                <span className="
                  ce-required
                ">

                  *

                </span>

              </label>

              <input
                className="
                  ce-input
                "
                type="datetime-local"
                value={
                  startTime
                }
                onChange={(
                  e: any
                ) =>
                  setStartTime(
                    e.target
                      .value
                  )
                }
              />

            </div>
            {/* DURATION */}

            <div className="
              ce-field
            ">

              <label>

                <span className="
                  ce-dot
                " />

                End Time

                <span className="
                  ce-required
                ">

                  *

                </span>

              </label>

              <input
                className="
                  ce-input
                "
                type="number"
                placeholder="60"
                value={
                  duration
                }
                onChange={(
                  e: any
                ) =>
                  setDuration(
                    e.target
                      .value
                  )
                }
              />

            </div>

          </div>

          {/* BUTTON */}

          <button
            className="
              ce-btn
            "
            onClick={
              handleCreate
            }
            disabled={
              loading
            }
          >

            {loading
              ? "Creating..."
              : "Create Exam →"}

          </button>

        </div>

      </div>

      {toast.show && (

        <div
          className={`
            ce-toast
            ${toast.type}
          `}
        >

          {toast.msg}

        </div>

      )}

    </>

  );

}