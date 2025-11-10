import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  console.log("Deploying FHE contracts...");
  
  // Deploy FHECounter contract
  console.log("Deploying FHECounter contract...");
  const FHECounter = await hre.ethers.getContractFactory("FHECounter");
  const fheCounter = await FHECounter.deploy();
  await fheCounter.waitForDeployment();
  const counterAddress = await fheCounter.getAddress();
  console.log(`FHECounter contract deployed to: ${counterAddress}`);
  
  // Deploy ReviewCardsFHE contract
  console.log("Deploying ReviewCardsFHE contract...");
  const ReviewCardsFHE = await hre.ethers.getContractFactory("ReviewCardsFHE");
  const reviewCards = await ReviewCardsFHE.deploy();
  await reviewCards.waitForDeployment();
  const reviewCardsAddress = await reviewCards.getAddress();
  console.log(`ReviewCardsFHE contract deployed to: ${reviewCardsAddress}`);
  
  // Deploy SimpleVoting_uint32 contract
  console.log("Deploying SimpleVoting_uint32 contract...");
  const SimpleVoting = await hre.ethers.getContractFactory("SimpleVoting_uint32");
  const simpleVoting = await SimpleVoting.deploy();
  await simpleVoting.waitForDeployment();
  const votingAddress = await simpleVoting.getAddress();
  console.log(`SimpleVoting_uint32 contract deployed to: ${votingAddress}`);
  
  // Deploy TetrisFHE contract
  console.log("Deploying TetrisFHE contract...");
  const TetrisFHE = await hre.ethers.getContractFactory("TetrisFHE");
  const tetrisFHE = await TetrisFHE.deploy();
  await tetrisFHE.waitForDeployment();
  const tetrisAddress = await tetrisFHE.getAddress();
  console.log(`TetrisFHE contract deployed to: ${tetrisAddress}`);
  
  console.log("\n=== Deployment Summary ===");
  console.log(`FHECounter: ${counterAddress}`);
  console.log(`ReviewCardsFHE: ${reviewCardsAddress}`);
  console.log(`SimpleVoting_uint32: ${votingAddress}`);
  console.log(`TetrisFHE: ${tetrisAddress}`);
}

// Run main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// Export the main function for hardhat-deploy
export default main;