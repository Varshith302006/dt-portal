'use client'
import React, { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* ─────────────────────── CSS ─────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700;800&display=swap');

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

:root{
  --bg:#ffffff;
  --card:#ffffff;
  --border:#e5e7eb;
  --input-bg:#ffffff;
  --heading:#111827;
  --body:#64748b;
  --placeholder:#94a3b8;

  --primary:#6366f1;
  --primary-hover:#4f46e5;
  --primary-ring:rgba(99,102,241,.15);

  --green:#16a34a;
  --green-bg:rgba(22,163,74,.12);

  --red:#dc2626;
  --red-bg:rgba(220,38,38,.12);

  --amber:#d97706;
  --amber-bg:rgba(217,119,6,.12);
}

html.dark{
  --bg:#000000;
  --card:#050505;
  --border:#222222;
  --input-bg:#050505;
  --heading:#ffffff;
  --body:#94a3b8;
  --placeholder:#6b7280;

  --green:#4ade80;
  --green-bg:rgba(74,222,128,.12);

  --red:#f87171;
  --red-bg:rgba(248,113,113,.12);

  --amber:#fbbf24;
  --amber-bg:rgba(251,191,36,.12);
}

body{
  background:var(--bg);
  font-family:'Chakra Petch',sans-serif;
  color:var(--heading);
}

/* ROOT */
.up-root{
  min-height:100vh;
  background:var(--bg);
  display:flex;
  justify-content:center;
  padding:38px 42px;
  font-family:'Chakra Petch',sans-serif;
}

/* WRAP */
.up-wrap{
  width:100%;
  max-width:1040px;
  background:var(--card);
  border:1px solid var(--border);
  border-radius:22px;
  overflow:hidden;
  display:flex;
  flex-direction:column;
}

/* HEADER */
.up-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:24px 30px;
  border-bottom:1px solid var(--border);
}

.up-head-left{
  display:flex;
  align-items:center;
  gap:14px;
}

.up-head-actions{
  display:flex;
  align-items:center;
  gap:12px;
}

.up-head-icon{
  width:48px;
  height:48px;
  border-radius:16px;
  background:rgba(99,102,241,.12);
  color:#6366f1;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:18px;
}

.up-head-title{
  font-size:24px;
  font-weight:800;
  color:var(--heading);
  letter-spacing:-1px;
}

.up-head-sub{
  margin-top:4px;
  font-size:12px;
  color:var(--body);
}

.up-theme,
.up-close{
  width:42px;
  height:42px;
  border-radius:12px;
  border:1px solid var(--border);
  background:var(--card);
  color:var(--body);
  cursor:pointer;
  font-size:15px;
  transition:.15s ease;
  font-family:'Chakra Petch',sans-serif;
}

.up-theme:hover,
.up-close:hover{
  border-color:var(--primary);
  color:var(--primary);
}

/* TABS */
.up-tabs{
  display:flex;
  overflow-x:auto;
  padding:0 24px;
  border-bottom:1px solid var(--border);
}

.up-tabs::-webkit-scrollbar{
  display:none;
}

.up-tab{
  background:none;
  border:none;
  border-bottom:2px solid transparent;
  margin-bottom:-1px;
  padding:16px 18px;
  font-family:'Chakra Petch',sans-serif;
  font-size:12px;
  font-weight:700;
  color:var(--body);
  text-transform:uppercase;
  letter-spacing:.08em;
  cursor:pointer;
  transition:.15s ease;
}

.up-tab:hover{
  color:var(--heading);
}

.up-tab.on{
  color:var(--primary);
  border-bottom-color:var(--primary);
}

/* BODY */
.up-body{
  padding:32px;
  display:flex;
  flex-direction:column;
  gap:26px;
}

/* SECTION */
.up-section{
  display:flex;
  align-items:center;
  gap:12px;
}

.up-section-line{
  flex:1;
  height:1px;
  background:var(--border);
}

.up-section-label{
  font-size:12px;
  font-weight:700;
  color:var(--body);
  text-transform:uppercase;
  letter-spacing:.08em;
}

/* CASCADE */
.up-cascade{
  display:grid;
  gap:18px;
}

.up-field-label{
  margin-bottom:8px;
  font-size:12px;
  font-weight:700;
  color:var(--body);
  text-transform:uppercase;
  letter-spacing:.05em;
}

/* INPUTS */
.up-input,
.up-sel{
  width:100%;
  height:50px;
  border-radius:14px;
  border:1px solid var(--border);
  background:var(--input-bg);
  color:var(--heading);
  padding:0 14px;
  outline:none;
  font-size:14px;
  font-family:'Chakra Petch',sans-serif;
  transition:.15s ease;
}

.up-input::placeholder{
  color:var(--placeholder);
}

.up-input:focus,
.up-sel:focus{
  border-color:var(--primary);
  box-shadow:0 0 0 3px var(--primary-ring);
}

.up-input:disabled,
.up-sel:disabled{
  opacity:.5;
  cursor:not-allowed;
}

/* BUTTONS */
.up-btn{
  height:50px;
  padding:0 22px;
  border:none;
  border-radius:14px;
  background:var(--primary);
  color:#fff;
  font-size:14px;
  font-weight:700;
  cursor:pointer;
  font-family:'Chakra Petch',sans-serif;
  transition:.15s ease;
}

.up-btn:hover{
  background:var(--primary-hover);
}

.up-btn:disabled{
  opacity:.5;
  cursor:not-allowed;
}

.up-btn-outline{
  height:50px;
  padding:0 20px;
  border-radius:14px;
  border:1px solid var(--border);
  background:none;
  color:var(--body);
  font-size:14px;
  font-weight:600;
  cursor:pointer;
  font-family:'Chakra Petch',sans-serif;
}

.up-btn-outline:hover{
  border-color:var(--primary);
  color:var(--primary);
}

.up-btn-del{
  border:none;
  background:#ef4444;
  color:#fff;
  border-radius:10px;
  padding:8px 14px;
  font-size:12px;
  font-weight:700;
  cursor:pointer;
  font-family:'Chakra Petch',sans-serif;
}

/* ADD ROW */
.up-add-row{
  display:flex;
  gap:12px;
}

/* LIST */
.up-list{
  display:flex;
  flex-direction:column;
  gap:10px;
}

.up-item{
  display:flex;
  align-items:center;
  justify-content:space-between;
  background:var(--card);
  border:1px solid var(--border);
  border-radius:16px;
  padding:14px 16px;
}

.up-item-name{
  display:flex;
  align-items:center;
  gap:10px;
  font-size:14px;
  color:var(--heading);
}

.up-dot{
  width:8px;
  height:8px;
  border-radius:999px;
  background:#6366f1;
}

.up-empty{
  padding:34px;
  border:1px dashed var(--border);
  border-radius:16px;
  text-align:center;
  color:var(--body);
  font-size:14px;
}

/* UPLOAD */
.up-zone{
  position:relative;
  border:2px dashed var(--border);
  border-radius:20px;
  padding:48px 20px;
  text-align:center;
  background:var(--card);
  cursor:pointer;
  transition:.2s ease;
}

.up-zone:hover{
  border-color:var(--primary);
}

.up-zone.lit{
  border-color:var(--primary);
  background:rgba(99,102,241,.05);
}

.up-zone input{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  opacity:0;
  cursor:pointer;
}

.up-zone-icon{
  font-size:36px;
  margin-bottom:12px;
}

.up-zone-main{
  font-size:16px;
  font-weight:700;
  color:var(--heading);
}

.up-zone-hint{
  margin-top:6px;
  font-size:13px;
  color:var(--body);
}

.up-zone-file{
  margin-top:10px;
  color:#6366f1;
  font-size:13px;
  word-break:break-word;
}

/* PILLS */
.up-col-pills{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
}

.up-col-pill{
  padding:8px 12px;
  border-radius:999px;
  background:rgba(99,102,241,.1);
  color:#6366f1;
  font-size:12px;
  font-weight:700;
}

/* STATS */
.up-stats{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
}

.up-stat{
  padding:8px 12px;
  border-radius:999px;
  background:rgba(99,102,241,.08);
  color:var(--body);
  font-size:12px;
  font-weight:700;
}

/* CONFLICT */
.up-conflict{
  background:var(--amber-bg);
  border:1px solid rgba(245,158,11,.25);
  border-radius:18px;
  padding:18px;
}

.up-conflict-title{
  font-size:14px;
  font-weight:700;
  color:var(--amber);
  margin-bottom:6px;
}

.up-conflict-sub{
  font-size:13px;
  color:var(--body);
  line-height:1.7;
}

.up-conflict-actions{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin-top:16px;
}

.up-btn-append{
  height:46px;
  border:none;
  border-radius:12px;
  background:var(--primary);
  color:#fff;
  padding:0 18px;
  font-size:13px;
  font-weight:700;
  cursor:pointer;
  font-family:'Chakra Petch',sans-serif;
}

.up-btn-replace{
  height:46px;
  border:1px solid var(--red);
  border-radius:12px;
  background:none;
  color:var(--red);
  padding:0 18px;
  font-size:13px;
  font-weight:700;
  cursor:pointer;
  font-family:'Chakra Petch',sans-serif;
}

/* STATUS */
.up-status{
  display:flex;
  align-items:center;
  gap:10px;
  padding:14px 16px;
  border-radius:14px;
  font-size:14px;
  font-weight:700;
}

.up-status.ok{
  background:var(--green-bg);
  color:var(--green);
}

.up-status.err{
  background:var(--red-bg);
  color:var(--red);
}

.up-status.ld{
  background:rgba(99,102,241,.12);
  color:#6366f1;
}

/* FOOTER */
.up-footer{
  display:flex;
  justify-content:flex-end;
  gap:12px;
}

/* SPINNER */
@keyframes spin{
  to{
    transform:rotate(360deg);
  }
}

.up-spinner{
  width:16px;
  height:16px;
  border:2px solid rgba(99,102,241,.2);
  border-top-color:#6366f1;
  border-radius:999px;
  animation:spin .7s linear infinite;
}

/* MOBILE */
@media(max-width:768px){

  .up-root{
    padding:22px 16px;
  }

  .up-body{
    padding:22px;
  }

  .up-add-row{
    flex-direction:column;
  }

  .up-footer{
    flex-direction:column;
  }

  .up-cascade{
    grid-template-columns:1fr !important;
  }

}
`;
/* ─────────────────────── HELPERS ─────────────────────── */
const CHUNK = 50;

async function insertChunked(table, rows) {
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase.from(table).insert(rows.slice(i, i + CHUNK));
    if (error) throw new Error(error.message);
  }
}

function dedupeByKey(arr, key) {
  const seen = new Set();
  return arr.filter(r => {
    const k = (r[key] || "").trim().toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/* ─────────────────────── COMPONENT ─────────────────────── */
export default function UploadPage() {
  const router = useRouter();
  const [tab, setTab] = useState("upload");

  // Lookup data
  const [semesters, setSemesters] = useState([]);
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [modules, setModules] = useState([]);

  // Selections
  const [selSem, setSelSem] = useState("");
  const [selBr, setSelBr] = useState("");
  const [selSub, setSelSub] = useState("");
  const [selMod, setSelMod] = useState("");

  // Manage tabs
  const [input, setInput] = useState("");

  // Upload tab
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null); // null | {type:"ok"|"err"|"ld", msg}
  const [conflictMode, setConflictMode] = useState(false); // show append/replace
  const [existingCount, setExistingCount] = useState(0);
  const [uploadStats, setUploadStats] = useState(null); // {inserted, skipped, total}
  const [parsedRows, setParsedRows] = useState(null); // rows parsed from excel, ready to insert

  const [darkMode, setDarkMode] = useState(false);
useEffect(() => {
  if (darkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}, [darkMode]);
  /* inject CSS */
  useEffect(() => {
    const tag = document.createElement("style");
    tag.textContent = CSS;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  /* loaders */
  useEffect(() => { loadSemesters(); }, []);

  const loadSemesters = async () => {
    const { data, error } = await supabase.from("semesters").select("*").order("label");
    if (!error) setSemesters(data || []);
  };
  const loadBranches = async (sid) => {
    const { data, error } = await supabase.from("branches").select("*").eq("semester_id", sid).order("label");
    if (!error) { setBranches(data || []); setSubjects([]); setModules([]); }
  };
  const loadSubjects = async (bid) => {
    const { data, error } = await supabase.from("subjects").select("*").eq("branch_id", bid).order("label");
    if (!error) { setSubjects(data || []); setModules([]); }
  };
  const loadModules = async (sid) => {
    const { data, error } = await supabase.from("modules").select("*").eq("subject_id", sid).order("label");
    if (!error) setModules(data || []);
  };

  /* cascade handlers */
  const onSem = (v) => { setSelSem(v); setSelBr(""); setSelSub(""); setSelMod(""); resetUploadState(); v ? loadBranches(v) : (setBranches([]), setSubjects([]), setModules([])); };
  const onBr  = (v) => { setSelBr(v);  setSelSub(""); setSelMod(""); resetUploadState(); v ? loadSubjects(v) : (setSubjects([]), setModules([])); };
  const onSub = (v) => { setSelSub(v); setSelMod(""); resetUploadState(); v ? loadModules(v) : setModules([]); };
  const onMod = (v) => { setSelMod(v); resetUploadState(); };

  const resetUploadState = () => {
    setStatus(null);
    setConflictMode(false);
    setExistingCount(0);
    setUploadStats(null);
    setParsedRows(null);
  };

  /* parse excel and return clean rows */
  const parseExcel = (f) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
        const raw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        if (!raw.length) return reject(new Error("File is empty or unreadable."));
        const rows = raw
          .filter(r => r.Question && String(r.Question).trim())
          .map(r => ({
            sem_id: selSem, branch_id: selBr, subject_id: selSub, module_id: selMod,
            question: String(r.Question).trim(),
            answer: r.Answer != null ? String(r.Answer).trim() : "",
          }));
        if (!rows.length) return reject(new Error("No valid rows found. Ensure 'Question' column exists."));
        // Dedupe within the Excel file itself
        const deduped = dedupeByKey(rows, "question");
        resolve(deduped);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsArrayBuffer(f);
  });

  /* STEP 1: Initiate upload — parse file, check existing */
  const handleUploadInit = async () => {
    if (!file || !selMod || !selBr || !selSub || !selSem)
      return setStatus({ type: "err", msg: "Select Semester → Branch → Subject → Module and choose a file." });

    setStatus({ type: "ld", msg: "Parsing file…" });
    setConflictMode(false);
    setUploadStats(null);

    let rows;
    try {
      rows = await parseExcel(file);
    } catch (err) {
      return setStatus({ type: "err", msg: err.message });
    }

    setStatus({ type: "ld", msg: "Checking existing questions…" });

    const { data: existing, error: checkError } = await supabase
      .from("dt_questions")
      .select("id")
      .eq("sem_id", selSem)
      .eq("branch_id", selBr)
      .eq("subject_id", selSub)
      .eq("module_id", selMod);

    if (checkError) return setStatus({ type: "err", msg: checkError.message });

    setParsedRows(rows);

    if (existing.length === 0) {
      // No conflict — insert directly
      await doInsert(rows, "fresh");
    } else {
      // Conflict — show options
      setExistingCount(existing.length);
      setConflictMode(true);
      setStatus(null);
    }
  };

  /* STEP 2a: Append — filter out duplicates, insert only new */
  const handleAppend = async () => {
    if (!parsedRows) return;
    setConflictMode(false);
    setStatus({ type: "ld", msg: "Fetching existing questions to deduplicate…" });

    const { data: existing, error } = await supabase
      .from("dt_questions")
      .select("question")
      .eq("sem_id", selSem)
      .eq("branch_id", selBr)
      .eq("subject_id", selSub)
      .eq("module_id", selMod);

    if (error) return setStatus({ type: "err", msg: error.message });

    const existingSet = new Set(existing.map(r => r.question.trim().toLowerCase()));
    const newRows = parsedRows.filter(r => !existingSet.has(r.question.toLowerCase()));

    if (newRows.length === 0) {
      setUploadStats({ inserted: 0, skipped: parsedRows.length, total: parsedRows.length });
      setFile(null);
      setParsedRows(null);
      return setStatus({ type: "ok", msg: "No new questions to insert — all already exist." });
    }

    await doInsert(newRows, "append", parsedRows.length);
  };

  /* STEP 2b: Replace — delete all, insert fresh */
  const handleReplace = async () => {
    if (!parsedRows) return;
    setConflictMode(false);
    setStatus({ type: "ld", msg: "Deleting existing questions…" });

    const { error: delError } = await supabase
      .from("dt_questions")
      .delete()
      .eq("sem_id", selSem)
      .eq("branch_id", selBr)
      .eq("subject_id", selSub)
      .eq("module_id", selMod);

    if (delError) return setStatus({ type: "err", msg: delError.message });

    await doInsert(parsedRows, "replace");
  };

  /* Core insert logic */
  const doInsert = async (rows, mode, totalFromFile = null) => {
    const total = totalFromFile ?? rows.length;
    setStatus({ type: "ld", msg: `Uploading ${rows.length} question${rows.length !== 1 ? "s" : ""}…` });

    try {
      await insertChunked("dt_questions", rows);
      const skipped = mode === "append" ? total - rows.length : 0;
      setUploadStats({ inserted: rows.length, skipped, total });
      setStatus({ type: "ok", msg: `Uploaded successfully! ${rows.length} question${rows.length !== 1 ? "s" : ""} inserted.` });
      setFile(null);
      setParsedRows(null);
    } catch (err) {
      setStatus({ type: "err", msg: err.message });
    }
  };

  /* Manage tabs: add item */
  const addItem = async () => {
    if (!input.trim()) return;
    let error;
    if (tab === "semesters") {
      ({ error } = await supabase.from("semesters").insert([{ label: input.trim() }]));
      if (!error) loadSemesters();
    }
    if (tab === "branches") {
      if (!selSem) return alert("Select semester first");
      ({ error } = await supabase.from("branches").insert([{ label: input.trim(), semester_id: selSem }]));
      if (!error) loadBranches(selSem);
    }
    if (tab === "subjects") {
      if (!selBr) return alert("Select branch first");
      ({ error } = await supabase.from("subjects").insert([{ label: input.trim(), branch_id: selBr, sem_id: selSem }]));
      if (!error) loadSubjects(selBr);
    }
    if (tab === "modules") {
      if (!selSub) return alert("Select subject first");
      ({ error } = await supabase.from("modules").insert([{ label: input.trim(), subject_id: selSub }]));
      if (!error) loadModules(selSub);
    }
    if (error) return alert(error.message);
    setInput("");
  };

  const deleteItem = async (table, id) => {
    if (!window.confirm("Delete this item?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return alert(error.message);
    if (table === "semesters") loadSemesters();
    if (table === "branches") loadBranches(selSem);
    if (table === "subjects") loadSubjects(selBr);
    if (table === "modules") loadModules(selSub);
  };

  /* ── SUB-COMPONENTS ── */
  const SectionLabel = ({ label }) => (
    <div className="up-section">
      <div className="up-section-line" />
      <div className="up-section-label">{label}</div>
      <div className="up-section-line" />
    </div>
  );

  const Cascade = ({ depth }) => {
    const cfgs = [
      { label: "Semester", val: selSem, fn: onSem, opts: semesters.map(s => ({ v: s.id, l: s.label })) },
      { label: "Branch",   val: selBr,  fn: onBr,  opts: branches.map(b => ({ v: b.id, l: b.label })) },
      { label: "Subject",  val: selSub, fn: onSub, opts: subjects.map(s => ({ v: s.id, l: s.label })) },
      { label: "Module",   val: selMod, fn: onMod, opts: modules.map(m => ({ v: m.id, l: m.label })) },
    ];
    const depthMap = { semester: 1, branch: 2, subject: 3, module: 4 };
    const count = depthMap[depth] || 1;
    const cols = count === 1 ? 1 : count === 2 ? 2 : count === 3 ? 3 : 4;
    return (
      <div className="up-cascade" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cfgs.slice(0, count).map((c, i) => (
          <div key={i}>
            <div className="up-field-label">{c.label}</div>
            <select className="up-sel" value={c.val} onChange={e => c.fn(e.target.value)}
              disabled={i > 0 && !cfgs[i - 1].val}>
              <option value="">— select —</option>
              {c.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </div>
        ))}
      </div>
    );
  };

  const listCfg = {
    semesters: { items: semesters, table: "semesters", getLabel: s => s.label },
    branches:  { items: branches,  table: "branches",  getLabel: b => b.label },
    subjects:  { items: subjects,  table: "subjects",  getLabel: s => s.label },
    modules:   { items: modules,   table: "modules",   getLabel: m => m.label },
  }[tab];

  const addDisabled =
    (tab === "branches" && !selSem) ||
    (tab === "subjects" && !selBr) ||
    (tab === "modules" && !selSub);

  const placeholders = {
    semesters: "e.g. Semester 1",
    branches:  "e.g. CSE",
    subjects:  "e.g. Data Structures",
    modules:   "e.g. Module 1 — Arrays",
  };

  const canUpload = file && selMod && selBr && selSub && selSem && status?.type !== "ld";
  const TABS = ["semesters", "branches", "subjects", "modules", "upload"];

  return (
    <div className="up-root">
      <div className="up-wrap">

        {/* HEADER */}
       {/* HEADER */}
<div className="up-head">

  <div className="up-head-left">

    <div className="up-head-icon">
      ⚙️
    </div>

    <div>
      <div className="up-head-title">
        Admin Dashboard
      </div>

      <div className="up-head-sub">
        Content Management
      </div>
    </div>

  </div>

  <div className="up-head-actions">

    <button
      className="up-theme"
      onClick={() => setDarkMode(!darkMode)}
    >
      {darkMode ? "☀️" : "🌙"}
    </button>

    <button
      className="up-close"
      onClick={() => router.back()}
    >
      ✕
    </button>

  </div>

</div>

        {/* TABS */}
        <div className="up-tabs">
          {TABS.map(t => (
            <button key={t}
              className={`up-tab${tab === t ? " on" : ""}`}
              onClick={() => { setTab(t); setInput(""); resetUploadState(); }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="up-body">

          {/* MANAGE TABS */}
          {tab !== "upload" && listCfg && (<>
            {tab === "branches" && <><SectionLabel label="Select semester" /><Cascade depth="semester" /></>}
            {tab === "subjects" && <><SectionLabel label="Select parent" /><Cascade depth="branch" /></>}
            {tab === "modules"  && <><SectionLabel label="Select parent" /><Cascade depth="subject" /></>}

            <SectionLabel label={`Add ${tab.slice(0, -1)}`} />
            <div className="up-add-row">
              <input className="up-input"
                placeholder={placeholders[tab] || ""}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !addDisabled && addItem()}
                disabled={addDisabled} />
              <button className="up-btn" onClick={addItem}
                disabled={addDisabled || !input.trim()}>
                + Add
              </button>
            </div>

            <SectionLabel label={`${listCfg.items.length} ${tab}`} />
            <div className="up-list">
              {listCfg.items.map(item => (
                <div key={item.id} className="up-item">
                  <div className="up-item-name">
                    <div className="up-dot" />
                    {listCfg.getLabel(item)}
                  </div>
                  <button className="up-btn-del" onClick={() => deleteItem(listCfg.table, item.id)}>
                    Delete
                  </button>
                </div>
              ))}
              {listCfg.items.length === 0 && (
                <div className="up-empty">
                  {addDisabled
                    ? "Select a parent above to load entries."
                    : `No ${tab} yet — add one above.`}
                </div>
              )}
            </div>
          </>)}

          {/* UPLOAD TAB */}
          {tab === "upload" && (<>
            <SectionLabel label="Select target" />
            <Cascade depth="module" />

            <SectionLabel label="Upload file" />

            <div className={`up-zone${file ? " lit" : ""}`}>
              <input type="file" accept=".xlsx,.xls"
                onChange={e => {
                  setFile(e.target.files[0] || null);
                  setStatus(null);
                  setConflictMode(false);
                  setUploadStats(null);
                  setParsedRows(null);
                }} />
              <div className="up-zone-icon">{file ? "📄" : "📂"}</div>
              <div className="up-zone-main">{file ? "File selected" : "Click or drag an Excel file here"}</div>
              <div className="up-zone-hint">Accepts .xlsx · .xls</div>
              {file && <div className="up-zone-file">{file.name}</div>}
            </div>

            <div className="up-col-pills">
              <div className="up-col-pill">Column: <span>Question</span></div>
              <div className="up-col-pill">Column: <span>Answer</span></div>
            </div>

            {/* Stats row */}
            {uploadStats && (
              <div className="up-stats">
                <div className="up-stat">Total in file: <b>{uploadStats.total}</b></div>
                <div className="up-stat">Inserted: <b>{uploadStats.inserted}</b></div>
                {uploadStats.skipped > 0 && <div className="up-stat">Skipped (duplicates): <b>{uploadStats.skipped}</b></div>}
              </div>
            )}

            {/* Conflict banner */}
            {conflictMode && (
              <div className="up-conflict">
                <div className="up-conflict-title">⚠ Questions Already Exist</div>
                <div className="up-conflict-sub">
                  There are already <b>{existingCount}</b> question{existingCount !== 1 ? "s" : ""} for this scope. How would you like to proceed?
                  <br />
                  <b>Append</b> — insert only new questions (skips duplicates).&nbsp;
                  <b>Replace</b> — delete all existing and upload fresh.
                </div>
                <div className="up-conflict-actions">
                  <button className="up-btn-append" onClick={handleAppend}>
                    Append new only
                  </button>
                  <button className="up-btn-replace" onClick={handleReplace}>
                    Replace all
                  </button>
                  <button className="up-btn-outline" onClick={() => { setConflictMode(false); setStatus(null); }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Status message */}
            {status && (
              <div className={`up-status ${status.type}`}>
                {status.type === "ld" ? <div className="up-spinner" /> : <span>{status.type === "ok" ? "✓" : "✕"}</span>}
                <span>{status.msg}</span>
              </div>
            )}

            {/* Footer */}
            {!conflictMode && (
              <div className="up-footer">
                {file && status?.type !== "ld" && (
                  <button className="up-btn-outline" onClick={() => {
                    setFile(null); setStatus(null); setUploadStats(null); setParsedRows(null);
                  }}>
                    Clear
                  </button>
                )}
                <button className="up-btn" style={{ padding: "10px 24px", fontSize: "13px" }}
                  onClick={handleUploadInit}
                  disabled={!canUpload}>
                  {status?.type === "ld" ? "Uploading…" : "Upload Questions →"}
                </button>
              </div>
            )}
          </>)}

        </div>
      </div>
    </div>
  );
}