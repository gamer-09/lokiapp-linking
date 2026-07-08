# Loki_12 - Social Media Hub

A unified dashboard for managing multiple social media platforms from a single interface. Connect with LinkedIn, Gmail, X (Twitter), WhatsApp, Telegram, TikTok, and Instagram to view messages, comments, and mentions all in one place.

## Features

- **Unified Dashboard**: View messages, comments, and mentions from all connected platforms in one place
- **Platform Integration**: Support for 7 major platforms:
  - LinkedIn
  - Gmail
  - X/Twitter
  - WhatsApp
  - Telegram
  - TikTok
  - Instagram
- **Real-time Notifications**: Get notified when you're mentioned across platforms
- **OAuth Authentication**: Secure authentication flow for each platform
- **Modern UI**: Clean, dark-themed interface built with Next.js and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd loki_12
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your API credentials in `.env.local` (see [API Credentials Setup](#api-credentials-setup) below)

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Credentials Setup

To use Loki_12, you need to obtain API credentials from each platform you want to connect:

### LinkedIn
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new application
3. Add `http://localhost:3000/api/auth/callback/linkedin` as a redirect URL
4. Copy Client ID and Client Secret to your `.env.local`

### Gmail
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project and enable Gmail API
3. Create OAuth 2.0 credentials
4. Add `http://localhost:3000/api/auth/callback/gmail` as authorized redirect URI
5. Copy Client ID and Client Secret to your `.env.local`

### X/Twitter
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new project and app
3. Enable OAuth 2.0
4. Add `http://localhost:3000/api/auth/callback/twitter` as callback URL
5. Copy Client ID and Client Secret to your `.env.local`

### WhatsApp
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app
3. Add WhatsApp product
4. Add `http://localhost:3000/api/auth/callback/whatsapp` as redirect URL
5. Copy App ID and App Secret to your `.env.local`

### Telegram
1. Create a bot via [@BotFather](https://t.me/botfather) on Telegram
2. Copy the bot token to your `.env.local`

### TikTok
1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create a new app
3. Add `http://localhost:3000/api/auth/callback/tiktok` as redirect URL
4. Copy Client Key and Client Secret to your `.env.local`

### Instagram
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Instagram product
4. Add `http://localhost:3000/api/auth/callback/instagram` as redirect URL
5. Copy App ID and App Secret to your `.env.local`

## Project Structure

```
loki_12/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── callback/
│   │   │           └── [platform]/
│   │   │               └── route.ts
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── PlatformSidebar.tsx
│   │   ├── Dashboard.tsx
│   │   └── AuthModal.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   └── platform-api.ts
│   ├── store/
│   │   └── useStore.ts
│   └── types/
│       └── index.ts
├── .env.example
├── package.json
└── README.md
```

## Usage

1. **Connect Platforms**: Click "Connect Account" for each platform you want to use
2. **View Messages**: Navigate to the Messages section to see direct messages
3. **View Comments**: Check the Comments section for post comments
4. **View Mentions**: See where you've been mentioned in the Mentions section
5. **Switch Platforms**: Use the sidebar to switch between connected platforms

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **Date Formatting**: date-fns
- **HTTP Client**: Axios

## Security Notes

- All OAuth tokens are stored locally in the browser
- Tokens are never sent to third-party servers
- Each platform's OAuth flow follows security best practices
- Redirect URIs must be properly configured in each platform's developer console

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Future Enhancements

- [ ] Reply to messages and comments directly from the dashboard
- [ ] Real-time updates using webhooks
- [ ] Message search functionality
- [ ] Analytics and insights
- [ ] Scheduled posting
- [ ] Multi-language support

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
