'use client'

import React, {
    useEffect,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const styles = `
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
}

.dark-mode{
  --bg:#000000;
  --card:#050505;
  --border:#222222;
  --input-bg:#050505;
  --heading:#ffffff;
  --body:#94a3b8;
  --placeholder:#6b7280;
}

body{
  background:var(--bg);
  font-family:'Chakra Petch',sans-serif;
  color:var(--heading);
}

/* PAGE — now full width, content centred */
.ce-page{
  min-height:100vh;
  background:var(--bg);
  display:flex;
  justify-content:center;
  padding:38px 42px;
}

.ce-inner{
  width:100%;
  max-width:820px;
  display:flex;
  flex-direction:column;
  gap:22px;
}

/* TOPBAR */
.ce-topbar{
  display:flex;
  align-items:center;
  justify-content:space-between;
}

.ce-back{
  border:none;
  background:none;
  display:flex;
  align-items:center;
  gap:6px;
  color:var(--body);
  cursor:pointer;
  font-size:14px;
  font-weight:600;
  font-family:'Chakra Petch',sans-serif;
}

.ce-back:hover{
  color:var(--heading);
}

.ce-theme-btn{
  width:38px;
  height:38px;
  border-radius:10px;
  border:1px solid var(--border);
  background:var(--card);
  color:var(--body);
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
}

/* TITLE */
.ce-title{
  display:flex;
  flex-direction:column;
  gap:10px;
}

.ce-title h4{
  font-size:40px;
  font-weight:800;
  line-height:1;
  letter-spacing:-2px;
  color:var(--heading);
}

.ce-title p{
  font-size:16px;
  line-height:1.7;
  color:var(--body);
}

/* CARD */
.ce-card{
  width:100%;
  background:var(--card);
  border:1px solid var(--border);
  border-radius:20px;
  padding:32px;
  display:flex;
  flex-direction:column;
  gap:24px;
}

.ce-card-label{
  font-size:12px;
  font-weight:700;
  color:var(--body);
  text-transform:uppercase;
  letter-spacing:.08em;
  border-bottom:1px solid var(--border);
  padding-bottom:14px;
}

/* ROW */
.ce-row{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:18px;
}

/* FIELD */
.ce-field{
  display:flex;
  flex-direction:column;
  gap:8px;
}

.ce-field label{
  display:flex;
  align-items:center;
  gap:6px;
  font-size:14px;
  font-weight:600;
  color:var(--heading);
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

/* INPUT */
.ce-input,
.ce-select{
  width:100%;
  height:50px;
  border-radius:12px;
  border:1px solid var(--border);
  background:var(--input-bg);
  color:var(--heading);
  padding:0 14px;
  outline:none;
  font-size:14px;
  font-family:'Chakra Petch',sans-serif;
  transition:.15s ease;
}

.ce-input::placeholder{
  color:var(--placeholder);
}

.ce-input:focus,
.ce-select:focus{
  border-color:var(--primary);
  box-shadow:0 0 0 3px var(--primary-ring);
}

.ce-select{
  appearance:none;
  cursor:pointer;
  padding-right:38px;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat:no-repeat;
  background-position:right 14px center;
}

.ce-select:disabled{
  opacity:.5;
  cursor:not-allowed;
}

/* SUBJECT */
.ce-subj-wrap{
  position:relative;
  width:100%;
}

.ce-subj-trigger{
  width:100%;
  min-height:50px;
  border:1px solid var(--border);
  border-radius:12px;
  background:var(--input-bg);
  color:var(--placeholder);
  padding:0 14px;
  display:flex;
  align-items:center;
  cursor:pointer;
  font-size:14px;
}

.ce-subj-trigger.has-value{
  color:var(--heading);
}

.ce-subj-trigger.is-open{
  border-color:var(--primary);
  box-shadow:0 0 0 3px var(--primary-ring);
}

.ce-subj-dropdown{
  position:absolute;
  top:calc(100% + 6px);
  left:0;
  width:100%;
  background:var(--card);
  border:1px solid var(--border);
  border-radius:12px;
  overflow-y:auto;
  max-height:220px;
  z-index:9999;
}

.ce-subj-item{
  width:100%;
  display:flex;
  align-items:center;
  gap:10px;
  padding:12px 14px;
  font-size:14px;
  cursor:pointer;
  color:var(--heading);
}

.ce-subj-item:hover{
  background:rgba(99,102,241,.08);
}

.ce-subj-item input{
  width:15px;
  height:15px;
  accent-color:var(--primary);
}

/* CHIPS */
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
  display:flex;
  align-items:center;
}

/* BUTTON */
.ce-btn{
  width:100%;
  height:54px;
  border:none;
  border-radius:14px;
  background:#6366f1;
  color:#ffffff;
  font-size:15px;
  font-weight:700;
  font-family:'Chakra Petch',sans-serif;
  cursor:pointer;
}

.ce-btn:hover{
  background:#4f46e5;
}

.ce-btn:disabled{
  opacity:.6;
  cursor:not-allowed;
}

/* TOAST */
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

/* MOBILE */
@media(max-width:768px){

  .ce-page{
    padding:22px 16px;
  }

  .ce-title h1{
    font-size:42px;
  }

  .ce-card{
    padding:22px;
  }

  .ce-row{
    grid-template-columns:1fr;
  }

}
`;

export default function CreateExam() {

    const router = useRouter();

    const [dark, setDark] = useState(false);

    const [examName, setExamName] = useState("");
    const [sem, setSem] = useState("");
    const [branch, setBranch] = useState("");
    const [section, setSection] = useState("");
    const [subjects, setSubjects] =
        useState<string[]>([]);
    const [startTime, setStartTime] = useState("");
    const [duration, setDuration] = useState("");

    const [loading, setLoading] = useState(false);

    const [toast, setToast] =
        useState<{
            show: boolean;
            msg: string;
            type: string;
        }>({
            show: false,
            msg: "",
            type: "success"
        });

    const [semList, setSemList] =
        useState<any[]>([]);
    const [branchList, setBranchList] =
        useState<any[]>([]);
    const [subjectList, setSubjectList] =
        useState<any[]>([]);

    const [showSubjects, setShowSubjects] = useState(false);

    const [user, setUser] =
        useState<any>(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem("ce-theme");
        if (savedTheme === "dark") setDark(true);
    }, []);

    const toggleTheme = () => {
        setDark(prev => {
            const next = !prev;
            localStorage.setItem("ce-theme", next ? "dark" : "light");
            return next;
        });
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("admin");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push("/");
        }
    }, [router]);

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
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: semData, error: semError } = await supabase.from("semesters").select("*");
            const { data: branchData, error: branchError } = await supabase.from("branches").select("*");
            const { data: subjectData, error: subjectError } = await supabase.from("subjects").select("*");

            if (semError) console.log(semError);
            if (branchError) console.log(branchError);
            if (subjectError) console.log(subjectError);

            setSemList(semData || []);
            setBranchList(branchData || []);
            setSubjectList(subjectData || []);
        } catch (err: any) {
            console.log(err);
        }
    };

    const showToast = (
        msg: string,
        type: string
    ) => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    const removeSubject = (
        id: string,
        e: React.MouseEvent
    ) => {
        e.stopPropagation();
        setSubjects(subjects.filter(s => s !== id));
    };

    const handleCreate = async () => {
        if (!examName || !sem || !branch || !section || !subjects.length || !startTime || !duration) {
            showToast("Please fill all fields", "error");
            return;
        }

        setLoading(true);

        try {
            const endTime = new Date(
                new Date(startTime).getTime() + parseInt(duration) * 60000
            ).toISOString();

            const { data: students, error: stuError } = await supabase
                .from("student")
                .select("st_id")
                .eq("sem_id", parseInt(sem))
                .eq("branch_id", parseInt(branch))
                .eq("section", section);

            if (stuError) {
                showToast(stuError.message, "error");
                setLoading(false);
                return;
            }

            if (!students?.length) {
                showToast("No matching students found", "error");
                setLoading(false);
                return;
            }

            for (let sub of subjects) {
                const { data: examData, error: examError } = await supabase
                    .from("conduct_exam")
                    .insert([{
                        exam_name: examName,
                        sem_id: parseInt(sem),
                        branch_id: parseInt(branch),
                        section: section,
                        subject_id: parseInt(sub),
                        start_time: new Date(startTime).toISOString(),
                        end_time: endTime,
                        duration_minutes: parseInt(duration),
                        ad_id:
                            user?.ad_id ||
                            user?.id ||
                            null,
                    }])
                    .select()
                    .single();

                if (examError) {
                    showToast(examError.message, "error");
                    setLoading(false);
                    return;
                }

                const generateKey = () =>
                    Math.random().toString(36).substring(2, 8).toUpperCase();

                const keyRows = students.map((s: any) => ({
                    exam_id: examData.exam_id,
                    st_id: s.st_id,
                    exam_key: generateKey(),
                    is_used: false,
                }));

                const { error: keyError } = await supabase.from("exam_keys").insert(keyRows);

                if (keyError) {
                    showToast(keyError.message, "error");
                    setLoading(false);
                    return;
                }
            }

            showToast(`Exams created successfully`, "success");
            setLoading(false);
            setTimeout(() => router.push("/admin/dashboard"), 1500);

        } catch (err: any) {
            showToast("Something went wrong", "error");
            setLoading(false);
        }
    };

    const selectedSubjectNames =
        subjectList.filter((s: any) =>
            subjects.includes(String(s.subject_id || s.id))
        );

    return (
        <>
            <style>{styles}</style>

            <div className={`ce-page ${dark ? "dark-mode" : ""}`}>

                <div className="ce-inner">

                    <div className="ce-topbar">

                        <button
                            className="ce-back"
                            onClick={() => router.push("/admin/dashboard")}
                        >
                            ← Back to Dashboard
                        </button>

                        <button className="ce-theme-btn" onClick={toggleTheme}>
                            {dark ? "☀" : "☾"}
                        </button>

                    </div>

                    <div className="ce-title">
                        <h4>Create Exam</h4>
                        <p>
                            Configure exam details below.
                            Students will be matched by semester, branch and section.
                        </p>
                    </div>

                    <div className="ce-card">

                        <div className="ce-card-label">EXAM DETAILS</div>

                        <div className="ce-field">
                            <label>
                                <span className="ce-dot" />
                                Exam Name
                                <span className="ce-required">*</span>
                            </label>
                            <select
                                className="ce-select"
                                value={examName}
                                onChange={(e: any) => setExamName(e.target.value)}
                            >
                                <option value="">Select Exam</option>
                                <option value="DT 1">DT 1</option>
                                <option value="DT 2">DT 2</option>
                            </select>
                        </div>

                        <div className="ce-row">

                            <div className="ce-field">
                                <label>
                                    <span className="ce-dot" />
                                    Semester
                                    <span className="ce-required">*</span>
                                </label>
                                <select
                                    className="ce-select"
                                    value={sem}
                                    onChange={(e: any) => {
                                        setSem(e.target.value);
                                        setBranch("");
                                        setSubjects([]);
                                    }}
                                >
                                    <option value="">Select Semester</option>
                                    {semList.map((s: any) => (
                                        <option key={s.sem_id || s.id} value={s.sem_id || s.id}>
                                            {s.sem_name || s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="ce-field">
                                <label>
                                    <span className="ce-dot" />
                                    Branch
                                    <span className="ce-required">*</span>
                                </label>
                                <select
                                    className="ce-select"
                                    value={branch}
                                    disabled={!sem}
                                    onChange={(e: any) => {
                                        setBranch(e.target.value);
                                        setSubjects([]);
                                    }}
                                >
                                    <option value="">Select Branch</option>
                                    {branchList
                                        .filter((b: any) => (b.sem_id || b.semester_id) === parseInt(sem))
                                        .map((b) => (
                                            <option key={b.branch_id || b.id} value={b.branch_id || b.id}>
                                                {b.branch_name || b.label}
                                            </option>
                                        ))}
                                </select>
                            </div>

                        </div>

                        <div className="ce-row">

                            <div className="ce-field ce-subject-field">
                                <label>
                                    <span className="ce-dot" />
                                    Subjects
                                    <span className="ce-required">*</span>
                                </label>

                                <div className="ce-subj-wrap">
                                    <div
                                        className={[
                                            "ce-subj-trigger",
                                            subjects.length ? "has-value" : "",
                                            showSubjects ? "is-open" : "",
                                        ].join(" ")}
                                        onClick={() => branch && setShowSubjects(!showSubjects)}
                                    >
                                        {subjects.length ? `${subjects.length} selected` : "Select Subjects"}
                                    </div>

                                    {showSubjects && (
                                        <div className="ce-subj-dropdown">
                                            {subjectList
                                                .filter(
                                                    (s) =>
                                                        (s.branch_id || s.br_id) === parseInt(branch) &&
                                                        (s.sem_id || s.semester_id) === parseInt(sem)
                                                )
                                                .map((s: any) => (
                                                    <label key={s.subject_id || s.id} className="ce-subj-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={subjects.includes(String(s.subject_id || s.id))}
                                                            onChange={(e: any) => {
                                                                const id = String(s.subject_id || s.id);
                                                                if (e.target.checked) {
                                                                    setSubjects([...subjects, id]);
                                                                } else {
                                                                    setSubjects(subjects.filter(sub => sub !== id));
                                                                }
                                                            }}
                                                        />
                                                        {s.subject_name || s.label}
                                                    </label>
                                                ))}
                                        </div>
                                    )}
                                </div>

                                {selectedSubjectNames.length > 0 && (
                                    <div className="ce-chips">
                                        {selectedSubjectNames.map((s: any) => (
                                            <div key={s.subject_id || s.id} className="ce-chip">
                                                {s.subject_name || s.label}
                                                <button
                                                    onClick={(e: any) =>
                                                        removeSubject(String(s.subject_id || s.id), e)
                                                    }
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="ce-field">
                                <label>
                                    <span className="ce-dot" />
                                    Section
                                    <span className="ce-required">*</span>
                                </label>
                                <input
                                    className="ce-input"
                                    placeholder="e.g. A or 1"
                                    value={section}
                                    onChange={(e: any) => setSection(e.target.value)}
                                />
                            </div>

                        </div>

                        <div className="ce-row">

                            <div className="ce-field">
                                <label>
                                    <span className="ce-dot" />
                                    Duration (mins)
                                    <span className="ce-required">*</span>
                                </label>
                                <input
                                    className="ce-input"
                                    type="number"
                                    placeholder="e.g. 60"
                                    value={duration}
                                    onChange={(e: any) => setDuration(e.target.value)}
                                />
                            </div>

                            <div className="ce-field">
                                <label>
                                    <span className="ce-dot" />
                                    Start Time
                                    <span className="ce-required">*</span>
                                </label>
                                <input
                                    className="ce-input"
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e: any) => setStartTime(e.target.value)}
                                />
                            </div>

                        </div>

                        <button
                            className="ce-btn"
                            onClick={handleCreate}
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Exam →"}
                        </button>

                    </div>

                </div>

            </div>

            {toast.show && (
                <div className={`ce-toast ${toast.type}`}>{toast.msg}</div>
            )}

        </>
    );
}