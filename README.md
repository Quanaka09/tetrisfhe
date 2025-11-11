# Tetris FHE Game

A fully homomorphic encryption (FHE) powered Tetris experience built on the FHEVM stack. Players compete by submitting encrypted scores that are verified and ranked entirely on-chain while preserving privacy.

> **Live demo:** [https://terisfhe2025.vercel.app/](https://terisfhe2025.vercel.app/)

## Overview

Tetris FHE Game demonstrates how classic gameplay can run in a decentralized, privacy-preserving setting:

- React front-end rendered from `packages/react-showcase`
- Hardhat smart contracts under `packages/hardhat`
- FHEVM SDK for encryption, decryption, and access control
- Sepolia deployment scripts and configuration

## Key Features

- **Encrypted Score Submission** – Scores, cleared lines, and levels are encrypted client-side with FHEVM proofs before any transaction is sent.
- **Publicly Decryptable Leaderboard** – The contract allows public decryption, letting anyone view rankings without exposing raw on-chain data.
- **On-chain Play Credits** – Daily check-ins, first-connect bonuses (via EIP-712 signatures), and per-game consumption are tracked on-chain.
- **Wallet Gated Gameplay** – The interface is publicly viewable, but playing requires wallet connection, successful check-in, and available plays.
- **Game Over Publishing Flow** – Final scores can be published directly from the game over modal via a single transaction.
- **Resilient Relayer Handling** – Encryption requests automatically retry with exponential backoff to handle relayer throttling.
- **COOP/COEP Ready Deployment** – Production hosting requires `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers so the FHEVM relayer can spawn threads. These are set at the Vercel project level.

## FHE Compliance Highlights

| Layer | Compliance | Details |
|-------|------------|---------|
| Smart Contract | ✅ | Uses `externalEuint32` inputs, validates with `FHE.fromExternal`, sets ACL via `FHE.allowThis` and `FHE.makePubliclyDecryptable`, and returns `bytes32` handles. |
| Frontend | ✅ | Encrypts with `encrypt(contractAddress, userAddress, value)` (add32), enforces sequential requests, and decrypts leaderboard entries via `publicDecrypt`. |
| Security | ✅ | No plaintext scores stored on-chain, per-value proofs, and EIP-712 signatures for bonus plays verification. |

## Project Structure

```
packages/
  hardhat/          # Solidity contracts, deployment scripts, and Hardhat config
  react-showcase/   # Tetris FHE React application
  fhevm-sdk/        # Local SDK (adapters and hooks)
public/             # Shared assets (logos, wasm binaries)
scripts/            # Utility scripts (e.g., ABI generation)
```

## Getting Started

1. **Install dependencies** (workspace root):
   ```bash
   pnpm install
   ```
2. **Configure environment**:
   - Copy `.env.example` to `.env` (values for RPC URL, private key, relayer endpoint, etc.).
   - Ensure `.env` resides at the repository root.
3. **Compile contracts**:
   ```bash
   pnpm --filter hardhat compile
   ```
4. **Run the React showcase**:
   ```bash
   pnpm --filter react-showcase start
   ```
   The app serves the RETRO TETRIS FHE GAME interface with wallet gating and leaderboard.

## Deploying to Sepolia

1. Set the required variables in `.env`:
   - `SEPOLIA_RPC_URL`
   - `PRIVATE_KEY`
   - `ETHERSCAN_API_KEY` (optional for verification)
2. Deploy:
   ```bash
   pnpm --filter hardhat run --network sepolia deploy/deploy-tetris.ts
   ```
3. Update front-end configuration with the emitted contract address.

## Gameplay Flow

1. Connect wallet in the React UI.
2. Sign an EIP-712 message to claim the 5-play first connect bonus (if eligible).
3. Check in daily to earn 10 additional plays.
4. Start a game; each run consumes one play via `usePlay()` on-chain.
5. On game over, choose to publish the score, encrypting and submitting the results to the contract.
6. Leaderboard pulls encrypted entries directly from the contract and decrypts them publicly for display.

## Testing

- **Contract Tests** (`packages/hardhat/test`): run via `pnpm --filter hardhat test`.
- **Integration Tests** (`test/tetris`): validate end-to-end encryption, submission, and leaderboard flows against a local or testnet deployment.

## Vercel Deployment

- Continuous deployments expect the repo root and rely on `vercel.json`:
  - Install: `pnpm install`
  - Build: `pnpm --filter react-showcase build`
  - Output: `packages/react-showcase/build`
- After each deploy, visit the project settings on Vercel and make sure the COOP/COEP headers are present (required by the relayer SDK).
- Production deployment example: [https://terisfhe2025.vercel.app/](https://terisfhe2025.vercel.app/).

## Known Issues

- If the relayer responds with `backend connection task has stopped`, retry later—the hosted relayer might be temporarily unavailable.
- Legacy contracts without `canCheckIn` support will cause CALL_EXCEPTION errors. Ensure the Sepolia deployment uses the latest `TetrisFHE.sol`.
- Browsers that block cross-origin isolation (missing COOP/COEP headers) will log `This browser does not support threads`. Confirm headers are configured on the host.

## Author & Credits

- Game adaptation and FHE integration by [@QuanCrytoGM](https://x.com/QuanCrytoGM)
- Powered by Zama FHEVM libraries and tooling

Enjoy Tetris FHE Game and explore what privacy-preserving gaming feels like! 🚀
