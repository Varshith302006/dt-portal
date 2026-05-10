"use client";

import Link from "next/link";
import { LayoutDashboard, Users, FileText } from "lucide-react";

export function AppSidebar() {
  return (
    <aside className="w-64 h-screen bg-[#0f172a] text-white p-4">
      <h2 className="text-lg font-semibold mb-6">DT Portal</h2>

      <nav className="space-y-2">
        <Link href="/dashboard" className="flex items-center gap-2 p-2 rounded hover:bg-white/10">
          <LayoutDashboard size={18} /> Dashboard
        </Link>

        <Link href="/dashboard/students" className="flex items-center gap-2 p-2 rounded hover:bg-white/10">
          <Users size={18} /> Students
        </Link>

        <Link href="/dashboard/exams" className="flex items-center gap-2 p-2 rounded hover:bg-white/10">
          <FileText size={18} /> Exams
        </Link>
      </nav>
    </aside>
  );
}