import { ethers } from "hardhat";
import { Contract } from "ethers";

export interface TestAccounts {
  owner: any;
  user1: any;
  user2: any;
  user3: any;
  user4: any;
  user5: any;
}

export interface MockIPAsset {
  name: string;
  description: string;
  metadataUri: string;
  tags: string[];
  attributeKeys: string[];
  attributeValues: string[];
}

export interface MockLicense {
  licensee: string;
  duration: number;
  price: number;
  exclusive: boolean;
  terms: string;
  conditionKeys: string[];
  conditionValues: string[];
}

export interface MockRoyalty {
  percentage: number;
  recipient: string;
  splitRecipients: string[];
  splitPercentages: number[];
}

export class TestUtils {
  static async getTestAccounts(): Promise<TestAccounts> {
    const [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();
    return { owner, user1, user2, user3, user4, user5 };
  }

  static generateMockIPAsset(): MockIPAsset {
    return {
      name: "Test IP Asset",
      description: "A test intellectual property asset for testing purposes",
      metadataUri: "ipfs://QmTest123456789",
      tags: ["test", "sample", "demo"],
      attributeKeys: ["category", "version", "status"],
      attributeValues: ["artwork", "1.0", "active"],
    };
  }

  static generateMockLicense(licensee: string): MockLicense {
    return {
      licensee,
      duration: 365 * 24 * 60 * 60, // 1 year in seconds
      price: ethers.parseEther("0.1"),
      exclusive: false,
      terms: "Standard license terms for testing",
      conditionKeys: ["usage", "territory"],
      conditionValues: ["commercial", "worldwide"],
    };
  }

  static generateMockRoyalty(): MockRoyalty {
    return {
      percentage: 500, // 5%
      recipient: ethers.ZeroAddress,
      splitRecipients: [],
      splitPercentages: [],
    };
  }

  static async deployMockERC721(): Promise<Contract> {
    const MockERC721 = await ethers.getContractFactory("MockERC721");
    return await MockERC721.deploy("Mock NFT", "MNFT");
  }

  static async deployMockStoryProtocol(): Promise<Contract> {
    const MockStoryProtocol = await ethers.getContractFactory("MockStoryProtocol");
    return await MockStoryProtocol.deploy();
  }

  static async deployMockAccountImplementation(): Promise<Contract> {
    const MockAccountImplementation = await ethers.getContractFactory("MockAccountImplementation");
    return await MockAccountImplementation.deploy();
  }

  static async deployMockAccountRegistry(): Promise<Contract> {
    const MockAccountRegistry = await ethers.getContractFactory("MockAccountRegistry");
    return await MockAccountRegistry.deploy();
  }

  static async timeTravel(seconds: number): Promise<void> {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine", []);
  }

  static async setNextBlockTimestamp(timestamp: number): Promise<void> {
    await ethers.provider.send("evm_setNextBlockTimestamp", [timestamp]);
  }

  static async mineBlocks(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await ethers.provider.send("evm_mine", []);
    }
  }

  static async getLatestBlockTimestamp(): Promise<number> {
    const block = await ethers.provider.getBlock("latest");
    return block?.timestamp || 0;
  }

  static async impersonateAccount(address: string): Promise<any> {
    await ethers.provider.send("hardhat_impersonateAccount", [address]);
    return await ethers.getSigner(address);
  }

  static async stopImpersonatingAccount(address: string): Promise<void> {
    await ethers.provider.send("hardhat_stopImpersonatingAccount", [address]);
  }

  static async setBalance(address: string, balance: bigint): Promise<void> {
    await ethers.provider.send("hardhat_setBalance", [address, balance.toString()]);
  }

  static generateRandomSalt(): bigint {
    return ethers.randomBytes(32);
  }

  static generateRandomTokenId(): bigint {
    return ethers.randomBytes(32);
  }

  static generateRandomAddress(): string {
    return ethers.randomBytes(20);
  }

  static generateRandomString(length: number = 10): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static async expectRevertedWithCustomError(
    promise: Promise<any>,
    contract: Contract,
    errorName: string,
    args?: any[]
  ): Promise<void> {
    await expect(promise).to.be.revertedWithCustomError(contract, errorName);
  }

  static async expectRevertedWithReason(promise: Promise<any>, reason: string): Promise<void> {
    await expect(promise).to.be.revertedWith(reason);
  }

  static async expectEvent(
    tx: any,
    contract: Contract,
    eventName: string,
    args?: any[]
  ): Promise<void> {
    await expect(tx).to.emit(contract, eventName);
  }

  static async expectGasUsage(tx: any, maxGas: number): Promise<void> {
    const receipt = await tx.wait();
    expect(receipt.gasUsed).to.be.lte(maxGas);
  }
}
