import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ethers } from 'ethers';
import { Coins, Trophy, Zap, CheckCircle, ArrowLeft, ArrowRight, ArrowDown, RotateCw } from 'lucide-react';
import { useWallet, useFhevm, useEncrypt, useDecrypt } from '@fhevm-sdk';

/**
 * RETRO TETRIS FHE GAME - Tetris Game with FHEVM Encrypted Scores
 * Author: @QuanCrytoGM - https://x.com/QuanCrytoGM
 */

// Contract configuration - Update with deployed contract address
const TETRIS_CONTRACT_ADDRESSES = {
  31337: '0x4a44ab6Ab4EC21C31fca2FC25B11614c9181e1DF', // Local Hardhat
  11155111: '0x44A230c067d7863FA9247fdb01aB047F8fEb7Ebc', // Sepolia (deployed with plays feature)
};

const TETRIS_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'bytes32', name: 'encryptedScore', type: 'bytes32' },
      { internalType: 'bytes32', name: 'encryptedLines', type: 'bytes32' },
      { internalType: 'bytes32', name: 'encryptedLevel', type: 'bytes32' },
      { internalType: 'bytes', name: 'scoreProof', type: 'bytes' },
      { internalType: 'bytes', name: 'linesProof', type: 'bytes' },
      { internalType: 'bytes', name: 'levelProof', type: 'bytes' },
    ],
    name: 'submitScore',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'checkIn',
    outputs: [{ internalType: 'bool', name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'scoreId', type: 'uint256' }],
    name: 'getEncryptedScore',
    outputs: [
      { internalType: 'bytes32', name: 'score', type: 'bytes32' },
      { internalType: 'bytes32', name: 'lines', type: 'bytes32' },
      { internalType: 'bytes32', name: 'level', type: 'bytes32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'scoreId', type: 'uint256' }],
    name: 'getScoreInfo',
    outputs: [
      { internalType: 'address', name: 'player', type: 'address' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bool', name: 'exists', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'canCheckIn',
    outputs: [
      { internalType: 'bool', name: 'canCheckin', type: 'bool' },
      { internalType: 'uint256', name: 'lastCheckinTime', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalScores',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'getPlays',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'usePlay',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'signature', type: 'bytes' }],
    name: 'claimFirstConnectBonus',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_PLAYS = 5;

const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
};

const COLORS = {
  I: '#00F0F0',
  O: '#F0F000',
  T: '#A000F0',
  S: '#00F000',
  Z: '#F00000',
  J: '#0000F0',
  L: '#F0A000',
};

interface LeaderboardEntry {
  name: string;
  score: number;
  lines: number;
  level: number;
  timestamp: number;
  address?: string;
}

const RetroTetris = () => {
  // Game state
  const [board, setBoard] = useState(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
  const [currentPiece, setCurrentPiece] = useState<any>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [plays, setPlays] = useState(0); // Load from onchain
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0); // Lưu điểm cuối cùng khi game over
  const [finalLines, setFinalLines] = useState(0); // Lưu lines cuối cùng
  const [finalLevel, setFinalLevel] = useState(1); // Lưu level cuối cùng
  const [combo, setCombo] = useState(0);

  // Blockchain state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [txHash, setTxHash] = useState('');
  const [showCheckin, setShowCheckin] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showEip712Sign, setShowEip712Sign] = useState(false);
  const [eip712Signature, setEip712Signature] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Track initial loading state

  const gameLoopRef = useRef<any>(null);

  // FHEVM hooks
  const { address, chainId, isConnected, connect } = useWallet();
  const { status: fhevmStatus, initialize } = useFhevm();
  const { encrypt, isEncrypting, error: encryptError } = useEncrypt();
  const { publicDecrypt, decrypt, isDecrypting } = useDecrypt();

  // Auto-initialize FHEVM when wallet connects
  useEffect(() => {
    if (isConnected && fhevmStatus === 'idle') {
      initialize();
    }
  }, [isConnected, fhevmStatus, initialize]);

  // Tính contractAddress với useMemo để tránh lỗi initialization
  const contractAddress = useMemo(() => {
    return TETRIS_CONTRACT_ADDRESSES[chainId as keyof typeof TETRIS_CONTRACT_ADDRESSES] || '';
  }, [chainId]);

  // Mỗi lần đăng nhập đều cần EIP-712 signature để giải mã
  useEffect(() => {
    if (!isConnected || !address || !contractAddress || fhevmStatus !== 'ready') {
      setIsLoading(false);
      return;
    }

    // Kiểm tra sessionStorage (mỗi session cần sign lại)
    const sessionKey = `tetris-eip712-${address}`;
    const sessionSignature = sessionStorage.getItem(sessionKey);
    
    if (!sessionSignature) {
      // Chưa có EIP-712 signature trong session này, yêu cầu sign
      console.log('🔐 EIP-712 signature required for decryption, showing modal');
      setShowEip712Sign(true);
      setEip712Signature(null);
      setIsLoading(false); // Không block khi chờ user sign
    } else {
      // Đã có signature trong session
      setEip712Signature(sessionSignature);
      setShowEip712Sign(false);
      
      // Tặng 5 plays khi connect ví lần đầu tiên (kiểm tra localStorage)
      const firstConnectKey = `tetris-first-connect-${address}`;
      const hasConnectedBefore = localStorage.getItem(firstConnectKey);
      if (!hasConnectedBefore) {
        // Plays đã được tăng onchain qua claimFirstConnectBonus
        localStorage.setItem(firstConnectKey, 'true');
      }
      setIsLoading(false); // Signature đã có, không block nữa
    }
  }, [isConnected, address, contractAddress, fhevmStatus]);

  // Handle EIP-712 signature để giải mã (bắt buộc mỗi session)
  const handleEip712Sign = async () => {
    if (!isConnected || !address || !window.ethereum || !contractAddress) {
      return;
    }

    try {
      setIsProcessing(true);
      setMessage('Signing EIP-712 message to enable decryption...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // Tạo EIP-712 signature cho decryption permission
      const domain = {
        name: 'TetrisFHE',
        version: '1',
        chainId: chainId,
        verifyingContract: contractAddress,
      };

      const types = {
        DecryptionPermission: [
          { name: 'user', type: 'address' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'chainId', type: 'uint256' },
          { name: 'action', type: 'string' },
        ],
      };

      const message = {
        user: userAddress,
        timestamp: Math.floor(Date.now() / 1000),
        chainId: chainId,
        action: 'decryption_permission',
      };

      setMessage('Waiting for signature...');
      const signature = await signer.signTypedData(domain, types, message);
      console.log('✅ EIP-712 signature for decryption:', { signature, message });

      // Verify signature
      const verifyAddress = ethers.verifyTypedData(domain, types, message, signature);
      if (verifyAddress.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error('Signature verification failed');
      }

      // Lưu signature vào sessionStorage (mỗi session cần sign lại)
      const sessionKey = `tetris-eip712-${address}`;
      sessionStorage.setItem(sessionKey, signature);
      setEip712Signature(signature);
      setShowEip712Sign(false);
      
      // Claim first connect bonus onchain (nếu chưa claim)
      const firstConnectKey = `tetris-first-connect-${address}`;
      const hasConnectedBefore = localStorage.getItem(firstConnectKey);
      if (!hasConnectedBefore) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(contractAddress, TETRIS_CONTRACT_ABI, signer);
          
          // Convert signature to bytes (remove 0x prefix)
          const signatureBytes = ethers.getBytes(signature);
          
          const tx = await contract.claimFirstConnectBonus(signatureBytes);
          await tx.wait();
          
          localStorage.setItem(firstConnectKey, 'true');
          await loadPlays(); // Reload plays from onchain
          setMessage('Welcome! You received 5 free plays!');
        } catch (error: any) {
          console.error('Failed to claim first connect bonus:', error);
          // Check if contract doesn't have this function (old contract version)
          if (error?.code === 'CALL_EXCEPTION' || error?.message?.includes('execution reverted')) {
            console.warn('⚠️ Contract does not support claimFirstConnectBonus. Please deploy new contract version.');
            // Still mark as connected even if claim fails
            localStorage.setItem(firstConnectKey, 'true');
            setMessage('EIP-712 signature verified! Decryption enabled. (Contract needs update for plays feature)');
          } else {
            // Still mark as connected even if claim fails
            localStorage.setItem(firstConnectKey, 'true');
            setMessage('EIP-712 signature verified! Decryption enabled.');
          }
        }
      } else {
        setMessage('EIP-712 signature verified! Decryption enabled.');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('EIP-712 signature failed:', error);
      if (error?.code === 4001 || error?.message?.includes('user rejected') || error?.message?.includes('denied')) {
        setMessage('Signature required for decryption. Please sign to continue.');
      } else {
        setMessage('Failed to verify signature. Please try again.');
      }
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Load plays from onchain
  const loadPlays = async () => {
    if (!isConnected || !address || !window.ethereum || !contractAddress) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, TETRIS_CONTRACT_ABI, provider);
      
      // Check if contract has getPlays function (new contract version)
      // If contract doesn't have it, it will revert
      try {
        const onchainPlays = await contract.getPlays(address);
        setPlays(Number(onchainPlays));
        console.log('✅ Loaded plays from onchain:', Number(onchainPlays));
      } catch (callError: any) {
        // Contract doesn't have getPlays function (old contract version)
        if (callError?.code === 'CALL_EXCEPTION' || callError?.message?.includes('execution reverted')) {
          console.warn('⚠️ Contract does not have getPlays function. Please deploy new contract version.');
          setPlays(0);
          setMessage('Contract needs to be updated. Plays feature not available.');
          setTimeout(() => setMessage(''), 5000);
        } else {
          throw callError;
        }
      }
    } catch (error) {
      console.error('Failed to load plays from onchain:', error);
      // Fallback to 0 if error
      setPlays(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Load plays when wallet connects
  useEffect(() => {
    if (isConnected && address && contractAddress && fhevmStatus === 'ready') {
      loadPlays();
    }
  }, [isConnected, address, contractAddress, fhevmStatus]);

  // Load leaderboard from blockchain (chỉ khi có EIP-712 signature)
  useEffect(() => {
    if (isConnected && fhevmStatus === 'ready' && contractAddress && eip712Signature) {
      loadLeaderboard();
    }
  }, [isConnected, fhevmStatus, contractAddress, eip712Signature]);

  // Update level based on score
  useEffect(() => {
    const newLevel = Math.floor(score / 500) + 1;
    setLevel(newLevel);
  }, [score]);

  const loadLeaderboard = async () => {
    // Chỉ load từ onchain, không có fallback localStorage
    if (!isConnected || !window.ethereum || !contractAddress) {
      setLeaderboard([]);
      setIsLoading(false);
      return;
    }

    // Kiểm tra có EIP-712 signature không
    if (!eip712Signature) {
      setMessage('EIP-712 signature required to decrypt leaderboard. Please sign first.');
      setLeaderboard([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, TETRIS_CONTRACT_ABI, provider);
      
      const totalScores = await contract.getTotalScores();
      const leaderboardData: LeaderboardEntry[] = [];

      // Load all scores, then sort and take top 10
      const total = Number(totalScores);
      setMessage(`Loading ${total} scores from blockchain...`);
      
      for (let i = 0; i < total; i++) {
        try {
          const [player, timestamp, exists] = await contract.getScoreInfo(i);
          if (exists) {
            // Decrypt score for display using public decryption
            // Contract đã makePubliclyDecryptable() nên có thể dùng publicDecrypt()
            // Tuy nhiên, vẫn yêu cầu EIP-712 signature để verify user identity
            const [scoreBytes, linesBytes, levelBytes] = await contract.getEncryptedScore(i);
            
            // Kiểm tra có EIP-712 signature không (requirement của app, không phải FHEVM)
            if (!eip712Signature) {
              throw new Error('EIP-712 signature required for decryption');
            }
            
            // Sử dụng publicDecrypt vì contract đã makePubliclyDecryptable()
            // Đây là chuẩn FHEVM: nếu makePubliclyDecryptable() thì dùng publicDecrypt()
            const [decryptedScore, decryptedLines, decryptedLevel] = await Promise.all([
              publicDecrypt(scoreBytes),
              publicDecrypt(linesBytes),
              publicDecrypt(levelBytes),
            ]);

            leaderboardData.push({
              name: `Player${player.slice(2, 6)}`,
              score: decryptedScore,
              lines: decryptedLines,
              level: decryptedLevel,
              timestamp: Number(timestamp) * 1000,
              address: player,
            });
          }
        } catch (error) {
          console.error(`Failed to load score ${i}:`, error);
        }
      }

      // Sort by score descending and take top 10
      leaderboardData.sort((a, b) => b.score - a.score);
      const top10 = leaderboardData.slice(0, 10);
      setLeaderboard(top10);
      setMessage(`Loaded ${top10.length} top scores from blockchain!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to load leaderboard from blockchain:', error);
      setMessage('Failed to load leaderboard from blockchain');
      setLeaderboard([]);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const createPiece = useCallback(() => {
    const shapes = Object.keys(SHAPES);
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    return {
      shape: SHAPES[randomShape as keyof typeof SHAPES],
      type: randomShape,
      color: COLORS[randomShape as keyof typeof COLORS],
    };
  }, []);

  const checkCollision = useCallback((piece: any, pos: any, checkBoard: any) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;

          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true;
          }

          if (newY >= 0 && checkBoard[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const mergePieceToBoard = useCallback((piece: any, pos: any, currentBoard: any) => {
    const newBoard = currentBoard.map((row: any) => [...row]);

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = pos.y + y;
          const boardX = pos.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }

    return newBoard;
  }, []);

  const clearLines = useCallback((currentBoard: any) => {
    const newBoard: any[] = [];
    let linesCleared = 0;

    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (currentBoard[y].every((cell: any) => cell !== 0)) {
        linesCleared++;
      } else {
        newBoard.unshift(currentBoard[y]);
      }
    }

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }

    if (linesCleared > 0) {
      // 1 hàng = 1 điểm, nhiều hàng cùng lúc thì có hệ số tăng
      let points = 0;
      if (linesCleared === 1) {
        points = 1; // 1 hàng = 1 điểm
      } else {
        // Nhiều hàng cùng lúc: hệ số tăng theo số hàng
        // 2 hàng = 2 * 1.5 = 3 điểm
        // 3 hàng = 3 * 2 = 6 điểm
        // 4 hàng = 4 * 3 = 12 điểm
        const multiplier = [0, 1, 1.5, 2, 3][linesCleared] || 3;
        points = linesCleared * multiplier;
      }
      
      setScore((s) => s + Math.floor(points));
      setLines((l) => l + linesCleared);
      setCombo((c) => c + 1);
    } else {
      setCombo(0);
    }

    return { board: newBoard, linesCleared };
  }, [level, combo]);

  const rotatePiece = useCallback((piece: any) => {
    const rotated = piece.shape[0].map((_: any, i: number) =>
      piece.shape.map((row: any) => row[i]).reverse()
    );
    return { ...piece, shape: rotated };
  }, []);

  const moveLeft = useCallback(() => {
    if (!currentPiece || !gameActive) return;
    const newPos = { ...position, x: position.x - 1 };
    if (!checkCollision(currentPiece, newPos, board)) {
      setPosition(newPos);
    }
  }, [currentPiece, position, board, gameActive, checkCollision]);

  const moveRight = useCallback(() => {
    if (!currentPiece || !gameActive) return;
    const newPos = { ...position, x: position.x + 1 };
    if (!checkCollision(currentPiece, newPos, board)) {
      setPosition(newPos);
    }
  }, [currentPiece, position, board, gameActive, checkCollision]);

  const moveDown = useCallback((addScore = false) => {
    if (!currentPiece || !gameActive) return;
    const newPos = { ...position, y: position.y + 1 };

    if (!checkCollision(currentPiece, newPos, board)) {
      setPosition(newPos);
      if (addScore) {
        setScore((s) => s + 1);
      }
    } else {
      const mergedBoard = mergePieceToBoard(currentPiece, position, board);
      const { board: clearedBoard } = clearLines(mergedBoard);
      setBoard(clearedBoard);

      const newPiece = createPiece();
      const startPos = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };

      if (checkCollision(newPiece, startPos, clearedBoard)) {
        setGameActive(false);
        setFinalScore(score); // Lưu điểm cuối cùng
        setFinalLines(lines); // Lưu lines cuối cùng
        setFinalLevel(level); // Lưu level cuối cùng
        setGameOver(true);
        // Plays đã được giảm onchain khi start game, không cần giảm lại
      } else {
        setCurrentPiece(newPiece);
        setPosition(startPos);
      }
    }
  }, [currentPiece, position, board, gameActive, checkCollision, mergePieceToBoard, clearLines, createPiece, score, lines, level]);


  const rotate = useCallback(() => {
    if (!currentPiece || !gameActive) return;
    const rotated = rotatePiece(currentPiece);
    if (!checkCollision(rotated, position, board)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, position, board, gameActive, rotatePiece, checkCollision]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || !gameActive) return;
    let newPos = { ...position };

    // Rơi xuống ngay lập tức đến vị trí thấp nhất có thể
    while (!checkCollision(currentPiece, { ...newPos, y: newPos.y + 1 }, board)) {
      newPos.y++;
    }

    // Đặt vị trí và lock piece ngay lập tức (không có khoảng trắng)
    setPosition(newPos);
    // Lock piece ngay lập tức thay vì setTimeout
    const mergedBoard = mergePieceToBoard(currentPiece, newPos, board);
    const { board: clearedBoard } = clearLines(mergedBoard);
    setBoard(clearedBoard);

    const newPiece = createPiece();
    const startPos = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };

    if (checkCollision(newPiece, startPos, clearedBoard)) {
      setGameActive(false);
      setFinalScore(score); // Lưu điểm cuối cùng
      setFinalLines(lines); // Lưu lines cuối cùng
      setFinalLevel(level); // Lưu level cuối cùng
      setGameOver(true);
      setPlays((p) => Math.max(0, p - 1));
    } else {
      setCurrentPiece(newPiece);
      setPosition(startPos);
    }
  }, [currentPiece, position, board, gameActive, checkCollision, mergePieceToBoard, clearLines, createPiece, score, lines, level]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameActive) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowDown':
          e.preventDefault();
          hardDrop();
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameActive, moveLeft, moveRight, hardDrop, rotate]);

  useEffect(() => {
    if (gameActive && currentPiece) {
      const speed = Math.max(100, 800 - (level - 1) * 50);
      gameLoopRef.current = setInterval(moveDown, speed);
      return () => clearInterval(gameLoopRef.current);
    }
  }, [gameActive, currentPiece, level, moveDown]);

  // Check-in availability function - defined before use
  const canCheckin = useCallback(async () => {
    if (!isConnected || !window.ethereum || !contractAddress) return false;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, TETRIS_CONTRACT_ABI, provider);
      const [canCheck, _] = await contract.canCheckIn(address);
      return canCheck;
    } catch {
      return false;
    }
  }, [isConnected, contractAddress, address]);

  const startGame = async () => {
    // Yêu cầu connect wallet trước khi start
    if (!isConnected || !window.ethereum) {
      setMessage('Please connect your wallet first');
      setTimeout(() => setMessage(''), 3000);
      connect();
      return;
    }

    // Yêu cầu FHEVM ready
    if (fhevmStatus !== 'ready') {
      setMessage('Initializing FHEVM... Please wait');
      if (fhevmStatus === 'idle') {
        initialize();
      }
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Kiểm tra và use play onchain
    try {
      if (!contractAddress) {
        setMessage('Contract not available');
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      // Kiểm tra plays onchain
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, TETRIS_CONTRACT_ABI, provider);
      
      let onchainPlays = 0;
      try {
        onchainPlays = Number(await contract.getPlays(address));
      } catch (callError: any) {
        // Contract doesn't have getPlays function (old contract version)
        if (callError?.code === 'CALL_EXCEPTION' || callError?.message?.includes('execution reverted')) {
          console.warn('⚠️ Contract does not support plays feature. Please deploy new contract version.');
          setMessage('Contract needs to be updated. Plays feature not available.');
          setTimeout(() => setMessage(''), 5000);
          return;
        }
        throw callError;
      }
      
      if (onchainPlays <= 0) {
        const canCheck = await canCheckin();
        if (canCheck) {
          setMessage('Please check-in first to get plays');
          setTimeout(() => setMessage(''), 3000);
          return;
        } else {
          setMessage('No plays available. Please check-in when available (24h cooldown)');
          setTimeout(() => setMessage(''), 3000);
          return;
        }
      }

      // Use play onchain
      try {
        const signer = await provider.getSigner();
        const contractWithSigner = new ethers.Contract(contractAddress, TETRIS_CONTRACT_ABI, signer);
        const tx = await contractWithSigner.usePlay();
        await tx.wait();
        
        // Reload plays from onchain
        await loadPlays();
      } catch (txError: any) {
        // Contract doesn't have usePlay function (old contract version)
        if (txError?.code === 'CALL_EXCEPTION' || txError?.message?.includes('execution reverted')) {
          console.warn('⚠️ Contract does not support usePlay. Please deploy new contract version.');
          setMessage('Contract needs to be updated. Plays feature not available.');
          setTimeout(() => setMessage(''), 5000);
          return;
        }
        throw txError;
      }
    } catch (error: any) {
      console.error('Failed to use play:', error);
      setMessage('Failed to start game. Please try again.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Start game
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
    const newPiece = createPiece();
    setCurrentPiece(newPiece);
    setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
    setScore(0);
    setLines(0);
    setLevel(1);
    setCombo(0);
    setFinalScore(0);
    setFinalLines(0);
    setFinalLevel(1);
    setGameActive(true);
    setGameOver(false);
  };

  // Handle publish score from game over modal
  const handlePublishScoreFromGameOver = async () => {
    await handlePublishScore(finalScore, finalLines, finalLevel);
    // Close game over modal after successful publish
    setTimeout(() => {
      setGameOver(false);
    }, 2000);
  };

  const getDisplayBoard = () => {
    let display = board.map((row) => [...row]);

    if (currentPiece && gameActive) {
      display = mergePieceToBoard(currentPiece, position, display);
    }

    return display;
  };

  // Tạo EIP-712 signature cho check-in
  const createCheckinSignature = async (signer: any, address: string, contractAddr: string, chain: number) => {
    const domain = {
      name: 'TetrisFHE',
      version: '1',
      chainId: chain,
      verifyingContract: contractAddr,
    };

    const types = {
      CheckIn: [
        { name: 'user', type: 'address' },
        { name: 'timestamp', type: 'uint256' },
        { name: 'chainId', type: 'uint256' },
      ],
    };

    const message = {
      user: address,
      timestamp: Math.floor(Date.now() / 1000),
      chainId: chain,
    };

    const signature = await signer.signTypedData(domain, types, message);
    return { signature, message };
  };

  const handleCheckin = async () => {
    if (!isConnected || !window.ethereum || !contractAddress || fhevmStatus !== 'ready') {
      setMessage('Please connect wallet and initialize FHEVM');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Check cooldown trước khi proceed
    const canCheck = await canCheckin();
    if (!canCheck) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, TETRIS_CONTRACT_ABI, provider);
        const [_, lastCheckinTime] = await contract.canCheckIn(address);
        const lastCheckin = Number(lastCheckinTime) * 1000; // Convert to milliseconds
        const cooldown = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const nextCheckinTime = lastCheckin + cooldown;
        const now = Date.now();
        const timeRemaining = nextCheckinTime - now;
        
        if (timeRemaining > 0) {
          const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
          const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
          setMessage(`Check-in cooldown: ${hours}h ${minutes}m remaining`);
        } else {
          setMessage('Check-in cooldown not expired. Please wait.');
        }
        setTimeout(() => setMessage(''), 5000);
      } catch (error) {
        setMessage('Check-in cooldown not expired. Please wait 24 hours.');
        setTimeout(() => setMessage(''), 5000);
      }
      return;
    }

    try {
      setIsProcessing(true);
      setShowCheckin(true);
      setMessage('Signing check-in request...');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // Tạo EIP-712 signature
      const { signature, message } = await createCheckinSignature(signer, userAddress, contractAddress, chainId!);
      console.log('✅ EIP-712 signature created:', { signature, message });

      // Verify signature locally (optional - để đảm bảo tính xác thực)
      const verifyAddress = ethers.verifyTypedData(
        {
          name: 'TetrisFHE',
          version: '1',
          chainId: chainId,
          verifyingContract: contractAddress,
        },
        {
          CheckIn: [
            { name: 'user', type: 'address' },
            { name: 'timestamp', type: 'uint256' },
            { name: 'chainId', type: 'uint256' },
          ],
        },
        message,
        signature
      );

      if (verifyAddress.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error('Signature verification failed');
      }

      setMessage('Submitting check-in to blockchain...');

      // Gọi contract với signature (contract có thể verify sau)
      const contract = new ethers.Contract(contractAddress, TETRIS_CONTRACT_ABI, signer);
      const tx = await contract.checkIn();
      setTxHash(tx.hash);
      setMessage('Waiting for confirmation...');

      const receipt = await tx.wait();
      setTxHash(receipt.transactionHash);

      // Lưu signature để verify sau nếu cần
      const checkinRecord = {
        address: userAddress,
        timestamp: message.timestamp,
        signature: signature,
        txHash: receipt.transactionHash,
      };
      localStorage.setItem(`tetris-checkin-${userAddress}-${message.timestamp}`, JSON.stringify(checkinRecord));

      // Reload plays from onchain (check-in đã tăng plays onchain)
      await loadPlays();
      setMessage('Check-in successful! +10 plays');
      setTimeout(() => {
        setShowCheckin(false);
        setTxHash('');
        setMessage('');
      }, 2000);
    } catch (error: any) {
      console.error('Check-in failed:', error);
      
      // Parse error message
      let errorMessage = 'Check-in failed';
      
      // Check if it's a cooldown error
      if (error?.message?.includes('cooldown') || error?.reason?.includes('cooldown')) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const contract = new ethers.Contract(contractAddress, TETRIS_CONTRACT_ABI, provider);
          const [_, lastCheckinTime] = await contract.canCheckIn(address);
          const lastCheckin = Number(lastCheckinTime) * 1000;
          const cooldown = 24 * 60 * 60 * 1000;
          const nextCheckinTime = lastCheckin + cooldown;
          const now = Date.now();
          const timeRemaining = nextCheckinTime - now;
          
          if (timeRemaining > 0) {
            const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
            const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
            errorMessage = `Check-in cooldown: ${hours}h ${minutes}m remaining`;
          } else {
            errorMessage = 'Check-in cooldown not expired. Please wait 24 hours.';
          }
        } catch (e) {
          errorMessage = 'Check-in cooldown not expired. Please wait 24 hours.';
        }
      }
      if (error?.code === 4001 || error?.message?.includes('user rejected') || error?.message?.includes('denied')) {
        errorMessage = 'Transaction rejected by user';
      } else if (error?.message?.includes('network') || error?.message?.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
      setTimeout(() => {
        setShowCheckin(false);
        setTxHash('');
        setMessage('');
      }, 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to retry with exponential backoff
  // Using any to avoid JSX parsing issues with generic <T>
  const retryWithBackoff = async (
    fn: () => Promise<any>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<any> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        const isRelayerError = error?.message?.includes('relayer') || 
                              error?.message?.includes('Relayer') ||
                              error?.message?.includes('backend connection') ||
                              error?.message?.includes('400') ||
                              error?.message?.includes('Bad Request') ||
                              error?.message?.includes('Transaction rejected') ||
                              error?.message?.includes('backend connection task has stopped');
        
        if (isRelayerError && i < maxRetries - 1) {
          const waitTime = delay * Math.pow(2, i);
          console.log(`Retry ${i + 1}/${maxRetries} after ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries reached');
  };

  const handlePublishScore = async (customScore?: number, customLines?: number, customLevel?: number) => {
    const scoreToPublish = customScore !== undefined ? customScore : score;
    const linesToPublish = customLines !== undefined ? customLines : lines;
    const levelToPublish = customLevel !== undefined ? customLevel : level;
    if (scoreToPublish === 0) return;
    if (!isConnected || !window.ethereum || !contractAddress || fhevmStatus !== 'ready') {
      setMessage('Please connect wallet and initialize FHEVM');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setIsProcessing(true);
      setShowPublish(true);
      setMessage('Encrypting score...');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, TETRIS_CONTRACT_ABI, signer);

      // Encrypt all three values with retry logic
      // Encrypt sequentially to avoid overwhelming relayer
      setMessage('Encrypting score...');
      const encryptedScore = await retryWithBackoff(() => encrypt(contractAddress, address!, scoreToPublish));
      
      setMessage('Encrypting lines...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between encrypts
      const encryptedLines = await retryWithBackoff(() => encrypt(contractAddress, address!, linesToPublish));
      
      setMessage('Encrypting level...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between encrypts
      const encryptedLevel = await retryWithBackoff(() => encrypt(contractAddress, address!, levelToPublish));

      setMessage('Submitting encrypted score to blockchain...');
      const tx = await contract.submitScore(
        encryptedScore.encryptedData,
        encryptedLines.encryptedData,
        encryptedLevel.encryptedData,
        encryptedScore.proof,  // Score proof
        encryptedLines.proof,  // Lines proof
        encryptedLevel.proof   // Level proof
      );

      setTxHash(tx.hash);
      setMessage('Waiting for confirmation...');

      const receipt = await tx.wait();
      setTxHash(receipt.transactionHash);

      setMessage('Score published successfully!');
      console.log('✅ Score submission transaction completed:', receipt);

      // Reload leaderboard
      await loadLeaderboard();

      setTimeout(() => {
        setShowPublish(false);
        setTxHash('');
        setMessage('');
      }, 2000);
    } catch (error: any) {
      console.error('Publish score failed:', error);
      
      // Parse error message for better UX
      let errorMessage = 'Failed to publish score';
      
      if (error?.code === 4001 || error?.message?.includes('user rejected') || error?.message?.includes('denied')) {
        errorMessage = 'Transaction rejected by user';
      } else if (error?.message?.includes('backend connection task has stopped') || 
                 (error?.message?.includes('400') && error?.message?.includes('backend connection'))) {
        errorMessage = 'Relayer service error: Backend connection issue. Please refresh the page and try again in a few moments.';
      } else if (error?.message?.includes('relayer') || error?.message?.includes('Relayer') || error?.message?.includes('backend connection')) {
        errorMessage = 'Relayer service is temporarily unavailable. Please try again in a few moments.';
      } else if (error?.message?.includes('400') || error?.message?.includes('Bad Request')) {
        errorMessage = 'Encryption service error (400). Please refresh the page and try again.';
      } else if (error?.message?.includes('network') || error?.message?.includes('NetworkError') || error?.message?.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error?.message) {
        // Extract user-friendly message from error
        const msg = error.message;
        if (msg.includes('Transaction rejected')) {
          errorMessage = 'Transaction rejected: ' + msg.split('Transaction rejected')[1]?.substring(0, 100) || 'Unknown error';
        } else {
          errorMessage = msg.length > 150 ? msg.substring(0, 150) + '...' : msg;
        }
      }
      
      setMessage(errorMessage);
      setTimeout(() => {
        setShowPublish(false);
        setTxHash('');
        setMessage('');
      }, 5000); // Show error longer for user to read
    } finally {
      setIsProcessing(false);
    }
  };

  const [checkinAvailable, setCheckinAvailable] = useState(false);
  const [checkinCooldown, setCheckinCooldown] = useState<string>('');

  useEffect(() => {
    const checkCheckinStatus = async () => {
      if (isConnected && contractAddress && address) {
        try {
          setIsLoading(true);
          const provider = new ethers.BrowserProvider(window.ethereum);
          const contract = new ethers.Contract(contractAddress, TETRIS_CONTRACT_ABI, provider);
          const [canCheck, lastCheckinTime] = await contract.canCheckIn(address);
          setCheckinAvailable(canCheck);
          
          // Calculate cooldown time remaining
          if (!canCheck && lastCheckinTime > 0) {
            const lastCheckin = Number(lastCheckinTime) * 1000;
            const cooldown = 24 * 60 * 60 * 1000;
            const nextCheckinTime = lastCheckin + cooldown;
            const now = Date.now();
            const timeRemaining = nextCheckinTime - now;
            
            if (timeRemaining > 0) {
              const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
              const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
              setCheckinCooldown(`${hours}h ${minutes}m`);
            } else {
              setCheckinCooldown('');
            }
          } else {
            setCheckinCooldown('');
          }
        } catch (error) {
          console.error('Failed to check check-in status:', error);
          setCheckinAvailable(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    checkCheckinStatus();
    const interval = setInterval(checkCheckinStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isConnected, contractAddress, address]);

  const displayBoard = getDisplayBoard();

  return (
    <div className="min-h-screen bg-black p-4 font-mono">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold mb-2" style={{
            color: '#FFD700',
            textShadow: '4px 4px 0px #FF1493, 8px 8px 0px #00CED1'
          }}>
            RETRO TETRIS FHE GAME
          </h1>
          <div className="text-gray-400 text-xs mb-2">
            by <a href="https://x.com/QuanCrytoGM" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">@QuanCrytoGM</a>
          </div>
          {message && (
            <div className="mb-2 p-2 bg-yellow-900 border-2 border-yellow-400 text-yellow-400 text-sm">
              {message}
            </div>
          )}
          <div className="flex justify-center gap-3 text-white text-sm flex-wrap">
            <div className="bg-gray-900 px-4 py-2 border-2 border-cyan-400">
              <Coins className="inline w-4 h-4 mr-1" />
              SCORE: {score}
            </div>
            <div className="bg-gray-900 px-4 py-2 border-2 border-yellow-400">
              <Zap className="inline w-4 h-4 mr-1" />
              LEVEL: {level}
            </div>
            <div className="bg-gray-900 px-4 py-2 border-2 border-pink-400">
              PLAYS: {plays}
            </div>
            <div className="bg-gray-900 px-4 py-2 border-2 border-purple-400">
              LINES: {lines}
            </div>
            <div className="bg-gray-900 px-4 py-2 border-2 border-green-400">
              COMBO: x{combo}
            </div>
          </div>
        </div>

        <div className="flex gap-6 justify-center flex-wrap">
          {/* Game Board */}
          <div>
            <div className="inline-block bg-gray-900 p-4 border-4 border-cyan-400" style={{
              boxShadow: '8px 8px 0px rgba(0, 206, 209, 0.5)'
            }}>
              {displayBoard.map((row, y) => (
                <div key={y} className="flex">
                  {row.map((cell, x) => (
                    <div
                      key={`${y}-${x}`}
                      className="w-6 h-6 border border-gray-800"
                      style={{
                        backgroundColor: cell || '#1a1a1a',
                        boxShadow: cell ? 'inset 2px 2px 4px rgba(255,255,255,0.3), inset -2px -2px 4px rgba(0,0,0,0.5)' : 'none'
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="mt-4 bg-gray-900 p-4 border-2 border-yellow-400">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div></div>
                <button
                  onClick={rotate}
                  disabled={!gameActive}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white p-3 border-2 border-purple-400 font-bold"
                  style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.5)' }}
                >
                  <RotateCw className="w-5 h-5 mx-auto" />
                </button>
                <div></div>
                <button
                  onClick={moveLeft}
                  disabled={!gameActive}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white p-3 border-2 border-blue-400 font-bold"
                  style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.5)' }}
                >
                  <ArrowLeft className="w-5 h-5 mx-auto" />
                </button>
                <button
                  onClick={hardDrop}
                  disabled={!gameActive}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white p-3 border-2 border-red-400 font-bold"
                  style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.5)' }}
                >
                  <ArrowDown className="w-5 h-5 mx-auto" />
                </button>
                <button
                  onClick={moveRight}
                  disabled={!gameActive}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white p-3 border-2 border-blue-400 font-bold"
                  style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.5)' }}
                >
                  <ArrowRight className="w-5 h-5 mx-auto" />
                </button>
              </div>

              <button
                onClick={startGame}
                disabled={gameActive || isLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white px-4 py-3 border-2 border-green-400 font-bold text-lg"
                style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}
              >
                {gameActive ? 'PLAYING...' : gameOver ? 'PLAY AGAIN' : !isConnected ? 'CONNECT WALLET TO START' : 'START GAME'}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-72 space-y-4">
            {/* Wallet Connection */}
            {!isConnected && (
              <div className="bg-gray-900 p-4 border-2 border-yellow-400">
                <h3 className="text-yellow-400 font-bold mb-3 text-lg">WALLET</h3>
                <button
                  onClick={connect}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 border-2 border-blue-400 font-bold transition-all"
                  style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}
                >
                  Connect Wallet
                </button>
                <p className="text-gray-400 text-xs mt-2 text-center">Connect to start playing</p>
              </div>
            )}

            {/* Blockchain Actions */}
            {isConnected && (
              <div className="bg-gray-900 p-4 border-2 border-yellow-400">
                <h3 className="text-yellow-400 font-bold mb-3 text-lg">BLOCKCHAIN</h3>
                <div className="text-white text-xs mb-2 p-2 bg-gray-800 border border-gray-700 text-center">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                </div>
                <button
                  onClick={handleCheckin}
                  disabled={!checkinAvailable || isProcessing || fhevmStatus !== 'ready' || isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-3 mb-2 border-2 border-green-400 font-bold transition-all"
                  style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}
                >
                  <CheckCircle className="inline w-5 h-5 mr-2" />
                  CHECK-IN
                  <div className="text-xs mt-1">
                    {checkinAvailable ? '+10 PLAYS (24H)' : checkinCooldown ? `Cooldown: ${checkinCooldown}` : '+10 PLAYS (24H)'}
                  </div>
                </button>

                <button
                  onClick={() => handlePublishScore()}
                  disabled={score === 0 || isProcessing || isEncrypting || fhevmStatus !== 'ready' || isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-3 border-2 border-purple-400 font-bold transition-all"
                  style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}
                >
                  {(isProcessing || isEncrypting) ? (
                    <span className="animate-spin">⚡</span>
                  ) : (
                    <Trophy className="inline w-5 h-5 mr-2" />
                  )}
                  PUBLISH SCORE
                  <div className="text-xs mt-1">TO CHAIN</div>
                </button>
              </div>
            )}

            {/* Leaderboard */}
            <div className="bg-gray-900 p-4 border-2 border-pink-400">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-pink-400 font-bold text-lg flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  LEADERBOARD
                </h3>
                <button
                  onClick={loadLeaderboard}
                  disabled={isDecrypting || isLoading}
                  className="text-xs bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 text-white px-2 py-1 border border-pink-400"
                  title="Refresh leaderboard"
                >
                  {isDecrypting ? '⏳' : '🔄'}
                </button>
              </div>
              <div className="space-y-2 text-white text-xs">
                {leaderboard.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">Chưa có dữ liệu</div>
                ) : (
                  leaderboard.map((entry, idx) => (
                    <div key={idx} className="bg-gray-800 p-2 border border-gray-700">
                      <div className="flex justify-between mb-1">
                        <span className="text-yellow-400">#{idx + 1} {entry.name}</span>
                        <span className="text-green-400">{entry.score}</span>
                      </div>
                      <div className="text-gray-400 text-xs">
                        Lines: {entry.lines} | Lv.{entry.level}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* How to Play */}
            <div className="bg-gray-900 p-4 border-2 border-cyan-400 text-white text-xs">
              <h3 className="text-cyan-400 font-bold mb-2">CONTROLS:</h3>
              <ul className="space-y-1 text-gray-300">
                <li>• ← → Di chuyển</li>
                <li>• ↑ Xoay khối</li>
                <li>• ↓ Rơi nhanh</li>
                <li>• SPACE Hard drop</li>
                <li>• Xóa hàng để ghi điểm</li>
                <li>• Combo tăng điểm x1.3</li>
                <li>• Level tăng mỗi 500đ</li>
              </ul>
            </div>
          </div>
        </div>

        {/* EIP-712 Signature Modal - Required for Decryption */}
        {showEip712Sign && (
          <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
            <div className="bg-gray-900 border-4 border-cyan-400 p-8 max-w-md" style={{
              boxShadow: '12px 12px 0px rgba(0, 206, 209, 0.3)'
            }}>
              <h2 className="text-3xl font-bold text-cyan-400 mb-4 text-center" style={{
                textShadow: '2px 2px 0px rgba(0, 206, 209, 0.5)'
              }}>
                EIP-712 SIGNATURE REQUIRED 🔐
              </h2>
              
              <div className="text-white text-center mb-6">
                <div className="text-xl mb-3">
                  Sign EIP-712 message to enable decryption
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  This signature is <span className="text-yellow-400 font-bold">REQUIRED</span> every session to decrypt leaderboard data.
                </div>
                <div className="text-xs text-gray-500 p-3 bg-gray-800 border border-gray-700 rounded">
                  Without this signature, you cannot decrypt and view encrypted scores on the leaderboard.
                </div>
                {(() => {
                  const firstConnectKey = `tetris-first-connect-${address}`;
                  const hasConnectedBefore = address ? localStorage.getItem(firstConnectKey) : null;
                  if (!hasConnectedBefore) {
                    return (
                      <div className="text-xs text-green-400 mt-2 p-2 bg-green-900/30 border border-green-700 rounded">
                        🎁 First time connecting? You'll receive 5 FREE PLAYS after signing!
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleEip712Sign}
                  disabled={isProcessing}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-6 py-3 border-2 border-cyan-400 font-bold text-lg transition-all"
                  style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}
                >
                  {isProcessing ? 'Signing...' : 'SIGN EIP-712 MESSAGE'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Modal */}
        {gameOver && !showPublish && (
          <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
            <div className="bg-gray-900 border-4 border-red-400 p-8 max-w-md" style={{
              boxShadow: '12px 12px 0px rgba(255, 0, 0, 0.3)'
            }}>
              <h2 className="text-4xl font-bold text-red-400 mb-4 text-center" style={{
                textShadow: '2px 2px 0px rgba(255, 0, 0, 0.5)'
              }}>
                GAME OVER
              </h2>
              
              <div className="text-white text-center mb-6">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {finalScore.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">
                  Final Score
                </div>
                <div className="mt-4 text-sm text-gray-300 space-y-1">
                  <div>Lines: {finalLines}</div>
                  <div>Level: {finalLevel}</div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePublishScoreFromGameOver}
                  disabled={isProcessing || isEncrypting || finalScore === 0 || !isConnected || fhevmStatus !== 'ready' || isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 border-2 border-purple-400 font-bold text-lg transition-all"
                  style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}
                >
                  <Trophy className="inline w-5 h-5 mr-2" />
                  PUBLISH SCORE TO LEADERBOARD
                </button>
                <button
                  onClick={() => {
                    setGameOver(false);
                    startGame();
                  }}
                  disabled={plays <= 0}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 border-2 border-green-400 font-bold text-lg transition-all"
                  style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}
                >
                  PLAY AGAIN
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Modal */}
        {(showCheckin || showPublish) && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="bg-gray-900 border-4 border-green-400 p-8 max-w-md" style={{
              boxShadow: '12px 12px 0px rgba(0, 255, 0, 0.3)'
            }}>
              <h2 className="text-2xl font-bold text-green-400 mb-4 text-center">
                {showCheckin ? 'CHECKING IN...' : 'PUBLISHING...'}
              </h2>
              <div className="text-white text-center mb-4">
                <div className="animate-pulse mb-4">⛓️ Blockchain Transaction</div>
                {txHash && (
                  <div className="bg-gray-800 p-3 text-xs break-all border border-green-400">
                    TX: {txHash}
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <div className="animate-spin text-green-400 text-4xl">⚡</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetroTetris;

