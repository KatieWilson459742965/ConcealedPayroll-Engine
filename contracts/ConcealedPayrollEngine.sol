// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {FHE, ebool, euint8, euint16, euint32, euint64, euint128, externalEuint8, externalEuint16, externalEuint32, externalEuint64, externalEuint128} from "@fhevm/solidity/lib/FHE.sol";
import {GatewayCaller} from "@fhevm/solidity/gateway/GatewayCaller.sol";

/**
 * @title ConcealedPayrollEngine
 * @notice Deep-improved encrypted payroll management with multi-tier compensation,
 *         performance review, benefit management, tax calculation, payment processing,
 *         and departmental budget tracking
 */
contract ConcealedPayrollEngine is SepoliaConfig, GatewayCaller {

    // ============ Enums ============

    enum PayrollStatus {
        Draft,          // 0: Initial creation
        Submitted,      // 1: Submitted for review
        UnderReview,    // 2: HR reviewing
        Approved,       // 3: Approved for processing
        Scheduled,      // 4: Payment scheduled
        Processing,     // 5: Payment processing
        Paid,           // 6: Payment completed
        Adjusted,       // 7: Adjusted after review
        Rejected        // 8: Rejected
    }

    enum EmploymentLevel {
        Intern,        // 0
        Junior,        // 1
        MidLevel,      // 2
        Senior,        // 3
        Lead,          // 4
        Principal,     // 5
        Executive      // 6
    }

    enum CompensationBand {
        BelowMarket,   // 0: Below market rate
        Entry,         // 1: Entry level band
        Competitive,   // 2: Market competitive
        Premium,       // 3: Above market
        Elite          // 4: Top tier
    }

    enum PerformanceRating {
        Unsatisfactory, // 0
        NeedsImprovement, // 1
        MeetsExpectations, // 2
        ExceedsExpectations, // 3
        Outstanding    // 4
    }

    // ============ Structs ============

    struct Payroll {
        bytes32 payrollId;
        address employee;
        EmploymentLevel employmentLevel;
        PayrollStatus status;

        // Encrypted compensation components
        euint128 baseSalaryCipher;        // Annual base salary
        euint128 bonusCipher;             // Performance bonus
        euint128 stockOptionsCipher;      // Stock options value
        euint128 benefitsCipher;          // Benefits value
        euint128 overtimeCipher;          // Overtime pay
        euint128 commissionCipher;        // Sales commission
        euint128 totalCompensationCipher; // Total comp

        // Encrypted deductions
        euint128 taxWithholdingCipher;    // Tax withholding
        euint128 insuranceCipher;         // Insurance premiums
        euint128 retirementCipher;        // Retirement contributions
        euint128 otherDeductionsCipher;   // Other deductions
        euint128 netPayCipher;            // Net pay after deductions

        // Encrypted performance metrics
        euint16 performanceScoreCipher;   // Performance score (0-10000)
        euint16 tenureMonthsCipher;       // Tenure in months
        euint8 performanceRatingCipher;   // Rating (0-4)
        euint8 warningCountCipher;        // Warning count
        euint8 promotionEligibilityCipher; // Promotion eligibility (0-10)
        euint8 attritionRiskCipher;       // Attrition risk (0-10)

        // Encrypted other metrics
        euint32 departmentCodeCipher;     // Department code
        euint16 gradeLevelCipher;         // Grade level
        euint8 benefitTierCipher;         // Benefit tier (0-5)

        // Revealed values (post-decryption)
        uint8 revealedCompensationBand;
        uint64 revealedMarketPercentile;
        uint64 revealedTotalComp;
        uint64 revealedNetPay;
        uint8 revealedDecisionCode;

        // Timestamps
        uint256 submittedAt;
        uint256 reviewedAt;
        uint256 approvedAt;
        uint256 paidAt;
        uint256 lastAdjustedAt;

        // Metadata
        bool isEvaluated;
        bool isPaid;
        uint256 paymentCycleNumber;
    }

    struct CompensationReview {
        euint64 totalCompensation;
        euint64 netPay;
        euint64 marketPercentile;      // 0-10000 (0-100%)
        euint8 compensationBand;       // 0-4
        euint8 decisionCode;           // 0=reject, 1=adjust, 2=approve
        euint128 adjustedTotalComp;
        euint128 adjustedNetPay;
        bool isComplete;
    }

    struct PaymentRecord {
        bytes32 paymentId;
        bytes32 payrollId;
        euint128 grossAmountCipher;
        euint128 netAmountCipher;
        euint128 taxAmountCipher;
        uint256 paymentCycle;
        uint256 timestamp;
        bool isVerified;
    }

    struct EmployeeProfile {
        address employeeAddress;
        euint128 totalEarnedCipher;
        euint128 totalTaxPaidCipher;
        euint128 totalBenefitsCipher;
        euint64 averagePerformanceCipher;
        euint32 currentSalaryBandCipher;
        uint256 totalPayrolls;
        uint256 paidPayrolls;
        uint256 joinedAt;
        uint256 lastPaymentAt;
        uint256 lastReviewAt;
    }

    struct DepartmentBudget {
        bytes32 departmentId;
        euint32 departmentCode;
        euint128 allocatedBudgetCipher;
        euint128 spentBudgetCipher;
        euint128 remainingBudgetCipher;
        euint64 employeeCountCipher;
        euint64 averageSalaryCipher;
        uint256 fiscalYear;
        uint256 lastUpdateAt;
        bool isActive;
    }

    struct PayrollPolicy {
        uint128 minBaseSalary;
        uint128 maxBaseSalary;
        uint128 minTotalComp;
        uint128 maxBonusPercentage;       // In bps (e.g., 5000 = 50%)
        uint64 minPerformanceScore;
        uint64 marketRateReference;
        uint32 taxRateBps;                // Tax rate in bps
        uint32 insuranceRateBps;          // Insurance rate in bps
        uint32 retirementRateBps;         // Retirement contribution rate in bps
        uint16 minTenureMonths;
        uint8 maxWarnings;
        uint8 minPromotionEligibility;
    }

    struct DecryptedReview {
        uint64 totalCompensation;
        uint64 netPay;
        uint64 marketPercentile;
        uint8 compensationBand;
        uint8 decisionCode;
    }

    // ============ Storage ============

    mapping(bytes32 => Payroll) public payrolls;
    mapping(bytes32 => CompensationReview) private compensationReviews;
    mapping(bytes32 => DecryptedReview) public revealedReviews;
    mapping(uint256 => bytes32) private requestIdToPayroll;
    mapping(address => bytes32[]) public employeePayrolls;
    mapping(address => EmployeeProfile) public employeeProfiles;
    mapping(bytes32 => PaymentRecord[]) public payrollPayments;
    mapping(bytes32 => DepartmentBudget) public departmentBudgets;
    mapping(uint32 => bytes32) public departmentCodeToId;

    PayrollPolicy public policy;

    // Aggregate statistics (encrypted)
    euint128 public totalPayrollExpenseCipher;
    euint128 public totalTaxWithheldCipher;
    euint128 public totalBenefitsCostCipher;
    euint64 public averageBaseSalaryCipher;
    euint64 public averagePerformanceScoreCipher;
    euint32 public companyHeadcountCipher;

    // Counts
    uint256 public payrollCount;
    uint256 public approvedCount;
    uint256 public rejectedCount;
    uint256 public paidCount;
    uint256 public employeeCount;
    uint256 public totalPayments;
    uint256 public currentPaymentCycle;
    uint256 public departmentCount;

    // ============ Roles ============

    address public owner;
    mapping(address => bool) public hrManagers;
    mapping(address => bool) public payrollProcessors;
    mapping(address => bool) public financeControllers;
    mapping(address => bool) public auditors;

    // ============ Events ============

    event PayrollSubmitted(bytes32 indexed payrollId, address indexed employee, EmploymentLevel employmentLevel, uint256 timestamp);
    event PayrollStatusChanged(bytes32 indexed payrollId, PayrollStatus oldStatus, PayrollStatus newStatus, uint256 timestamp);
    event ReviewRequested(bytes32 indexed payrollId, uint256 requestId, uint256 timestamp);
    event ReviewCompleted(bytes32 indexed payrollId, uint64 totalComp, uint8 compensationBand, uint8 decisionCode, uint256 timestamp);
    event PayrollApproved(bytes32 indexed payrollId, address indexed employee, uint256 timestamp);
    event PaymentRecorded(bytes32 indexed paymentId, bytes32 indexed payrollId, uint256 paymentCycle, uint256 timestamp);
    event PayrollPaid(bytes32 indexed payrollId, address indexed employee, uint256 timestamp);
    event DepartmentBudgetCreated(bytes32 indexed departmentId, uint32 departmentCode, uint256 timestamp);
    event DepartmentBudgetUpdated(bytes32 indexed departmentId, uint256 timestamp);
    event PolicyUpdated(uint128 minBaseSalary, uint128 maxBaseSalary, uint256 timestamp);
    event EmployeeProfileUpdated(address indexed employee, uint256 timestamp);
    event RoleGranted(address indexed account, string role, uint256 timestamp);
    event RoleRevoked(address indexed account, string role, uint256 timestamp);

    // ============ Errors ============

    error PayrollNotFound();
    error PayrollAlreadyExists();
    error InvalidStatus();
    error Unauthorized();
    error InsufficientBudget();
    error InvalidPolicy();
    error NotOwner();
    error DepartmentNotFound();

    // ============ Modifiers ============

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyHRManager() {
        if (!hrManagers[msg.sender] && msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyPayrollProcessor() {
        if (!payrollProcessors[msg.sender] && msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyFinanceController() {
        if (!financeControllers[msg.sender] && msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyAuditor() {
        if (!auditors[msg.sender] && msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier payrollExists(bytes32 payrollId) {
        if (payrolls[payrollId].submittedAt == 0) revert PayrollNotFound();
        _;
    }

    // ============ Constructor ============

    constructor() {
        owner = msg.sender;
        hrManagers[msg.sender] = true;
        payrollProcessors[msg.sender] = true;
        financeControllers[msg.sender] = true;
        auditors[msg.sender] = true;

        policy = PayrollPolicy({
            minBaseSalary: 40_000 ether,
            maxBaseSalary: 500_000 ether,
            minTotalComp: 50_000 ether,
            maxBonusPercentage: 10000,      // 100%
            minPerformanceScore: 6000,       // 60%
            marketRateReference: 75_000,
            taxRateBps: 2500,                // 25%
            insuranceRateBps: 500,           // 5%
            retirementRateBps: 600,          // 6%
            minTenureMonths: 6,
            maxWarnings: 2,
            minPromotionEligibility: 6
        });

        // Initialize aggregate statistics
        totalPayrollExpenseCipher = FHE.asEuint128(0);
        totalTaxWithheldCipher = FHE.asEuint128(0);
        totalBenefitsCostCipher = FHE.asEuint128(0);
        averageBaseSalaryCipher = FHE.asEuint64(0);
        averagePerformanceScoreCipher = FHE.asEuint64(0);
        companyHeadcountCipher = FHE.asEuint32(0);

        FHE.allowThis(totalPayrollExpenseCipher);
        FHE.allowThis(totalTaxWithheldCipher);
        FHE.allowThis(totalBenefitsCostCipher);
        FHE.allowThis(averageBaseSalaryCipher);
        FHE.allowThis(averagePerformanceScoreCipher);
        FHE.allowThis(companyHeadcountCipher);

        currentPaymentCycle = 1;
    }

    // ============ Payroll Management Functions ============

    /**
     * @notice Submit a payroll entry
     */
    function submitPayroll(
        bytes32 payrollId,
        EmploymentLevel employmentLevel,
        externalEuint128 encryptedBaseSalary,
        bytes calldata baseSalaryProof,
        externalEuint128 encryptedBonus,
        bytes calldata bonusProof,
        externalEuint128 encryptedStockOptions,
        bytes calldata stockProof,
        externalEuint128 encryptedBenefits,
        bytes calldata benefitsProof,
        externalEuint128 encryptedOvertime,
        bytes calldata overtimeProof,
        externalEuint128 encryptedCommission,
        bytes calldata commissionProof,
        externalEuint16 encryptedPerformanceScore,
        bytes calldata performanceProof,
        externalEuint16 encryptedTenure,
        bytes calldata tenureProof,
        externalEuint8 encryptedPerformanceRating,
        bytes calldata ratingProof,
        externalEuint8 encryptedWarningCount,
        bytes calldata warningProof,
        externalEuint32 encryptedDepartmentCode,
        bytes calldata deptProof,
        externalEuint16 encryptedGradeLevel,
        bytes calldata gradeProof,
        externalEuint8 encryptedBenefitTier,
        bytes calldata tierProof
    ) external {
        if (payrolls[payrollId].submittedAt != 0) revert PayrollAlreadyExists();

        // Convert encrypted inputs
        euint128 baseSalary = FHE.asEuint128(encryptedBaseSalary, baseSalaryProof);
        euint128 bonus = FHE.asEuint128(encryptedBonus, bonusProof);
        euint128 stockOptions = FHE.asEuint128(encryptedStockOptions, stockProof);
        euint128 benefits = FHE.asEuint128(encryptedBenefits, benefitsProof);
        euint128 overtime = FHE.asEuint128(encryptedOvertime, overtimeProof);
        euint128 commission = FHE.asEuint128(encryptedCommission, commissionProof);
        euint16 performanceScore = FHE.asEuint16(encryptedPerformanceScore, performanceProof);
        euint16 tenure = FHE.asEuint16(encryptedTenure, tenureProof);
        euint8 performanceRating = FHE.asEuint8(encryptedPerformanceRating, ratingProof);
        euint8 warningCount = FHE.asEuint8(encryptedWarningCount, warningProof);
        euint32 departmentCode = FHE.asEuint32(encryptedDepartmentCode, deptProof);
        euint16 gradeLevel = FHE.asEuint16(encryptedGradeLevel, gradeProof);
        euint8 benefitTier = FHE.asEuint8(encryptedBenefitTier, tierProof);

        // Set permissions
        FHE.allowThis(baseSalary); FHE.allowThis(bonus); FHE.allowThis(stockOptions);
        FHE.allowThis(benefits); FHE.allowThis(overtime); FHE.allowThis(commission);
        FHE.allowThis(performanceScore); FHE.allowThis(tenure); FHE.allowThis(performanceRating);
        FHE.allowThis(warningCount); FHE.allowThis(departmentCode); FHE.allowThis(gradeLevel);
        FHE.allowThis(benefitTier);

        FHE.allow(baseSalary, msg.sender); FHE.allow(bonus, msg.sender);
        FHE.allow(benefits, msg.sender); FHE.allow(overtime, msg.sender);

        // Calculate total compensation
        euint128 totalComp = FHE.add(baseSalary,
            FHE.add(bonus,
                FHE.add(stockOptions,
                    FHE.add(benefits,
                        FHE.add(overtime, commission)))));
        FHE.allowThis(totalComp);

        // Calculate deductions
        // Tax withholding: totalComp × taxRate
        euint128 taxWithholding = FHE.div(
            FHE.mul(totalComp, FHE.asEuint128(policy.taxRateBps)),
            uint128(10000)
        );

        // Insurance: baseSalary × insuranceRate
        euint128 insurance = FHE.div(
            FHE.mul(baseSalary, FHE.asEuint128(policy.insuranceRateBps)),
            uint128(10000)
        );

        // Retirement: baseSalary × retirementRate
        euint128 retirement = FHE.div(
            FHE.mul(baseSalary, FHE.asEuint128(policy.retirementRateBps)),
            uint128(10000)
        );

        euint128 otherDeductions = FHE.asEuint128(0);

        FHE.allowThis(taxWithholding);
        FHE.allowThis(insurance);
        FHE.allowThis(retirement);
        FHE.allowThis(otherDeductions);

        // Calculate net pay: totalComp - (tax + insurance + retirement + other)
        euint128 totalDeductions = FHE.add(taxWithholding,
            FHE.add(insurance,
                FHE.add(retirement, otherDeductions)));
        euint128 netPay = FHE.sub(totalComp, totalDeductions);
        FHE.allowThis(netPay);

        // Initialize promotion eligibility and attrition risk
        euint8 promotionEligibility = FHE.asEuint8(5); // Default mid-range
        euint8 attritionRisk = FHE.asEuint8(5);       // Default mid-range
        FHE.allowThis(promotionEligibility);
        FHE.allowThis(attritionRisk);

        // Create payroll
        payrolls[payrollId] = Payroll({
            payrollId: payrollId,
            employee: msg.sender,
            employmentLevel: employmentLevel,
            status: PayrollStatus.Draft,
            baseSalaryCipher: baseSalary,
            bonusCipher: bonus,
            stockOptionsCipher: stockOptions,
            benefitsCipher: benefits,
            overtimeCipher: overtime,
            commissionCipher: commission,
            totalCompensationCipher: totalComp,
            taxWithholdingCipher: taxWithholding,
            insuranceCipher: insurance,
            retirementCipher: retirement,
            otherDeductionsCipher: otherDeductions,
            netPayCipher: netPay,
            performanceScoreCipher: performanceScore,
            tenureMonthsCipher: tenure,
            performanceRatingCipher: performanceRating,
            warningCountCipher: warningCount,
            promotionEligibilityCipher: promotionEligibility,
            attritionRiskCipher: attritionRisk,
            departmentCodeCipher: departmentCode,
            gradeLevelCipher: gradeLevel,
            benefitTierCipher: benefitTier,
            revealedCompensationBand: 0,
            revealedMarketPercentile: 0,
            revealedTotalComp: 0,
            revealedNetPay: 0,
            revealedDecisionCode: 0,
            submittedAt: block.timestamp,
            reviewedAt: 0,
            approvedAt: 0,
            paidAt: 0,
            lastAdjustedAt: 0,
            isEvaluated: false,
            isPaid: false,
            paymentCycleNumber: 0
        });

        employeePayrolls[msg.sender].push(payrollId);

        // Initialize or update employee profile
        if (employeeProfiles[msg.sender].joinedAt == 0) {
            employeeProfiles[msg.sender] = EmployeeProfile({
                employeeAddress: msg.sender,
                totalEarnedCipher: FHE.asEuint128(0),
                totalTaxPaidCipher: FHE.asEuint128(0),
                totalBenefitsCipher: FHE.asEuint128(0),
                averagePerformanceCipher: FHE.asEuint64(0),
                currentSalaryBandCipher: FHE.asEuint32(0),
                totalPayrolls: 0,
                paidPayrolls: 0,
                joinedAt: block.timestamp,
                lastPaymentAt: 0,
                lastReviewAt: 0
            });

            FHE.allowThis(employeeProfiles[msg.sender].totalEarnedCipher);
            FHE.allowThis(employeeProfiles[msg.sender].totalTaxPaidCipher);
            FHE.allowThis(employeeProfiles[msg.sender].totalBenefitsCipher);
            FHE.allowThis(employeeProfiles[msg.sender].averagePerformanceCipher);
            FHE.allowThis(employeeProfiles[msg.sender].currentSalaryBandCipher);

            employeeCount++;
            companyHeadcountCipher = FHE.add(companyHeadcountCipher, FHE.asEuint32(1));
        }

        employeeProfiles[msg.sender].totalPayrolls++;

        payrollCount++;

        emit PayrollSubmitted(payrollId, msg.sender, employmentLevel, block.timestamp);
    }

    /**
     * @notice Submit payroll for review
     */
    function submitForReview(bytes32 payrollId) external payrollExists(payrollId) {
        Payroll storage payroll = payrolls[payrollId];
        require(payroll.employee == msg.sender, "Not employee");
        require(payroll.status == PayrollStatus.Draft, "Invalid status");

        payroll.status = PayrollStatus.Submitted;

        emit PayrollStatusChanged(payrollId, PayrollStatus.Draft, PayrollStatus.Submitted, block.timestamp);
    }

    /**
     * @notice Begin review process
     */
    function beginReview(bytes32 payrollId) external onlyHRManager payrollExists(payrollId) {
        Payroll storage payroll = payrolls[payrollId];
        require(payroll.status == PayrollStatus.Submitted, "Invalid status");

        payroll.status = PayrollStatus.UnderReview;

        emit PayrollStatusChanged(payrollId, PayrollStatus.Submitted, PayrollStatus.UnderReview, block.timestamp);
    }

    /**
     * @notice Request compensation review with Gateway decryption
     */
    function requestCompensationReview(bytes32 payrollId) external onlyHRManager payrollExists(payrollId) returns (uint256) {
        Payroll storage payroll = payrolls[payrollId];
        require(payroll.status == PayrollStatus.UnderReview, "Invalid status");

        PayrollPolicy memory pol = policy;

        euint64 totalComp = FHE.asEuint64(payroll.totalCompensationCipher);
        euint64 netPay = FHE.asEuint64(payroll.netPayCipher);

        // Calculate market percentile: (totalComp / marketRate) × 10000
        euint64 marketPercentile = FHE.div(
            FHE.mul(totalComp, uint64(10000)),
            FHE.add(FHE.asEuint64(pol.marketRateReference), uint64(1))
        );

        // Determine compensation band (0=BelowMarket to 4=Elite)
        ebool atLeast60 = FHE.ge(marketPercentile, FHE.asEuint64(6000));
        ebool atLeast80 = FHE.ge(marketPercentile, FHE.asEuint64(8000));
        ebool atLeast100 = FHE.ge(marketPercentile, FHE.asEuint64(10000));
        ebool atLeast120 = FHE.ge(marketPercentile, FHE.asEuint64(12000));
        ebool atLeast150 = FHE.ge(marketPercentile, FHE.asEuint64(15000));

        euint8 compensationBand = FHE.select(
            atLeast150,
            FHE.asEuint8(4), // Elite
            FHE.select(
                atLeast120,
                FHE.asEuint8(3), // Premium
                FHE.select(
                    atLeast100,
                    FHE.asEuint8(2), // Competitive
                    FHE.select(
                        atLeast80,
                        FHE.asEuint8(1), // Entry
                        FHE.asEuint8(0)  // BelowMarket
                    )
                )
            )
        );

        // Validation checks
        ebool salaryValid = FHE.and(
            FHE.ge(payroll.baseSalaryCipher, FHE.asEuint128(pol.minBaseSalary)),
            FHE.le(payroll.baseSalaryCipher, FHE.asEuint128(pol.maxBaseSalary))
        );

        ebool totalCompValid = FHE.ge(payroll.totalCompensationCipher, FHE.asEuint128(pol.minTotalComp));

        ebool performanceValid = FHE.ge(
            FHE.asEuint64(payroll.performanceScoreCipher),
            FHE.asEuint64(pol.minPerformanceScore)
        );

        ebool tenureValid = FHE.ge(
            FHE.asEuint32(payroll.tenureMonthsCipher),
            FHE.asEuint32(pol.minTenureMonths)
        );

        ebool warningsValid = FHE.le(payroll.warningCountCipher, FHE.asEuint8(pol.maxWarnings));

        // Decision logic: 0=reject, 1=adjust, 2=approve
        ebool fullApproval = FHE.and(salaryValid,
            FHE.and(totalCompValid,
                FHE.and(performanceValid,
                    FHE.and(tenureValid, warningsValid))));

        ebool partialApproval = FHE.and(salaryValid,
            FHE.and(performanceValid, tenureValid));

        euint8 decisionCode = FHE.select(
            fullApproval,
            FHE.asEuint8(2), // Approve
            FHE.select(
                partialApproval,
                FHE.asEuint8(1), // Adjust
                FHE.asEuint8(0)  // Reject
            )
        );

        // Calculate adjusted compensation (if needed)
        // Adjusted = current × 0.95 (5% reduction for adjustment)
        euint128 adjustedTotalComp = FHE.select(
            FHE.eq(decisionCode, FHE.asEuint8(1)),
            FHE.div(FHE.mul(payroll.totalCompensationCipher, uint128(95)), uint128(100)),
            payroll.totalCompensationCipher
        );

        euint128 adjustedNetPay = FHE.select(
            FHE.eq(decisionCode, FHE.asEuint8(1)),
            FHE.div(FHE.mul(payroll.netPayCipher, uint128(95)), uint128(100)),
            payroll.netPayCipher
        );

        // Store review
        CompensationReview storage review = compensationReviews[payrollId];
        review.totalCompensation = totalComp;
        review.netPay = netPay;
        review.marketPercentile = marketPercentile;
        review.compensationBand = compensationBand;
        review.decisionCode = decisionCode;
        review.adjustedTotalComp = adjustedTotalComp;
        review.adjustedNetPay = adjustedNetPay;
        review.isComplete = false;

        FHE.allowThis(totalComp);
        FHE.allowThis(netPay);
        FHE.allowThis(marketPercentile);
        FHE.allowThis(compensationBand);
        FHE.allowThis(decisionCode);
        FHE.allowThis(adjustedTotalComp);
        FHE.allowThis(adjustedNetPay);

        // Request Gateway decryption
        uint256[] memory cts = new uint256[](5);
        cts[0] = FHE.decrypt(totalComp);
        cts[1] = FHE.decrypt(netPay);
        cts[2] = FHE.decrypt(marketPercentile);
        cts[3] = FHE.decrypt(compensationBand);
        cts[4] = FHE.decrypt(decisionCode);

        uint256 requestId = Gateway.requestDecryption(
            cts,
            this.compensationReviewCallback.selector,
            0,
            block.timestamp + 1 hours,
            false
        );

        requestIdToPayroll[requestId] = payrollId;
        payroll.reviewedAt = block.timestamp;

        emit ReviewRequested(payrollId, requestId, block.timestamp);

        return requestId;
    }

    /**
     * @notice Gateway callback for compensation review
     */
    function compensationReviewCallback(uint256 requestId, uint256[] calldata decryptedValues) external onlyGateway {
        bytes32 payrollId = requestIdToPayroll[requestId];
        Payroll storage payroll = payrolls[payrollId];
        CompensationReview storage review = compensationReviews[payrollId];

        uint64 totalComp = uint64(decryptedValues[0]);
        uint64 netPay = uint64(decryptedValues[1]);
        uint64 marketPercentile = uint64(decryptedValues[2]);
        uint8 compensationBand = uint8(decryptedValues[3]);
        uint8 decisionCode = uint8(decryptedValues[4]);

        // Store decrypted values
        revealedReviews[payrollId] = DecryptedReview({
            totalCompensation: totalComp,
            netPay: netPay,
            marketPercentile: marketPercentile,
            compensationBand: compensationBand,
            decisionCode: decisionCode
        });

        payroll.revealedTotalComp = totalComp;
        payroll.revealedNetPay = netPay;
        payroll.revealedMarketPercentile = marketPercentile;
        payroll.revealedCompensationBand = compensationBand;
        payroll.revealedDecisionCode = decisionCode;
        payroll.isEvaluated = true;

        review.isComplete = true;

        // Update employee profile
        EmployeeProfile storage profile = employeeProfiles[payroll.employee];
        profile.lastReviewAt = block.timestamp;

        // Auto-transition based on decision
        PayrollStatus oldStatus = payroll.status;
        if (decisionCode == 0) {
            payroll.status = PayrollStatus.Rejected;
            rejectedCount++;
            emit PayrollStatusChanged(payrollId, oldStatus, PayrollStatus.Rejected, block.timestamp);
        } else if (decisionCode == 1) {
            // Apply adjustment
            payroll.totalCompensationCipher = review.adjustedTotalComp;
            payroll.netPayCipher = review.adjustedNetPay;
            payroll.status = PayrollStatus.Adjusted;
            payroll.lastAdjustedAt = block.timestamp;
            emit PayrollStatusChanged(payrollId, oldStatus, PayrollStatus.Adjusted, block.timestamp);
        } else {
            payroll.status = PayrollStatus.Approved;
            emit PayrollStatusChanged(payrollId, oldStatus, PayrollStatus.Approved, block.timestamp);
        }

        // Update average performance
        if (employeeCount > 0) {
            averagePerformanceScoreCipher = FHE.div(
                FHE.add(
                    FHE.mul(averagePerformanceScoreCipher, FHE.asEuint64(payrollCount - 1)),
                    FHE.asEuint64(payroll.performanceScoreCipher)
                ),
                uint64(payrollCount)
            );
        }

        emit ReviewCompleted(payrollId, totalComp, compensationBand, decisionCode, block.timestamp);
    }

    /**
     * @notice Approve payroll for payment
     */
    function approvePayroll(bytes32 payrollId) external onlyFinanceController payrollExists(payrollId) {
        Payroll storage payroll = payrolls[payrollId];
        require(payroll.status == PayrollStatus.Approved || payroll.status == PayrollStatus.Adjusted, "Invalid status");

        PayrollStatus oldStatus = payroll.status;
        payroll.status = PayrollStatus.Scheduled;
        payroll.approvedAt = block.timestamp;

        approvedCount++;

        emit PayrollApproved(payrollId, payroll.employee, block.timestamp);
        emit PayrollStatusChanged(payrollId, oldStatus, PayrollStatus.Scheduled, block.timestamp);
    }

    /**
     * @notice Record payment
     */
    function recordPayment(
        bytes32 payrollId,
        bytes32 paymentId,
        externalEuint128 encryptedGrossAmount,
        bytes calldata grossProof,
        externalEuint128 encryptedNetAmount,
        bytes calldata netProof,
        externalEuint128 encryptedTaxAmount,
        bytes calldata taxProof
    ) external onlyPayrollProcessor payrollExists(payrollId) {
        Payroll storage payroll = payrolls[payrollId];
        require(payroll.status == PayrollStatus.Scheduled || payroll.status == PayrollStatus.Processing, "Invalid status");

        euint128 grossAmount = FHE.asEuint128(encryptedGrossAmount, grossProof);
        euint128 netAmount = FHE.asEuint128(encryptedNetAmount, netProof);
        euint128 taxAmount = FHE.asEuint128(encryptedTaxAmount, taxProof);

        FHE.allowThis(grossAmount);
        FHE.allowThis(netAmount);
        FHE.allowThis(taxAmount);

        PaymentRecord memory record = PaymentRecord({
            paymentId: paymentId,
            payrollId: payrollId,
            grossAmountCipher: grossAmount,
            netAmountCipher: netAmount,
            taxAmountCipher: taxAmount,
            paymentCycle: currentPaymentCycle,
            timestamp: block.timestamp,
            isVerified: true
        });

        payrollPayments[payrollId].push(record);

        // Update status on first payment
        if (payroll.status == PayrollStatus.Scheduled) {
            payroll.status = PayrollStatus.Processing;
            emit PayrollStatusChanged(payrollId, PayrollStatus.Scheduled, PayrollStatus.Processing, block.timestamp);
        }

        // Update employee profile
        EmployeeProfile storage profile = employeeProfiles[payroll.employee];
        profile.totalEarnedCipher = FHE.add(profile.totalEarnedCipher, grossAmount);
        profile.totalTaxPaidCipher = FHE.add(profile.totalTaxPaidCipher, taxAmount);
        profile.lastPaymentAt = block.timestamp;

        // Update aggregate statistics
        totalPayrollExpenseCipher = FHE.add(totalPayrollExpenseCipher, grossAmount);
        totalTaxWithheldCipher = FHE.add(totalTaxWithheldCipher, taxAmount);
        totalPayments++;

        // Update department budget if exists
        bytes32 deptId = departmentCodeToId[uint32(FHE.decrypt(payroll.departmentCodeCipher))];
        if (departmentBudgets[deptId].isActive) {
            DepartmentBudget storage dept = departmentBudgets[deptId];
            dept.spentBudgetCipher = FHE.add(dept.spentBudgetCipher, grossAmount);
            dept.remainingBudgetCipher = FHE.sub(dept.allocatedBudgetCipher, dept.spentBudgetCipher);
            dept.lastUpdateAt = block.timestamp;
        }

        emit PaymentRecorded(paymentId, payrollId, currentPaymentCycle, block.timestamp);
    }

    /**
     * @notice Mark payroll as paid
     */
    function markPaid(bytes32 payrollId) external onlyPayrollProcessor payrollExists(payrollId) {
        Payroll storage payroll = payrolls[payrollId];
        require(payroll.status == PayrollStatus.Processing, "Invalid status");

        payroll.status = PayrollStatus.Paid;
        payroll.isPaid = true;
        payroll.paidAt = block.timestamp;
        payroll.paymentCycleNumber = currentPaymentCycle;

        // Update employee profile
        EmployeeProfile storage profile = employeeProfiles[payroll.employee];
        profile.paidPayrolls++;

        paidCount++;

        // Update average base salary
        if (paidCount > 0) {
            averageBaseSalaryCipher = FHE.div(
                FHE.add(
                    FHE.mul(averageBaseSalaryCipher, FHE.asEuint64(paidCount - 1)),
                    FHE.asEuint64(payroll.baseSalaryCipher)
                ),
                uint64(paidCount)
            );
        }

        emit PayrollPaid(payrollId, payroll.employee, block.timestamp);
        emit PayrollStatusChanged(payrollId, PayrollStatus.Processing, PayrollStatus.Paid, block.timestamp);
        emit EmployeeProfileUpdated(payroll.employee, block.timestamp);
    }

    // ============ Department Budget Management ============

    /**
     * @notice Create department budget
     */
    function createDepartmentBudget(
        bytes32 departmentId,
        uint32 departmentCode,
        externalEuint128 encryptedAllocatedBudget,
        bytes calldata budgetProof,
        uint256 fiscalYear
    ) external onlyFinanceController {
        require(departmentBudgets[departmentId].fiscalYear == 0, "Department already exists");

        euint128 allocatedBudget = FHE.asEuint128(encryptedAllocatedBudget, budgetProof);
        FHE.allowThis(allocatedBudget);

        departmentBudgets[departmentId] = DepartmentBudget({
            departmentId: departmentId,
            departmentCode: FHE.asEuint32(departmentCode),
            allocatedBudgetCipher: allocatedBudget,
            spentBudgetCipher: FHE.asEuint128(0),
            remainingBudgetCipher: allocatedBudget,
            employeeCountCipher: FHE.asEuint64(0),
            averageSalaryCipher: FHE.asEuint64(0),
            fiscalYear: fiscalYear,
            lastUpdateAt: block.timestamp,
            isActive: true
        });

        FHE.allowThis(departmentBudgets[departmentId].departmentCode);
        FHE.allowThis(departmentBudgets[departmentId].spentBudgetCipher);
        FHE.allowThis(departmentBudgets[departmentId].remainingBudgetCipher);
        FHE.allowThis(departmentBudgets[departmentId].employeeCountCipher);
        FHE.allowThis(departmentBudgets[departmentId].averageSalaryCipher);

        departmentCodeToId[departmentCode] = departmentId;
        departmentCount++;

        emit DepartmentBudgetCreated(departmentId, departmentCode, block.timestamp);
    }

    /**
     * @notice Advance payment cycle
     */
    function advancePaymentCycle() external onlyPayrollProcessor {
        currentPaymentCycle++;
    }

    // ============ View Functions ============

    function getPayrollInfo(bytes32 payrollId) external view returns (
        address employee,
        EmploymentLevel employmentLevel,
        PayrollStatus status,
        bool isEvaluated,
        uint8 compensationBand,
        uint64 totalComp,
        uint64 netPay,
        uint8 decisionCode
    ) {
        Payroll storage payroll = payrolls[payrollId];
        return (
            payroll.employee,
            payroll.employmentLevel,
            payroll.status,
            payroll.isEvaluated,
            payroll.revealedCompensationBand,
            payroll.revealedTotalComp,
            payroll.revealedNetPay,
            payroll.revealedDecisionCode
        );
    }

    function getRevealedReview(bytes32 payrollId) external view returns (
        uint64 totalCompensation,
        uint64 netPay,
        uint64 marketPercentile,
        uint8 compensationBand,
        uint8 decisionCode
    ) {
        DecryptedReview storage review = revealedReviews[payrollId];
        return (
            review.totalCompensation,
            review.netPay,
            review.marketPercentile,
            review.compensationBand,
            review.decisionCode
        );
    }

    function getEmployeePayrolls(address employee) external view returns (bytes32[] memory) {
        return employeePayrolls[employee];
    }

    function getPaymentCount(bytes32 payrollId) external view returns (uint256) {
        return payrollPayments[payrollId].length;
    }

    function getMyEncryptedPayroll(bytes32 payrollId) external view returns (
        euint128 baseSalary,
        euint128 bonus,
        euint128 totalComp,
        euint128 netPay
    ) {
        Payroll storage payroll = payrolls[payrollId];
        require(payroll.employee == msg.sender, "Not employee");
        return (
            payroll.baseSalaryCipher,
            payroll.bonusCipher,
            payroll.totalCompensationCipher,
            payroll.netPayCipher
        );
    }

    function exportReviewData(bytes32 payrollId, bytes calldata publicKey) external view returns (
        bytes memory totalCompData,
        bytes memory netPayData,
        bytes memory marketPercentileData,
        bytes memory compensationBandData,
        bytes memory decisionCodeData
    ) {
        CompensationReview storage review = compensationReviews[payrollId];
        require(review.isComplete, "Review not complete");
        Payroll storage payroll = payrolls[payrollId];
        require(payroll.employee == msg.sender || hrManagers[msg.sender], "Unauthorized");

        totalCompData = FHE.reencrypt(review.totalCompensation, publicKey);
        netPayData = FHE.reencrypt(review.netPay, publicKey);
        marketPercentileData = FHE.reencrypt(review.marketPercentile, publicKey);
        compensationBandData = FHE.reencrypt(review.compensationBand, publicKey);
        decisionCodeData = FHE.reencrypt(review.decisionCode, publicKey);
    }

    // ============ Admin Functions ============

    function updatePolicy(PayrollPolicy calldata newPolicy) external onlyOwner {
        require(newPolicy.minBaseSalary > 0, "Invalid base salary");
        policy = newPolicy;
        emit PolicyUpdated(newPolicy.minBaseSalary, newPolicy.maxBaseSalary, block.timestamp);
    }

    function grantHRManager(address account) external onlyOwner {
        hrManagers[account] = true;
        emit RoleGranted(account, "HRManager", block.timestamp);
    }

    function revokeHRManager(address account) external onlyOwner {
        hrManagers[account] = false;
        emit RoleRevoked(account, "HRManager", block.timestamp);
    }

    function grantPayrollProcessor(address account) external onlyOwner {
        payrollProcessors[account] = true;
        emit RoleGranted(account, "PayrollProcessor", block.timestamp);
    }

    function revokePayrollProcessor(address account) external onlyOwner {
        payrollProcessors[account] = false;
        emit RoleRevoked(account, "PayrollProcessor", block.timestamp);
    }

    function grantFinanceController(address account) external onlyOwner {
        financeControllers[account] = true;
        emit RoleGranted(account, "FinanceController", block.timestamp);
    }

    function revokeFinanceController(address account) external onlyOwner {
        financeControllers[account] = false;
        emit RoleRevoked(account, "FinanceController", block.timestamp);
    }

    function grantAuditor(address account) external onlyOwner {
        auditors[account] = true;
        emit RoleGranted(account, "Auditor", block.timestamp);
    }

    function revokeAuditor(address account) external onlyOwner {
        auditors[account] = false;
        emit RoleRevoked(account, "Auditor", block.timestamp);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
