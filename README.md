# PolyPrize Lottery System

A complete NFT lottery/raffle system with a smart contract and white-label claiming dApp.

## Overview

This project consists of two main components:

1. **Smart Contract** (`polyprize_contract/polyprizeunicorn/`) - A configurable ERC721 NFT contract with soulbound tokens, factory-based free minting, and multi-network deployment
2. **Claiming dApp** (`unicorn-vite/`) - A white-label React application for claiming NFTs with multi-language support, theming, and gasless transactions

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Platform                             │
│                   (e.g., BitBasel, your app)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ AutoConnect with smart wallet
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Claiming dApp                               │
│                      (unicorn-vite)                              │
│  - React 19 + Vite                                               │
│  - Thirdweb v5 SDK                                               │
│  - Multi-language (EN, ES, ZH, JA, HE, AR)                       │
│  - Dark/Light mode                                               │
│  - Gasless minting via Account Abstraction                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Gasless transaction
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PolyPrizeUnicorn Contract                      │
│              (Polygon, Arbitrum, Base, Optimism)                 │
│  - ERC721 with optional soulbound                                │
│  - Factory accounts mint free                                    │
│  - Direct minters pay configurable price                         │
│  - One NFT per wallet                                            │
│  - Drawing date with optional extension                          │
│  - On-chain Base64-encoded metadata                              │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Deploy the Contract

```bash
cd polyprize_contract/polyprizeunicorn
cp .env.example .env
# Edit .env with your configuration
npm install
npm run deploy:arbitrum  # or polygon, base, optimism, sepolia
```

See [Contract README](polyprize_contract/polyprizeunicorn/README.md) for full documentation.

### Run the dApp

```bash
cd unicorn-vite
cp .env.example .env.local
# Edit .env.local with contract address and configuration
npm install --legacy-peer-deps
npm run dev
```

See [dApp README](unicorn-vite/README.md) for full documentation.

## Features

### Smart Contract
- Soulbound (non-transferable) NFTs
- Factory-based free minting for platform users
- Paid minting for direct contract interactions
- One mint per wallet
- Configurable drawing/lottery date
- Post-drawing minting option
- Pausable by owner
- Multi-network support

### Claiming dApp
- White-label branding via environment variables
- Multi-language (6 languages included, RTL support)
- Dark/Light mode with system preference detection
- Gasless minting via Thirdweb Account Abstraction
- NFT preview from contract metadata
- Social sharing (Twitter, LinkedIn, Farcaster, Bluesky)
- Real-time supply tracking and countdown
- Mobile responsive

## Supported Networks

| Network | Chain ID | Status |
|---------|----------|--------|
| Polygon | 137 | Production |
| Arbitrum | 42161 | Production |
| Base | 8453 | Production |
| Optimism | 10 | Production |
| Sepolia | 11155111 | Testnet |

## Requirements

- Node.js 18+
- npm or yarn
- Thirdweb Client ID ([get one here](https://thirdweb.com/dashboard))
- Wallet with native tokens for deployment gas
- Etherscan API key for verification

## Project Structure

```
LotterySystem/
├── polyprize_contract/
│   └── polyprizeunicorn/       # Smart contract
│       ├── contracts/          # Solidity contracts
│       ├── scripts/            # Deployment scripts
│       ├── test/               # Contract tests
│       └── README.md           # Contract documentation
│
├── unicorn-vite/               # Claiming dApp
│   ├── src/
│   │   ├── config/             # Theme and feature config
│   │   ├── locales/            # Translation files
│   │   └── App.jsx             # Main application
│   └── README.md               # dApp documentation
│
└── README.md                   # This file
```

## Documentation

- [Contract Documentation](polyprize_contract/polyprizeunicorn/README.md)
- [dApp Documentation](unicorn-vite/README.md)
- [CLAUDE.md](unicorn-vite/CLAUDE.md) - Technical reference for developers

## License

MIT

## Credits

- Built with [Thirdweb](https://thirdweb.com) v5 SDK
- Smart contracts use [OpenZeppelin](https://openzeppelin.com) v5
- Powered by [unicorn.eth](https://myunicornaccount.com)
