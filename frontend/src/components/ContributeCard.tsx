"use client";

import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Fuel,
  Lock,
  Send,
  ShieldAlert,
} from "lucide-react";
import { MAX_WORD_LENGTH, validateWordInput } from "@/lib/validation";
import { getTxExplorerUrl } from "@/lib/chain";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import type { WordEntryView } from "@/hooks/useBotOneWord";

interface ContributeCardProps {
  contractConfigured: boolean;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  hasContributed: boolean;
  userPosition: number;
  words: WordEntryView[];
  draftWord: string;
  onDraftChange: (value: string) => void;
  onSubmit: (word: string) => Promise<void>;
  onSwitchNetwork: () => Promise<void>;
  isSwitchingChain: boolean;
  isAwaitingSignature: boolean;
  isConfirming: boolean;
  pendingTxHash: `0x${string}` | null;
  confirmedTxHash: `0x${string}` | null;
  txError: string | null;
  onClearFeedback: () => void;
}

export function ContributeCard({
  contractConfigured,
  isConnected,
  isCorrectNetwork,
  hasContributed,
  userPosition,
  words,
  draftWord,
  onDraftChange,
  onSubmit,
  onSwitchNetwork,
  isSwitchingChain,
  isAwaitingSignature,
  isConfirming,
  pendingTxHash,
  confirmedTxHash,
  txError,
  onClearFeedback,
}: ContributeCardProps) {
  const validation = validateWordInput(draftWord);
  const isBusy = isAwaitingSignature || isConfirming;
  const myWord =
    userPosition > 0 ? words.find((w) => w.position === userPosition) : undefined;

  const recentTail = words
    .slice(-4)
    .map((w) => w.word)
    .join(" ");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.valid || isBusy) return;
    await onSubmit(draftWord);
  };

  return (
    <section
      aria-label="Contribute a Word"
      className="rounded-3xl border border-white/10 bg-surface/90 p-6 shadow-xl backdrop-blur-xl sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
            Add Your One Word
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Permanent, immutable, and strictly BOT network gas fee only.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-xs text-zinc-300">
          <Fuel className="h-3.5 w-3.5 text-neon-green" />
          Gas Fee Only · 0 BOT Fee
        </span>
      </div>

      {!contractConfigured ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div>
            <p className="font-semibold">Contract not configured yet</p>
            <p className="mt-1 text-xs text-amber-200/80">
              Deploy <code className="font-mono">BOTOneWord.sol</code> to BOT Chain Testnet (968) and set{" "}
              <code className="font-mono">CONTRACT_ADDRESS</code> in your root{" "}
              <code className="font-mono">.env</code> file.
            </p>
          </div>
        </div>
      ) : !isConnected ? (
        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-zinc-200">
              Connect a wallet on BOT Chain Testnet to contribute your word.
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Each address gets exactly one permanent turn.
            </p>
          </div>
          <ConnectWalletButton />
        </div>
      ) : !isCorrectNetwork ? (
        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-amber-200">
              Wrong network detected
            </p>
            <p className="mt-1 text-xs text-amber-200/80">
              Switch your wallet to BOT Chain Testnet (Chain ID 968) to contribute.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onSwitchNetwork()}
            disabled={isSwitchingChain}
            className="rounded-full bg-amber-400 px-5 py-2.5 text-xs font-bold text-black transition hover:bg-amber-300 disabled:opacity-50"
          >
            {isSwitchingChain ? "Switching..." : "Switch to BOT Chain Testnet"}
          </button>
        </div>
      ) : hasContributed ? (
        <div className="mt-6 rounded-2xl border border-neon-purple/40 bg-neon-purple/10 p-6">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-neon-purple" />
            <div>
              <p className="text-base font-bold text-white">
                You’ve used your word. The sentence is yours too.
              </p>
              {myWord && (
                <p className="mt-2 font-mono text-xs text-purple-200">
                  Your permanent contribution at position #{myWord.position}:{" "}
                  <span className="rounded bg-black/40 px-2 py-0.5 font-bold text-neon-green">
                    {myWord.word}
                  </span>
                </p>
              )}
            </div>
          </div>

          {confirmedTxHash && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neon-purple/20 pt-3 text-xs text-neon-green">
              <CheckCircle2 className="h-4 w-4" />
              <span>Confirmed on BOT Chain Testnet!</span>
              <a
                href={getTxExplorerUrl(confirmedTxHash)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono underline hover:text-white"
              >
                View on BOTScan
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="mt-6 space-y-5">
          <div>
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="word-input" className="font-medium text-zinc-300">
                Your single word
              </label>
              <span
                className={`font-mono ${
                  draftWord.length > MAX_WORD_LENGTH ? "text-red-400" : "text-zinc-500"
                }`}
              >
                {draftWord.length}/{MAX_WORD_LENGTH}
              </span>
            </div>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                id="word-input"
                type="text"
                value={draftWord}
                maxLength={MAX_WORD_LENGTH + 4}
                disabled={isBusy}
                onChange={(e) => {
                  onClearFeedback();
                  onDraftChange(e.target.value);
                }}
                placeholder="e.g. potato"
                autoComplete="off"
                spellCheck={false}
                className="w-full flex-1 rounded-2xl border border-white/15 bg-black/50 px-4 py-3.5 font-mono text-base text-white placeholder:text-zinc-600 focus:border-neon-green focus:outline-none focus:ring-1 focus:ring-neon-green disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!validation.valid || isBusy}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neon-green px-6 py-3.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(57,255,136,0.25)] transition hover:bg-[#5bff9e] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
              >
                <Send className="h-4 w-4" />
                {isAwaitingSignature
                  ? "Sign in Wallet..."
                  : isConfirming
                    ? "Confirming..."
                    : "Contribute Word"}
              </button>
            </div>

            {draftWord.length > 0 && !validation.valid && (
              <p className="mt-2 text-xs text-red-400">{validation.error}</p>
            )}
          </div>

          {/* Live Sentence Preview */}
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              Live Sentence Preview
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
              {words.length === 0 ? (
                <>
                  &ldquo;
                  <span className="font-semibold text-neon-green">
                    {draftWord || "..."}
                  </span>
                  &rdquo;
                </>
              ) : (
                <>
                  {words.length > 4 ? "... " : ""}
                  {recentTail}{" "}
                  <span className="rounded bg-neon-green/15 px-1.5 py-0.5 font-semibold text-neon-green">
                    {draftWord || "[your-word]"}
                  </span>
                </>
              )}
            </p>
          </div>

          <p className="text-xs text-zinc-500">
            This contribution is permanently recorded on BOT Chain Testnet. Once confirmed, it cannot be edited or deleted, and your wallet cannot submit another word.
          </p>

          {pendingTxHash && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-neon-purple/40 bg-neon-purple/10 px-4 py-3 text-xs text-purple-200">
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neon-purple border-t-transparent" />
                <span>Transaction submitted. Waiting for block confirmation...</span>
              </div>
              <a
                href={getTxExplorerUrl(pendingTxHash)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-neon-green underline"
              >
                BOTScan
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {txError && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{txError}</span>
            </div>
          )}
        </form>
      )}
    </section>
  );
}

