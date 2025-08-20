import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { TestUtils, TestAccounts } from "./utils/test-utils.js";

describe("ERC6551AccountFactory", function () {
  let accountFactory: Contract;
  let mockERC721: Contract;
  let mockAccountImplementation: Contract;
  let accounts: TestAccounts;

  beforeEach(async function () {
    accounts = await TestUtils.getTestAccounts();
    
    // Deploy mock contracts
    mockERC721 = await TestUtils.deployMockERC721();
    mockAccountImplementation = await TestUtils.deployMockAccountImplementation();
    
    // Deploy ERC6551AccountFactory
    const ERC6551AccountFactory = await ethers.getContractFactory("ERC6551AccountFactory");
    accountFactory = await ERC6551AccountFactory.deploy(
      mockAccountImplementation.target,
      mockERC721.target
    );
  });

  describe("Initialization", function () {
    it("Should initialize with correct addresses", async function () {
      expect(await accountFactory.accountImplementation()).to.equal(mockAccountImplementation.target);
      expect(await accountFactory.tokenContract()).to.equal(mockERC721.target);
    });

    it("Should revert if initialized with zero addresses", async function () {
      const ERC6551AccountFactory = await ethers.getContractFactory("ERC6551AccountFactory");
      
      await expect(
        ERC6551AccountFactory.deploy(
          ethers.ZeroAddress,
          mockERC721.target
        )
      ).to.be.revertedWithCustomError(ERC6551AccountFactory, "InvalidAddress");
      
      await expect(
        ERC6551AccountFactory.deploy(
          mockAccountImplementation.target,
          ethers.ZeroAddress
        )
      ).to.be.revertedWithCustomError(ERC6551AccountFactory, "InvalidAddress");
    });
  });

  describe("Account Creation", function () {
    let tokenId: bigint;
    let salt: bigint;

    beforeEach(async function () {
      tokenId = await mockERC721.mint(accounts.user1.address);
      salt = TestUtils.generateRandomSalt();
    });

    it("Should create account successfully", async function () {
      await expect(
        accountFactory.createAccount(
          mockERC721.target,
          tokenId,
          salt,
          accounts.user1.address
        )
      ).to.emit(accountFactory, "AccountCreated")
        .withArgs(mockERC721.target, tokenId, salt, accounts.user1.address);
      
      const accountAddress = await accountFactory.getAccount(
        mockERC721.target,
        tokenId,
        salt
      );
      expect(accountAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("Should create deterministic addresses", async function () {
      const expectedAddress = await accountFactory.computeAccount(
        mockERC721.target,
        tokenId,
        salt
      );
      
      await accountFactory.createAccount(
        mockERC721.target,
        tokenId,
        salt,
        accounts.user1.address
      );
      
      const actualAddress = await accountFactory.getAccount(
        mockERC721.target,
        tokenId,
        salt
      );
      
      expect(actualAddress).to.equal(expectedAddress);
    });

    it("Should revert if account already exists", async function () {
      // Create account first time
      await accountFactory.createAccount(
        mockERC721.target,
        tokenId,
        salt,
        accounts.user1.address
      );
      
      // Try to create same account again
      await expect(
        accountFactory.createAccount(
          mockERC721.target,
          tokenId,
          salt,
          accounts.user2.address
        )
      ).to.be.revertedWithCustomError(accountFactory, "AccountAlreadyExists");
    });

    it("Should revert if token does not exist", async function () {
      const nonExistentTokenId = 999999;
      
      await expect(
        accountFactory.createAccount(
          mockERC721.target,
          nonExistentTokenId,
          salt,
          accounts.user1.address
        )
      ).to.be.revertedWithCustomError(accountFactory, "TokenDoesNotExist");
    });

    it("Should revert if caller is not token owner", async function () {
      await expect(
        accountFactory.connect(accounts.user2).createAccount(
          mockERC721.target,
          tokenId,
          salt,
          accounts.user1.address
        )
      ).to.be.revertedWithCustomError(accountFactory, "NotTokenOwner");
    });
  });

  describe("Account Retrieval", function () {
    let tokenId: bigint;
    let salt: bigint;
    let accountAddress: string;

    beforeEach(async function () {
      tokenId = await mockERC721.mint(accounts.user1.address);
      salt = TestUtils.generateRandomSalt();
      
      await accountFactory.createAccount(
        mockERC721.target,
        tokenId,
        salt,
        accounts.user1.address
      );
      
      accountAddress = await accountFactory.getAccount(
        mockERC721.target,
        tokenId,
        salt
      );
    });

    it("Should retrieve existing account", async function () {
      const retrievedAddress = await accountFactory.getAccount(
        mockERC721.target,
        tokenId,
        salt
      );
      expect(retrievedAddress).to.equal(accountAddress);
    });

    it("Should return zero address for non-existent account", async function () {
      const nonExistentSalt = TestUtils.generateRandomSalt();
      const retrievedAddress = await accountFactory.getAccount(
        mockERC721.target,
        tokenId,
        nonExistentSalt
      );
      expect(retrievedAddress).to.equal(ethers.ZeroAddress);
    });

    it("Should check if account exists", async function () {
      expect(await accountFactory.accountExists(accountAddress)).to.be.true;
      expect(await accountFactory.accountExists(ethers.ZeroAddress)).to.be.false;
    });
  });

  describe("Account Computation", function () {
    it("Should compute account address correctly", async function () {
      const tokenId = 123;
      const salt = 456;
      
      const computedAddress = await accountFactory.computeAccount(
        mockERC721.target,
        tokenId,
        salt
      );
      
      expect(computedAddress).to.not.equal(ethers.ZeroAddress);
      expect(ethers.isAddress(computedAddress)).to.be.true;
    });

    it("Should compute same address for same parameters", async function () {
      const tokenId = 789;
      const salt = 101112;
      
      const address1 = await accountFactory.computeAccount(
        mockERC721.target,
        tokenId,
        salt
      );
      
      const address2 = await accountFactory.computeAccount(
        mockERC721.target,
        tokenId,
        salt
      );
      
      expect(address1).to.equal(address2);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to upgrade implementation", async function () {
      const newImplementation = await TestUtils.deployMockAccountImplementation();
      
      await expect(
        accountFactory.upgradeImplementation(newImplementation.target)
      ).to.emit(accountFactory, "ImplementationUpgraded")
        .withArgs(newImplementation.target);
      
      expect(await accountFactory.accountImplementation()).to.equal(newImplementation.target);
    });

    it("Should revert if non-owner tries to upgrade", async function () {
      const newImplementation = await TestUtils.deployMockAccountImplementation();
      
      await expect(
        accountFactory.connect(accounts.user1).upgradeImplementation(newImplementation.target)
      ).to.be.revertedWithCustomError(accountFactory, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to pause contract", async function () {
      await expect(accountFactory.pause()).to.emit(accountFactory, "Paused");
      expect(await accountFactory.paused()).to.be.true;
    });

    it("Should allow owner to unpause contract", async function () {
      await accountFactory.pause();
      await expect(accountFactory.unpause()).to.emit(accountFactory, "Unpaused");
      expect(await accountFactory.paused()).to.be.false;
    });

    it("Should revert operations when paused", async function () {
      await accountFactory.pause();
      
      const tokenId = await mockERC721.mint(accounts.user1.address);
      const salt = TestUtils.generateRandomSalt();
      
      await expect(
        accountFactory.createAccount(
          mockERC721.target,
          tokenId,
          salt,
          accounts.user1.address
        )
      ).to.be.revertedWithCustomError(accountFactory, "EnforcedPause");
    });
  });

  describe("Gas Efficiency", function () {
    it("Should optimize gas usage for account creation", async function () {
      const tokenId = await mockERC721.mint(accounts.user1.address);
      const salt = TestUtils.generateRandomSalt();
      
      const tx = await accountFactory.createAccount(
        mockERC721.target,
        tokenId,
        salt,
        accounts.user1.address
      );
      
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lt(1000000); // Should use less than 1M gas
    });
  });
});
