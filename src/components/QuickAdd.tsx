"use client";

import React, { useState, useRef } from "react";
import { useTodo } from "@/context/TodoContext";
import { Category, Timeframe } from "@/types/todo";
import { Plus, Building2, Home, Calendar, CalendarClock, Inbox, CornerDownLeft } from "lucide-react";

export const QuickAdd: React.FC = () => {
  const { addTask } = useTodo();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("work");
  const [timeframe, setTimeframe] = useState<Timeframe>("today");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    // 1. Instantly clear input so user can immediately type the next task
    setTitle("");

    // 2. Add task instantly via context (updates state & localStorage immediately)
    addTask(cleanTitle, category, timeframe);

    // 3. Keep focus for rapid consecutive task adding
    inputRef.current?.focus();
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xs transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Main Text Input */}
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ketik tugas baru (misal: 'Bikin laporan Q3', 'Antar laundry')..."
            className="w-full text-sm sm:text-base bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-hidden py-1.5 pr-20"
            autoFocus
          />
          <button
            type="submit"
            disabled={!title.trim()}
            className={`absolute right-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              title.trim()
                ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 cursor-pointer shadow-xs"
                : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed"
            }`}
          >
            <span>Tambah</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </div>

        {/* Quick Options Bar (Category & Timeframe) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
            <span className="text-zinc-600 dark:text-zinc-400 font-medium mr-1 text-[11px] shrink-0">
              Tujuan:
            </span>
            <button
              type="button"
              onClick={() => setTimeframe("today")}
              className={`flex items-center gap-1 px-2.5 py-1.5 sm:py-1 rounded-md transition-colors font-medium shrink-0 cursor-pointer ${
                timeframe === "today"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              <Calendar className="w-3 h-3" />
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("tomorrow")}
              className={`flex items-center gap-1 px-2.5 py-1.5 sm:py-1 rounded-md transition-colors font-medium shrink-0 cursor-pointer ${
                timeframe === "tomorrow"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              <CalendarClock className="w-3 h-3" />
              Besok
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("inbox")}
              className={`flex items-center gap-1 px-2.5 py-1.5 sm:py-1 rounded-md transition-colors font-medium shrink-0 cursor-pointer ${
                timeframe === "inbox"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              <Inbox className="w-3 h-3" />
              Inbox
            </button>
          </div>

          {/* Category Toggle */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-zinc-600 dark:text-zinc-400 font-medium mr-1 text-[11px]">
              Kategori:
            </span>
            <button
              type="button"
              onClick={() => setCategory("work")}
              className={`flex items-center gap-1 px-2.5 py-1.5 sm:py-1 rounded-md transition-colors font-medium cursor-pointer ${
                category === "work"
                  ? "bg-sky-600 text-white shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-sky-50 hover:text-sky-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              <Building2 className="w-3 h-3" />
              🏢 Kantor
            </button>
            <button
              type="button"
              onClick={() => setCategory("home")}
              className={`flex items-center gap-1 px-2.5 py-1.5 sm:py-1 rounded-md transition-colors font-medium cursor-pointer ${
                category === "home"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              <Home className="w-3 h-3" />
              🏠 Rumah
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
