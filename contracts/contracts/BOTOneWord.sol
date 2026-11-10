// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title BOTOneWord
/// @notice Collaborative on-chain sentence builder where each wallet may permanently contribute one word.
/// @dev Strictly gas-fee only: no payable functions, no platform fees, and no reset mechanism.
contract BOTOneWord {
    uint256 public constant MAX_WORD_LENGTH = 24;

    struct WordEntry {
        uint256 position;
        address contributor;
        string word;
        uint256 timestamp;
    }

    WordEntry[] private _words;
    mapping(address => bool) private _hasContributed;
    mapping(address => uint256) public contributorPosition;

    event WordAdded(
        uint256 indexed position,
        address indexed contributor,
        string word,
        uint256 timestamp
    );

    error AlreadyContributed();
    error EmptyWord();
    error WordTooLong();
    error ContainsWhitespace();
    error InvalidCharacter();
    error PunctuationOnlyWord();
    error InvalidPosition(uint256 position);

    /// @notice Contribute a single permanent word to the sentence.
    /// @param word A non-empty printable ASCII word (1-24 chars, no spaces, at least one alphanumeric character).
    function contributeWord(string calldata word) external {
        if (_hasContributed[msg.sender]) {
            revert AlreadyContributed();
        }

        _validateWord(bytes(word));

        uint256 position = _words.length + 1;
        uint256 timestamp = block.timestamp;

        _hasContributed[msg.sender] = true;
        contributorPosition[msg.sender] = position;

        _words.push(
            WordEntry({
                position: position,
                contributor: msg.sender,
                word: word,
                timestamp: timestamp
            })
        );

        emit WordAdded(position, msg.sender, word, timestamp);
    }

    /// @notice Returns the word entry at a 1-indexed position.
    /// @param position The 1-indexed position of the word.
    function getWord(uint256 position) external view returns (WordEntry memory) {
        if (position == 0 || position > _words.length) {
            revert InvalidPosition(position);
        }
        return _words[position - 1];
    }

    /// @notice Returns the total number of words contributed so far.
    function getTotalWords() external view returns (uint256) {
        return _words.length;
    }

    /// @notice Returns whether a wallet has already contributed its word.
    /// @param user The address to check.
    function hasContributed(address user) external view returns (bool) {
        return _hasContributed[user];
    }

    /// @notice Returns up to `count` most recent word entries in chronological order.
    /// @param count Maximum number of recent words to return.
    function getRecentWords(uint256 count) external view returns (WordEntry[] memory) {
        uint256 total = _words.length;
        if (total == 0 || count == 0) {
            return new WordEntry[](0);
        }

        uint256 resultCount = count > total ? total : count;
        uint256 startIndex = total - resultCount;
        WordEntry[] memory recent = new WordEntry[](resultCount);

        for (uint256 i = 0; i < resultCount; ++i) {
            recent[i] = _words[startIndex + i];
        }

        return recent;
    }

    /// @notice Returns a paginated slice of word entries in chronological order.
    /// @param offset Zero-based starting index into the word list.
    /// @param limit Maximum number of entries to return.
    function getWords(uint256 offset, uint256 limit) external view returns (WordEntry[] memory) {
        uint256 total = _words.length;
        if (offset >= total || limit == 0) {
            return new WordEntry[](0);
        }

        uint256 available = total - offset;
        uint256 resultCount = limit > available ? available : limit;
        WordEntry[] memory slice = new WordEntry[](resultCount);

        for (uint256 i = 0; i < resultCount; ++i) {
            slice[i] = _words[offset + i];
        }

        return slice;
    }

    function _validateWord(bytes memory raw) private pure {
        uint256 len = raw.length;
        if (len == 0) {
            revert EmptyWord();
        }
        if (len > MAX_WORD_LENGTH) {
            revert WordTooLong();
        }

        bool hasAlphanumeric = false;

        for (uint256 i = 0; i < len; ++i) {
            bytes1 ch = raw[i];

            if (
                ch == 0x20 ||
                ch == 0x09 ||
                ch == 0x0A ||
                ch == 0x0D ||
                ch == 0x0B ||
                ch == 0x0C
            ) {
                revert ContainsWhitespace();
            }

            if (ch < 0x21 || ch > 0x7E) {
                revert InvalidCharacter();
            }

            bool isDigit = (ch >= 0x30 && ch <= 0x39);
            bool isUpper = (ch >= 0x41 && ch <= 0x5A);
            bool isLower = (ch >= 0x61 && ch <= 0x7A);

            if (isDigit || isUpper || isLower) {
                hasAlphanumeric = true;
            }
        }

        if (!hasAlphanumeric) {
            revert PunctuationOnlyWord();
        }
    }
}

