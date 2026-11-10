import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("BOTOneWord", function () {
  async function deployFixture() {
    const [wallet1, wallet2, wallet3, wallet4] = await ethers.getSigners();
    const BOTOneWord = await ethers.getContractFactory("BOTOneWord");
    const contract = await BOTOneWord.deploy();
    await contract.waitForDeployment();
    return { contract, wallet1, wallet2, wallet3, wallet4 };
  }

  it("starts with zero words and safe empty views", async function () {
    const { contract, wallet1 } = await deployFixture();

    expect(await contract.getTotalWords()).to.equal(0n);
    expect(await contract.hasContributed(wallet1.address)).to.equal(false);
    expect(await contract.contributorPosition(wallet1.address)).to.equal(0n);
    expect(await contract.getRecentWords(5)).to.deep.equal([]);
    expect(await contract.getWords(0, 10)).to.deep.equal([]);

    await expect(contract.getWord(0))
      .to.be.revertedWithCustomError(contract, "InvalidPosition")
      .withArgs(0);
    await expect(contract.getWord(1))
      .to.be.revertedWithCustomError(contract, "InvalidPosition")
      .withArgs(1);
  });

  it("allows first successful word contribution and records position, contributor, timestamp, and event", async function () {
    const { contract, wallet1 } = await deployFixture();

    const nextTimestamp = (await time.latest()) + 100;
    await time.setNextBlockTimestamp(nextTimestamp);

    await expect(contract.connect(wallet1).contributeWord("Today"))
      .to.emit(contract, "WordAdded")
      .withArgs(1n, wallet1.address, "Today", BigInt(nextTimestamp));

    expect(await contract.getTotalWords()).to.equal(1n);
    expect(await contract.hasContributed(wallet1.address)).to.equal(true);
    expect(await contract.contributorPosition(wallet1.address)).to.equal(1n);

    const entry = await contract.getWord(1);
    expect(entry.position).to.equal(1n);
    expect(entry.contributor).to.equal(wallet1.address);
    expect(entry.word).to.equal("Today");
    expect(entry.timestamp).to.equal(BigInt(nextTimestamp));
  });

  it("rejects a second contribution from the same wallet", async function () {
    const { contract, wallet1 } = await deployFixture();

    await contract.connect(wallet1).contributeWord("Today");

    await expect(
      contract.connect(wallet1).contributeWord("Tomorrow")
    ).to.be.revertedWithCustomError(contract, "AlreadyContributed");

    expect(await contract.getTotalWords()).to.equal(1n);
  });

  it("allows different wallets to contribute in sequential order", async function () {
    const { contract, wallet1, wallet2, wallet3, wallet4 } = await deployFixture();

    const words = ["Today", "I", "accidentally", "married"];
    const wallets = [wallet1, wallet2, wallet3, wallet4];

    for (let i = 0; i < words.length; i++) {
      await contract.connect(wallets[i]).contributeWord(words[i]);
    }

    expect(await contract.getTotalWords()).to.equal(4n);

    for (let i = 0; i < words.length; i++) {
      const pos = BigInt(i + 1);
      const entry = await contract.getWord(pos);
      expect(entry.position).to.equal(pos);
      expect(entry.contributor).to.equal(wallets[i].address);
      expect(entry.word).to.equal(words[i]);
      expect(await contract.hasContributed(wallets[i].address)).to.equal(true);
      expect(await contract.contributorPosition(wallets[i].address)).to.equal(pos);
    }
  });

  it("rejects empty words", async function () {
    const { contract, wallet1 } = await deployFixture();

    await expect(
      contract.connect(wallet1).contributeWord("")
    ).to.be.revertedWithCustomError(contract, "EmptyWord");
  });

  it("rejects words containing spaces or whitespace", async function () {
    const { contract, wallet1 } = await deployFixture();

    for (const invalid of ["hello world", " leading", "trailing ", "   ", "a\tb", "a\nb"]) {
      await expect(
        contract.connect(wallet1).contributeWord(invalid)
      ).to.be.revertedWithCustomError(contract, "ContainsWhitespace");
    }
  });

  it("enforces maximum word length of 24 characters", async function () {
    const { contract, wallet1, wallet2 } = await deployFixture();

    const exact24 = "a".repeat(24);
    const over24 = "a".repeat(25);

    await expect(
      contract.connect(wallet1).contributeWord(over24)
    ).to.be.revertedWithCustomError(contract, "WordTooLong");

    await expect(contract.connect(wallet2).contributeWord(exact24))
      .to.emit(contract, "WordAdded");

    const saved = await contract.getWord(1);
    expect(saved.word).to.equal(exact24);
  });

  it("rejects punctuation-only input while allowing words with attached punctuation", async function () {
    const { contract, wallet1, wallet2 } = await deployFixture();

    for (const punct of [".", "...", "!!!", "?!", "---", "'", "\"\""]) {
      await expect(
        contract.connect(wallet1).contributeWord(punct)
      ).to.be.revertedWithCustomError(contract, "PunctuationOnlyWord");
    }

    await contract.connect(wallet1).contributeWord("don't");
    await contract.connect(wallet2).contributeWord("potato.");

    expect((await contract.getWord(1)).word).to.equal("don't");
    expect((await contract.getWord(2)).word).to.equal("potato.");
  });

  it("rejects non-printable/control characters", async function () {
    const { contract, wallet1 } = await deployFixture();

    await expect(
      contract.connect(wallet1).contributeWord("bad\x00word")
    ).to.be.revertedWithCustomError(contract, "InvalidCharacter");
  });

  it("retrieves recent words accurately and safely handles counts larger than available words", async function () {
    const { contract, wallet1, wallet2, wallet3 } = await deployFixture();

    await contract.connect(wallet1).contributeWord("One");
    await contract.connect(wallet2).contributeWord("Two");
    await contract.connect(wallet3).contributeWord("Three");

    expect(await contract.getRecentWords(0)).to.deep.equal([]);

    const lastTwo = await contract.getRecentWords(2);
    expect(lastTwo.length).to.equal(2);
    expect(lastTwo[0].word).to.equal("Two");
    expect(lastTwo[0].position).to.equal(2n);
    expect(lastTwo[1].word).to.equal("Three");
    expect(lastTwo[1].position).to.equal(3n);

    const moreThanTotal = await contract.getRecentWords(50);
    expect(moreThanTotal.length).to.equal(3);
    expect(moreThanTotal.map((w) => w.word)).to.deep.equal(["One", "Two", "Three"]);
  });

  it("supports paginated retrieval via getWords", async function () {
    const { contract, wallet1, wallet2, wallet3 } = await deployFixture();

    await contract.connect(wallet1).contributeWord("Alpha");
    await contract.connect(wallet2).contributeWord("Beta");
    await contract.connect(wallet3).contributeWord("Gamma");

    const slice = await contract.getWords(1, 2);
    expect(slice.map((w) => w.word)).to.deep.equal(["Beta", "Gamma"]);

    const outOfBounds = await contract.getWords(10, 5);
    expect(outOfBounds).to.deep.equal([]);
  });

  it("is strictly gas-fee only (rejects native value transfers)", async function () {
    const { contract, wallet1 } = await deployFixture();

    await expect(
      wallet1.sendTransaction({
        to: await contract.getAddress(),
        data: contract.interface.encodeFunctionData("contributeWord", ["GasOnly"]),
        value: ethers.parseEther("0.01"),
      })
    ).to.be.reverted;
  });
});

