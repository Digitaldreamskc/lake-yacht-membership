import { ethers, upgrades } from "hardhat";
import { verify } from "./verify";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy MockAccountImplementation first (for testing/proxy)
  console.log("\nDeploying MockAccountImplementation...");
  const MockAccountImplementation = await ethers.getContractFactory("MockAccountImplementation");
  const mockAccountImplementation = await MockAccountImplementation.deploy();
  await mockAccountImplementation.waitForDeployment();
  console.log("MockAccountImplementation deployed to:", await mockAccountImplementation.getAddress());

  // Deploy MockERC721 for testing
  console.log("\nDeploying MockERC721...");
  const MockERC721 = await ethers.getContractFactory("MockERC721");
  const mockERC721 = await MockERC721.deploy("Mock NFT", "MNFT");
  await mockERC721.waitForDeployment();
  console.log("MockERC721 deployed to:", await mockERC721.getAddress());

  // Deploy ERC6551AccountFactory with UUPS upgradeability
  console.log("\nDeploying ERC6551AccountFactory...");
  const ERC6551AccountFactory = await ethers.getContractFactory("ERC6551AccountFactory");
  const erc6551AccountFactory = await upgrades.deployProxy(
    ERC6551AccountFactory,
    [
      await mockAccountImplementation.getAddress(),
      await mockERC721.getAddress()
    ],
    {
      kind: "uups",
      initializer: "initialize",
      constructorArgs: []
    }
  );
  await erc6551AccountFactory.waitForDeployment();
  console.log("ERC6551AccountFactory deployed to:", await erc6551AccountFactory.getAddress());

  // Deploy PermissionManager with UUPS upgradeability
  console.log("\nDeploying PermissionManager...");
  const PermissionManager = await ethers.getContractFactory("PermissionManager");
  const permissionManager = await upgrades.deployProxy(
    PermissionManager,
    [],
    {
      kind: "uups",
      initializer: "initialize",
      constructorArgs: []
    }
  );
  await permissionManager.waitForDeployment();
  console.log("PermissionManager deployed to:", await permissionManager.getAddress());

  // Deploy MockStoryProtocol for testing
  console.log("\nDeploying MockStoryProtocol...");
  const MockStoryProtocol = await ethers.getContractFactory("MockStoryProtocol");
  const mockStoryProtocol = await MockStoryProtocol.deploy();
  await mockStoryProtocol.waitForDeployment();
  console.log("MockStoryProtocol deployed to:", await mockStoryProtocol.getAddress());

  // Deploy IPIntegrationLayer with UUPS upgradeability
  console.log("\nDeploying IPIntegrationLayer...");
  const IPIntegrationLayer = await ethers.getContractFactory("IPIntegrationLayer");
  const ipIntegrationLayer = await upgrades.deployProxy(
    IPIntegrationLayer,
    [
      await erc6551AccountFactory.getAddress(),
      await permissionManager.getAddress(),
      await mockStoryProtocol.getAddress()
    ],
    {
      kind: "uups",
      initializer: "initialize",
      constructorArgs: []
    }
  );
  await ipIntegrationLayer.waitForDeployment();
  console.log("IPIntegrationLayer deployed to:", await ipIntegrationLayer.getAddress());

  // Grant necessary permissions to IPIntegrationLayer
  console.log("\nSetting up permissions...");
  await permissionManager.grantPermission(
    await ipIntegrationLayer.getAddress(),
    "IP_MINT",
    ethers.MaxUint256
  );
  await permissionManager.grantPermission(
    await ipIntegrationLayer.getAddress(),
    "LICENSE_CREATE",
    ethers.MaxUint256
  );
  await permissionManager.grantPermission(
    await ipIntegrationLayer.getAddress(),
    "ROYALTY_SET",
    ethers.MaxUint256
  );
  console.log("Permissions granted to IPIntegrationLayer");

  // Verify contracts on Etherscan (if not on local network)
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 31337n) { // Not local network
    console.log("\nVerifying contracts on Etherscan...");
    
    try {
      await verify(await mockAccountImplementation.getAddress(), []);
      console.log("MockAccountImplementation verified");
    } catch (error) {
      console.log("MockAccountImplementation verification failed:", error);
    }

    try {
      await verify(await mockERC721.getAddress(), ["Mock NFT", "MNFT"]);
      console.log("MockERC721 verified");
    } catch (error) {
      console.log("MockERC721 verification failed:", error);
    }

    try {
      await verify(await mockStoryProtocol.getAddress(), []);
      console.log("MockStoryProtocol verified");
    } catch (error) {
      console.log("MockStoryProtocol verification failed:", error);
    }

    // Note: Proxy contracts are verified differently, usually through the proxy verification
    console.log("Proxy contracts (ERC6551AccountFactory, PermissionManager, IPIntegrationLayer) need manual verification");
  }

  console.log("\n=== Deployment Summary ===");
  console.log("MockAccountImplementation:", await mockAccountImplementation.getAddress());
  console.log("MockERC721:", await mockERC721.getAddress());
  console.log("ERC6551AccountFactory:", await erc6551AccountFactory.getAddress());
  console.log("PermissionManager:", await permissionManager.getAddress());
  console.log("MockStoryProtocol:", await mockStoryProtocol.getAddress());
  console.log("IPIntegrationLayer:", await ipIntegrationLayer.getAddress());
  console.log("===========================");

  // Save deployment addresses for later use
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    contracts: {
      mockAccountImplementation: await mockAccountImplementation.getAddress(),
      mockERC721: await mockERC721.getAddress(),
      erc6551AccountFactory: await erc6551AccountFactory.getAddress(),
      permissionManager: await permissionManager.getAddress(),
      mockStoryProtocol: await mockStoryProtocol.getAddress(),
      ipIntegrationLayer: await ipIntegrationLayer.getAddress()
    },
    timestamp: new Date().toISOString()
  };

  console.log("\nDeployment info saved. You can use these addresses in your frontend and other contracts.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

