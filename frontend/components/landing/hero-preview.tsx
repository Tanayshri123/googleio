"use client";

import { motion } from "framer-motion";
import { MapPin, Users, TrendingUp, Sparkles } from "lucide-react";

export function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="relative mx-auto w-full max-w-lg lg:mx-0"
    >
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-pink-300/30 via-rose-200/20 to-pink-100/40 blur-2xl" />

      <div className="relative overflow-hidden rounded-[1.75rem] border border-pink-100 bg-white p-5 shadow-2xl shadow-pink-200/40">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-pink-500">
              Battle Plan
            </p>
            <p className="text-lg font-semibold text-neutral-900">
              Austin, United States
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-medium text-pink-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-500" />
            Live
          </span>
        </div>

        <div className="mb-4 h-36 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 via-white to-rose-50 p-3 ring-1 ring-pink-100">
          <div className="relative h-full w-full rounded-xl bg-white/50">
            {[35, 55, 72, 48].map((left, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.12, type: "spring" }}
                style={{ left: `${left}%`, top: `${30 + (i % 2) * 20}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <MapPin className="h-6 w-6 fill-pink-500 text-pink-500 drop-shadow" />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: TrendingUp, label: "4 competitors", sub: "mapped" },
            { icon: Users, label: "3 contacts", sub: "found" },
            { icon: Sparkles, label: "5 actions", sub: "week 1" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="rounded-xl border border-pink-50 bg-pink-50/50 p-2.5"
            >
              <stat.icon className="mb-1 h-4 w-4 text-pink-500" />
              <p className="text-xs font-semibold text-neutral-900">{stat.label}</p>
              <p className="text-[10px] text-neutral-400">{stat.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-4 top-8 rounded-2xl border border-pink-100 bg-white px-3 py-2 shadow-xl shadow-pink-100/50"
      >
        <p className="text-[10px] text-pink-400">Cartographer</p>
        <p className="text-xs font-medium text-neutral-800">Maps grounding</p>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -left-2 bottom-12 rounded-2xl border border-pink-100 bg-white px-3 py-2 shadow-xl shadow-pink-100/50"
      >
        <p className="text-[10px] text-pink-400">Networker</p>
        <p className="text-xs font-medium text-neutral-800">Search grounding</p>
      </motion.div>
    </motion.div>
  );
}
