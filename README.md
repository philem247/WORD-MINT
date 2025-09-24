# WordMint - Spell-to-Earn Game on Solana

WordMint is a fun, interactive word-spelling game where players can earn $WORD tokens by correctly spelling words they hear. Built with Next.js 13+ and integrated with Solana blockchain for real token rewards.

## Features

- 🎧 **Audio Word Prompts**: Listen to words via text-to-speech
- ⏱️ **Timed Challenges**: 30-second timer for each word
- 🔥 **Streak Tracking**: Build consecutive correct answers for higher scores
- 💰 **Token Rewards**: Earn 1 $WORD token for each correct answer
- 🏆 **Leaderboard**: Compete with other players on the global leaderboard
- 🔗 **Solana Integration**: Full wallet connectivity with multiple wallet support
- 🎨 **Modern UI**: Beautiful cyberpunk-themed interface with animations

## Prerequisites

- Node.js 18+
- A Solana wallet (Phantom, Solflare, etc.)
- $WORD token mint and treasury wallet set up on Solana Devnet

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Solana Configuration
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com

# Treasury Wallet Configuration
TREASURY_SECRET_KEY=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64]

# $WORD Token Mint Address
NEXT_PUBLIC_WORD_TOKEN_MINT=YourTokenMintAddressHere
```

### 3. Token Setup

Before running the application, you need to:

1. **Create a $WORD token** on Solana Devnet:
   - Use the Solana CLI or a token creation tool
   - Set appropriate decimals (recommended: 9)

2. **Set up a treasury wallet**:
   - Generate a new keypair for the treasury
   - Fund it with some SOL for transaction fees
   - Mint a large supply of $WORD tokens to this treasury wallet

3. **Update environment variables**:
   - Replace `TREASURY_SECRET_KEY` with your treasury wallet's secret key array
   - Replace `NEXT_PUBLIC_WORD_TOKEN_MINT` with your token's mint address

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Play

1. **Connect Your Wallet**: Click the wallet button and select your preferred Solana wallet
2. **Listen**: A word will be spoken via text-to-speech
3. **Type**: Type the word you heard in the input field
4. **Submit**: Click submit before the timer runs out
5. **Claim Rewards**: If correct, click "Claim 1 $WORD" to receive your token reward
6. **Build Streaks**: Try to get consecutive correct answers for higher scores

## Wallet Integration

### Supported Wallets
- Phantom
- Solflare
- Coinbase Wallet
- Torus

### Features
- **Auto-connect**: Wallet stays connected during the session
- **Visual feedback**: Shows connected wallet address (first 4 and last 4 characters)
- **Disconnect option**: Easy wallet disconnection
- **Devnet only**: All transactions happen on Solana Devnet

## API Endpoints

### POST `/api/reward`
Mints 1 $WORD token to the connected wallet.

**Request Body:**
```json
{
  "wallet": "user-wallet-address"
}
```

**Response:**
```json
{
  "success": true,
  "message": "1 $WORD token minted successfully!",
  "signature": "transaction-signature",
  "txUrl": "https://explorer.solana.com/tx/signature?cluster=devnet"
}
```

### POST `/api/leaderboard`
Updates user score on the leaderboard.

**Request Body:**
```json
{
  "wallet": "user-wallet-address",
  "score": 5
}
```

## Development

### Project Structure
```
├── app/
│   ├── api/
│   │   └── reward.ts          # Token minting API
│   ├── layout.tsx             # Root layout with wallet provider
│   ├── page.tsx               # Main game page
│   └── globals.css            # Global styles
├── components/
│   ├── GamePanel.tsx          # Main game component
│   ├── LeaderboardPanel.tsx   # Leaderboard display
│   └── WalletContextProvider.tsx # Wallet setup
├── lib/
│   └── solana.ts              # Solana utilities
└── data/
    └── words.json             # Word bank for the game
```

### Key Components

- **GamePanel**: Main game logic, timer, scoring, and reward claiming
- **WalletContextProvider**: Sets up Solana wallet adapters
- **Reward API**: Handles token minting via treasury wallet

## Testing on Devnet

1. Ensure your wallet is set to Devnet
2. Make sure you have some SOL in your wallet for transaction fees
3. Play the game and claim rewards
4. Check your wallet balance to see $WORD tokens
5. View transaction details on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)

## Troubleshooting

### Common Issues

1. **"Wallet not connected" error**: Make sure your wallet is connected and set to Devnet
2. **"Failed to mint reward token"**: Check that:
   - Treasury wallet has sufficient SOL for fees
   - Token mint address is correct
   - Treasury wallet has $WORD tokens to distribute
3. **Transaction fails**: Ensure your wallet has enough SOL for transaction fees

### Debug Mode

Add debug logging by checking the browser console and server logs for detailed error messages.

## Security Notes

- All transactions happen on Devnet (test network)
- Treasury secret key should be kept secure and never committed to version control
- The application only requests token minting permissions, not token transfers from user wallets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on Devnet
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
