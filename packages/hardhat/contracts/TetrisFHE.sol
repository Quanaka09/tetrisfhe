// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Tetris Game with FHEVM Encrypted Scores
/// @notice Allows players to submit encrypted scores and view leaderboard
contract TetrisFHE is SepoliaConfig {
    // Struct to store a game score entry
    struct ScoreEntry {
        address player;
        euint32 encryptedScore;      // Encrypted score
        euint32 encryptedLines;      // Encrypted lines cleared
        euint32 encryptedLevel;      // Encrypted level reached
        uint256 timestamp;           // When score was submitted
        bool exists;                 // Check if entry exists
    }

    // State variables
    mapping(uint256 => ScoreEntry) public scores;
    uint256 public nextScoreId;      // Auto-incrementing ID for each score
    uint256 public totalScores;     // Total number of scores
    
    // Check-in tracking (one per day per address)
    mapping(address => uint256) public lastCheckin;  // timestamp of last check-in
    uint256 public constant CHECKIN_COOLDOWN = 86400; // 24 hours in seconds
    
    // Plays tracking (onchain)
    mapping(address => uint256) public plays;  // number of plays per address
    uint256 public constant CHECKIN_REWARD = 10; // plays rewarded per check-in
    uint256 public constant FIRST_CONNECT_REWARD = 5; // plays rewarded on first connect
    
    // Owner and fees
    address public owner;
    uint256 public submissionFee = 0 ether; // Free submission (can be changed)
    
    // Events
    event ScoreSubmitted(
        uint256 indexed scoreId,
        address indexed player,
        uint256 timestamp
    );
    event CheckInCompleted(
        address indexed player,
        uint256 timestamp
    );
    event SubmissionFeeChanged(uint256 newFee);
    event FeesWithdrawn(address indexed to, uint256 amount);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Set submission fee (only owner)
    function setSubmissionFee(uint256 newFee) external onlyOwner {
        submissionFee = newFee;
        emit SubmissionFeeChanged(newFee);
    }

    // Withdraw collected fees (only owner)
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner).transfer(balance);
        emit FeesWithdrawn(owner, balance);
    }

    /// @notice Submit encrypted game score
    /// @param encryptedScore Encrypted score value
    /// @param encryptedLines Encrypted lines cleared
    /// @param encryptedLevel Encrypted level reached
    /// @param scoreProof Proof for encrypted score
    /// @param linesProof Proof for encrypted lines
    /// @param levelProof Proof for encrypted level
    function submitScore(
        externalEuint32 encryptedScore,
        externalEuint32 encryptedLines,
        externalEuint32 encryptedLevel,
        bytes calldata scoreProof,
        bytes calldata linesProof,
        bytes calldata levelProof
    ) external payable {
        require(msg.value >= submissionFee, "Insufficient fee");
        
        uint256 scoreId = nextScoreId++;
        ScoreEntry storage entry = scores[scoreId];
        
        // Import encrypted values using their respective proofs
        euint32 score = FHE.fromExternal(encryptedScore, scoreProof);
        euint32 lines = FHE.fromExternal(encryptedLines, linesProof);
        euint32 level = FHE.fromExternal(encryptedLevel, levelProof);
        
        // Store encrypted values
        entry.encryptedScore = score;
        FHE.allowThis(entry.encryptedScore);
        FHE.makePubliclyDecryptable(entry.encryptedScore);
        
        entry.encryptedLines = lines;
        FHE.allowThis(entry.encryptedLines);
        FHE.makePubliclyDecryptable(entry.encryptedLines);
        
        entry.encryptedLevel = level;
        FHE.allowThis(entry.encryptedLevel);
        FHE.makePubliclyDecryptable(entry.encryptedLevel);
        
        entry.player = msg.sender;
        entry.timestamp = block.timestamp;
        entry.exists = true;
        
        totalScores++;
        
        emit ScoreSubmitted(scoreId, msg.sender, block.timestamp);
    }

    /// @notice Check-in to receive daily plays
    /// @return success Whether check-in was successful
    function checkIn() external returns (bool) {
        uint256 lastCheckinTime = lastCheckin[msg.sender];
        require(
            block.timestamp >= lastCheckinTime + CHECKIN_COOLDOWN,
            "Check-in cooldown not expired"
        );
        
        lastCheckin[msg.sender] = block.timestamp;
        plays[msg.sender] += CHECKIN_REWARD; // Add 10 plays
        emit CheckInCompleted(msg.sender, block.timestamp);
        return true;
    }
    
    /// @notice Award first connect bonus (5 plays)
    /// @param signature EIP-712 signature for verification
    function claimFirstConnectBonus(bytes calldata signature) external {
        // TODO: Verify EIP-712 signature onchain if needed
        // For now, we'll track first connect in a mapping
        // This can be called after EIP-712 verification on frontend
        require(plays[msg.sender] == 0, "First connect bonus already claimed");
        plays[msg.sender] += FIRST_CONNECT_REWARD;
    }
    
    /// @notice Use a play (decrement plays count)
    function usePlay() external {
        require(plays[msg.sender] > 0, "No plays available");
        plays[msg.sender]--;
    }
    
    /// @notice Get number of plays for an address
    /// @param player Address to check
    /// @return Number of plays
    function getPlays(address player) external view returns (uint256) {
        return plays[player];
    }

    /// @notice Get encrypted score data for a specific score ID
    /// @param scoreId The score ID to retrieve
    /// @return score Encrypted score
    /// @return lines Encrypted lines
    /// @return level Encrypted level
    function getEncryptedScore(uint256 scoreId) external view returns (
        bytes32 score,
        bytes32 lines,
        bytes32 level
    ) {
        require(scores[scoreId].exists, "Score does not exist");
        ScoreEntry storage entry = scores[scoreId];
        
        score = FHE.toBytes32(entry.encryptedScore);
        lines = FHE.toBytes32(entry.encryptedLines);
        level = FHE.toBytes32(entry.encryptedLevel);
    }

    /// @notice Get score entry info (non-encrypted data)
    /// @param scoreId The score ID to retrieve
    /// @return player Player address
    /// @return timestamp When score was submitted
    /// @return exists Whether entry exists
    function getScoreInfo(uint256 scoreId) external view returns (
        address player,
        uint256 timestamp,
        bool exists
    ) {
        require(scores[scoreId].exists, "Score does not exist");
        ScoreEntry storage entry = scores[scoreId];
        
        return (entry.player, entry.timestamp, entry.exists);
    }

    /// @notice Check if address can check-in (cooldown expired)
    /// @param player Address to check
    /// @return canCheckin Whether player can check-in
    /// @return lastCheckinTime Timestamp of last check-in
    function canCheckIn(address player) external view returns (
        bool canCheckin,
        uint256 lastCheckinTime
    ) {
        lastCheckinTime = lastCheckin[player];
        canCheckin = block.timestamp >= lastCheckinTime + CHECKIN_COOLDOWN;
    }

    /// @notice Get total number of scores
    /// @return Total scores count
    function getTotalScores() external view returns (uint256) {
        return totalScores;
    }
}

