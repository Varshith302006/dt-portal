"use client";

import jsPDF from "jspdf";
import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Search,
  BookOpen,
  Layers3,
  Download,
} from "lucide-react";

import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { supabase } from "@/lib/supabase";

export default function FlashcardsPage() {

  const router =
    useRouter();

  const [filtered, setFiltered] =
    useState<any[]>([]);

  const [subjects, setSubjects] =
    useState<any[]>([]);

  const [modules, setModules] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  const [selectedSubject, setSelectedSubject] =
    useState("all");

  const [selectedModule, setSelectedModule] =
    useState("all");

  const [flipped, setFlipped] =
    useState<number | null>(null);

  useEffect(() => {

    fetchFlashcards();

  }, []);

  useEffect(() => {

    fetchModules();

  }, [selectedSubject]);

  useEffect(() => {

    fetchFilteredQuestions();

  }, [
    search,
    selectedSubject,
    selectedModule,
  ]);



  const fetchFlashcards = async () => {

    const student =
      JSON.parse(
        localStorage.getItem("student") || "{}"
      );

    const { data } = await supabase
      .from("dt_questions")
      .select(`
        *,
        subjects (
          id,
          label
        ),
        modules (
          id,
          label
        )
      `)
      .eq("sem_id", student.sem_id)
      .eq("branch_id", student.branch_id)


    setFiltered(data || []);

    // FETCH SUBJECTS
    const { data: subjectsData } =
      await supabase
        .from("subjects")
        .select("*")
        .eq("sem_id", student.sem_id)
        .eq("branch_id", student.branch_id)
        .order("id", { ascending: true });

    setSubjects(subjectsData || []);

  };
  const fetchModules = async () => {

    // RESET
    if (selectedSubject === "all") {

      setModules([]);

      return;

    }

    const { data } = await supabase
      .from("modules")
      .select("*")
      .eq("subject_id", selectedSubject)
      .order("id", { ascending: true });

    setModules(data || []);

  };

  const fetchFilteredQuestions = async () => {

    const student =
      JSON.parse(
        localStorage.getItem("student") || "{}"
      );

    let query = supabase
      .from("dt_questions")
      .select(`
      *,
      subjects (
        id,
        label
      ),
      modules (
        id,
        label
      )
    `)
      .eq("sem_id", student.sem_id)
      .eq("branch_id", student.branch_id);

    // SUBJECT FILTER
    if (selectedSubject !== "all") {

      query = query.eq(
        "subject_id",
        selectedSubject
      );

    }

    // MODULE FILTER
    if (selectedModule !== "all") {

      query = query.eq(
        "module_id",
        selectedModule
      );

    }

    const { data } = await query;

    let finalData = data || [];

    // SEARCH FILTER
    if (search.trim()) {

      finalData = finalData.filter((q) =>
        q.question
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );

    }

    setFiltered(finalData);

  };

  const downloadPDF = () => {

    // VALIDATION
    if (
      selectedSubject === "all" ||
      selectedModule === "all"
    ) {

      alert(
        "Please select subject and module"
      );

      return;

    }

    const selectedSubjectName =
      subjects.find(
        (s: any) =>
          String(s.id) === selectedSubject
      )?.label || "";

    const selectedModuleName =
      modules.find(
        (m: any) =>
          String(m.id) === selectedModule
      )?.label || "";

    const pdf = new jsPDF();

    // TITLE
    pdf.setFontSize(18);

    pdf.text(
      "DT Flashcards",
      20,
      20
    );

    pdf.setFontSize(12);

    pdf.text(
      `Subject: ${selectedSubjectName}`,
      20,
      32
    );

    pdf.text(
      `Module: ${selectedModuleName}`,
      20,
      40
    );

    let y = 55;

    filtered.forEach(
      (item: any, index: number) => {

        // NEW PAGE
        if (y > 260) {

          pdf.addPage();

          y = 20;

        }

        // QUESTION
        pdf.setFontSize(12);

        pdf.setFont(
          "helvetica",
          "bold"
        );

        const question =
          pdf.splitTextToSize(
            `Q${index + 1}: ${item.question}`,
            170
          );

        pdf.text(question, 20, y);

        y += question.length * 7;

        // ANSWER
        pdf.setFont(
          "helvetica",
          "normal"
        );

        const answer =
          pdf.splitTextToSize(
            `Answer: ${item.answer}`,
            170
          );

        pdf.text(answer, 20, y);

        y += answer.length * 7;

        y += 10;

      }
    );

    pdf.save(
      `${selectedSubjectName}-${selectedModuleName}.pdf`
    );

  };



  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>

        <h1 className="text-3xl font-bold tracking-tight">

          Flashcards

        </h1>

        <p className="text-muted-foreground mt-1">

          Revise definitions and terminology
          using interactive flashcards.

        </p>

      </div>

      {/* FILTERS */}
      <div className="
        flex
        flex-col
        gap-4
        lg:flex-row
        lg:items-center
        ">

        {/* SEARCH */}
        <div className="relative flex-1">

          <Search
            size={16}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-muted-foreground
            "
          />

          <Input
            placeholder="Search flashcards..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="pl-10 rounded-md"
          />

        </div>

        {/* SUBJECT */}
        <Select
          value={selectedSubject}
          onValueChange={(value) => {

            setSelectedSubject(value);

            setSelectedModule("all");

          }}
        >

          <SelectTrigger className="w-full lg:w-[220px] rounded-md cursor-pointer">

            <SelectValue placeholder="Select Subject" />

          </SelectTrigger>

          <SelectContent>

            <SelectItem value="all">
              All Subjects
            </SelectItem>

            {subjects.map((subject: any) => (

              <SelectItem
                key={subject?.id}
                value={String(subject?.id)}
              >

                {subject?.label}

              </SelectItem>

            ))}

          </SelectContent>

        </Select>

        {/* MODULE */}
        <Select
          value={selectedModule}
          onValueChange={setSelectedModule}
          disabled={selectedSubject === "all"}
        >

          <SelectTrigger className="w-full lg:w-[220px] rounded-md cursor-pointer">

            <SelectValue placeholder="Select Module" />

          </SelectTrigger>

          <SelectContent>

            <SelectItem value="all">
              All Modules
            </SelectItem>

            {modules.map((module: any) => (

              <SelectItem
                key={module?.id}
                value={String(module?.id)}
              >

                {module?.label}

              </SelectItem>

            ))}

          </SelectContent>

        </Select>

        <button
          onClick={downloadPDF}
          disabled={
            selectedSubject === "all" ||
            selectedModule === "all"
          }
          className="
            h-10
            cursor-pointer
            px-4
            rounded-lg
            bg-muted
            hover:bg-muted/80
            border
            border-border/60
            text-foreground
            text-sm
            font-medium
            flex
            items-center
            gap-2
            transition-all
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >

          <Download size={16} />

          Download PDF

        </button>

      </div>

      {/* EMPTY */}
      {filtered.length === 0 ? (

        <Card className="rounded-lg border-dashed">

          <CardContent className="p-12 text-center">

            <h3 className="text-lg font-semibold">

              No Flashcards Found

            </h3>

            <p className="text-sm text-muted-foreground mt-2">

              Try changing filters or keywords.

            </p>

          </CardContent>

        </Card>

      ) : (

        <div className="
          grid
          gap-6
          md:grid-cols-2
          xl:grid-cols-3
        ">

          {filtered.map((item, index) => {

            const isFlipped =
              flipped === index;

            return (

              <div
                key={item.id}
                onClick={() =>
                  setFlipped(
                    isFlipped
                      ? null
                      : index
                  )
                }
                className="cursor-pointer"
              >

                <div
                  className="relative min-h-[240px] perspective"
                >

                  <div
                    className={`
      relative
      h-[240px]
      w-full
      duration-500
      transform-style-preserve-3d
      ${isFlipped
                        ? "rotate-y-180"
                        : ""
                      }
    `}
                  >

                    {/* FRONT */}
                    <Card
                      className="
        absolute
        inset-0
        rounded-lg
        border-border/60
        bg-card
        hover:border-indigo-500/30
        backface-hidden
      "
                    >

                      <CardContent className="relative p-6 h-full flex items-center justify-center text-center">

                        <div className="
  absolute
  top-4
  left-4
  text-xs
  font-medium
  text-muted-foreground
  uppercase
  tracking-wide
">

                          Question

                        </div>

                        <div className="w-full">

                          <h2 className="
  text-lg
  font-semibold
  leading-relaxed
  text-center
">

                            {item.question}

                          </h2>

                        </div>

                      </CardContent>

                    </Card>

                    {/* BACK */}
                    <Card
                      className="
        absolute
        inset-0
        rounded-lg
        border-border/60
        bg-card
        backface-hidden
        rotate-y-180
      "
                    >

                      <CardContent className="relative p-6 h-full flex items-center justify-center text-center">

                        <div className="
  absolute
  top-4
  left-4
  text-xs
  font-medium
  text-muted-foreground
  uppercase
  tracking-wide
">

                          Answer

                        </div>

                        <div className="w-full">

                          <p className="
  text-base
  leading-relaxed
  text-foreground
  text-center
">

                            {item.answer}

                          </p>

                        </div>

                      </CardContent>

                    </Card>

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      )}

     { /* BOTTOM PRACTICE EXAM BUTTON */}

{filtered.length > 0 &&
  selectedSubject !== "all" &&
  selectedModule !== "all" && (

  <div className="
    flex
    justify-center
    pt-6
  ">

    <button
      onClick={() => {

        router.push(
          `/practice-exam?subject=${selectedSubject}&module=${selectedModule}`
        );

      }}
      className="
        h-14
        px-10
        rounded-2xl
        bg-gradient-to-r
        from-indigo-500
        to-violet-600
        text-white
        text-base
        font-semibold
        shadow-lg
        hover:scale-[1.02]
        hover:opacity-90
        transition-all
        cursor-pointer
      "
    >

      Start Practice Test

    </button>

  </div>

)}

    </div>
  );
}