"use client";

import React, { useState } from "react";
import { Task, Timeframe, Category } from "@/types/todo";
import { TaskItem } from "./TaskItem";
import { useTodo } from "@/context/TodoContext";
import {
  Calendar,
  CalendarClock,
  Inbox,
  Plus,
  ChevronDown,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Building2,
  Home,
} from "lucide-react";

interface ColumnProps {
  timeframe: Timeframe;
  title: string;
  subtitle: string;
  tasks: Task[];
  isPrimary?: boolean;
}

export const Column: React.FC<ColumnProps> = ({
  timeframe,
  title,
  subtitle,
  tasks,
  isPrimary = false,
}) => {
  const { addTask, updateTaskTimeframe, clearCompleted } = useTodo();
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [inlineTitle, setInlineTitle] = useState("");
  const [inlineCategory, setInlineCategory] = useState<Category>("work");

  // Separate pending and completed
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const getIcon = () => {
    switch (timeframe) {
      case "today":
        return <Calendar className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      case "tomorrow":
        return <CalendarClock className="w-4 h-4 text-sky-500 dark:text-sky-400" />;
      case "inbox":
        return <Inbox className="w-4 h-4 text-purple-500 dark:text-purple-400" />;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      updateTaskTimeframe(taskId, timeframe);
    }
  };

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inlineTitle.trim();
    if (!clean) return;

    setInlineTitle("");
    setIsQuickAdding(false);
    addTask(clean, inlineCategory, timeframe);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col rounded-2xl transition-all duration-200 border ${
        isPrimary
          ? "bg-zinc-50/80 dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-700/80 ring-1 ring-zinc-300/60 dark:ring-zinc-700/60 shadow-xs"
          : "bg-zinc-50/40 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800"
      } ${
        isDragOver
          ? "border-sky-500 dark:border-sky-400 bg-sky-50/40 dark:bg-sky-950/20 ring-2 ring-sky-400/40"
          : ""
      }`}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 shadow-2xs border border-zinc-200/80 dark:border-zinc-700/60">
            {getIcon()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {title}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                {pendingTasks.length}
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Inline Add Button */}
        <button
          onClick={() => setIsQuickAdding(!isQuickAdding)}
          className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          title={`Tambah tugas ke ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Inline Quick Add Form if opened */}
      {isQuickAdding && (
        <form
          onSubmit={handleInlineSubmit}
          className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 space-y-2"
        >
          <input
            type="text"
            value={inlineTitle}
            onChange={(e) => setInlineTitle(e.target.value)}
            placeholder={`Tugas baru untuk ${title}...`}
            className="w-full text-xs bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
            autoFocus
          />
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setInlineCategory("work")}
                className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                  inlineCategory === "work"
                    ? "bg-sky-600 text-white"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                }`}
              >
                <Building2 className="w-2.5 h-2.5" /> Kantor
              </button>
              <button
                type="button"
                onClick={() => setInlineCategory("home")}
                className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                  inlineCategory === "home"
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                }`}
              >
                <Home className="w-2.5 h-2.5" /> Rumah
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsQuickAdding(false)}
                className="text-[11px] px-2 py-0.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!inlineTitle.trim()}
                className="text-[11px] px-2.5 py-0.5 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium disabled:opacity-40"
              >
                Simpan
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Task List Container */}
      <div className="p-3 flex-1 flex flex-col gap-2 min-h-[300px]">
        {pendingTasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center px-4">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-2">
              {timeframe === "today" ? (
                <Sparkles className="w-5 h-5 text-amber-500/80" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {timeframe === "today"
                ? "Semua fokus hari ini beres!"
                : timeframe === "tomorrow"
                ? "Belum ada rencana esok hari"
                : "Inbox bersih"}
            </p>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 max-w-[200px]">
              {timeframe === "today"
                ? "Tarik tugas dari Besok atau Inbox jika butuh hal lain."
                : timeframe === "tomorrow"
                ? "Siapkan tugas malam ini untuk hari esok."
                : "Tempat catatan cepat tanpa perlu dijadwalkan sekarang."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}

        {/* Completed Tasks Accordion */}
        {completedTasks.length > 0 && (
          <div className="mt-auto pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                {showCompleted ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                <span>Selesai ({completedTasks.length})</span>
              </button>

              {showCompleted && (
                <button
                  type="button"
                  onClick={() => clearCompleted(timeframe)}
                  className="text-[10px] text-zinc-500 hover:text-red-500 transition-colors"
                  title="Hapus semua tugas selesai di kolom ini"
                >
                  Bersihkan
                </button>
              )}
            </div>

            {showCompleted && (
              <div className="space-y-1.5">
                {completedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
