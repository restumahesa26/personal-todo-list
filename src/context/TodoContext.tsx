"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  Task,
  Category,
  Timeframe,
  CategoryFilter,
  TaskStatus,
  ConnectionStatus,
} from "@/types/todo";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";

interface TodoContextType {
  tasks: Task[];
  loading: boolean;
  isFirebaseActive: boolean;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  connectionError: string | null;
  retryConnection: () => void;
  categoryFilter: CategoryFilter;
  setCategoryFilter: (filter: CategoryFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addTask: (title: string, category: Category, timeframe: Timeframe) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  updateTaskTimeframe: (id: string, timeframe: Timeframe) => Promise<void>;
  updateTaskCategory: (id: string, category: Category) => Promise<void>;
  editTaskTitle: (id: string, newTitle: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  startNewDay: (moveUnfinishedTodayToInbox: boolean) => Promise<{ movedTomorrow: number; movedUnfinished: number }>;
  clearCompleted: (timeframe?: Timeframe) => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

const CACHED_TASKS_KEY = "mdf_cached_tasks_v3";

export function TodoProvider({ children }: { children: React.ReactNode }) {
  // 1. Initial state is [] to guarantee server and client render identical HTML on initial hydration pass
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const isFirebaseActive = Boolean(isFirebaseConfigured && db);

  // Directly CONNECTED in 0ms if .env is configured
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    isFirebaseConfigured ? "connected" : "not_configured"
  );

  const isConnected = connectionStatus === "connected";

  // Helper to persist to localStorage immediately
  const saveToLocalCache = useCallback((updatedTasks: Task[]) => {
    try {
      localStorage.setItem(CACHED_TASKS_KEY, JSON.stringify(updatedTasks));
    } catch {
      // ignore
    }
  }, []);

  // Hydrate on mount in case window was not ready during SSR
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHED_TASKS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks((prev) => (prev.length === 0 ? parsed : prev));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // 2. Real-time direct Firestore sync with smart merge (prevents overwriting local tasks)
  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setConnectionStatus("not_configured");
      setConnectionError("Konfigurasi Firebase belum diisi di file .env");
      return;
    }

    const firestore = db;
    const tasksRef = collection(firestore, "tasks");

    const unsubscribe = onSnapshot(
      tasksRef,
      (snapshot) => {
        const serverTasks: Task[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          serverTasks.push({
            id: docSnap.id,
            title: data.title || "",
            category: data.category || "work",
            status: data.status || "pending",
            timeframe: data.timeframe || "today",
            createdAt: typeof data.createdAt === "number" ? data.createdAt : Date.now(),
            completedAt: typeof data.completedAt === "number" ? data.completedAt : undefined,
          });
        });

        setTasks((currentTasks) => {
          // Create map from server tasks
          const taskMap = new Map<string, Task>();
          serverTasks.forEach((t) => taskMap.set(t.id, t));

          // Retain recent local tasks that haven't been acknowledged by Firestore yet
          const now = Date.now();
          currentTasks.forEach((localTask) => {
            if (!taskMap.has(localTask.id)) {
              // Keep local task if created within the last 5 minutes to prevent premature wipe
              if (now - localTask.createdAt < 300000) {
                taskMap.set(localTask.id, localTask);
              }
            }
          });

          const merged = Array.from(taskMap.values()).sort(
            (a, b) => b.createdAt - a.createdAt
          );

          saveToLocalCache(merged);
          return merged;
        });

        setConnectionStatus("connected");
        setConnectionError(null);
      },
      (error) => {
        console.warn("Firestore sync warning:", error);
        // Only set error status if it's permission-denied
        if (error.code === "permission-denied") {
          setConnectionStatus("error");
          setConnectionError(
            error.message ||
              "Gagal mengakses database Firestore. Pastikan Firestore rules mengizinkan read/write (allow read, write: if true;)."
          );
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [retryTrigger, saveToLocalCache]);

  // Retry trigger handler
  const retryConnection = () => {
    setConnectionError(null);
    setConnectionStatus("connected");
    setRetryTrigger((prev) => prev + 1);
  };

  // Add Task (Instant 0ms Optimistic UI + Non-blocking Firestore Sync)
  const addTask = async (title: string, category: Category, timeframe: Timeframe) => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const newTask: Task = {
      id: "task_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9),
      title: cleanTitle,
      category,
      timeframe,
      status: "pending",
      createdAt: Date.now(),
    };

    // 1. Immediately update state & localStorage (0ms perceived latency)
    setTasks((prev) => {
      const next = [newTask, ...prev];
      saveToLocalCache(next);
      return next;
    });

    // 2. Sync to Firestore in background without blocking the caller
    if (db) {
      const firestore = db;
      const payload: Record<string, unknown> = {
        id: newTask.id,
        title: newTask.title,
        category: newTask.category,
        timeframe: newTask.timeframe,
        status: newTask.status,
        createdAt: newTask.createdAt,
      };

      const taskRef = doc(firestore, "tasks", newTask.id);
      setDoc(taskRef, payload).catch((err) => {
        console.warn("Background Firestore setDoc notice:", err);
      });
    }
  };

  // Toggle Task Status (Instant Optimistic + Background Sync)
  const toggleTaskStatus = async (id: string) => {
    let updatedTask: Task | undefined;

    setTasks((prev) => {
      const next = prev.map((t) => {
        if (t.id === id) {
          const newStatus: TaskStatus = t.status === "pending" ? "completed" : "pending";
          const completedAt = newStatus === "completed" ? Date.now() : undefined;
          updatedTask = { ...t, status: newStatus, completedAt };
          return updatedTask;
        }
        return t;
      });
      saveToLocalCache(next);
      return next;
    });

    if (db && updatedTask) {
      const firestore = db;
      const taskRef = doc(firestore, "tasks", id);
      const updateData: Record<string, unknown> = {
        status: (updatedTask as Task).status,
        completedAt: (updatedTask as Task).completedAt || null,
      };

      updateDoc(taskRef, updateData).catch((err) => {
        console.warn("Background Firestore updateDoc notice:", err);
      });
    }
  };

  // Update Timeframe (Instant Optimistic + Background Sync)
  const updateTaskTimeframe = async (id: string, timeframe: Timeframe) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, timeframe } : t));
      saveToLocalCache(next);
      return next;
    });

    if (db) {
      const firestore = db;
      const taskRef = doc(firestore, "tasks", id);
      updateDoc(taskRef, { timeframe }).catch((err) => {
        console.warn("Background Firestore updateTimeframe notice:", err);
      });
    }
  };

  // Update Category (Instant Optimistic + Background Sync)
  const updateTaskCategory = async (id: string, category: Category) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, category } : t));
      saveToLocalCache(next);
      return next;
    });

    if (db) {
      const firestore = db;
      const taskRef = doc(firestore, "tasks", id);
      updateDoc(taskRef, { category }).catch((err) => {
        console.warn("Background Firestore updateCategory notice:", err);
      });
    }
  };

  // Edit Title (Instant Optimistic + Background Sync)
  const editTaskTitle = async (id: string, newTitle: string) => {
    const clean = newTitle.trim();
    if (!clean) return;

    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, title: clean } : t));
      saveToLocalCache(next);
      return next;
    });

    if (db) {
      const firestore = db;
      const taskRef = doc(firestore, "tasks", id);
      updateDoc(taskRef, { title: clean }).catch((err) => {
        console.warn("Background Firestore editTitle notice:", err);
      });
    }
  };

  // Delete Task (Instant Optimistic + Background Sync)
  const deleteTask = async (id: string) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveToLocalCache(next);
      return next;
    });

    if (db) {
      const firestore = db;
      const taskRef = doc(firestore, "tasks", id);
      deleteDoc(taskRef).catch((err) => {
        console.warn("Background Firestore deleteDoc notice:", err);
      });
    }
  };

  // "Mulai Hari Baru" (Start New Day / Midnight Reset)
  const startNewDay = async (moveUnfinishedTodayToInbox: boolean) => {
    let movedTomorrow = 0;
    let movedUnfinished = 0;

    const updated = tasks.map((t) => {
      if (t.timeframe === "tomorrow") {
        movedTomorrow++;
        return { ...t, timeframe: "today" as Timeframe };
      }
      if (
        t.timeframe === "today" &&
        t.status === "pending" &&
        moveUnfinishedTodayToInbox
      ) {
        movedUnfinished++;
        return { ...t, timeframe: "inbox" as Timeframe };
      }
      return t;
    });

    setTasks(updated);
    saveToLocalCache(updated);

    if (db) {
      try {
        const firestore = db;
        const batch = writeBatch(firestore);
        tasks.forEach((t) => {
          if (t.timeframe === "tomorrow") {
            const ref = doc(firestore, "tasks", t.id);
            batch.update(ref, { timeframe: "today" });
          } else if (
            t.timeframe === "today" &&
            t.status === "pending" &&
            moveUnfinishedTodayToInbox
          ) {
            const ref = doc(firestore, "tasks", t.id);
            batch.update(ref, { timeframe: "inbox" });
          }
        });
        batch.commit().catch((err) => {
          console.warn("Background Firestore batch notice:", err);
        });
      } catch (err) {
        console.warn("Firestore batch setup error:", err);
      }
    }

    return { movedTomorrow, movedUnfinished };
  };

  // Clear completed tasks
  const clearCompleted = async (timeframe?: Timeframe) => {
    const toRemove = tasks.filter(
      (t) => t.status === "completed" && (!timeframe || t.timeframe === timeframe)
    );

    if (toRemove.length === 0) return;

    const remaining = tasks.filter(
      (t) => !(t.status === "completed" && (!timeframe || t.timeframe === timeframe))
    );

    setTasks(remaining);
    saveToLocalCache(remaining);

    if (db) {
      try {
        const firestore = db;
        const batch = writeBatch(firestore);
        toRemove.forEach((t) => {
          const ref = doc(firestore, "tasks", t.id);
          batch.delete(ref);
        });
        batch.commit().catch((err) => {
          console.warn("Background Firestore clearCompleted notice:", err);
        });
      } catch (err) {
        console.warn("Firestore clearCompleted setup error:", err);
      }
    }
  };

  return (
    <TodoContext.Provider
      value={{
        tasks,
        loading,
        isFirebaseActive,
        isConnected,
        connectionStatus,
        connectionError,
        retryConnection,
        categoryFilter,
        setCategoryFilter,
        searchQuery,
        setSearchQuery,
        addTask,
        toggleTaskStatus,
        updateTaskTimeframe,
        updateTaskCategory,
        editTaskTitle,
        deleteTask,
        startNewDay,
        clearCompleted,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodo() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error("useTodo must be used within a TodoProvider");
  }
  return context;
}
