import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error(
      "No deployer account configured. Add PRIVATE_KEY to the root .env file."
    );
  }

  const chainNetwork = await ethers.provider.getNetwork();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("Deploying BOTOneWord...");
  console.log(`Network: ${network.name} (Chain ID: ${chainNetwork.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} BOT`);

  if (balance === 0n) {
    throw new Error("Deployer account has 0 BOT balance for gas fees.");
  }

  const factory = await ethers.getContractFactory("BOTOneWord");
  const contract = await factory.deploy();
  const deployTx = contract.deploymentTransaction();

  console.log(`Deployment tx submitted: ${deployTx?.hash}`);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`BOTOneWord deployed to: ${address}`);

  if (chainNetwork.chainId === 968n) {
    console.log(`BOTScan contract: https://scan.bohr.life/address/${address}`);
    if (deployTx?.hash) {
      console.log(`BOTScan tx: https://scan.bohr.life/tx/${deployTx.hash}`);
    }
  }

  // Export ABI to frontend/src/lib/abi.json if frontend exists
  const artifactPath = path.resolve(
    __dirname,
    "../artifacts/contracts/BOTOneWord.sol/BOTOneWord.json"
  );
  const frontendAbiDir = path.resolve(__dirname, "../../frontend/src/lib");
  if (fs.existsSync(artifactPath) && fs.existsSync(frontendAbiDir)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    fs.writeFileSync(
      path.join(frontendAbiDir, "abi.json"),
      JSON.stringify(artifact.abi, null, 2)
    );
    console.log("Synced ABI to frontend/src/lib/abi.json");
  }

  console.log("\nNext step: set CONTRACT_ADDRESS=" + address + " in your root .env file.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

