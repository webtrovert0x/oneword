export const botOneWordAbi = [
  {
    type: "error",
    name: "AlreadyContributed",
    inputs: [],
  },
  {
    type: "error",
    name: "ContainsWhitespace",
    inputs: [],
  },
  {
    type: "error",
    name: "EmptyWord",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidCharacter",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidPosition",
    inputs: [{ name: "position", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "error",
    name: "PunctuationOnlyWord",
    inputs: [],
  },
  {
    type: "error",
    name: "WordTooLong",
    inputs: [],
  },
  {
    type: "event",
    name: "WordAdded",
    anonymous: false,
    inputs: [
      {
        name: "position",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "contributor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "word",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "timestamp",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "MAX_WORD_LENGTH",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "function",
    name: "contributeWord",
    stateMutability: "nonpayable",
    inputs: [{ name: "word", type: "string", internalType: "string" }],
    outputs: [],
  },
  {
    type: "function",
    name: "contributorPosition",
    stateMutability: "view",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "function",
    name: "getRecentWords",
    stateMutability: "view",
    inputs: [{ name: "count", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct BOTOneWord.WordEntry[]",
        components: [
          { name: "position", type: "uint256", internalType: "uint256" },
          { name: "contributor", type: "address", internalType: "address" },
          { name: "word", type: "string", internalType: "string" },
          { name: "timestamp", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getTotalWords",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "function",
    name: "getWord",
    stateMutability: "view",
    inputs: [{ name: "position", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct BOTOneWord.WordEntry",
        components: [
          { name: "position", type: "uint256", internalType: "uint256" },
          { name: "contributor", type: "address", internalType: "address" },
          { name: "word", type: "string", internalType: "string" },
          { name: "timestamp", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getWords",
    stateMutability: "view",
    inputs: [
      { name: "offset", type: "uint256", internalType: "uint256" },
      { name: "limit", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct BOTOneWord.WordEntry[]",
        components: [
          { name: "position", type: "uint256", internalType: "uint256" },
          { name: "contributor", type: "address", internalType: "address" },
          { name: "word", type: "string", internalType: "string" },
          { name: "timestamp", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "hasContributed",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
  },
] as const;

