"use client";

import React, { useState } from "react";
import { useTodo } from "@/context/TodoContext";
import {
  Cloud,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Database,
  ExternalLink,
} from "lucide-react";

interface FirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseModal: React.FC<FirebaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    isFirebaseActive,
    connectionStatus,
    connectionError,
    retryConnection,
  } = useTodo();
  const [copiedRules, setCopiedRules] = useState(false);

  if (!isOpen) return null;

  const copyRulesSample = () => {
    const text = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;
    navigator.clipboard.writeText(text);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
              <Database className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Koneksi Database Firebase
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Cloud Firestore (Akses Langsung Personal)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content based on status */}
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-800/50 flex items-center gap-2.5 text-xs text-sky-800 dark:text-sky-300">
            <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>
              Aplikasi personal terhubung langsung ke Firebase Firestore berdasarkan konfigurasi <code>.env</code> tanpa perlu akun login.
            </span>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Status Koneksi:</span>
              {connectionStatus === "connected" ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Terhubung & Sinkron
                </span>
              ) : connectionStatus === "connecting" ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  Menghubungkan...
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-medium">
                  Terputus / Error
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Proyek Firebase:</span>
              <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "personal-todo-f9c31"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Koleksi Data:</span>
              <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                tasks
              </span>
            </div>
          </div>

          {connectionError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="break-words">{connectionError}</span>
              </div>
              <div className="pt-2 border-t border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
                <span className="text-[11px]">Pastikan aturan Firestore diizinkan:</span>
                <button
                  onClick={copyRulesSample}
                  className="text-[11px] font-semibold underline text-rose-800 dark:text-rose-200 cursor-pointer"
                >
                  {copiedRules ? "Disalin!" : "Salin Rules"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <span>My Daily Focus — Personal Cloud</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-medium transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
