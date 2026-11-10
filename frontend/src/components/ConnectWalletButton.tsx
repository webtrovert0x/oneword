"use client";

import React from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { AlertTriangle, CheckCircle2, LogOut, Wallet } from "lucide-react";
import { useAppConfig } from "@/components/Web3Provider";
import { BOT_CHAIN_ID } from "@/lib/chain";
import { shortenAddress } from "@/lib/format";

interface ConnectWalletButtonProps {
  variant?: "header" | "hero";
}

export function ConnectWalletButton({ variant = "header" }: ConnectWalletButtonProps) {
  const { reownConfigured } = useAppConfig();
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const wrongNetwork = isConnected && chainId !== BOT_CHAIN_ID;

  if (isConnected && address) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {wrongNetwork ? (
          <button
            type="button"
            onClick={() => switchChain({ chainId: BOT_CHAIN_ID })}
            disabled={isSwitching}
            className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-500/15 px-4 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/25 disabled:opacity-50"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            {isSwitching ? "Switching..." : "Switch to BOT Testnet (968)"}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-green/30 bg-neon-green/10 px-3 py-1.5 text-xs font-medium text-neon-green">
            <CheckCircle2 className="h-3.5 w-3.5" />
            BOT Testnet
          </span>
        )}

        {reownConfigured ? (
          <ReownAccountButton address={address} />
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-surface px-3.5 py-1.5 text-xs font-mono text-zinc-200">
            <span>{shortenAddress(address)}</span>
            <button
              type="button"
              onClick={() => disconnect()}
              title="Disconnect wallet"
              className="text-zinc-400 transition hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  if (reownConfigured) {
    return <ReownConnectTrigger variant={variant} />;
  }

  return (
    <button
      type="button"
      onClick={() => {
        const injectedConnector = connectors[0];
        if (injectedConnector) {
          connect({ connector: injectedConnector, chainId: BOT_CHAIN_ID });
        }
      }}
      disabled={isConnecting || connectors.length === 0}
      className={
        variant === "hero"
          ? "inline-flex items-center gap-2.5 rounded-full bg-neon-green px-6 py-3 text-sm font-bold text-black shadow-[0_0_25px_rgba(57,255,136,0.35)] transition hover:scale-[1.02] hover:bg-[#5bff9e] disabled:opacity-50"
          : "inline-flex items-center gap-2 rounded-full border border-neon-green/50 bg-neon-green/10 px-4 py-2 text-xs font-semibold text-neon-green transition hover:bg-neon-green/20 disabled:opacity-50"
      }
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}

function ReownConnectTrigger({ variant }: { variant: "header" | "hero" }) {
  const { open } = useAppKit();

  return (
    <button
      type="button"
      onClick={() => void open()}
      className={
        variant === "hero"
          ? "inline-flex items-center gap-2.5 rounded-full bg-neon-green px-6 py-3 text-sm font-bold text-black shadow-[0_0_25px_rgba(57,255,136,0.35)] transition hover:scale-[1.02] hover:bg-[#5bff9e]"
          : "inline-flex items-center gap-2 rounded-full border border-neon-green/50 bg-neon-green/10 px-4 py-2 text-xs font-semibold text-neon-green transition hover:bg-neon-green/20"
      }
    >
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </button>
  );
}

function ReownAccountButton({ address }: { address: string }) {
  const { open } = useAppKit();

  return (
    <button
      type="button"
      onClick={() => void open({ view: "Account" })}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-surface px-3.5 py-1.5 font-mono text-xs text-zinc-100 transition hover:border-neon-purple/60 hover:text-white"
    >
      <span className="h-2 w-2 rounded-full bg-neon-green" />
      {shortenAddress(address)}
    </button>
  );
}

