# BOT One Word

> **“One wallet. One word. One unpredictable sentence.”**

BOT One Word is a permanent, gas-fee-only collaborative sentence-building dApp on **BOT Chain Testnet**. Each wallet can contribute exactly one word on-chain, forever.

📄 Read the [Technical Whitepaper](./WHITEPAPER.md) for the full protocol specification and architecture.

---

## Network Configuration (BOT Chain Testnet)

| Setting | Value |
| --- | --- |
| **Network Name** | BOT Chain Testnet |
| **Chain ID** | `968` |
| **RPC URL** | `https://rpc.bohr.life` |
| **Native Currency** | `BOT` |
| **Block Explorer** | `https://scan.bohr.life/` |

---

## Project Structure

```text
.
├── .env                  # Your private local secrets (gitignored)
├── .env.example          # Template environment variables
├── contracts/            # Hardhat + Solidity 0.8.20 smart contract & tests
│   ├── contracts/BOTOneWord.sol
│   ├── scripts/deploy.ts
│   └── test/BOTOneWord.test.ts
└── frontend/             # Next.js + TypeScript + Tailwind + Reown AppKit + Wagmi + Viem
```

---

## Smart Contract (`BOTOneWord.sol`)

- **Solidity**: `0.8.20`
- **Gas-Fee Only**: Zero `payable` functions, zero platform fees, zero extra `BOT` transfers.
- **Permanent**: No reset, delete, or admin override functions.
- **Validation Rules**:
  - 1 word per wallet (`AlreadyContributed` on repeat attempts).
  - Non-empty (`EmptyWord`).
  - Maximum 24 characters (`WordTooLong`).
  - No spaces or whitespace (`ContainsWhitespace`).
  - No punctuation-only input (`PunctuationOnlyWord`); requires at least one alphanumeric character (`0-9`, `A-Z`, `a-z`).
- **Core Functions**:
  - `contributeWord(string word)`
  - `getWord(uint256 position)` *(1-indexed)*
  - `getTotalWords()`
  - `hasContributed(address user)`
  - `getRecentWords(uint256 count)`
  - `getWords(uint256 offset, uint256 limit)`
- **Event**: `WordAdded(uint256 indexed position, address indexed contributor, string word, uint256 timestamp)`

---

## Setup & Usage

### 1. Configure Root `.env`

Fill in `.env` at the project root (created from `.env.example`):

```env
PRIVATE_KEY=your_testnet_deployer_private_key
REOWN_ID=your_reown_project_id
CONTRACT_ADDRESS=
BOT_TESTNET_RPC_URL=https://rpc.bohr.life
```

> `REOWN_ID` is read server-side by Next.js (`process.env.REOWN_ID`) rather than exposed via `VITE_REOWN_ID` or `NEXT_PUBLIC_*` prefixes.

### 2. Compile & Test the Smart Contract

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
```

### 3. Deploy to BOT Chain Testnet (Chain ID 968)

Ensure your `PRIVATE_KEY` wallet has testnet `BOT` for gas fees, then run:

```bash
cd contracts
npm run deploy:testnet
```

Copy the printed contract address into `CONTRACT_ADDRESS=` in the root `.env` file.

### 4. Run the Frontend

```bash
cd frontend
npm install
npm run build
npm run start
```

Or for local development:

```bash
cd frontend
npm run dev
```

