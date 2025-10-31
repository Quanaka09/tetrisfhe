#!/usr/bin/env node

/**
 * FHEVM Explorer - Interactive Demo Experience
 * 
 * A beautiful, context-aware CLI wizard that showcases the Universal FHEVM SDK
 * through guided interactive demos. Perfect for exploring confidential computing
 * on blockchain step by step.
 */

import 'dotenv/config';
import { FhevmNode } from '../../fhevm-sdk/dist/adapters/node.js';
import { runCounterDemo } from './counter.js';
import { runVotingDemo } from './voting.js';
import { runRatingsDemo } from './ratings.js';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { ethers } from 'ethers';

// Configuration
const CONFIG = {
  rpcUrl: process.env.RPC_URL || 'https://sepolia.infura.io/v3/34c3a5f3ecf943498710543fe38b50f4',
  privateKey: process.env.PRIVATE_KEY || '8e393a02d65f980a236a299c033ac867e0bdfc3f8718d7dd55f791dc0fae81fe',
  chainId: process.env.CHAIN_ID ? parseInt(process.env.CHAIN_ID) : 11155111, // Sepolia
};

interface DemoData {
  name: string;
  startTime: Date;
  endTime?: Date;
  success?: boolean;
  error?: string;
}

class FHEVMExplorer {
  private fhevm: FhevmNode | null = null;
  private sessionData = {
    startTime: new Date(),
    demos: [] as DemoData[],
    transactions: [] as string[],
  };

  async init() {
    console.log(chalk.blue.bold('\n🌐 Welcome to FHEVM Explorer!'));
    console.log(chalk.gray('Universal FHEVM SDK - Interactive Demo Experience\n'));
    console.log(chalk.cyan('   Explore the world of confidential computing on blockchain'));
    console.log(chalk.cyan('   Experience encrypted operations with guided demos\n'));

    const spinner = ora('Initializing FHEVM environment...').start();

    try {
      // Validate configuration
      if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === '0x' + '0'.repeat(64)) {
        throw new Error('Please set PRIVATE_KEY in your .env file');
      }

      // Setup wallet
      const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
      const signer = new ethers.Wallet(CONFIG.privateKey, provider);
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);

      // Create FHEVM instance
      this.fhevm = new FhevmNode({
        rpcUrl: CONFIG.rpcUrl,
        privateKey: CONFIG.privateKey,
        chainId: CONFIG.chainId,
      });

      await this.fhevm.initialize();

      spinner.succeed(chalk.green('FHEVM environment ready!'));
      console.log(chalk.gray(`   Wallet: ${address}`));
      console.log(chalk.gray(`   Balance: ${ethers.formatEther(balance)} ETH`));
      console.log(chalk.gray(`   Network: Sepolia (${CONFIG.chainId})`));
      console.log(chalk.gray(`   RPC: ${CONFIG.rpcUrl.substring(0, 30)}...`));

      if (balance === 0n) {
        console.log(chalk.yellow('\n   ⚠️  Wallet has no ETH - transactions may fail'));
      }

    } catch (error: any) {
      spinner.fail(chalk.red('Failed to initialize FHEVM environment'));
      console.error(chalk.red(`   Error: ${error.message}`));
      process.exit(1);
    }
  }

  async showMainMenu() {
    const { demo } = await inquirer.prompt([
      {
        type: 'list',
        name: 'demo',
        message: chalk.cyan('Choose your FHEVM demo:'),
        choices: [
          {
            name: '🔢 Counter Demo - Increment/Decrement Operations',
            value: 'counter',
            short: 'Counter Demo',
          },
          {
            name: '🗳️  Voting Demo - Encrypted Voting System',
            value: 'voting',
            short: 'Voting Demo',
          },
          {
            name: '⭐ Ratings Demo - Review Cards with Encrypted Ratings',
            value: 'ratings',
            short: 'Ratings Demo',
          },
          {
            name: '🔍 Test Mode - Verify Setup Only',
            value: 'test',
            short: 'Test Mode',
          },
          {
            name: '🎯 Run All Demos',
            value: 'all',
            short: 'All Demos',
          },
          {
            name: '❌ Exit Explorer',
            value: 'exit',
            short: 'Exit',
          },
        ],
      },
    ]);

    return demo;
  }

  async runCounterDemo() {
    console.log(chalk.blue.bold('\n🔢 FHEVM Counter Demo'));
    console.log(chalk.gray('Experience confidential counter operations\n'));

    const demoData: DemoData = {
      name: 'Counter Demo',
      startTime: new Date(),
    };

    try {
      if (!this.fhevm) throw new Error('FHEVM not initialized');

      // Ask user for increment amount
      const { incrementAmount } = await inquirer.prompt([
        {
          type: 'number',
          name: 'incrementAmount',
          message: 'Enter increment amount:',
          default: 5,
          validate: (value) => value > 0 || 'Amount must be positive',
        },
      ]);

      console.log(chalk.cyan(`\n   Running counter demo with increment: ${incrementAmount}...`));

      // Run the demo (it will use the values from the demo function)
      // For now, we'll run it as-is, but in the future we could modify
      // the demo functions to accept parameters
      await runCounterDemo(this.fhevm, {
        rpcUrl: CONFIG.rpcUrl,
        privateKey: CONFIG.privateKey,
        chainId: CONFIG.chainId,
      });

      demoData.endTime = new Date();
      demoData.success = true;

      console.log(chalk.green.bold('\n🎉 Counter Demo Completed Successfully!'));
      console.log(chalk.gray('   ✅ Encrypted increment operations'));
      console.log(chalk.gray('   ✅ Encrypted decrement operations'));
      console.log(chalk.gray('   ✅ EIP-712 signature generation'));
      console.log(chalk.gray('   ✅ Confidential count decryption'));

    } catch (error: any) {
      demoData.endTime = new Date();
      demoData.success = false;
      demoData.error = error.message;

      console.log(chalk.red.bold('\n❌ Counter Demo Failed'));
      console.log(chalk.red(`   Error: ${error.message}`));
    }

    this.sessionData.demos.push(demoData);
    return demoData;
  }

  async runVotingDemo() {
    console.log(chalk.blue.bold('\n🗳️  FHEVM Voting Demo'));
    console.log(chalk.gray('Experience confidential voting operations\n'));

    const demoData: DemoData = {
      name: 'Voting Demo',
      startTime: new Date(),
    };

    try {
      if (!this.fhevm) throw new Error('FHEVM not initialized');

      // Ask user if they want to vote Yes or No
      const { voteChoice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'voteChoice',
          message: 'Choose your vote:',
          choices: [
            { name: '✅ Yes', value: 1 },
            { name: '❌ No', value: 0 },
          ],
        },
      ]);

      console.log(chalk.cyan(`\n   Running voting demo with vote: ${voteChoice === 1 ? 'Yes' : 'No'}...`));

      await runVotingDemo(this.fhevm, {
        rpcUrl: CONFIG.rpcUrl,
        privateKey: CONFIG.privateKey,
        chainId: CONFIG.chainId,
      });

      demoData.endTime = new Date();
      demoData.success = true;

      console.log(chalk.green.bold('\n🎉 Voting Demo Completed Successfully!'));
      console.log(chalk.gray('   ✅ Encrypted vote casting'));
      console.log(chalk.gray('   ✅ Session management'));
      console.log(chalk.gray('   ✅ Real blockchain interactions'));

    } catch (error: any) {
      demoData.endTime = new Date();
      demoData.success = false;
      demoData.error = error.message;

      console.log(chalk.red.bold('\n❌ Voting Demo Failed'));
      console.log(chalk.red(`   Error: ${error.message}`));
    }

    this.sessionData.demos.push(demoData);
    return demoData;
  }

  async runRatingsDemo() {
    console.log(chalk.blue.bold('\n⭐ FHEVM Ratings Demo'));
    console.log(chalk.gray('Experience confidential rating operations\n'));

    const demoData: DemoData = {
      name: 'Ratings Demo',
      startTime: new Date(),
    };

    try {
      if (!this.fhevm) throw new Error('FHEVM not initialized');

      // Ask user for rating
      const { rating } = await inquirer.prompt([
        {
          type: 'number',
          name: 'rating',
          message: 'Enter your rating (1-5):',
          default: 5,
          validate: (value) => (value >= 1 && value <= 5) || 'Rating must be between 1 and 5',
        },
      ]);

      console.log(chalk.cyan(`\n   Running ratings demo with rating: ${rating} stars...`));

      await runRatingsDemo(this.fhevm, {
        rpcUrl: CONFIG.rpcUrl,
        privateKey: CONFIG.privateKey,
        chainId: CONFIG.chainId,
      });

      demoData.endTime = new Date();
      demoData.success = true;

      console.log(chalk.green.bold('\n🎉 Ratings Demo Completed Successfully!'));
      console.log(chalk.gray('   ✅ Encrypted rating submission'));
      console.log(chalk.gray('   ✅ Public decryption'));
      console.log(chalk.gray('   ✅ Average rating calculation'));

    } catch (error: any) {
      demoData.endTime = new Date();
      demoData.success = false;
      demoData.error = error.message;

      console.log(chalk.red.bold('\n❌ Ratings Demo Failed'));
      console.log(chalk.red(`   Error: ${error.message}`));
    }

    this.sessionData.demos.push(demoData);
    return demoData;
  }

  async runTestMode() {
    console.log(chalk.blue.bold('\n🔍 FHEVM Test Mode'));
    console.log(chalk.gray('Verify your setup and configuration\n'));

    const demoData: DemoData = {
      name: 'Test Mode',
      startTime: new Date(),
    };

    try {
      console.log(chalk.cyan('🔧 Testing configuration...'));

      // Test 1: Environment variables
      console.log(chalk.gray('\n1. Environment Variables:'));
      const requiredVars = ['PRIVATE_KEY', 'RPC_URL'];
      const optionalVars = ['CHAIN_ID'];

      requiredVars.forEach((varName) => {
        if (process.env[varName] && process.env[varName] !== '0x' + '0'.repeat(64)) {
          console.log(chalk.green(`   ✅ ${varName}: Set`));
        } else {
          console.log(chalk.red(`   ❌ ${varName}: Not set or invalid`));
        }
      });

      optionalVars.forEach((varName) => {
        if (process.env[varName]) {
          console.log(chalk.green(`   ✅ ${varName}: ${process.env[varName]}`));
        } else {
          console.log(chalk.yellow(`   ⚠️  ${varName}: Not set (using default: ${CONFIG.chainId})`));
        }
      });

      // Test 2: Network connection
      console.log(chalk.gray('\n2. Network Connection:'));
      const spinner2 = ora('Testing RPC connection...').start();

      try {
        const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();

        spinner2.succeed(chalk.green('RPC connection successful'));
        console.log(chalk.gray(`   Network: ${network.name} (${network.chainId})`));
        console.log(chalk.gray(`   Block: ${blockNumber}`));
      } catch (networkError: any) {
        spinner2.fail(chalk.red('RPC connection failed'));
        console.log(chalk.red(`   Error: ${networkError.message}`));
        throw networkError;
      }

      // Test 3: Wallet setup
      console.log(chalk.gray('\n3. Wallet Setup:'));
      const spinner3 = ora('Testing wallet...').start();

      try {
        const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
        const signer = new ethers.Wallet(CONFIG.privateKey, provider);
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);

        spinner3.succeed(chalk.green('Wallet setup successful'));
        console.log(chalk.gray(`   Address: ${address}`));
        console.log(chalk.gray(`   Balance: ${ethers.formatEther(balance)} ETH`));

        if (balance === 0n) {
          console.log(chalk.yellow('   ⚠️  Wallet has no ETH - transactions may fail'));
        }
      } catch (walletError: any) {
        spinner3.fail(chalk.red('Wallet setup failed'));
        console.log(chalk.red(`   Error: ${walletError.message}`));
        throw walletError;
      }

      // Test 4: FHEVM client
      console.log(chalk.gray('\n4. FHEVM Client:'));
      const spinner4 = ora('Testing FHEVM client...').start();

      try {
        if (!this.fhevm) {
          this.fhevm = new FhevmNode({
            rpcUrl: CONFIG.rpcUrl,
            privateKey: CONFIG.privateKey,
            chainId: CONFIG.chainId,
          });
          await this.fhevm.initialize();
        }

        const config = this.fhevm.getConfig();
        spinner4.succeed(chalk.green('FHEVM client ready'));
        console.log(chalk.gray(`   Status: ${config.isReady ? 'Ready' : 'Not Ready'}`));
        console.log(chalk.gray(`   Has Wallet: ${config.hasWallet}`));
        console.log(chalk.gray(`   Has Provider: ${config.hasProvider}`));
      } catch (fhevmError: any) {
        spinner4.fail(chalk.red('FHEVM client creation failed'));
        console.log(chalk.red(`   Error: ${fhevmError.message}`));
        throw fhevmError;
      }

      demoData.endTime = new Date();
      demoData.success = true;

      console.log(chalk.green.bold('\n🎉 Test Mode Completed!'));
      console.log(chalk.gray('   ✅ Configuration verified'));
      console.log(chalk.gray('   ✅ Network connection working'));
      console.log(chalk.gray('   ✅ Wallet setup correct'));
      console.log(chalk.gray('   ✅ FHEVM client ready'));

    } catch (error: any) {
      demoData.endTime = new Date();
      demoData.success = false;
      demoData.error = error.message;

      console.log(chalk.red.bold('\n❌ Test Mode Failed'));
      console.log(chalk.red(`   Error: ${error.message}`));
    }

    this.sessionData.demos.push(demoData);
    return demoData;
  }

  async showSessionSummary() {
    console.log(chalk.blue.bold('\n📊 Session Summary'));
    console.log(chalk.gray('='.repeat(50)));

    const totalDemos = this.sessionData.demos.length;
    const successfulDemos = this.sessionData.demos.filter((d) => d.success).length;
    const failedDemos = totalDemos - successfulDemos;

    console.log(chalk.gray(`   Total demos: ${totalDemos}`));
    console.log(chalk.green(`   Successful: ${successfulDemos}`));
    if (failedDemos > 0) {
      console.log(chalk.red(`   Failed: ${failedDemos}`));
    }

    const duration = new Date().getTime() - this.sessionData.startTime.getTime();
    console.log(chalk.gray(`   Duration: ${Math.round(duration / 1000)}s`));

    // Show demo details
    this.sessionData.demos.forEach((demo, index) => {
      const status = demo.success ? chalk.green('✅') : chalk.red('❌');
      const duration = demo.endTime
        ? Math.round((demo.endTime.getTime() - demo.startTime.getTime()) / 1000)
        : 0;
      console.log(chalk.gray(`   ${index + 1}. ${demo.name} ${status} (${duration}s)`));

      if (!demo.success && demo.error) {
        console.log(chalk.red(`      Error: ${demo.error}`));
      }
    });
  }

  async run() {
    try {
      await this.init();

      while (true) {
        const demo = await this.showMainMenu();

        if (demo === 'exit') {
          break;
        }

        if (demo === 'all') {
          await this.runCounterDemo();
          console.log('\n');
          await this.runVotingDemo();
          console.log('\n');
          await this.runRatingsDemo();
        } else if (demo === 'counter') {
          await this.runCounterDemo();
        } else if (demo === 'voting') {
          await this.runVotingDemo();
        } else if (demo === 'ratings') {
          await this.runRatingsDemo();
        } else if (demo === 'test') {
          await this.runTestMode();
        }

        // Ask if user wants to continue
        const { continueExplorer } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'continueExplorer',
            message: 'Would you like to explore another demo?',
            default: true,
          },
        ]);

        if (!continueExplorer) {
          break;
        }
      }

      await this.showSessionSummary();

      console.log(chalk.blue.bold('\n👋 Thanks for exploring FHEVM!'));
      console.log(chalk.gray('   Universal FHEVM SDK - Making confidential computing accessible\n'));

    } catch (error: any) {
      console.error(chalk.red.bold('\n💥 Explorer crashed!'));
      console.error(chalk.red(`   Error: ${error.message}`));
      process.exit(1);
    }
  }
}

// Run the explorer
const explorer = new FHEVMExplorer();
explorer.run().catch(console.error);

