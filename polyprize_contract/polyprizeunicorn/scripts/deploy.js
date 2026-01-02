// scripts/deploy.js
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

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

  const PolyPrizeUnicorn = await ethers.getContractFactory("PolyPrizeUnicorn");
  const contract = await PolyPrizeUnicorn.deploy(
    baseImageURI,
    baseAnimationURI,
    drawingDate
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\n✅ PolyPrizeUnicorn deployed to:", contractAddress);
  console.log("\nTo verify on block explorer:");
  console.log(`npx hardhat verify --network ${network.name} ${contractAddress} "${baseImageURI}" "${baseAnimationURI}" ${drawingDate}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
