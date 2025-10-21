// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, euint64, euint128, externalEuint32, externalEuint64, externalEuint128} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title PayrollManager
 * @notice Privacy-preserving payroll management system with FHE encryption
 * @dev Separated concerns: Organization management (plaintext) + Payroll distribution (encrypted)
 */
contract PayrollManager is SepoliaConfig {

    // ============ Structs ============

    /**
     * @dev Organization structure (stored in plaintext)
     */
    struct Organization {
        bytes32 organizationId;
        string organizationName;
        address owner;
        uint256 createdAt;
        uint256 memberCount;
        bool isActive;
    }

    /**
     * @dev Team member structure (metadata in plaintext, salary encrypted)
     */
    struct TeamMember {
        address memberAddress;
        string memberName;
        string role;
        bytes32 organizationId;
        euint64 encryptedMonthlySalary;  // Monthly salary in USD cents (encrypted)
        uint256 joinedAt;
        bool isActive;
    }

    /**
     * @dev Payroll distribution record (encrypted sensitive data)
     */
    struct PayrollDistribution {
        bytes32 distributionId;
        bytes32 organizationId;

        // Encrypted recipient information
        euint64 encryptedRecipientHash;      // Hash of recipient address (for privacy)
        euint64 encryptedMemberIndex;        // Member index in organization

        // Encrypted payment details
        euint64 encryptedAmount;             // Payment amount in USD cents (max ~$184 quadrillion)
        euint32 encryptedCurrency;           // Currency code (e.g., 1=USD, 2=EUR)
        euint32 encryptedPeriod;             // Payment period (YYYYMM format)

        // Metadata (plaintext for operational needs)
        address initiator;
        uint256 createdAt;
        uint256 executedAt;
        bool isExecuted;
        bool isCancelled;
    }

    // ============ Storage ============

    // Organization mappings
    mapping(bytes32 => Organization) public organizations;
    mapping(address => bytes32[]) public ownerOrganizations;
    bytes32[] public allOrganizations;

    // Team member mappings
    mapping(bytes32 => mapping(address => TeamMember)) public organizationMembers;
    mapping(bytes32 => address[]) public organizationMemberList;
    mapping(address => bytes32[]) public memberOrganizations;

    // Payroll distribution mappings
    mapping(bytes32 => PayrollDistribution) public distributions;
    mapping(bytes32 => bytes32[]) public organizationDistributions;
    mapping(address => bytes32[]) public initiatorDistributions;
    bytes32[] public allDistributions;

    // Statistics
    uint256 public organizationCount;
    uint256 public totalMemberCount;
    uint256 public distributionCount;

    // ============ Events ============

    event OrganizationCreated(
        bytes32 indexed organizationId,
        string organizationName,
        address indexed owner,
        uint256 timestamp
    );

    event MemberAdded(
        bytes32 indexed organizationId,
        address indexed memberAddress,
        string memberName,
        string role,
        uint256 timestamp
    );

    event MemberRemoved(
        bytes32 indexed organizationId,
        address indexed memberAddress,
        uint256 timestamp
    );

    event PayrollDistributionCreated(
        bytes32 indexed distributionId,
        bytes32 indexed organizationId,
        address indexed initiator,
        uint256 timestamp
    );

    event PayrollDistributionExecuted(
        bytes32 indexed distributionId,
        bytes32 indexed organizationId,
        uint256 timestamp
    );

    event PayrollDistributionCancelled(
        bytes32 indexed distributionId,
        bytes32 indexed organizationId,
        uint256 timestamp
    );

    // ============ Errors ============

    error OrganizationNotFound();
    error OrganizationAlreadyExists();
    error Unauthorized();
    error MemberNotFound();
    error MemberAlreadyExists();
    error DistributionNotFound();
    error DistributionAlreadyExecuted();
    error InvalidParameters();

    // ============ Modifiers ============

    modifier onlyOrganizationOwner(bytes32 organizationId) {
        if (organizations[organizationId].owner != msg.sender) {
            revert Unauthorized();
        }
        _;
    }

    modifier organizationExists(bytes32 organizationId) {
        if (!organizations[organizationId].isActive) {
            revert OrganizationNotFound();
        }
        _;
    }

    // ============ Organization Management Functions ============

    /**
     * @notice Create a new organization
     * @param organizationId Unique identifier for the organization
     * @param organizationName Name of the organization
     */
    function createOrganization(
        bytes32 organizationId,
        string calldata organizationName
    ) external {
        if (organizations[organizationId].createdAt != 0) {
            revert OrganizationAlreadyExists();
        }

        if (bytes(organizationName).length == 0) {
            revert InvalidParameters();
        }

        organizations[organizationId] = Organization({
            organizationId: organizationId,
            organizationName: organizationName,
            owner: msg.sender,
            createdAt: block.timestamp,
            memberCount: 0,
            isActive: true
        });

        ownerOrganizations[msg.sender].push(organizationId);
        allOrganizations.push(organizationId);
        organizationCount++;

        emit OrganizationCreated(
            organizationId,
            organizationName,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Add a team member to an organization with encrypted monthly salary
     * @param organizationId ID of the organization
     * @param memberAddress Wallet address of the member
     * @param memberName Name of the member
     * @param role Role/position of the member
     * @param encryptedMonthlySalary Encrypted monthly salary in USD cents
     * @param inputProof Proof for the encrypted salary
     */
    function addTeamMember(
        bytes32 organizationId,
        address memberAddress,
        string calldata memberName,
        string calldata role,
        externalEuint64 encryptedMonthlySalary,
        bytes calldata inputProof
    )
        external
        organizationExists(organizationId)
        onlyOrganizationOwner(organizationId)
    {
        if (memberAddress == address(0)) {
            revert InvalidParameters();
        }

        if (organizationMembers[organizationId][memberAddress].joinedAt != 0) {
            revert MemberAlreadyExists();
        }

        // Import encrypted salary
        euint64 monthlySalary = FHE.fromExternal(encryptedMonthlySalary, inputProof);
        FHE.allowThis(monthlySalary);
        FHE.allow(monthlySalary, msg.sender);
        FHE.allow(monthlySalary, memberAddress);  // Allow member to view their own salary

        organizationMembers[organizationId][memberAddress] = TeamMember({
            memberAddress: memberAddress,
            memberName: memberName,
            role: role,
            organizationId: organizationId,
            encryptedMonthlySalary: monthlySalary,
            joinedAt: block.timestamp,
            isActive: true
        });

        organizationMemberList[organizationId].push(memberAddress);
        memberOrganizations[memberAddress].push(organizationId);

        organizations[organizationId].memberCount++;
        totalMemberCount++;

        emit MemberAdded(
            organizationId,
            memberAddress,
            memberName,
            role,
            block.timestamp
        );
    }

    /**
     * @notice Remove a team member from an organization
     * @param organizationId ID of the organization
     * @param memberAddress Wallet address of the member to remove
     */
    function removeTeamMember(
        bytes32 organizationId,
        address memberAddress
    )
        external
        organizationExists(organizationId)
        onlyOrganizationOwner(organizationId)
    {
        TeamMember storage member = organizationMembers[organizationId][memberAddress];

        if (!member.isActive) {
            revert MemberNotFound();
        }

        member.isActive = false;
        organizations[organizationId].memberCount--;
        totalMemberCount--;

        emit MemberRemoved(organizationId, memberAddress, block.timestamp);
    }

    // ============ Payroll Distribution Functions ============

    /**
     * @notice Create an encrypted payroll distribution (salary read from member record)
     * @param distributionId Unique identifier for this distribution
     * @param organizationId ID of the organization
     * @param memberAddress Address of the member receiving payment
     * @param encryptedPeriod Encrypted payment period (YYYYMM format)
     * @param inputProof Proof for the encrypted period
     */
    function createPayrollDistribution(
        bytes32 distributionId,
        bytes32 organizationId,
        address memberAddress,
        externalEuint32 encryptedPeriod,
        bytes calldata inputProof
    )
        external
        organizationExists(organizationId)
        onlyOrganizationOwner(organizationId)
    {
        if (distributions[distributionId].createdAt != 0) {
            revert InvalidParameters();
        }

        // Verify member exists and is active
        TeamMember storage member = organizationMembers[organizationId][memberAddress];
        if (!member.isActive) {
            revert MemberNotFound();
        }

        // Import encrypted period
        euint32 period = FHE.fromExternal(encryptedPeriod, inputProof);
        FHE.allowThis(period);
        FHE.allow(period, msg.sender);

        // Get member's monthly salary from their record
        euint64 monthlySalary = member.encryptedMonthlySalary;

        // Create recipient hash for privacy
        euint64 recipientHash = FHE.asEuint64(uint64(uint160(memberAddress) % type(uint64).max));
        FHE.allowThis(recipientHash);
        FHE.allow(recipientHash, msg.sender);

        // Find member index
        address[] memory memberList = organizationMemberList[organizationId];
        uint64 memberIdx = 0;
        for (uint64 i = 0; i < memberList.length; i++) {
            if (memberList[i] == memberAddress) {
                memberIdx = i;
                break;
            }
        }
        euint64 memberIndex = FHE.asEuint64(memberIdx);
        FHE.allowThis(memberIndex);
        FHE.allow(memberIndex, msg.sender);

        // Currency is always USD (code 1)
        euint32 currency = FHE.asEuint32(1);
        FHE.allowThis(currency);
        FHE.allow(currency, msg.sender);

        // Create distribution record
        distributions[distributionId] = PayrollDistribution({
            distributionId: distributionId,
            organizationId: organizationId,
            encryptedRecipientHash: recipientHash,
            encryptedMemberIndex: memberIndex,
            encryptedAmount: monthlySalary,  // Use member's pre-configured monthly salary
            encryptedCurrency: currency,
            encryptedPeriod: period,
            initiator: msg.sender,
            createdAt: block.timestamp,
            executedAt: 0,
            isExecuted: false,
            isCancelled: false
        });

        organizationDistributions[organizationId].push(distributionId);
        initiatorDistributions[msg.sender].push(distributionId);
        allDistributions.push(distributionId);
        distributionCount++;

        emit PayrollDistributionCreated(
            distributionId,
            organizationId,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Execute a payroll distribution (mark as executed)
     * @param distributionId ID of the distribution to execute
     */
    function executePayrollDistribution(bytes32 distributionId)
        external
    {
        PayrollDistribution storage distribution = distributions[distributionId];

        if (distribution.createdAt == 0) {
            revert DistributionNotFound();
        }

        if (distribution.isExecuted || distribution.isCancelled) {
            revert DistributionAlreadyExecuted();
        }

        Organization storage org = organizations[distribution.organizationId];
        if (org.owner != msg.sender) {
            revert Unauthorized();
        }

        distribution.isExecuted = true;
        distribution.executedAt = block.timestamp;

        emit PayrollDistributionExecuted(
            distributionId,
            distribution.organizationId,
            block.timestamp
        );
    }

    /**
     * @notice Cancel a payroll distribution
     * @param distributionId ID of the distribution to cancel
     */
    function cancelPayrollDistribution(bytes32 distributionId)
        external
    {
        PayrollDistribution storage distribution = distributions[distributionId];

        if (distribution.createdAt == 0) {
            revert DistributionNotFound();
        }

        if (distribution.isExecuted || distribution.isCancelled) {
            revert DistributionAlreadyExecuted();
        }

        Organization storage org = organizations[distribution.organizationId];
        if (org.owner != msg.sender) {
            revert Unauthorized();
        }

        distribution.isCancelled = true;

        emit PayrollDistributionCancelled(
            distributionId,
            distribution.organizationId,
            block.timestamp
        );
    }

    // ============ View Functions ============

    /**
     * @notice Get organization details
     */
    function getOrganization(bytes32 organizationId)
        external
        view
        returns (
            string memory organizationName,
            address owner,
            uint256 createdAt,
            uint256 memberCount,
            bool isActive
        )
    {
        Organization storage org = organizations[organizationId];
        return (
            org.organizationName,
            org.owner,
            org.createdAt,
            org.memberCount,
            org.isActive
        );
    }

    /**
     * @notice Get team member details
     */
    function getTeamMember(bytes32 organizationId, address memberAddress)
        external
        view
        returns (
            string memory memberName,
            string memory role,
            uint256 joinedAt,
            bool isActive
        )
    {
        TeamMember storage member = organizationMembers[organizationId][memberAddress];
        return (
            member.memberName,
            member.role,
            member.joinedAt,
            member.isActive
        );
    }

    /**
     * @notice Get distribution public details
     */
    function getDistribution(bytes32 distributionId)
        external
        view
        returns (
            bytes32 organizationId,
            address initiator,
            uint256 createdAt,
            uint256 executedAt,
            bool isExecuted,
            bool isCancelled
        )
    {
        PayrollDistribution storage dist = distributions[distributionId];
        return (
            dist.organizationId,
            dist.initiator,
            dist.createdAt,
            dist.executedAt,
            dist.isExecuted,
            dist.isCancelled
        );
    }

    /**
     * @notice Get encrypted distribution data (only for authorized users)
     */
    function getEncryptedDistributionData(bytes32 distributionId)
        external
        view
        returns (
            euint64 encryptedRecipientHash,
            euint64 encryptedMemberIndex,
            euint64 encryptedAmount,
            euint32 encryptedCurrency,
            euint32 encryptedPeriod
        )
    {
        PayrollDistribution storage dist = distributions[distributionId];
        Organization storage org = organizations[dist.organizationId];

        // Only organization owner can access encrypted data
        if (org.owner != msg.sender) {
            revert Unauthorized();
        }

        return (
            dist.encryptedRecipientHash,
            dist.encryptedMemberIndex,
            dist.encryptedAmount,
            dist.encryptedCurrency,
            dist.encryptedPeriod
        );
    }

    /**
     * @notice Get all organizations owned by an address
     */
    function getOwnerOrganizations(address owner)
        external
        view
        returns (bytes32[] memory)
    {
        return ownerOrganizations[owner];
    }

    /**
     * @notice Get all members of an organization
     */
    function getOrganizationMembers(bytes32 organizationId)
        external
        view
        returns (address[] memory)
    {
        return organizationMemberList[organizationId];
    }

    /**
     * @notice Get all distributions for an organization
     */
    function getOrganizationDistributions(bytes32 organizationId)
        external
        view
        returns (bytes32[] memory)
    {
        return organizationDistributions[organizationId];
    }

    /**
     * @notice Get organizations where address is a member
     */
    function getMemberOrganizations(address member)
        external
        view
        returns (bytes32[] memory)
    {
        return memberOrganizations[member];
    }
}
