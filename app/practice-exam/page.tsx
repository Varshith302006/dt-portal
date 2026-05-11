"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Suspense,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { supabase } from "@/lib/supabase";

import LoadingScreen from "@/components/exam/loading-screen";
import InstructionsModal from "@/components/exam/instructions-modal";
import ViolationModal from "@/components/exam/violation-modal";

import {
  Button,
} from "@/components/ui/button";

import {
  Textarea,
} from "@/components/ui/textarea";

const MAX_VIOLATIONS = 3;

type SecurityCheck = {
  label: string;
  ok: boolean;
};

function PracticeExamContent() {

  const router =
    useRouter();

  const params =
    useSearchParams();

  const subject_id =
    params.get("subject");

  const module_id =
    params.get("module");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    exam,
    setExam,
  ] = useState<any>(null);

  const [
    questions,
    setQuestions,
  ] = useState<any[]>([]);

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    timeLeft,
    setTimeLeft,
  ] = useState(1800);

  const [
    started,
    setStarted,
  ] = useState(false);

  const [
    countdown,
    setCountdown,
  ] = useState<number | null>(null);

  const [
    submittedQuestions,
    setSubmittedQuestions,
  ] = useState<number[]>([]);

  const [
    violations,
    setViolations,
  ] = useState(0);

  const [
    showViolation,
    setShowViolation,
  ] = useState(false);

  const [
    violationType,
    setViolationType,
  ] = useState("");

  const [
    showResult,
    setShowResult,
  ] = useState(false);

  const [
    finalResult,
    setFinalResult,
  ] = useState<any>(null);

  const [
    checks,
    setChecks,
  ] = useState<SecurityCheck[]>([]);

  const violationsRef =
    useRef(0);

  const violationReason =
    useRef("");

  const lockKeys =
    useRef(false);

  useEffect(() => {

    fetchExam();

  }, []);

  const fetchExam =
    async () => {

      const {
        data: moduleData,
      } = await supabase
        .from(
          "modules"
        )
        .select(`
          *,
          subjects (
            label
          )
        `)
        .eq(
          "id",
          module_id
        )
        .single();

      setExam({

        exam_name:
          "Practice Exam",

        duration_minutes:
          30,

        subjects:
          moduleData?.subjects,

        module:
          moduleData,

      });

      const {
        data,
      } = await supabase
        .from(
          "dt_questions"
        )
        .select(`
          *,
          modules (
            label
          )
        `)
        .eq(
          "subject_id",
          subject_id
        )
        .eq(
          "module_id",
          module_id
        );

      const shuffled =
        (data || [])
          .sort(
            () =>
              0.5 -
              Math.random()
          )
          .slice(0, 10);

      setQuestions(

        shuffled.map(
          (
            q: any
          ) => ({
            ...q,
            userAnswer: "",
            submitCount: 0,
            submitted: false,
            matchPercentage: 0,
            marks: 0,
          })
        )

      );

      setChecks([

        {
          label:
            "Browser Support",
          ok: true,
        },

        {
          label:
            "Fullscreen Access",
          ok: true,
        },

        {
          label:
            "Internet Connection",
          ok: true,
        },

        {
          label:
            "Screen Resolution",
          ok: true,
        },

        {
          label:
            "Devtools Tools",
          ok: true,
        },

        {
          label:
            "Window Focus",
          ok: true,
        },

      ]);

      setLoading(false);

    };

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

  const startExam =
    async () => {

      await enterFullscreen();

      setCountdown(3);

    };

  useEffect(() => {

    if (
      countdown === null
    ) return;

    if (
      countdown === 0
    ) {

      const launch =
        async () => {

          setLoading(true);

          setCountdown(null);

          setStarted(true);

          setLoading(false);

        };

      launch();

      return;

    }

    const timer =
      setTimeout(() => {

        setCountdown(
          (
            prev
          ) =>
            prev !== null
              ? prev - 1
              : null
        );

      }, 1000);

    return () =>
      clearTimeout(
        timer
      );

  }, [countdown]);

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

  const handleSubmit =
    useCallback(
      () => {

        let rawMarks = 0;

        questions.forEach(
          (
            q
          ) => {

            rawMarks +=
              q.marks || 0;

          }
        );

        const averageMarks =
          rawMarks /
          questions.length;

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

        setFinalResult({

          totalMarks,

          percentage,

          attempted:
            submittedQuestions.length,

          totalQuestions:
            questions.length,

        });

        setShowResult(
          true
        );

      },
      [
        questions,
        submittedQuestions,
      ]
    );

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

              handleSubmit();

            }

            return next;

          }
        );

      },
      [handleSubmit]
    );

  useEffect(() => {

    if (
      !started
    ) return;

    const handleFullscreen =
      () => {

        if (
          !document.fullscreenElement
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

    return () =>
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreen
      );

  }, [
    started,
    addViolation,
  ]);

  useEffect(() => {

    if (
      !started
    ) return;

    const handleBlur =
      () => {

        addViolation(
          "Window focus lost"
        );

      };

    window.addEventListener(
      "blur",
      handleBlur
    );

    return () =>
      window.removeEventListener(
        "blur",
        handleBlur
      );

  }, [
    started,
    addViolation,
  ]);

  useEffect(() => {

    if (
      !started
    ) return;

    const handleVisibility =
      () => {

        if (
          document.hidden
        ) {

          addViolation(
            "Tab switched"
          );

        }

      };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () =>
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

  }, [
    started,
    addViolation,
  ]);

  useEffect(() => {

    if (
      !started
    ) return;

    const blockKeys =
      (
        e: KeyboardEvent
      ) => {

        if (
          lockKeys.current
        ) {

          e.preventDefault();

          return;

        }

        const blocked =
          [
            "F12",
          ];

        if (
          blocked.includes(
            e.key
          )
        ) {

          e.preventDefault();

          addViolation(
            "Blocked key used"
          );

        }

        if (
          e.ctrlKey &&
          (
            e.key === "c" ||
            e.key === "v" ||
            e.key === "u" ||
            e.key === "s"
          )
        ) {

          e.preventDefault();

          addViolation(
            "Restricted shortcut"
          );

        }

      };

    window.addEventListener(
      "keydown",
      blockKeys
    );

    return () =>
      window.removeEventListener(
        "keydown",
        blockKeys
      );

  }, [
    started,
    addViolation,
  ]);

  useEffect(() => {

    if (
      !started
    ) return;

    const blockContext =
      (
        e: MouseEvent
      ) => {

        e.preventDefault();

        addViolation(
          "Right click blocked"
        );

      };

    window.addEventListener(
      "contextmenu",
      blockContext
    );

    return () =>
      window.removeEventListener(
        "contextmenu",
        blockContext
      );

  }, [
    started,
    addViolation,
  ]);

  useEffect(() => {

    if (
      !started
    ) return;

    const interval =
      setInterval(() => {

        setTimeLeft(
          (
            prev
          ) => {

            if (
              prev <= 1
            ) {

              clearInterval(
                interval
              );

              handleSubmit();

              return 0;

            }

            return prev - 1;

          }
        );

      }, 1000);

    return () =>
      clearInterval(
        interval
      );

  }, [
    started,
    handleSubmit,
  ]);

  const formatTime =
    (
      seconds: number
    ) => {

      const mins =
        Math.floor(
          seconds / 60
        );

      const secs =
        seconds % 60;

      return `
        ${String(mins).padStart(2, "0")}
        :
        ${String(secs).padStart(2, "0")}
      `;

    };

  const updateAnswer =
    (
      value: string
    ) => {

      const updated =
        [...questions];

      updated[
        currentIndex
      ].userAnswer =
        value;

      setQuestions(
        updated
      );

    };

  const STOP_WORDS =
    new Set([
      "a", "an", "the",
      "is", "it", "in",
      "on", "of", "to",
      "and", "or", "but",
      "for", "with",
      "this", "that",
      "are", "was",
      "were",
    ]);

  const extractKeywords =
    (
      text: string
    ) =>
      text
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

  const calculateMatchPercentage =
    (
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
      ) return 0;

      let matched = 0;

      correctKeywords.forEach(
        (
          keyword
        ) => {

          if (
            userKeywords.some(
              (
                u
              ) =>
                u.includes(keyword) ||
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

  const getMarksFromPercent =
    (
      pct: number
    ) => {

      if (pct >= 85) return 5;
      if (pct >= 65) return 4;
      if (pct >= 55) return 3;
      if (pct >= 45) return 2;
      if (pct >= 30) return 1;

      return 0;

    };

  const submitQuestion =
    () => {

      const updated =
        [...questions];

      const current =
        updated[
        currentIndex
        ];

      if (
        current.submitCount >= 3
      ) return;

      current.submitCount += 1;

      current.submitted =
        true;

      const percentage =
        current.userAnswer.trim()

          ? calculateMatchPercentage(
            current.answer,
            current.userAnswer
          )

          : 0;

      current.matchPercentage =
        percentage;

      current.marks =
        getMarksFromPercent(
          percentage
        );

      updated[
        currentIndex
      ] = current;

      setQuestions(
        updated
      );

      if (
        !submittedQuestions.includes(
          currentIndex
        )
      ) {

        setSubmittedQuestions(
          (
            prev
          ) => [
              ...prev,
              currentIndex
            ]
        );

      }

    };

  if (loading) {

    return (
      <LoadingScreen
        message="
          Loading Practice Exam...
        "
      />
    );

  }

  if (
    !started &&
    countdown === null
  ) {

    return (

      <InstructionsModal
        examName="
          Practice Exam
        "
        duration={30}
        onStart={
          startExam
        }
      />

    );

  }

  if (
    countdown !== null
  ) {

    return (

      <div className="
        fixed
        inset-0
        bg-black
        flex
        items-center
        justify-center
        z-[9999]
      ">

        <div className="
          text-white
          text-[220px]
          font-black
        ">

          {countdown}

        </div>

      </div>

    );

  }

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
          max-w-xl
          rounded-[36px]
          border
          bg-card
          p-12
          shadow-2xl
          text-center
          space-y-10
        ">

          <h1 className="
            text-5xl
            font-black
          ">

            Practice Complete!

          </h1>

          <div className="
            flex
            justify-center
          ">

            <div className="
              h-56
              w-56
              rounded-full
              border-[12px]
              border-indigo-500/20
              flex
              flex-col
              items-center
              justify-center
            ">

              <div className="
                text-6xl
                font-black
                text-indigo-500
              ">

                {
                  finalResult
                    ?.totalMarks
                }

              </div>

              <div className="
                text-3xl
                font-bold
                text-indigo-500
              ">

                / 5

              </div>

            </div>

          </div>

          <Button
            onClick={() =>
              router.push(
                "/dashboard/flashcards"
              )
            }
            className="
              w-full
              h-16
              rounded-2xl
              bg-indigo-500
              text-xl
              font-bold
            "
          >

            Back to Flashcards

          </Button>

        </div>

      </div>

    );

  }

  const currentQuestion =
    questions[
    currentIndex
    ];

  return (

    <div className="
      h-screen
      bg-background
      flex
      flex-col
      overflow-hidden
    ">

      {showViolation && (

        <ViolationModal
          title="
            Violation Detected
          "
          message={
            violationReason.current
          }
          count={
            violations
          }
          onDismiss={
            continueExam
          }
        />

      )}

      <div className="
        h-20
        border-b
        bg-card
        px-8
        flex
        items-center
        justify-between
      ">

        <div>

          <h1 className="
            text-2xl
            font-bold
          ">

            Practice Exam

          </h1>

          <p className="
            text-base
            text-muted-foreground
          ">

            {
              exam?.module
                ?.label
            }

          </p>

        </div>

        <div className="
          flex
          items-center
          gap-4
        ">

          <div className="
            px-5
            h-12
            rounded-xl
            border
            border-red-500/30
            bg-red-500/10
            text-red-500
            flex
            items-center
            text-lg
            font-bold
          ">

            Violations:
            {" "}
            {
              violations
            }

          </div>

          <div className="
            px-5
            h-12
            rounded-xl
            border
            border-indigo-500/30
            bg-indigo-500/10
            text-indigo-500
            flex
            items-center
            text-xl
            font-bold
          ">

            {
              formatTime(
                timeLeft
              )
            }

          </div>

        </div>

      </div>

      <div className="
        flex
        flex-1
        overflow-hidden
      ">

        <div className="
          w-28
          border-r
          bg-card
          p-4
          flex
          flex-col
          gap-4
          overflow-y-auto
        ">

          {questions.map(
            (
              q,
              index
            ) => (

              <button
                key={q.id}
                onClick={() =>
                  setCurrentIndex(
                    index
                  )
                }
                className={`
                  h-20
                  rounded-2xl
                  border
                  text-lg
                  font-bold
                  transition-all

                  ${currentIndex ===
                    index

                    ? `
                        bg-indigo-500
                        text-white
                        border-indigo-500
                      `

                    : `
                        hover:border-indigo-500/40
                      `
                  }

                  ${q.submitted
                    ? `
                        bg-green-500
                        text-white
                        border-green-500
                      `
                    : ""
                  }
                `}
              >

                {index + 1}

              </button>

            )
          )}

        </div>

        <div className="
          flex-1
          overflow-y-auto
          bg-muted/30
        ">

          <div className="
            max-w-7xl
            mx-auto
            p-12
            space-y-10
          ">

            <div className="
              rounded-3xl
              border
              bg-card
              p-10
              shadow-sm
              space-y-10
            ">

              <h2 className="
                text-4xl
                font-semibold
                leading-loose
              ">

                {
                  currentQuestion
                    ?.question
                }

              </h2>

              <Textarea
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                rows={18}
                placeholder="
                    Type your answer here...
                  "
                value={
                  currentQuestion
                    ?.userAnswer
                }
                onChange={(e) =>
                  updateAnswer(
                    e.target.value
                  )
                }
                style={{
                  fontSize: "25px",
                  lineHeight: "1.8",
                  fontWeight: "500",
                }}
                className="
                  rounded-3xl
                  resize-none
                  p-8
                  min-h-[200px]
                "
              />

              <Button
                onClick={
                  submitQuestion
                }
                disabled={
                  currentQuestion
                    ?.submitCount >= 3
                }
                className="
                  rounded-2xl
                  bg-indigo-500
                  text-lg
                  font-bold
                  h-14
                  px-8
                "
              >

                {
                  currentQuestion
                    ?.submitCount >= 3

                    ? "Max Reached"

                    : "Submit Answer"
                }

              </Button>

              {currentQuestion?.submitted && (

                <div className="
                  rounded-2xl
                  border
                  p-6
                  bg-muted/40
                  space-y-6
                ">

                  <div className="
                    flex
                    justify-between
                    text-lg
                  ">

                    <span>
                      Accuracy
                    </span>

                    <span className="
                      text-indigo-500
                      font-bold
                    ">

                      {
                        currentQuestion
                          ?.matchPercentage
                      }%

                    </span>

                  </div>

                  <div className="
                    flex
                    justify-between
                    text-lg
                  ">

                    <span>
                      Marks
                    </span>

                    <span className="
                      text-indigo-500
                      font-bold
                    ">

                      {
                        currentQuestion
                          ?.marks
                      } / 5

                    </span>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

      <div className="
        h-24
        border-t
        bg-card
        px-10
        flex
        items-center
        justify-between
      ">

        <Button
          variant="outline"
          disabled={
            currentIndex === 0
          }
          onClick={() =>
            setCurrentIndex(
              currentIndex - 1
            )
          }
          className="
            h-14
            px-8
            rounded-2xl
            text-lg
            font-bold
          "
        >

          ← Prev

        </Button>

        <Button
          variant="outline"
          disabled={
            currentIndex ===
            questions.length - 1
          }
          onClick={() =>
            setCurrentIndex(
              currentIndex + 1
            )
          }
          className="
            h-14
            px-8
            rounded-2xl
            text-lg
            font-bold
          "
        >

          Next →

        </Button>

        <Button
          onClick={
            handleSubmit
          }
          className="
            h-14
            px-8
            rounded-2xl
            bg-indigo-500
            text-lg
            font-bold
          "
        >

          END PRACTICE

        </Button>

      </div>

    </div>

  );

}
export default function PracticeExamPage() {

  return (

    <Suspense
      fallback={
        <div className="
          min-h-screen
          flex
          items-center
          justify-center
          text-2xl
          font-bold
        ">
          Loading...
        </div>
      }
    >

      <PracticeExamContent />

    </Suspense>

  );

}