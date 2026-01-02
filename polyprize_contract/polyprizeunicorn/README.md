# PolyPrizeUnicorn Smart Contract

A configurable ERC721 NFT contract for lottery/raffle systems with soulbound tokens, factory-based free minting, and multi-network support.

## Features

- **Soulbound NFTs** (optional): Non-transferable tokens bound to the minting wallet
- **Factory-Based Free Minting**: Smart accounts from Thirdweb AccountFactory mint for free
- **Paid Direct Minting**: Non-factory accounts pay a configurable mint price
- **One Per Wallet**: Each address can only mint one NFT
- **Drawing Date**: Configurable deadline for minting (can be extended, not reduced)
- **Post-Drawing Minting**: Optional flag to allow minting after the drawing date
- **On-Chain Metadata**: Base64-encoded JSON tokenURI with wallet address, drawing date, and soulbound status
- **Pausable**: Owner can pause/unpause minting
- **Multi-Network**: Deploy to Polygon, Arbitrum, Base, Optimism, or Sepolia

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Deployer wallet
PRIVATE_KEY=your_private_key

# Block explorer verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Collection settings
COLLECTION_NAME=My NFT Collection
TOKEN_SYMBOL=MNFT
COLLECTION_DESCRIPTION=Optional description
IS_SOULBOUND=true

# Media URIs (IPFS recommended)
BASE_IMAGE_URI=ipfs://your-image-cid
BASE_ANIMATION_URI=ipfs://your-animation-cid

# Drawing/lottery date (Unix timestamp)
DRAWING_DATE=1759082399

# Factory-based minting (Thirdweb AccountFactory address)
# Set to 0x0...0 to disable factory check
ACCOUNT_FACTORY=0xD771615c873ba5a2149D5312448cE01D677Ee48A

# Price for non-factory minters (in wei, 0 = free for all)
MINT_PRICE=0
```

### 3. Compile

```bash
npm run compile
```

### 4. Run Tests

```bash
npx hardhat test
```

### 5. Deploy

```bash
# Deploy to specific network
npm run deploy:polygon
npm run deploy:arbitrum
npm run deploy:base
npm run deploy:optimism
npm run deploy:sepolia
```

### 6. Verify

After deployment, wait for a few block confirmations then run the verify command printed in the deploy output.

## Contract Functions

### Public Functions

| Function | Description |
|----------|-------------|
| `mint()` | Mint an NFT (free for factory accounts, paid for others) |
| `tokenURI(tokenId)` | Get Base64-encoded JSON metadata |
| `hasMinted(address)` | Check if address has minted |
| `isFreeForAddress(address)` | Check if address would mint for free |
| `isMintingActive()` | Check if minting is currently active |
| `timeUntilDrawing()` | Seconds until drawing date |

### Owner Functions

| Function | Description |
|----------|-------------|
| `pause()` / `unpause()` | Emergency pause/resume minting |
| `setDrawingDate(timestamp)` | Extend drawing date (can only extend) |
| `setMintPrice(wei)` | Update mint price for direct minters |
| `setAllowMintingAfterDrawing(bool)` | Toggle post-drawing minting |
| `updateBaseImageURI(uri)` | Update NFT image |
| `updateBaseAnimationURI(uri)` | Update NFT animation |
| `updateCollectionDescription(desc)` | Update metadata description |
| `withdrawETH()` | Withdraw collected ETH to owner |
| `withdrawERC20(token)` | Rescue accidentally sent ERC20 tokens |

## Factory-Based Minting

The contract integrates with Thirdweb's AccountFactory to provide free minting for smart account users:

- **Smart accounts** from the configured factory → **Free mint**
- **EOAs and other contracts** → **Pay `mintPrice`**

This allows dApp users (with smart accounts) to mint gaslessly and for free, while direct contract interactions require payment.

**Important**: Smart accounts must be deployed (have made at least one transaction) for `isRegistered()` to return true.

## Network Support

| Network | Chain ID | Deploy Command |
|---------|----------|----------------|
| Polygon | 137 | `npm run deploy:polygon` |
| Arbitrum | 42161 | `npm run deploy:arbitrum` |
| Base | 8453 | `npm run deploy:base` |
| Optimism | 10 | `npm run deploy:optimism` |
| Sepolia | 11155111 | `npm run deploy:sepolia` |

## On-Chain Metadata

The contract generates Base64-encoded JSON metadata on-chain:

```json
{
  "name": "Collection Name #1",
  "description": "Your description or auto-generated",
  "image": "ipfs://your-image-cid",
  "animation_url": "ipfs://your-animation-cid",
  "attributes": [
    { "trait_type": "Wallet", "value": "0x..." },
    { "trait_type": "Drawing Date", "display_type": "date", "value": 1759082399 },
    { "trait_type": "Soulbound", "value": "Yes" }
  ]
}
```

## Security

- OpenZeppelin v5 contracts (ERC721, ERC721Enumerable, Ownable)
- Soulbound implementation blocks transfers and approvals
- One mint per wallet enforced on-chain
- Drawing date can only be extended, never reduced
- Pausable for emergency situations
- Max supply hard-coded to 10,000

## Testing

The test suite covers:
- Deployment parameters
- Factory vs direct minting
- Soulbound restrictions
- Owner functions
- TokenURI encoding

```bash
npx hardhat test
```

## License

MIT
