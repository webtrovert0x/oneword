"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { ExternalLink, RefreshCw, Users, MessageSquareText } from "lucide-react";
import { useAppConfig } from "@/components/Web3Provider";
import { useBotOneWord } from "@/hooks/useBotOneWord";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { LiveSentence } from "@/components/LiveSentence";
import { ContributeCard } from "@/components/ContributeCard";
import { RecentContributions } from "@/components/RecentContributions";
import { BOT_CHAIN_ID, getAddressExplorerUrl } from "@/lib/chain";

export function BotOneWordApp() {
  const { reownConfigured, contractAddress } = useAppConfig();
  const { address } = useAccount();
  const [draftWord, setDraftWord] = useState("");

  const {
    totalWords,
    uniqueContributors,
    words,
    recentWords,
    hasContributed,
    userPosition,
    isConnected,
    isCorrectNetwork,
    isLoadingWords,
    isAwaitingSignature,
    isConfirming,
    isSwitchingChain,
    pendingTxHash,
    confirmedTxHash,
    readError,
    txError,
    clearTxFeedback,
    switchToBotTestnet,
    contributeWord,
    refreshAll,
  } = useBotOneWord();

  const handleSubmit = async (word: string) => {
    await contributeWord(word);
    setDraftWord("");
  };

  return (
    <div className="min-h-screen bg-obsidian text-zinc-100 selection:bg-neon-green selection:text-black">
      {/* Subtle atmospheric grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(57,255,136,0.08),transparent_38%),radial-gradient(circle_at_85%_15%,rgba(168,85,247,0.10),transparent_40%)]"
      />

      <header className="relative border-b border-white/10 bg-obsidian/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-neon-green/40 bg-neon-green/10 font-mono text-xs font-bold text-neon-green">
              B1
            </span>
            <div>
              <span className="text-sm font-bold tracking-wider text-white">
                BOT ONE WORD
              </span>
              <span className="ml-2.5 hidden rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[11px] text-zinc-400 sm:inline-block">
                Chain ID {BOT_CHAIN_ID}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {contractAddress && (
              <a
                href={getAddressExplorerUrl(contractAddress)}
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-xs text-zinc-400 transition hover:border-neon-green/40 hover:text-neon-green md:inline-flex"
              >
                Contract
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <button
              type="button"
              onClick={() => void refreshAll()}
              disabled={isLoadingWords}
              title="Refresh on-chain state"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-300 transition hover:border-white/25 hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoadingWords ? "animate-spin" : ""}`}
              />
            </button>
            <ConnectWalletButton />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 sm:py-14">
        {/* Hero */}
        <section className="space-y-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-neon-purple/35 bg-neon-purple/10 px-4 py-1.5 font-mono text-xs text-purple-200">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-green" />
            BOT Chain Testnet · Permanent On-Chain Experiment
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl md:text-7xl">
              BOT ONE{" "}
              <span className="bg-gradient-to-r from-neon-green via-emerald-300 to-neon-purple bg-clip-text text-transparent">
                WORD
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg font-medium text-zinc-300 sm:text-2xl">
              &ldquo;One wallet. One word. One unpredictable sentence.&rdquo;
            </p>
          </div>

          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-surface/80 p-4 backdrop-blur">
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                <MessageSquareText className="h-3.5 w-3.5 text-neon-green" />
                Total Words
              </div>
              <p className="mt-2 font-mono text-3xl font-bold text-white">
                {totalWords}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-surface/80 p-4 backdrop-blur">
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                <Users className="h-3.5 w-3.5 text-neon-purple" />
                Contributors
              </div>
              <p className="mt-2 font-mono text-3xl font-bold text-white">
                {uniqueContributors}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-surface/80 p-4 backdrop-blur">
              {!isConnected ? (
                <ConnectWalletButton variant="hero" />
              ) : (
                <>
                  <span className="text-xs uppercase tracking-wider text-zinc-500">
                    Your Status
                  </span>
                  <p className="mt-2 font-mono text-sm font-semibold text-neon-green">
                    {hasContributed ? `Word #${userPosition} Saved` : "Ready to Write"}
                  </p>
                </>
              )}
            </div>
          </div>

          {!reownConfigured && (
            <p className="mx-auto max-w-xl rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-xs text-zinc-400">
              Add <span className="text-zinc-200">REOWN_ID</span> in your root{" "}
              <span className="text-zinc-200">.env</span> to enable Reown AppKit multi-wallet modal (injected wallets remain available).
            </p>
          )}
        </section>

        {readError && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-center text-xs text-red-300">
            Error reading BOT Chain Testnet: {readError}
          </div>
        )}

        {/* Live Sentence Centerpiece */}
        <LiveSentence
          words={words}
          isLoading={isLoadingWords}
          connectedAddress={address}
          previewWord={!hasContributed ? draftWord.trim() : undefined}
        />

        {/* Contribute + Recent Activity */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <ContributeCard
              contractConfigured={Boolean(contractAddress)}
              isConnected={isConnected}
              isCorrectNetwork={isCorrectNetwork}
              hasContributed={hasContributed}
              userPosition={userPosition}
              words={words}
              draftWord={draftWord}
              onDraftChange={setDraftWord}
              onSubmit={handleSubmit}
              onSwitchNetwork={switchToBotTestnet}
              isSwitchingChain={isSwitchingChain}
              isAwaitingSignature={isAwaitingSignature}
              isConfirming={isConfirming}
              pendingTxHash={pendingTxHash}
              confirmedTxHash={confirmedTxHash}
              txError={txError}
              onClearFeedback={clearTxFeedback}
            />
          </div>

          <div className="lg:col-span-6">
            <RecentContributions
              recentWords={recentWords}
              isLoading={isLoadingWords}
            />
          </div>
        </div>
      </main>

      <footer className="relative border-t border-white/10 py-8 text-center text-xs text-zinc-500">
        <p>
          BOT One Word · BOT Chain Testnet (Chain ID 968) · Gas fee only · Immutable on-chain sentence
        </p>
      </footer>
    </div>
  );
}

