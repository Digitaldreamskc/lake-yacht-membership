import { expect } from "chai";
import { ethers } from "hardhat";
import { YachtClubMembership } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("YachtClubMembership", function () {
  let membershipContract: YachtClubMembership;
  let owner: SignerWithAddress;
  let authorizedMinter: SignerWithAddress;
  let royaltyRecipient: SignerWithAddress;
  let member1: SignerWithAddress;
  let member2: SignerWithAddress;
  let marketplace: SignerWithAddress;

  const MEMBERSHIP_TIERS = {
    STANDARD: 0,
    PREMIUM: 1,
    ELITE: 2,
    LIFETIME: 3,
  };

  beforeEach(async function () {
    [owner, authorizedMinter, royaltyRecipient, member1, member2, marketplace] = await ethers.getSigners();

    const YachtClubMembership = await ethers.getContractFactory("YachtClubMembership");
    membershipContract = await YachtClubMembership.deploy(
      authorizedMinter.address,
      royaltyRecipient.address,
      1000 // 10% royalty
    );
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial values", async function () {
      expect(await membershipContract.authorizedMinter()).to.equal(authorizedMinter.address);
      expect(await membershipContract.owner()).to.equal(owner.address);
      expect(await membershipContract.transfersRestricted()).to.be.true;
    });

    it("Should have correct name and symbol", async function () {
      expect(await membershipContract.name()).to.equal("Lake Stockton Yacht Club Membership");
      expect(await membershipContract.symbol()).to.equal("LSYCM");
    });
  });

  describe("Membership Minting", function () {
    it("Should allow authorized minter to mint membership", async function () {
      const tokenURI = "https://example.com/metadata/1.json";
      
      await expect(
        membershipContract.connect(authorizedMinter).mintMembership(
          member1.address,
          MEMBERSHIP_TIERS.PREMIUM,
          "member1@example.com",
          tokenURI
        )
      ).to.emit(membershipContract, "MembershipMinted");

      expect(await membershipContract.ownerOf(1)).to.equal(member1.address);
      expect(await membershipContract.isMember(member1.address)).to.be.true;
    });

    it("Should not allow non-authorized minter to mint", async function () {
      const tokenURI = "https://example.com/metadata/1.json";
      
      await expect(
        membershipContract.connect(member1).mintMembership(
          member1.address,
          MEMBERSHIP_TIERS.STANDARD,
          "member1@example.com",
          tokenURI
        )
      ).to.be.revertedWith("Not authorized to mint");
    });

    it("Should not allow minting to address that already has membership", async function () {
      const tokenURI = "https://example.com/metadata/1.json";
      
      // Mint first membership
      await membershipContract.connect(authorizedMinter).mintMembership(
        member1.address,
        MEMBERSHIP_TIERS.STANDARD,
        "member1@example.com",
        tokenURI
      );

      // Try to mint second membership to same address
      await expect(
        membershipContract.connect(authorizedMinter).mintMembership(
          member1.address,
          MEMBERSHIP_TIERS.PREMIUM,
          "member1@example.com",
          "https://example.com/metadata/2.json"
        )
      ).to.be.revertedWith("Member already has a token");
    });
  });

  describe("NFC Card Functionality", function () {
    let tokenId: number;

    beforeEach(async function () {
      // Mint a membership first
      const tokenURI = "https://example.com/metadata/1.json";
      await membershipContract.connect(authorizedMinter).mintMembership(
        member1.address,
        MEMBERSHIP_TIERS.PREMIUM,
        "member1@example.com",
        tokenURI
      );
      tokenId = 1;
    });

    it("Should allow owner to link NFC card", async function () {
      const cardId = "NFC_001_ABC123";
      const serialNumber = "SN123456";
      const cardType = "Premium";

      await expect(
        membershipContract.connect(owner).linkNFCCard(
          tokenId,
          cardId,
          serialNumber,
          cardType
        )
      ).to.emit(membershipContract, "NFCCardLinked");

      const memberInfo = await membershipContract.getMemberInfo(tokenId);
      expect(memberInfo.hasNFCCard).to.be.true;
      expect(memberInfo.nfcCard.cardId).to.equal(cardId);
      expect(memberInfo.nfcCard.serialNumber).to.equal(serialNumber);
      expect(memberInfo.nfcCard.cardType).to.equal(cardType);
    });

    it("Should not allow non-owner to link NFC card", async function () {
      const cardId = "NFC_001_ABC123";
      const serialNumber = "SN123456";
      const cardType = "Premium";

      await expect(
        membershipContract.connect(member1).linkNFCCard(
          tokenId,
          cardId,
          serialNumber,
          cardType
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow linking duplicate card ID", async function () {
      const cardId = "NFC_001_ABC123";
      const serialNumber = "SN123456";
      const cardType = "Premium";

      // Link first card
      await membershipContract.connect(owner).linkNFCCard(
        tokenId,
        cardId,
        serialNumber,
        cardType
      );

      // Try to link same card ID to different token
      await membershipContract.connect(authorizedMinter).mintMembership(
        member2.address,
        MEMBERSHIP_TIERS.STANDARD,
        "member2@example.com",
        "https://example.com/metadata/2.json"
      );

      await expect(
        membershipContract.connect(owner).linkNFCCard(
          2,
          cardId,
          "SN789012",
          "Standard"
        )
      ).to.be.revertedWith("NFC card already exists");
    });

    it("Should allow owner to unlink NFC card", async function () {
      const cardId = "NFC_001_ABC123";
      const serialNumber = "SN123456";
      const cardType = "Premium";

      // Link card first
      await membershipContract.connect(owner).linkNFCCard(
        tokenId,
        cardId,
        serialNumber,
        cardType
      );

      // Unlink card
      await expect(
        membershipContract.connect(owner).unlinkNFCCard(tokenId)
      ).to.emit(membershipContract, "NFCCardUnlinked");

      const memberInfo = await membershipContract.getMemberInfo(tokenId);
      expect(memberInfo.hasNFCCard).to.be.false;
    });

    it("Should allow owner to deactivate and reactivate NFC card", async function () {
      const cardId = "NFC_001_ABC123";
      const serialNumber = "SN123456";
      const cardType = "Premium";

      // Link card first
      await membershipContract.connect(owner).linkNFCCard(
        tokenId,
        cardId,
        serialNumber,
        cardType
      );

      // Deactivate card
      await expect(
        membershipContract.connect(owner).deactivateNFCCard(tokenId)
      ).to.emit(membershipContract, "NFCCardDeactivated");

      let memberInfo = await membershipContract.getMemberInfo(tokenId);
      expect(memberInfo.nfcCard.isActive).to.be.false;

      // Reactivate card
      await membershipContract.connect(owner).reactivateNFCCard(tokenId);
      
      memberInfo = await membershipContract.getMemberInfo(tokenId);
      expect(memberInfo.nfcCard.isActive).to.be.true;
    });

    it("Should correctly verify NFC card", async function () {
      const cardId = "NFC_001_ABC123";
      const serialNumber = "SN123456";
      const cardType = "Premium";

      // Link card first
      await membershipContract.connect(owner).linkNFCCard(
        tokenId,
        cardId,
        serialNumber,
        cardType
      );

      // Verify card
      const [isValid, memberAddress, tier] = await membershipContract.verifyNFCCard(cardId);
      expect(isValid).to.be.true;
      expect(memberAddress).to.equal(member1.address);
      expect(tier).to.equal(MEMBERSHIP_TIERS.PREMIUM);
    });

    it("Should return false for non-existent NFC card", async function () {
      const [isValid, memberAddress, tier] = await membershipContract.verifyNFCCard("NON_EXISTENT");
      expect(isValid).to.be.false;
      expect(memberAddress).to.equal(ethers.ZeroAddress);
      expect(tier).to.equal(MEMBERSHIP_TIERS.STANDARD);
    });
  });

  describe("Transfer Restrictions", function () {
    beforeEach(async function () {
      // Mint memberships
      const tokenURI = "https://example.com/metadata/1.json";
      await membershipContract.connect(authorizedMinter).mintMembership(
        member1.address,
        MEMBERSHIP_TIERS.STANDARD,
        "member1@example.com",
        tokenURI
      );
    });

    it("Should allow transfers when restrictions are disabled", async function () {
      await membershipContract.connect(owner).setTransferRestricted(false);
      
      await expect(
        membershipContract.connect(member1).transferFrom(member1.address, member2.address, 1)
      ).to.not.be.reverted;
    });

    it("Should allow transfers to approved marketplaces", async function () {
      await membershipContract.connect(owner).setMarketplaceApproval(marketplace.address, true);
      
      await expect(
        membershipContract.connect(marketplace).transferFrom(member1.address, member2.address, 1)
      ).to.not.be.reverted;
    });
  });

  describe("Royalty Functionality", function () {
    it("Should return correct royalty info", async function () {
      const salePrice = ethers.parseEther("1.0"); // 1 ETH
      const [receiver, royaltyAmount] = await membershipContract.royaltyInfo(1, salePrice);
      
      expect(receiver).to.equal(royaltyRecipient.address);
      expect(royaltyAmount).to.equal(ethers.parseEther("0.1")); // 10% of 1 ETH
    });

    it("Should allow owner to update royalty info", async function () {
      const newRecipient = member1.address;
      const newFraction = 500; // 5%

      await membershipContract.connect(owner).setRoyaltyInfo(newRecipient, newFraction);

      const salePrice = ethers.parseEther("1.0");
      const [receiver, royaltyAmount] = await membershipContract.royaltyInfo(1, salePrice);
      
      expect(receiver).to.equal(newRecipient);
      expect(royaltyAmount).to.equal(ethers.parseEther("0.05")); // 5% of 1 ETH
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update member tier", async function () {
      // Mint membership first
      const tokenURI = "https://example.com/metadata/1.json";
      await membershipContract.connect(authorizedMinter).mintMembership(
        member1.address,
        MEMBERSHIP_TIERS.STANDARD,
        "member1@example.com",
        tokenURI
      );

      await expect(
        membershipContract.connect(owner).updateMemberTier(1, MEMBERSHIP_TIERS.ELITE)
      ).to.emit(membershipContract, "MemberTierUpdated");

      const memberInfo = await membershipContract.getMemberInfo(1);
      expect(memberInfo.tier).to.equal(MEMBERSHIP_TIERS.ELITE);
    });

    it("Should allow owner to deactivate and reactivate membership", async function () {
      // Mint membership first
      const tokenURI = "https://example.com/metadata/1.json";
      await membershipContract.connect(authorizedMinter).mintMembership(
        member1.address,
        MEMBERSHIP_TIERS.STANDARD,
        "member1@example.com",
        tokenURI
      );

      // Deactivate
      await membershipContract.connect(owner).deactivateMembership(1);
      expect(await membershipContract.isMember(member1.address)).to.be.false;

      // Reactivate
      await membershipContract.connect(owner).reactivateMembership(1);
      expect(await membershipContract.isMember(member1.address)).to.be.true;
    });
  });
});
