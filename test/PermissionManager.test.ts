import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { TestUtils, TestAccounts } from "./utils/test-utils.js";

describe("PermissionManager", function () {
  let permissionManager: Contract;
  let accounts: TestAccounts;

  beforeEach(async function () {
    accounts = await TestUtils.getTestAccounts();
    
    // Deploy PermissionManager
    const PermissionManager = await ethers.getContractFactory("PermissionManager");
    permissionManager = await PermissionManager.deploy();
  });

  describe("Initialization", function () {
    it("Should initialize with correct owner", async function () {
      expect(await permissionManager.owner()).to.equal(accounts.owner.address);
    });

    it("Should not be paused initially", async function () {
      expect(await permissionManager.paused()).to.be.false;
    });
  });

  describe("Permission Management", function () {
    const PERMISSION_NAME = "TEST_PERMISSION";
    const DURATION = 3600; // 1 hour

    it("Should grant permission successfully", async function () {
      await expect(
        permissionManager.grantPermission(
          accounts.user1.address,
          PERMISSION_NAME,
          DURATION
        )
      ).to.emit(permissionManager, "PermissionGranted")
        .withArgs(accounts.user1.address, PERMISSION_NAME, DURATION);
      
      expect(await permissionManager.hasPermission(
        accounts.user1.address,
        PERMISSION_NAME
      )).to.be.true;
    });

    it("Should grant permanent permission with MaxUint256", async function () {
      await permissionManager.grantPermission(
        accounts.user1.address,
        PERMISSION_NAME,
        ethers.MaxUint256
      );
      
      expect(await permissionManager.hasPermission(
        accounts.user1.address,
        PERMISSION_NAME
      )).to.be.true;
    });

    it("Should revoke permission successfully", async function () {
      // Grant permission first
      await permissionManager.grantPermission(
        accounts.user1.address,
        PERMISSION_NAME,
        DURATION
      );
      
      // Revoke permission
      await expect(
        permissionManager.revokePermission(
          accounts.user1.address,
          PERMISSION_NAME
        )
      ).to.emit(permissionManager, "PermissionRevoked")
        .withArgs(accounts.user1.address, PERMISSION_NAME);
      
      expect(await permissionManager.hasPermission(
        accounts.user1.address,
        PERMISSION_NAME
      )).to.be.false;
    });

    it("Should revert if non-owner tries to grant permission", async function () {
      await expect(
        permissionManager.connect(accounts.user1).grantPermission(
          accounts.user2.address,
          PERMISSION_NAME,
          DURATION
        )
      ).to.be.revertedWithCustomError(permissionManager, "OwnableUnauthorizedAccount");
    });

    it("Should revert if non-owner tries to revoke permission", async function () {
      await expect(
        permissionManager.connect(accounts.user1).revokePermission(
          accounts.user2.address,
          PERMISSION_NAME
        )
      ).to.be.revertedWithCustomError(permissionManager, "OwnableUnauthorizedAccount");
    });
  });

  describe("Permission Checking", function () {
    const PERMISSION_NAME = "CHECK_PERMISSION";
    const SHORT_DURATION = 1; // 1 second
    const DURATION = 3600; // 1 hour

    it("Should return true for active permission", async function () {
      await permissionManager.grantPermission(
        accounts.user1.address,
        PERMISSION_NAME,
        SHORT_DURATION
      );
      
      expect(await permissionManager.hasPermission(
        accounts.user1.address,
        PERMISSION_NAME
      )).to.be.true;
    });

    it("Should return false for expired permission", async function () {
      await permissionManager.grantPermission(
        accounts.user1.address,
        PERMISSION_NAME,
        SHORT_DURATION
      );
      
      // Wait for permission to expire
      await TestUtils.timeTravel(2);
      
      expect(await permissionManager.hasPermission(
        accounts.user1.address,
        PERMISSION_NAME
      )).to.be.false;
    });

    it("Should return false for non-existent permission", async function () {
      expect(await permissionManager.hasPermission(
        accounts.user1.address,
        "NON_EXISTENT_PERMISSION"
      )).to.be.false;
    });

    it("Should return false for revoked permission", async function () {
      await permissionManager.grantPermission(
        accounts.user1.address,
        PERMISSION_NAME,
        DURATION
      );
      
      await permissionManager.revokePermission(
        accounts.user1.address,
        PERMISSION_NAME
      );
      
      expect(await permissionManager.hasPermission(
        accounts.user1.address,
        PERMISSION_NAME
      )).to.be.false;
    });
  });

  describe("Permission Templates", function () {
    const TEMPLATE_NAME = "ADMIN_TEMPLATE";
    const PERMISSIONS = ["READ", "WRITE", "DELETE"];

    it("Should create permission template successfully", async function () {
      await expect(
        permissionManager.createPermissionTemplate(
          TEMPLATE_NAME,
          PERMISSIONS,
          3600
        )
      ).to.emit(permissionManager, "PermissionTemplateCreated")
        .withArgs(TEMPLATE_NAME, PERMISSIONS, 3600);
      
      const template = await permissionManager.getPermissionTemplate(TEMPLATE_NAME);
      expect(template.permissions).to.deep.equal(PERMISSIONS);
      expect(template.duration).to.equal(3600);
    });

    it("Should apply permission template successfully", async function () {
      // Create template
      await permissionManager.createPermissionTemplate(
        TEMPLATE_NAME,
        PERMISSIONS,
        3600
      );
      
      // Apply template
      await expect(
        permissionManager.applyPermissionTemplate(
          TEMPLATE_NAME,
          accounts.user1.address
        )
      ).to.emit(permissionManager, "PermissionTemplateApplied")
        .withArgs(TEMPLATE_NAME, accounts.user1.address);
      
      // Check if permissions were granted
      for (const permission of PERMISSIONS) {
        expect(await permissionManager.hasPermission(
          accounts.user1.address,
          permission
        )).to.be.true;
      }
    });

    it("Should revert if template does not exist", async function () {
      await expect(
        permissionManager.applyPermissionTemplate(
          "NON_EXISTENT_TEMPLATE",
          accounts.user1.address
        )
      ).to.be.revertedWithCustomError(permissionManager, "TemplateNotFound");
    });
  });

  describe("Multi-signature Setup", function () {
    const RESOURCE_ID = "RESOURCE_123";
    const REQUIRED_SIGNATURES = 2;
    const SIGNERS = [
      accounts.user1.address,
      accounts.user2.address,
      accounts.user3.address
    ];

    it("Should setup multi-signature requirement successfully", async function () {
      await expect(
        permissionManager.setupMultiSig(
          RESOURCE_ID,
          REQUIRED_SIGNATURES,
          SIGNERS
        )
      ).to.emit(permissionManager, "MultiSigSetup")
        .withArgs(RESOURCE_ID, REQUIRED_SIGNATURES, SIGNERS);
      
      const multiSig = await permissionManager.getMultiSig(RESOURCE_ID);
      expect(multiSig.requiredSignatures).to.equal(REQUIRED_SIGNATURES);
      expect(multiSig.signers).to.deep.equal(SIGNERS);
    });

    it("Should revert if required signatures exceed signer count", async function () {
      await expect(
        permissionManager.setupMultiSig(
          RESOURCE_ID,
          4, // More than signer count
          SIGNERS
        )
      ).to.be.revertedWithCustomError(permissionManager, "InvalidSignatureCount");
    });

    it("Should revert if non-owner tries to setup multi-sig", async function () {
      await expect(
        permissionManager.connect(accounts.user1).setupMultiSig(
          RESOURCE_ID,
          REQUIRED_SIGNATURES,
          SIGNERS
        )
      ).to.be.revertedWithCustomError(permissionManager, "OwnableUnauthorizedAccount");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to pause contract", async function () {
      await expect(permissionManager.pause()).to.emit(permissionManager, "Paused");
      expect(await permissionManager.paused()).to.be.true;
    });

    it("Should allow owner to unpause contract", async function () {
      await permissionManager.pause();
      await expect(permissionManager.unpause()).to.emit(permissionManager, "Unpaused");
      expect(await permissionManager.paused()).to.be.false;
    });

    it("Should revert if non-owner tries to pause", async function () {
      await expect(
        permissionManager.connect(accounts.user1).pause()
      ).to.be.revertedWithCustomError(permissionManager, "OwnableUnauthorizedAccount");
    });

    it("Should revert if non-owner tries to unpause", async function () {
      await permissionManager.pause();
      await expect(
        permissionManager.connect(accounts.user1).unpause()
      ).to.be.revertedWithCustomError(permissionManager, "OwnableUnauthorizedAccount");
    });
  });

  describe("Gas Efficiency", function () {
    it("Should optimize gas usage for permission operations", async function () {
      const tx = await permissionManager.grantPermission(
        accounts.user1.address,
        "GAS_TEST_PERMISSION",
        3600
      );
      
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lt(200000); // Should use less than 200k gas
    });
  });
});
