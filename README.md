# ConcealedPayroll-Engine

Privacy-preserving payroll management system built with Zama's FHE technology.

## Features
- **Organization Management**: Create and manage organizations with wallet-level privacy
- **Team Member Registration**: Add team members with plaintext metadata (name, role, address)
- **Encrypted Payroll Distribution**: Fully homomorphic encryption for salary payments
  - Encrypted recipient address hash
  - Encrypted member index
  - Encrypted payment amount
  - Encrypted currency type
  - Encrypted payment period
- **Shared Proof Pattern**: Follows FHE best practices with single proof for multiple encrypted values

## Tech Stack
- **Smart Contract**: Solidity 0.8.24 with Zama FHE
- **Frontend**: React 18 + TypeScript + Vite
- **Web3**: wagmi v2 + RainbowKit
- **FHE SDK**: @zama-fhe/relayer-sdk v0.2.0
- **UI**: Ant Design 5.0 + Tailwind CSS

## Architecture
- `PayrollManager.sol`: Main contract handling organization and encrypted payroll operations
- FHE encryption ensures salary information remains private on-chain
- Only organization creators can view their own organizations
- Gateway verification for encrypted data attestation

## Getting Started

### Prerequisites
- Node.js 18+
- MetaMask or compatible Web3 wallet

### Installation

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

### Smart Contract Deployment

```bash
# Install Hardhat dependencies
npm install

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

## Usage

1. **Connect Wallet**: Connect your Web3 wallet to Sepolia testnet
2. **Create Organization**: Create a new organization (only visible to you)
3. **Add Members**: Add team members with their wallet addresses
4. **Distribute Payroll**: Create encrypted payroll distributions with FHE

## Privacy Features
- Organization data is wallet-scoped (only creator can see)
- Salary amounts are fully encrypted using FHE
- Recipient information is hashed and encrypted
- All sensitive data remains confidential on-chain

## License
MIT
