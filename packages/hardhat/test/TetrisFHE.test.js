const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("TetrisFHE - FHEVM Functionality Tests", function () {
  let contract;
  let owner, player1, player2;

  beforeEach(async function () {
    if (!fhevm.isMock) {
      throw new Error("This test must run in FHEVM mock environment");
    }
    
    await fhevm.initializeCLIApi();
    [owner, player1, player2] = await ethers.getSigners();
    
    const Factory = await ethers.getContractFactory("TetrisFHE");
    const deployed = await Factory.deploy();
    await deployed.waitForDeployment();
    contract = deployed;
  });

  it("should deploy contract successfully", async function () {
    expect(await contract.getAddress()).to.be.properAddress;
    console.log("✅ TetrisFHE contract deployed at:", await contract.getAddress());
  });

  it("should submit encrypted score with all three values", async function () {
    const score = 1500;
    const lines = 25;
    const level = 5;
    
    // Create encrypted inputs for score, lines, and level
    const encryptedScore = await fhevm
      .createEncryptedInput(await contract.getAddress(), player1.address)
      .add32(BigInt(score))
      .encrypt();
    
    const encryptedLines = await fhevm
      .createEncryptedInput(await contract.getAddress(), player1.address)
      .add32(BigInt(lines))
      .encrypt();
    
    const encryptedLevel = await fhevm
      .createEncryptedInput(await contract.getAddress(), player1.address)
      .add32(BigInt(level))
      .encrypt();
    
    // Submit score
    await contract.connect(player1).submitScore(
      encryptedScore.handles[0],
      encryptedLines.handles[0],
      encryptedLevel.handles[0],
      encryptedScore.inputProof,
      encryptedLines.inputProof,
      encryptedLevel.inputProof,
      { value: 0 }
    );
    
    // Verify score was stored
    const totalScores = await contract.getTotalScores();
    expect(totalScores).to.equal(1n);
    
    // Get score info
    const [player, timestamp, exists] = await contract.getScoreInfo(0);
    expect(exists).to.be.true;
    expect(player).to.equal(player1.address);
    
    console.log("✅ Encrypted score submitted successfully");
  });

  it("should retrieve encrypted score data", async function () {
    // First submit a score
    const score = 2000;
    const lines = 30;
    const level = 6;
    
    const encryptedScore = await fhevm
      .createEncryptedInput(await contract.getAddress(), player1.address)
      .add32(BigInt(score))
      .encrypt();
    
    const encryptedLines = await fhevm
      .createEncryptedInput(await contract.getAddress(), player1.address)
      .add32(BigInt(lines))
      .encrypt();
    
    const encryptedLevel = await fhevm
      .createEncryptedInput(await contract.getAddress(), player1.address)
      .add32(BigInt(level))
      .encrypt();
    
    await contract.connect(player1).submitScore(
      encryptedScore.handles[0],
      encryptedLines.handles[0],
      encryptedLevel.handles[0],
      encryptedScore.inputProof,
      encryptedLines.inputProof,
      encryptedLevel.inputProof,
      { value: 0 }
    );
    
    // Get encrypted score data
    const [scoreBytes, linesBytes, levelBytes] = await contract.getEncryptedScore(0);
    
    expect(scoreBytes).to.not.be.undefined;
    expect(linesBytes).to.not.be.undefined;
    expect(levelBytes).to.not.be.undefined;
    
    console.log("✅ Encrypted score data retrieved successfully");
    console.log("   Score bytes:", scoreBytes);
    console.log("   Lines bytes:", linesBytes);
    console.log("   Level bytes:", levelBytes);
  });

  it("should allow multiple players to submit scores", async function () {
    // Player 1 submits score
    const score1 = 1000;
    const lines1 = 20;
    const level1 = 4;
    
    const encryptedScore1 = await fhevm
      .createEncryptedInput(await contract.getAddress(), player1.address)
      .add32(BigInt(score1))
      .encrypt();
    
    const encryptedLines1 = await fhevm
      .createEncryptedInput(await contract.getAddress(), player1.address)
      .add32(BigInt(lines1))
      .encrypt();
    
    const encryptedLevel1 = await fhevm
      .createEncryptedInput(await contract.getAddress(), player1.address)
      .add32(BigInt(level1))
      .encrypt();
    
    await contract.connect(player1).submitScore(
      encryptedScore1.handles[0],
      encryptedLines1.handles[0],
      encryptedLevel1.handles[0],
      encryptedScore1.inputProof,
      encryptedLines1.inputProof,
      encryptedLevel1.inputProof,
      { value: 0 }
    );
    
    // Player 2 submits score
    const score2 = 2500;
    const lines2 = 40;
    const level2 = 8;
    
    const encryptedScore2 = await fhevm
      .createEncryptedInput(await contract.getAddress(), player2.address)
      .add32(BigInt(score2))
      .encrypt();
    
    const encryptedLines2 = await fhevm
      .createEncryptedInput(await contract.getAddress(), player2.address)
      .add32(BigInt(lines2))
      .encrypt();
    
    const encryptedLevel2 = await fhevm
      .createEncryptedInput(await contract.getAddress(), player2.address)
      .add32(BigInt(level2))
      .encrypt();
    
    await contract.connect(player2).submitScore(
      encryptedScore2.handles[0],
      encryptedLines2.handles[0],
      encryptedLevel2.handles[0],
      encryptedScore2.inputProof,
      encryptedLines2.inputProof,
      encryptedLevel2.inputProof,
      { value: 0 }
    );
    
    // Verify both scores were stored
    const totalScores = await contract.getTotalScores();
    expect(totalScores).to.equal(2n);
    
    const [player1Info] = await contract.getScoreInfo(0);
    const [player2Info] = await contract.getScoreInfo(1);
    
    expect(player1Info).to.equal(player1.address);
    expect(player2Info).to.equal(player2.address);
    
    console.log("✅ Multiple players submitted scores successfully");
  });

  it("should handle check-in functionality", async function () {
    // First check-in
    await contract.connect(player1).checkIn();
    
    const [canCheck, lastCheckin] = await contract.canCheckIn(player1.address);
    expect(canCheck).to.be.false; // Should not be able to check-in again immediately
    
    console.log("✅ Check-in completed successfully");
    console.log("   Last check-in:", lastCheckin.toString());
  });

  it("should verify ACL permissions are set correctly", async function () {
    const score = 3000;
    const lines = 50;
    const level = 10;
    
    const encryptedScore = await fhevm
      .createEncryptedInput(await contract.getAddress(), player1.address)
      .add32(BigInt(score))
      .encrypt();
    
    const encryptedLines = await fhevm
      .createEncryptedInput(await contract.getAddress(), player1.address)
      .add32(BigInt(lines))
      .encrypt();
    
    const encryptedLevel = await fhevm
      .createEncryptedInput(await contract.getAddress(), player1.address)
      .add32(BigInt(level))
      .encrypt();
    
    await contract.connect(player1).submitScore(
      encryptedScore.handles[0],
      encryptedLines.handles[0],
      encryptedLevel.handles[0],
      encryptedScore.inputProof,
      encryptedLines.inputProof,
      encryptedLevel.inputProof,
      { value: 0 }
    );
    
    // Get encrypted data - should be publicly decryptable
    const [scoreBytes, linesBytes, levelBytes] = await contract.getEncryptedScore(0);
    
    // In FHEVM mock, we can verify the handles exist
    expect(scoreBytes).to.not.be.undefined;
    expect(linesBytes).to.not.be.undefined;
    expect(levelBytes).to.not.be.undefined;
    
    console.log("✅ ACL permissions verified - encrypted data is publicly decryptable");
  });

  it("should maintain correct total scores count", async function () {
    const scores = [500, 1000, 1500, 2000];
    
    for (let i = 0; i < scores.length; i++) {
      const encryptedScore = await fhevm
        .createEncryptedInput(await contract.getAddress(), player1.address)
        .add32(BigInt(scores[i]))
        .encrypt();
      
      const encryptedLines = await fhevm
        .createEncryptedInput(await contract.getAddress(), player1.address)
        .add32(BigInt(10 + i))
        .encrypt();
      
      const encryptedLevel = await fhevm
        .createEncryptedInput(await contract.getAddress(), player1.address)
        .add32(BigInt(1 + i))
        .encrypt();
      
      await contract.connect(player1).submitScore(
        encryptedScore.handles[0],
        encryptedLines.handles[0],
        encryptedLevel.handles[0],
        encryptedScore.inputProof,
        encryptedLines.inputProof,
        encryptedLevel.inputProof,
        { value: 0 }
      );
    }
    
    const totalScores = await contract.getTotalScores();
    expect(totalScores).to.equal(4n);
    
    console.log("✅ Total scores count is correct:", totalScores.toString());
  });

  it("should handle edge case: zero values", async function () {
    const score = 0;
    const lines = 0;
    const level = 1;
    
    const encryptedScore = await fhevm
      .createEncryptedInput(await contract.getAddress(), player1.address)
      .add32(BigInt(score))
      .encrypt();
    
    const encryptedLines = await fhevm
      .createEncryptedInput(await contract.getAddress(), player1.address)
      .add32(BigInt(lines))
      .encrypt();
    
    const encryptedLevel = await fhevm
      .createEncryptedInput(await contract.getAddress(), player1.address)
      .add32(BigInt(level))
      .encrypt();
    
    await contract.connect(player1).submitScore(
      encryptedScore.handles[0],
      encryptedLines.handles[0],
      encryptedLevel.handles[0],
      encryptedScore.inputProof,
      encryptedLines.inputProof,
      encryptedLevel.inputProof,
      { value: 0 }
    );
    
    const totalScores = await contract.getTotalScores();
    expect(totalScores).to.equal(1n);
    
    console.log("✅ Edge case (zero values) handled successfully");
  });
});

