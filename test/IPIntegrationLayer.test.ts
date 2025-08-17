import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { TestUtils, TestAccounts } from "./utils/test-utils.js";

describe("IPIntegrationLayer", function () {
  let ipIntegrationLayer: Contract;
  let accountFactory: Contract;
  let permissionManager: Contract;
  let mockStoryProtocol: Contract;
  let mockERC721: Contract;
  let mockAccountImplementation: Contract;
  let accounts: TestAccounts;

  beforeEach(async function () {
    accounts = await TestUtils.getTestAccounts();
    
    // Deploy mock contracts
    mockERC721 = await TestUtils.deployMockERC721();
    mockAccountImplementation = await TestUtils.deployMockAccountImplementation();
    mockStoryProtocol = await TestUtils.deployMockStoryProtocol();
    
    // Deploy core contracts
    const ERC6551AccountFactory = await ethers.getContractFactory("ERC6551AccountFactory");
    accountFactory = await ERC6551AccountFactory.deploy(
      mockAccountImplementation.target,
      mockERC721.target
    );
    
    const PermissionManager = await ethers.getContractFactory("PermissionManager");
    permissionManager = await PermissionManager.deploy();
    
    // Deploy IPIntegrationLayer
    const IPIntegrationLayer = await ethers.getContractFactory("IPIntegrationLayer");
    ipIntegrationLayer = await IPIntegrationLayer.deploy(
      accountFactory.target,
      permissionManager.target,
      mockStoryProtocol.target
    );
  });

  describe("Initialization", function () {
    it("Should initialize with correct addresses", async function () {
      expect(await ipIntegrationLayer.accountFactory()).to.equal(accountFactory.target);
      expect(await ipIntegrationLayer.permissionManager()).to.equal(permissionManager.target);
      expect(await ipIntegrationLayer.storyProtocol()).to.equal(mockStoryProtocol.target);
    });

    it("Should revert if initialized with zero addresses", async function () {
      const IPIntegrationLayer = await ethers.getContractFactory("IPIntegrationLayer");
      
      await expect(
        IPIntegrationLayer.deploy(
          ethers.ZeroAddress,
          permissionManager.target,
          mockStoryProtocol.target
        )
      ).to.be.revertedWithCustomError(IPIntegrationLayer, "InvalidAddress");
    });
  });

  describe("IP Minting", function () {
    let tokenId: bigint;
    let salt: bigint;
    let accountAddress: string;

    beforeEach(async function () {
      tokenId = await mockERC721.mint(accounts.user1.address);
      salt = TestUtils.generateRandomSalt();
      
      // Create account first
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

    it("Should mint IP successfully", async function () {
      const ipData = TestUtils.generateMockIPAsset();
      
      await expect(
        ipIntegrationLayer.mintIP(
          mockERC721.target,
          tokenId,
          salt,
          ipData.name,
          ipData.description,
          ipData.metadataUri
        )
      ).to.emit(ipIntegrationLayer, "IPMinted")
        .withArgs(accountAddress, ipData.name, ipData.metadataUri);
    });

    it("Should revert if account does not exist", async function () {
      const nonExistentSalt = TestUtils.generateRandomSalt();
      const ipData = TestUtils.generateMockIPAsset();
      
      await expect(
        ipIntegrationLayer.mintIP(
          mockERC721.target,
          tokenId,
          nonExistentSalt,
          ipData.name,
          ipData.description,
          ipData.metadataUri
        )
      ).to.be.revertedWithCustomError(ipIntegrationLayer, "AccountNotFound");
    });

    it("Should revert if caller is not account owner", async function () {
      const ipData = TestUtils.generateMockIPAsset();
      
      await expect(
        ipIntegrationLayer.connect(accounts.user2).mintIP(
          mockERC721.target,
          tokenId,
          salt,
          ipData.name,
          ipData.description,
          ipData.metadataUri
        )
      ).to.be.revertedWithCustomError(ipIntegrationLayer, "NotAccountOwner");
    });
  });

  describe("License Creation", function () {
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

    it("Should create license successfully", async function () {
      const licenseData = TestUtils.generateMockLicense(accounts.user2.address);
      
      await expect(
        ipIntegrationLayer.createLicense(
          mockERC721.target,
          tokenId,
          salt,
          licenseData.terms,
          licenseData.duration,
          licenseData.exclusive
        )
      ).to.emit(ipIntegrationLayer, "LicenseCreated")
        .withArgs(accountAddress, licenseData.terms, licenseData.duration);
    });

    it("Should revert if account does not exist", async function () {
      const nonExistentSalt = TestUtils.generateRandomSalt();
      const licenseData = TestUtils.generateMockLicense(accounts.user2.address);
      
      await expect(
        ipIntegrationLayer.createLicense(
          mockERC721.target,
          tokenId,
          nonExistentSalt,
          licenseData.terms,
          licenseData.duration,
          licenseData.exclusive
        )
      ).to.be.revertedWithCustomError(ipIntegrationLayer, "AccountNotFound");
    });
  });

  describe("Royalty Setup", function () {
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

    it("Should setup royalty successfully", async function () {
      const royaltyData = TestUtils.generateMockRoyalty();
      
      await expect(
        ipIntegrationLayer.setupRoyalty(
          mockERC721.target,
          tokenId,
          salt,
          royaltyData.percentage,
          royaltyData.recipient
        )
      ).to.emit(ipIntegrationLayer, "RoyaltySet")
        .withArgs(accountAddress, royaltyData.percentage, royaltyData.recipient);
    });

    it("Should revert if royalty percentage is invalid", async function () {
      const invalidPercentage = 10000; // 100% - should be invalid
      
      await expect(
        ipIntegrationLayer.setupRoyalty(
          mockERC721.target,
          tokenId,
          salt,
          invalidPercentage,
          accounts.user2.address
        )
      ).to.be.revertedWithCustomError(ipIntegrationLayer, "InvalidRoyaltyPercentage");
    });
  });

  describe("IP Updates", function () {
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

    it("Should update IP metadata successfully", async function () {
      const newMetadataUri = "ipfs://QmNewMetadata123";
      
      await expect(
        ipIntegrationLayer.updateIPMetadata(
          mockERC721.target,
          tokenId,
          salt,
          "Updated Name",
          "Updated Description",
          newMetadataUri
        )
      ).to.emit(ipIntegrationLayer, "IPMetadataUpdated")
        .withArgs(accountAddress, newMetadataUri);
    });

    it("Should revert if caller is not account owner", async function () {
      await expect(
        ipIntegrationLayer.connect(accounts.user2).updateIPMetadata(
          mockERC721.target,
          tokenId,
          salt,
          "Updated Name",
          "Updated Description",
          "ipfs://QmNewMetadata123"
        )
      ).to.be.revertedWithCustomError(ipIntegrationLayer, "NotAccountOwner");
    });
  });

  describe("Governance Voting", function () {
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

    it("Should create governance proposal successfully", async function () {
      const proposalId = "PROPOSAL_001";
      const description = "Test proposal";
      
      await expect(
        ipIntegrationLayer.createProposal(
          mockERC721.target,
          tokenId,
          salt,
          proposalId,
          description
        )
      ).to.emit(ipIntegrationLayer, "ProposalCreated")
        .withArgs(accountAddress, proposalId, description);
    });

    it("Should allow voting on proposals", async function () {
      const proposalId = "PROPOSAL_002";
      const description = "Test proposal for voting";
      
      await ipIntegrationLayer.createProposal(
        mockERC721.target,
        tokenId,
        salt,
        proposalId,
        description
      );
      
      await expect(
        ipIntegrationLayer.vote(
          mockERC721.target,
          tokenId,
          salt,
          proposalId,
          true // Support
        )
      ).to.emit(ipIntegrationLayer, "VoteCast")
        .withArgs(accountAddress, proposalId, true);
    });
  });

  describe("Delegated Permissions", function () {
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

    it("Should allow delegated operations", async function () {
      // Grant permission to user2
      await permissionManager.grantPermission(
        accounts.user2.address,
        "IP_UPDATE",
        3600
      );
      
      const newMetadataUri = "ipfs://QmDelegatedUpdate123";
      
      await expect(
        ipIntegrationLayer.connect(accounts.user2).updateIPMetadata(
          mockERC721.target,
          tokenId,
          salt,
          "Delegated Update",
          "Updated by delegate",
          newMetadataUri
        )
      ).to.emit(ipIntegrationLayer, "IPMetadataUpdated")
        .withArgs(accountAddress, newMetadataUri);
    });

    it("Should revert if delegate lacks permission", async function () {
      await expect(
        ipIntegrationLayer.connect(accounts.user2).updateIPMetadata(
          mockERC721.target,
          tokenId,
          salt,
          "Unauthorized Update",
          "Should fail",
          "ipfs://QmShouldFail123"
        )
      ).to.be.revertedWithCustomError(ipIntegrationLayer, "InsufficientPermissions");
    });
  });

  describe("Gas Efficiency", function () {
    it("Should optimize gas usage for IP operations", async function () {
      const tokenId = await mockERC721.mint(accounts.user1.address);
      const salt = TestUtils.generateRandomSalt();
      
      await accountFactory.createAccount(
        mockERC721.target,
        tokenId,
        salt,
        accounts.user1.address
      );
      
      const ipData = TestUtils.generateMockIPAsset();
      
      const tx = await ipIntegrationLayer.mintIP(
        mockERC721.target,
        tokenId,
        salt,
        ipData.name,
        ipData.description,
        ipData.metadataUri
      );
      
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lt(500000); // Should use less than 500k gas
    });
  });
});
