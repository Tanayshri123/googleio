"use client";

import { useCallback, useState } from "react";
import { FileText, Globe, AlignLeft, Upload, X } from "lucide-react";
import type { InputType } from "@/lib/types";
import { cn, isValidUrl } from "@/lib/utils";

const TABS: { id: InputType; label: string; icon: typeof FileText }[] = [
  { id: "pdf", label: "PDF", icon: FileText },
  { id: "website", label: "Website", icon: Globe },
  { id: "text", label: "Text", icon: AlignLeft },
];

export type CompanyInputValue = {
  inputType: InputType;
  file: File | null;
  websiteUrl: string;
  companyText: string;
};

type Props = {
  value: CompanyInputValue;
  onChange: (value: CompanyInputValue) => void;
};

export function CompanyInputTabs({ value, onChange }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const setType = (inputType: InputType) => {
    onChange({ ...value, inputType });
  };

  const onFile = useCallback(
    (file: File | null) => {
      if (file && file.type !== "application/pdf") return;
      onChange({ ...value, file });
    },
    [onChange, value],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-full border border-neutral-200/80 bg-neutral-100/60 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setType(tab.id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
              value.inputType === tab.id
                ? "bg-white text-neutral-900 shadow-md ring-1 ring-black/5"
                : "text-neutral-500 hover:text-neutral-800",
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {value.inputType === "pdf" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "relative flex min-h-[140px] flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors",
            dragOver
              ? "border-pink-400 bg-pink-50 ring-2 ring-pink-200"
              : "border-pink-100 bg-pink-50/30 hover:border-pink-200 hover:bg-white",
          )}
        >
          {value.file ? (
            <div className="flex items-center gap-3 px-4">
              <FileText className="h-8 w-8 text-pink-500" />
              <div className="text-left">
                <p className="font-medium text-neutral-900">{value.file.name}</p>
                <p className="text-sm text-neutral-500">
                  {(value.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => onFile(null)}
                className="ml-2 rounded-full p-1 hover:bg-neutral-100"
              >
                <X className="h-4 w-4 text-neutral-400" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="mb-2 h-8 w-8 text-neutral-400" />
              <p className="text-sm font-medium text-neutral-700">
                Drop your pitch deck here
              </p>
              <p className="mt-1 text-xs text-neutral-400">PDF up to 10MB</p>
              <label className="mt-4 cursor-pointer rounded-full bg-pink-500 px-4 py-2 text-xs font-medium text-white hover:bg-pink-600">
                Browse files
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </>
          )}
        </div>
      )}

      {value.inputType === "website" && (
        <div className="rounded-2xl border border-pink-100 bg-pink-50/30 p-1 focus-within:bg-white focus-within:ring-2 focus-within:ring-pink-500/20">
          <input
            type="url"
            placeholder="https://yourcompany.com"
            value={value.websiteUrl}
            onChange={(e) =>
              onChange({ ...value, websiteUrl: e.target.value })
            }
            className="w-full rounded-xl px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
          {value.websiteUrl && !isValidUrl(value.websiteUrl) && (
            <p className="px-4 pb-2 text-xs text-red-500">Enter a valid URL</p>
          )}
        </div>
      )}

      {value.inputType === "text" && (
        <textarea
          placeholder="Describe your company, product, target customers, and what makes you different…"
          value={value.companyText}
          onChange={(e) =>
            onChange({ ...value, companyText: e.target.value })
          }
          rows={5}
          className="w-full resize-none rounded-2xl border border-pink-100 bg-pink-50/30 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 focus:border-pink-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20"
        />
      )}
    </div>
  );
}

export function isCompanyInputValid(value: CompanyInputValue): boolean {
  if (value.inputType === "pdf") return Boolean(value.file);
  if (value.inputType === "website")
    return Boolean(value.websiteUrl) && isValidUrl(value.websiteUrl);
  return value.companyText.trim().length >= 50;
}
