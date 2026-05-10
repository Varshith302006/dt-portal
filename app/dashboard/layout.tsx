"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  LogOut,
  GraduationCap,
  ChevronUp,
  Moon,
} from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { ThemeToggle } from "@/components/theme-toggle";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();

  const router = useRouter();

  const [student, setStudent] = useState<any>(null);

  const [openMenu, setOpenMenu] =
    useState(false);

  useEffect(() => {

    const stored =
      localStorage.getItem("student");

    if (stored) {
      setStudent(JSON.parse(stored));
    }

  }, []);

  const menuItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Flashcards",
      href: "/dashboard/flashcards",
      icon: BookOpen,
    },
    {
      title: "Analysis",
      href: "/dashboard/analysis",
      icon: BarChart3,
    },
  ];

  const handleLogout = () => {

    localStorage.removeItem("student");

    localStorage.removeItem("active_exam");

    localStorage.removeItem("key_verified");

    router.push("/");

  };

  return (
    <SidebarProvider>

      <Sidebar
        collapsible="icon"
        className="border-r border-border/60"
      >

        <SidebarContent className="flex flex-col h-full p-2">

          {/* LOGO */}
          <div className="flex items-center gap-3 px-2 py-2 mb-4">

            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg">

              <GraduationCap size={18} />

            </div>

            <div className="group-data-[collapsible=icon]:hidden">

              <h2 className="text-sm font-semibold">
                DT Portal
              </h2>

              <p className="text-xs text-muted-foreground">
                Student Portal
              </p>

            </div>

          </div>

          {/* SECTION */}
          <div className="mb-3 px-2">

            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">

              Platform

            </p>

          </div>

          {/* MENU */}
          <SidebarMenu className="space-y-2">

            {menuItems.map((item) => {

              const Icon = item.icon;

              const active =
                pathname === item.href;

              return (
                <SidebarMenuItem
                  key={item.href}
                >

                  <SidebarMenuButton
                    className={`
                      h-11 rounded-lg transition-all cursor-pointer
                      ${active
                        ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:text-white"
                        : "hover:bg-muted"
                      }
                    `}
                  >

                    <Link
                      href={item.href}
                      className="flex items-center gap-3 w-full"
                    >

                      <Icon size={18} />

                      <span className="font-medium group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>

                    </Link>

                  </SidebarMenuButton>

                </SidebarMenuItem>
              );
            })}

          </SidebarMenu>

          {/* PUSH DOWN */}
          <div className="flex-1" />

          {/* USER DROPDOWN */}
          <div className="relative">

            {/* DROPDOWN PANEL */}
            {openMenu && (
              <div className="absolute bottom-20 left-0 w-full rounded-lg border border-border/60 bg-card shadow-2xl overflow-hidden z-50">

                {/* THEME */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">

                  <div className="flex items-center gap-3 text-sm">

                    <Moon
                      size={18}
                      className="text-muted-foreground"
                    />

                    Theme

                  </div>

                  <ThemeToggle />

                </div>

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center cursor-pointer gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                >

                  <LogOut size={18} />

                  Log out

                </button>

              </div>
            )}

            {/* USER BUTTON */}
            <button
              onClick={() =>
                setOpenMenu(!openMenu)
              }
              className="
                  group
                  w-full
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-3
                  transition-all
                  duration-300
                  bg-sidebar
                  hover:bg-gradient-to-r
                  hover:from-indigo-500
                  hover:to-violet-600
                  hover:text-white
                  border
                  border-border/60
                  cursor-pointer
                "
            >

              {/* AVATAR */}
              <div className="
                  h-10
                  w-10
                  rounded-md
                  bg-indigo-500
                  flex
                  items-center
                  justify-center
                  font-semibold
                  text-white
                ">

                {student?.st_name?.charAt(0) || ""}

              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0 text-left group-data-[collapsible=icon]:hidden">

                <p className="text-sm font-semibold truncate">

                  {student?.st_name ||
                    "Student"}

                </p>

                <p className="
                    text-xs
                    text-muted-foreground
                    group-hover:text-white/80
                    truncate
                  ">

                  {student?.st_id}

                </p>

              </div>

              <ChevronUp
                size={18}
                className="
                  text-muted-foreground
                  group-hover:text-white
                "
                            />

            </button>

          </div>

        </SidebarContent>

      </Sidebar>

      {/* MAIN */}
      <SidebarInset>

        {/* TOPBAR */}
        <div className="h-16 border-b border-border/60 flex items-center justify-between px-6">

          <div className="flex items-center gap-3">

            <SidebarTrigger />

            <div>

              <h1 className="font-semibold">
                DT Portal
              </h1>

              <p className="text-xs text-muted-foreground">

                Definition & Terminology

              </p>

            </div>

          </div>

        </div>

        {/* PAGE */}
        <div className="p-6">

          {children}

        </div>

      </SidebarInset>

    </SidebarProvider>
  );
}