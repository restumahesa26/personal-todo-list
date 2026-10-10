"use client";

import React, { useState } from "react";
import { useTodo } from "@/context/TodoContext";
import {
  AlertTriangle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

export const DatabaseRequiredView: React.FC = () => {
  const {
    connectionStatus,
    connectionError,
    retryConnection,
  } = useTodo();

  const [copied, setCopied] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  const copyEnvSample = () => {
    const text = `NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=1:...`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  if (connectionStatus === "connected") {
    return null;
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-2xs shrink-0 bg-white dark:bg-zinc-900 flex items-center justify-center p-0.5">
            <img
              src="/my-logo.png"
              alt="My Daily Focus"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
              My Daily Focus
            </h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Personal To-Do Management
            </p>
          </div>
        </div>

        {/* State 1: Connecting */}
        {connectionStatus === "connecting" && (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-900 dark:text-zinc-100" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Menghubungkan ke Database Firestore...
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Menyinkronkan data tugas cloud berdasarkan konfigurasi .env.
              </p>
            </div>
          </div>
        )}

        {/* State 2: Not Configured (.env missing) */}
        {connectionStatus === "not_configured" && (
          <div className="space-y-6">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  Konfigurasi Diperlukan
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Firebase Belum Dikonfigurasi di .env
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Aplikasi ini langsung terhubung ke database Firestore Anda tanpa memerlukan login. Pastikan konfigurasi proyek Firebase sudah dimasukkan ke file <code>.env</code>.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>Variabel konfigurasi di <code>.env</code>:</span>
                <button
                  onClick={copyEnvSample}
                  className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Disalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Format</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 bg-zinc-950 text-zinc-200 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-zinc-800">
                <code>{`NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...`}</code>
              </pre>
            </div>

            <div className="pt-2">
              <button
                onClick={retryConnection}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Muat Ulang Koneksi</span>
              </button>
            </div>
          </div>
        )}

        {/* State 3: Connection Error (Firestore Rules or Database missing) */}
        {connectionStatus === "error" && (
          <div className="space-y-6">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                  Akses Firestore Terkendala
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Gagal Membaca Database Firestore
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Firebase menolak akses atau database belum diaktifkan di Firebase Console Anda.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 space-y-1.5">
              <span className="text-[11px] font-medium text-rose-900 dark:text-rose-200 block">
                Pesan Kesalahan dari Firebase:
              </span>
              <p className="text-xs font-mono text-rose-700 dark:text-rose-300 break-words">
                {connectionError || "Unknown Firestore failure"}
              </p>
            </div>

            {/* Practical Solution Guide */}
            <div className="space-y-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Langkah Mengaktifkan Akses Langsung:
                </p>
                <button
                  onClick={copyRulesSample}
                  className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                >
                  {copiedRules ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Disalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Rules</span>
                    </>
                  )}
                </button>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                <li>
                  Buka{" "}
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-sky-600 hover:text-sky-700 font-medium inline-flex items-center gap-0.5"
                  >
                    console.firebase.google.com <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>Buka menu <strong>Build &gt; Firestore Database</strong>. (Klik <em>Create Database</em> jika belum dibuat).</li>
                <li>
                  Di tab <strong>Rules</strong>, karena aplikasi bersifat pribadi tanpa login, pastikan aturan mengizinkan baca & tulis:
                  <pre className="p-2 mt-1 rounded bg-zinc-900 text-zinc-200 font-mono text-[10px] overflow-x-auto">
                    <code>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}</code>
                  </pre>
                </li>
                <li>Klik tombol <strong>Publish</strong> di Firebase Console.</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="pt-1">
              <button
                onClick={retryConnection}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Hubungkan Ulang</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
