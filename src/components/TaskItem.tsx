"use client";

import React, { useState, useRef, useEffect } from "react";
import { Task, Category, Timeframe } from "@/types/todo";
import { useTodo } from "@/context/TodoContext";
import {
  Check,
  Trash2,
  Building2,
  Home,
  ArrowRight,
  ArrowLeft,
  Inbox,
  Calendar,
  CalendarClock,
  MoreHorizontal,
  Edit2,
  GripVertical,
  Loader2,
} from "lucide-react";

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const {
    toggleTaskStatus,
    updateTaskTimeframe,
    updateTaskCategory,
    editTaskTitle,
    deleteTask,
    isTaskSyncing,
  } = useTodo();

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const isCompleted = task.status === "completed";

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleSaveEdit = () => {
    const trimmed = editedTitle.trim();
    if (trimmed && trimmed !== task.title) {
      editTaskTitle(task.id, trimmed);
    } else {
      setEditedTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setEditedTitle(task.title);
      setIsEditing(false);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const toggleCategory = () => {
    const nextCat: Category = task.category === "work" ? "home" : "work";
    updateTaskCategory(task.id, nextCat);
  };

  return (
    <div
      draggable={!isEditing}
      onDragStart={handleDragStart}
      className={`group relative flex items-start gap-2.5 p-3 rounded-xl border transition-all duration-150 ${
        isCompleted
          ? "bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/40 opacity-75"
          : "bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-sm"
      }`}
    >
      {/* Drag handle (subtle) */}
      <div
        className="mt-0.5 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 cursor-grab active:cursor-grabbing hidden sm:block"
        title="Geser untuk memindahkan ke kolom lain"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Checkbox button */}
      <button
        type="button"
        onClick={() => toggleTaskStatus(task.id)}
        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 cursor-pointer ${
          isCompleted
            ? "bg-emerald-600 border-emerald-600 text-white"
            : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 bg-transparent"
        } ${isTaskSyncing(task.id) ? "ring-2 ring-sky-400/30" : ""}`}
        aria-label={isCompleted ? "Tandai belum selesai" : "Tandai selesai"}
        title={
          isTaskSyncing(task.id)
            ? "Menyimpan ke cloud..."
            : isCompleted
            ? "Tandai belum selesai"
            : "Tandai selesai"
        }
      >
        {isTaskSyncing(task.id) ? (
          <Loader2
            className={`w-3 h-3 animate-spin stroke-[2.5] ${
              isCompleted ? "text-white" : "text-sky-600 dark:text-sky-400"
            }`}
          />
        ) : isCompleted ? (
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        ) : null}
      </button>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              ref={editInputRef}
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              className="w-full text-sm bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
            />
          </div>
        ) : (
          <div className="space-y-1">
            <p
              onDoubleClick={() => setIsEditing(true)}
              className={`text-sm leading-snug break-words select-text ${
                isCompleted
                  ? "line-through text-zinc-400 dark:text-zinc-500"
                  : "text-zinc-800 dark:text-zinc-200"
              }`}
              title="Klik dua kali untuk mengedit"
            >
              {task.title}
            </p>

            {/* Badges & Quick Move Actions */}
            <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
              {/* Category Badge (Clickable to switch) */}
              <button
                type="button"
                onClick={toggleCategory}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  task.category === "work"
                    ? "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60"
                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                }`}
                title="Klik untuk ganti kategori Kantor / Rumah"
              >
                {task.category === "work" ? (
                  <>
                    <Building2 className="w-2.5 h-2.5" />
                    <span>Kantor</span>
                  </>
                ) : (
                  <>
                    <Home className="w-2.5 h-2.5" />
                    <span>Rumah</span>
                  </>
                )}
              </button>

              {/* In-flight Sync indicator for this specific task */}
              {isTaskSyncing(task.id) && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 animate-pulse">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  <span>Menyimpan...</span>
                </span>
              )}

              {/* Quick Timeframe Shift Buttons */}
              <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150 flex items-center flex-wrap gap-1">
                {task.timeframe !== "today" && (
                  <button
                    type="button"
                    onClick={() => updateTaskTimeframe(task.id, "today")}
                    className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
                    title="Pindahkan ke Hari Ini"
                  >
                    <span>→ Hari Ini</span>
                  </button>
                )}

                {task.timeframe !== "tomorrow" && (
                  <button
                    type="button"
                    onClick={() => updateTaskTimeframe(task.id, "tomorrow")}
                    className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
                    title="Pindahkan ke Besok"
                  >
                    <span>→ Besok</span>
                  </button>
                )}

                {task.timeframe !== "inbox" && (
                  <button
                    type="button"
                    onClick={() => updateTaskTimeframe(task.id, "inbox")}
                    className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
                    title="Pindahkan ke Inbox"
                  >
                    <span>→ Inbox</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Actions: Edit & Delete */}
      <div className="flex items-center gap-0.5 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="p-1.5 sm:p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Edit judul tugas"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => deleteTask(task.id)}
          className="p-1.5 sm:p-1 rounded text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          title="Hapus tugas"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
