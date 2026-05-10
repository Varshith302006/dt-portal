'use client'
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ─── Schema (from Supabase screenshot) ────────────────────────────────────────
// student  : st_id (text PK), st_name (varchar), sem_id (int4), branch_id (int4), section (int4), password (text)
// branches : id (int4 PK), label (text), semester_id (int4)
// semesters: id (int4 PK), label (text)
// ─────────────────────────────────────────────────────────────────────────────

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@600;700;800&display=swap');
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
  font-family:'Inter',sans-serif;
}
.sm-wrapper{
  font-family:'Inter',sans-serif;

  min-height:100vh;

  background:
    radial-gradient(circle at top left, rgba(124,58,237,0.1), transparent 35%),
    radial-gradient(circle at bottom right, rgba(147,51,234,0.08), transparent 35%),
    #050505;

  display:flex;
  flex-direction:column;

  color:#fafafa;
}

/* NAVBAR */

.sm-nav{
  display:flex;
  align-items:center;
  justify-content:space-between;

  padding:16px 34px;

  background:rgba(10,10,12,0.92);

  border-bottom:1px solid rgba(255,255,255,0.06);

  backdrop-filter:blur(18px);

  position:sticky;
  top:0;
  z-index:100;
}

.sm-brand{
  display:flex;
  align-items:center;
  gap:14px;
}

.sm-logo{
  width:44px;
  height:44px;

  border-radius:14px;

  background:linear-gradient(135deg,#7c3aed,#9333ea);

  display:flex;
  align-items:center;
  justify-content:center;

  color:white;

  font-weight:700;
  font-size:14px;

  box-shadow:
    0 10px 25px rgba(124,58,237,0.35);
}

.sm-brand-text h1{
  font-family:'Inter',sans-serif;

  font-size:16px;
  font-weight:700;

  color:#ffffff;

  line-height:1;
}

.sm-brand-text p{
  font-size:10px;

  color:#71717a;

  letter-spacing:2px;

  text-transform:uppercase;

  margin-top:4px;
}

.sm-nav-actions{
  display:flex;
  align-items:center;
  gap:12px;
}

.sm-back{
  display:flex;
  align-items:center;
  gap:8px;

  padding:10px 18px;

  background:rgba(255,255,255,0.03);

  border:1px solid rgba(255,255,255,0.06);

  border-radius:12px;

  color:#d4d4d8;

  font-size:13px;
  font-weight:600;

  cursor:pointer;

  transition:all .25s ease;

  backdrop-filter:blur(10px);
}

.sm-back:hover{
  transform:translateY(-2px);

  border-color:rgba(124,58,237,0.35);

  background:rgba(124,58,237,0.08);
}

.sm-logout{
  display:flex;
  align-items:center;
  gap:8px;

  padding:10px 18px;

  background:rgba(239,68,68,0.08);

  border:1px solid rgba(239,68,68,0.18);

  border-radius:12px;

  color:#ef4444;

  font-size:13px;
  font-weight:600;

  cursor:pointer;

  transition:all .25s ease;
}

.sm-logout:hover{
  background:rgba(239,68,68,0.16);

  transform:translateY(-2px);
}

/* MAIN */

.sm-main{
  flex:1;

  max-width:1200px;
  width:100%;

  margin:0 auto;

  padding:48px 28px 70px;
}

/* HEADER */

.sm-header{
  margin-bottom:34px;
}

.sm-header-label{
  display:flex;
  align-items:center;
  gap:10px;

  margin-bottom:12px;
}

.sm-header-label::before{
  content:'';

  width:4px;
  height:16px;

  border-radius:10px;

  background:#7c3aed;
}

.sm-header-label span{
  font-size:10px;
  font-weight:700;

  letter-spacing:2px;

  text-transform:uppercase;

  color:#71717a;
}

.sm-header h2{
  font-size:48px;

  font-weight:700;

  color:#fafafa;

  line-height:1.2;
  font-family:'Playfair Display',serif;

  
  letter-spacing:-1.5px;
}

.sm-header h2 em{
  color:#8b5cf6;

  font-style:normal;
}

.sm-header p{
  margin-top:10px;

  color:#a1a1aa;

  font-size:15px;

  line-height:1.6;
}

/* CARD */

.sm-card{
  background:rgba(15,15,18,0.88);

  border:1px solid rgba(255,255,255,0.06);

  border-radius:24px;

  padding:32px;

  margin-bottom:24px;

  backdrop-filter:blur(18px);

  box-shadow:
    0 0 1px rgba(255,255,255,0.08),
    0 8px 24px rgba(0,0,0,0.35);
}

.sm-card-title{
  font-family:'Inter',sans-serif;
  display:flex;
  align-items:center;
  gap:10px;

  margin-bottom:20px;

  font-size:11px;
  font-weight:700;

  letter-spacing:2px;

  text-transform:uppercase;

  color:#71717a;
}

.sm-card-title::before{
  content:'';

  width:4px;
  height:14px;

  border-radius:10px;

  background:#8b5cf6;
}

/* SEARCH */

.sm-search-row{
  display:flex;
  gap:12px;
  align-items:center;
  flex-wrap:wrap;
}

.sm-search-wrap{
  position:relative;

  flex:1;

  min-width:220px;
}

.sm-search-input{
  width:100%;

  padding:14px 16px 14px 46px;

  border:1px solid rgba(255,255,255,0.08);

  border-radius:16px;

  background:#141419;

  color:white;

  font-size:14px;

  outline:none;

  transition:all .3s ease;
}

.sm-search-input:focus{
  border-color:rgba(124,58,237,0.6);

  box-shadow:
    0 0 0 3px rgba(124,58,237,0.12);
}

.sm-search-icon{
  position:absolute;

  left:16px;
  top:50%;

  transform:translateY(-50%);

  color:#71717a;
}

.sm-search-btn,
.sm-add-btn,
.sm-apply-btn{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;

  padding:14px 24px;

  border:none;

  border-radius:16px;

  cursor:pointer;

  font-size:13px;
  font-weight:700;

  color:white;

  transition:all .3s cubic-bezier(.22,1,.36,1);

  background:
    linear-gradient(135deg,#7c3aed,#9333ea);

  box-shadow:
    0 8px 20px rgba(124,58,237,0.25);
}

.sm-search-btn:hover,
.sm-add-btn:hover,
.sm-apply-btn:hover{
  transform:translateY(-3px);

  box-shadow:
    0 12px 30px rgba(124,58,237,0.35);
}

/* FILTERS */

.sm-filters{
  display:flex;
  gap:10px;
  flex-wrap:wrap;

  margin-top:16px;
}

.sm-filter-btn{
  padding:10px 18px;

  border-radius:999px;

  border:1px solid rgba(255,255,255,0.06);

  background:rgba(255,255,255,0.03);

  color:#d4d4d8;

  font-size:13px;
  font-weight:600;

  cursor:pointer;

  transition:all .25s ease;
}

.sm-filter-btn:hover{
  border-color:#7c3aed;

  background:rgba(124,58,237,0.1);

  color:#c4b5fd;
}

.sm-filter-btn.active{
  background:linear-gradient(135deg,#7c3aed,#9333ea);

  border-color:transparent;

  color:white;
}

/* SELECTS */

.sm-select-row{
  display:flex;
  gap:12px;
  flex-wrap:wrap;

  margin-top:16px;
}

.sm-select{
  min-width:170px;

  padding:12px 14px;

  border-radius:14px;

  border:1px solid rgba(255,255,255,0.06);

  background:#18181b;

  color:white;

  outline:none;

  transition:all .25s ease;
}

.sm-select:focus{
  border-color:#7c3aed;

  box-shadow:
    0 0 0 4px rgba(124,58,237,0.12);
}

/* TABLE */

.sm-table-wrap{
  overflow-x:auto;
}

.sm-table{
  width:100%;

  border-collapse:collapse;
}

.sm-table th{
  text-align:left;

  padding:16px 14px;

  color:#71717a;

  font-size:11px;
  font-weight:700;

  letter-spacing:1.5px;

  text-transform:uppercase;

  border-bottom:1px solid rgba(255,255,255,0.06);
}

.sm-table td{
  padding:16px 14px;

  border-bottom:1px solid rgba(255,255,255,0.04);

  color:#e4e4e7;
}

.sm-table tr:hover td{
  background:rgba(124,58,237,0.05);
}

/* BADGES */

.sm-roll-badge{
  display:inline-flex;
  align-items:center;

  padding:5px 10px;

  border-radius:999px;

  background:rgba(124,58,237,0.12);

  border:1px solid rgba(124,58,237,0.2);

  color:#c4b5fd;

  font-size:12px;
  font-weight:700;

  font-family:'Inter',sans-serif;
}

/* ACTIONS */

.sm-action-group{
  display:flex;
  align-items:center;
  gap:8px;
}

.sm-edit-btn,
.sm-delete-btn{
  padding:8px 14px;

  border-radius:10px;

  font-size:12px;
  font-weight:700;

  cursor:pointer;

  transition:all .25s ease;
}

.sm-edit-btn{
  background:rgba(124,58,237,0.12);

  border:1px solid rgba(124,58,237,0.25);

  color:#c4b5fd;
}

.sm-edit-btn:hover{
  background:#7c3aed;

  color:white;

  transform:translateY(-2px);
}

.sm-delete-btn{
  background:rgba(239,68,68,0.08);

  border:1px solid rgba(239,68,68,0.2);

  color:#ef4444;
}

.sm-delete-btn:hover{
  background:#ef4444;

  color:white;

  transform:translateY(-2px);
}

/* STATUS */

.sm-loading,
.sm-empty{
  text-align:center;

  padding:50px 20px;

  color:#71717a;
}

.sm-empty-icon{
  font-size:42px;

  margin-bottom:14px;
}

.sm-count-badge{
  display:inline-flex;
  align-items:center;
  gap:8px;

  padding:6px 14px;

  border-radius:999px;

  background:rgba(124,58,237,0.12);

  border:1px solid rgba(124,58,237,0.2);

  color:#c4b5fd;

  font-size:12px;
  font-weight:700;
}

/* MODAL */

.sm-modal-overlay{
  position:fixed;
  inset:0;

  background:rgba(0,0,0,0.65);

  backdrop-filter:blur(10px);

  z-index:200;

  display:flex;
  align-items:center;
  justify-content:center;

  padding:20px;
}

.sm-modal{
  width:100%;
  max-width:500px;

  background:rgba(17,17,20,0.96);

  border:1px solid rgba(255,255,255,0.06);

  border-radius:28px;

  padding:32px;

  box-shadow:
    0 30px 70px rgba(0,0,0,0.55);

  animation:sm-modal-in .28s cubic-bezier(.22,1,.36,1);
}

@keyframes sm-modal-in{
  from{
    opacity:0;
    transform:translateY(14px) scale(.94);
  }
  to{
    opacity:1;
    transform:translateY(0) scale(1);
  }
}

.sm-modal-header{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;

  margin-bottom:24px;
}

.sm-modal-title{
  font-size:28px;
  font-weight:700;

  color:#fafafa;
}

.sm-modal-title em{
  color:#8b5cf6;

  font-style:normal;
}

.sm-modal-subtitle{
  margin-top:6px;

  font-size:13px;

  color:#71717a;
}

.sm-modal-close{
  background:none;
  border:none;

  color:#71717a;

  cursor:pointer;
}

/* FORM */

.sm-form-group{
  margin-bottom:18px;
}

.sm-form-group label{
  display:block;

  margin-bottom:8px;

  font-size:11px;
  font-weight:700;

  letter-spacing:1px;

  text-transform:uppercase;

  color:#71717a;
}

.sm-form-group input,
.sm-form-group select{
  width:100%;

  padding:13px 14px;

  border-radius:14px;

  border:1px solid rgba(255,255,255,0.06);

  background:#18181b;

  color:white;

  outline:none;

  transition:all .25s ease;
}

.sm-form-group input:focus,
.sm-form-group select:focus{
  border-color:#7c3aed;

  box-shadow:
    0 0 0 4px rgba(124,58,237,0.12);
}

.sm-form-note{
  margin-top:6px;

  font-size:11px;

  color:#71717a;
}

/* MODAL ACTIONS */

.sm-modal-actions{
  display:flex;
  gap:12px;

  margin-top:26px;
}

.sm-btn-save,
.sm-btn-cancel,
.sm-btn-danger{
  flex:1;

  padding:13px;

  border:none;

  border-radius:14px;

  cursor:pointer;

  font-size:14px;
  font-weight:700;

  transition:all .25s ease;
}

.sm-btn-save{
  background:
    linear-gradient(135deg,#7c3aed,#9333ea);

  color:white;
}

.sm-btn-save:hover{
  transform:translateY(-2px);
}

.sm-btn-cancel{
  background:#18181b;

  border:1px solid rgba(255,255,255,0.06);

  color:#d4d4d8;
}

.sm-btn-cancel:hover{
  background:#232326;
}

.sm-btn-danger{
  background:#ef4444;

  color:white;
}

.sm-btn-danger:hover{
  background:#dc2626;
}

/* TOAST */

.sm-toast{
  position:fixed;

  bottom:24px;
  left:50%;

  transform:translateX(-50%) translateY(80px);

  padding:14px 22px;

  border-radius:14px;

  font-size:14px;
  font-weight:600;

  color:white;

  z-index:999;

  opacity:0;

  transition:all .3s cubic-bezier(.22,1,.36,1);

  pointer-events:none;
}

.sm-toast.show{
  transform:translateX(-50%) translateY(0);

  opacity:1;
}

.sm-toast.success{
  background:#10b981;
}

.sm-toast.error{
  background:#ef4444;
}

/* CONFIRM */

.sm-confirm-box{
  width:100%;
  max-width:380px;

  background:rgba(17,17,20,0.98);

  border:1px solid rgba(255,255,255,0.06);

  border-radius:24px;

  padding:30px;

  box-shadow:
    0 30px 70px rgba(0,0,0,0.55);
}

.sm-confirm-box h3{
  font-size:22px;
  font-weight:700;

  color:#fafafa;

  margin-bottom:10px;
}

.sm-confirm-box p{
  font-size:14px;

  color:#a1a1aa;

  line-height:1.6;

  margin-bottom:24px;
}

.sm-confirm-actions{
  display:flex;
  gap:12px;
}

/* RESPONSIVE */

@media(max-width:768px){

  .sm-nav{
    padding:14px 18px;
  }

  .sm-main{
    padding:30px 18px 60px;
  }

  .sm-header h2{
    font-size:32px;
  }

  .sm-search-row,
  .sm-select-row{
    flex-direction:column;
    align-items:stretch;
  }

  .sm-search-btn,
  .sm-add-btn,
  .sm-apply-btn{
    width:100%;
  }

  .sm-action-group{
    flex-direction:column;
    align-items:stretch;
  }
}
  /* =========================================
   THEME TOGGLE BUTTON
========================================= */

.theme-toggle{
  width:54px;
  height:54px;

  border-radius:18px;

  border:1px solid rgba(0,0,0,0.08);

  background:#ffffff;

  display:flex;
  align-items:center;
  justify-content:center;

  cursor:pointer;

  color:#64748b;

  font-size:22px;

  transition:all 0.25s ease;

  box-shadow:
    0 2px 10px rgba(0,0,0,0.04);

  backdrop-filter:blur(12px);
}

.theme-toggle:hover{
  transform:translateY(-2px);

  border-color:rgba(124,58,237,0.2);

  box-shadow:
    0 10px 24px rgba(0,0,0,0.08);
}

/* DARK MODE BUTTON */

.dark .theme-toggle{
  background:#0f0f12;

  border:1px solid rgba(255,255,255,0.06);

  color:#f8fafc;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.03),
    0 8px 24px rgba(0,0,0,0.45);
}

/* =========================================
   DARK THEME
========================================= */

.dark{
  background:#050505;
  color:#ffffff;
}

.dark .ad-nav,
.dark .sm-nav,
.dark .am-nav{
  background:#0a0a0f;
  border-bottom:1px solid rgba(255,255,255,0.06);
}

.dark .ad-section,
.dark .sm-section,
.dark .am-section,
.dark .ad-card,
.dark .sm-card,
.dark .am-card{
  background:#101014;
  border:1px solid rgba(255,255,255,0.06);
  box-shadow:0 0 30px rgba(124,58,237,0.08);
}

.dark input,
.dark select{
  background:#141419;
  color:white;
  border:1px solid rgba(255,255,255,0.08);
}

.dark table{
  color:white;
}

/* =========================================
   LIGHT THEME
========================================= */

.light{
  background:#f4f7fb;
  color:#111827;
}

.light .ad-nav,
.light .sm-nav,
.light .am-nav{
  background:white;
  border-bottom:1px solid #e5e7eb;
}

.light .ad-section,
.light .sm-section,
.light .am-section,
.light .ad-card,
.light .sm-card,
.light .am-card{
  background:white;
  border:1px solid #e5e7eb;
  box-shadow:0 10px 25px rgba(0,0,0,0.05);
}

.light h1,
.light h2,
.light h3,
.light p,
.light span,
.light td,
.light th{
  color:#111827;
}

.light input,
.light select{
  background:white;
  color:#111827;
  border:1px solid #d1d5db;
}

.light table{
  color:#111827;
}

.light .ad-btn,
.light .sm-btn,
.light .am-btn{
  background:#f3f4f6;
  color:#111827;
}

.light .ad-btn:hover,
.light .sm-btn:hover,
.light .am-btn:hover{
  background:white;
}

/* =========================================
   SMOOTH TRANSITION
========================================= */

.ad-wrapper,
.sm-wrapper,
.am-wrapper,
.ad-section,
.sm-section,
.am-section,
.ad-card,
.sm-card,
.am-card,
input,
select,
button{
  transition:all 0.3s ease;
}
`;

// ─── Static lookup data (must match Supabase branch/semester IDs) ─────────────
const SEMESTERS = [
  { id: 1, label: "Semester 1" }, { id: 2, label: "Semester 2" },
  { id: 3, label: "Semester 3" }, { id: 4, label: "Semester 4" },
  { id: 5, label: "Semester 5" }, { id: 6, label: "Semester 6" },
  { id: 7, label: "Semester 7" }, { id: 8, label: "Semester 8" },
];

const BRANCHES = [
  { id: 1, label: "CSE"  },
  { id: 2, label: "ECE"  },
  { id: 3, label: "EEE"  },
  { id: 4, label: "MECH" },
  { id: 5, label: "CIVIL"},
  { id: 6, label: "IT"   },
  { id: 7, label: "AIDS" },
  { id: 8, label: "AIML" },
];

const SECTIONS = [
  { id: 1, label: "A" }, { id: 2, label: "B" },
  { id: 3, label: "C" }, { id: 4, label: "D" },
  { id: 5, label: "E" }, { id: 6, label: "F" },
  { id: 7, label: "G" }, { id: 8, label: "H" },
];

// ─── Helper: get label from id ─────────────────────────────────────────────────
// branchLabel is dynamic — computed inside the component using live DB branches
const semLabel    = id => SEMESTERS.find(s => s.id === Number(id))?.label ?? `Sem ${id}`;
const sectionLabel= id => SECTIONS.find(s => s.id === Number(id))?.label ?? String(id);

// ─── Blank form shapes ────────────────────────────────────────────────────────
const blankAdd  = { st_id: "", st_name: "", sem_id: "", branch_id: "", section: "", password: "" };
const blankEdit = {         st_name: "", sem_id: "", branch_id: "", section: "", password: "" };

// ─── Component ────────────────────────────────────────────────────────────────
export default function StudentManagement() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(() => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("theme") !== "light";
  }
  return true;
});
useEffect(() => {
  localStorage.setItem("theme", darkMode ? "dark" : "light");
}, [darkMode]);
  // ── Search & filter state ──────────────────────────────────────────────────
  const [searchRoll, setSearchRoll] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // all | sem | branch | section
  const [filterSem,     setFilterSem]     = useState("");
  const [filterBranch,  setFilterBranch]  = useState("");
  const [filterSection, setFilterSection] = useState("");

  // ── Data state ─────────────────────────────────────────────────────────────
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(false);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [editModal,   setEditModal]   = useState(null);   // student object | null
  const [editForm,    setEditForm]    = useState(blankEdit);
  const [addModal,    setAddModal]    = useState(false);
  const [addForm,     setAddForm]     = useState(blankAdd);
  const [deleteTarget, setDeleteTarget] = useState(null); // student object | null
  const [saving,      setSaving]      = useState(false);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const handleLogout = () => { localStorage.clear(); router.push("/"); };

  // ── Dynamic branches fetched from Supabase per semester ────────────────────
  // Separate lists for Add modal, Edit modal, and filter dropdown
  const [addBranches,    setAddBranches]    = useState([]);
  const [editBranches,   setEditBranches]   = useState([]);
  const [filterBranches, setFilterBranches] = useState([]);
  // All branches ever loaded — used to resolve branch labels in the table
  const [allBranches,    setAllBranches]    = useState([]);

  // Fetch branches for a given semester_id from the DB
  const fetchBranchesFor = async (semId) => {
    if (!semId) return [];
    const { data, error } = await supabase
      .from("branches")
      .select("id, label")
      .eq("semester_id", Number(semId))
      .order("label");
    if (error) { showToast("Failed to load branches", "error"); return []; }
    return data || [];
  };

  // When add-form semester changes → reload add branches
  useEffect(() => {
    if (!addForm.sem_id) { setAddBranches([]); return; }
    fetchBranchesFor(addForm.sem_id).then(list => {
      setAddBranches(list);
      // If previously selected branch is no longer valid, clear it
      setAddForm(f => ({ ...f, branch_id: "" }));
      // Merge into allBranches for table label resolution
      setAllBranches(prev => {
        const ids = new Set(prev.map(b => b.id));
        return [...prev, ...list.filter(b => !ids.has(b.id))];
      });
    });
  }, [addForm.sem_id]); // eslint-disable-line

  // When edit-form semester changes → reload edit branches
  // We track whether modal was just opened to avoid clearing branch_id on initial load
  const editModalOpenRef = useState({ justOpened: false })[0];
  useEffect(() => {
    if (!editForm.sem_id) { setEditBranches([]); return; }
    fetchBranchesFor(editForm.sem_id).then(list => {
      setEditBranches(list);
      // Only clear branch_id if user manually changed the semester (not on initial open)
      if (!editModalOpenRef.justOpened) {
        setEditForm(f => ({ ...f, branch_id: "" }));
      }
      editModalOpenRef.justOpened = false;
      setAllBranches(prev => {
        const ids = new Set(prev.map(b => b.id));
        return [...prev, ...list.filter(b => !ids.has(b.id))];
      });
    });
  }, [editForm.sem_id]); // eslint-disable-line

  // When filter semester changes → reload filter branches
  useEffect(() => {
    if (!filterSem) { setFilterBranches([]); return; }
    fetchBranchesFor(filterSem).then(list => {
      setFilterBranches(list);
      setFilterBranch("");
      setAllBranches(prev => {
        const ids = new Set(prev.map(b => b.id));
        return [...prev, ...list.filter(b => !ids.has(b.id))];
      });
    });
  }, [filterSem]); // eslint-disable-line

  // Resolve branch label by id using the accumulated allBranches list
  const branchLabel = (id) =>
    allBranches.find(b => b.id === Number(id))?.label ?? BRANCHES.find(b => b.id === Number(id))?.label ?? String(id);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchStudents = useCallback(async (mode = filterMode) => {
    setLoading(true);
    let q = supabase.from("student").select("*");

    if (mode === "sem") {
      if (filterSem) q = q.eq("sem_id", Number(filterSem));
    } else if (mode === "branch") {
      if (filterSem)    q = q.eq("sem_id",    Number(filterSem));
      if (filterBranch) q = q.eq("branch_id", Number(filterBranch));
    } else if (mode === "section") {
      if (filterSem)     q = q.eq("sem_id",    Number(filterSem));
      if (filterBranch)  q = q.eq("branch_id", Number(filterBranch));
      if (filterSection) q = q.eq("section",   Number(filterSection));
    }

    const { data, error } = await q.order("st_id");
    setLoading(false);
    if (error) { showToast("Failed to fetch students", "error"); return; }
    setStudents(data || []);
  }, [filterMode, filterSem, filterBranch, filterSection]);

  // Load all on mount
  useEffect(() => { fetchStudents("all"); }, []); // eslint-disable-line

  // ── Search by roll number ──────────────────────────────────────────────────
  const handleSearch = async () => {
    const term = searchRoll.trim();
    if (!term) { fetchStudents(); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("student").select("*")
      .ilike("st_id", `%${term}%`);
    setLoading(false);
    if (error) { showToast("Search failed", "error"); return; }
    setStudents(data || []);
  };

  // ── Filter mode switch ─────────────────────────────────────────────────────
  const handleFilterMode = (mode) => {
    setFilterMode(mode);
    setSearchRoll("");
    if (mode === "all")    { setFilterSem(""); setFilterBranch(""); setFilterSection(""); fetchStudents("all"); }
    if (mode === "sem")    { setFilterBranch(""); setFilterSection(""); }
    if (mode === "branch") { setFilterSection(""); }
  };

  // ── Edit handlers ──────────────────────────────────────────────────────────
  const openEdit = async (s) => {
    editModalOpenRef.justOpened = true; // signal: don't clear branch_id on first sem_id effect
    setEditModal(String(s.st_id));
    setEditForm({
      st_name:   typeof s.st_name   === "string" ? s.st_name   : "",
      sem_id:    s.sem_id    != null ? String(s.sem_id)    : "",
      branch_id: s.branch_id != null ? String(s.branch_id) : "",
      section:   s.section   != null ? String(s.section)   : "",
      password:  typeof s.password  === "string" ? s.password  : "",
    });
    // Pre-load branches for this student's semester so the select is populated
    if (s.sem_id) {
      const list = await fetchBranchesFor(s.sem_id);
      setEditBranches(list);
      setAllBranches(prev => {
        const ids = new Set(prev.map(b => b.id));
        return [...prev, ...list.filter(b => !ids.has(b.id))];
      });
    }
  };

  const saveEdit = async () => {
    if (!editForm.st_name.trim()) { showToast("Name is required", "error"); return; }
    if (!editForm.sem_id)         { showToast("Please select a semester", "error"); return; }
    if (!editForm.branch_id)      { showToast("Please select a branch", "error"); return; }
    if (!editForm.section)        { showToast("Please select a section", "error"); return; }
    if (!editForm.password.trim()){ showToast("Password is required", "error"); return; }

    setSaving(true);
    const { error } = await supabase
      .from("student")
      .update({
        st_name:   editForm.st_name.trim(),
        sem_id:    Number(editForm.sem_id),
        branch_id: Number(editForm.branch_id),
        section:   Number(editForm.section),
        password:  editForm.password.trim(),
      })
      .eq("st_id", editModal);   // editModal is now the plain st_id string
    setSaving(false);

    if (error) { showToast("Failed to update student: " + error.message, "error"); return; }
    showToast("✅ Student updated successfully");
    setEditModal(null);
    fetchStudents();
  };

  // ── Add handlers ───────────────────────────────────────────────────────────
  const openAdd = () => {
    setAddForm({
      ...blankAdd,
      sem_id:    filterSem     || "",
      branch_id: filterBranch  || "",
      section:   filterSection || "",
    });
    setAddModal(true);
  };

  const saveAdd = async () => {
    const { st_id, st_name, sem_id, branch_id, section, password } = addForm;
    if (!st_id.trim())    { showToast("Roll number is required", "error"); return; }
    if (!st_name.trim())  { showToast("Name is required", "error"); return; }
    if (!sem_id)          { showToast("Please select a semester", "error"); return; }
    if (!branch_id)       { showToast("Please select a branch", "error"); return; }
    if (!section)         { showToast("Please select a section", "error"); return; }
    if (!password.trim()) { showToast("Password is required", "error"); return; }

    setSaving(true);
    const { error } = await supabase.from("student").insert({
      st_id:     st_id.trim().toUpperCase(),
      st_name:   st_name.trim(),
      sem_id:    Number(sem_id),
      branch_id: Number(branch_id),
      section:   Number(section),
      password:  password.trim(),
    });
    setSaving(false);

    if (error) {
      if (error.code === "23505") showToast("Roll number already exists", "error");
      else showToast("Failed to add student: " + error.message, "error");
      return;
    }
    showToast("✅ Student added successfully");
    setAddModal(false);
    fetchStudents();
  };

  // ── Delete handlers ────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    const { error } = await supabase
      .from("student")
      .delete()
      .eq("st_id", deleteTarget.st_id);
    setSaving(false);
    if (error) { showToast("Failed to delete student", "error"); return; }
    showToast("🗑️ Student removed");
    setDeleteTarget(null);
    fetchStudents();
  };

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>
      <div className={`sm-wrapper ${darkMode ? "dark" : "light"}`}>

        {/* ── NAVBAR ── */}
        <nav className="sm-nav">
          <div className="sm-brand">
            <div className="sm-logo">DT</div>
            <div className="sm-brand-text">
              <h1>Student Management</h1>
              <p>Assessment Portal</p>
            </div>
          </div>
          <div className="sm-nav-actions">
            <button className="sm-back" onClick={() => router.push("/admin/dashboard")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to Dashboard
            </button>
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "☀" : "☾"}
            </button>
            <button className="sm-logout" onClick={handleLogout}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </nav>

        <main className="sm-main">

          {/* ── PAGE HEADER ── */}
          <div className="sm-header">
            <div className="sm-header-label"><span>Admin · Student Management</span></div>
            <h2>Manage <em>Students</em></h2>
            <p>Search by roll number, filter by semester / branch / section, edit or add students.</p>
          </div>

          {/* ── SEARCH + FILTER CARD ── */}
          <div className="sm-card">
            <div className="sm-card-title">Search & Filter</div>

            {/* Search row */}
            <div className="sm-search-row">
              <div className="sm-search-wrap">
                <svg className="sm-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="sm-search-input"
                  type="text"
                  placeholder="Search by roll number…"
                  value={searchRoll}
                  onChange={e => setSearchRoll(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                />
              </div>
              <button className="sm-search-btn" onClick={handleSearch}>🔍 Search</button>
              <button className="sm-add-btn"    onClick={openAdd}>➕ Add Student</button>
            </div>

            {/* Filter mode pills */}
            <div className="sm-filters">
              {[
                { key: "all",     label: "All Students"  },
                { key: "sem",     label: "By Semester"   },
                { key: "branch",  label: "By Branch"     },
                { key: "section", label: "By Section"    },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`sm-filter-btn ${filterMode === key ? "active" : ""}`}
                  onClick={() => handleFilterMode(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Cascade selects */}
            {filterMode !== "all" && (
              <div className="sm-select-row">
                {/* Semester always shown when not "all" */}
                <select className="sm-select" value={filterSem} onChange={e => setFilterSem(e.target.value)}>
                  <option value="">All Semesters</option>
                  {SEMESTERS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>

                {/* Branch shown for branch / section mode */}
                {(filterMode === "branch" || filterMode === "section") && (
                  <select className="sm-select" value={filterBranch} onChange={e => setFilterBranch(e.target.value)} disabled={!filterSem}>
                    <option value="">{filterSem ? "All Branches" : "Select semester first"}</option>
                    {filterBranches.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                  </select>
                )}

                {/* Section shown only for section mode */}
                {filterMode === "section" && (
                  <select className="sm-select" value={filterSection} onChange={e => setFilterSection(e.target.value)}>
                    <option value="">All Sections</option>
                    {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                )}

                <button className="sm-apply-btn" onClick={() => fetchStudents(filterMode)}>
                  Apply Filter
                </button>
              </div>
            )}
          </div>

          {/* ── STUDENT TABLE CARD ── */}
          <div className="sm-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div className="sm-card-title" style={{ margin: 0 }}>Student Records</div>
              {students.length > 0 && (
                <span className="sm-count-badge">
                  👥 {students.length} student{students.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {loading ? (
              <div className="sm-loading">⏳ Loading students…</div>
            ) : students.length === 0 ? (
              <div className="sm-empty">
                <div className="sm-empty-icon">📭</div>
                <div>No students found. Try adjusting your search or filters.</div>
              </div>
            ) : (
              <div className="sm-table-wrap">
                <table className="sm-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Roll Number</th>
                      <th>Name</th>
                      <th>Semester</th>
                      <th>Branch</th>
                      <th>Section</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => (
                      <tr key={s.st_id}>
                        <td style={{ color: "#CCC", fontSize: 12 }}>{idx + 1}</td>
                        <td><span className="sm-roll-badge">{s.st_id}</span></td>
                        <td style={{ fontWeight: 500 }}>{s.st_name || "—"}</td>
                        {/* Convert stored int IDs → human-readable labels */}
                        <td>{s.sem_id    ? semLabel(s.sem_id)       : "—"}</td>
                        <td>{s.branch_id ? branchLabel(s.branch_id) : "—"}</td>
                        <td>{s.section   ? sectionLabel(s.section)  : "—"}</td>
                        <td>
                          <div className="sm-action-group">
                            <button className="sm-edit-btn"   onClick={() => openEdit(s)}>✏️ Edit</button>
                            <button className="sm-delete-btn" onClick={() => setDeleteTarget(s)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* ══ EDIT MODAL ══════════════════════════════════════════════════════════ */}
      {editModal && (
        <div className="sm-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setEditModal(null); }}>
          <div className="sm-modal">
            <div className="sm-modal-header">
              <div>
                <div className="sm-modal-title">Edit <em>Student</em></div>
                <div className="sm-modal-subtitle">Roll No: {editModal} (read-only)</div>
              </div>
              <button className="sm-modal-close" onClick={() => setEditModal(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Roll number — read only */}
            <div className="sm-form-group">
              <label>Roll Number</label>
              <input type="text" value={editModal} disabled />
              <div className="sm-form-note">Roll number cannot be changed</div>
            </div>

            {/* Name */}
            <div className="sm-form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={editForm.st_name}
                placeholder="Enter student name"
                onChange={e => setEditForm(f => ({ ...f, st_name: e.target.value }))}
              />
            </div>

            {/* Semester */}
            <div className="sm-form-group">
              <label>Semester</label>
              <select value={editForm.sem_id} onChange={e => setEditForm(f => ({ ...f, sem_id: e.target.value }))}>
                <option value="">Select Semester</option>
                {SEMESTERS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            {/* Branch — populated dynamically based on selected semester */}
            <div className="sm-form-group">
              <label>Branch</label>
              <select
                value={editForm.branch_id}
                onChange={e => setEditForm(f => ({ ...f, branch_id: e.target.value }))}
                disabled={!editForm.sem_id}
              >
                <option value="">{editForm.sem_id ? "Select Branch" : "Select a semester first"}</option>
                {editBranches.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
            </div>

            {/* Section */}
            <div className="sm-form-group">
              <label>Section</label>
              <select value={editForm.section} onChange={e => setEditForm(f => ({ ...f, section: e.target.value }))}>
                <option value="">Select Section</option>
                {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            {/* Password */}
            <div className="sm-form-group">
              <label>Password</label>
              <input
                type="text"
                value={editForm.password}
                placeholder="Enter password"
                onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>

            <div className="sm-modal-actions">
              <button className="sm-btn-cancel" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="sm-btn-save"   onClick={saveEdit} disabled={saving}>
                {saving ? "Saving…" : "💾 Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ ADD STUDENT MODAL ═══════════════════════════════════════════════════ */}
      {addModal && (
        <div className="sm-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setAddModal(false); }}>
          <div className="sm-modal">
            <div className="sm-modal-header">
              <div className="sm-modal-title">Add <em>Student</em></div>
              <button className="sm-modal-close" onClick={() => setAddModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Roll number */}
            <div className="sm-form-group">
              <label>Roll Number</label>
              <input
                type="text"
                value={addForm.st_id}
                placeholder="e.g. 22A91A0501"
                onChange={e => setAddForm(f => ({ ...f, st_id: e.target.value }))}
              />
            </div>

            {/* Name */}
            <div className="sm-form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={addForm.st_name}
                placeholder="Enter student name"
                onChange={e => setAddForm(f => ({ ...f, st_name: e.target.value }))}
              />
            </div>

            {/* Semester */}
            <div className="sm-form-group">
              <label>Semester</label>
              <select value={addForm.sem_id} onChange={e => setAddForm(f => ({ ...f, sem_id: e.target.value }))}>
                <option value="">Select Semester</option>
                {SEMESTERS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            {/* Branch — populated dynamically based on selected semester */}
            <div className="sm-form-group">
              <label>Branch</label>
              <select
                value={addForm.branch_id}
                onChange={e => setAddForm(f => ({ ...f, branch_id: e.target.value }))}
                disabled={!addForm.sem_id}
              >
                <option value="">{addForm.sem_id ? "Select Branch" : "Select a semester first"}</option>
                {addBranches.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
            </div>

            {/* Section */}
            <div className="sm-form-group">
              <label>Section</label>
              <select value={addForm.section} onChange={e => setAddForm(f => ({ ...f, section: e.target.value }))}>
                <option value="">Select Section</option>
                {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            {/* Password */}
            <div className="sm-form-group">
              <label>Password</label>
              <input
                type="text"
                value={addForm.password}
                placeholder="Set a password"
                onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>

            <div className="sm-modal-actions">
              <button className="sm-btn-cancel" onClick={() => setAddModal(false)}>Cancel</button>
              <button className="sm-btn-save"   onClick={saveAdd} disabled={saving}>
                {saving ? "Adding…" : "➕ Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRM ══════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="sm-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="sm-confirm-box">
            <h3>Delete Student?</h3>
            <p>
              This will permanently remove <strong>{deleteTarget.st_name || deleteTarget.st_id}</strong>{" "}
              (<span style={{ fontFamily: "monospace", color: "#C97B2E" }}>{deleteTarget.st_id}</span>) from the system.
              This action cannot be undone.
            </p>
            <div className="sm-confirm-actions">
              <button className="sm-btn-cancel" style={{ flex: 1 }} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="sm-btn-danger" onClick={confirmDelete} disabled={saving}>
                {saving ? "Deleting…" : "🗑️ Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST ═══════════════════════════════════════════════════════════════ */}
      <div className={`sm-toast ${toast.type} ${toast.show ? "show" : ""}`}>{toast.msg}</div>
    </>
  );
}