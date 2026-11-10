"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { BaseError, ContractFunctionRevertedError, parseAbiItem } from "viem";
import { botOneWordAbi } from "@/lib/abi";
import { BOT_CHAIN_ID } from "@/lib/chain";
import { useAppConfig } from "@/components/Web3Provider";

export interface WordEntryView {
  position: number;
  contributor: `0x${string}`;
  word: string;
  timestamp: number;
  txHash?: `0x${string}`;
}

const WORD_ADDED_EVENT = parseAbiItem(
  "event WordAdded(uint256 indexed position, address indexed contributor, string word, uint256 timestamp)"
);

const ERROR_MESSAGES: Record<string, string> = {
  AlreadyContributed: "This wallet has already contributed its one permanent word.",
  EmptyWord: "Word cannot be empty.",
  WordTooLong: "Word exceeds the 24-character limit.",
  ContainsWhitespace: "Spaces and whitespace are not allowed.",
  InvalidCharacter: "Word contains unsupported characters.",
  PunctuationOnlyWord: "Punctuation-only input is rejected. Add at least one letter or number.",
};

function decodeContractError(err: unknown): string {
  if (err instanceof BaseError) {
    const revertError = err.walk((e) => e instanceof ContractFunctionRevertedError);
    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName;
      if (errorName && ERROR_MESSAGES[errorName]) {
        return ERROR_MESSAGES[errorName];
      }
    }
    if (err.shortMessage?.toLowerCase().includes("user rejected")) {
      return "Transaction was rejected in your wallet.";
    }
    return err.shortMessage || err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Transaction failed. Please try again.";
}

export function useBotOneWord() {
  const { contractAddress } = useAppConfig();
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient({ chainId: BOT_CHAIN_ID });
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [words, setWords] = useState<WordEntryView[]>([]);
  const [txHashes, setTxHashes] = useState<Record<number, `0x${string}`>>({});
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);

  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | null>(null);
  const [confirmedTxHash, setConfirmedTxHash] = useState<`0x${string}` | null>(null);
  const [isAwaitingSignature, setIsAwaitingSignature] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  const isCorrectNetwork = isConnected && chainId === BOT_CHAIN_ID;
  const contractEnabled = Boolean(contractAddress);

  const {
    data: totalWordsRaw,
    refetch: refetchTotalWords,
  } = useReadContract({
    address: contractAddress ?? undefined,
    abi: botOneWordAbi,
    functionName: "getTotalWords",
    chainId: BOT_CHAIN_ID,
    query: {
      enabled: contractEnabled,
      refetchInterval: 15_000,
    },
  });

  const {
    data: userHasContributed,
    refetch: refetchHasContributed,
  } = useReadContract({
    address: contractAddress ?? undefined,
    abi: botOneWordAbi,
    functionName: "hasContributed",
    args: address ? [address] : undefined,
    chainId: BOT_CHAIN_ID,
    query: {
      enabled: contractEnabled && Boolean(address),
    },
  });

  const {
    data: userPositionRaw,
    refetch: refetchUserPosition,
  } = useReadContract({
    address: contractAddress ?? undefined,
    abi: botOneWordAbi,
    functionName: "contributorPosition",
    args: address ? [address] : undefined,
    chainId: BOT_CHAIN_ID,
    query: {
      enabled: contractEnabled && Boolean(address),
    },
  });

  const totalWords = Number(totalWordsRaw ?? 0n);
  const userPosition = Number(userPositionRaw ?? 0n);

  const fetchTxLogs = useCallback(async (): Promise<Record<number, `0x${string}`>> => {
    if (!publicClient || !contractAddress) return {};

    try {
      const logs = await publicClient.getLogs({
        address: contractAddress,
        event: WORD_ADDED_EVENT,
        fromBlock: 0n,
        toBlock: "latest",
      });

      const map: Record<number, `0x${string}`> = {};
      for (const log of logs) {
        if (log.args.position !== undefined && log.transactionHash) {
          map[Number(log.args.position)] = log.transactionHash;
        }
      }
      return map;
    } catch {
      // Fallback: query recent block window if RPC restricts full-history getLogs
      try {
        const latest = await publicClient.getBlockNumber();
        const fromBlock = latest > 50_000n ? latest - 50_000n : 0n;
        const logs = await publicClient.getLogs({
          address: contractAddress,
          event: WORD_ADDED_EVENT,
          fromBlock,
          toBlock: "latest",
        });

        const map: Record<number, `0x${string}`> = {};
        for (const log of logs) {
          if (log.args.position !== undefined && log.transactionHash) {
            map[Number(log.args.position)] = log.transactionHash;
          }
        }
        return map;
      } catch {
        return {};
      }
    }
  }, [publicClient, contractAddress]);

  const fetchAllWords = useCallback(async () => {
    if (!publicClient || !contractAddress) {
      setWords([]);
      return;
    }

    setIsLoadingWords(true);
    setReadError(null);

    try {
      const totalBigInt = await publicClient.readContract({
        address: contractAddress,
        abi: botOneWordAbi,
        functionName: "getTotalWords",
      });

      const total = Number(totalBigInt);
      if (total === 0) {
        setWords([]);
        setIsLoadingWords(false);
        return;
      }

      const pageSize = 100;
      const collected: WordEntryView[] = [];

      for (let offset = 0; offset < total; offset += pageSize) {
        const chunk = await publicClient.readContract({
          address: contractAddress,
          abi: botOneWordAbi,
          functionName: "getWords",
          args: [BigInt(offset), BigInt(pageSize)],
        });

        for (const item of chunk) {
          collected.push({
            position: Number(item.position),
            contributor: item.contributor,
            word: item.word,
            timestamp: Number(item.timestamp),
          });
        }
      }

      const logMap = await fetchTxLogs();
      setTxHashes((prev) => ({ ...prev, ...logMap }));
      setWords(collected);
    } catch (err) {
      setReadError(decodeContractError(err));
    } finally {
      setIsLoadingWords(false);
    }
  }, [publicClient, contractAddress, fetchTxLogs]);

  useEffect(() => {
    void fetchAllWords();
  }, [fetchAllWords, totalWords]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refetchTotalWords(),
      refetchHasContributed(),
      refetchUserPosition(),
      fetchAllWords(),
    ]);
  }, [refetchTotalWords, refetchHasContributed, refetchUserPosition, fetchAllWords]);

  const switchToBotTestnet = useCallback(async () => {
    setTxError(null);
    try {
      await switchChainAsync({ chainId: BOT_CHAIN_ID });
    } catch (err) {
      setTxError(decodeContractError(err));
    }
  }, [switchChainAsync]);

  const contributeWord = useCallback(
    async (word: string) => {
      if (!contractAddress) {
        setTxError("Contract address is not configured in .env yet.");
        return;
      }
      if (!isConnected || !address) {
        setTxError("Connect your wallet first.");
        return;
      }
      if (chainId !== BOT_CHAIN_ID) {
        setTxError("Please switch to BOT Chain Testnet (Chain ID 968).");
        return;
      }
      if (!publicClient) {
        setTxError("BOT Chain RPC client unavailable.");
        return;
      }

      setTxError(null);
      setConfirmedTxHash(null);
      setPendingTxHash(null);
      setIsAwaitingSignature(true);

      try {
        // Gas-fee only contract write (no value/BOT transfer)
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: botOneWordAbi,
          functionName: "contributeWord",
          args: [word],
          chainId: BOT_CHAIN_ID,
        });

        setIsAwaitingSignature(false);
        setPendingTxHash(hash);
        setIsConfirming(true);

        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1,
        });

        if (receipt.status !== "success") {
          throw new Error("Transaction reverted on BOT Chain Testnet.");
        }

        // Wait until confirmation before updating UI state
        setConfirmedTxHash(hash);
        setPendingTxHash(null);
        await refreshAll();
      } catch (err) {
        setTxError(decodeContractError(err));
        setPendingTxHash(null);
      } finally {
        setIsAwaitingSignature(false);
        setIsConfirming(false);
      }
    },
    [
      contractAddress,
      isConnected,
      address,
      chainId,
      publicClient,
      writeContractAsync,
      refreshAll,
    ]
  );

  const enrichedWords = useMemo(
    () =>
      words.map((entry) => ({
        ...entry,
        txHash: txHashes[entry.position] ?? entry.txHash,
      })),
    [words, txHashes]
  );

  const uniqueContributors = useMemo(() => {
    const set = new Set(enrichedWords.map((w) => w.contributor.toLowerCase()));
    return set.size;
  }, [enrichedWords]);

  const recentWords = useMemo(
    () => [...enrichedWords].reverse().slice(0, 12),
    [enrichedWords]
  );

  return {
    contractAddress,
    totalWords,
    uniqueContributors,
    words: enrichedWords,
    recentWords,
    hasContributed: Boolean(userHasContributed),
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
    clearTxFeedback: () => {
      setTxError(null);
      setConfirmedTxHash(null);
    },
    switchToBotTestnet,
    contributeWord,
    refreshAll,
  };
}

