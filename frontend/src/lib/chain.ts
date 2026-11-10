import { defineChain } from "viem";

export const BOT_CHAIN_ID = 968;
export const BOT_DEFAULT_RPC_URL = "https://rpc.bohr.life";
export const BOT_EXPLORER_URL = "https://scan.bohr.life";

export function createBotTestnetChain(rpcUrl: string = BOT_DEFAULT_RPC_URL) {
  return defineChain({
    id: BOT_CHAIN_ID,
    name: "BOT Chain Testnet",
    nativeCurrency: {
      name: "BOT",
      symbol: "BOT",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: [rpcUrl],
      },
    },
    blockExplorers: {
      default: {
        name: "BOTScan",
        url: BOT_EXPLORER_URL,
      },
    },
    testnet: true,
  });
}

export const botTestnet = createBotTestnetChain();

export function getTxExplorerUrl(txHash: string): string {
  return `${BOT_EXPLORER_URL}/tx/${txHash}`;
}

export function getAddressExplorerUrl(address: string): string {
  return `${BOT_EXPLORER_URL}/address/${address}`;
}

