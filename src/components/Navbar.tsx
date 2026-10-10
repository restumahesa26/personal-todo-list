"use client";

import React, { useState, useEffect } from "react";
import { useTodo } from "@/context/TodoContext";
import { CategoryFilter } from "@/types/todo";
import {
  Sun,
  Moon,
  Sunrise,
  AlertCircle,
  Building2,
  Home,
  SlidersHorizontal,
  CheckCircle2,
  Smartphone,
} from "lucide-react";

interface NavbarProps {
  onOpenNewDayModal: () => void;
  onOpenFirebaseModal?: () => void;
  onOpenInstallModal?: () => void;
  isInstalled?: boolean;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewDayModal,
  onOpenInstallModal,
  isInstalled = false,
  theme,
  onToggleTheme,
}) => {
  const {
    tasks,
    categoryFilter,
    setCategoryFilter,
    isConnected,
  } = useTodo();

  // Calculate today stats
  const todayTasks = tasks.filter((t) => t.timeframe === "today");
  const todayCompleted = todayTasks.filter((t) => t.status === "completed").length;
  const todayTotal = todayTasks.length;
  const todayProgressPercent =
    todayTotal === 0 ? 0 : Math.round((todayCompleted / todayTotal) * 100);

  // Category counts
  const workCount = tasks.filter((t) => t.category === "work").length;
  const homeCount = tasks.filter((t) => t.category === "home").length;

  // Format today's date in Indonesian
  const [todayFormatted, setTodayFormatted] = useState("");
  useEffect(() => {
    const now = new Date();
    setTodayFormatted(
      new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(now)
    );
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Branding & Date */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-2xs shrink-0 bg-white dark:bg-zinc-900 flex items-center justify-center p-0.5">
              <img
                src="/my-logo.png"
                alt="My Daily Focus"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                  My Daily Focus
                </h1>
              </div>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 capitalize truncate">
                {todayFormatted}
              </p>
            </div>
          </div>

          {/* Middle: Daily progress pill (Desktop) */}
          {isConnected ? (
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {todayTotal === 0 ? (
                  <span>Belum ada tugas hari ini</span>
                ) : (
                  <span>
                    {todayCompleted} dari {todayTotal} selesai ({todayProgressPercent}%)
                  </span>
                )}
              </div>
              {todayTotal > 0 && (
                <div className="w-16 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${todayProgressPercent}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-700 dark:text-amber-300 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Database Belum Terhubung</span>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mulai Hari Baru Button */}
            {isConnected && (
              <button
                onClick={onOpenNewDayModal}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 transition-colors cursor-pointer"
                title="Mulai Hari Baru: Pindahkan tugas Besok ke Hari Ini"
              >
                <Sunrise className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:rotate-12 transition-transform duration-200" />
                <span className="hidden sm:inline">Mulai Hari Baru</span>
              </button>
            )}

            {/* Install PWA Button (Discreet, Clean) */}
            {!isInstalled && onOpenInstallModal && (
              <button
                onClick={onOpenInstallModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                title="Pasang Aplikasi di Layar Utama HP / PC"
              >
                <Smartphone className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                <span className="hidden sm:inline">Pasang App</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Ganti Tema"
              title="Ganti Tema Terang/Gelap"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-600" />
              )}
            </button>
          </div>
        </div>

        {/* Category Filters Bar (Only visible when connected) */}
        {isConnected && (
          <div className="flex items-center justify-between gap-3 pb-2.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/40 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 min-w-0 flex-1">
              <span className="hidden sm:flex text-zinc-500 dark:text-zinc-400 font-medium mr-0.5 items-center gap-1 text-[11px] shrink-0">
                <SlidersHorizontal className="w-3 h-3" /> Filter:
              </span>

              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`shrink-0 px-3 py-1.5 sm:py-1 rounded-full font-medium transition-all text-xs flex items-center gap-1.5 cursor-pointer ${categoryFilter === "all"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  }`}
              >
                <span>Semua</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${categoryFilter === "all"
                      ? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900"
                      : "bg-zinc-200/80 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                    }`}
                >
                  {tasks.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCategoryFilter("work")}
                className={`shrink-0 px-3 py-1.5 sm:py-1 rounded-full font-medium flex items-center gap-1.5 transition-all text-xs cursor-pointer ${categoryFilter === "work"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/50"
                  }`}
              >
                <Building2 className="w-3 h-3" />
                <span>Kantor</span>
                <span className="hidden sm:inline"> / Kerja</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${categoryFilter === "work"
                      ? "bg-white/20 text-white"
                      : "bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300"
                    }`}
                >
                  {workCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCategoryFilter("home")}
                className={`shrink-0 px-3 py-1.5 sm:py-1 rounded-full font-medium flex items-center gap-1.5 transition-all text-xs cursor-pointer ${categoryFilter === "home"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                  }`}
              >
                <Home className="w-3 h-3" />
                <span>Rumah</span>
                <span className="hidden sm:inline"> / Pribadi</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${categoryFilter === "home"
                      ? "bg-white/20 text-white"
                      : "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300"
                    }`}
                >
                  {homeCount}
                </span>
              </button>
            </div>

            <div className="hidden sm:block text-[11px] text-zinc-500 dark:text-zinc-400 font-medium shrink-0">
              Total {tasks.length} tugas
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
