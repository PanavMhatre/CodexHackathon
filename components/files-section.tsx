"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Eye,
  FileCheck2,
  FileText,
  MonitorPlay,
  NotebookPen,
  Share2,
  Upload,
  Users,
  X
} from "lucide-react";
import { friends, studyFiles } from "@/lib/mock-data";
import { StudyFile } from "@/lib/types";
import { cn, formatDateLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

type FileFilter = "All" | "PDF" | "Notes" | "Assignment" | "Slides";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function fileIcon(type: StudyFile["fileType"]) {
  switch (type) {
    case "PDF":        return { Icon: FileText,   bg: "bg-coral/12",  color: "text-coral"      };
    case "Notes":      return { Icon: NotebookPen, bg: "bg-fern/18",   color: "text-moss"       };
    case "Assignment": return { Icon: FileCheck2,  bg: "bg-amber/18",  color: "text-amber-700"  };
    case "Slides":     return { Icon: MonitorPlay, bg: "bg-lake/12",   color: "text-lake"       };
  }
}

function fileTypeBadge(type: StudyFile["fileType"]) {
  switch (type) {
    case "PDF":        return "bg-coral/10 text-coral border border-coral/20";
    case "Notes":      return "bg-fern/14 text-moss border border-fern/22";
    case "Assignment": return "bg-amber/14 text-amber-800 border border-amber/22";
    case "Slides":     return "bg-lake/10 text-lake border border-lake/20";
  }
}

/* ─── Share modal ─────────────────────────────────────────────────────────── */

function ShareModal({ file, onClose }: { file: StudyFile; onClose: () => void }) {
  const [shared, setShared] = useState<Set<string>>(new Set(file.sharedWith));
  const [copied, setCopied] = useState(false);
  const [lastShared, setLastShared] = useState<string | null>(null);

  function toggleFriend(id: string) {
    const next = new Set(shared);
    if (next.has(id)) { next.delete(id); } else {
      next.add(id);
      setLastShared(id);
      setTimeout(() => setLastShared(null), 1600);
    }
    setShared(next);
  }

  function handleCopy() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/25 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="panel w-full max-w-md rounded-b-none sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pb-1 pt-3 sm:hidden">
          <div className="h-1 w-8 rounded-full bg-ink/15" />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1 pr-3">
              <p className="eyebrow">Share File</p>
              <h3 className="mt-1 truncate font-serif text-2xl text-ink">{file.name}</h3>
              <p className="mt-0.5 text-xs text-ink/50">{file.subject}</p>
            </div>
            <Button variant="secondary" size="icon" className="shrink-0" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <button
            onClick={handleCopy}
            className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-moss/15 bg-moss/5 px-4 py-3.5 text-left transition hover:bg-moss/10 active:scale-[0.99]"
          >
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition", copied ? "bg-fern/30 text-moss" : "bg-moss/10 text-moss")}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{copied ? "Link copied!" : "Copy share link"}</p>
              <p className="text-xs text-ink/50">Anyone with this link can view</p>
            </div>
          </button>

          <div className="mt-5">
            <p className="eyebrow mb-3">Share with a classmate</p>
            <div className="space-y-2">
              {friends.map((friend) => {
                const isShared = shared.has(friend.id);
                const justShared = lastShared === friend.id;
                return (
                  <button
                    key={friend.id}
                    onClick={() => toggleFriend(friend.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.99]",
                      isShared ? "border-moss/25 bg-moss/8" : "border-white/60 bg-white/60 hover:bg-white/90"
                    )}
                  >
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition", isShared ? "bg-moss text-cream" : "bg-moss/10 text-moss")}>
                      {isShared ? <Check className="h-4 w-4" /> : friend.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink">{friend.name}</p>
                      <p className="text-xs text-ink/50">{friend.major}</p>
                    </div>
                    {justShared && <span className="text-xs font-semibold text-moss">Shared!</span>}
                    {isShared && !justShared && <span className="text-xs text-ink/40">Shared</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <Button variant="primary" className="mt-5 w-full" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}

/* ─── File row ────────────────────────────────────────────────────────────── */

function FileRow({
  file,
  isLast,
  onShare,
  delay
}: {
  file: StudyFile;
  isLast: boolean;
  onShare: () => void;
  delay: number;
}) {
  const [previewing, setPreviewing] = useState(false);
  const { Icon, bg, color } = fileIcon(file.fileType);
  const sharedCount = file.sharedWith.length;

  return (
    <Reveal delay={delay}>
      {/* Row */}
      <div
        className={cn(
          "flex items-center gap-3 px-5 py-4 transition-colors hover:bg-moss/[0.03]",
          !isLast && !previewing && "border-b border-ink/[0.06]"
        )}
      >
        {/* Icon */}
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", bg, color)}>
          <Icon className="h-4 w-4" />
        </div>

        {/* Name + badges */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">{file.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]", fileTypeBadge(file.fileType))}>
              {file.fileType}
            </span>
            <Badge variant="cream" className="py-0.5 text-[10px]">{file.subject}</Badge>
          </div>
        </div>

        {/* Meta – hidden on very small screens */}
        <div className="hidden items-center gap-3 text-xs text-ink/45 sm:flex">
          <span className="tabular-nums">{file.sizeLabel}</span>
          <span className="text-ink/20">·</span>
          <span>{formatDateLabel(file.uploadedAt)}</span>
          <span className="text-ink/20">·</span>
          <span className={cn("flex items-center gap-1", sharedCount > 0 ? "text-moss" : "text-ink/35")}>
            <Users className="h-3 w-3" />
            {sharedCount}
          </span>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5 rounded-full px-3 text-xs"
            onClick={onShare}
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Share</span>
          </Button>

          <Button
            variant={previewing ? "primary" : "soft"}
            size="sm"
            className="gap-1.5 rounded-full px-3 text-xs"
            onClick={() => setPreviewing((p) => !p)}
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{previewing ? "Close" : "View"}</span>
          </Button>
        </div>
      </div>

      {/* Inline preview / details */}
      {previewing && (
        <div className={cn("border-b border-ink/[0.06] bg-ink/[0.02]", isLast && "border-b-0")}>
          {file.fileUrl ? (
            /* ── Real PDF viewer ── */
            <div className="relative">
              <button
                onClick={() => setPreviewing(false)}
                aria-label="Close preview"
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 text-ink/50 shadow-sm backdrop-blur transition hover:bg-white hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
              <iframe
                src={file.fileUrl}
                className="h-[540px] w-full"
                title={file.name}
              />
            </div>
          ) : (
            /* ── Details panel for files without a real attachment ── */
            <div className="px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="eyebrow mb-2">About this file</p>
                  <p className="text-sm leading-relaxed text-ink/70">{file.description}</p>
                </div>
                <button
                  onClick={() => setPreviewing(false)}
                  aria-label="Close"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-ink/40 transition hover:bg-moss/8 hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 border-t border-ink/[0.06] pt-4 text-xs">
                <div>
                  <p className="eyebrow mb-1">Subject</p>
                  <p className="font-semibold text-ink">{file.subject}</p>
                </div>
                <div>
                  <p className="eyebrow mb-1">Size</p>
                  <p className="font-semibold text-ink">{file.sizeLabel}</p>
                </div>
                <div>
                  <p className="eyebrow mb-1">Uploaded</p>
                  <p className="font-semibold text-ink">{formatDateLabel(file.uploadedAt)}</p>
                </div>
                <div>
                  <p className="eyebrow mb-1">Shared with</p>
                  {file.sharedWith.length === 0 ? (
                    <p className="font-semibold text-ink/40">No one yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {friends
                        .filter((f) => file.sharedWith.includes(f.id))
                        .map((f) => (
                          <span
                            key={f.id}
                            className="inline-flex items-center gap-1 rounded-full border border-moss/15 bg-moss/8 px-2 py-0.5 font-semibold text-moss"
                          >
                            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-moss text-[8px] font-bold text-cream">
                              {f.avatar}
                            </span>
                            {f.name}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Reveal>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */

export function FilesSection() {
  const [filter, setFilter] = useState<FileFilter>("All");
  const [sharingFile, setSharingFile] = useState<StudyFile | null>(null);

  const filters: FileFilter[] = ["All", "PDF", "Notes", "Assignment", "Slides"];
  const filtered = filter === "All" ? studyFiles : studyFiles.filter((f) => f.fileType === filter);

  const totalShared = studyFiles.filter((f) => f.sharedWith.length > 0).length;
  const typeCounts = {
    PDF:        studyFiles.filter((f) => f.fileType === "PDF").length,
    Notes:      studyFiles.filter((f) => f.fileType === "Notes").length,
    Assignment: studyFiles.filter((f) => f.fileType === "Assignment").length,
    Slides:     studyFiles.filter((f) => f.fileType === "Slides").length,
  };

  return (
    <div className="space-y-5">
      {/* Compact stats bar */}
      <div className="panel flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
        <div>
          <span className="font-serif text-2xl text-ink">{studyFiles.length}</span>
          <span className="ml-1.5 text-sm text-ink/55">files</span>
        </div>
        <div className="h-6 w-px bg-ink/10" />
        <div className="flex gap-5">
          {(["PDF", "Notes", "Assignment", "Slides"] as const).map((type) => (
            <div key={type} className="text-center">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-ink/35">{type}</div>
              <div className="font-serif text-base text-ink">{typeCounts[type]}</div>
            </div>
          ))}
        </div>
        <div className="ml-auto hidden items-center gap-1.5 text-xs text-ink/45 sm:flex">
          <Users className="h-3.5 w-3.5" />
          {totalShared} shared
        </div>
      </div>

      {/* Filters + upload */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((item) => (
          <Button
            key={item}
            variant={filter === item ? "primary" : "secondary"}
            size="sm"
            className="rounded-full px-4"
            onClick={() => setFilter(item)}
          >
            {item}
          </Button>
        ))}
        <div className="ml-auto">
          <Button variant="soft" size="sm" className="gap-2 rounded-full px-4">
            <Upload className="h-3.5 w-3.5" />
            Upload
          </Button>
        </div>
      </div>

      {/* File list */}
      <div className="panel overflow-hidden">
        {filtered.map((file, index) => (
          <FileRow
            key={file.id}
            file={file}
            isLast={index === filtered.length - 1}
            onShare={() => setSharingFile(file)}
            delay={index * 40}
          />
        ))}
      </div>

      {/* Share modal */}
      {sharingFile && (
        <ShareModal file={sharingFile} onClose={() => setSharingFile(null)} />
      )}
    </div>
  );
}
