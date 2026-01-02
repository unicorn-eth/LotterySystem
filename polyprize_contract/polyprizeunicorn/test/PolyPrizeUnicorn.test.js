const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PolyPrizeUnicorn", function () {
  let contract;
  let owner;
  let user1;
  let user2;
  let mockFactory;

  const COLLECTION_NAME = "Test Collection";
  const SYMBOL = "TEST";
  const DESCRIPTION = "Test Description";
  const IMAGE_URI = "ipfs://test-image";
  const ANIMATION_URI = "ipfs://test-animation";
  const MINT_PRICE = ethers.parseEther("0.01"); // 0.01 ETH

  // Get a future timestamp (1 year from now)
  const getFutureTimestamp = () => Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy a mock factory contract
    const MockFactory = await ethers.getContractFactory("MockAccountFactory");
    mockFactory = await MockFactory.deploy();
    await mockFactory.waitForDeployment();

    // Deploy the NFT contract
    const PolyPrizeUnicorn = await ethers.getContractFactory("PolyPrizeUnicorn");
    contract = await PolyPrizeUnicorn.deploy(
      COLLECTION_NAME,
      SYMBOL,
      DESCRIPTION,
      IMAGE_URI,
      ANIMATION_URI,
      getFutureTimestamp(),
      true, // isSoulbound
      await mockFactory.getAddress(),
      MINT_PRICE
    );
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await contract.name()).to.equal(COLLECTION_NAME);
      expect(await contract.symbol()).to.equal(SYMBOL);
    });

    it("Should set the correct owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should set isSoulbound correctly", async function () {
      expect(await contract.isSoulbound()).to.equal(true);
    });

    it("Should set the mint price correctly", async function () {
      expect(await contract.mintPrice()).to.equal(MINT_PRICE);
    });

    it("Should set the factory address correctly", async function () {
      expect(await contract.accountFactory()).to.equal(await mockFactory.getAddress());
    });
  });

  describe("Minting - Factory Accounts (Free)", function () {
    beforeEach(async function () {
      // Register user1 as a factory account
      await mockFactory.registerAccount(user1.address);
    });

    it("Should allow free minting for factory accounts", async function () {
      await contract.connect(user1).mint();
      expect(await contract.balanceOf(user1.address)).to.equal(1n);
    });

    it("Should emit Minted event with paidMint=false", async function () {
      await expect(contract.connect(user1).mint())
        .to.emit(contract, "Minted")
        .withArgs(user1.address, 1, false);
    });

    it("Should not require payment from factory accounts", async function () {
      // Mint without sending any ETH
      await contract.connect(user1).mint({ value: 0 });
      expect(await contract.balanceOf(user1.address)).to.equal(1n);
    });
  });

  describe("Minting - Direct Accounts (Paid)", function () {
    it("Should require payment from non-factory accounts", async function () {
      await expect(contract.connect(user1).mint({ value: 0 }))
        .to.be.revertedWith("Insufficient payment for direct mint");
    });

    it("Should allow minting with correct payment", async function () {
      await contract.connect(user1).mint({ value: MINT_PRICE });
      expect(await contract.balanceOf(user1.address)).to.equal(1n);
    });

    it("Should emit Minted event with paidMint=true", async function () {
      await expect(contract.connect(user1).mint({ value: MINT_PRICE }))
        .to.emit(contract, "Minted")
        .withArgs(user1.address, 1, true);
    });

    it("Should accept overpayment", async function () {
      const overpayment = ethers.parseEther("0.1");
      await contract.connect(user1).mint({ value: overpayment });
      expect(await contract.balanceOf(user1.address)).to.equal(1n);
    });
  });

  describe("Minting - One Per Address", function () {
    it("Should prevent double minting", async function () {
      await contract.connect(user1).mint({ value: MINT_PRICE });
      await expect(contract.connect(user1).mint({ value: MINT_PRICE }))
        .to.be.revertedWith("Already minted");
    });
  });

  describe("Soulbound Functionality", function () {
    beforeEach(async function () {
      await contract.connect(user1).mint({ value: MINT_PRICE });
    });

    it("Should block transfers", async function () {
      await expect(
        contract.connect(user1).transferFrom(user1.address, user2.address, 1)
      ).to.be.revertedWith("Soulbound: transfers disabled");
    });

    it("Should block approvals", async function () {
      await expect(
        contract.connect(user1).approve(user2.address, 1)
      ).to.be.revertedWith("Soulbound: approvals disabled");
    });

    it("Should block setApprovalForAll", async function () {
      await expect(
        contract.connect(user1).setApprovalForAll(user2.address, true)
      ).to.be.revertedWith("Soulbound: approvals disabled");
    });
  });

  describe("isFreeForAddress", function () {
    it("Should return true for factory accounts", async function () {
      await mockFactory.registerAccount(user1.address);
      expect(await contract.isFreeForAddress(user1.address)).to.equal(true);
    });

    it("Should return false for non-factory accounts when mintPrice > 0", async function () {
      expect(await contract.isFreeForAddress(user1.address)).to.equal(false);
    });

    it("Should return true for all when mintPrice = 0", async function () {
      await contract.setMintPrice(0);
      expect(await contract.isFreeForAddress(user1.address)).to.equal(true);
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to update mint price", async function () {
      const newPrice = ethers.parseEther("0.05");
      await expect(contract.setMintPrice(newPrice))
        .to.emit(contract, "MintPriceUpdated")
        .withArgs(MINT_PRICE, newPrice);
      expect(await contract.mintPrice()).to.equal(newPrice);
    });

    it("Should not allow non-owner to update mint price", async function () {
      await expect(contract.connect(user1).setMintPrice(0))
        .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to withdraw ETH", async function () {
      // First, have someone mint and pay
      await contract.connect(user1).mint({ value: MINT_PRICE });

      const balanceBefore = await ethers.provider.getBalance(owner.address);
      const tx = await contract.withdrawETH();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(owner.address);

      // Balance after should be greater than balance before minus gas
      expect(balanceAfter > balanceBefore - gasUsed).to.be.true;
    });

    it("Should allow owner to pause/unpause", async function () {
      await contract.pause();
      expect(await contract.paused()).to.equal(true);

      await expect(contract.connect(user1).mint({ value: MINT_PRICE }))
        .to.be.revertedWith("Pausable: paused");

      await contract.unpause();
      expect(await contract.paused()).to.equal(false);

      await contract.connect(user1).mint({ value: MINT_PRICE });
      expect(await contract.balanceOf(user1.address)).to.equal(1n);
    });
  });

  describe("TokenURI", function () {
    it("Should return valid Base64-encoded JSON", async function () {
      await contract.connect(user1).mint({ value: MINT_PRICE });
      const uri = await contract.tokenURI(1);

      expect(uri).to.include("data:application/json;base64,");

      // Decode and parse the JSON
      const base64Data = uri.replace("data:application/json;base64,", "");
      const jsonString = Buffer.from(base64Data, "base64").toString("utf8");
      const metadata = JSON.parse(jsonString);

      expect(metadata.name).to.equal(`${COLLECTION_NAME} #1`);
      expect(metadata.description).to.equal(DESCRIPTION);
      expect(metadata.image).to.equal(IMAGE_URI);
      expect(metadata.animation_url).to.equal(ANIMATION_URI);
      expect(metadata.attributes).to.be.an("array");
    });
  });
});
