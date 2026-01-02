// scripts/deploy.js
require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();

  console.log("Deploying PolyPrizeUnicorn...");
  console.log("Network:", network.name, "(Chain ID:", network.chainId.toString(), ")");
  console.log("Deployer:", deployer.address);

  // Get constructor arguments from environment
  const baseImageURI = process.env.BASE_IMAGE_URI;
  const baseAnimationURI = process.env.BASE_ANIMATION_URI;
  const drawingDate = process.env.DRAWING_DATE;

  if (!baseImageURI || !baseAnimationURI || !drawingDate) {
    console.error("\nMissing required environment variables:");
    if (!baseImageURI) console.error("  - BASE_IMAGE_URI");
    if (!baseAnimationURI) console.error("  - BASE_ANIMATION_URI");
    if (!drawingDate) console.error("  - DRAWING_DATE");
    console.error("\nCopy .env.example to .env and fill in the values.");
    process.exit(1);
  }

  console.log("\nConstructor arguments:");
  console.log("  baseImageURI:", baseImageURI);
  console.log("  baseAnimationURI:", baseAnimationURI);
  console.log("  drawingDate:", drawingDate, "(", new Date(parseInt(drawingDate) * 1000).toISOString(), ")");

  // Deploy contract
  const PolyPrizeUnicorn = await hre.ethers.getContractFactory("PolyPrizeUnicorn");
  const contract = await PolyPrizeUnicorn.deploy(
    baseImageURI,
    baseAnimationURI,
    drawingDate
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\n✅ PolyPrizeUnicorn deployed to:", contractAddress);

  // Auto-verify on block explorer
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\n⏳ Waiting for block confirmations before verification...");

    // Wait for a few block confirmations
    const deployTx = contract.deploymentTransaction();
    if (deployTx) {
      await deployTx.wait(5); // Wait for 5 confirmations
    }

    console.log("🔍 Verifying contract on block explorer...");

    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [baseImageURI, baseAnimationURI, drawingDate],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract is already verified!");
      } else {
        console.error("❌ Verification failed:", error.message);
        console.log("\nTo verify manually:");
        console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress} "${baseImageURI}" "${baseAnimationURI}" ${drawingDate}`);
      }
    }
  } else {
    console.log("\n⚠️  ETHERSCAN_API_KEY not set - skipping verification");
    console.log("To verify manually:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress} "${baseImageURI}" "${baseAnimationURI}" ${drawingDate}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
