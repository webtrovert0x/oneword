import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const rawPrivateKey = process.env.PRIVATE_KEY?.trim() ?? "";
const normalizedKey =
  rawPrivateKey.length > 0
    ? rawPrivateKey.startsWith("0x")
      ? rawPrivateKey
      : `0x${rawPrivateKey}`
    : "";

const rpcUrl = process.env.BOT_TESTNET_RPC_URL?.trim() || "https://rpc.bohr.life";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    botTestnet: {
      url: rpcUrl,
      chainId: 968,
      accounts: normalizedKey ? [normalizedKey] : [],
    },
  },
  etherscan: {
    apiKey: {
      botTestnet: "empty",
    },
    customChains: [
      {
        network: "botTestnet",
        chainId: 968,
        urls: {
          apiURL: "https://scan.bohr.life/api",
          browserURL: "https://scan.bohr.life",
        },
      },
    ],
  },
};

export default config;

