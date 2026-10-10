"use client";

import React, { useState } from "react";
import {
  Smartphone,
  Share2,
  PlusSquare,
  MoreVertical,
  X,
  Check,
  Download,
  AlertCircle,
  Laptop,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: BeforeInstallPromptEvent | null;
  onInstalled?: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstalled,
}) => {
  const [activeTab, setActiveTab] = useState<"android" | "ios">("android");
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    try {
      setIsInstalling(true);
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        onInstalled?.();
        onClose();
      }
    } catch (err) {
      console.warn("Install prompt error:", err);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-2xs shrink-0 bg-white dark:bg-zinc-900 flex items-center justify-center p-0.5">
              <img
                src="/my-logo.png"
                alt="My Daily Focus"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Pasang Daily Focus
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Akses cepat & bebas gangguan langsung dari Layar Utama HP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Click Native Install if available */}
        {deferredPrompt && (
          <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-between gap-3">
            <div className="text-xs">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                Dukungan Instalasi 1-Klik Tersedia
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Browser Anda mendukung instalasi langsung
              </p>
            </div>
            <button
              onClick={handleNativeInstall}
              disabled={isInstalling}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isInstalling ? "Memasang..." : "Pasang Sekarang"}</span>
            </button>
          </div>
        )}

        {/* Device Switcher Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("android")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
              activeTab === "android"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            🤖 Android (Chrome / Brave)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ios")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
              activeTab === "ios"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            🍎 iPhone / iPad (Safari)
          </button>
        </div>

        {/* Tab Content: Android Instructions */}
        {activeTab === "android" && (
          <div className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
            <ol className="space-y-2 list-decimal list-inside bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-200/70 dark:border-zinc-700/60 leading-relaxed">
              <li>
                Buka website di peramban <strong>Google Chrome</strong> di HP Anda.
              </li>
              <li>
                Ketuk ikon menu titik tiga (<MoreVertical className="w-3.5 h-3.5 inline align-text-bottom" />) di pojok kanan atas.
              </li>
              <li>
                Pilih menu <strong>"Instal Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama" (Add to Home screen)</strong>.
              </li>
              <li>
                Aplikasi akan otomatis muncul di Layar Utama HP dan dapat dibuka layar penuh (*full screen*).
              </li>
            </ol>

            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                <strong>Catatan Android:</strong> Jika dibuka lewat IP jaringan lokal (misal: <code>http://192.168.x.x:3000</code>), Chrome menganggap koneksi belum HTTPS sehingga tidak memunculkan notifikasi otomatis. Anda tetap bisa memasangnya lewat menu titik tiga (<MoreVertical className="w-3 h-3 inline" />).
              </p>
            </div>
          </div>
        )}

        {/* Tab Content: iOS Instructions */}
        {activeTab === "ios" && (
          <div className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
            <ol className="space-y-2 list-decimal list-inside bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-200/70 dark:border-zinc-700/60 leading-relaxed">
              <li>
                Buka website di browser <strong>Safari</strong> iPhone Anda.
              </li>
              <li>
                Ketuk tombol <strong>Bagikan</strong> (<Share2 className="w-3.5 h-3.5 inline align-text-bottom" />) di bilah bawah Safari.
              </li>
              <li>
                Gulir ke bawah dan ketuk <strong>"Tambah ke Layar Utama"</strong> (<PlusSquare className="w-3.5 h-3.5 inline align-text-bottom" />).
              </li>
              <li>
                Ketuk <strong>Tambah</strong> di pojok kanan atas. Aplikasi siap dibuka seperti aplikasi bawaan iOS.
              </li>
            </ol>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
