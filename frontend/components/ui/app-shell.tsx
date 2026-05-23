"use client";

import { LayoutDashboard, Map, MessageCircle } from "lucide-react";

type Props = {
  children: React.ReactNode;
  active?: "dashboard" | "battle-plan" | "ask";
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
};

export function AppShell({
  children,
  active = "battle-plan",
  title,
  subtitle,
  headerAction,
}: Props) {
  const nav = [
    { id: "dashboard" as const, icon: LayoutDashboard, label: "Dashboard" },
    { id: "battle-plan" as const, icon: Map, label: "Scout Report" },
    { id: "ask" as const, icon: MessageCircle, label: "Ask Scout" },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex min-h-[calc(100vh-8rem)]">
          <aside className="hidden w-52 shrink-0 border-r border-neutral-100 bg-neutral-50/50 p-4 lg:block">
            <p className="mb-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Google AI Scout
            </p>
            {nav.map((item) => (
              <div
                key={item.id}
                className={`mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  active === item.id
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            ))}
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            {(title || headerAction) && (
              <div className="flex flex-col gap-3 border-b border-neutral-100 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                <div>
                  {title && (
                    <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="mt-1 max-w-2xl text-sm text-neutral-600">{subtitle}</p>
                  )}
                </div>
                {headerAction}
              </div>
            )}
            <div className="flex-1 p-5 sm:p-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
