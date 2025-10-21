export const PAYROLL_MANAGER_ABI = [
  {
    "inputs": [],
    "name": "DistributionAlreadyExecuted",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DistributionNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidParameters",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MemberAlreadyExists",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MemberNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OrganizationAlreadyExists",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OrganizationNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Unauthorized",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "organizationId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "memberAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "memberName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "role",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "MemberAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "organizationId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "memberAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "MemberRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "organizationId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "organizationName",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "OrganizationCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "distributionId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "organizationId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "PayrollDistributionCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "distributionId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "organizationId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "initiator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "PayrollDistributionCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "distributionId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "organizationId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "PayrollDistributionExecuted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "organizationId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "memberAddress",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "memberName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "role",
        "type": "string"
      },
      {
        "internalType": "externalEuint64",
        "name": "encryptedMonthlySalary",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "addTeamMember",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "allDistributions",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "allOrganizations",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "distributionId",
        "type": "bytes32"
      }
    ],
    "name": "cancelPayrollDistribution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "organizationId",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "organizationName",
        "type": "string"
      }
    ],
    "name": "createOrganization",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "distributionId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "organizationId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "memberAddress",
        "type": "address"
      },
      {
        "internalType": "externalEuint32",
        "name": "encryptedPeriod",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "createPayrollDistribution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "distributionCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "distributions",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "distributionId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "organizationId",
        "type": "bytes32"
      },
      {
        "internalType": "euint64",
        "name": "encryptedRecipientHash",
        "type": "bytes32"
      },
      {
        "internalType": "euint64",
        "name": "encryptedMemberIndex",
        "type": "bytes32"
      },
      {
        "internalType": "euint64",
        "name": "encryptedAmount",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "encryptedCurrency",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "encryptedPeriod",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "initiator",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "executedAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isExecuted",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isCancelled",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "distributionId",
        "type": "bytes32"
      }
    ],
    "name": "executePayrollDistribution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "distributionId",
        "type": "bytes32"
      }
    ],
    "name": "getDistribution",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "organizationId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "initiator",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "executedAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isExecuted",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isCancelled",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "distributionId",
        "type": "bytes32"
      }
    ],
    "name": "getEncryptedDistributionData",
    "outputs": [
      {
        "internalType": "euint64",
        "name": "encryptedRecipientHash",
        "type": "bytes32"
      },
      {
        "internalType": "euint64",
        "name": "encryptedMemberIndex",
        "type": "bytes32"
      },
      {
        "internalType": "euint64",
        "name": "encryptedAmount",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "encryptedCurrency",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "encryptedPeriod",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "member",
        "type": "address"
      }
    ],
    "name": "getMemberOrganizations",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "organizationId",
        "type": "bytes32"
      }
    ],
    "name": "getOrganization",
    "outputs": [
      {
        "internalType": "string",
        "name": "organizationName",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "memberCount",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "organizationId",
        "type": "bytes32"
      }
    ],
    "name": "getOrganizationDistributions",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "organizationId",
        "type": "bytes32"
      }
    ],
    "name": "getOrganizationMembers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "getOwnerOrganizations",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "organizationId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "memberAddress",
        "type": "address"
      }
    ],
    "name": "getTeamMember",
    "outputs": [
      {
        "internalType": "string",
        "name": "memberName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "role",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "joinedAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "initiatorDistributions",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "memberOrganizations",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "organizationCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "organizationDistributions",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "organizationMemberList",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "organizationMembers",
    "outputs": [
      {
        "internalType": "address",
        "name": "memberAddress",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "memberName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "role",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "organizationId",
        "type": "bytes32"
      },
      {
        "internalType": "euint64",
        "name": "encryptedMonthlySalary",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "joinedAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "organizations",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "organizationId",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "organizationName",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "memberCount",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "ownerOrganizations",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "protocolId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "organizationId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "memberAddress",
        "type": "address"
      }
    ],
    "name": "removeTeamMember",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalMemberCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Deployed on Sepolia testnet
export const CONTRACT_ADDRESS = "0x8bED9E5B708774c095C523d40dd0c87e6F8BDE88";
