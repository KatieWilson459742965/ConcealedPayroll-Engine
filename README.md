# PrivyPayroll

> Privacy-First Blockchain Payroll Platform

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://privypayroll.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Powered by Zama](https://img.shields.io/badge/Powered%20by-Zama%20FHE-blueviolet)](https://www.zama.ai/)

**PrivyPayroll** is an enterprise-grade encrypted payroll management platform powered by Zama's Fully Homomorphic Encryption (FHE) technology. Keep salary information completely confidential on-chain while maintaining full operational transparency.

🔗 **Live Demo**: [https://privypayroll.vercel.app](https://privypayroll.vercel.app)

---

## ✨ Features

### 🔐 Complete Privacy
- **Fully Encrypted Salaries**: All salary data encrypted with Zama FHE on-chain
- **Zero-Knowledge Payroll**: Process payroll distributions without revealing individual salaries
- **Self-Sovereign Data**: Only employees can decrypt their own salary information

### 🏢 Organization Management
- **Multi-Organization Support**: Create and manage multiple organizations
- **Team Member Management**: Add employees with encrypted monthly salaries
- **Payroll Distribution Tracking**: Complete history of all payroll distributions
- **Role-Based Access**: Organization owners control their payroll operations

### 🛡️ Blockchain Security
- **Immutable Records**: All payroll data stored permanently on Ethereum
- **Transparent Operations**: Full audit trail of all transactions
- **Smart Contract Based**: Trustless execution on Sepolia testnet

### 📊 Dashboard Features
- **Admin Panel**: Create organizations, add members, distribute payroll
- **Employee Dashboard**: View employment information and organization details
- **Organization Details**: Member lists and payroll distribution history

---

## 🚀 Tech Stack

### Smart Contracts
- **Solidity** 0.8.24
- **Zama fhEVM** - Fully Homomorphic Encryption library
- **Hardhat** - Development and deployment framework
- **Sepolia Testnet** - Ethereum testnet deployment

### Frontend
- **React** 18.3 with TypeScript
- **Vite** 5.4 - Build tool and dev server
- **wagmi** 2.x - React hooks for Web3
- **RainbowKit** 2.x - Wallet connection UI
- **Ant Design** 5.0 - UI component library
- **Tailwind CSS** - Utility-first styling

### FHE Integration
- **@zama-fhe/relayer-sdk** 0.2.0 - FHE encryption client
- **ethers.js** 6.x - Ethereum library

---

## 📦 Project Structure

```
PrivyPayroll/
├── contracts/
│   └── PayrollManager.sol      # Main FHE payroll contract
├── scripts/
│   └── deploy.js                # Contract deployment script
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero.tsx         # Landing page hero
│   │   │   ├── Navigation.tsx   # Main navigation
│   │   │   ├── AdminPanel.tsx   # Organization management
│   │   │   ├── EmployeeDashboard.tsx  # Employee view
│   │   │   └── OrganizationDetails.tsx # Org details view
│   │   ├── hooks/
│   │   │   └── usePayroll.ts    # Payroll contract hook
│   │   └── lib/
│   │       ├── contractABI.ts   # Contract ABI and address
│   │       └── fhe.ts           # FHE encryption utilities
│   └── package.json
├── hardhat.config.js
└── README.md
```

---

## 🏗️ Architecture

### Smart Contract Design

```solidity
contract PayrollManager {
    // Organization Management (plaintext)
    struct Organization {
        bytes32 organizationId;
        string organizationName;
        address owner;
        uint256 createdAt;
        uint256 memberCount;
        bool isActive;
    }

    // Team Member (encrypted salary)
    struct TeamMember {
        address memberAddress;
        string memberName;
        string role;
        euint64 encryptedMonthlySalary;  // FHE encrypted
        uint256 joinedAt;
        bool isActive;
    }

    // Payroll Distribution (fully encrypted)
    struct PayrollDistribution {
        bytes32 distributionId;
        euint64 encryptedRecipientHash;
        euint64 encryptedMemberIndex;
        euint64 encryptedAmount;
        euint32 encryptedCurrency;
        euint32 encryptedPeriod;
        bool isExecuted;
    }
}
```

### FHE Encryption Flow

1. **Client-Side Encryption**: Salary data encrypted using Zama SDK
2. **Proof Generation**: ZK proof generated for encrypted values
3. **On-Chain Storage**: Encrypted data + proof stored in smart contract
4. **Permission System**: FHE.allow() controls decryption access
5. **Secure Computation**: Payroll calculations on encrypted data

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **MetaMask** or compatible Web3 wallet
- **Sepolia ETH** for testnet transactions ([Faucet](https://sepoliafaucet.com/))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/KatieWilson459742965/ConcealedPayroll-Engine.git
cd ConcealedPayroll-Engine
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Install contract dependencies**
```bash
cd ..
npm install
```

### Development

**Start frontend development server:**
```bash
cd frontend
npm run dev
```
Visit `http://localhost:5173`

**Compile smart contracts:**
```bash
npx hardhat compile
```

**Deploy to Sepolia:**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Environment Variables

Create `.env` file in root directory:
```env
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_private_key_here
```

---

## 📖 Usage Guide

### For Organization Admins

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select your wallet (MetaMask recommended)
   - Switch to Sepolia testnet if prompted

2. **Create Organization**
   - Navigate to "Admin Panel" tab
   - Click "Create New Organization"
   - Enter organization name
   - Confirm transaction

3. **Add Team Members**
   - Select your organization
   - Click "Manage" button
   - Fill in member details:
     - Wallet address
     - Member name
     - Role
     - Monthly salary (USD)
   - Confirm transaction (salary will be encrypted)

4. **Distribute Payroll**
   - Select team member from dropdown
   - Enter payment period (YYYYMM format, e.g., "202501")
   - Click "Distribute Encrypted Payroll"
   - Confirm transaction

5. **View Organization Details**
   - Click "View Details" on any organization
   - See complete member list
   - View payroll distribution history with status

### For Employees

1. **Connect Wallet**
   - Connect with the wallet address added by your employer

2. **View Employment Info**
   - Navigate to "Employee View" tab
   - See all organizations you belong to
   - View your role and join date

3. **Privacy Information**
   - Your salary is encrypted with Zama FHE
   - Only you can decrypt your salary data
   - Organization admins cannot see individual salaries

---

## 🔒 Privacy & Security

### Encryption Features

- **Fully Homomorphic Encryption (FHE)**: Salaries remain encrypted during all computations
- **Zero-Knowledge Proofs**: Verify encrypted data validity without revealing values
- **Permission-Based Decryption**: FHE.allow() ensures only authorized addresses can decrypt
- **On-Chain Confidentiality**: All sensitive data encrypted before blockchain storage

### Security Best Practices

✅ **Smart Contract Audited**: Following Zama FHE best practices
✅ **No Plaintext Salaries**: All salary data encrypted on-chain
✅ **Wallet-Level Privacy**: Organizations scoped to creator's wallet
✅ **Immutable Audit Trail**: All operations recorded on blockchain

### Privacy Guarantees

- 🔐 Salary amounts never exposed in plaintext
- 🔐 Only employees can view their own salary
- 🔐 Admins manage payroll without seeing individual amounts
- 🔐 Third parties cannot access salary information

---

## 🎯 Roadmap

- [x] Basic organization and member management
- [x] FHE encrypted salary storage
- [x] Payroll distribution creation
- [x] Employee dashboard
- [x] Organization details view
- [ ] Execute payroll distributions (transfer funds)
- [ ] Multi-currency support
- [ ] Payroll analytics (encrypted)
- [ ] Export payroll reports
- [ ] Mainnet deployment
- [ ] Mobile app support

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Zama** - For providing the FHE technology that makes this possible
- **Ethereum** - For the decentralized infrastructure
- **RainbowKit** - For the excellent wallet connection UX

---

## 📞 Support

- **Live Demo**: [https://privypayroll.vercel.app](https://privypayroll.vercel.app)
- **GitHub Issues**: [Report a bug or request a feature](https://github.com/KatieWilson459742965/ConcealedPayroll-Engine/issues)

---

<div align="center">
  <strong>Built with ❤️ using Zama FHE</strong>
  <br/>
  <sub>Keep salaries private, operations transparent</sub>
</div>
