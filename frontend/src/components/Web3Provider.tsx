"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http, type Config } from "wagmi";
import { injected } from "wagmi/connectors";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createBotTestnetChain } from "@/lib/chain";

interface AppConfigContextValue {
  reownConfigured: boolean;
  contractAddress: `0x${string}` | null;
  rpcUrl: string;
}

const AppConfigContext = createContext<AppConfigContextValue>({
  reownConfigured: false,
  contractAddress: null,
  rpcUrl: "https://rpc.bohr.life",
});

export function useAppConfig() {
  return useContext(AppConfigContext);
}

let initializedReownId: string | null = null;
let cachedWagmiConfig: Config | null = null;

function getOrCreateWagmiConfig(reownId: string, rpcUrl: string): Config {
  const botChain = createBotTestnetChain(rpcUrl);

  if (reownId.trim().length > 0) {
    if (cachedWagmiConfig && initializedReownId === reownId) {
      return cachedWagmiConfig;
    }

    const wagmiAdapter = new WagmiAdapter({
      ssr: true,
      projectId: reownId,
      networks: [botChain],
      transports: {
        [botChain.id]: http(rpcUrl),
      },
    });

    if (typeof window !== "undefined" && initializedReownId !== reownId) {
      createAppKit({
        adapters: [wagmiAdapter],
        networks: [botChain],
        defaultNetwork: botChain,
        projectId: reownId,
        metadata: {
          name: "BOT One Word",
          description: "One wallet. One word. One unpredictable sentence on BOT Chain Testnet.",
          url: window.location.origin,
          icons: [],
        },
        themeMode: "dark",
        themeVariables: {
          "--w3m-accent": "#39ff88",
          "--w3m-border-radius-master": "10px",
        },
        features: {
          analytics: false,
        },
      });
      initializedReownId = reownId;
    }

    const config = wagmiAdapter.wagmiConfig as unknown as Config;
    cachedWagmiConfig = config;
    return config;
  }

  if (!cachedWagmiConfig) {
    cachedWagmiConfig = createConfig({
      chains: [botChain],
      connectors: [injected()],
      transports: {
        [botChain.id]: http(rpcUrl),
      },
      ssr: true,
    });
  }

  return cachedWagmiConfig;
}

interface Web3ProviderProps {
  children: React.ReactNode;
  reownId: string;
  contractAddress: string;
  rpcUrl: string;
}

export function Web3Provider({
  children,
  reownId,
  contractAddress,
  rpcUrl,
}: Web3ProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const normalizedReownId = reownId.trim();
  const validContractAddress = useMemo(() => {
    const trimmed = contractAddress.trim();
    return /^0x[a-fA-F0-9]{40}$/.test(trimmed)
      ? (trimmed as `0x${string}`)
      : null;
  }, [contractAddress]);

  const wagmiConfig = useMemo(
    () => getOrCreateWagmiConfig(normalizedReownId, rpcUrl),
    [normalizedReownId, rpcUrl]
  );

  const contextValue = useMemo<AppConfigContextValue>(
    () => ({
      reownConfigured: normalizedReownId.length > 0,
      contractAddress: validContractAddress,
      rpcUrl,
    }),
    [normalizedReownId, validContractAddress, rpcUrl]
  );

  return (
    <AppConfigContext.Provider value={contextValue}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </AppConfigContext.Provider>
  );
}

