"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  Task,
  Category,
  Timeframe,
  CategoryFilter,
  TaskStatus,
  ConnectionStatus,
  SyncStatus,
} from "@/types/todo";
import { db, isFirebaseConfigured, isDevMode } from "@/lib/firebase";
import { INITIAL_DUMMY_TASKS } from "@/lib/dummyData";
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
  isDevMode: boolean;
  resetDummyData: () => void;
  connectionStatus: ConnectionStatus;
  connectionError: string | null;
  retryConnection: () => void;
  syncStatus: SyncStatus;
  pendingSyncCount: number;
  isTaskSyncing: (id: string) => boolean;
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

const CACHED_TASKS_KEY = isDevMode ? "mdf_cached_tasks_dev_v1" : "mdf_cached_tasks_v3";
const PENDING_MUTATIONS_KEY = "mdf_pending_sync_v2";

// Helper untuk membaca pending mutations yang belum terkonfirmasi dari localStorage
const getPendingMutations = (): Record<string, Record<string, unknown>> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PENDING_MUTATIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const savePendingMutation = (id: string, payload: Record<string, unknown>) => {
  if (typeof window === "undefined") return;
  try {
    const current = getPendingMutations();
    current[id] = payload;
    localStorage.setItem(PENDING_MUTATIONS_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
};

const removePendingMutation = (id: string) => {
  if (typeof window === "undefined") return;
  try {
    const current = getPendingMutations();
    delete current[id];
    if (Object.keys(current).length === 0) {
      localStorage.removeItem(PENDING_MUTATIONS_KEY);
    } else {
      localStorage.setItem(PENDING_MUTATIONS_KEY, JSON.stringify(current));
    }
  } catch {
    // ignore
  }
};

export function TodoProvider({ children }: { children: React.ReactNode }) {
  // 1. Initial state is [] to guarantee server and client render identical HTML on initial hydration pass
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Sync UX State
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [syncingTaskIds, setSyncingTaskIds] = useState<Set<string>>(new Set());

  // Refs for race condition & conflict resolution
  const pendingSyncRef = useRef<Set<string>>(new Set());
  const pendingDeletesRef = useRef<Set<string>>(new Set());
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isFirebaseActive = Boolean(isFirebaseConfigured && db && !isDevMode);

  // Directly CONNECTED in 0ms if in dev mode or .env is configured
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    isDevMode ? "connected" : (isFirebaseConfigured ? "connected" : "not_configured")
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

  // Sync state tracking helpers
  const markTaskSyncing = useCallback((id: string) => {
    pendingSyncRef.current.add(id);
    setSyncingTaskIds(new Set(pendingSyncRef.current));
    setPendingSyncCount(pendingSyncRef.current.size);
    setSyncStatus("syncing");
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
  }, []);

  const markTaskSynced = useCallback((id: string) => {
    pendingSyncRef.current.delete(id);
    setSyncingTaskIds(new Set(pendingSyncRef.current));
    setPendingSyncCount(pendingSyncRef.current.size);
    if (pendingSyncRef.current.size === 0) {
      setSyncStatus("synced");
      syncTimeoutRef.current = setTimeout(() => {
        setSyncStatus("idle");
      }, 3000);
    }
  }, []);

  const markTaskError = useCallback((id: string) => {
    pendingSyncRef.current.delete(id);
    setSyncingTaskIds(new Set(pendingSyncRef.current));
    setPendingSyncCount(pendingSyncRef.current.size);
    setSyncStatus("error");
  }, []);

  const isTaskSyncing = useCallback((id: string) => {
    return syncingTaskIds.has(id);
  }, [syncingTaskIds]);

  // Hydrate on mount in case window was not ready during SSR
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHED_TASKS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks((prev) => (prev.length === 0 ? parsed : prev));
          return;
        }
      }

      // Jika dalam mode dev dan cache kosong, gunakan data dummy bawaan
      if (isDevMode) {
        setTasks(INITIAL_DUMMY_TASKS);
        saveToLocalCache(INITIAL_DUMMY_TASKS);
      }
    } catch {
      if (isDevMode) {
        setTasks(INITIAL_DUMMY_TASKS);
      }
    }
  }, [saveToLocalCache]);

  // Reset data dummy ke kondisi awal
  const resetDummyData = useCallback(() => {
    if (!isDevMode) return;
    setTasks(INITIAL_DUMMY_TASKS);
    saveToLocalCache(INITIAL_DUMMY_TASKS);
  }, [saveToLocalCache]);

  // Intercept refresh / close tab saat sync masih berlangsung (UX Safety Guard)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingSyncRef.current.size > 0) {
        e.preventDefault();
        e.returnValue = "Perubahan sedang disimpan ke cloud. Tetap muat ulang?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Pulihkan perubahan pending yang belum selesai jika sebelumnya terjadi refresh
  useEffect(() => {
    if (isDevMode || !isFirebaseConfigured || !db) return;

    const pending = getPendingMutations();
    const pendingIds = Object.keys(pending);
    if (pendingIds.length === 0) return;

    const firestore = db;
    pendingIds.forEach(async (id) => {
      markTaskSyncing(id);
      try {
        const taskRef = doc(firestore, "tasks", id);
        await updateDoc(taskRef, pending[id]);
        removePendingMutation(id);
        markTaskSynced(id);
      } catch (err) {
        console.warn(`[Sync Recovery] Gagal sinkronisasi task ${id}:`, err);
        markTaskError(id);
      }
    });
  }, [markTaskSyncing, markTaskSynced, markTaskError]);

  // 2. Real-time direct Firestore sync with smart conflict resolution
  useEffect(() => {
    if (isDevMode) {
      setConnectionStatus("connected");
      setConnectionError(null);
      return;
    }

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
            updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : undefined,
          });
        });

        setTasks((currentTasks) => {
          const currentMap = new Map<string, Task>();
          currentTasks.forEach((t) => currentMap.set(t.id, t));

          const mergedMap = new Map<string, Task>();
          const pendingMutations = getPendingMutations();

          // Proses setiap dokumen dari server
          for (const serverTask of serverTasks) {
            // Jika dokumen sedang dalam proses hapus lokal, jangan tampilkan kembali
            if (pendingDeletesRef.current.has(serverTask.id)) {
              continue;
            }

            const localTask = currentMap.get(serverTask.id);

            if (!localTask) {
              mergedMap.set(serverTask.id, serverTask);
            } else {
              // Smart Merge: Cegah penimpaan task yang baru saja dicentang / dimodifikasi di client
              const isPendingSync =
                pendingSyncRef.current.has(serverTask.id) ||
                Boolean(pendingMutations[serverTask.id]);
              const localIsNewer =
                typeof localTask.updatedAt === "number" &&
                typeof serverTask.updatedAt === "number" &&
                localTask.updatedAt > serverTask.updatedAt;
              const recentlyModifiedLocally =
                typeof localTask.updatedAt === "number" &&
                Date.now() - localTask.updatedAt < 25000; // 25 detik grace period

              if (isPendingSync || localIsNewer || recentlyModifiedLocally) {
                // Pertahankan state lokal yang lebih segar (misal sudah dicentang)
                mergedMap.set(serverTask.id, localTask);
              } else {
                mergedMap.set(serverTask.id, serverTask);
              }
            }
          }

          // Pertahankan task lokal baru yang belum sempat tercatat di snapshot server
          const now = Date.now();
          currentTasks.forEach((localTask) => {
            if (!mergedMap.has(localTask.id) && !pendingDeletesRef.current.has(localTask.id)) {
              if (now - localTask.createdAt < 300000) {
                mergedMap.set(localTask.id, localTask);
              }
            }
          });

          const merged = Array.from(mergedMap.values()).sort(
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

  // Add Task (Instant Optimistic + Background Sync)
  const addTask = async (title: string, category: Category, timeframe: Timeframe) => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const now = Date.now();
    const newTask: Task = {
      id: "task_" + now + "_" + Math.random().toString(36).substring(2, 9),
      title: cleanTitle,
      category,
      timeframe,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    // 1. Instant 0ms UI update
    setTasks((prev) => {
      const next = [newTask, ...prev];
      saveToLocalCache(next);
      return next;
    });

    // 2. Sync to Firestore in background
    if (db && !isDevMode) {
      markTaskSyncing(newTask.id);
      const payload: Record<string, unknown> = {
        id: newTask.id,
        title: newTask.title,
        category: newTask.category,
        timeframe: newTask.timeframe,
        status: newTask.status,
        createdAt: newTask.createdAt,
        updatedAt: now,
      };

      savePendingMutation(newTask.id, payload);

      try {
        const firestore = db;
        const taskRef = doc(firestore, "tasks", newTask.id);
        await setDoc(taskRef, payload);
        removePendingMutation(newTask.id);
        markTaskSynced(newTask.id);
      } catch (err) {
        console.warn("Background Firestore setDoc notice:", err);
        markTaskError(newTask.id);
      }
    }
  };

  // Toggle Task Status (Instant Optimistic + Bulletproof Queue & Background Sync)
  const toggleTaskStatus = async (id: string) => {
    let updatedTask: Task | undefined;
    const now = Date.now();

    // 1. Instant optimistic update
    setTasks((prev) => {
      const next = prev.map((t) => {
        if (t.id === id) {
          const newStatus: TaskStatus = t.status === "pending" ? "completed" : "pending";
          const completedAt = newStatus === "completed" ? now : undefined;
          updatedTask = { ...t, status: newStatus, completedAt, updatedAt: now };
          return updatedTask;
        }
        return t;
      });
      saveToLocalCache(next);
      return next;
    });

    // 2. Reliable background sync with mutation tracking
    if (db && !isDevMode && updatedTask) {
      markTaskSyncing(id);
      const updateData: Record<string, unknown> = {
        status: (updatedTask as Task).status,
        completedAt: (updatedTask as Task).completedAt || null,
        updatedAt: now,
      };

      savePendingMutation(id, updateData);

      try {
        const firestore = db;
        const taskRef = doc(firestore, "tasks", id);
        await updateDoc(taskRef, updateData);
        removePendingMutation(id);
        markTaskSynced(id);
      } catch (err) {
        console.warn("Background Firestore updateDoc notice:", err);
        markTaskError(id);
      }
    }
  };

  // Update Timeframe (Instant Optimistic + Background Sync)
  const updateTaskTimeframe = async (id: string, timeframe: Timeframe) => {
    const now = Date.now();
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, timeframe, updatedAt: now } : t));
      saveToLocalCache(next);
      return next;
    });

    if (db && !isDevMode) {
      markTaskSyncing(id);
      const updateData = { timeframe, updatedAt: now };
      savePendingMutation(id, updateData);

      try {
        const firestore = db;
        const taskRef = doc(firestore, "tasks", id);
        await updateDoc(taskRef, updateData);
        removePendingMutation(id);
        markTaskSynced(id);
      } catch (err) {
        console.warn("Background Firestore updateTimeframe notice:", err);
        markTaskError(id);
      }
    }
  };

  // Update Category (Instant Optimistic + Background Sync)
  const updateTaskCategory = async (id: string, category: Category) => {
    const now = Date.now();
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, category, updatedAt: now } : t));
      saveToLocalCache(next);
      return next;
    });

    if (db && !isDevMode) {
      markTaskSyncing(id);
      const updateData = { category, updatedAt: now };
      savePendingMutation(id, updateData);

      try {
        const firestore = db;
        const taskRef = doc(firestore, "tasks", id);
        await updateDoc(taskRef, updateData);
        removePendingMutation(id);
        markTaskSynced(id);
      } catch (err) {
        console.warn("Background Firestore updateCategory notice:", err);
        markTaskError(id);
      }
    }
  };

  // Edit Title (Instant Optimistic + Background Sync)
  const editTaskTitle = async (id: string, newTitle: string) => {
    const clean = newTitle.trim();
    if (!clean) return;

    const now = Date.now();
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, title: clean, updatedAt: now } : t));
      saveToLocalCache(next);
      return next;
    });

    if (db && !isDevMode) {
      markTaskSyncing(id);
      const updateData = { title: clean, updatedAt: now };
      savePendingMutation(id, updateData);

      try {
        const firestore = db;
        const taskRef = doc(firestore, "tasks", id);
        await updateDoc(taskRef, updateData);
        removePendingMutation(id);
        markTaskSynced(id);
      } catch (err) {
        console.warn("Background Firestore editTitle notice:", err);
        markTaskError(id);
      }
    }
  };

  // Delete Task (Instant Optimistic + Background Sync)
  const deleteTask = async (id: string) => {
    pendingDeletesRef.current.add(id);

    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveToLocalCache(next);
      return next;
    });

    if (db && !isDevMode) {
      markTaskSyncing(id);
      removePendingMutation(id);

      try {
        const firestore = db;
        const taskRef = doc(firestore, "tasks", id);
        await deleteDoc(taskRef);
        pendingDeletesRef.current.delete(id);
        markTaskSynced(id);
      } catch (err) {
        console.warn("Background Firestore deleteDoc notice:", err);
        pendingDeletesRef.current.delete(id);
        markTaskError(id);
      }
    } else {
      pendingDeletesRef.current.delete(id);
    }
  };

  // "Mulai Hari Baru" (Start New Day / Midnight Reset)
  const startNewDay = async (moveUnfinishedTodayToInbox: boolean) => {
    let movedTomorrow = 0;
    let movedUnfinished = 0;
    const now = Date.now();

    const updated = tasks.map((t) => {
      if (t.timeframe === "tomorrow") {
        movedTomorrow++;
        return { ...t, timeframe: "today" as Timeframe, updatedAt: now };
      }
      if (
        t.timeframe === "today" &&
        t.status === "pending" &&
        moveUnfinishedTodayToInbox
      ) {
        movedUnfinished++;
        return { ...t, timeframe: "inbox" as Timeframe, updatedAt: now };
      }
      return t;
    });

    setTasks(updated);
    saveToLocalCache(updated);

    if (db && !isDevMode) {
      try {
        setSyncStatus("syncing");
        const firestore = db;
        const batch = writeBatch(firestore);
        tasks.forEach((t) => {
          if (t.timeframe === "tomorrow") {
            const ref = doc(firestore, "tasks", t.id);
            batch.update(ref, { timeframe: "today", updatedAt: now });
          } else if (
            t.timeframe === "today" &&
            t.status === "pending" &&
            moveUnfinishedTodayToInbox
          ) {
            const ref = doc(firestore, "tasks", t.id);
            batch.update(ref, { timeframe: "inbox", updatedAt: now });
          }
        });
        await batch.commit();
        setSyncStatus("synced");
        setTimeout(() => setSyncStatus("idle"), 3000);
      } catch (err) {
        console.warn("Firestore batch setup error:", err);
        setSyncStatus("error");
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

    toRemove.forEach((t) => pendingDeletesRef.current.add(t.id));

    const remaining = tasks.filter(
      (t) => !(t.status === "completed" && (!timeframe || t.timeframe === timeframe))
    );

    setTasks(remaining);
    saveToLocalCache(remaining);

    if (db && !isDevMode) {
      try {
        setSyncStatus("syncing");
        const firestore = db;
        const batch = writeBatch(firestore);
        toRemove.forEach((t) => {
          const ref = doc(firestore, "tasks", t.id);
          batch.delete(ref);
        });
        await batch.commit();
        toRemove.forEach((t) => pendingDeletesRef.current.delete(t.id));
        setSyncStatus("synced");
        setTimeout(() => setSyncStatus("idle"), 3000);
      } catch (err) {
        console.warn("Firestore clearCompleted setup error:", err);
        toRemove.forEach((t) => pendingDeletesRef.current.delete(t.id));
        setSyncStatus("error");
      }
    } else {
      toRemove.forEach((t) => pendingDeletesRef.current.delete(t.id));
    }
  };

  return (
    <TodoContext.Provider
      value={{
        tasks,
        loading,
        isFirebaseActive,
        isConnected,
        isDevMode,
        resetDummyData,
        connectionStatus,
        connectionError,
        retryConnection,
        syncStatus,
        pendingSyncCount,
        isTaskSyncing,
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
