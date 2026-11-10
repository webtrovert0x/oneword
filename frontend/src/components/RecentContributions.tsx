"use client";

import React from "react";
import { Clock, ExternalLink, Hash } from "lucide-react";
import type { WordEntryView } from "@/hooks/useBotOneWord";
import { getAddressExplorerUrl, getTxExplorerUrl } from "@/lib/chain";
import { formatRelativeTime, formatTimestamp, shortenAddress } from "@/lib/format";

interface RecentContributionsProps {
  recentWords: WordEntryView[];
  isLoading: boolean;
}

export function RecentContributions({
  recentWords,
  isLoading,
}: RecentContributionsProps) {
  return (
    <section
      aria-label="Recent Contributions"
      className="rounded-3xl border border-white/10 bg-surface/90 p-6 shadow-xl backdrop-blur-xl sm:p-8"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-neon-purple" />
          <h2 className="text-lg font-bold tracking-tight text-white">
            Recent Contributions
          </h2>
        </div>
        <span className="font-mono text-xs text-zinc-500">
          Latest {recentWords.length} on-chain
        </span>
      </div>

      {isLoading && recentWords.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          Loading recent activity...
        </p>
      ) : recentWords.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          No words contributed yet. Be the first wallet to start the sentence.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-white/[0.06]">
          {recentWords.map((entry) => (
            <li
              key={entry.position}
              className="flex flex-wrap items-center justify-between gap-3 py-3.5"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-xs text-neon-green">
                  <Hash className="h-3 w-3" />
                  {entry.position}
                </span>
                <div>
                  <p className="text-base font-bold text-white">{entry.word}</p>
                  <a
                    href={getAddressExplorerUrl(entry.contributor)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-zinc-400 transition hover:text-neon-green"
                  >
                    {shortenAddress(entry.contributor)}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div className="text-xs text-zinc-500">
                  <p className="text-zinc-300">{formatRelativeTime(entry.timestamp)}</p>
                  <p>{formatTimestamp(entry.timestamp)}</p>
                </div>

                {entry.txHash ? (
                  <a
                    href={getTxExplorerUrl(entry.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-neon-purple/40 bg-neon-purple/10 px-3 py-1 font-mono text-xs text-purple-200 transition hover:border-neon-purple hover:bg-neon-purple/20"
                  >
                    Tx
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="font-mono text-[11px] text-zinc-600">On-chain</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

