import type { Metadata } from "next";
import { Web3Provider } from "@/components/Web3Provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "BOT One Word | Collaborative On-Chain Sentence",
  description: "One wallet. One word. One unpredictable sentence on BOT Chain Testnet.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const reownId = process.env.REOWN_ID ?? "";
  const contractAddress = process.env.CONTRACT_ADDRESS ?? "";
  const rpcUrl = process.env.BOT_TESTNET_RPC_URL?.trim() || "https://rpc.bohr.life";

  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <Web3Provider
          reownId={reownId}
          contractAddress={contractAddress}
          rpcUrl={rpcUrl}
        >
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
