# BOT One Word — Technical Whitepaper

**Version:** 1.0  
**Network:** BOT Chain Testnet (Chain ID `968`)  
**Tagline:** *“One wallet. One word. One unpredictable sentence.”*

---

## 1. Abstract

**BOT One Word** is an immutable, permissionless, on-chain social experiment deployed on **BOT Chain Testnet**. Instead of individual posts, feeds, or curated threads, every participating wallet contributes **one single word** to a shared, continuously growing sentence stored permanently on the blockchain.

Once written, a word cannot be edited, reordered, or deleted, and the contributing wallet can never submit a second word. The result is an emergent, unpredictable artifact co-authored by the community—purely at network gas cost.

---

## 2. Design Principles

1. **Permanence Over Moderation**  
   `BOTOneWord.sol` contains no `reset`, `delete`, `pause`, or `owner` administrative functions. Every word accepted by the contract becomes permanent state.
2. **One Wallet, One Word**  
   A wallet address may contribute at most once (`hasContributed[msg.sender]`). Repeat attempts revert with `AlreadyContributed()`.
3. **Gas-Fee Only Economics**  
   There are no protocol fees, subscriptions, mint prices, or extra `BOT` transfers. `contributeWord(string)` is `nonpayable`, and the contract has no `payable`, `receive()`, or `fallback()` functions. Users pay standard BOT Chain Testnet gas only.
4. **Zero Centralized Backend**  
   The frontend reads sentence state directly from BOT Chain Testnet via RPC (`https://rpc.bohr.life`) and resolves historical transaction hashes from on-chain `WordAdded` event logs.
5. **Truthful Confirmation UX**  
   No word is shown as contributed in the UI until its transaction is confirmed in a block receipt on BOT Chain Testnet.

---

## 3. Protocol Specification

### 3.1 Network Parameters

| Parameter | Value |
| --- | --- |
| Network | BOT Chain Testnet |
| Chain ID | `968` |
| Native Gas Token | `BOT` |
| RPC Endpoint | `https://rpc.bohr.life` |
| Block Explorer | `https://scan.bohr.life/` |
| Deployed Contract | `0x8c4351f33965229B57823712a8916047633eAc83` |
| Deployment Tx | `0xe130c1e5226d7c4fd7e47cc297d45346cc0644bc2d7bfbc3ea12ca9eee072737` |

### 3.2 On-Chain Data Model

Each contribution is recorded as a `WordEntry` struct in sequential `1`-indexed order:

```solidity
struct WordEntry {
    uint256 position;
    address contributor;
    string word;
    uint256 timestamp;
}
```

State tracked on-chain:
- `_words`: Ordered array of all `WordEntry` records (`totalWords = _words.length`).
- `_hasContributed`: `mapping(address => bool)` enforcing the single-word limit per address.
- `contributorPosition`: `mapping(address => uint256)` mapping each contributor to their `1`-indexed position (`0` if not yet contributed).

Every successful contribution emits:

```solidity
event WordAdded(
    uint256 indexed position,
    address indexed contributor,
    string word,
    uint256 timestamp
);
```

### 3.3 Word Validation Rules

To guarantee that each contribution represents a single readable token without whitespace injection, invisible control characters, or empty/punctuation-only spam, `contributeWord(string calldata word)` enforces:

| Rule | Custom Error | Enforcement |
| --- | --- | --- |
| One word per wallet | `AlreadyContributed()` | Reverts if `_hasContributed[msg.sender]` is `true`. |
| Non-empty input | `EmptyWord()` | Reverts when byte length is `0`. |
| Maximum length | `WordTooLong()` | Reverts when length exceeds `MAX_WORD_LENGTH` (`24` bytes/chars). |
| No spaces or whitespace | `ContainsWhitespace()` | Rejects `0x20` (space), `\t`, `\n`, `\r`, `\v`, `\f`. |
| Printable ASCII only | `InvalidCharacter()` | Requires bytes in range `0x21..0x7E`, blocking control and invisible characters. |
| Not punctuation-only | `PunctuationOnlyWord()` | Requires at least one alphanumeric character (`0-9`, `A-Z`, `a-z`). Attached punctuation such as `don't` or `potato.` is permitted. |

### 3.4 Public Read Interface

- `getTotalWords() -> uint256`: Returns total contributed words.
- `getWord(uint256 position) -> WordEntry`: Returns the entry at a `1`-indexed position (reverts with `InvalidPosition` if out of bounds).
- `hasContributed(address user) -> bool`: Checks whether a wallet has already used its turn.
- `contributorPosition(address user) -> uint256`: Returns the contributor's `1`-indexed word position (`0` if unused).
- `getRecentWords(uint256 count) -> WordEntry[]`: Returns up to `count` most recent entries in chronological order, safely clamping if `count > totalWords`.
- `getWords(uint256 offset, uint256 limit) -> WordEntry[]`: Paginated `0`-based slice for scalable frontend reads.

---

## 4. Client Architecture

The web application (`frontend/`) is built with **Next.js**, **TypeScript**, **Tailwind CSS**, **Reown AppKit** (`@reown/appkit`, `@reown/appkit-adapter-wagmi`), **Wagmi v2**, **Viem**, and **TanStack Query**:

- **Server-Side Configuration**: `REOWN_ID` and `CONTRACT_ADDRESS` are read on the server from the root `.env` file (`process.env.REOWN_ID`), avoiding public client env prefixes (`VITE_*` / `NEXT_PUBLIC_*`).
- **Live Sentence & Inspection**: Renders the full on-chain sentence word-by-word with staggered reveal animations, position tags (`#1`, `#2`, ...), shortened contributor addresses on hover/click, and direct links to BOTScan transactions derived from `WordAdded` logs.
- **Submission Flow**: Validates input locally against contract rules, previews how the sentence will read with the proposed word, requires explicit wallet network matching (`Chain ID 968`), tracks pending and confirming states, and refreshes on-chain state only after transaction confirmation.

---

## 5. Security & Threat Model

- **Wallet Restriction Integrity**: `_hasContributed[msg.sender]` is updated before emitting state and cannot be cleared by any contract function.
- **No Financial Attack Surface**: The contract holds no `BOT` or ERC-20 funds and rejects native value transfers (`nonpayable` fallback/functions).
- **Known Scope Boundaries**: As a permissionless address-based experiment, the contract enforces one word per EVM address rather than off-chain human identity (Sybil resistance across multiple newly generated wallets is intentionally out of scope for a zero-friction gas-only MVP).
