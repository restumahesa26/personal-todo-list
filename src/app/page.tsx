"use client";

import React, { useState, useEffect } from "react";
import { TodoProvider, useTodo } from "@/context/TodoContext";
import { Navbar } from "@/components/Navbar";
import { QuickAdd } from "@/components/QuickAdd";
import { Column } from "@/components/Column";
import { NewDayModal } from "@/components/NewDayModal";
import { FirebaseModal } from "@/components/FirebaseModal";
import { InstallModal } from "@/components/InstallModal";
import { DatabaseRequiredView } from "@/components/DatabaseRequiredView";
import {
  Calendar,
  CalendarClock,
  Inbox,
  LayoutGrid,
  Search,
  X,
  AlertTriangle,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type MobileTab = "today" | "tomorrow" | "inbox" | "all";

function TodoContent() {
  const {
    tasks,
    loading,
    categoryFilter,
    searchQuery,
    setSearchQuery,
    isConnected,
    connectionStatus,
  } = useTodo();

  // 1. Default theme is strictly LIGHT
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isNewDayModalOpen, setIsNewDayModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("today");

  // PWA state
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Manage theme preference: default to light
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "light"; // DEFAULT LIGHT

    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Silent Service Worker registration & PWA detection (No annoying popups!)
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => {
          console.warn("SW register:", err);
        });
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari standalone check
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Filter tasks based on category & search query
  const filteredTasks = tasks.filter((task) => {
    const matchesCategory =
      categoryFilter === "all" || task.category === categoryFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  const todayTasks = filteredTasks.filter((t) => t.timeframe === "today");
  const tomorrowTasks = filteredTasks.filter((t) => t.timeframe === "tomorrow");
  const inboxTasks = filteredTasks.filter((t) => t.timeframe === "inbox");

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar
        onOpenNewDayModal={() => setIsNewDayModalOpen(true)}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        isInstalled={isInstalled}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {connectionStatus === "not_configured" ? (
          <DatabaseRequiredView />
        ) : (
          <>
            {/* Non-intrusive warning banner if cloud permission is pending/denied */}
            {connectionStatus === "error" && (
              <section className="p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Akses Firestore Terkendala (Aturan Rules Perlu Diizinkan)
                    </p>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      Tugas Anda tetap aman tersimpan di browser ini. Agar tersinkron ke cloud tanpa login, perbarui Rules di Firebase Console menjadi: <code>allow read, write: if true;</code>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsFirebaseModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-medium text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    Salin Rules &amp; Solusi
                  </button>
                </div>
              </section>
            )}

            {/* Quick Add & Search Section */}
            <section className="space-y-3">
              <QuickAdd />

              {/* Search bar & quick hints */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-zinc-600 dark:text-zinc-400">
                {/* Search Input */}
                <div className="relative flex items-center w-full sm:max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari tugas..."
                    className="w-full pl-8 pr-7 py-1.5 sm:py-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-hidden focus:border-zinc-400 dark:focus:border-zinc-600"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Micro shortcuts hint (Desktop only) */}
                <div className="hidden sm:flex items-center gap-4 text-[11px] text-zinc-600 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 font-mono text-[10px]">
                      Enter
                    </kbd>
                    Simpan tugas
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 font-mono text-[10px]">
                      Tarik
                    </kbd>
                    Pindah kolom
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 font-mono text-[10px]">
                      Klik 2x
                    </kbd>
                    Edit teks
                  </span>
                </div>
              </div>
            </section>

            {/* Mobile Segmented Tab Control (< lg) */}
            <section className="lg:hidden">
              <div className="flex items-center p-1 rounded-xl bg-zinc-200/70 dark:bg-zinc-800/80 gap-1 text-xs font-medium">
                <button
                  onClick={() => setMobileTab("today")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all ${
                    mobileTab === "today"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>Hari Ini</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {todayTasks.filter((t) => t.status === "pending").length}
                  </span>
                </button>

                <button
                  onClick={() => setMobileTab("tomorrow")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all ${
                    mobileTab === "tomorrow"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <CalendarClock className="w-3.5 h-3.5 text-sky-500" />
                  <span>Besok</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {tomorrowTasks.filter((t) => t.status === "pending").length}
                  </span>
                </button>

                <button
                  onClick={() => setMobileTab("inbox")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all ${
                    mobileTab === "inbox"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5 text-purple-500" />
                  <span>Inbox</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {inboxTasks.filter((t) => t.status === "pending").length}
                  </span>
                </button>

                <button
                  onClick={() => setMobileTab("all")}
                  className={`hidden sm:flex items-center justify-center gap-1 py-2 px-2 rounded-lg transition-all ${
                    mobileTab === "all"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                  title="Tampilkan Semua Kolom"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Semua</span>
                </button>
              </div>
            </section>

            {/* Content Layout */}
            {/* Desktop: 3 Columns Grid (lg and above) */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-5 lg:gap-6 items-start">
              <Column
                timeframe="today"
                title="Hari Ini"
                subtitle="Fokus yang harus selesai hari ini"
                tasks={todayTasks}
                isPrimary={true}
              />
              <Column
                timeframe="tomorrow"
                title="Besok"
                subtitle="Rencana untuk esok hari"
                tasks={tomorrowTasks}
              />
              <Column
                timeframe="inbox"
                title="Inbox / Kapan-kapan"
                subtitle="Tampungan ide & tugas acak"
                tasks={inboxTasks}
              />
            </div>

            {/* Mobile / Tablet Responsive View (< lg) */}
            <div className="lg:hidden space-y-4">
              {(mobileTab === "today" || mobileTab === "all") && (
                <Column
                  timeframe="today"
                  title="Hari Ini"
                  subtitle="Fokus yang harus selesai hari ini"
                  tasks={todayTasks}
                  isPrimary={true}
                />
              )}

              {(mobileTab === "tomorrow" || mobileTab === "all") && (
                <Column
                  timeframe="tomorrow"
                  title="Besok"
                  subtitle="Rencana untuk esok hari"
                  tasks={tomorrowTasks}
                />
              )}

              {(mobileTab === "inbox" || mobileTab === "all") && (
                <Column
                  timeframe="inbox"
                  title="Inbox / Kapan-kapan"
                  subtitle="Tampungan ide & tugas acak"
                  tasks={inboxTasks}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Human, minimalist footer */}
      <footer className="mt-auto border-t border-zinc-200/80 dark:border-zinc-800/80 py-5 text-center text-xs text-zinc-600 dark:text-zinc-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p>
            <strong>My Daily Focus</strong> — Sederhana, tanpa gesekan, tanpa distraksi.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNewDayModalOpen(true)}
              className="text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
            >
              Mulai Hari Baru
            </button>
            <span>•</span>
            <button
              onClick={() => setIsFirebaseModalOpen(true)}
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:underline cursor-pointer"
            >
              Pengaturan Database
            </button>
            {!isInstalled && (
              <>
                <span>•</span>
                <button
                  onClick={() => setIsInstallModalOpen(true)}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:underline cursor-pointer"
                >
                  Pasang Aplikasi
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs (Zero intrusive banners) */}
      <NewDayModal
        isOpen={isNewDayModalOpen}
        onClose={() => setIsNewDayModalOpen(false)}
      />

      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstalled={() => setIsInstalled(true)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <TodoProvider>
      <TodoContent />
    </TodoProvider>
  );
}
