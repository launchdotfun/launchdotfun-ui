# 🚀 Launch.Fun

> A privacy-preserving decentralized token launchpad platform built on the Launch blockchain with Fully Homomorphic Encryption (FHE) technology.

[![Next.js](https://img.shields.io/badge/Next.js-15.4.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🌐 Live Demo

**👉 [https://launch-dot-fun.vercel.app/](https://launch-dot-fun.vercel.app/)**

## 📖 Overview

**Launch.Fun** is a decentralized token launchpad platform (DApp) that enables users to create and participate in token presales with complete financial privacy. Built on the Launch blockchain, the platform leverages **Fully Homomorphic Encryption (FHE)** technology to protect user transaction amounts while maintaining transparency in the presale process.

### Key Highlights

- 🔒 **Privacy-First**: Individual investment amounts are encrypted using FHE technology
- 🚀 **Full Launchpad Features**: Create tokens, launch presales, and manage assets
- ⛓️ **Blockchain Native**: Built on Launch blockchain with smart contract integration
- 💎 **zWETH Support**: Secure wrapped ETH transactions for confidential investments

## ✨ Features

### For Token Creators

- **Token Creation**: Deploy custom ERC-20 tokens with configurable parameters
- **Presale Management**: Create and configure token presales with:
  - Custom start/end dates
  - Hard cap and soft cap settings
  - Token distribution rules
  - Fee structure configuration
- **Asset Dashboard**: Monitor all your created tokens and presales
- **Presale Analytics**: Track fundraising progress and participant statistics

### For Investors

- **Presale Discovery**: Browse active presales with real-time statistics
- **Private Investments**: Invest in presales without revealing your contribution amount
- **Portfolio Management**: Track all your investments and token holdings
- **Contribution History**: View detailed history of your presale participations
- **zWETH Integration**: Wrap/unwrap ETH for confidential transactions

### Platform Features

- **Real-time Updates**: Live presale statistics and trending tokens
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Wallet Integration**: Support for multiple Web3 wallets via WalletConnect
- **IPFS Storage**: Decentralized image and metadata storage via Pinata
- **Smart Contract Integration**: Direct interaction with Launch blockchain contracts

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 15.4.2](https://nextjs.org/) with App Router
- **UI Library**: [React 19.1.0](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Yup](https://github.com/jquense/yup)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) + [TanStack Query](https://tanstack.com/query)

### Web3 & Blockchain

- **Ethereum Library**: [Ethers.js v6](https://docs.ethers.org/) + [Viem](https://viem.sh/)
- **Wallet Integration**: [Wagmi](https://wagmi.sh/) + [Reown AppKit](https://appkit.reown.com/)
- **FHE Integration**: [Zama FHE Relayer SDK](https://docs.zama.ai/)
- **Contract Types**: [TypeChain](https://github.com/dethcrypto/TypeChain) for type-safe contract interactions

### Backend & Infrastructure

- **Database**: [MongoDB](https://www.mongodb.com/) for presale and token metadata
- **IPFS**: [Pinata](https://www.pinata.cloud/) for decentralized file storage
- **API**: Next.js API Routes for backend functionality
- **Deployment**: [Vercel](https://vercel.com/)

### Development Tools

- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Linting**: [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **pnpm** (or npm/yarn)
- **Web3 Wallet** (MetaMask, WalletConnect, etc.)
- **MongoDB** connection string (for production)
- **Pinata API keys** (for IPFS storage)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/launchdotfun/launchdotfun-ui.git
cd launchdotfun-ui
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Pinata (IPFS)
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key

# Blockchain
NEXT_PUBLIC_CHAIN_ID=your_chain_id
NEXT_PUBLIC_RPC_URL=your_rpc_url

# Zama FHE Relayer
NEXT_PUBLIC_RELAYER_URL=your_relayer_url
```

4. **Generate contract types** (if needed)

```bash
pnpm typechain:build
```

5. **Run the development server**

```bash
pnpm dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm test             # Run tests with Vitest

# TypeScript
pnpm typechain:build  # Generate TypeChain types from ABIs
```

## 📁 Project Structure

```
launchpad-interface/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (home)/             # Home page
│   │   ├── about/              # About page
│   │   ├── create-token/       # Token creation page
│   │   ├── create-launchpad/   # Presale creation page
│   │   ├── launchpad/[id]/     # Presale detail page
│   │   ├── manage-launchpad/   # Presale management
│   │   ├── dashboard/          # User dashboard
│   │   └── api/                # API routes
│   │       ├── presales/      # Presale API
│   │       ├── tokens/         # Token API
│   │       └── upload-image/  # Image upload API
│   │
│   ├── components/
│   │   ├── common/             # Reusable components
│   │   ├── features/          # Feature-specific components
│   │   ├── layout/            # Layout components
│   │   ├── modals/            # Modal components
│   │   └── ui/                # shadcn/ui components
│   │
│   ├── lib/
│   │   ├── hooks/             # Custom React hooks
│   │   ├── presales/          # Presale logic & API
│   │   ├── tokens/             # Token logic & API
│   │   ├── utils/             # Utility functions
│   │   └── configs/           # Configuration files
│   │
│   └── web3/
│       ├── abis/              # Smart contract ABIs
│       ├── contracts/         # TypeChain generated contracts
│       └── core/              # Web3 utilities
│
├── public/                     # Static assets
├── styles/                     # Global styles
└── package.json
```

## 🔗 Related Repositories

- **[Smart Contracts](https://github.com/launchdotfun/smart-contracts)** - Launch.Fun smart contracts
- **[Frontend UI](https://github.com/launchdotfun/launchdotfun-ui)** - This repository

## 📚 Documentation

### Smart Contract Integration

The platform interacts with several smart contracts on the Launch blockchain:

- `LaunchDotFunTokenFactory` - Token creation
- `LaunchDotFunPresaleFactory` - Presale creation
- `LaunchDotFunPresale` - Individual presale contracts
- `LaunchDotFunWETH` - zWETH (wrapped ETH) for confidential transactions

### API Endpoints

- `GET /api/presales` - List all presales
- `GET /api/presales/[id]` - Get presale details
- `GET /api/tokens` - List tokens
- `GET /api/tokens/[address]` - Get token details
- `POST /api/upload-image` - Upload image to IPFS

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Zama](https://www.zama.ai/) for FHE technology and Relayer SDK
- [Next.js](https://nextjs.org/) team for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for the component library foundation
- All contributors and the Launch blockchain community

---

**Built with ❤️ by the Launch.Fun team**

For questions or support, please open an issue on GitHub.
