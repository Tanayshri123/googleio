"use client";

import { motion } from "framer-motion";
import { MapPin, MessageCircle, LayoutDashboard, Map, Users } from "lucide-react";

/** Tsenta-style product preview — sidebar + main panel */
export function DashboardMock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.15 }}
      className="relative mx-auto w-full max-w-[580px]"
    >
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_24px_80px_-12px_rgba(0,0,0,0.12)]">
        <div className="flex min-h-[420px]">
          {/* Sidebar */}
          <div className="hidden w-[148px] shrink-0 border-r border-neutral-100 bg-neutral-50/80 p-3 sm:block">
            <p className="mb-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Scout
            </p>
            {[
              { icon: LayoutDashboard, label: "Dashboard", active: false },
              { icon: Map, label: "Battle Plan", active: true },
              { icon: MessageCircle, label: "Ask Scout", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium ${
                  item.active
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </div>
            ))}
            <div className="mt-auto border-t border-neutral-200 pt-3">
              <div className="flex items-center gap-2 px-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-bold">
                  AM
                </div>
                <div>
                  <p className="text-[11px] font-medium text-neutral-800">Your team</p>
                  <p className="text-[10px] text-neutral-400">Battle Plan live</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-neutral-400">Battle Plan</p>
                <p className="text-base font-semibold text-neutral-900">
                  Austin, United States
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                Live
              </span>
            </div>

            <div className="mb-4 h-[140px] overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50">
              <div className="relative h-full w-full">
                {[28, 48, 62, 78].map((left, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                    style={{ left: `${left}%`, top: `${35 + (i % 2) * 18}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                  >
                    <MapPin className="h-5 w-5 fill-red-500 text-red-500" />
                  </motion.div>
                ))}
              </div>
            </div>

            <p className="mb-2 text-[11px] font-medium text-neutral-500">Top matches</p>
            <div className="space-y-2">
              {[
                { name: "TableFlow ATX", pct: "94%" },
                { name: "KitchenPulse", pct: "87%" },
                { name: "ServeStack Pro", pct: "81%" },
              ].map((row, i) => (
                <motion.div
                  key={row.name}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.08 }}
                  className="flex items-center justify-between rounded-xl border border-neutral-100 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-[10px] font-bold text-neutral-600">
                      {row.name.slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium text-neutral-900">{row.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600">{row.pct}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-3 top-16 hidden rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-lg sm:block"
      >
        <p className="text-[10px] text-neutral-400">Cartographer</p>
        <p className="text-xs font-medium text-neutral-800">Maps · 6 pins</p>
      </motion.div>

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        className="absolute -left-2 bottom-20 hidden rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-lg sm:block"
      >
        <Users className="mb-1 h-3.5 w-3.5 text-neutral-400" />
        <p className="text-xs font-medium text-neutral-800">3 contacts found</p>
      </motion.div>
    </motion.div>
  );
}
