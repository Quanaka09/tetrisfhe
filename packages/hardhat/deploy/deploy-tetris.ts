import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  console.log("Deploying TetrisFHE contract to Sepolia...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    throw new Error("Account has no ETH. Please fund the account first.");
  }
  
  // Deploy TetrisFHE contract
  console.log("\nDeploying TetrisFHE contract...");
  const TetrisFHE = await hre.ethers.getContractFactory("TetrisFHE");
  const tetrisFHE = await TetrisFHE.deploy();
  
  console.log("Waiting for deployment...");
  await tetrisFHE.waitForDeployment();
  
  const tetrisAddress = await tetrisFHE.getAddress();
  
  console.log("\n=== Deployment Summary ===");
  console.log(`TetrisFHE deployed to: ${tetrisAddress}`);
  console.log(`Network: Sepolia (Chain ID: 11155111)`);
  console.log(`\nUpdate this address in packages/react-showcase/src/components/TetrisFHE.tsx:`);
  console.log(`  11155111: '${tetrisAddress}', // Sepolia`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

