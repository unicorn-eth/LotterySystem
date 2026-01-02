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
  const collectionName = process.env.COLLECTION_NAME;
  const symbol = process.env.TOKEN_SYMBOL;
  const collectionDescription = process.env.COLLECTION_DESCRIPTION || "";
  const baseImageURI = process.env.BASE_IMAGE_URI;
  const baseAnimationURI = process.env.BASE_ANIMATION_URI;
  const drawingDate = process.env.DRAWING_DATE;
  const isSoulbound = process.env.IS_SOULBOUND?.toLowerCase() === "true";

  // Validate required fields
  const missing = [];
  if (!collectionName) missing.push("COLLECTION_NAME");
  if (!symbol) missing.push("TOKEN_SYMBOL");
  if (!baseImageURI) missing.push("BASE_IMAGE_URI");
  if (!baseAnimationURI) missing.push("BASE_ANIMATION_URI");
  if (!drawingDate) missing.push("DRAWING_DATE");

  if (missing.length > 0) {
    console.error("\nMissing required environment variables:");
    missing.forEach(v => console.error("  -", v));
    console.error("\nCopy .env.example to .env and fill in the values.");
    process.exit(1);
  }

  console.log("\nConstructor arguments:");
  console.log("  collectionName:", collectionName);
  console.log("  symbol:", symbol);
  console.log("  collectionDescription:", collectionDescription || "(default)");
  console.log("  baseImageURI:", baseImageURI);
  console.log("  baseAnimationURI:", baseAnimationURI);
  console.log("  drawingDate:", drawingDate, "(", new Date(parseInt(drawingDate) * 1000).toISOString(), ")");
  console.log("  isSoulbound:", isSoulbound);

  const PolyPrizeUnicorn = await hre.ethers.getContractFactory("PolyPrizeUnicorn");
  const contract = await PolyPrizeUnicorn.deploy(
    collectionName,
    symbol,
    collectionDescription,
    baseImageURI,
    baseAnimationURI,
    drawingDate,
    isSoulbound
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
        constructorArguments: [
          collectionName,
          symbol,
          collectionDescription,
          baseImageURI,
          baseAnimationURI,
          drawingDate,
          isSoulbound
        ],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract is already verified!");
      } else {
        console.error("❌ Verification failed:", error.message);
        console.log("\nTo verify manually:");
        console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress} "${collectionName}" "${symbol}" "${collectionDescription}" "${baseImageURI}" "${baseAnimationURI}" ${drawingDate} ${isSoulbound}`);
      }
    }
  } else {
    console.log("\n⚠️  ETHERSCAN_API_KEY not set - skipping verification");
    console.log("To verify manually:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress} "${collectionName}" "${symbol}" "${collectionDescription}" "${baseImageURI}" "${baseAnimationURI}" ${drawingDate} ${isSoulbound}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
