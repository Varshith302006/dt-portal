"use client";

import React, {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

export default function LoginLogsPage() {

  const [
    logs,
    setLogs,
  ] = useState<any[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  useEffect(() => {

    fetchLogs();

  }, []);

  const fetchLogs =
    async (
      query = ""
    ) => {

      setLoading(
        true
      );

      let q =
        supabase
          .from(
            "login_logs"
          )
          .select("*")
          .order(
            "login_time",
            {
              ascending:
                false,
            }
          );

      if (
        query.trim()
      ) {

        q = q.or(
          `st_id.ilike.%${query}%,
           st_name.ilike.%${query}%,
           semester.ilike.%${query}%,
           branch.ilike.%${query}%`
        );

      }

      const {
        data,
      } =
        await q;

      setLogs(
        data || []
      );

      setLoading(
        false
      );

    };

  const formatTime =
    (
      date: string
    ) => {

      return new Date(
        date
      ).toLocaleString(
        "en-IN",
        {
          dateStyle:
            "medium",

          timeStyle:
            "short",
        }
      );

    };

  return (

    <div className="
      space-y-8
    ">


      {/* SEARCH */}

      <div className="
        rounded-3xl
        border
        border-border
        bg-card
        p-6
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
            placeholder="
              Search by roll number,
              name, semester or branch...
            "
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
              fetchLogs(
                search
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
          border-b
          border-border
          px-6
          py-5
        ">

          <h2 className="
            text-lg
            font-semibold
          ">

            Login Activity

          </h2>

          <p className="
            text-sm
            text-muted-foreground
            mt-1
          ">

            {
              logs.length
            }
            {" "}
            total logins

          </p>

        </div>

        {loading ? (

          <div className="
            py-20
            text-center
            text-indigo-500
            font-semibold
          ">

            Loading logs...

          </div>

        ) : logs.length ===
          0 ? (

          <div className="
            py-20
            text-center
            text-muted-foreground
          ">

            No login logs found

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
                    "Student Name",
                    "Semester",
                    "Branch",
                    "Device",
                    "Login Time",
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

                {logs.map(
                  (
                    log: any,
                    idx: number
                  ) => (

                    <tr
                      key={
                        log.id
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
                            log.st_id
                          }

                        </span>

                      </td>

                      <td className="
                        px-5
                        py-4
                        font-medium
                      ">

                        {
                          log.st_name
                        }

                      </td>

                      <td className="
                        px-5
                        py-4
                      ">

                        {
                          log.semester
                        }

                      </td>

                      <td className="
                        px-5
                        py-4
                      ">

                        {
                          log.branch
                        }

                      </td>

                      <td className="
                        px-5
                        py-4
                      ">

                        <span className="
                          rounded-lg
                          bg-green-500/10
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          text-green-500
                        ">

                          {
                            log.device
                          }

                        </span>

                      </td>

                      <td className="
                        px-5
                        py-4
                      ">

                        {
                          formatTime(
                            log.login_time
                          )
                        }

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>

  );

}