const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("TetrisFHE - Integration Tests (Full Flow)", function () {
  let contract;
  let owner, player1, player2, player3;

  beforeEach(async function () {
    if (!fhevm.isMock) {
      throw new Error("This test must run in FHEVM mock environment");
    }
    
    await fhevm.initializeCLIApi();
    [owner, player1, player2, player3] = await ethers.getSigners();
    
    const Factory = await ethers.getContractFactory("TetrisFHE");
    const deployed = await Factory.deploy();
    await deployed.waitForDeployment();
    contract = deployed;
  });

  describe("Complete Game Flow", function () {
    it("should handle full game flow: submit scores -> check-in -> leaderboard", async function () {
      console.log("\n🎮 Testing Complete Game Flow...\n");

      // Step 1: Player 1 submits high score
      console.log("📝 Step 1: Player 1 submits score (5000 points, 100 lines, level 10)");
      const score1 = 5000;
      const lines1 = 100;
      const level1 = 10;
      
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
      
      let totalScores = await contract.getTotalScores();
      expect(totalScores).to.equal(1n);
      console.log("   ✅ Score submitted, total scores:", totalScores.toString());

      // Step 2: Player 2 submits lower score
      console.log("\n📝 Step 2: Player 2 submits score (2000 points, 40 lines, level 4)");
      const score2 = 2000;
      const lines2 = 40;
      const level2 = 4;
      
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
      
      totalScores = await contract.getTotalScores();
      expect(totalScores).to.equal(2n);
      console.log("   ✅ Score submitted, total scores:", totalScores.toString());

      // Step 3: Player 3 submits medium score
      console.log("\n📝 Step 3: Player 3 submits score (3500 points, 70 lines, level 7)");
      const score3 = 3500;
      const lines3 = 70;
      const level3 = 7;
      
      const encryptedScore3 = await fhevm
        .createEncryptedInput(await contract.getAddress(), player3.address)
        .add32(BigInt(score3))
        .encrypt();
      
      const encryptedLines3 = await fhevm
        .createEncryptedInput(await contract.getAddress(), player3.address)
        .add32(BigInt(lines3))
        .encrypt();
      
      const encryptedLevel3 = await fhevm
        .createEncryptedInput(await contract.getAddress(), player3.address)
        .add32(BigInt(level3))
        .encrypt();
      
      await contract.connect(player3).submitScore(
        encryptedScore3.handles[0],
        encryptedLines3.handles[0],
        encryptedLevel3.handles[0],
        encryptedScore3.inputProof,
        encryptedLines3.inputProof,
        encryptedLevel3.inputProof,
        { value: 0 }
      );
      
      totalScores = await contract.getTotalScores();
      expect(totalScores).to.equal(3n);
      console.log("   ✅ Score submitted, total scores:", totalScores.toString());

      // Step 4: Verify all scores can be retrieved
      console.log("\n📊 Step 4: Retrieving all encrypted scores for leaderboard");
      for (let i = 0; i < 3; i++) {
        const [scoreBytes, linesBytes, levelBytes] = await contract.getEncryptedScore(i);
        const [player, timestamp, exists] = await contract.getScoreInfo(i);
        
        expect(exists).to.be.true;
        expect(scoreBytes).to.not.be.undefined;
        expect(linesBytes).to.not.be.undefined;
        expect(levelBytes).to.not.be.undefined;
        
        console.log(`   ✅ Score ${i}: Player ${player.slice(0, 8)}... - Encrypted data retrieved`);
      }

      // Step 5: Test check-in functionality
      console.log("\n⏰ Step 5: Testing check-in functionality");
      const [canCheckBefore, lastCheckinBefore] = await contract.canCheckIn(player1.address);
      console.log(`   Before check-in: canCheck=${canCheckBefore}, lastCheckin=${lastCheckinBefore.toString()}`);
      
      await contract.connect(player1).checkIn();
      
      const [canCheckAfter, lastCheckinAfter] = await contract.canCheckIn(player1.address);
      expect(canCheckAfter).to.be.false; // Should not be able to check-in again immediately
      expect(lastCheckinAfter).to.be.greaterThan(lastCheckinBefore);
      console.log(`   ✅ Check-in completed, lastCheckin updated to: ${lastCheckinAfter.toString()}`);

      console.log("\n✅ Complete game flow test passed!");
    });
  });

  describe("Leaderboard Simulation", function () {
    it("should simulate leaderboard with multiple scores", async function () {
      console.log("\n🏆 Testing Leaderboard Simulation...\n");

      const players = [
        { address: player1, score: 10000, lines: 200, level: 20 },
        { address: player2, score: 5000, lines: 100, level: 10 },
        { address: player3, score: 7500, lines: 150, level: 15 },
      ];

      // Submit all scores
      for (let i = 0; i < players.length; i++) {
        const p = players[i];
        console.log(`📝 Submitting score for Player ${i + 1}: ${p.score} points`);
        
        const encryptedScore = await fhevm
          .createEncryptedInput(await contract.getAddress(), p.address.address)
          .add32(BigInt(p.score))
          .encrypt();
        
        const encryptedLines = await fhevm
          .createEncryptedInput(await contract.getAddress(), p.address.address)
          .add32(BigInt(p.lines))
          .encrypt();
        
        const encryptedLevel = await fhevm
          .createEncryptedInput(await contract.getAddress(), p.address.address)
          .add32(BigInt(p.level))
          .encrypt();
        
        await contract.connect(p.address).submitScore(
          encryptedScore.handles[0],
          encryptedLines.handles[0],
          encryptedLevel.handles[0],
          encryptedScore.inputProof,
          encryptedLines.inputProof,
          encryptedLevel.inputProof,
          { value: 0 }
        );
      }

      // Verify all scores stored
      const totalScores = await contract.getTotalScores();
      expect(totalScores).to.equal(3n);
      console.log(`\n✅ Total scores in leaderboard: ${totalScores.toString()}`);

      // Retrieve all encrypted data (simulating frontend decryption)
      console.log("\n🔓 Retrieving encrypted data for public decryption:");
      for (let i = 0; i < 3; i++) {
        const [scoreBytes, linesBytes, levelBytes] = await contract.getEncryptedScore(i);
        const [player, timestamp] = await contract.getScoreInfo(i);
        
        expect(scoreBytes).to.not.be.undefined;
        expect(linesBytes).to.not.be.undefined;
        expect(levelBytes).to.not.be.undefined;
        
        console.log(`   Score ${i}: ${player.slice(0, 8)}... - All encrypted data available for decryption`);
      }

      console.log("\n✅ Leaderboard simulation test passed!");
    });
  });

  describe("Check-in Cooldown", function () {
    it("should enforce 24-hour cooldown on check-in", async function () {
      console.log("\n⏰ Testing Check-in Cooldown...\n");

      // First check-in
      console.log("📝 First check-in");
      await contract.connect(player1).checkIn();
      
      const [canCheck1, lastCheckin1] = await contract.canCheckIn(player1.address);
      expect(canCheck1).to.be.false;
      console.log(`   ✅ Check-in completed, cannot check-in again immediately`);
      console.log(`   Last check-in timestamp: ${lastCheckin1.toString()}`);

      // Try to check-in again immediately (should fail)
      console.log("\n❌ Attempting immediate second check-in (should fail)");
      await expect(
        contract.connect(player1).checkIn()
      ).to.be.revertedWith("Check-in cooldown not expired");
      console.log("   ✅ Correctly prevented double check-in");

      // Different player can check-in
      console.log("\n✅ Different player can check-in");
      await contract.connect(player2).checkIn();
      const [canCheck2] = await contract.canCheckIn(player2.address);
      expect(canCheck2).to.be.false;
      console.log("   ✅ Player 2 check-in successful");

      console.log("\n✅ Check-in cooldown test passed!");
    });
  });

  describe("Edge Cases", function () {
    it("should handle maximum values", async function () {
      console.log("\n🔢 Testing Maximum Values...\n");

      // euint32 max value is 2^32 - 1 = 4,294,967,295
      const maxScore = 4294967295;
      const maxLines = 4294967295;
      const maxLevel = 4294967295;

      console.log(`📝 Submitting maximum values: score=${maxScore}, lines=${maxLines}, level=${maxLevel}`);
      
      const encryptedScore = await fhevm
        .createEncryptedInput(await contract.getAddress(), player1.address)
        .add32(BigInt(maxScore))
        .encrypt();
      
      const encryptedLines = await fhevm
        .createEncryptedInput(await contract.getAddress(), player1.address)
        .add32(BigInt(maxLines))
        .encrypt();
      
      const encryptedLevel = await fhevm
        .createEncryptedInput(await contract.getAddress(), player1.address)
        .add32(BigInt(maxLevel))
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

      const [scoreBytes, linesBytes, levelBytes] = await contract.getEncryptedScore(0);
      expect(scoreBytes).to.not.be.undefined;
      expect(linesBytes).to.not.be.undefined;
      expect(levelBytes).to.not.be.undefined;

      console.log("   ✅ Maximum values handled successfully");
      console.log("\n✅ Maximum values test passed!");
    });

    it("should handle minimum values (zero)", async function () {
      console.log("\n🔢 Testing Minimum Values (Zero)...\n");

      const score = 0;
      const lines = 0;
      const level = 0;

      console.log(`📝 Submitting zero values: score=${score}, lines=${lines}, level=${level}`);
      
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

      console.log("   ✅ Zero values handled successfully");
      console.log("\n✅ Minimum values test passed!");
    });
  });
});

