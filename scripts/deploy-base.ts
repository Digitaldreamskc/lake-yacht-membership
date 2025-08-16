import { ethers } from "@nomicfoundation/hardhat-ethers";
import { config } from "../lib/config";

async function main() {
  console.log("🚀 Deploying YachtClubMembership contract to Base Sepolia testnet...");
  
  // Check environment variables
  if (!process.env.CONTRACT_PRIVATE_KEY) {
    throw new Error("CONTRACT_PRIVATE_KEY environment variable is required");
  }
  
  if (!process.env.AUTHORIZED_MINTER_ADDRESS) {
    throw new Error("AUTHORIZED_MINTER_ADDRESS environment variable is required");
  }
  
  if (!process.env.ROYALTY_RECIPIENT_ADDRESS) {
    throw new Error("ROYALTY_RECIPIENT_ADDRESS environment variable is required");
  }

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contract with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider?.getBalance(deployer.address) || 0), "ETH");

  // Contract parameters
  const authorizedMinter = process.env.AUTHORIZED_MINTER_ADDRESS;
  const royaltyRecipient = process.env.ROYALTY_RECIPIENT_ADDRESS;
  const royaltyFraction = 1000; // 10% in basis points

  console.log("🔧 Contract parameters:");
  console.log("   - Authorized Minter:", authorizedMinter);
  console.log("   - Royalty Recipient:", royaltyRecipient);
  console.log("   - Royalty Fraction:", royaltyFraction / 100, "%");

  // Deploy the contract
  const YachtClubMembership = await ethers.getContractFactory("YachtClubMembership");
  const membershipContract = await YachtClubMembership.deploy(
    authorizedMinter,
    royaltyRecipient,
    royaltyFraction
  );

  console.log("⏳ Waiting for contract deployment...");
  await membershipContract.waitForDeployment();

  const contractAddress = await membershipContract.getAddress();
  console.log("✅ YachtClubMembership deployed to:", contractAddress);
  console.log("🔗 Contract on Base Sepolia:", `https://sepolia.basescan.org/address/${contractAddress}`);

  // Verify the contract deployment
  console.log("🔍 Verifying contract deployment...");
  try {
    const deployedCode = await deployer.provider?.getCode(contractAddress);
    if (deployedCode && deployedCode !== "0x") {
      console.log("✅ Contract deployment verified successfully!");
    } else {
      console.log("❌ Contract deployment verification failed!");
    }
  } catch (error) {
    console.log("⚠️ Could not verify contract deployment:", error);
  }

  // Save deployment info
  const deploymentInfo = {
    network: "Base Sepolia Testnet",
    chainId: 84532,
    contractAddress: contractAddress,
    deployer: deployer.address,
    authorizedMinter: authorizedMinter,
    royaltyRecipient: royaltyRecipient,
    royaltyFraction: royaltyFraction,
    deployedAt: new Date().toISOString(),
    constructorArgs: [authorizedMinter, royaltyRecipient, royaltyFraction],
  };

  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎯 Next steps:");
  console.log("1. Set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file");
  console.log("2. Verify contract on Base Sepolia (optional but recommended)");
  console.log("3. Test the contract functionality");
  console.log("4. Update your application configuration");

  return deploymentInfo;
}

// Handle errors and exit
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
