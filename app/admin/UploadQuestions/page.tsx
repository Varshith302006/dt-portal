"use client";

import React, {
  useEffect,
  useState,
} from "react";

import * as XLSX from "xlsx";

import { supabase } from "@/lib/supabase";

const CHUNK = 50;

async function insertChunked(
  table: string,
  rows: any[]
) {

  for (
    let i = 0;
    i < rows.length;
    i += CHUNK
  ) {

    const { error } =
      await supabase
        .from(table)
        .insert(
          rows.slice(
            i,
            i + CHUNK
          )
        );

    if (error) {

      throw new Error(
        error.message
      );

    }

  }

}

function dedupeByKey(
  arr: any[],
  key: string
) {

  const seen =
    new Set();

  return arr.filter(
    (r: any) => {

      const k =
        (
          r[key] || ""
        )
          .trim()
          .toLowerCase();

      if (
        seen.has(k)
      ) {

        return false;

      }

      seen.add(k);

      return true;

    }
  );

}

export default function UploadQuestionsPage() {

  const [tab, setTab] =
    useState("upload");

  const [semesters, setSemesters] =
    useState<any[]>([]);

  const [branches, setBranches] =
    useState<any[]>([]);

  const [subjects, setSubjects] =
    useState<any[]>([]);

  const [modules, setModules] =
    useState<any[]>([]);

  const [selSem, setSelSem] =
    useState("");

  const [selBr, setSelBr] =
    useState("");

  const [selSub, setSelSub] =
    useState("");

  const [selMod, setSelMod] =
    useState("");

  const [input, setInput] =
    useState("");

  const [file, setFile] =
    useState<File | null>(
      null
    );

  const [status, setStatus] =
    useState<any>(null);

  const [
    conflictMode,
    setConflictMode,
  ] = useState(false);

  const [
    existingCount,
    setExistingCount,
  ] = useState(0);

  const [
    uploadStats,
    setUploadStats,
  ] = useState<any>(null);

  const [
    parsedRows,
    setParsedRows,
  ] = useState<any[] | null>(
    null
  );

  useEffect(() => {

    loadSemesters();

  }, []);

  const loadSemesters =
    async () => {

      const {
        data,
      } = await supabase
        .from(
          "semesters"
        )
        .select("*")
        .order("label");

      setSemesters(
        data || []
      );

    };

  const loadBranches =
    async (
      sid: string
    ) => {

      const {
        data,
      } = await supabase
        .from(
          "branches"
        )
        .select("*")
        .eq(
          "semester_id",
          sid
        )
        .order("label");

      setBranches(
        data || []
      );

      setSubjects([]);

      setModules([]);

    };

  const loadSubjects =
    async (
      bid: string
    ) => {

      const {
        data,
      } = await supabase
        .from(
          "subjects"
        )
        .select("*")
        .eq(
          "branch_id",
          bid
        )
        .order("label");

      setSubjects(
        data || []
      );

      setModules([]);

    };

  const loadModules =
    async (
      sid: string
    ) => {

      const {
        data,
      } = await supabase
        .from(
          "modules"
        )
        .select("*")
        .eq(
          "subject_id",
          sid
        )
        .order("label");

      setModules(
        data || []
      );

    };

  const resetUploadState =
    () => {

      setStatus(null);

      setConflictMode(
        false
      );

      setExistingCount(0);

      setUploadStats(
        null
      );

      setParsedRows(
        null
      );

    };

  const onSem = (
    v: string
  ) => {

    setSelSem(v);

    setSelBr("");

    setSelSub("");

    setSelMod("");

    resetUploadState();

    if (v) {

      loadBranches(v);

    }

    else {

      setBranches([]);

      setSubjects([]);

      setModules([]);

    }

  };

  const onBr = (
    v: string
  ) => {

    setSelBr(v);

    setSelSub("");

    setSelMod("");

    resetUploadState();

    if (v) {

      loadSubjects(v);

    }

    else {

      setSubjects([]);

      setModules([]);

    }

  };

  const onSub = (
    v: string
  ) => {

    setSelSub(v);

    setSelMod("");

    resetUploadState();

    if (v) {

      loadModules(v);

    }

    else {

      setModules([]);

    }

  };

  const onMod = (
    v: string
  ) => {

    setSelMod(v);

    resetUploadState();

  };

  const parseExcel = (
    f: File
  ) =>
    new Promise<any[]>(
      (
        resolve,
        reject
      ) => {

        const reader =
          new FileReader();

        reader.onload = (
          e: any
        ) => {

          try {

            const wb =
              XLSX.read(
                new Uint8Array(
                  e.target
                    .result
                ),
                {
                  type:
                    "array",
                }
              );

            const raw =
              XLSX.utils.sheet_to_json(
                wb.Sheets[
                  wb
                    .SheetNames[0]
                ]
              );

            if (
              !raw.length
            ) {

              return reject(
                new Error(
                  "File is empty"
                )
              );

            }

            const rows =
              raw
                .filter(
                  (
                    r: any
                  ) =>
                    r.Question
                )
                .map(
                  (
                    r: any
                  ) => ({

                    sem_id:
                      selSem,

                    branch_id:
                      selBr,

                    subject_id:
                      selSub,

                    module_id:
                      selMod,

                    question:
                      String(
                        r.Question
                      ).trim(),

                    answer:
                      r.Answer !=
                      null
                        ? String(
                            r.Answer
                          ).trim()
                        : "",

                  })
                );

            resolve(
              dedupeByKey(
                rows,
                "question"
              )
            );

          }

          catch (
            err
          ) {

            reject(err);

          }

        };

        reader.readAsArrayBuffer(
          f
        );

      }
    );

  const doInsert =
    async (
      rows: any[],
      mode:
        | "fresh"
        | "append"
        | "replace",
      totalFromFile?: number
    ) => {

      const total =
        totalFromFile ??
        rows.length;

      setStatus({
        type: "ld",
        msg: "Uploading questions...",
      });

      try {

        await insertChunked(
          "dt_questions",
          rows
        );

        const skipped =
          mode ===
          "append"
            ? total -
              rows.length
            : 0;

        setUploadStats({
          inserted:
            rows.length,

          skipped,

          total,
        });

        setStatus({
          type: "ok",
          msg: "Questions uploaded successfully",
        });

        setFile(null);

        setParsedRows(
          null
        );

      }

      catch (
        err: any
      ) {

        setStatus({
          type: "err",
          msg: err.message,
        });

      }

    };

  const handleUploadInit =
    async () => {

      if (
        !file ||
        !selSem ||
        !selBr ||
        !selSub ||
        !selMod
      ) {

        return setStatus({
          type: "err",
          msg: "Select all fields and choose file",
        });

      }

      setStatus({
        type: "ld",
        msg: "Parsing file...",
      });

      let rows;

      try {

        rows =
          await parseExcel(
            file
          );

      }

      catch (
        err: any
      ) {

        return setStatus({
          type: "err",
          msg: err.message,
        });

      }

      const {
        data:
          existing,
      } = await supabase
        .from(
          "dt_questions"
        )
        .select("id")
        .eq(
          "sem_id",
          selSem
        )
        .eq(
          "branch_id",
          selBr
        )
        .eq(
          "subject_id",
          selSub
        )
        .eq(
          "module_id",
          selMod
        );

      setParsedRows(
        rows
      );

      if (
        existing &&
        existing.length >
          0
      ) {

        setExistingCount(
          existing.length
        );

        setConflictMode(
          true
        );

        setStatus(null);

      }

      else {

        await doInsert(
          rows,
          "fresh"
        );

      }

    };

  const handleAppend =
    async () => {

      if (
        !parsedRows
      ) return;

      const {
        data:
          existing,
      } = await supabase
        .from(
          "dt_questions"
        )
        .select(
          "question"
        )
        .eq(
          "sem_id",
          selSem
        )
        .eq(
          "branch_id",
          selBr
        )
        .eq(
          "subject_id",
          selSub
        )
        .eq(
          "module_id",
          selMod
        );

      const existingSet =
        new Set(
          existing?.map(
            (
              r: any
            ) =>
              r.question
                .trim()
                .toLowerCase()
          )
        );

      const newRows =
        parsedRows.filter(
          (
            r: any
          ) =>
            !existingSet.has(
              r.question.toLowerCase()
            )
        );

      await doInsert(
        newRows,
        "append",
        parsedRows.length
      );

      setConflictMode(
        false
      );

    };

  const handleReplace =
    async () => {

      if (
        !parsedRows
      ) return;

      await supabase
        .from(
          "dt_questions"
        )
        .delete()
        .eq(
          "sem_id",
          selSem
        )
        .eq(
          "branch_id",
          selBr
        )
        .eq(
          "subject_id",
          selSub
        )
        .eq(
          "module_id",
          selMod
        );

      await doInsert(
        parsedRows,
        "replace"
      );

      setConflictMode(
        false
      );

    };

  const addItem =
    async () => {

      if (
        !input.trim()
      ) return;

      let error;

      if (
        tab ===
        "semesters"
      ) {

        ({
          error,
        } = await supabase
          .from(
            "semesters"
          )
          .insert([
            {
              label:
                input.trim(),
            },
          ]));

        loadSemesters();

      }

      if (
        tab ===
        "branches"
      ) {

        ({
          error,
        } = await supabase
          .from(
            "branches"
          )
          .insert([
            {
              label:
                input.trim(),

              semester_id:
                selSem,
            },
          ]));

        loadBranches(
          selSem
        );

      }

      if (
        tab ===
        "subjects"
      ) {

        ({
          error,
        } = await supabase
          .from(
            "subjects"
          )
          .insert([
            {
              label:
                input.trim(),

              branch_id:
                selBr,

              sem_id:
                selSem,
            },
          ]));

        loadSubjects(
          selBr
        );

      }

      if (
        tab ===
        "modules"
      ) {

        ({
          error,
        } = await supabase
          .from(
            "modules"
          )
          .insert([
            {
              label:
                input.trim(),

              subject_id:
                selSub,
            },
          ]));

        loadModules(
          selSub
        );

      }

      if (error) {

        alert(
          error.message
        );

      }

      setInput("");

    };

  const deleteItem =
    async (
      table: string,
      id: number
    ) => {

      if (
        !window.confirm(
          "Delete this item?"
        )
      ) return;

      await supabase
        .from(table)
        .delete()
        .eq("id", id);

      if (
        table ===
        "semesters"
      ) {

        loadSemesters();

      }

      if (
        table ===
        "branches"
      ) {

        loadBranches(
          selSem
        );

      }

      if (
        table ===
        "subjects"
      ) {

        loadSubjects(
          selBr
        );

      }

      if (
        table ===
        "modules"
      ) {

        loadModules(
          selSub
        );

      }

    };

  const TABS = [
    "semesters",
    "branches",
    "subjects",
    "modules",
    "upload",
  ];

  const listCfg: any =
    {
      semesters: {
        items:
          semesters,
        table:
          "semesters",
      },

      branches: {
        items:
          branches,
        table:
          "branches",
      },

      subjects: {
        items:
          subjects,
        table:
          "subjects",
      },

      modules: {
        items:
          modules,
        table:
          "modules",
      },
    }[tab];

  return (

    <div className="
      space-y-8
    ">
      <div className="
        bg-card
        border
        border-border
        rounded-3xl
        overflow-hidden
      ">

        {/* tabs */}

        <div className="
          flex
          overflow-x-auto
          border-b
          border-border
          px-6
        ">

          {TABS.map(
            (
              t
            ) => (

              <button
                key={t}
                onClick={() => {

                  setTab(t);

                  setInput("");

                  resetUploadState();

                }}
                className={`
                  px-5
                  py-4
                  text-xs
                  uppercase
                  tracking-[0.15em]
                  font-bold
                  border-b-2
                  transition-all
                  whitespace-nowrap
                  ${
                    tab === t
                      ? "border-indigo-500 text-indigo-500"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }
                `}
              >

                {t}

              </button>

            )
          )}

        </div>

        {/* body */}

        <div className="
          p-8
          space-y-8
        ">

          {tab !==
            "upload" &&
            listCfg && (

              <>

                {(tab ===
                  "branches" ||
                  tab ===
                    "subjects" ||
                  tab ===
                    "modules") && (

                  <div className="
                    grid
                    gap-5
                    md:grid-cols-2
                    lg:grid-cols-4
                  ">

                    <select
                      value={
                        selSem
                      }
                      onChange={(
                        e
                      ) =>
                        onSem(
                          e
                            .target
                            .value
                        )
                      }
                      className="
  h-12
  rounded-2xl
  border
  border-border
  bg-[#111111]
  text-white
  color-scheme-dark
  px-4
  [&_option]:bg-[#111111]
  [&_option]:text-white
"
                     >

                      <option value="">
                        Select Semester
                      </option>

                      {semesters.map(
                        (
                          s: any
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

                    {(tab ===
                      "subjects" ||
                      tab ===
                        "modules") && (

                      <select
                        value={
                          selBr
                        }
                        onChange={(
                          e
                        ) =>
                          onBr(
                            e
                              .target
                              .value
                          )
                        }
                        className="
  h-12
  rounded-2xl
  border
  border-border
  bg-[#111111]
  text-white
  color-scheme-dark
  px-4
  [&_option]:bg-[#111111]
  [&_option]:text-white
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

                    )}

                    {tab ===
                      "modules" && (

                      <select
                        value={
                          selSub
                        }
                        onChange={(
                          e
                        ) =>
                          onSub(
                            e
                              .target
                              .value
                          )
                        }
                        className="
  h-12
  rounded-2xl
  border
  border-border
  bg-[#111111]
  text-white
  color-scheme-dark
  px-4
  [&_option]:bg-[#111111]
  [&_option]:text-white
"
                      >

                        <option value="">
                          Select Subject
                        </option>

                        {subjects.map(
                          (
                            s: any
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

                  </div>

                )}

                {/* add */}

                <div className="
                  flex
                  gap-4
                  flex-col
                  md:flex-row
                ">

                  <input
                    value={
                      input
                    }
                    onChange={(
                      e
                    ) =>
                      setInput(
                        e.target
                          .value
                      )
                    }
                    className="
                      flex-1
                      h-12
                      rounded-2xl
                      border
                      border-border
                      bg-background
                      px-4
                    "
                    placeholder={`Add ${tab}`}
                  />

                  <button
                    onClick={
                      addItem
                    }
                    className="
                      h-12
                      px-6
                      rounded-2xl
                      bg-indigo-500
                      text-white
                      font-semibold
                      hover:bg-indigo-600
                    "
                  >

                    + Add

                  </button>

                </div>

                {/* list */}

                <div className="
                  space-y-3
                ">

                  {listCfg.items.map(
                    (
                      item: any
                    ) => (

                      <div
                        key={
                          item.id
                        }
                        className="
                          flex
                          items-center
                          justify-between
                          rounded-2xl
                          border
                          border-border
                          bg-card
                          px-5
                          py-4
                        "
                      >

                        <div className="
                          flex
                          items-center
                          gap-3
                          font-medium
                        ">

                          <div className="
                            w-2
                            h-2
                            rounded-full
                            bg-indigo-500
                          " />

                          {
                            item.label
                          }

                        </div>

                        <button
                          onClick={() =>
                            deleteItem(
                              listCfg.table,
                              item.id
                            )
                          }
                          className="
                            rounded-xl
                            bg-red-500
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            text-white
                          "
                        >

                          Delete

                        </button>

                      </div>

                    )
                  )}

                </div>

              </>

            )}

          {/* upload */}

          {tab ===
            "upload" && (

            <div className="
              space-y-8
            ">

              <div className="
                grid
                gap-5
                md:grid-cols-2
                lg:grid-cols-4
              ">

                <select
                  value={
                    selSem
                  }
                  onChange={(
                    e
                  ) =>
                    onSem(
                      e.target
                        .value
                    )
                  }
                  className="
                    h-12
                    rounded-2xl
                    border
                    border-border
                    bg-[#111111]
                    text-white
                    color-scheme-dark
                    px-4
                    [&_option]:bg-[#111111]
                    [&_option]:text-white
                  "
                >

                  <option value="">
                    Semester
                  </option>

                  {semesters.map(
                    (
                      s: any
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
                    selBr
                  }
                  onChange={(
                    e
                  ) =>
                    onBr(
                      e.target
                        .value
                    )
                  }
                  className="
                    h-12
                    rounded-2xl
                    border
                    border-border
                    bg-[#111111]
                    text-white
                    color-scheme-dark
                    px-4
                    [&_option]:bg-[#111111]
                    [&_option]:text-white
                  "
                >

                  <option value="">
                    Branch
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
                    selSub
                  }
                  onChange={(
                    e
                  ) =>
                    onSub(
                      e.target
                        .value
                    )
                  }
                  className="
                    h-12
                    rounded-2xl
                    border
                    border-border
                    bg-[#111111]
                    text-white
                    color-scheme-dark
                    px-4
                    [&_option]:bg-[#111111]
                    [&_option]:text-white
                  "
                >

                  <option value="">
                    Subject
                  </option>

                  {subjects.map(
                    (
                      s: any
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
                    selMod
                  }
                  onChange={(
                    e
                  ) =>
                    onMod(
                      e.target
                        .value
                    )
                  }
                  className="
                    h-12
                    rounded-2xl
                    border
                    border-border
                    bg-[#111111]
                    text-white
                    color-scheme-dark
                    px-4
                    [&_option]:bg-[#111111]
                    [&_option]:text-white
                  "
                >

                  <option value="">
                    Module
                  </option>

                  {modules.map(
                    (
                      m: any
                    ) => (

                      <option
                        key={
                          m.id
                        }
                        value={
                          m.id
                        }
                      >

                        {
                          m.label
                        }

                      </option>

                    )
                  )}

                </select>

              </div>

              {/* upload area */}

              <label className="
                relative
                flex
                flex-col
                items-center
                justify-center
                rounded-3xl
                border-2
                border-dashed
                border-border
                p-14
                text-center
                cursor-pointer
                hover:border-indigo-500
                transition-all
              ">

                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="
                    hidden
                  "
                  onChange={(
                    e: any
                  ) => {

                    setFile(
                      e.target
                        .files?.[0] ||
                        null
                    );

                    resetUploadState();

                  }}
                />

                <div className="
                  text-5xl
                ">

                  📂

                </div>

                <div className="
                  mt-4
                  text-lg
                  font-semibold
                ">

                  Upload Excel File

                </div>

                <div className="
                  mt-2
                  text-sm
                  text-muted-foreground
                ">

                  Supports .xlsx and .xls

                </div>

                {file && (

                  <div className="
                    mt-4
                    text-indigo-500
                    text-sm
                    font-medium
                  ">

                    {
                      file.name
                    }

                  </div>

                )}

              </label>

              {/* stats */}

              {uploadStats && (

                <div className="
                  flex
                  flex-wrap
                  gap-3
                ">

                  <div className="
                    rounded-full
                    bg-indigo-500/10
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-indigo-500
                  ">

                    Total:
                    {" "}
                    {
                      uploadStats.total
                    }

                  </div>

                  <div className="
                    rounded-full
                    bg-green-500/10
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-green-500
                  ">

                    Inserted:
                    {" "}
                    {
                      uploadStats.inserted
                    }

                  </div>

                </div>

              )}

              {/* conflict */}

              {conflictMode && (

                <div className="
                  rounded-3xl
                  border
                  border-yellow-500/20
                  bg-yellow-500/10
                  p-6
                ">

                  <div className="
                    text-lg
                    font-bold
                    text-yellow-500
                  ">

                    Questions already exist

                  </div>

                  <div className="
                    mt-2
                    text-sm
                    text-muted-foreground
                  ">

                    Existing questions:
                    {" "}
                    {
                      existingCount
                    }

                  </div>

                  <div className="
                    mt-5
                    flex
                    gap-3
                    flex-wrap
                  ">

                    <button
                      onClick={
                        handleAppend
                      }
                      className="
                        rounded-2xl
                        bg-indigo-500
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        text-white
                      "
                    >

                      Append

                    </button>

                    <button
                      onClick={
                        handleReplace
                      }
                      className="
                        rounded-2xl
                        border
                        border-red-500
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        text-red-500
                      "
                    >

                      Replace

                    </button>

                  </div>

                </div>

              )}

              {/* status */}

              {status && (

                <div className={`
                  rounded-2xl
                  border
                  p-4
                  text-sm
                  font-medium
                  ${
                    status.type ===
                    "ok"
                      ? "border-green-500/20 bg-green-500/10 text-green-500"
                      : status.type ===
                        "err"
                      ? "border-red-500/20 bg-red-500/10 text-red-500"
                      : "border-indigo-500/20 bg-indigo-500/10 text-indigo-500"
                  }
                `}>

                  {
                    status.msg
                  }

                </div>

              )}

              {/* footer */}

              <div className="
                flex
                justify-end
                gap-4
              ">

                {file && (

                  <button
                    onClick={() => {

                      setFile(
                        null
                      );

                      resetUploadState();

                    }}
                    className="
                      h-12
                      px-6
                      rounded-2xl
                      border
                      border-border
                    "
                  >

                    Clear

                  </button>

                )}

                <button
                  onClick={
                    handleUploadInit
                  }
                  disabled={
                    !file ||
                    !selSem ||
                    !selBr ||
                    !selSub ||
                    !selMod
                  }
                  className="
                    h-12
                    px-6
                    rounded-2xl
                    bg-indigo-500
                    text-white
                    font-semibold
                    disabled:opacity-50
                  "
                >

                  Upload Questions →

                </button>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}