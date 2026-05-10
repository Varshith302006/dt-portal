"use client";

import React, {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
  useParams,
} from "next/navigation";

import { supabase } from "@/lib/supabase";

const formatTime = (
  iso: string
) => {

  if (!iso) return "—";

  return new Date(
    iso
  ).toLocaleString(
    "en-IN",
    {
      timeZone:
        "Asia/Kolkata",

      day: "2-digit",

      month: "short",

      year: "numeric",

      hour: "2-digit",

      minute:
        "2-digit",

      hour12: true,
    }
  );

};

const getStatus = (
  start_time: string,
  end_time: string
) => {

  if (
    !start_time ||
    !end_time
  ) {

    return "upcoming";

  }

  const now =
    new Date();

  const start =
    new Date(
      start_time
    );

  const end =
    new Date(
      end_time
    );

  if (
    now >= start &&
    now <= end
  ) {

    return "inprogress";

  }

  if (now > end) {

    return "completed";

  }

  return "upcoming";

};

export default function ExamKeysDetailPage() {

  const router =
    useRouter();

  const params =
    useParams();

  const semId =
    params?.id;

  const [dark, setDark] =
    useState(false);

  const [exam, setExam] =
    useState<any>(null);

  const [keys, setKeys] =
    useState<any[]>([]);

  const [
    filtered,
    setFiltered,
  ] = useState<any[]>([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  /* -------------------------- */
  /* THEME */
  /* -------------------------- */

  useEffect(() => {

    const saved =
      localStorage.getItem(
        "ce-theme"
      );

    if (
      saved === "dark"
    ) {

      setDark(true);

      document.documentElement.classList.add(
        "dark"
      );

    }

  }, []);

  const toggleTheme =
    () => {

      setDark((prev) => {

        const next =
          !prev;

        localStorage.setItem(
          "ce-theme",
          next
            ? "dark"
            : "light"
        );

        if (next) {

          document.documentElement.classList.add(
            "dark"
          );

        }

        else {

          document.documentElement.classList.remove(
            "dark"
          );

        }

        return next;

      });

    };

  /* -------------------------- */
  /* FETCH DATA */
  /* -------------------------- */

  useEffect(() => {

    if (!semId) {

      setError(
        "Invalid semester ID"
      );

      setLoading(false);

      return;

    }

    fetchData();

  }, [semId]);

  const fetchData =
    async () => {

      setLoading(true);

      try {

        /* ---------------------- */
        /* FETCH EXAM */
        /* ---------------------- */

        const {
          data: examsData,
          error:
            examErr,
        } = await supabase
          .from(
            "conduct_exam"
          )
          .select("*")
          .eq(
            "sem_id",
            Number(semId)
          )
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

        if (
          examErr
        ) {

          setError(
            examErr.message
          );

          return;

        }

        if (
          !examsData ||
          examsData.length ===
            0
        ) {

          setError(
            "No exams found"
          );

          return;

        }

        const latestExam =
          examsData[0];

        /* ---------------------- */
        /* FETCH KEYS */
        /* ---------------------- */

        const {
          data: keysData,
          error:
            keysErr,
        } = await supabase
          .from(
            "exam_keys"
          )
          .select("*")
          .eq(
            "exam_id",
            latestExam.exam_id
          );

        if (
          keysErr
        ) {

          setError(
            keysErr.message
          );

          return;

        }

        if (
          !keysData ||
          keysData.length ===
            0
        ) {

          setExam(
            latestExam
          );

          setKeys([]);

          setFiltered(
            []
          );

          return;

        }

        /* ---------------------- */
        /* FETCH STUDENTS */
        /* ---------------------- */

        const stIds = [
          ...new Set(
            keysData
              .map(
                (
                  k: any
                ) =>
                  k.st_id
              )
              .filter(
                Boolean
              )
          ),
        ];

        let studentMap:
          any = {};

        if (
          stIds.length >
          0
        ) {

          const {
            data:
              studentsData,
          } =
            await supabase
              .from(
                "student"
              )
              .select(
                "*"
              )
              .in(
                "st_id",
                stIds
              );

          (
            studentsData ||
            []
          ).forEach(
            (
              s: any
            ) => {

              studentMap[
                s.st_id
              ] = s;

            }
          );

        }

        /* ---------------------- */
        /* MERGE */
        /* ---------------------- */

        const merged =
          keysData.map(
            (
              k: any
            ) => ({

              ...k,

              student:
                studentMap[
                  k.st_id
                ] || null,

            })
          );

        setExam(
          latestExam
        );

        setKeys(merged);

        setFiltered(
          merged
        );

      }

      catch (err: any) {

        setError(
          err.message
        );

      }

      finally {

        setLoading(
          false
        );

      }

    };

  /* -------------------------- */
  /* SEARCH */
  /* -------------------------- */

  useEffect(() => {

    const term =
      search
        .trim()
        .toLowerCase();

    if (!term) {

      setFiltered(
        keys
      );

      return;

    }

    setFiltered(

      keys.filter(
        (
          k: any
        ) =>

          k.student?.st_name
            ?.toLowerCase()
            .includes(
              term
            ) ||

          k.st_id
            ?.toLowerCase()
            .includes(
              term
            ) ||

          k.exam_key
            ?.toLowerCase()
            .includes(
              term
            )
      )
    );

  }, [search, keys]);

  /* -------------------------- */
  /* LOGOUT */
  /* -------------------------- */

  const handleLogout =
    () => {

      localStorage.clear();

      router.push("/");

    };

  /* -------------------------- */
  /* TOGGLE STATUS */
  /* -------------------------- */

  const toggleKeyStatus =
    async (
      exam_key: string,
      currentStatus: boolean
    ) => {

      const {
        error,
      } = await supabase
        .from(
          "exam_keys"
        )
        .update({
          is_used:
            !currentStatus,
        })
        .eq(
          "exam_key",
          exam_key
        );

      if (error) {

        alert(
          "Failed to update"
        );

        return;

      }

      const updated =
        keys.map(
          (
            k: any
          ) =>

            k.exam_key ===
            exam_key

              ? {
                  ...k,
                  is_used:
                    !currentStatus,
                }

              : k
        );

      setKeys(updated);

      setFiltered(
        updated
      );

    };

  const status =
    exam
      ? getStatus(
          exam.start_time,
          exam.end_time
        )
      : null;

  /* -------------------------- */
  /* UI */
  /* -------------------------- */

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
            w-11
            h-11
            rounded-2xl
            bg-indigo-500
            text-white
            flex
            items-center
            justify-center
            font-bold
          ">

            DT

          </div>

          <div>

            <h1 className="
              text-xl
              font-bold
            ">

              Exam Keys Detail

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

          <button
            onClick={
              toggleTheme
            }
            className="
              h-11
              w-11
              rounded-xl
              border
              border-border
              hover:border-indigo-500
              transition-all
              cursor-pointer
            "
          >

            {
              dark
                ? "☀"
                : "☾"
            }

          </button>

          <button
            onClick={() =>
              router.push(
                "/admin/dashboard/exam-keys"
              )
            }
            className="
              h-11
              px-5
              rounded-xl
              border
              border-border
              hover:border-indigo-500
              transition-all
              text-sm
              font-semibold
              cursor-pointer
            "
          >

            Back

          </button>

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

      {/* MAIN */}

      <div className="
        max-w-7xl
        mx-auto
        px-8
        py-10
      ">

        {loading && (

          <div className="
            h-64
            flex
            items-center
            justify-center
            text-indigo-500
            font-semibold
          ">

            Loading...

          </div>

        )}

        {error &&
          !loading && (

            <div className="
              rounded-3xl
              border
              border-border
              bg-card
              p-10
              text-center
            ">

              ⚠ {error}

            </div>

          )}

        {!loading &&
          !error &&
          exam && (

            <>

              {/* HEADER */}

              <div className="
                mb-8
              ">

                <div className="
                  text-xs
                  uppercase
                  tracking-[0.2em]
                  text-muted-foreground
                  font-semibold
                  mb-4
                ">

                  Admin · Exam Keys

                </div>

                <h2 className="
                  text-5xl
                  font-bold
                  tracking-tight
                ">

                  {
                    exam.exam_name
                  }

                </h2>

                <p className="
                  mt-3
                  text-muted-foreground
                ">

                  Student keys
                  for this exam.

                </p>

              </div>

              {/* INFO */}

              <div className="
                flex
                flex-wrap
                gap-4
                mb-8
              ">

                <div className="
                  rounded-xl
                  border
                  border-border
                  bg-card
                  px-5
                  py-4
                ">

                  <div className="
                    text-xs
                    uppercase
                    text-muted-foreground
                    mb-2
                  ">

                    Start

                  </div>

                  <div className="
                    font-semibold
                  ">

                    {
                      formatTime(
                        exam.start_time
                      )
                    }

                  </div>

                </div>

                <div className="
                  rounded-xl
                  border
                  border-border
                  bg-card
                  px-5
                  py-4
                ">

                  <div className="
                    text-xs
                    uppercase
                    text-muted-foreground
                    mb-2
                  ">

                    End

                  </div>

                  <div className="
                    font-semibold
                  ">

                    {
                      formatTime(
                        exam.end_time
                      )
                    }

                  </div>

                </div>

                <div className="
                  rounded-xl
                  border
                  border-border
                  bg-card
                  px-5
                  py-4
                ">

                  <div className="
                    text-xs
                    uppercase
                    text-muted-foreground
                    mb-2
                  ">

                    Status

                  </div>

                  <div className="
                    font-semibold
                    text-indigo-500
                  ">

                    {status}

                  </div>

                </div>

              </div>

              {/* TABLE CARD */}

              <div className="
                rounded-3xl
                border
                border-border
                bg-card
                p-6
              ">

                {/* TOP */}

                <div className="
                  flex
                  items-center
                  justify-between
                  mb-6
                ">

                  <div>

                    <h3 className="
                      text-lg
                      font-semibold
                    ">

                      Student Keys

                    </h3>

                    <p className="
                      text-sm
                      text-muted-foreground
                      mt-1
                    ">

                      {
                        keys.length
                      }
                      {" "}
                      total keys

                    </p>

                  </div>

                  <input
                    type="text"
                    placeholder="Search..."
                    value={
                      search
                    }
                    onChange={(
                      e
                    ) =>
                      setSearch(
                        e.target
                          .value
                      )
                    }
                    className="
                      h-11
                      w-72
                      rounded-xl
                      border
                      border-border
                      bg-background
                      px-4
                      text-sm
                      outline-none
                      focus:border-indigo-500
                    "
                  />

                </div>

                {/* EMPTY */}

                {keys.length ===
                0 ? (

                  <div className="
                    text-center
                    py-20
                    text-muted-foreground
                  ">

                    No exam keys
                    found.

                  </div>

                ) : (

                  <div className="
                    overflow-x-auto
                  ">

                    <table className="
                      w-full
                      text-sm
                    ">

                      <thead>

                        <tr className="
                          border-b
                          border-border
                        ">

                          <th className="
                            text-left
                            py-4
                            px-4
                          ">

                            #

                          </th>

                          <th className="
                            text-left
                            py-4
                            px-4
                          ">

                            Roll No

                          </th>

                          <th className="
                            text-left
                            py-4
                            px-4
                          ">

                            Student

                          </th>

                          <th className="
                            text-left
                            py-4
                            px-4
                          ">

                            Exam Key

                          </th>

                          <th className="
                            text-left
                            py-4
                            px-4
                          ">

                            Status

                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {filtered.map(
                          (
                            k: any,
                            idx: number
                          ) => (

                            <tr
                              key={
                                idx
                              }
                              className="
                                border-b
                                border-border/50
                              "
                            >

                              <td className="
                                py-4
                                px-4
                              ">

                                {
                                  idx + 1
                                }

                              </td>

                              <td className="
                                py-4
                                px-4
                              ">

                                <span className="
                                  rounded-lg
                                  bg-indigo-500/10
                                  text-indigo-500
                                  px-3
                                  py-1
                                  font-semibold
                                ">

                                  {
                                    k.st_id
                                  }

                                </span>

                              </td>

                              <td className="
                                py-4
                                px-4
                                font-medium
                              ">

                                {
                                  k.student
                                    ?.st_name ||
                                  "—"
                                }

                              </td>

                              <td className="
                                py-4
                                px-4
                              ">

                                <span className="
                                  rounded-lg
                                  bg-violet-500/10
                                  text-violet-500
                                  px-3
                                  py-1
                                  font-bold
                                  tracking-widest
                                ">

                                  {
                                    k.exam_key
                                  }

                                </span>

                              </td>

                              <td className="
                                py-4
                                px-4
                              ">

                                <button
                                  onClick={() => {

                                    if (
                                      k.is_used
                                    ) {

                                      toggleKeyStatus(
                                        k.exam_key,
                                        k.is_used
                                      );

                                    }

                                    else {

                                      alert(
                                        "Only system can mark key as used"
                                      );

                                    }

                                  }}
                                  className={`
                                    px-4
                                    py-2
                                    rounded-lg
                                    text-xs
                                    font-semibold
                                    cursor-pointer

                                    ${
                                      k.is_used

                                        ? "bg-red-500/10 text-red-500"

                                        : "bg-green-500/10 text-green-500"
                                    }
                                  `}
                                >

                                  {
                                    k.is_used
                                      ? "Used"
                                      : "Unused"
                                  }

                                </button>

                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

            </>

          )}

      </div>

    </div>

  );

}