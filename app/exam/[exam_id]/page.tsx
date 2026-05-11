"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { supabase } from "@/lib/supabase";

import LoadingScreen from "@/components/exam/loading-screen";
import InstructionsModal from "@/components/exam/instructions-modal";
import ViolationModal from "@/components/exam/violation-modal";

const MAX_VIOLATIONS = 3;

export default function ExamPage() {
  const params = useParams();
  const exam_id = params.exam_id;

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [started, setStarted] = useState(false);
  const [violations, setViolations] = useState(0);
  const [showViolation, setShowViolation] = useState(false);
  const [
    violationType,
    setViolationType,
  ] = useState("");

  const [submittedQuestions, setSubmittedQuestions] = useState<number[]>([]);

  const [
    showResult,
    setShowResult,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    finalResult,
    setFinalResult,
  ] = useState<any>(null);

  // Countdown state
  const [countdown, setCountdown] = useState<number | null>(null);

  // Key lock during violation
  const lockKeys = useRef(false);

  const violationReason = useRef("");
  const violationsRef = useRef(0);

  // FETCH EXAM
  useEffect(() => {
    fetchExam();
  }, []);

  const fetchExam = async () => {
    const { data: examData } = await supabase
      .from("conduct_exam")
      .select(`*, subjects (label)`)
      .eq("exam_id", exam_id)
      .single();

    setExam(examData);

    /* CHECK IF ALREADY COMPLETED */

    const student =
      JSON.parse(
        localStorage.getItem(
          "student"
        ) || "{}"
      );

    const {
      data: existingResult,
    } = await supabase
      .from(
        "exam_results"
      )
      .select("*")
      .eq(
        "exam_id",
        Number(exam_id)
      )
      .eq(
        "st_id",
        student.st_id
      )
      .maybeSingle();

    if (
      existingResult
    ) {

      setFinalResult({

        totalMarks:
          existingResult.total_marks,

        percentage:
          existingResult.avg_match_pct,

        attempted:
          existingResult.attempted_questions,

        totalQuestions:
          existingResult.total_questions,

      });

      setShowResult(
        true
      );

      setLoading(
        false
      );

      return;

    }

    const { data: allQuestions } = await supabase
      .from("dt_questions")
      .select(`*, modules (label)`)
      .eq("subject_id", examData.subject_id);

    const questions = allQuestions || [];

    const moduleMap: any = {};
    questions.forEach((q: any) => {
      const moduleId = q.module_id;
      if (!moduleMap[moduleId]) moduleMap[moduleId] = [];
      moduleMap[moduleId].push(q);
    });

    const getRandomQuestions = (arr: any[], count: number) =>
      [...arr].sort(() => 0.5 - Math.random()).slice(0, count);

    const { data: orderedModules } = await supabase
      .from("modules")
      .select("id, label")
      .eq("subject_id", examData?.subject_id || exam?.subject_id)
      .order("id", { ascending: true });

    const moduleIds = (orderedModules || []).map((m: any) => m.id);

    let selectedQuestions: any[] = [];

    if (examData.exam_name?.toLowerCase().includes("1")) {
      selectedQuestions.push(...getRandomQuestions(moduleMap[moduleIds[0]] || [], 4));
      selectedQuestions.push(...getRandomQuestions(moduleMap[moduleIds[1]] || [], 4));
      const thirdModule = moduleMap[moduleIds[2]] || [];
      const firstHalf = thirdModule.slice(0, Math.ceil(thirdModule.length / 2));
      selectedQuestions.push(...getRandomQuestions(firstHalf, 2));
    } else if (examData.exam_name?.toLowerCase().includes("2")) {
      const thirdModule = moduleMap[moduleIds[2]] || [];
      const secondHalf = thirdModule.slice(Math.ceil(thirdModule.length / 2));
      selectedQuestions.push(...getRandomQuestions(secondHalf, 2));
      selectedQuestions.push(...getRandomQuestions(moduleMap[moduleIds[3]] || [], 4));
      selectedQuestions.push(...getRandomQuestions(moduleMap[moduleIds[4]] || [], 4));
    }

    const questionData = selectedQuestions.sort(() => 0.5 - Math.random());

    const saved = localStorage.getItem(`exam-${exam_id}-answers`);

    if (saved) {
      setQuestions(JSON.parse(saved));
    } else {
      setQuestions(
        (questionData || []).map((q: any) => ({
          ...q,
          userAnswer: "",
          submitCount: 0,
          submitted: false,
          matchPercentage: 0,
          marks: 0,
        }))
      );
    }

    setLoading(false);
  };

  // FULLSCREEN
  const enterFullscreen =
    async () => {

      try {

        const element =
          document.documentElement;

        if (
          element.requestFullscreen
        ) {

          await element.requestFullscreen();

        }

      }

      catch (
      error
      ) {

        console.error(
          "Fullscreen failed:",
          error
        );

      }

    };

  // COUNTDOWN → START EXAM
  const startExam =
    async () => {

      await enterFullscreen();

      setCountdown(3);

    };

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      // Countdown finished — launch exam
      const launch = async () => {
        setLoading(true);
        setCountdown(null);
        setStarted(true);
        setLoading(false);
      };
      launch();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // TIMER
  useEffect(() => {
    if (!started) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (
          prev <= 1
        ) {

          clearInterval(
            interval
          );

          if (
            !isSubmitting
          ) {

            handleSubmit();

          }

          return 0;

        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [started]);

  // Global key blocking during violation
  useEffect(() => {
    const blockAll = (e: KeyboardEvent) => {
      if (lockKeys.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    };

    document.addEventListener("keydown", blockAll, true);
    document.addEventListener("keyup", blockAll, true);
    document.addEventListener("keypress", blockAll, true);

    return () => {
      document.removeEventListener("keydown", blockAll, true);
      document.removeEventListener("keyup", blockAll, true);
      document.removeEventListener("keypress", blockAll, true);
    };
  }, []);

  // ADD VIOLATION with auto-restore
  const addViolation =
    useCallback(
      (
        reason: string
      ) => {

        violationReason.current =
          reason;

        setViolationType(
          reason
        );

        setViolations(
          (
            prev
          ) => {

            const next =
              prev + 1;

            violationsRef.current =
              next;

            setShowViolation(
              true
            );

            lockKeys.current =
              true;

            if (
              next >=
              MAX_VIOLATIONS
            ) {

              if (
                !isSubmitting
              ) {

                handleSubmit();

              }

            }

            return next;

          }
        );

      },
      []
    );

  const continueExam =
    async () => {

      if (
        violationType ===
        "Exited fullscreen"
      ) {

        await enterFullscreen();

      }

      lockKeys.current =
        false;

      setShowViolation(
        false
      );

    };

  // TAB SWITCH
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && started) {
        addViolation("Tab switching detected");
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [started, addViolation]);

  // FULLSCREEN EXIT
  useEffect(() => {
    const handleFullscreen = () => {
      if (!document.fullscreenElement && started) {
        addViolation("Exited fullscreen");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => document.removeEventListener("fullscreenchange", handleFullscreen);
  }, [started, addViolation]);

  // COPY / PASTE / RIGHT CLICK BLOCK
  useEffect(() => {
    const preventCopyPaste = (e: Event) => {
      e.preventDefault();
      if (started) addViolation("Copy/Paste attempt detected");
    };

    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault();
      if (started) addViolation("Right click detected");
    };

    document.addEventListener("copy", preventCopyPaste);
    document.addEventListener("paste", preventCopyPaste);
    document.addEventListener("cut", preventCopyPaste);
    document.addEventListener("contextmenu", preventRightClick);

    return () => {
      document.removeEventListener("copy", preventCopyPaste);
      document.removeEventListener("paste", preventCopyPaste);
      document.removeEventListener("cut", preventCopyPaste);
      document.removeEventListener("contextmenu", preventRightClick);
    };
  }, [started, addViolation]);

  // SHORTCUT BLOCK (F12, Ctrl+Shift+I, Ctrl+U, Escape)
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      // Already handled by global lock
      if (lockKeys.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (e.key === "F12") {
        e.preventDefault();
        if (started) addViolation("Developer tools shortcut blocked");
      }

      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        if (started) addViolation("Developer tools shortcut blocked");
      }

      if (e.ctrlKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
        if (started) addViolation("View source blocked");
      }
    };

    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [started, addViolation]);

  // WINDOW FOCUS LOSS
  useEffect(() => {
    const handleBlur = () => {
      if (started) addViolation("Window focus lost");
    };

    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [started, addViolation]);

  // PREVENT BACK
  useEffect(() => {
    const preventBack = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", preventBack);
    return () => window.removeEventListener("popstate", preventBack);
  }, []);

  // FORMAT TIME
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // UPDATE ANSWER
  const updateAnswer = (value: string) => {
    const updated = [...questions];
    updated[currentIndex].userAnswer = value;
    setQuestions(updated);
    localStorage.setItem(`exam-${exam_id}-answers`, JSON.stringify(updated));
  };

  const STOP_WORDS = new Set([
    "a", "an", "the", "is", "it", "in", "on", "of", "to", "and", "or", "but", "for", "with",
    "this", "that", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do",
    "does", "did", "will", "would", "could", "should", "may", "might", "can", "at", "by",
    "from", "as", "into", "about", "up", "out", "than", "then", "them", "they", "their",
    "there", "these", "those", "so", "if", "not", "no", "we", "you", "he", "she", "its",
    "our", "your", "his", "her", "my", "me", "am", "i",
  ]);

  const extractKeywords = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const calculateMatchPercentage = (correctAnswer: string, userAnswer: string) => {
    const correctKeywords = extractKeywords(correctAnswer);
    const userKeywords = extractKeywords(userAnswer);
    if (!correctKeywords.length) return 0;

    let matched = 0;
    correctKeywords.forEach((keyword) => {
      if (userKeywords.some((u) => u.includes(keyword) || keyword.includes(u))) {
        matched++;
      }
    });

    return Math.round((matched / correctKeywords.length) * 100);
  };

  const getMarksFromPercent = (pct: number) => {
    if (pct >= 85) return 5;
    if (pct >= 65) return 4;
    if (pct >= 55) return 3;
    if (pct >= 45) return 2;
    if (pct >= 30) return 1;
    return 0;
  };

  const submitQuestion = async () => {
    const updated = [...questions];
    const current = updated[currentIndex];

    if (current.submitCount >= 3) return;

    current.submitCount += 1;
    current.submitted = true;

    const percentage = current.userAnswer.trim()
      ? calculateMatchPercentage(current.answer, current.userAnswer)
      : 0;

    const marks = current.userAnswer.trim() ? getMarksFromPercent(percentage) : 0;

    current.matchPercentage = percentage;
    current.marks = marks;
    updated[currentIndex] = current;

    setQuestions(updated);

    if (!submittedQuestions.includes(currentIndex)) {
      setSubmittedQuestions((prev) => [...prev, currentIndex]);
    }

    localStorage.setItem(`exam-${exam_id}-answers`, JSON.stringify(updated));
  };

  // SUBMIT EXAM
  const handleSubmit =
    async () => {

      if (
        isSubmitting
      ) return;

      setIsSubmitting(
        true
      );

      const student =
        JSON.parse(
          localStorage.getItem(
            "student"
          ) || "{}"
        );

      /* TOTAL RAW MARKS */

      let rawMarks = 0;

      questions.forEach(
        (
          q
        ) => {

          rawMarks +=
            q.marks || 0;

        }
      );

      /* CONVERT TO 5 MARK SCALE */

      /* AVERAGE MARK */

      const averageMarks =
        rawMarks /
        questions.length;

      /* ROUND TO NEAREST INTEGER */

      const totalMarks =
        averageMarks >=
          Math.floor(
            averageMarks
          ) + 0.5

          ? Math.ceil(
            averageMarks
          )

          : Math.floor(
            averageMarks
          );

      const percentage =
        (
          (
            totalMarks / 5
          ) * 100
        ).toFixed(1);

      const attempted =
        questions.filter(
          (
            q
          ) =>
            q.userAnswer?.trim()
        ).length;

      /* SAVE RESULT */

      const {
        data: existingResult,
      } = await supabase
        .from(
          "exam_results"
        )
        .select("id")
        .eq(
          "exam_id",
          Number(exam_id)
        )
        .eq(
          "st_id",
          student.st_id
        )
        .maybeSingle();

      if (
        existingResult
      ) {

        setShowResult(
          true
        );

        return;

      }
      const {
        data,
        error,
      } = await supabase
        .from(
          "exam_results"
        )
        .insert([
          {

            exam_id:
              Number(exam_id),

            st_id:
              student.st_id,

            total_marks:
              totalMarks,

            final_grade:
              totalMarks,

            avg_match_pct:
              Math.round(
                Number(
                  percentage
                )
              ),

            attempted_questions:
              attempted,

            total_questions:
              questions.length,

            violations_count:
              violationsRef.current,

            submitted_at:
              new Date()
                .toISOString(),

          }
        ])
        .select();

      if (error) {

        console.error(
          "SUPABASE ERROR:",
          error
        );

        return;

      }

      console.log(
        "INSERTED:",
        data
      );

      localStorage.removeItem(
        `exam-${exam_id}-answers`
      );

      /* STORE RESULT */

      setFinalResult({

        totalMarks,

        percentage,

        attempted,

        totalQuestions:
          questions.length,

      });

      /* SHOW RESULT PAGE */

      setShowResult(
        true
      );

    };

  // LOADING
  if (loading) {
    return <LoadingScreen message="Loading Exam..." />;
  }

  // INSTRUCTIONS SCREEN
  if (!started && countdown === null) {
    return (
      <InstructionsModal
        examName={exam?.exam_name}
        duration={30}
        onStart={startExam}
      />
    );
  }

  // COUNTDOWN SCREEN
  if (countdown !== null) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <style>{`
          @keyframes countdown-pulse {
            0% { transform: scale(0.6); opacity: 0; }
            30% { transform: scale(1.08); opacity: 1; }
            70% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0.9); opacity: 0; }
          }
          @keyframes ring-expand {
            0% { transform: scale(0.5); opacity: 0.8; }
            100% { transform: scale(2.5); opacity: 0; }
          }
          .countdown-number {
            animation: countdown-pulse 1s ease-in-out forwards;
            font-family: 'Georgia', serif;
            font-size: clamp(120px, 22vw, 220px);
            font-weight: 700;
            color: #fff;
            line-height: 1;
            letter-spacing: -0.04em;
          }
          .countdown-ring {
            position: absolute;
            width: 260px;
            height: 260px;
            border: 2px solid rgba(99,102,241,0.7);
            border-radius: 50%;
            animation: ring-expand 1s ease-out forwards;
          }
          .countdown-label {
            margin-top: 24px;
            font-size: 13px;
            letter-spacing: 0.3em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.35);
            font-family: system-ui, sans-serif;
          }
        `}</style>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="countdown-ring" key={`ring-${countdown}`} />
          <span className="countdown-number" key={`num-${countdown}`}>
            {countdown}
          </span>
        </div>
        <p className="countdown-label">Preparing secure environment</p>
      </div>
    );
  }

  /* RESULT SCREEN */

  if (
    showResult
  ) {

    return (

      <div className="
      min-h-screen
      bg-background
      flex
      items-center
      justify-center
      p-6
    ">

        <div className="
        w-full
        max-w-md
        rounded-[36px]
        border
        bg-card
        p-10
        shadow-2xl
        text-center
        space-y-8
      ">

          {/* HEADER */}

          <div className="
          space-y-3
        ">

            <h1 className="
            text-4xl
            font-black
            tracking-tight
          ">

              Exam Complete!

            </h1>

            <p className="
            text-xs
            uppercase
            tracking-[0.3em]
            text-muted-foreground
          ">

              {
                exam?.exam_name
              }

            </p>

          </div>

          {/* SCORE */}

          <div className="
          flex
          justify-center
        ">

            <div className="
            h-44
            w-44
            rounded-full
            border-[10px]
            border-indigo-500/20
            flex
            flex-col
            items-center
            justify-center
          ">

              <div className="
              text-5xl
              font-black
              text-indigo-500
            ">

                {
                  finalResult
                    ?.totalMarks
                }

              </div>

              <div className="
              text-2xl
              font-bold
              text-indigo-500
            ">

                /
                {
                  5
                }

              </div>

              <div className="
              text-xs
              uppercase
              tracking-[0.2em]
              text-muted-foreground
              mt-2
            ">

                Grade

              </div>

            </div>

          </div>

          {/* STATS */}

          <div className="
          grid
          grid-cols-3
          gap-4
        ">

            <div className="
            rounded-2xl
            bg-indigo-500/10
            p-4
            space-y-2
          ">

              <div className="
              text-2xl
              font-black
              text-indigo-500
            ">

                {
                  finalResult
                    ?.percentage
                }%

              </div>

              <div className="
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-muted-foreground
            ">

                Avg Match

              </div>

            </div>

            <div className="
            rounded-2xl
            bg-indigo-500/10
            p-4
            space-y-2
          ">

              <div className="
              text-2xl
              font-black
              text-indigo-500
            ">

                {
                  finalResult
                    ?.attempted
                }/
                {
                  finalResult
                    ?.totalQuestions
                }

              </div>

              <div className="
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-muted-foreground
            ">

                Attempted

              </div>

            </div>

            <div className="
            rounded-2xl
            bg-indigo-500/10
            p-4
            space-y-2
          ">

              <div className="
              text-2xl
              font-black
              text-indigo-500
            ">

                {
                  finalResult
                    ?.totalMarks
                }

              </div>

              <div className="
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-muted-foreground
            ">

                Total Marks

              </div>

            </div>

          </div>

          {/* SUCCESS */}

          <div className="
          rounded-2xl
          border
          border-green-500/30
          bg-green-500/10
          px-4
          py-3
          text-green-500
          font-medium
        ">

            Result saved successfully

          </div>

          {/* BUTTON */}

          <Button
            onClick={() => {

              window.location.href =
                "/dashboard/analysis";

            }}
            className="
            w-full
            h-14
            rounded-2xl
            bg-indigo-500
            hover:bg-indigo-600
            text-base
            font-semibold
          "
          >

            ← Back to Dashboard

          </Button>

        </div>

      </div>

    );

  }

  const currentQuestion = questions[currentIndex];

  return (
    <>
      {/* VIOLATION MODAL */}
      {showViolation && (
        <ViolationModal
          title="Violation Detected"
          message={violationReason.current}
          count={violations}
          onDismiss={
            continueExam
          }
        />
      )}

      <div className="h-screen bg-background flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="h-16 border-b bg-card px-6 flex items-center justify-between shrink-0">
          {/* LEFT */}
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{exam?.exam_name}</h1>
            <p className="text-xs text-muted-foreground mt-1">{exam?.subjects?.label}</p>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            {/* TIMER */}
            <div className="px-4 h-10 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-sm font-semibold min-w-[90px]">
              {formatTime(timeLeft)}
            </div>

            {/* VIOLATIONS */}
            <div className="px-4 h-10 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 flex items-center justify-center text-sm font-semibold">
              Violations: {violations}/3
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT QUESTION PALETTE */}
          <div className="w-24 border-r bg-card p-3 flex flex-col gap-3 overflow-y-auto shrink-0">
            {questions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => setCurrentIndex(index)}
                className={`
                  h-16 rounded-2xl border text-sm font-semibold transition-all cursor-pointer
                  ${currentIndex === index
                    ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20"
                    : "hover:border-indigo-500/40"}
                  ${question.submitted
                    ? "bg-green-500 text-white border-green-500"
                    : question.userAnswer
                      ? "border-yellow-500"
                      : ""}
                `}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 overflow-y-auto bg-muted/30">
            <div className="max-w-7xl mx-auto p-10 space-y-8">
              {/* QUESTION HEADER */}
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.2em] text-indigo-500 font-semibold">
                  Question {currentIndex + 1} of {questions.length}
                </div>
                <div className="px-4 py-2 rounded-xl border bg-orange-500/10 border-orange-500/20 text-orange-500 text-sm font-medium">
                  {submittedQuestions.length} / {questions.length} Attempted
                </div>
              </div>

              {/* QUESTION CARD */}
              <div className="rounded-3xl border bg-card p-8 shadow-sm space-y-8">
                {/* QUESTION */}
                <div>
                  <h2 className="text-2xl font-semibold leading-relaxed tracking-tight"
                    style={{
                      fontSize: "25px",
                      lineHeight: "1.0",
                      fontWeight: "200",
                    }}
                  >
                    {currentQuestion?.question}
                  </h2>
                </div>

                {/* MODULE */}
                <div>
                  <div className="inline-flex items-center rounded-full border px-4 py-2 text-xs font-medium bg-muted">
                    {currentQuestion?.modules?.label}
                  </div>
                </div>

                {/* ANSWER */}
                <div className="space-y-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                    Your Answer
                  </div>
                  <Textarea
                    rows={10}
                    placeholder="Type your answer here..."
                    value={currentQuestion?.userAnswer}
                    onChange={(e) => updateAnswer(e.target.value)}
                    style={{
                      fontSize: "20px",
                      lineHeight: "1.0",
                      fontWeight: "200",
                    }}
                    className="
                      rounded-2xl
                      resize-none
                      text-2xl
                      leading-relaxed
                      p-5
                      border-border/60
                      focus-visible:ring-indigo-500
                      min-h-[200px]
                    "
                  />
                </div>

                {/* SUBMIT ANSWER */}
                <div>
                  <Button
                    onClick={submitQuestion}
                    disabled={currentQuestion?.submitCount >= 3}
                    className="rounded-xl bg-indigo-500 hover:bg-indigo-600 h-12 px-8 text-sm font-semibold disabled:opacity-50"
                  >
                    {currentQuestion?.submitCount >= 3 ? "Max Submits Reached" : "Submit Answer"}
                  </Button>

                  {currentQuestion?.submitted && (
                    <div className="rounded-2xl border p-5 mt-6 bg-muted/40 space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                          Accuracy
                        </div>
                        <div className="text-4xl font-bold text-indigo-500">
                          {currentQuestion?.matchPercentage}%
                        </div>
                      </div>

                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 transition-all"
                          style={{ width: `${currentQuestion?.matchPercentage}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-sm text-muted-foreground font-medium">
                        <span>Attempts: {currentQuestion?.submitCount}/3</span>
                        <span>Marks: {currentQuestion?.marks}/5</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="h-20 border-t bg-card px-8 flex items-center justify-between shrink-0">
          <Button
            variant="outline"
            className="rounded-xl h-12 px-6"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
          >
            ← Prev
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-xl h-12 px-6"
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex(currentIndex + 1)}
            >
              Next →
            </Button>

            <Button
              onClick={handleSubmit}
              className="rounded-xl bg-indigo-500 hover:bg-indigo-600 h-12 px-8 font-semibold"
            >
              END EXAM
            </Button>
          </div>
        </div>
      </div>
    </>
  );
} 