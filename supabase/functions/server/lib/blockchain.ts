import { createHash } from 'node:crypto';

export interface BlockchainConfig {
  rpcUrl: string;
  contractAddress?: string;
  privateKey?: string;
}

export interface BlockchainResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

// Mock blockchain integration for Polygon
// Replace with actual Web3/ethers.js implementation
export class BlockchainService {
  private config: BlockchainConfig;

  constructor(config: BlockchainConfig) {
    this.config = config;
  }

  // Record PIN hash on blockchain
  async recordPinHash(pinHash: string, userId: string): Promise<BlockchainResult> {
    try {
      // Mock transaction - replace with actual blockchain call
      const mockTxHash = this.generateMockTxHash(pinHash, userId);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        txHash: mockTxHash
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Record verification on blockchain
  async recordVerification(verificationHash: string, pin: string): Promise<BlockchainResult> {
    try {
      const mockTxHash = this.generateMockTxHash(verificationHash, pin);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        success: true,
        txHash: mockTxHash
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify hash exists on blockchain
  async verifyHashOnChain(hash: string): Promise<boolean> {
    try {
      // Mock verification - replace with actual blockchain query
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch {
      return false;
    }
  }

  private generateMockTxHash(data: string, salt: string): string {
    return '0x' + createHash('sha256')
      .update(`${data}:${salt}:${Date.now()}`)
      .digest('hex')
      .substring(0, 64);
  }
}

// Initialize blockchain service
export function getBlockchainService(): BlockchainService {
  const config: BlockchainConfig = {
    rpcUrl: Deno.env.get('POLYGON_RPC_URL') || 'https://polygon-rpc.com',
    contractAddress: Deno.env.get('PIN_CONTRACT_ADDRESS'),
    privateKey: Deno.env.get('BLOCKCHAIN_PRIVATE_KEY')
  };

  return new BlockchainService(config);
}

// Utility to create blockchain-ready hash
export function createBlockchainHash(data: Record<string, any>): string {
  const sortedData = Object.keys(data)
    .sort()
    .reduce((obj, key) => {
      obj[key] = data[key];
      return obj;
    }, {} as Record<string, any>);

  return createHash('sha256')
    .update(JSON.stringify(sortedData))
    .digest('hex');
}