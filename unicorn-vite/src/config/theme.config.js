// Theme and branding configuration
// Customize these values to white-label the dapp
// Based on BitBasel Vol. 6 branding

export const themeConfig = {
  // App Branding - can be overridden via environment variables
  appName: import.meta.env.VITE_APP_NAME || 'BitBasel Prize',
  appEmoji: import.meta.env.VITE_APP_EMOJI || '🎨',
  platformName: import.meta.env.VITE_PLATFORM_NAME || 'BitBasel',
  platformUrl: import.meta.env.VITE_PLATFORM_URL || 'https://www.bitbasel.miami',
  prizeAmount: import.meta.env.VITE_PRIZE_AMOUNT || '$100',
  shareUrl: import.meta.env.VITE_SHARE_URL || 'https://www.bitbasel.miami/artweek',

  // Social handles for sharing
  social: {
    twitter: import.meta.env.VITE_TWITTER_HANDLE || '@BitBaselMiami',
    farcaster: import.meta.env.VITE_FARCASTER_HANDLE || '@bitbasel',
    bluesky: import.meta.env.VITE_BLUESKY_HANDLE || '@bitbasel',
  },

  // NFT Image (supports static images, GIFs, and videos)
  nftImage: {
    url: import.meta.env.VITE_NFT_IMAGE_URL || '',
    alt: import.meta.env.VITE_NFT_IMAGE_ALT || 'NFT Preview',
    // Set to true if the URL is a video (mp4, webm)
    isVideo: import.meta.env.VITE_NFT_IMAGE_IS_VIDEO === 'true',
  },

  // BitBasel Color Palette - Minimalist black/white with cyan accents
  colors: {
    light: {
      primary: '#0099FF',           // Cyan accent (#09f)
      primaryHover: '#0077CC',      // Darker cyan on hover
      secondary: '#181818',         // Dark gray
      background: '#FFFFFF',        // White background
      surface: '#F5F5F5',           // Light gray cards
      surfaceMuted: '#E7E7E7',      // Muted gray backgrounds
      border: '#E7E7E7',            // Light border
      borderAccent: '#0099FF',      // Cyan accent border
      text: '#181818',              // Dark gray text
      textMuted: '#888888',         // Medium gray text
      textLight: '#B0B0B0',         // Light gray text
      success: '#22C55E',           // Green
      successBg: '#DCFCE7',         // Light green
      successBorder: '#86EFAC',     // Green border
      warning: '#F59E0B',           // Amber
      warningBg: '#FEF3C7',         // Light amber
      warningBorder: '#FCD34D',     // Amber border
      error: '#EF4444',             // Red
      errorBg: '#FEE2E2',           // Light red
      errorBorder: '#FCA5A5',       // Red border
      info: '#0099FF',              // Cyan (matches primary)
      infoBg: '#E0F2FE',            // Light cyan
      infoBorder: '#7DD3FC',        // Cyan border
    },
    dark: {
      primary: '#0099FF',           // Cyan stays vibrant in dark
      primaryHover: '#33ADFF',      // Lighter cyan on hover
      secondary: '#E7E7E7',         // Light gray for contrast
      background: '#000000',        // Pure black (BitBasel style)
      surface: '#181818',           // Dark gray cards
      surfaceMuted: '#111111',      // Slightly lighter than black
      border: '#333333',            // Dark border
      borderAccent: '#0099FF',      // Cyan accent border
      text: '#FFFFFF',              // White text
      textMuted: '#B0B0B0',         // Light gray text
      textLight: '#888888',         // Medium gray text
      success: '#22C55E',           // Green
      successBg: '#14532D',         // Dark green
      successBorder: '#166534',     // Green border
      warning: '#FBBF24',           // Amber
      warningBg: '#78350F',         // Dark amber
      warningBorder: '#92400E',     // Amber border
      error: '#F87171',             // Light red
      errorBg: '#7F1D1D',           // Dark red
      errorBorder: '#991B1B',       // Red border
      info: '#38BDF8',              // Light cyan
      infoBg: '#0C4A6E',            // Dark cyan
      infoBorder: '#0369A1',        // Cyan border
    }
  },

  // Feature flags
  features: {
    darkModeEnabled: true,
    socialShareEnabled: true,
    analyticsEnabled: true,
    languageSelectorEnabled: true,
    raffleEnabled: import.meta.env.VITE_RAFFLE_ENABLED !== 'false', // Enabled by default
    allowPostDrawingMint: import.meta.env.VITE_ALLOW_POST_DRAWING_MINT === 'true', // Disabled by default
  }
};

export default themeConfig;
