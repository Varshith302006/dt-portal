"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useParams } from "next/navigation";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";

import { Badge } from "@/components/ui/badge";

import { supabase } from "@/lib/supabase";

import LoadingScreen from "@/components/exam/loading-screen";

import InstructionsModal from "@/components/exam/instructions-modal";

import ViolationModal from "@/components/exam/violation-modal";

import DevtoolsBlocked from "@/components/exam/devtools-blocked";

const MAX_VIOLATIONS = 3;

export default function ExamPage() {

  const params = useParams();

  const exam_id = params.exam_id;

  const [loading, setLoading] =
    useState(true);

  const [exam, setExam] =
    useState<any>(null);

  const [questions, setQuestions] =
    useState<any[]>([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [timeLeft, setTimeLeft] =
    useState(1800);

  const [started, setStarted] =
    useState(false);

  const [violations, setViolations] =
    useState(0);

  const [showViolation, setShowViolation] =
    useState(false);

  const [devtoolsOpen, setDevtoolsOpen] =
    useState(false);

  const [submittedQuestions, setSubmittedQuestions] =
    useState<number[]>([]);

  const violationReason =
    useRef("");

  // FETCH EXAM
  useEffect(() => {

    fetchExam();

  }, []);

  const fetchExam = async () => {

    const { data: examData } =
      await supabase
        .from("conduct_exam")
        .select(`
          *,
          subjects (
            label
          )
        `)
        .eq("exam_id", exam_id)
        .single();

    setExam(examData);
    setLoading(false);

    const { data: allQuestions } =
      await supabase
        .from("dt_questions")
        .select(`
      *,
      modules (
        label
      )
    `)
        .eq(
          "subject_id",
          examData.subject_id
        );

    // ALL QUESTIONS
    const questions =
      allQuestions || [];

    // GROUP BY MODULE
    const moduleMap: any = {};

    questions.forEach((q: any) => {

      const moduleId =
        q.module_id;

      if (!moduleMap[moduleId]) {

        moduleMap[moduleId] = [];

      }

      moduleMap[moduleId].push(q);

    });

    // RANDOM FUNCTION
    const getRandomQuestions = (
      arr: any[],
      count: number
    ) => {

      return [...arr]
        .sort(() => 0.5 - Math.random())
        .slice(0, count);

    };

    // SORT MODULE IDS
    const { data: orderedModules } =
      await supabase
        .from("modules")
        .select("id, label")
        .eq(
          "subject_id",
          examData?.subject_id || exam?.subject_id
        )
        .order("id", {
          ascending: true,
        });

    const moduleIds =
      (orderedModules || []).map(
        (m: any) => m.id
      );

    let selectedQuestions: any[] = [];

    // DT1
    if (
      examData.exam_name
        ?.toLowerCase()
        .includes("dt1")
    ) {

      // MODULE 1
      selectedQuestions.push(
        ...getRandomQuestions(
          moduleMap[moduleIds[0]] || [],
          4
        )
      );

      // MODULE 2
      selectedQuestions.push(
        ...getRandomQuestions(
          moduleMap[moduleIds[1]] || [],
          4
        )
      );

      // FIRST HALF OF MODULE 3
      const thirdModule =
        moduleMap[moduleIds[2]] || [];

      const firstHalf =
        thirdModule.slice(
          0,
          Math.ceil(
            thirdModule.length / 2
          )
        );

      selectedQuestions.push(
        ...getRandomQuestions(
          firstHalf,
          2
        )
      );

    }

    // DT2
    else if (
      examData.exam_name
        ?.toLowerCase()
        .includes("dt2")
    ) {

      // SECOND HALF OF MODULE 3
      const thirdModule =
        moduleMap[moduleIds[2]] || [];

      const secondHalf =
        thirdModule.slice(
          Math.ceil(
            thirdModule.length / 2
          )
        );

      selectedQuestions.push(
        ...getRandomQuestions(
          secondHalf,
          2
        )
      );

      // MODULE 4
      selectedQuestions.push(
        ...getRandomQuestions(
          moduleMap[moduleIds[3]] || [],
          4
        )
      );

      // MODULE 5
      selectedQuestions.push(
        ...getRandomQuestions(
          moduleMap[moduleIds[4]] || [],
          4
        )
      );

    }

    // FINAL RANDOMIZE
    const questionData =
      selectedQuestions.sort(
        () => 0.5 - Math.random()
      );

    const saved =
      localStorage.getItem(
        `exam-${exam_id}-answers`
      );

    if (saved) {

      setQuestions(
        JSON.parse(saved)
      );

    } else {

      setQuestions(
        (questionData || []).map(
          (q: any) => ({
            ...q,
            userAnswer: "",
            submitCount: 0,
            submitted: false,
            matchPercentage: 0,
            marks: 0,
          })
        )
      );

    }

    setLoading(false);

  };

  const fetchQuestions = async () => {

    if (!exam) return;

    const { data: allQuestions } =
      await supabase
        .from("dt_questions")
        .select(`
        *,
        modules (
          label
        )
      `)
        .eq(
          "subject_id",
          exam.subject_id
        );

    const questions =
      allQuestions || [];

    const moduleMap: any = {};

    questions.forEach((q: any) => {

      const moduleId =
        q.module_id;

      if (!moduleMap[moduleId]) {

        moduleMap[moduleId] = [];

      }

      moduleMap[moduleId].push(q);

    });

    const getRandomQuestions = (
      arr: any[],
      count: number
    ) => {

      return [...arr]
        .sort(() => 0.5 - Math.random())
        .slice(0, count);

    };

    const { data: orderedModules } =
      await supabase
        .from("modules")
        .select("id, label")
        .eq(
          "subject_id",
          exam?.subject_id
        )
        .order("id", {
          ascending: true,
        });

    const moduleIds =
      (orderedModules || []).map(
        (m: any) => m.id
      );

    let selectedQuestions: any[] = [];

    // DT1
    if (
      exam.exam_name
        ?.toLowerCase()
        .includes("1")
    ) {

      selectedQuestions.push(
        ...getRandomQuestions(
          moduleMap[moduleIds[0]] || [],
          4
        )
      );

      selectedQuestions.push(
        ...getRandomQuestions(
          moduleMap[moduleIds[1]] || [],
          4
        )
      );

      const thirdModule =
        moduleMap[moduleIds[2]] || [];

      const firstHalf =
        thirdModule.slice(
          0,
          Math.ceil(
            thirdModule.length / 2
          )
        );

      selectedQuestions.push(
        ...getRandomQuestions(
          firstHalf,
          2
        )
      );

    }

    // DT2
    else {

      const thirdModule =
        moduleMap[moduleIds[2]] || [];

      const secondHalf =
        thirdModule.slice(
          Math.ceil(
            thirdModule.length / 2
          )
        );

      selectedQuestions.push(
        ...getRandomQuestions(
          secondHalf,
          2
        )
      );

      selectedQuestions.push(
        ...getRandomQuestions(
          moduleMap[moduleIds[3]] || [],
          4
        )
      );

      selectedQuestions.push(
        ...getRandomQuestions(
          moduleMap[moduleIds[4]] || [],
          4
        )
      );

    }

    const finalQuestions =
      selectedQuestions.sort(
        () => 0.5 - Math.random()
      );

    setQuestions(

      finalQuestions.map((q: any) => ({
        ...q,
        userAnswer: "",
        submitCount: 0,
        submitted: false,
        matchPercentage: 0,
        marks: 0,
      }))

    );

  };

  // FULLSCREEN
  const enterFullscreen = async () => {

    const element =
      document.documentElement;

    if (
      element.requestFullscreen
    ) {

      await element.requestFullscreen();

    }

  };

  // START EXAM
  const startExam = async () => {

    setLoading(true);

    await enterFullscreen();

    await fetchQuestions();

    setStarted(true);

    setLoading(false);

  };

  // TIMER
  useEffect(() => {

    if (!started) return;

    const interval =
      setInterval(() => {

        setTimeLeft((prev) => {

          if (prev <= 1) {

            clearInterval(interval);

            handleSubmit();

            return 0;

          }

          return prev - 1;

        });

      }, 1000);

    return () =>
      clearInterval(interval);

  }, [started]);

  // TAB SWITCH
  useEffect(() => {

    const handleVisibility =
      () => {

        if (
          document.hidden &&
          started
        ) {

          addViolation(
            "Tab switching detected"
          );

        }

      };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

    };

  }, [started]);

  // FULLSCREEN EXIT
  useEffect(() => {

    const handleFullscreen =
      () => {

        if (
          !document.fullscreenElement &&
          started
        ) {

          addViolation(
            "Exited fullscreen"
          );

        }

      };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreen
    );

    return () => {

      document.removeEventListener(
        "fullscreenchange",
        handleFullscreen
      );

    };

  }, [started]);

  // DEVTOOLS
  useEffect(() => {

    const detectDevtools =
      setInterval(() => {

        const threshold = 160;

        if (
          window.outerWidth -
          window.innerWidth >
          threshold ||

          window.outerHeight -
          window.innerHeight >
          threshold
        ) {

          setDevtoolsOpen(true);

        }

      }, 1000);

    return () =>
      clearInterval(
        detectDevtools
      );

  }, []);

  // COPY PASTE BLOCK
  useEffect(() => {

    const preventCopyPaste =
      (e: Event) => {

        e.preventDefault();

        addViolation(
          "Copy/Paste attempt detected"
        );

      };

    const preventRightClick =
      (e: MouseEvent) => {

        e.preventDefault();

        addViolation(
          "Right click detected"
        );

      };

    document.addEventListener(
      "copy",
      preventCopyPaste
    );

    document.addEventListener(
      "paste",
      preventCopyPaste
    );

    document.addEventListener(
      "cut",
      preventCopyPaste
    );

    document.addEventListener(
      "contextmenu",
      preventRightClick
    );

    return () => {

      document.removeEventListener(
        "copy",
        preventCopyPaste
      );

      document.removeEventListener(
        "paste",
        preventCopyPaste
      );

      document.removeEventListener(
        "cut",
        preventCopyPaste
      );

      document.removeEventListener(
        "contextmenu",
        preventRightClick
      );

    };

  }, [started]);

  // SHORTCUT BLOCK
  useEffect(() => {

    const handleKeys =
      (
        e: KeyboardEvent
      ) => {

        // F12
        if (
          e.key === "F12"
        ) {

          e.preventDefault();

          addViolation(
            "F12 blocked"
          );

        }

        // CTRL SHIFT I
        if (
          e.ctrlKey &&
          e.shiftKey &&
          e.key.toLowerCase() ===
          "i"
        ) {

          e.preventDefault();

          addViolation(
            "Devtools shortcut blocked"
          );

        }

        // CTRL U
        if (
          e.ctrlKey &&
          e.key.toLowerCase() ===
          "u"
        ) {

          e.preventDefault();

          addViolation(
            "View source blocked"
          );

        }

      };

    document.addEventListener(
      "keydown",
      handleKeys
    );

    return () => {

      document.removeEventListener(
        "keydown",
        handleKeys
      );

    };

  }, [started]);

  // PREVENT BACK
  useEffect(() => {

    const preventBack =
      () => {

        window.history.pushState(
          null,
          "",
          window.location.href
        );

      };

    window.history.pushState(
      null,
      "",
      window.location.href
    );

    window.addEventListener(
      "popstate",
      preventBack
    );

    return () => {

      window.removeEventListener(
        "popstate",
        preventBack
      );

    };

  }, []);

  // ADD VIOLATION
  const addViolation = (
    reason: string
  ) => {

    violationReason.current =
      reason;

    setViolations((prev) => {

      const next =
        prev + 1;

      setShowViolation(true);

      if (
        next >=
        MAX_VIOLATIONS
      ) {

        handleSubmit();

      }

      return next;

    });

  };

  // FORMAT TIME
  const formatTime = (
    seconds: number
  ) => {

    const mins =
      Math.floor(
        seconds / 60
      );

    const secs =
      seconds % 60;

    return `${String(
      mins
    ).padStart(
      2,
      "0"
    )}:${String(
      secs
    ).padStart(
      2,
      "0"
    )}`;

  };

  // UPDATE ANSWER
  const updateAnswer = (
    value: string
  ) => {

    const updated =
      [...questions];

    updated[currentIndex]
      .userAnswer =
      value;

    setQuestions(updated);

    localStorage.setItem(
      `exam-${exam_id}-answers`,
      JSON.stringify(updated)
    );

  };

  const STOP_WORDS = new Set([
    "a",
    "an",
    "the",
    "is",
    "it",
    "in",
    "on",
    "of",
    "to",
    "and",
    "or",
    "but",
    "for",
    "with",
    "this",
    "that",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "at",
    "by",
    "from",
    "as",
    "into",
    "about",
    "up",
    "out",
    "than",
    "then",
    "them",
    "they",
    "their",
    "there",
    "these",
    "those",
    "so",
    "if",
    "not",
    "no",
    "we",
    "you",
    "he",
    "she",
    "its",
    "our",
    "your",
    "his",
    "her",
    "my",
    "me",
    "am",
    "i",
  ]);

  const extractKeywords = (
    text: string
  ) => {

    return text
      .toLowerCase()
      .replace(
        /[^a-z0-9\s]/g,
        " "
      )
      .split(/\s+/)
      .filter(
        (w) =>
          w.length > 2 &&
          !STOP_WORDS.has(w)
      );

  };

  const calculateMatchPercentage = (
    correctAnswer: string,
    userAnswer: string
  ) => {

    const correctKeywords =
      extractKeywords(
        correctAnswer
      );

    const userKeywords =
      extractKeywords(
        userAnswer
      );

    if (
      !correctKeywords.length
    ) {

      return 0;

    }

    let matched = 0;

    correctKeywords.forEach(
      (keyword) => {

        if (
          userKeywords.some(
            (u) =>
              u.includes(
                keyword
              ) ||
              keyword.includes(u)
          )
        ) {

          matched++;

        }

      }
    );

    return Math.round(
      (
        matched /
        correctKeywords.length
      ) * 100
    );

  };

  const getMarksFromPercent = (
    pct: number
  ) => {

    if (pct >= 85)
      return 5;

    if (pct >= 65)
      return 4;

    if (pct >= 55)
      return 3;

    if (pct >= 45)
      return 2;

    if (pct >= 30)
      return 1;

    return 0;

  };

  const submitQuestion =
    async () => {

      const updated =
        [...questions];

      const current =
        updated[currentIndex];

      // MAX 3 SUBMITS
      if (
        current.submitCount >= 3
      ) {

        return;

      }

      current.submitCount += 1;

      current.submitted = true;

      const percentage =
        current.userAnswer.trim()
          ? calculateMatchPercentage(
            current.answer,
            current.userAnswer
          )
          : 0;

      const marks =
        current.userAnswer.trim()
          ? getMarksFromPercent(
            percentage
          )
          : 0;

      current.matchPercentage =
        percentage;

      current.marks =
        marks;

      updated[currentIndex] =
        current;

      setQuestions(updated);

      if (
        !submittedQuestions.includes(
          currentIndex
        )
      ) {

        setSubmittedQuestions(
          (prev) => [
            ...prev,
            currentIndex,
          ]
        );

      }

      localStorage.setItem(
        `exam-${exam_id}-answers`,
        JSON.stringify(updated)
      );

    };
  // SUBMIT
  const handleSubmit =
    async () => {

      const student =
        JSON.parse(
          localStorage.getItem(
            "student"
          ) || "{}"
        );

      let totalMarks = 0;

      questions.forEach(
        (q) => {

          totalMarks +=
            q.marks || 0;

        }
      );

      const percentage =
        (
          (
            totalMarks /
            (questions.length * 5)
          ) * 100
        ).toFixed(1);

      await supabase
        .from("exam_results")
        .insert({
          exam_id,
          st_id:
            student.st_id,
          total_marks:
            totalMarks,
          avg_match_pct:
            percentage,
          violation_count:
            violations,
          submitted_at:
            new Date().toISOString(),
        });

      localStorage.removeItem(
        `exam-${exam_id}-answers`
      );

      alert(
        "Exam Submitted Successfully"
      );

      window.location.href =
        "/dashboard/analysis";

    };

  // LOADING
  if (loading) {

    return (
      <LoadingScreen
        message="Loading Exam..."
      />
    );

  }

  // DEVTOOLS BLOCK
  if (
    devtoolsOpen &&
    !started
  ) {

    return (
      <DevtoolsBlocked
        onRetry={() =>
          window.location.reload()
        }
      />
    );

  }

  const currentQuestion =
    questions[currentIndex];

  // SHOW ONLY INSTRUCTIONS SCREEN
  if (!started) {

    return (

      <InstructionsModal
        open={true}
        examName={exam?.exam_name}
        duration={30}
        onStart={startExam}
      />

    );

  }

  return (

    <>

      {/* VIOLATION MODAL */}
      {showViolation && (

        <ViolationModal
          title="Violation Detected"
          message={
            violationReason.current
          }
          count={violations}
          onDismiss={() =>
            setShowViolation(false)
          }
        />

      )}

      <div className="
      h-screen
      bg-background
      flex
      flex-col
      overflow-hidden
    ">

        {/* HEADER */}
        <div className="
        h-16
        border-b
        bg-card
        px-6
        flex
        items-center
        justify-between
        shrink-0
      ">

          {/* LEFT */}
          <div>

            <h1 className="
            text-lg
            font-semibold
            tracking-tight
          ">

              {exam?.exam_name}

            </h1>

            <p className="
            text-xs
            text-muted-foreground
            mt-1
          ">

              {
                exam?.subjects?.label
              }

            </p>

          </div>

          {/* RIGHT */}
          <div className="
          flex
          items-center
          gap-3
        ">

            {/* TIMER */}
            <div className="
            px-4
            h-10
            rounded-xl
            border
            border-indigo-500/30
            bg-indigo-500/10
            text-indigo-500
            flex
            items-center
            justify-center
            text-sm
            font-semibold
            min-w-[90px]
          ">

              {
                formatTime(timeLeft)
              }

            </div>

            {/* VIOLATIONS */}
            <div className="
            px-4
            h-10
            rounded-xl
            border
            border-red-500/30
            bg-red-500/10
            text-red-500
            flex
            items-center
            justify-center
            text-sm
            font-semibold
          ">

              Violations:
              {" "}
              {violations}/3

            </div>

          </div>

        </div>

        {/* BODY */}
        <div className="
        flex
        flex-1
        overflow-hidden
      ">

          {/* LEFT QUESTION PALETTE */}
          <div className="
          w-24
          border-r
          bg-card
          p-3
          flex
          flex-col
          gap-3
          overflow-y-auto
          shrink-0
        ">

            {questions.map(
              (
                question,
                index
              ) => (

                <button
                  key={
                    question.id
                  }
                  onClick={() =>
                    setCurrentIndex(
                      index
                    )
                  }
                  className={`
                  h-16
                  rounded-2xl
                  border
                  text-sm
                  font-semibold
                  transition-all
                  cursor-pointer

                  ${currentIndex ===
                      index
                      ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20"
                      : "hover:border-indigo-500/40"
                    }

                  ${question.submitted
                      ? "bg-green-500 text-white border-green-500"
                      : question.userAnswer
                        ? "border-yellow-500"
                        : ""
                    }
                `}
                >

                  {index + 1}

                </button>

              )
            )}

          </div>

          {/* MAIN CONTENT */}
          <div className="
          flex-1
          overflow-y-auto
          bg-muted/30
        ">

            <div className="
            max-w-7xl
            mx-auto
            p-10
            space-y-8
          ">

              {/* QUESTION HEADER */}
              <div className="
              flex
              items-center
              justify-between
            ">

                <div className="
                text-xs
                uppercase
                tracking-[0.2em]
                text-indigo-500
                font-semibold
              ">

                  Question
                  {" "}
                  {currentIndex + 1}
                  {" "}
                  of
                  {" "}
                  {questions.length}

                </div>

                <div className="
                px-4
                py-2
                rounded-xl
                border
                bg-orange-500/10
                border-orange-500/20
                text-orange-500
                text-sm
                font-medium
              ">

                  {
                    submittedQuestions.length
                  }
                  {" "}
                  /
                  {" "}
                  {questions.length}
                  {" "}
                  Submits

                </div>

              </div>

              {/* QUESTION CARD */}
              <div className="
              rounded-3xl
              border
              bg-card
              p-8
              shadow-sm
              space-y-8
            ">

                {/* QUESTION */}
                <div>

                  <h2 className="
                  text-2xl
                  font-semibold
                  leading-relaxed
                  tracking-tight
                ">

                    {
                      currentQuestion?.question
                    }

                  </h2>

                </div>

                {/* MODULE */}
                <div>

                  <div className="
                  inline-flex
                  items-center
                  rounded-full
                  border
                  px-4
                  py-2
                  text-xs
                  font-medium
                  bg-muted
                ">

                    {
                      currentQuestion
                        ?.modules?.label
                    }

                  </div>

                </div>

                {/* ANSWER */}
                <div className="
                space-y-4
              ">

                  <div className="
                  text-xs
                  uppercase
                  tracking-[0.2em]
                  text-muted-foreground
                  font-semibold
                ">

                    Your Answer

                  </div>

                  <Textarea
                    rows={10}
                    placeholder="
                  Type your answer here...
                  "
                    value={
                      currentQuestion?.userAnswer
                    }
                    onChange={(
                      e
                    ) =>
                      updateAnswer(
                        e.target.value
                      )
                    }
                    className="
                    rounded-2xl
                    resize-none
                    text-base
                    p-5
                    border-border/60
                    focus-visible:ring-indigo-500
                  "
                  />

                </div>

                {/* SUBMIT ANSWER */}
                <div>

                  <Button
                    onClick={
                      submitQuestion
                    }
                    disabled={
                      currentQuestion
                        ?.submitCount >= 3
                    }
                    className="
                      rounded-xl
                      bg-indigo-500
                      hover:bg-indigo-600
                      h-12
                      px-8
                      text-sm
                      font-semibold
                      disabled:opacity-50
                    "
                  >

                    {
                      currentQuestion
                        ?.submitCount >= 3
                        ? "Max Submits Reached"
                        : "Submit Answer"
                    }

                  </Button>

                  {currentQuestion?.submitted && (

                    <div className="
    rounded-2xl
    border
    p-5
    mt-6
    bg-muted/40
    space-y-5
  ">

                      <div className="
      flex
      items-center
      justify-between
    ">

                        <div className="
        text-xs
        uppercase
        tracking-[0.2em]
        text-muted-foreground
        font-semibold
      ">

                          Accuracy

                        </div>

                        <div className="
        text-4xl
        font-bold
        text-indigo-500
      ">

                          {
                            currentQuestion
                              ?.matchPercentage
                          }%

                        </div>

                      </div>

                      <div className="
      h-3
      rounded-full
      bg-muted
      overflow-hidden
    ">

                        <div
                          className="
          h-full
          bg-indigo-500
          transition-all
        "
                          style={{
                            width: `${currentQuestion?.matchPercentage}%`,
                          }}
                        />

                      </div>

                      <div className="
      flex
      justify-between
      text-sm
      text-muted-foreground
      font-medium
    ">

                        <span>

                          Attempts:
                          {" "}
                          {
                            currentQuestion
                              ?.submitCount
                          }
                          /3

                        </span>

                        <span>

                          Marks:
                          {" "}
                          {
                            currentQuestion
                              ?.marks
                          }
                          /5

                        </span>

                      </div>

                    </div>

                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div className="
        h-20
        border-t
        bg-card
        px-8
        flex
        items-center
        justify-between
        shrink-0
      ">

          {/* PREVIOUS */}
          <Button
            variant="outline"
            className="
            rounded-xl
            h-12
            px-6
          "
            disabled={
              currentIndex === 0
            }
            onClick={() =>
              setCurrentIndex(
                currentIndex - 1
              )
            }
          >

            ← Prev

          </Button>

          {/* ATTEMPTED */}
          <div className="
          text-sm
          text-muted-foreground
          font-medium
        ">

            <span className="
            text-indigo-500
            font-semibold
          ">

              {
                submittedQuestions.length
              }

            </span>

            {" "}
            /
            {" "}
            {questions.length}

            {" "}
            Attempted

          </div>

          {/* RIGHT BUTTONS */}
          <div className="
          flex
          items-center
          gap-3
        ">

            <Button
              variant="outline"
              className="
              rounded-xl
              h-12
              px-6
            "
              disabled={
                currentIndex ===
                questions.length - 1
              }
              onClick={() =>
                setCurrentIndex(
                  currentIndex + 1
                )
              }
            >

              Next →

            </Button>

            <Button
              onClick={
                handleSubmit
              }
              className="
              rounded-xl
              bg-indigo-500
              hover:bg-indigo-600
              h-12
              px-8
              font-semibold
            "
            >

              END EXAM

            </Button>

          </div>

        </div>

      </div>

    </>

  );

}