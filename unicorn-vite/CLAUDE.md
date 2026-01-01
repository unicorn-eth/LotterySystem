# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a white-label React dApp for claiming NFTs on Polygon, built with Thirdweb v5 SDK. Users with existing smart wallets from a specific factory can claim gasless NFTs through AutoConnect.

## Commands

```bash
# Install dependencies (requires --legacy-peer-deps for React 19)
npm install --legacy-peer-deps

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Lint
npm run lint

# Preview production build
npm run preview
```

## ThirdWeb v5 Critical Requirements

**Contract calls MUST use explicit function signatures:**
```javascript
// ✅ Correct - explicit signature required
useReadContract({
  contract,
  method: "function totalSupply() view returns (uint256)",
});

// ❌ Wrong - simple method names fail in v5
method: "totalSupply"
```

**Gas sponsorship is configured via account abstraction, not manual calls:**
```javascript
inAppWallet({
  smartAccount: {
    factoryAddress: factoryAddress,
    chain: polygon,
    gasless: true,
    sponsorGas: true,
  }
})
// Note: sponsorTransaction() does not exist in ThirdWeb v5
```

**Import patterns:** Always import from `thirdweb/react` and `thirdweb/chains`, never from `@thirdweb-dev/*` packages.

## Architecture

### Entry Flow
`main.jsx` → `ThemeProvider` (context) → `App.jsx` (ThirdwebProvider + AutoConnect)

### Key Integration Pattern
The app uses Thirdweb's AutoConnect with smart account wallets. AutoConnect only activates when URL contains `?walletId=inApp&authCookie=...` or `?autoConnect=true`. This ensures only authorized users from the parent platform can access the claiming interface.

### Authorization Logic
- If AutoConnect succeeds → user is authorized (wallet came from our factory)
- 8-second cooldown between mint attempts (rate limiting)
- NFTs are soul-bound: transfers blocked except to burn address (0x0)

### Configuration System
- **`src/config/theme.config.js`**: Central config for branding, colors, feature flags. Values can be overridden via `VITE_*` environment variables.
- **Environment variables**: All prefixed with `VITE_`. Required: `VITE_THIRDWEB_CLIENT_ID`, `VITE_CONTRACT_ADDRESS`, `VITE_THIRDWEB_FACTORY_ADDRESS`

### Theming
`ThemeContext` reads colors from `theme.config.js` and applies them as CSS custom properties (`--color-*`). Supports dark/light modes with system preference detection. Colors are defined in both `light` and `dark` variants.

### Internationalization (i18n)
- Uses i18next with browser language detection
- Translations in `src/locales/{lang}/translation.json`
- RTL support for Hebrew (`he`) and Arabic (`ar`) - auto-sets `dir="rtl"` on document
- Language can be forced via `?lang=XX` URL parameter

### Contract Integration
Expects an ERC721 contract with:
- `mint()` - gasless claim function
- `hasMinted(address)` - check if user already claimed
- `totalSupply()`, `MAX_SUPPLY()` - supply tracking
- `tokenURI(uint256)` - for NFT image preview
- Optional: `drawingDate()`, `isMintingActive()`, `paused()` for raffle features

### Feature Flags (in theme.config.js)
```javascript
features: {
  darkModeEnabled: true,
  socialShareEnabled: true,
  analyticsEnabled: true,
  languageSelectorEnabled: true,
  raffleEnabled: true, // can override via VITE_RAFFLE_ENABLED
}
```

## Adding a New Language

1. Create `src/locales/{code}/translation.json` (copy from `en`)
2. Add import and resource in `src/i18n.js`
3. Add to `languages` array in `LanguageSelector` component in `App.jsx`
4. If RTL, add language code to `RTL_LANGUAGES` array in `App.jsx`

## Deployment (Vercel)

- **Root Directory**: `unicorn-vite` (if in monorepo)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install --legacy-peer-deps`

Set environment variables in Vercel dashboard. The `vercel.json` file handles SPA routing.
