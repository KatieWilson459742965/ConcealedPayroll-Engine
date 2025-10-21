// Contract ABI for PayrollManager
export const PAYROLL_MANAGER_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "organizationId", "type": "bytes32" },
      { "internalType": "string", "name": "organizationName", "type": "string" }
    ],
    "name": "createOrganization",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "organizationId", "type": "bytes32" },
      { "internalType": "address", "name": "memberAddress", "type": "address" },
      { "internalType": "string", "name": "memberName", "type": "string" },
      { "internalType": "string", "name": "role", "type": "string" }
    ],
    "name": "addTeamMember",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "organizationId", "type": "bytes32" },
      { "internalType": "address", "name": "memberAddress", "type": "address" }
    ],
    "name": "removeTeamMember",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "distributionId", "type": "bytes32" },
      { "internalType": "bytes32", "name": "organizationId", "type": "bytes32" },
      { "internalType": "bytes32", "name": "encryptedRecipientHash", "type": "bytes32" },
      { "internalType": "bytes32", "name": "encryptedMemberIndex", "type": "bytes32" },
      { "internalType": "bytes32", "name": "encryptedAmount", "type": "bytes32" },
      { "internalType": "bytes32", "name": "encryptedCurrency", "type": "bytes32" },
      { "internalType": "bytes32", "name": "encryptedPeriod", "type": "bytes32" },
      { "internalType": "bytes", "name": "inputProof", "type": "bytes" }
    ],
    "name": "createPayrollDistribution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "distributionId", "type": "bytes32" }
    ],
    "name": "executePayrollDistribution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "distributionId", "type": "bytes32" }
    ],
    "name": "cancelPayrollDistribution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "organizationId", "type": "bytes32" }
    ],
    "name": "getOrganization",
    "outputs": [
      { "internalType": "string", "name": "organizationName", "type": "string" },
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
      { "internalType": "uint256", "name": "memberCount", "type": "uint256" },
      { "internalType": "bool", "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "organizationId", "type": "bytes32" },
      { "internalType": "address", "name": "memberAddress", "type": "address" }
    ],
    "name": "getTeamMember",
    "outputs": [
      { "internalType": "string", "name": "memberName", "type": "string" },
      { "internalType": "string", "name": "role", "type": "string" },
      { "internalType": "uint256", "name": "joinedAt", "type": "uint256" },
      { "internalType": "bool", "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" }
    ],
    "name": "getOwnerOrganizations",
    "outputs": [
      { "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "organizationId", "type": "bytes32" }
    ],
    "name": "getOrganizationMembers",
    "outputs": [
      { "internalType": "address[]", "name": "", "type": "address[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "organizationId", "type": "bytes32" }
    ],
    "name": "getOrganizationDistributions",
    "outputs": [
      { "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "distributionId", "type": "bytes32" }
    ],
    "name": "getDistribution",
    "outputs": [
      { "internalType": "bytes32", "name": "organizationId", "type": "bytes32" },
      { "internalType": "address", "name": "initiator", "type": "address" },
      { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
      { "internalType": "uint256", "name": "executedAt", "type": "uint256" },
      { "internalType": "bool", "name": "isExecuted", "type": "bool" },
      { "internalType": "bool", "name": "isCancelled", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "organizationId", "type": "bytes32" },
      { "indexed": false, "internalType": "string", "name": "organizationName", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "OrganizationCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "organizationId", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "memberAddress", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "memberName", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "role", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "MemberAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "distributionId", "type": "bytes32" },
      { "indexed": true, "internalType": "bytes32", "name": "organizationId", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "initiator", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "PayrollDistributionCreated",
    "type": "event"
  }
] as const;

// Replace with your deployed contract address
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";
