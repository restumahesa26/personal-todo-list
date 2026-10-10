"use client";

import React, { useState } from "react";
import { useTodo } from "@/context/TodoContext";
import { Sunrise, ArrowRight, Check, X, Inbox, Calendar, AlertCircle } from "lucide-react";

interface NewDayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewDayModal: React.FC<NewDayModalProps> = ({ isOpen, onClose }) => {
  const { tasks, startNewDay } = useTodo();
  const [moveUnfinishedToInbox, setMoveUnfinishedToInbox] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    movedTomorrow: number;
    movedUnfinished: number;
  } | null>(null);

  if (!isOpen) return null;

  const tomorrowCount = tasks.filter(
    (t) => t.timeframe === "tomorrow" && t.status === "pending"
  ).length;

  const unfinishedTodayCount = tasks.filter(
    (t) => t.timeframe === "today" && t.status === "pending"
  ).length;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const res = await startNewDay(moveUnfinishedToInbox);
      setSuccessInfo(res);
      setTimeout(() => {
        setSuccessInfo(null);
        setIsProcessing(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Sunrise className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Mulai Hari Baru
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Segarkan daftar fokus harian Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Feedback */}
        {successInfo ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
            <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              Hari Baru Dimulai!
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              {successInfo.movedTomorrow} tugas dari Besok dipindahkan ke Hari Ini.
              {successInfo.movedUnfinished > 0 &&
                ` ${successInfo.movedUnfinished} tugas belum selesai disimpan ke Inbox.`}
            </p>
          </div>
        ) : (
          <>
            {/* Overview description */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-sky-500" /> Tugas dari daftar "Besok":
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {tomorrowCount} tugas
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Semua tugas di daftar <strong>Besok</strong> akan otomatis dipindahkan menjadi fokus <strong>Hari Ini</strong>.
              </p>
            </div>

            {/* Unfinished Today Option */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                Bagaimana dengan sisa tugas "Hari Ini" yang belum selesai ({unfinishedTodayCount} tugas)?
              </label>

              <div className="space-y-1.5">
                <label
                  onClick={() => setMoveUnfinishedToInbox(false)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    !moveUnfinishedToInbox
                      ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/80 font-medium"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="unfinishedRule"
                    checked={!moveUnfinishedToInbox}
                    onChange={() => setMoveUnfinishedToInbox(false)}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="block text-zinc-900 dark:text-zinc-100">
                      Biarkan tetap di "Hari Ini" (Disarankan)
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal">
                      Tugas yang belum kelar kemarin tetap dilanjutkan hari ini.
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setMoveUnfinishedToInbox(true)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    moveUnfinishedToInbox
                      ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/80 font-medium"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="unfinishedRule"
                    checked={moveUnfinishedToInbox}
                    onChange={() => setMoveUnfinishedToInbox(true)}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="block text-zinc-900 dark:text-zinc-100">
                      Pindahkan kembali ke "Inbox"
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal">
                      Mulai hari dengan lembaran bersih, evaluasi sisa tugas nanti dari Inbox.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-xs transition-colors cursor-pointer"
              >
                <Sunrise className="w-3.5 h-3.5" />
                <span>{isProcessing ? "Memproses..." : "Mulai Hari Baru"}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
