'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@600;700;800&display=swap');
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
  font-family:'Inter',sans-serif;
}

.am-wrapper{
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

.am-nav{
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

.am-brand{
  display:flex;
  align-items:center;
  gap:14px;
}

.am-logo{
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

.am-brand-text h1{
  font-family:'Inter',sans-serif;

  font-size:16px;
  font-weight:700;

  color:#ffffff;

  line-height:1;
}

.am-brand-text p{
  font-size:10px;

  color:#71717a;

  letter-spacing:2px;

  text-transform:uppercase;

  margin-top:4px;
}

.am-nav-actions{
  display:flex;
  align-items:center;
  gap:12px;
}

.am-back{
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

.am-back:hover{
  transform:translateY(-2px);

  border-color:rgba(124,58,237,0.35);

  background:rgba(124,58,237,0.08);
}

.am-logout{
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

.am-logout:hover{
  background:rgba(239,68,68,0.16);

  transform:translateY(-2px);
}

/* MAIN */

.am-main{
  flex:1;

  max-width:1200px;
  width:100%;

  margin:0 auto;

  padding:48px 28px 70px;
}

/* HEADER */

.am-header{
  margin-bottom:34px;
}

.am-header-label{
  display:flex;
  align-items:center;
  gap:10px;

  margin-bottom:12px;
}

.am-header-label::before{
  content:'';

  width:4px;
  height:16px;

  border-radius:10px;

  background:#7c3aed;
}

.am-header-label span{
  font-size:10px;
  font-weight:700;

  letter-spacing:2px;

  text-transform:uppercase;

  color:#71717a;
}

.am-header h2{
  font-size:48px;

  font-weight:700;

  color:#fafafa;

  line-height:1.2;
  font-family:'Playfair Display',serif;

  letter-spacing:-1.5px;
}

.am-header h2 em{
  color:#8b5cf6;

  font-style:normal;
}

.am-header p{
  margin-top:10px;

  color:#a1a1aa;

  font-size:15px;

  line-height:1.6;
}

/* CARD */

.am-card{
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

.am-card-title{
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

.am-card-title::before{
  content:'';

  width:4px;
  height:14px;

  border-radius:10px;

  background:#8b5cf6;
}

/* SEARCH */

.am-search-row{
  display:flex;
  gap:12px;
  align-items:center;
  flex-wrap:wrap;
}

.am-search-wrap{
  position:relative;

  flex:1;

  min-width:220px;
}

.am-search-input{
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

.am-search-input:focus{
  border-color:rgba(124,58,237,0.6);

  box-shadow:
    0 0 0 3px rgba(124,58,237,0.12);
}

.am-search-icon{
  position:absolute;

  left:16px;
  top:50%;

  transform:translateY(-50%);

  color:#71717a;
}

.am-search-btn,
.am-add-btn{
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

.am-search-btn:hover,
.am-add-btn:hover{
  transform:translateY(-3px);

  box-shadow:
    0 12px 30px rgba(124,58,237,0.35);
}

/* TABLE */

.am-table-wrap{
  overflow-x:auto;
}

.am-table{
  width:100%;

  border-collapse:collapse;
}

.am-table th{
  text-align:left;

  padding:16px 14px;

  color:#71717a;

  font-size:11px;
  font-weight:700;

  letter-spacing:1.5px;

  text-transform:uppercase;

  border-bottom:1px solid rgba(255,255,255,0.06);
}

.am-table td{
  padding:16px 14px;

  border-bottom:1px solid rgba(255,255,255,0.04);

  color:#e4e4e7;
}

.am-table tr:hover td{
  background:rgba(124,58,237,0.05);
}

/* BADGES */

.am-id-badge{
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

.am-action-group{
  display:flex;
  align-items:center;
  gap:8px;
}

.am-edit-btn,
.am-delete-btn{
  padding:8px 14px;

  border-radius:10px;

  font-size:12px;
  font-weight:700;

  cursor:pointer;

  transition:all .25s ease;
}

.am-edit-btn{
  background:rgba(124,58,237,0.12);

  border:1px solid rgba(124,58,237,0.25);

  color:#c4b5fd;
}

.am-edit-btn:hover{
  background:#7c3aed;

  color:white;

  transform:translateY(-2px);
}

.am-delete-btn{
  background:rgba(239,68,68,0.08);

  border:1px solid rgba(239,68,68,0.2);

  color:#ef4444;
}

.am-delete-btn:hover{
  background:#ef4444;

  color:white;

  transform:translateY(-2px);
}

/* STATUS */

.am-loading,
.am-empty{
  text-align:center;

  padding:50px 20px;

  color:#71717a;
}

.am-empty-icon{
  font-size:42px;

  margin-bottom:14px;
}

.am-count-badge{
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

.am-modal-overlay{
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

.am-modal{
  width:100%;
  max-width:460px;

  background:rgba(17,17,20,0.96);

  border:1px solid rgba(255,255,255,0.06);

  border-radius:28px;

  padding:32px;

  box-shadow:
    0 30px 70px rgba(0,0,0,0.55);

  animation:am-modal-in .28s cubic-bezier(.22,1,.36,1);
}

@keyframes am-modal-in{
  from{
    opacity:0;
    transform:translateY(14px) scale(.94);
  }
  to{
    opacity:1;
    transform:translateY(0) scale(1);
  }
}

.am-modal-header{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;

  margin-bottom:24px;
}

.am-modal-title{
  font-size:28px;
  font-weight:700;

  color:#fafafa;
}

.am-modal-title em{
  color:#8b5cf6;

  font-style:normal;
}

.am-modal-subtitle{
  margin-top:6px;

  font-size:13px;

  color:#71717a;
}

.am-modal-close{
  background:none;
  border:none;

  color:#71717a;

  cursor:pointer;
}

/* FORM */

.am-form-group{
  margin-bottom:18px;
}

.am-form-group label{
  display:block;

  margin-bottom:8px;

  font-size:11px;
  font-weight:700;

  letter-spacing:1px;

  text-transform:uppercase;

  color:#71717a;
}

.am-form-group input{
  width:100%;

  padding:13px 14px;

  border-radius:14px;

  border:1px solid rgba(255,255,255,0.06);

  background:#18181b;

  color:white;

  outline:none;

  transition:all .25s ease;
}

.am-form-group input:focus{
  border-color:#7c3aed;

  box-shadow:
    0 0 0 4px rgba(124,58,237,0.12);
}

.am-form-note{
  margin-top:6px;

  font-size:11px;

  color:#71717a;
}

/* MODAL ACTIONS */

.am-modal-actions{
  display:flex;
  gap:12px;

  margin-top:26px;
}

.am-btn-save,
.am-btn-cancel,
.am-btn-danger{
  flex:1;

  padding:13px;

  border:none;

  border-radius:14px;

  cursor:pointer;

  font-size:14px;
  font-weight:700;

  transition:all .25s ease;
}

.am-btn-save{
  background:
    linear-gradient(135deg,#7c3aed,#9333ea);

  color:white;
}

.am-btn-save:hover{
  transform:translateY(-2px);
}

.am-btn-cancel{
  background:#18181b;

  border:1px solid rgba(255,255,255,0.06);

  color:#d4d4d8;
}

.am-btn-cancel:hover{
  background:#232326;
}

.am-btn-danger{
  background:#ef4444;

  color:white;
}

.am-btn-danger:hover{
  background:#dc2626;
}

/* TOAST */

.am-toast{
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

.am-toast.show{
  transform:translateX(-50%) translateY(0);

  opacity:1;
}

.am-toast.success{
  background:#10b981;
}

.am-toast.error{
  background:#ef4444;
}

/* CONFIRM */

.am-confirm-box{
  width:100%;
  max-width:380px;

  background:rgba(17,17,20,0.98);

  border:1px solid rgba(255,255,255,0.06);

  border-radius:24px;

  padding:30px;

  box-shadow:
    0 30px 70px rgba(0,0,0,0.55);
}

.am-confirm-box h3{
  font-size:22px;
  font-weight:700;

  color:#fafafa;

  margin-bottom:10px;
}

.am-confirm-box p{
  font-size:14px;

  color:#a1a1aa;

  line-height:1.6;

  margin-bottom:24px;
}

.am-confirm-actions{
  display:flex;
  gap:12px;
}

/* RESPONSIVE */

@media(max-width:768px){

  .am-nav{
    padding:14px 18px;
  }

  .am-main{
    padding:30px 18px 60px;
  }

  .am-header h2{
    font-size:32px;
  }

  .am-search-row{
    flex-direction:column;
    align-items:stretch;
  }

  .am-search-btn,
  .am-add-btn{
    width:100%;
  }

  .am-action-group{
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

const blankAdd  = { ad_id: "", ad_name: "", password: "" };
const blankEdit = { password: "" };

export default function AdminManagement() {
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
  const [admins,   setAdmins]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searchId, setSearchId] = useState("");

  const [addModal,      setAddModal]      = useState(false);
  const [addForm,       setAddForm]       = useState(blankAdd);
  const [editModal,     setEditModal]     = useState(null);   // ad_id | null
  const [editForm,      setEditForm]      = useState(blankEdit);
  const [deleteTarget,  setDeleteTarget]  = useState(null);   // admin object | null
  const [saving,        setSaving]        = useState(false);

  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const handleLogout = () => { localStorage.clear(); router.push("/"); };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAdmins = async (query = "") => {
    setLoading(true);
    let q = supabase.from("admin").select("*").order("ad_id");
    if (query.trim()) q = q.ilike("ad_id", `%${query.trim()}%`);
    const { data, error } = await q;
    if (!error) setAdmins(data || []);
    else showToast("Failed to load admins", "error");
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleSearch = () => fetchAdmins(searchId);
  const handleSearchKey = (e) => { if (e.key === "Enter") handleSearch(); };

  // ── Add ────────────────────────────────────────────────────────────────────
  const saveAdd = async () => {
    const { ad_id, ad_name, password } = addForm;
    if (!ad_id.trim() || !ad_name.trim() || !password.trim()) {
      showToast("All fields are required", "error"); return;
    }
    setSaving(true);
    const { error } = await supabase.from("admin").insert({ ad_id, ad_name, password });
    setSaving(false);
    if (error) { showToast("Failed to add admin", "error"); return; }
    showToast("Admin added successfully");
    setAddModal(false);
    setAddForm(blankAdd);
    fetchAdmins(searchId);
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const openEdit = (a) => {
    setEditModal(a.ad_id);
    setEditForm({ password: a.password });
  };

  const saveEdit = async () => {
    if (!editForm.password.trim()) {
      showToast("Password cannot be empty", "error"); return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("admin")
      .update({ password: editForm.password })
      .eq("ad_id", editModal);
    setSaving(false);
    if (error) { showToast("Update failed", "error"); return; }
    showToast("Password updated");
    setEditModal(null);
    fetchAdmins(searchId);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("admin")
      .delete()
      .eq("ad_id", deleteTarget.ad_id);
    setSaving(false);
    if (error) { showToast("Delete failed", "error"); return; }
    showToast("Admin removed");
    setDeleteTarget(null);
    fetchAdmins(searchId);
  };

  return (
    <>
      <style>{styles}</style>
      <div className={`am-wrapper ${darkMode ? "dark" : "light"}`}>

        {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
        <nav className="am-nav">
          <div className="am-brand">
            <div className="am-logo">DT</div>
            <div className="am-brand-text">
              <h1>Admin Panel</h1>
              <p>Assessment Portal</p>
            </div>
          </div>
          <div className="am-nav-actions">
            <button className="am-back" onClick={() => router.push("/admin/dashboard")}> 
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "☀" : "☾"}
            </button>
            <button className="am-logout" onClick={handleLogout}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </nav>

        {/* ══ MAIN ════════════════════════════════════════════════════════════ */}
        <main className="am-main">

          {/* Header */}
          <div className="am-header">
            <div className="am-header-label"><span>Admin Management</span></div>
            <h2>Manage <em>Admins</em></h2>
            <p>Search, add, and update admin accounts for the assessment portal.</p>
          </div>

          {/* Search + Add */}
          <div className="am-card">
            <div className="am-card-title">Search</div>
            <div className="am-search-row">
              <div className="am-search-wrap">
                <svg className="am-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="am-search-input"
                  placeholder="Search by Admin ID…"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={handleSearchKey}
                />
              </div>
              <button className="am-search-btn" onClick={handleSearch}>Search</button>
              <button className="am-add-btn" onClick={() => setAddModal(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Admin
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="am-card">
            <div className="am-card-title" style={{ justifyContent: "space-between" }}>
              <span>Admins</span>
              {!loading && (
                <span className="am-count-badge">
                  {admins.length} {admins.length === 1 ? "admin" : "admins"}
                </span>
              )}
            </div>

            {loading ? (
              <div className="am-loading">Loading admins…</div>
            ) : admins.length === 0 ? (
              <div className="am-empty">
                <div className="am-empty-icon">🔍</div>
                No admins found
              </div>
            ) : (
              <div className="am-table-wrap">
                <table className="am-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Admin ID</th>
                      <th>Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((a, i) => (
                      <tr key={a.ad_id}>
                        <td style={{ color: "#AAA", fontSize: 13 }}>{i + 1}</td>
                        <td><span className="am-id-badge">{a.ad_id}</span></td>
                        <td style={{ fontWeight: 500 }}>{a.ad_name}</td>
                        <td>
                          <div className="am-action-group">
                            <button className="am-edit-btn" onClick={() => openEdit(a)}>
                              ✏️ Edit Password
                            </button>
                            <button className="am-delete-btn" onClick={() => setDeleteTarget(a)}>
                              🗑️ Delete
                            </button>
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

      {/* ══ ADD MODAL ═══════════════════════════════════════════════════════════ */}
      {addModal && (
        <div className="am-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setAddModal(false); }}>
          <div className="am-modal">
            <div className="am-modal-header">
              <div className="am-modal-title">Add <em>Admin</em></div>
              <button className="am-modal-close" onClick={() => setAddModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="am-form-group">
              <label>Admin ID</label>
              <input
                type="text"
                placeholder="e.g. ADMIN001"
                value={addForm.ad_id}
                onChange={e => setAddForm(f => ({ ...f, ad_id: e.target.value }))}
              />
            </div>

            <div className="am-form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter admin name"
                value={addForm.ad_name}
                onChange={e => setAddForm(f => ({ ...f, ad_name: e.target.value }))}
              />
            </div>

            <div className="am-form-group">
              <label>Password</label>
              <input
                type="text"
                placeholder="Set a password"
                value={addForm.password}
                onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>

            <div className="am-modal-actions">
              <button className="am-btn-cancel" onClick={() => { setAddModal(false); setAddForm(blankAdd); }}>Cancel</button>
              <button className="am-btn-save" onClick={saveAdd} disabled={saving}>
                {saving ? "Adding…" : "➕ Add Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ EDIT MODAL ══════════════════════════════════════════════════════════ */}
      {editModal && (
        <div className="am-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setEditModal(null); }}>
          <div className="am-modal">
            <div className="am-modal-header">
              <div>
                <div className="am-modal-title">Edit <em>Password</em></div>
                <div className="am-modal-subtitle">Admin ID: {editModal} (read-only)</div>
              </div>
              <button className="am-modal-close" onClick={() => setEditModal(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="am-form-group">
              <label>Admin ID</label>
              <input type="text" value={editModal} disabled />
              <div className="am-form-note">Admin ID cannot be changed</div>
            </div>

            <div className="am-form-group">
              <label>New Password</label>
              <input
                type="text"
                placeholder="Enter new password"
                value={editForm.password}
                onChange={e => setEditForm({ password: e.target.value })}
              />
            </div>

            <div className="am-modal-actions">
              <button className="am-btn-cancel" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="am-btn-save" onClick={saveEdit} disabled={saving}>
                {saving ? "Saving…" : "💾 Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRM ═══════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="am-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="am-confirm-box">
            <h3>Delete Admin?</h3>
            <p>
              This will permanently remove <strong>{deleteTarget.ad_name || deleteTarget.ad_id}</strong>{" "}
              (<span style={{ fontFamily: "monospace", color: "#C97B2E" }}>{deleteTarget.ad_id}</span>) from the system.
              This action cannot be undone.
            </p>
            <div className="am-confirm-actions">
              <button className="am-btn-cancel" style={{ flex: 1 }} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="am-btn-danger" onClick={confirmDelete} disabled={saving}>
                {saving ? "Deleting…" : "🗑️ Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST ════════════════════════════════════════════════════════════════ */}
      <div className={`am-toast ${toast.type} ${toast.show ? "show" : ""}`}>{toast.msg}</div>
    </>
  );
}