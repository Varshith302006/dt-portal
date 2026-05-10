"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  LayoutDashboard,
  ClipboardList,
  Upload,
  KeyRound,
  BarChart3,
  Users,
  Shield,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname =
    usePathname();

  const router =
    useRouter();

  const [admin, setAdmin] =
    useState<any>(null);

  const [theme, setTheme] =
    useState("dark");

  useEffect(() => {

    const storedAdmin =
      localStorage.getItem(
        "admin"
      );

    if (!storedAdmin) {

      router.push("/");

      return;

    }

    setAdmin(
      JSON.parse(
        storedAdmin
      )
    );

    const savedTheme =
      localStorage.getItem(
        "admin-theme"
      );

    if (savedTheme) {

      setTheme(savedTheme);

      document.documentElement.classList.toggle(
        "dark",
        savedTheme === "dark"
      );

    }

    else {

      document.documentElement.classList.add(
        "dark"
      );

    }

  }, []);

  const handleLogout =
    () => {

      localStorage.removeItem(
        "admin"
      );

      router.push("/");

    };

  const toggleTheme =
    () => {

      const next =
        theme === "dark"

          ? "light"

          : "dark";

      setTheme(next);

      localStorage.setItem(
        "admin-theme",
        next
      );

      document.documentElement.classList.toggle(
        "dark",
        next === "dark"
      );

    };

  const navItems = [

    {
      name: "Dashboard",
      href:
        "/admin/dashboard",
      icon:
        LayoutDashboard,
    },

    {
      name:
        "Create Exams",
      href:
        "/admin/create-exam",
      icon:
        ClipboardList,
    },

    {
      name:
        "Upload Questions",
      href:
        "/admin/UploadQuestions",
      icon: Upload,
    },

    {
      name:
        "Exam Keys",
      href:
        "/admin/exam-keys",
      icon:
        KeyRound,
    },

    {
      name:
        "Exam Results",
      href:
        "/admin/exam-results",
      icon:
        BarChart3,
    },

    {
      name:
        "Student Management",
      href:
        "/admin/students",
      icon: Users,
    },

    {
      name:
        "Admin Management",
      href:
        "/admin/admin-management",
      icon: Shield,
    },

  ];

  return (

    <div className="
      min-h-screen
      bg-background
      text-foreground
      flex
    ">

      {/* SIDEBAR */}

      <aside className="
        w-72
        border-r
        border-border
        bg-card
        flex
        flex-col
      ">

        {/* LOGO */}

        <div className="
          h-20
          px-6
          border-b
          border-border
          flex
          items-center
          gap-4
        ">

          <div className="
            w-12
            h-12
            rounded-2xl
            bg-gradient-to-br
            from-indigo-500
            to-violet-600
            flex
            items-center
            justify-center
            text-white
          ">

            <Shield size={24} />

          </div>

          <div>

            <h1 className="
              text-xl
              font-bold
              tracking-tight
            ">

              Admin Panel

            </h1>

            <p className="
              text-xs
              text-muted-foreground
              mt-1
            ">

              DT Management

            </p>

          </div>

        </div>

        {/* NAVIGATION */}

        <div className="
          flex-1
          p-4
          space-y-2
        ">

          {navItems.map(
            (item) => {

              const Icon =
                item.icon;

              const active =
                pathname ===
                item.href;

              return (

                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  className={`
                    h-12
                    px-4
                    rounded-xl
                    flex
                    items-center
                    gap-3
                    transition-all
                    font-medium

                    ${active

                      ? "bg-indigo-500 text-white"

                      : "hover:bg-muted"
                    }
                  `}
                >

                  <Icon
                    size={20}
                  />

                  {
                    item.name
                  }

                </Link>

              );

            }
          )}

        </div>

        {/* FOOTER */}

        <div className="
  p-4
  border-t
  border-border
">

          <div className="
    rounded-2xl
    border
    border-border
    p-4
    flex
    items-center
    justify-between
    gap-3
  ">

            <div className="
      flex-1
      min-w-0
    ">

              <h3 className="
        font-semibold
        text-sm
        truncate
      ">

                {
                  admin?.ad_name
                }

              </h3>

              <p className="
        text-xs
        text-muted-foreground
        mt-1
      ">

                Administrator

              </p>

            </div>

            <div className="
      flex
      items-center
      gap-2
    ">

              {/* THEME TOGGLE */}

              <Button
                onClick={
                  toggleTheme
                }
                size="icon"
                variant="outline"
                className="
          rounded-xl
        "
              >

                {theme ===
                  "dark"

                  ? (
                    <Sun
                      size={18}
                    />
                  )

                  : (
                    <Moon
                      size={18}
                    />
                  )}

              </Button>

              {/* LOGOUT */}

              <Button
                onClick={
                  handleLogout
                }
                size="icon"
                variant="outline"
                className="
          rounded-xl
        "
              >

                <LogOut
                  size={18}
                />

              </Button>

            </div>

          </div>

        </div>

      </aside>

      {/* MAIN */}

      <main className="
        flex-1
        overflow-y-auto
      ">

        {/* TOP HEADER */}

        <div className="
          h-20
          px-8
          border-b
          border-border
          flex
          items-center
          justify-between
          bg-background/80
          backdrop-blur
          sticky
          top-0
          z-20
        ">

          <div>

            <h1 className="
              text-2xl
              font-bold
              tracking-tight
            ">

              {
                navItems.find(
                  (
                    item
                  ) =>
                    item.href ===
                    pathname
                )?.name ||
                "Admin Panel"
              }

            </h1>

            <p className="
              text-sm
              text-muted-foreground
              mt-1
            ">

              Welcome back,
              {" "}
              {
                admin?.ad_name
              }

            </p>

          </div>

        </div>

        {/* PAGE CONTENT */}

        <div className="
          p-8
        ">

          {children}

        </div>

      </main>

    </div>

  );

}