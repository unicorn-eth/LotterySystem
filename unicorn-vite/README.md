# NFT Claiming DApp

A white-label React application for claiming exclusive NFTs, built with multi-language support, customizable theming, and easy Vercel deployment.

## Overview

This decentralized application (dapp) allows authorized users to claim NFTs on the Polygon blockchain. It's designed to be easily customizable and deployable as your own branded NFT claiming experience.

### Key Features

- **White-Label Ready**: Fully customizable branding, colors, and messaging
- **Multi-Language Support**: Built-in i18n with English, Spanish, Chinese, Japanese, Hebrew, and Arabic
- **Dark/Light Mode**: Automatic theme switching with system preference detection
- **RTL Support**: Full right-to-left layout support for Hebrew and Arabic
- **Gasless Claiming**: Users pay no transaction fees thanks to account abstraction
- **NFT Preview**: Automatically fetches and displays NFT image from contract metadata
- **Smart Wallet Integration**: Works with Thirdweb smart accounts
- **Social Sharing**: Built-in sharing to LinkedIn, Twitter, Farcaster, and Bluesky
- **Real-Time Data**: Live contract data showing supply, drawing date, and countdown
- **Mobile Responsive**: Clean, modern design that works on all devices

## Technology Stack

- **Frontend**: React 19 with Vite
- **Web3**: Thirdweb v5 SDK
- **Blockchain**: Multi-chain (Polygon, Arbitrum, Base, Optimism, Sepolia)
- **Styling**: Tailwind CSS with CSS custom properties
- **Internationalization**: i18next with browser language detection
- **Analytics**: Google Analytics 4 (optional)
- **Deployment**: Vercel

## Quick Start

### 1. Clone and Install

```bash
git clone [repository-url]
cd unicorn-vite
npm install --legacy-peer-deps
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration (see [Environment Variables](#environment-variables) below).

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Deploy to Vercel

```bash
npm run build
```

Then connect your repository to Vercel and set environment variables in the dashboard.

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `VITE_THIRDWEB_CLIENT_ID` | Your Thirdweb client ID ([get one here](https://thirdweb.com/dashboard)) |
| `VITE_CONTRACT_ADDRESS` | Your deployed NFT contract address |
| `VITE_THIRDWEB_FACTORY_ADDRESS` | Smart wallet factory address |
| `VITE_APP_NETWORK_NAME` | Network name: `polygon`, `arbitrum`, `base`, `optimism`, or `sepolia` |

### Branding (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_APP_NAME` | `BitBasel Prize` | App name shown throughout UI |
| `VITE_APP_EMOJI` | `🎨` | Emoji displayed with app name |
| `VITE_PLATFORM_NAME` | `BitBasel` | Platform name for access messages |
| `VITE_PLATFORM_URL` | `https://www.bitbasel.miami` | Platform URL |
| `VITE_PRIZE_AMOUNT` | `$100` | Prize amount shown in UI |
| `VITE_SHARE_URL` | `https://www.bitbasel.miami/artweek` | URL for social sharing |

### NFT Image (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_NFT_IMAGE_URL` | (auto from contract) | Override NFT preview image URL |
| `VITE_NFT_IMAGE_ALT` | `NFT Preview` | Alt text for NFT image |
| `VITE_NFT_IMAGE_IS_VIDEO` | `false` | Set to `true` for video files |

If `VITE_NFT_IMAGE_URL` is not set, the app automatically fetches the image from the contract's `tokenURI`.

### Social Handles (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_TWITTER_HANDLE` | `@BitBaselMiami` | Twitter handle(s) for share text |
| `VITE_FARCASTER_HANDLE` | `@bitbasel` | Farcaster handle |
| `VITE_BLUESKY_HANDLE` | `@bitbasel` | Bluesky handle |

### Feature Toggles (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_RAFFLE_ENABLED` | `true` | Show/hide raffle countdown section |
| `VITE_ALLOW_POST_DRAWING_MINT` | `false` | Allow minting after drawing date (hides raffle section) |
| `VITE_GA_MEASUREMENT_ID` | (none) | Google Analytics 4 Measurement ID |

## Customization

### Theming

Edit `src/config/theme.config.js` to customize colors:

```javascript
colors: {
  light: {
    primary: '#0099FF',      // Main accent color
    background: '#FFFFFF',   // Page background
    surface: '#F5F5F5',      // Card backgrounds
    text: '#181818',         // Primary text
    // ... more colors
  },
  dark: {
    primary: '#0099FF',
    background: '#000000',
    // ... dark mode colors
  }
}
```

### Translations

Translation files are located in `src/locales/`:

```
src/locales/
├── en/translation.json   # English
├── es/translation.json   # Spanish
├── zh/translation.json   # Chinese
├── ja/translation.json   # Japanese
├── he/translation.json   # Hebrew
└── ar/translation.json   # Arabic
```

#### Adding a New Language

1. Create a new folder: `src/locales/XX/translation.json`
2. Copy an existing translation file and translate the values
3. Add the import in `src/i18n.js`:

```javascript
import xx from './locales/xx/translation.json';

// In the init resources:
resources: {
  // ... existing languages
  xx: { translation: xx },
}
```

4. Add to the language selector in `src/App.jsx`:

```javascript
const languages = [
  // ... existing languages
  { code: 'xx', label: 'Language Name', flag: '🏳️' },
];
```

### Feature Flags

In `src/config/theme.config.js`:

```javascript
features: {
  darkModeEnabled: true,         // Enable dark/light mode toggle
  socialShareEnabled: true,      // Show social sharing buttons
  analyticsEnabled: true,        // Enable Google Analytics
  languageSelectorEnabled: true, // Show language dropdown
  raffleEnabled: true,           // Show raffle countdown (also via env var)
  allowPostDrawingMint: false,   // Allow minting after drawing date
}
```

## Project Structure

```
unicorn-vite/
├── public/                     # Static assets
├── src/
│   ├── config/
│   │   └── theme.config.js     # Branding, colors, feature flags
│   ├── contexts/
│   │   └── ThemeContext.jsx    # Theme provider (dark/light mode)
│   ├── locales/                # Translation files
│   │   ├── en/translation.json
│   │   ├── es/translation.json
│   │   ├── zh/translation.json
│   │   ├── ja/translation.json
│   │   ├── he/translation.json
│   │   └── ar/translation.json
│   ├── utils/
│   │   └── analytics.js        # Google Analytics integration
│   ├── App.jsx                 # Main application component
│   ├── i18n.js                 # i18next configuration
│   ├── index.css               # Global styles & CSS variables
│   └── main.jsx                # React entry point
├── .env.example                # Environment variables template
├── index.html                  # HTML entry with fonts
├── tailwind.config.js          # Tailwind configuration
├── vercel.json                 # Vercel deployment config
└── vite.config.js              # Vite configuration
```

## Smart Contract Integration

The app expects an ERC721 contract with these functions:

### Required Functions

```solidity
function mint() external;
function hasMinted(address) external view returns (bool);
function totalSupply() external view returns (uint256);
function MAX_SUPPLY() external view returns (uint256);
function tokenURI(uint256 tokenId) external view returns (string);
```

### Optional Functions (for raffle feature)

```solidity
function drawingDate() external view returns (uint256);
function isMintingActive() external view returns (bool);
function paused() external view returns (bool);
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Set the root directory to `unicorn-vite` (if in a monorepo)
4. Add environment variables in Vercel dashboard
5. Deploy!

The included `vercel.json` handles the configuration automatically.

### Manual Build

```bash
npm run build
```

The production build will be in the `dist/` folder, ready to deploy to any static hosting.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Common Issues

**AutoConnect Not Working**
- Verify user has existing smart wallet from correct factory
- Check client ID permissions in Thirdweb dashboard
- Ensure `walletId=inApp` and `authCookie` URL parameters are present

**NFT Image Not Loading**
- Check if contract has `tokenURI` function
- Verify IPFS gateway is accessible
- Try setting `VITE_NFT_IMAGE_URL` as override

**Build Errors**
- Use `--legacy-peer-deps` flag for npm install
- Ensure Node.js version 18+
- Verify all environment variables are set

**RTL Layout Issues**
- Ensure `rtl:` Tailwind classes are used where needed
- Check that `dir="rtl"` is being set on `<html>` element

### Development Tips

- Use browser console to monitor AutoConnect process
- Check localStorage for theme and language preferences
- Test with `?lang=XX` URL parameter to force a language

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is open source. See LICENSE file for details.

## Credits

- Built with [Thirdweb](https://thirdweb.com) v5 SDK
- Powered by [unicorn.eth](https://myunicornaccount.com)
- Fonts: [Manrope](https://fonts.google.com/specimen/Manrope) & [Inter](https://fonts.google.com/specimen/Inter)

---

**Made with ❤️ by the unicorn.eth team**
