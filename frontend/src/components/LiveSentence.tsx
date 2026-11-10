"use client";

import React, { useState } from "react";
import { ExternalLink, Sparkles, User } from "lucide-react";
import type { WordEntryView } from "@/hooks/useBotOneWord";
import { getAddressExplorerUrl, getTxExplorerUrl } from "@/lib/chain";
import { formatTimestamp, shortenAddress } from "@/lib/format";

interface LiveSentenceProps {
  words: WordEntryView[];
  isLoading: boolean;
  connectedAddress?: string;
  previewWord?: string;
}

export function LiveSentence({
  words,
  isLoading,
  connectedAddress,
  previewWord,
}: LiveSentenceProps) {
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  const selectedEntry =
    selectedPosition !== null
      ? words.find((w) => w.position === selectedPosition) ?? null
      : null;

  return (
    <section
      aria-label="Live Sentence"
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface/90 p-6 shadow-2xl backdrop-blur-xl sm:p-10"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-neon-purple/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-neon-green/10 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-neon-green" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
            On-Chain Collective Sentence
          </h2>
        </div>
        <span className="font-mono text-xs text-zinc-500">
          Hover or click any word to inspect contributor
        </span>
      </div>

      <div className="relative mt-8 min-h-[180px]">
        {isLoading && words.length === 0 ? (
          <div className="flex min-h-[160px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-neon-green border-t-transparent" />
              Reading sentence from BOT Chain Testnet...
            </div>
          </div>
        ) : words.length === 0 ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 text-center">
            <Sparkles className="h-7 w-7 text-neon-purple/80" />
            <p className="text-xl font-medium tracking-tight text-zinc-300 sm:text-2xl">
              The sentence is waiting for its first word.
            </p>
            {previewWord && (
              <p className="mt-2 font-mono text-sm text-neon-green/90">
                Preview: &ldquo;{previewWord}&rdquo;
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-4">
              {words.map((entry, idx) => {
                const isMine =
                  connectedAddress &&
                  entry.contributor.toLowerCase() === connectedAddress.toLowerCase();
                const isSelected = selectedPosition === entry.position;

                return (
                  <div
                    key={entry.position}
                    style={{ animationDelay: `${Math.min(idx * 35, 600)}ms` }}
                    className="group relative animate-word-reveal opacity-0"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPosition(isSelected ? null : entry.position)
                      }
                      className={`relative inline-flex items-baseline gap-1.5 rounded-xl border px-3 py-1.5 text-left transition duration-200 ${
                        isSelected
                          ? "border-neon-green bg-neon-green/15 text-white shadow-[0_0_20px_rgba(57,255,136,0.2)]"
                          : isMine
                            ? "border-neon-purple/60 bg-neon-purple/15 text-white hover:border-neon-purple"
                            : "border-white/10 bg-white/[0.03] text-zinc-100 hover:border-neon-green/50 hover:bg-white/[0.07]"
                      }`}
                    >
                      <span className="font-mono text-[10px] font-semibold text-zinc-500">
                        #{entry.position}
                      </span>
                      <span className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
                        {entry.word}
                      </span>
                      {isMine && (
                        <span className="ml-0.5 rounded bg-neon-purple/30 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase text-purple-200">
                          You
                        </span>
                      )}
                    </button>

                    {/* Hover tooltip */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/15 bg-[#0b0d14] px-3 py-2 text-xs shadow-xl group-hover:block">
                      <div className="flex items-center gap-2 font-mono text-zinc-200">
                        <span className="text-neon-green">#{entry.position}</span>
                        <span>{shortenAddress(entry.contributor)}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-zinc-500">
                        {formatTimestamp(entry.timestamp)}
                        {entry.txHash ? " · Click for tx link" : ""}
                      </div>
                    </div>
                  </div>
                );
              })}

              {previewWord && (
                <span className="inline-flex items-baseline gap-1.5 rounded-xl border border-dashed border-neon-green/60 bg-neon-green/5 px-3 py-1.5 text-neon-green">
                  <span className="font-mono text-[10px]">#{words.length + 1}</span>
                  <span className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
                    {previewWord}
                  </span>
                </span>
              )}
            </div>

            {selectedEntry && (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-md bg-neon-green/15 px-2 py-1 font-mono font-semibold text-neon-green">
                    Word #{selectedEntry.position}: &ldquo;{selectedEntry.word}&rdquo;
                  </span>
                  <a
                    href={getAddressExplorerUrl(selectedEntry.contributor)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-zinc-300 transition hover:text-neon-green"
                  >
                    <User className="h-3.5 w-3.5 text-zinc-500" />
                    {shortenAddress(selectedEntry.contributor)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="text-zinc-500">
                    {formatTimestamp(selectedEntry.timestamp)}
                  </span>
                </div>

                {selectedEntry.txHash && (
                  <a
                    href={getTxExplorerUrl(selectedEntry.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-neon-purple transition hover:text-purple-300"
                  >
                    View Transaction on BOTScan
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}

            <div className="border-t border-white/10 pt-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Full Reading
              </p>
              <p className="mt-2 text-lg leading-relaxed text-zinc-200 sm:text-xl">
                &ldquo;
                {words.map((w) => w.word).join(" ")}
                {previewWord ? ` ${previewWord}` : ""}
                &rdquo;
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

