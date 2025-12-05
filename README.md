# PrivyPayroll

<div align="center">

**Privacy-Preserving Payroll Management System with Fully Homomorphic Encryption**

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://privypayroll.vercel.app)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![fhEVM](https://img.shields.io/badge/fhEVM-0.9.1-blueviolet)](https://docs.zama.ai/fhevm)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[Live Demo](https://privypayroll.vercel.app) | [Demo Video](https://youtu.be/-OOeq5GRTk0) | [Documentation](#architecture)

</div>

---

## Overview

**PrivyPayroll** is an enterprise-grade payroll management platform that leverages Zama's Fully Homomorphic Encryption (fhEVM) to enable confidential salary processing on Ethereum. The system allows organizations to manage employee compensation while keeping salary data encrypted throughout the entire lifecycle - from storage to computation.

### Key Privacy Guarantees

| Data Type | Encryption | Access Control |
|-----------|------------|----------------|
| Monthly Salary | `euint64` FHE | Owner + Employee |
| Payment Amount | `euint64` FHE | Owner only |
| Payment Period | `euint32` FHE | Owner only |
| Recipient Hash | `euint64` FHE | Owner only |
| Member Index | `euint64` FHE | Owner only |

---

## Architecture

### System Overview

```
+---------------------------------------------------------------------+
|                         Frontend (React + Vite)                      |
|  +-------------+  +-------------+  +-------------+  +-------------+ |
|  |    Hero     |  | AdminPanel  |  |  Employee   |  |    Org      | |
|  |   Landing   |  |  Dashboard  |  |  Dashboard  |  |  Details    | |
|  +------+------+  +------+------+  +------+------+  +------+------+ |
|         +----------------+----------------+----------------+        |
|                              |                                       |
|  +---------------------------+-----------------------------------+  |
|  |                    usePayroll Hook (ethers.js)                 |  |
|  |  - createOrganization()   - addTeamMember()                    |  |
|  |  - createPayrollDistribution()  - executeDistribution()        |  |
|  +---------------------------+-----------------------------------+  |
|                              |                                       |
|  +---------------------------+-----------------------------------+  |
|  |              FHE SDK (Zama RelayerSDK via CDN)                 |  |
|  |  - initializeFHE()  - encryptSalary()  - encryptUint32()       |  |
|  +---------------------------+-----------------------------------+  |
+---------------------------------+------------------------------------+
                                  | JSON-RPC
+---------------------------------+------------------------------------+
|                    Ethereum Sepolia Network                         |
|  +---------------------------+-----------------------------------+  |
|  |                    PayrollManager.sol                          |  |
|  |  +----------------+  +----------------+  +------------------+ |  |
|  |  |  Organization  |  |   TeamMember   |  |     Payroll      | |  |
|  |  |  Management    |  |  (FHE Salary)  |  |   Distribution   | |  |
|  |  +----------------+  +----------------+  +------------------+ |  |
|  +---------------------------------------------------------------+  |
|                              |                                       |
|  +---------------------------+-----------------------------------+  |
|  |                 Zama fhEVM Coprocessor                         |  |
|  |  - FHE.fromExternal()  - FHE.allow()  - FHE.allowThis()        |  |
|  |  - FHE.asEuint64()     - FHE.asEuint32()                       |  |
|  +---------------------------------------------------------------+  |
+---------------------------------------------------------------------+
```

### Smart Contract Data Model

```solidity
// PayrollManager.sol - Core contract inheriting ZamaEthereumConfig

contract PayrollManager is ZamaEthereumConfig {

    // Organization (plaintext metadata)
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
        bytes32 organizationId;
        euint64 encryptedMonthlySalary;  // FHE encrypted (USD cents)
        uint256 joinedAt;
        bool isActive;
    }

    // Payroll Distribution (fully encrypted payment data)
    struct PayrollDistribution {
        bytes32 distributionId;
        bytes32 organizationId;
        euint64 encryptedRecipientHash;   // Privacy: hashed recipient
        euint64 encryptedMemberIndex;     // Privacy: member position
        euint64 encryptedAmount;          // Privacy: payment amount
        euint32 encryptedCurrency;        // Privacy: currency code
        euint32 encryptedPeriod;          // Privacy: payment period
        address initiator;
        uint256 createdAt;
        uint256 executedAt;
        bool isExecuted;
        bool isCancelled;
    }
}
```

### FHE Encryption Flow

```
+------------------------------------------------------------------+
|                    Client-Side Encryption                         |
|                                                                   |
|  1. Load FHE SDK via CDN                                         |
|     await RelayerSDK.init()                                       |
|                                                                   |
|  2. Create encrypted input for salary                            |
|     const input = fhevm.createEncryptedInput(contract, user)     |
|     input.add64(salaryInCents)                                   |
|     const { handle, inputProof } = await input.encrypt()         |
|                                                                   |
|  3. Submit to contract with proof                                |
|     contract.addTeamMember(..., handle, inputProof)              |
+-------------------------------+----------------------------------+
                                |
                                v
+------------------------------------------------------------------+
|                    On-Chain Processing                            |
|                                                                   |
|  1. Import encrypted value                                       |
|     euint64 salary = FHE.fromExternal(encryptedSalary, proof)   |
|                                                                   |
|  2. Set access permissions                                       |
|     FHE.allowThis(salary)           // Contract can use          |
|     FHE.allow(salary, owner)        // Owner can decrypt         |
|     FHE.allow(salary, member)       // Member can decrypt        |
|                                                                   |
|  3. Store encrypted value                                        |
|     member.encryptedMonthlySalary = salary                       |
+------------------------------------------------------------------+
```

---

## Technology Stack

### Smart Contracts

| Package | Version | Purpose |
|---------|---------|---------|
| `@fhevm/solidity` | 0.9.1 | FHE types and operations |
| `@fhevm/hardhat-plugin` | 0.3.0-1 | Hardhat integration for fhEVM |
| `hardhat` | 2.22.x | Development framework |
| `@nomicfoundation/hardhat-toolbox` | 5.0.x | Testing and utilities |
| `@nomicfoundation/hardhat-verify` | 2.0.x | Contract verification |

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 18.3.x | UI framework |
| `vite` | 5.4.x | Build tool |
| `typescript` | 5.8.x | Type safety |
| `wagmi` | 2.18.x | Web3 React hooks |
| `viem` | 2.38.x | Ethereum client |
| `@rainbow-me/rainbowkit` | 2.2.x | Wallet connection |
| `ethers` | 6.15.x | Contract interaction |
| `tailwindcss` | 3.4.x | Styling |
| `sonner` | 1.7.x | Toast notifications |

### FHE SDK

The frontend loads the Zama FHE SDK dynamically via CDN:

```typescript
// lib/fhe.ts
const RELAYER_SDK_URL = 'https://cdn.zama.ai/fhevmjs/v0.6.4/fhevmjs-browser.umd.cjs';

export async function initializeFHE() {
  const fhevm = (window as any).fhevm;
  await fhevm.initFhevm({ gatewayUrl: "https://gateway.sepolia.zama.ai" });
}

export async function encryptSalary(amount: bigint, contract: string, user: string) {
  const input = fhevm.createEncryptedInput(contract, user);
  input.add64(amount);
  const encrypted = await input.encrypt();
  return { handle: encrypted.handles[0], proof: encrypted.inputProof };
}
```

---

## Project Structure

```
PrivyPayroll/
├── contracts/
│   └── PayrollManager.sol          # Main FHE payroll contract
├── scripts/
│   ├── deploy.js                   # Contract deployment
│   └── create-organization.js      # Helper script
├── tests/
│   ├── PayrollManager.test.js      # Basic functionality tests
│   ├── Organization.test.js        # Organization management tests
│   ├── TeamMember.test.js          # FHE salary encryption tests
│   └── PayrollDistribution.test.js # Distribution workflow tests
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero.tsx            # Landing page
│   │   │   ├── Navigation.tsx      # Main navigation
│   │   │   ├── AdminPanel.tsx      # Organization management
│   │   │   ├── EmployeeDashboard.tsx
│   │   │   ├── OrganizationDetails.tsx
│   │   │   └── HowItWorks.tsx      # FHE explanation page
│   │   ├── hooks/
│   │   │   └── usePayroll.tsx      # Contract interaction hook
│   │   ├── lib/
│   │   │   ├── contractABI.ts      # Contract ABI and address
│   │   │   ├── fhe.ts              # FHE encryption utilities
│   │   │   └── toast-utils.tsx     # Transaction notifications
│   │   └── pages/
│   │       └── Index.tsx           # Main page with tabs
│   └── package.json
├── artifacts/                       # Compiled contracts
├── hardhat.config.js
├── package.json
└── README.md
```

---

## Installation

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 or **yarn** >= 1.22.0
- **MetaMask** or compatible Web3 wallet
- **Sepolia ETH** for gas ([Faucet](https://sepoliafaucet.com/))

### Quick Start

```bash
# Clone repository
git clone https://github.com/KatieWilson459742965/ConcealedPayroll-Engine.git
cd ConcealedPayroll-Engine

# Install contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev
```

### Environment Configuration

Create `.env` file in the root directory:

```env
# Required for deployment
PRIVATE_KEY=0x_your_private_key_here
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Optional for verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

---

## Testing

### Test Structure

The project includes comprehensive unit tests covering all FHE operations:

```
tests/
├── PayrollManager.test.js      # 15 test cases
│   ├── Contract deployment
│   ├── Initial statistics verification
│   ├── Organization CRUD operations
│   └── Member management basics
│
├── Organization.test.js        # 12 test cases
│   ├── Organization creation with events
│   ├── Validation (empty name, duplicates)
│   ├── Multi-user organization tracking
│   └── Unicode and special character handling
│
├── TeamMember.test.js          # 18 test cases
│   ├── FHE.fromExternal() salary encryption
│   ├── Salary range testing (euint64)
│   ├── Invalid proof rejection
│   ├── Access control verification
│   └── Member lifecycle management
│
└── PayrollDistribution.test.js # 22 test cases
    ├── Distribution creation with encrypted period
    ├── Automatic salary retrieval
    ├── Execute/cancel workflows
    ├── Access control (owner-only)
    └── Complex multi-member payroll cycles
```

### Running Tests

```bash
# Compile contracts first
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" npx hardhat compile

# Run all tests (requires fhEVM mock environment)
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" npx hardhat test

# Run specific test file
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" npx hardhat test tests/TeamMember.test.js

# Run with verbose output
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" npx hardhat test --verbose
```

### Test Coverage

| Component | Tests | FHE Operations Covered |
|-----------|-------|------------------------|
| PayrollManager | 15 | Basic CRUD |
| Organization | 12 | Event emissions, validation |
| TeamMember | 18 | `FHE.fromExternal()`, `FHE.allow()`, `FHE.allowThis()` |
| PayrollDistribution | 22 | Full FHE workflow, access control |

---

## Deployment

### Deploy to Sepolia

```bash
# Compile contracts
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" npx hardhat compile

# Deploy PayrollManager
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" npx hardhat run scripts/deploy.js --network sepolia
```

### Current Deployment

| Contract | Address | Network |
|----------|---------|---------|
| PayrollManager | `0xd13Af84D1399e22aBe6258E31AC3dD4b33f8D618` | Sepolia |

### Frontend Deployment

The frontend is deployed on Vercel:

```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```

**Live URL**: https://privypayroll.vercel.app

---

## API Reference

### Contract Functions

#### Organization Management

```solidity
// Create a new organization
function createOrganization(
    bytes32 organizationId,
    string calldata organizationName
) external;

// Get organization details
function getOrganization(bytes32 organizationId) external view returns (
    string memory organizationName,
    address owner,
    uint256 createdAt,
    uint256 memberCount,
    bool isActive
);

// Get organizations owned by address
function getOwnerOrganizations(address owner) external view returns (bytes32[] memory);
```

#### Team Member Management

```solidity
// Add team member with encrypted salary
function addTeamMember(
    bytes32 organizationId,
    address memberAddress,
    string calldata memberName,
    string calldata role,
    externalEuint64 encryptedMonthlySalary,  // FHE encrypted
    bytes calldata inputProof
) external;

// Remove team member
function removeTeamMember(
    bytes32 organizationId,
    address memberAddress
) external;

// Get team member details
function getTeamMember(bytes32 organizationId, address memberAddress) external view returns (
    string memory memberName,
    string memory role,
    uint256 joinedAt,
    bool isActive
);
```

#### Payroll Distribution

```solidity
// Create payroll distribution (uses member's pre-configured salary)
function createPayrollDistribution(
    bytes32 distributionId,
    bytes32 organizationId,
    address memberAddress,
    externalEuint32 encryptedPeriod,  // YYYYMM format, FHE encrypted
    bytes calldata inputProof
) external;

// Execute distribution
function executePayrollDistribution(bytes32 distributionId) external;

// Cancel distribution
function cancelPayrollDistribution(bytes32 distributionId) external;

// Get distribution details
function getDistribution(bytes32 distributionId) external view returns (
    bytes32 organizationId,
    address initiator,
    uint256 createdAt,
    uint256 executedAt,
    bool isExecuted,
    bool isCancelled
);
```

### Frontend Hook

```typescript
import { usePayroll } from '@/hooks/usePayroll';

const {
  loading,
  createOrganization,      // (name: string) => Promise<bytes32>
  addTeamMember,           // (orgId, address, name, role, salary) => Promise<void>
  createPayrollDistribution, // (orgId, memberAddr, period) => Promise<bytes32>
  executeDistribution,     // (distId: string) => Promise<void>
  getMyOrganizations,      // () => Promise<bytes32[]>
  getOrganizationMembers,  // (orgId: string) => Promise<address[]>
  getTeamMember,           // (orgId, memberAddr) => Promise<TeamMember>
  getMemberOrganizations,  // () => Promise<bytes32[]>
  getOrganizationDistributions, // (orgId: string) => Promise<bytes32[]>
  getDistribution,         // (distId: string) => Promise<Distribution>
} = usePayroll();
```

---

## Security Considerations

### FHE Security Model

1. **Client-side encryption**: All sensitive data encrypted before leaving the user's browser
2. **Proof verification**: `FHE.fromExternal()` verifies ZK proofs on-chain
3. **Access control**: `FHE.allow()` and `FHE.allowThis()` manage decryption permissions
4. **No plaintext exposure**: Salaries never exist in plaintext on-chain

### Access Control Matrix

| Operation | Organization Owner | Team Member | Others |
|-----------|-------------------|-------------|--------|
| Create Organization | Yes | No | No |
| Add Team Member | Yes | No | No |
| Remove Team Member | Yes | No | No |
| Create Distribution | Yes | No | No |
| Execute Distribution | Yes | No | No |
| View Own Salary | Yes | Yes | No |
| View Distribution Data | Yes | No | No |

### Known Limitations

- **Gas costs**: FHE operations are more expensive than plaintext
- **Testnet only**: Currently deployed on Sepolia testnet
- **No fund transfers**: Distribution marks payment as executed but doesn't transfer ETH/tokens

---

## Roadmap

- [x] Organization and member management
- [x] FHE encrypted salary storage (euint64)
- [x] Encrypted payroll distributions
- [x] Employee dashboard
- [x] Payroll history with Etherscan links
- [x] Unit test suite (67 test cases)
- [ ] Actual fund transfers on execution
- [ ] Multi-currency support
- [ ] Encrypted payroll analytics
- [ ] Gateway decryption for authorized viewers
- [ ] Mainnet deployment

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npx hardhat test`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Resources

- [Zama fhEVM Documentation](https://docs.zama.ai/fhevm)
- [fhEVM Solidity API](https://docs.zama.ai/fhevm/references/functions)
- [Hardhat Documentation](https://hardhat.org/docs)
- [wagmi Documentation](https://wagmi.sh)

---

<div align="center">

**Built with Zama FHE Technology**

*Confidential Payroll Processing on Ethereum*

</div>
