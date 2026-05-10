'use client'
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import * as XLSX from 'xlsx';

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --bg:           #f1f3f9;
  --card:         #ffffff;
  --border:       #e2e8f0;
  --input-bg:     #ffffff;
  --heading:      #0f172a;
  --body:         #64748b;
  --label:        #0f172a;
  --placeholder:  #94a3b8;
  --muted-label:  #94a3b8;
  --primary:      #6366f1;
  --primary-h:    #4f46e5;
  --primary-ring: rgba(99,102,241,.2);
  --shadow-card:  0 1px 3px rgba(15,23,42,.06), 0 4px 16px rgba(15,23,42,.04);
  --shadow-drop:  0 8px 24px rgba(15,23,42,.09);
  --radius-card:  16px;
  --radius-inp:   8px;
  --transition:   .18s ease;
}

.dark-mode {
  --bg:           #111111;
  --card:         #1a1a1a;
  --border:       #2a2a2a;
  --input-bg:     #1a1a1a;
  --heading:      #f1f5f9;
  --body:         #888888;
  --label:        #e2e8f0;
  --placeholder:  #555555;
  --muted-label:  #555555;
  --shadow-card:  0 1px 3px rgba(0,0,0,.5), 0 4px 16px rgba(0,0,0,.4);
  --shadow-drop:  0 8px 24px rgba(0,0,0,.6);
}

.er-page {
  font-family: 'Chakra Petch', ui-sans-serif, system-ui, sans-serif;
  min-height: 100vh;
  background: var(--bg);
  color: var(--heading);
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
  transition: background var(--transition), color var(--transition);
}

/* ── NAVBAR ── */
.er-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 32px;
  background: var(--card);
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 10;
  transition: background var(--transition), border-color var(--transition);
}
.er-brand { display: flex; align-items: center; gap: 12px; }
.er-logo {
  width: 38px; height: 38px;
  background: var(--primary);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 700; font-size: 13px;
  font-family: 'Chakra Petch', sans-serif;
  letter-spacing: .04em;
}
.er-brand-text h1 {
  font-family: 'Chakra Petch', sans-serif;
  font-size: 14px; font-weight: 600;
  color: var(--heading); line-height: 1;
  transition: color var(--transition);
}
.er-brand-text p {
  font-size: 10px; font-weight: 500;
  color: var(--muted-label); letter-spacing: 1.5px;
  text-transform: uppercase; margin-top: 2px;
  transition: color var(--transition);
}
.er-nav-actions { display: flex; align-items: center; gap: 8px; }

.er-back {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px 6px 8px;
  border-radius: 8px; background: none;
  border: 1px solid var(--border);
  cursor: pointer; color: var(--body);
  font-size: 13px; font-weight: 500;
  font-family: 'Chakra Petch', sans-serif;
  transition: background var(--transition), color var(--transition), border-color var(--transition);
}
.er-back:hover { background: var(--border); color: var(--heading); }

.er-logout {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(239,68,68,0.06);
  border: 1px solid rgba(239,68,68,0.18);
  cursor: pointer; color: #ef4444;
  font-size: 13px; font-weight: 500;
  font-family: 'Chakra Petch', sans-serif;
  transition: background .2s, border-color .2s;
}
.er-logout:hover { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.35); }

.er-theme-btn {
  width: 36px; height: 36px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--body);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background var(--transition), border-color var(--transition), color var(--transition), transform .12s;
}
.er-theme-btn:hover {
  background: var(--primary); border-color: var(--primary);
  color: #fff; transform: scale(1.08);
}

/* ── MAIN ── */
.er-main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 32px 60px;
}

/* ── PAGE HEADER ── */
.er-header { margin-bottom: 28px; animation: er-fade-up .35s ease both; }

@keyframes er-fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
}

.er-breadcrumb {
  font-size: 11px; font-weight: 600;
  letter-spacing: .08em; text-transform: uppercase;
  color: var(--muted-label); margin-bottom: 8px;
  transition: color var(--transition);
}
.er-header h2 {
  font-family: 'Chakra Petch', sans-serif;
  font-size: 32px; font-weight: 700;
  letter-spacing: -.02em;
  color: var(--heading); line-height: 1.1;
  transition: color var(--transition);
}
.er-header h2 em { font-style: normal; color: var(--primary); }
.er-header p { font-size: 14px; color: var(--body); margin-top: 5px; transition: color var(--transition); }

/* ── CARD ── */
.er-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 24px 24px 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-card);
  transition: background var(--transition), border-color var(--transition), box-shadow var(--transition);
}
.er-card-title {
  font-family: 'Chakra Petch', sans-serif;
  font-size: 11px; font-weight: 600;
  letter-spacing: .08em; text-transform: uppercase;
  color: var(--muted-label); margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 8px;
  transition: color var(--transition), border-color var(--transition);
}

/* ── SEARCH ROW ── */
.er-search-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.er-search-wrap { position: relative; flex: 1; min-width: 200px; }
.er-search-input {
  width: 100%; height: 40px;
  padding: 0 14px 0 42px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-inp);
  background: var(--input-bg);
  font-family: 'Chakra Petch', sans-serif;
  font-size: 13.5px; color: var(--heading); outline: none;
  transition: border-color var(--transition), box-shadow var(--transition),
              background var(--transition), color var(--transition);
}
.er-search-input::placeholder { color: var(--placeholder); }
.er-search-input:hover:not(:focus) { border-color: #a5b4fc; }
.er-search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-ring);
}
.er-search-icon {
  position: absolute; left: 13px; top: 50%;
  transform: translateY(-50%);
  color: var(--muted-label); pointer-events: none;
}

/* Action buttons */
.er-search-btn {
  height: 40px;
  padding: 0 18px;
  background: var(--primary); color: #fff;
  border: none; border-radius: var(--radius-inp);
  font-family: 'Chakra Petch', sans-serif;
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: background var(--transition), transform .12s, box-shadow var(--transition);
  box-shadow: 0 2px 8px rgba(99,102,241,.35);
  white-space: nowrap;
}
.er-search-btn:hover { background: var(--primary-h); transform: translateY(-1px); }

.er-download-btn {
  display: inline-flex; align-items: center; gap: 6px;
  height: 40px; padding: 0 18px;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff;
  border: none; border-radius: var(--radius-inp);
  font-family: 'Chakra Petch', sans-serif;
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: transform .12s, box-shadow var(--transition);
  box-shadow: 0 2px 8px rgba(22,163,74,.35);
  white-space: nowrap;
}
.er-download-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(22,163,74,.45); }
.er-download-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

/* ── FILTER PILLS ── */
.er-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
.er-filter-btn {
  height: 34px; padding: 0 16px;
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: 999px;
  font-family: 'Chakra Petch', sans-serif;
  font-size: 12px; font-weight: 500; color: var(--body);
  cursor: pointer;
  transition: border-color var(--transition), color var(--transition), background var(--transition);
}
.er-filter-btn:hover { border-color: var(--primary); color: var(--primary); }
.er-filter-btn.active { background: var(--primary); border-color: var(--primary); color: #fff; }

/* ── FILTER SELECTS ── */
.er-select-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; align-items: center; }
.er-select {
  height: 38px;
  padding: 0 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-inp);
  background: var(--input-bg);
  font-family: 'Chakra Petch', sans-serif;
  font-size: 13px; color: var(--heading); outline: none;
  cursor: pointer;
  transition: border-color var(--transition), background var(--transition), color var(--transition);
  min-width: 160px;
}
.er-select:focus { border-color: var(--primary); }
.er-apply-btn {
  height: 38px; padding: 0 16px;
  background: var(--primary); color: #fff;
  border: none; border-radius: var(--radius-inp);
  font-family: 'Chakra Petch', sans-serif;
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: background var(--transition);
}
.er-apply-btn:hover { background: var(--primary-h); }

/* ── ACTIVE FILTER SUMMARY ── */
.er-filter-summary {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: var(--body); margin-top: 12px; flex-wrap: wrap;
  transition: color var(--transition);
}
.er-filter-tag {
  background: rgba(99,102,241,.08);
  border: 1px solid rgba(99,102,241,.2);
  border-radius: 6px; padding: 3px 10px;
  font-size: 11px; font-weight: 600; color: var(--primary);
}
.dark-mode .er-filter-tag { background: rgba(99,102,241,.15); }

/* ── TABLE ── */
.er-table-wrap { overflow-x: auto; margin-top: 4px; }
.er-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.er-table th {
  text-align: left;
  font-family: 'Chakra Petch', sans-serif;
  font-size: 10px; font-weight: 600;
  letter-spacing: .08em; text-transform: uppercase;
  color: var(--muted-label);
  padding: 10px 14px;
  border-bottom: 1.5px solid var(--border);
  background: var(--bg);
  white-space: nowrap;
  transition: color var(--transition), border-color var(--transition), background var(--transition);
}
.er-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  color: var(--body); vertical-align: middle;
  transition: color var(--transition), border-color var(--transition);
}
.er-table tr:last-child td { border-bottom: none; }
.er-table tr:hover td { background: var(--bg); }

/* Badges */
.er-roll-badge {
  display: inline-block;
  background: rgba(99,102,241,.08);
  border: 1px solid rgba(99,102,241,.2);
  border-radius: 6px; padding: 2px 8px;
  font-size: 12px; font-weight: 600; color: var(--primary);
  letter-spacing: 0.5px; font-family: monospace;
}
.dark-mode .er-roll-badge { background: rgba(99,102,241,.15); }

.er-exam-badge {
  display: inline-block;
  background: rgba(139,92,246,.08);
  border: 1px solid rgba(139,92,246,.2);
  border-radius: 6px; padding: 2px 8px;
  font-size: 12px; font-weight: 600; color: #7c3aed;
  letter-spacing: 0.5px; font-family: monospace;
}
.dark-mode .er-exam-badge { background: rgba(139,92,246,.15); color: #a78bfa; }

.er-marks-high { color: #16a34a; font-weight: 700; }
.er-marks-mid  { color: #d97706; font-weight: 700; }
.er-marks-low  { color: #dc2626; font-weight: 700; }

/* ── COUNT BADGE ── */
.er-count-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(99,102,241,.08);
  border: 1px solid rgba(99,102,241,.2);
  border-radius: 999px; padding: 4px 12px;
  font-size: 12px; font-weight: 600; color: var(--primary);
}
.dark-mode .er-count-badge { background: rgba(99,102,241,.15); }

/* ── LOADING / EMPTY ── */
.er-loading { text-align: center; padding: 30px; color: var(--primary); font-size: 14px; }
.er-empty { text-align: center; padding: 40px 20px; color: var(--muted-label); font-size: 14px; }
.er-empty-icon { font-size: 32px; margin-bottom: 10px; }

/* ── TOAST ── */
.er-toast {
  position: fixed; right: 24px; bottom: 28px;
  z-index: 9999;
  padding: 13px 18px;
  border-radius: 12px;
  font-family: 'Chakra Petch', sans-serif;
  font-size: 14px; font-weight: 500;
  color: #fff;
  pointer-events: none;
  opacity: 0;
  transform: translateY(8px) scale(.97);
  transition: opacity .22s, transform .22s;
  box-shadow: 0 4px 20px rgba(0,0,0,.15);
  display: flex; align-items: center; gap: 8px;
}
.er-toast.show { opacity: 1; transform: none; }
.er-toast.success { background: #16a34a; }
.er-toast.error   { background: #dc2626; }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .er-nav { padding: 12px 16px; }
  .er-main { padding: 28px 16px 48px; }
  .er-header h2 { font-size: 24px; }
}
@media (max-width: 600px) {
  .er-card { padding: 16px 14px; }
  .er-brand-text p { display: none; }
}
`;

// ─── Static lookup data ──────────────────────────────────────────────────────
const SEMESTERS = [
  { id: 1, label: "Semester 1" }, { id: 2, label: "Semester 2" },
  { id: 3, label: "Semester 3" }, { id: 4, label: "Semester 4" },
  { id: 5, label: "Semester 5" }, { id: 6, label: "Semester 6" },
  { id: 7, label: "Semester 7" }, { id: 8, label: "Semester 8" },
];

const BRANCHES_STATIC = [
  { id: 1, label: "CSE" }, { id: 2, label: "ECE" },
  { id: 3, label: "EEE" }, { id: 4, label: "MECH" },
  { id: 5, label: "CIVIL" }, { id: 6, label: "IT" },
  { id: 7, label: "AIDS" }, { id: 8, label: "AIML" },
];

const semLabel = id => SEMESTERS.find(s => s.id === Number(id))?.label ?? `Sem ${id}`;
const branchLabel = (id, allBranches) =>
  allBranches.find(b => b.id === Number(id))?.label ??
  BRANCHES_STATIC.find(b => b.id === Number(id))?.label ?? String(id);

function marksClass(marks) {
  if (marks == null) return "";
  if (marks >= 4) return "er-marks-high";
  if (marks >= 2) return "er-marks-mid";
  return "er-marks-low";
}

function downloadExcel(results, allBranches) {
  const data = results.map(r => ({
    "Exam ID": r.exam_id ?? "—",
    "Exam Name": r.exam?.exam_name ?? "—",
    "Roll Number": r.st_id ?? "—",
    "Student Name": r.student?.st_name ?? "—",
    "Semester": semLabel(r.student?.sem_id),
    "Branch": r.student?.branch?.label ?? "—",
    "Section": r.student?.section ?? "—",
    "Subject": r.exam?.subject?.label ?? "—",
    "Marks (/5)": r.total_marks ?? "—",
  }));
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
  XLSX.writeFile(workbook, "Exam_Results.xlsx");
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function ExamResults() {
  const router = useRouter();

  const [dark, setDark] = useState(false);
  const [searchRoll, setSearchRoll] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [filterSem, setFilterSem] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterExamId, setFilterExamId] = useState("");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [allBranches, setAllBranches] = useState([]);
  const [filterBranches, setFilterBranches] = useState([]);

  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  useEffect(() => {
    const saved = localStorage.getItem("ce-theme");
    if (saved === "dark") setDark(true);
  }, []);

  const toggleTheme = () => {
    setDark(d => {
      const next = !d;
      localStorage.setItem("ce-theme", next ? "dark" : "light");
      return next;
    });
  };

  const handleLogout = () => { localStorage.clear(); router.push("/"); };

  useEffect(() => {
    supabase
      .from("conduct_exam")
      .select("exam_id, exam_name, sem_id")
      .order("exam_id", { ascending: false })
      .then(({ data }) => setExams(data || []));
  }, []);

  useEffect(() => {
    if (!filterSem) { setFilterBranches([]); setFilterBranch(""); return; }
    supabase
      .from("branches")
      .select("id, label")
      .eq("semester_id", Number(filterSem))
      .order("label")
      .then(({ data }) => {
        const list = data || [];
        setFilterBranches(list);
        setFilterBranch("");
        setAllBranches(prev => {
          const ids = new Set(prev.map(b => b.id));
          return [...prev, ...list.filter(b => !ids.has(b.id))];
        });
      });
  }, [filterSem]); // eslint-disable-line

  const fetchResults = useCallback(async (mode = filterMode) => {
    setLoading(true);
    let q = supabase
      .from("exam_results")
      .select(`
        id, exam_id, st_id, total_marks, final_grade, avg_match_pct,
        attempted_questions, total_questions, submitted_at,
        student:st_id (st_id, st_name, sem_id, branch_id, section, branch:branch_id (id, label)),
        exam:exam_id (exam_id, exam_name, sem_id, subject_id, subject:subject_id (id, label))
      `)
      .order("submitted_at", { ascending: false });

    if (mode === "exam" && filterExamId) q = q.eq("exam_id", Number(filterExamId));
    if (searchRoll.trim()) q = q.ilike("st_id", `%${searchRoll.trim()}%`);

    const { data, error } = await q.limit(500);
    setLoading(false);
    if (error) { showToast("Failed to fetch results", "error"); return; }

    let rows = data || [];
    if (mode === "sem" && filterSem) rows = rows.filter(r => r.student?.sem_id === Number(filterSem));
    if (mode === "branch" && filterSem) {
      rows = rows.filter(r => r.student?.sem_id === Number(filterSem));
      if (filterBranch) rows = rows.filter(r => r.student?.branch_id === Number(filterBranch));
    }
    setResults(rows);
  }, [filterMode, filterSem, filterBranch, filterExamId, searchRoll]); // eslint-disable-line

  useEffect(() => { fetchResults("all"); }, []); // eslint-disable-line

  const handleSearch = () => fetchResults(filterMode);
  const handleFilterMode = (mode) => {
    setFilterMode(mode);
    setSearchRoll(""); setFilterSem(""); setFilterBranch(""); setFilterExamId("");
    if (mode === "all") fetchResults("all");
  };

  const handleDownload = () => {
    if (results.length === 0) { showToast("No data to download", "error"); return; }
    downloadExcel(results, allBranches);
    showToast("✅ Excel downloaded");
  };

  const filterSummary = () => {
    const tags = [];
    if (filterMode !== "all") tags.push(filterMode.toUpperCase());
    if (filterSem) tags.push(semLabel(filterSem));
    if (filterBranch && filterMode === "branch") tags.push(branchLabel(filterBranch, allBranches));
    if (filterExamId && filterMode === "exam") {
      const ex = exams.find(e => e.exam_id === Number(filterExamId));
      tags.push(`Exam: ${ex?.exam_name ?? filterExamId}`);
    }
    return tags;
  };

  return (
    <>
      <style>{styles}</style>
      <div className={`er-page${dark ? " dark-mode" : ""}`}>

        {/* ── NAVBAR ── */}
        <nav className="er-nav">
          <div className="er-brand">
            <div className="er-logo">DT</div>
            <div className="er-brand-text">
              <h1>Exam Results</h1>
              <p>Assessment Portal</p>
            </div>
          </div>
          <div className="er-nav-actions">
            <button className="er-back" onClick={() => router.push("/admin/dashboard")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back to Dashboard
            </button>
            <button className="er-logout" onClick={handleLogout}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
            <button className="er-theme-btn" onClick={toggleTheme} title="Toggle theme">
              {dark ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          </div>
        </nav>

        <main className="er-main">

          {/* ── PAGE HEADER ── */}
          <div className="er-header">
            <div className="er-breadcrumb">Admin · Exam Results</div>
            <h2>Student Exam <em>Results</em></h2>
            <p>Filter results by semester, branch, or exam — then download the filtered data as Excel.</p>
          </div>

          {/* ── SEARCH + FILTER CARD ── */}
          <div className="er-card">
            <div className="er-card-title">Search & Filter</div>

            <div className="er-search-row">
              <div className="er-search-wrap">
                <svg className="er-search-icon" width="15" height="15" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="er-search-input"
                  type="text"
                  placeholder="Search by roll number…"
                  value={searchRoll}
                  onChange={e => setSearchRoll(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                />
              </div>
              <button className="er-search-btn" onClick={handleSearch}>🔍 Search</button>
              <button
                className="er-download-btn"
                onClick={handleDownload}
                disabled={results.length === 0}
                title={results.length === 0 ? "No data to download" : `Download ${results.length} records`}
              >
                📥 Download Excel
              </button>
            </div>

            <div className="er-filters">
              {[
                { key: "all", label: "All Results" },
                { key: "sem", label: "By Semester" },
                { key: "branch", label: "By Branch" },
                { key: "exam", label: "By Exam" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`er-filter-btn${filterMode === key ? " active" : ""}`}
                  onClick={() => handleFilterMode(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {filterMode !== "all" && (
              <div className="er-select-row">
                {(filterMode === "sem" || filterMode === "branch") && (
                  <select className="er-select" value={filterSem} onChange={e => setFilterSem(e.target.value)}>
                    <option value="">All Semesters</option>
                    {SEMESTERS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                )}
                {filterMode === "branch" && (
                  <select
                    className="er-select"
                    value={filterBranch}
                    onChange={e => setFilterBranch(e.target.value)}
                    disabled={!filterSem}
                  >
                    <option value="">{filterSem ? "All Branches" : "Select semester first"}</option>
                    {filterBranches.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                  </select>
                )}
                {filterMode === "exam" && (
                  <select className="er-select" value={filterExamId} onChange={e => setFilterExamId(e.target.value)}>
                    <option value="">All Exams</option>
                    {exams.map(e => (
                      <option key={e.exam_id} value={e.exam_id}>#{e.exam_id} — {e.exam_name}</option>
                    ))}
                  </select>
                )}
                <button className="er-apply-btn" onClick={() => fetchResults(filterMode)}>Apply Filter</button>
              </div>
            )}

            {filterSummary().length > 0 && (
              <div className="er-filter-summary">
                <span>Active filters:</span>
                {filterSummary().map((t, i) => <span key={i} className="er-filter-tag">{t}</span>)}
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                  → {results.length} result{results.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* ── RESULTS TABLE CARD ── */}
          <div className="er-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "14px", borderBottom: "1px solid var(--border)" }}>
              <div className="er-card-title" style={{ margin: 0, padding: 0, border: "none" }}>Result Records</div>
              {results.length > 0 && (
                <span className="er-count-badge">
                  📊 {results.length} record{results.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {loading ? (
              <div className="er-loading">⏳ Loading results…</div>
            ) : results.length === 0 ? (
              <div className="er-empty">
                <div className="er-empty-icon">📭</div>
                <div>No results found. Try adjusting your filters.</div>
              </div>
            ) : (
              <div className="er-table-wrap">
                <table className="er-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Exam ID</th>
                      <th>Exam Name</th>
                      <th>Roll Number</th>
                      <th>Student Name</th>
                      <th>Semester</th>
                      <th>Branch</th>
                      <th>Section</th>
                      <th>Subject</th>
                      <th>Marks (/5)</th>
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, idx) => {
                      const sem = r.student?.sem_id ? semLabel(r.student.sem_id) : "—";
                      const bran = r.student?.branch?.label ?? "—";
                      const sec = r.student?.section ? String(r.student.section) : "—";
                      const sub = r.submitted_at
                        ? new Date(r.submitted_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
                        : "—";
                      const subject = r.exam?.subject?.label ?? "—";
                      return (
                        <tr key={r.id}>
                          <td style={{ color: "var(--muted-label)", fontSize: 12 }}>{idx + 1}</td>
                          <td><span className="er-exam-badge">#{r.exam_id}</span></td>
                          <td style={{ fontWeight: 500, maxWidth: 200, color: "var(--heading)" }}>{r.exam?.exam_name ?? "—"}</td>
                          <td><span className="er-roll-badge">{r.st_id}</span></td>
                          <td style={{ fontWeight: 500, color: "var(--heading)" }}>{r.student?.st_name ?? "—"}</td>
                          <td>{sem}</td>
                          <td>{bran}</td>
                          <td>{sec}</td>
                          <td>{subject}</td>
                          <td>
                            <span className={marksClass(r.total_marks)}>{r.total_marks ?? "—"}</span>
                          </td>
                          <td style={{ fontSize: 12, color: "var(--muted-label)" }}>{sub}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>

      <div className={`er-toast ${toast.type} ${toast.show ? "show" : ""}`}>{toast.msg}</div>
    </>
  );
}