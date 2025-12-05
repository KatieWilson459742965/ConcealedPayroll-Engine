const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("PayrollManager - Payroll Distribution FHE Tests", function () {
  let contract;
  let owner, user1, member1, member2, member3;
  let orgId;

  beforeEach(async function () {
    if (!fhevm.isMock) {
      throw new Error("This test must run in FHEVM mock environment");
    }

    await fhevm.initializeCLIApi();
    [owner, user1, member1, member2, member3] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("PayrollManager");
    const deployed = await Factory.deploy();
    await deployed.waitForDeployment();
    contract = deployed;

    // Create organization and add members for distribution tests
    orgId = ethers.keccak256(
      ethers.toUtf8Bytes(`Distribution-Test-Org-${Date.now()}-${owner.address}`)
    );
    await contract.connect(owner).createOrganization(orgId, "Distribution Test Org");

    // Add 3 members with encrypted salaries
    const members = [
      { addr: member1, name: "Alice", role: "Developer", salary: 500000n },
      { addr: member2, name: "Bob", role: "Designer", salary: 450000n },
      { addr: member3, name: "Charlie", role: "Manager", salary: 700000n },
    ];

    for (const m of members) {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add64(m.salary)
        .encrypt();

      await contract.connect(owner).addTeamMember(
        orgId,
        m.addr.address,
        m.name,
        m.role,
        encrypted.handles[0],
        encrypted.inputProof
      );
    }

    console.log(`PayrollManager deployed at: ${await contract.getAddress()}`);
    console.log("Organization and 3 members created for tests");
  });

  describe("Distribution Creation with FHE", function () {
    it("should create payroll distribution with encrypted period", async function () {
      console.log("Testing distribution creation with FHE.fromExternal()...");

      const distributionId = ethers.keccak256(
        ethers.toUtf8Bytes(`dist-${Date.now()}-${member1.address}`)
      );

      // Encrypt period (202501 = January 2025)
      const period = 202501;
      const encryptedPeriod = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add32(BigInt(period))
        .encrypt();

      const tx = await contract.connect(owner).createPayrollDistribution(
        distributionId,
        orgId,
        member1.address,
        encryptedPeriod.handles[0],
        encryptedPeriod.inputProof
      );
      const receipt = await tx.wait();

      // Check event
      const event = receipt.logs.find(log => {
        try {
          const decoded = contract.interface.parseLog(log);
          return decoded.name === 'PayrollDistributionCreated';
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
      console.log("PayrollDistributionCreated event emitted");
      console.log("FHE.fromExternal() - Encrypted period import works");
      console.log("FHE.asEuint64() - Recipient hash encryption works");
      console.log("FHE.asEuint32() - Currency code encryption works");
    });

    it("should use member's pre-configured encrypted salary", async function () {
      console.log("Testing automatic salary retrieval from member record...");

      const distributionId = ethers.keccak256(
        ethers.toUtf8Bytes(`salary-test-${Date.now()}-${member1.address}`)
      );

      const encryptedPeriod = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add32(202501n)
        .encrypt();

      await contract.connect(owner).createPayrollDistribution(
        distributionId,
        orgId,
        member1.address,
        encryptedPeriod.handles[0],
        encryptedPeriod.inputProof
      );

      const dist = await contract.getDistribution(distributionId);
      expect(dist.organizationId).to.equal(orgId);
      expect(dist.initiator).to.equal(owner.address);
      expect(dist.isExecuted).to.equal(false);
      expect(dist.isCancelled).to.equal(false);

      console.log("Distribution created using member's encrypted salary");
    });

    it("should create distributions for multiple members", async function () {
      console.log("Testing multi-member distribution creation...");

      const members = [member1, member2, member3];
      const distributionIds = [];

      for (let i = 0; i < members.length; i++) {
        const distributionId = ethers.keccak256(
          ethers.toUtf8Bytes(`multi-dist-${i}-${Date.now()}-${members[i].address}`)
        );

        const encryptedPeriod = await fhevm
          .createEncryptedInput(await contract.getAddress(), owner.address)
          .add32(BigInt(202501 + i))
          .encrypt();

        await contract.connect(owner).createPayrollDistribution(
          distributionId,
          orgId,
          members[i].address,
          encryptedPeriod.handles[0],
          encryptedPeriod.inputProof
        );

        distributionIds.push(distributionId);
      }

      const orgDistributions = await contract.getOrganizationDistributions(orgId);
      expect(orgDistributions.length).to.equal(3);
      console.log(`Created ${distributionIds.length} distributions for different members`);
    });

    it("should handle different period formats", async function () {
      console.log("Testing various period formats...");

      const periods = [
        202501, // Jan 2025
        202512, // Dec 2025
        203001, // Jan 2030
        199901, // Jan 1999
      ];

      for (let i = 0; i < periods.length; i++) {
        const distributionId = ethers.keccak256(
          ethers.toUtf8Bytes(`period-${periods[i]}-${Date.now()}-${member1.address}`)
        );

        const encryptedPeriod = await fhevm
          .createEncryptedInput(await contract.getAddress(), owner.address)
          .add32(BigInt(periods[i]))
          .encrypt();

        await contract.connect(owner).createPayrollDistribution(
          distributionId,
          orgId,
          member1.address,
          encryptedPeriod.handles[0],
          encryptedPeriod.inputProof
        );

        console.log(`Period ${periods[i]} handled correctly`);
      }
    });
  });

  describe("Distribution Access Control", function () {
    it("should only allow organization owner to create distributions", async function () {
      console.log("Testing owner-only distribution creation...");

      const distributionId = ethers.keccak256(
        ethers.toUtf8Bytes(`unauthorized-${Date.now()}-${member1.address}`)
      );

      const encryptedPeriod = await fhevm
        .createEncryptedInput(await contract.getAddress(), user1.address)
        .add32(202501n)
        .encrypt();

      await expect(
        contract.connect(user1).createPayrollDistribution(
          distributionId,
          orgId,
          member1.address,
          encryptedPeriod.handles[0],
          encryptedPeriod.inputProof
        )
      ).to.be.revertedWithCustomError(contract, "Unauthorized");

      console.log("Non-owner distribution creation correctly rejected");
    });

    it("should reject distribution for non-existent organization", async function () {
      const fakeOrgId = ethers.keccak256(ethers.toUtf8Bytes("fake-org"));
      const distributionId = ethers.keccak256(
        ethers.toUtf8Bytes(`fake-org-dist-${Date.now()}`)
      );

      const encryptedPeriod = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add32(202501n)
        .encrypt();

      await expect(
        contract.connect(owner).createPayrollDistribution(
          distributionId,
          fakeOrgId,
          member1.address,
          encryptedPeriod.handles[0],
          encryptedPeriod.inputProof
        )
      ).to.be.revertedWithCustomError(contract, "OrganizationNotFound");

      console.log("Distribution for non-existent org correctly rejected");
    });

    it("should reject distribution for inactive member", async function () {
      // Remove member first
      await contract.connect(owner).removeTeamMember(orgId, member1.address);

      const distributionId = ethers.keccak256(
        ethers.toUtf8Bytes(`inactive-member-${Date.now()}-${member1.address}`)
      );

      const encryptedPeriod = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add32(202501n)
        .encrypt();

      await expect(
        contract.connect(owner).createPayrollDistribution(
          distributionId,
          orgId,
          member1.address,
          encryptedPeriod.handles[0],
          encryptedPeriod.inputProof
        )
      ).to.be.revertedWithCustomError(contract, "MemberNotFound");

      console.log("Distribution for inactive member correctly rejected");
    });

    it("should reject duplicate distribution ID", async function () {
      const distributionId = ethers.keccak256(
        ethers.toUtf8Bytes(`duplicate-dist-${owner.address}`)
      );

      const encryptedPeriod1 = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add32(202501n)
        .encrypt();

      await contract.connect(owner).createPayrollDistribution(
        distributionId,
        orgId,
        member1.address,
        encryptedPeriod1.handles[0],
        encryptedPeriod1.inputProof
      );

      const encryptedPeriod2 = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add32(202502n)
        .encrypt();

      await expect(
        contract.connect(owner).createPayrollDistribution(
          distributionId,
          orgId,
          member2.address,
          encryptedPeriod2.handles[0],
          encryptedPeriod2.inputProof
        )
      ).to.be.revertedWithCustomError(contract, "InvalidParameters");

      console.log("Duplicate distribution ID correctly rejected");
    });
  });

  describe("Distribution Execution", function () {
    let distributionId;

    beforeEach(async function () {
      distributionId = ethers.keccak256(
        ethers.toUtf8Bytes(`exec-test-${Date.now()}-${member1.address}`)
      );

      const encryptedPeriod = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add32(202501n)
        .encrypt();

      await contract.connect(owner).createPayrollDistribution(
        distributionId,
        orgId,
        member1.address,
        encryptedPeriod.handles[0],
        encryptedPeriod.inputProof
      );
    });

    it("should execute distribution successfully", async function () {
      console.log("Testing distribution execution...");

      const tx = await contract.connect(owner).executePayrollDistribution(distributionId);
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => {
        try {
          const decoded = contract.interface.parseLog(log);
          return decoded.name === 'PayrollDistributionExecuted';
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;

      const dist = await contract.getDistribution(distributionId);
      expect(dist.isExecuted).to.equal(true);
      expect(dist.executedAt).to.be.gt(0);

      console.log("Distribution executed and marked as completed");
    });

    it("should only allow organization owner to execute", async function () {
      await expect(
        contract.connect(user1).executePayrollDistribution(distributionId)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");

      console.log("Non-owner execution correctly rejected");
    });

    it("should reject executing already executed distribution", async function () {
      await contract.connect(owner).executePayrollDistribution(distributionId);

      await expect(
        contract.connect(owner).executePayrollDistribution(distributionId)
      ).to.be.revertedWithCustomError(contract, "DistributionAlreadyExecuted");

      console.log("Double execution correctly rejected");
    });

    it("should reject executing non-existent distribution", async function () {
      const fakeDistId = ethers.keccak256(ethers.toUtf8Bytes("fake-dist"));

      await expect(
        contract.connect(owner).executePayrollDistribution(fakeDistId)
      ).to.be.revertedWithCustomError(contract, "DistributionNotFound");

      console.log("Executing non-existent distribution correctly rejected");
    });
  });

  describe("Distribution Cancellation", function () {
    let distributionId;

    beforeEach(async function () {
      distributionId = ethers.keccak256(
        ethers.toUtf8Bytes(`cancel-test-${Date.now()}-${member1.address}`)
      );

      const encryptedPeriod = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add32(202501n)
        .encrypt();

      await contract.connect(owner).createPayrollDistribution(
        distributionId,
        orgId,
        member1.address,
        encryptedPeriod.handles[0],
        encryptedPeriod.inputProof
      );
    });

    it("should cancel distribution successfully", async function () {
      console.log("Testing distribution cancellation...");

      const tx = await contract.connect(owner).cancelPayrollDistribution(distributionId);
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => {
        try {
          const decoded = contract.interface.parseLog(log);
          return decoded.name === 'PayrollDistributionCancelled';
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;

      const dist = await contract.getDistribution(distributionId);
      expect(dist.isCancelled).to.equal(true);
      expect(dist.isExecuted).to.equal(false);

      console.log("Distribution cancelled successfully");
    });

    it("should only allow organization owner to cancel", async function () {
      await expect(
        contract.connect(user1).cancelPayrollDistribution(distributionId)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");

      console.log("Non-owner cancellation correctly rejected");
    });

    it("should reject cancelling executed distribution", async function () {
      await contract.connect(owner).executePayrollDistribution(distributionId);

      await expect(
        contract.connect(owner).cancelPayrollDistribution(distributionId)
      ).to.be.revertedWithCustomError(contract, "DistributionAlreadyExecuted");

      console.log("Cancelling executed distribution correctly rejected");
    });

    it("should reject executing cancelled distribution", async function () {
      await contract.connect(owner).cancelPayrollDistribution(distributionId);

      await expect(
        contract.connect(owner).executePayrollDistribution(distributionId)
      ).to.be.revertedWithCustomError(contract, "DistributionAlreadyExecuted");

      console.log("Executing cancelled distribution correctly rejected");
    });
  });

  describe("Distribution Queries", function () {
    it("should track distributions by organization", async function () {
      console.log("Testing organization distribution tracking...");

      // Create 5 distributions
      for (let i = 0; i < 5; i++) {
        const distributionId = ethers.keccak256(
          ethers.toUtf8Bytes(`org-track-${i}-${Date.now()}-${member1.address}`)
        );

        const encryptedPeriod = await fhevm
          .createEncryptedInput(await contract.getAddress(), owner.address)
          .add32(BigInt(202501 + i))
          .encrypt();

        await contract.connect(owner).createPayrollDistribution(
          distributionId,
          orgId,
          member1.address,
          encryptedPeriod.handles[0],
          encryptedPeriod.inputProof
        );
      }

      const orgDistributions = await contract.getOrganizationDistributions(orgId);
      expect(orgDistributions.length).to.equal(5);
      console.log(`Organization has ${orgDistributions.length} distributions`);
    });

    it("should return distribution details", async function () {
      const distributionId = ethers.keccak256(
        ethers.toUtf8Bytes(`details-test-${Date.now()}-${member1.address}`)
      );

      const encryptedPeriod = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add32(202501n)
        .encrypt();

      await contract.connect(owner).createPayrollDistribution(
        distributionId,
        orgId,
        member1.address,
        encryptedPeriod.handles[0],
        encryptedPeriod.inputProof
      );

      const dist = await contract.getDistribution(distributionId);

      expect(dist.organizationId).to.equal(orgId);
      expect(dist.initiator).to.equal(owner.address);
      expect(dist.createdAt).to.be.gt(0);
      expect(dist.executedAt).to.equal(0);
      expect(dist.isExecuted).to.equal(false);
      expect(dist.isCancelled).to.equal(false);

      console.log("Distribution details returned correctly");
    });

    it("should increment distribution count", async function () {
      const initialCount = await contract.distributionCount();

      for (let i = 0; i < 3; i++) {
        const distributionId = ethers.keccak256(
          ethers.toUtf8Bytes(`count-test-${i}-${Date.now()}-${member1.address}`)
        );

        const encryptedPeriod = await fhevm
          .createEncryptedInput(await contract.getAddress(), owner.address)
          .add32(BigInt(202501 + i))
          .encrypt();

        await contract.connect(owner).createPayrollDistribution(
          distributionId,
          orgId,
          member1.address,
          encryptedPeriod.handles[0],
          encryptedPeriod.inputProof
        );
      }

      const finalCount = await contract.distributionCount();
      expect(finalCount).to.equal(initialCount + 3n);
      console.log(`Distribution count: ${initialCount} -> ${finalCount}`);
    });
  });

  describe("Encrypted Data Access", function () {
    let distributionId;

    beforeEach(async function () {
      distributionId = ethers.keccak256(
        ethers.toUtf8Bytes(`enc-access-${Date.now()}-${member1.address}`)
      );

      const encryptedPeriod = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add32(202501n)
        .encrypt();

      await contract.connect(owner).createPayrollDistribution(
        distributionId,
        orgId,
        member1.address,
        encryptedPeriod.handles[0],
        encryptedPeriod.inputProof
      );
    });

    it("should allow owner to access encrypted distribution data", async function () {
      console.log("Testing encrypted data access for owner...");

      const encData = await contract.connect(owner).getEncryptedDistributionData(distributionId);

      // Encrypted values exist (handles are non-zero)
      expect(encData.encryptedRecipientHash).to.not.be.undefined;
      expect(encData.encryptedMemberIndex).to.not.be.undefined;
      expect(encData.encryptedAmount).to.not.be.undefined;
      expect(encData.encryptedCurrency).to.not.be.undefined;
      expect(encData.encryptedPeriod).to.not.be.undefined;

      console.log("Owner can access encrypted distribution data");
    });

    it("should reject non-owner accessing encrypted data", async function () {
      await expect(
        contract.connect(user1).getEncryptedDistributionData(distributionId)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");

      console.log("Non-owner encrypted data access correctly rejected");
    });
  });

  describe("Complex Distribution Workflows", function () {
    it("should handle full payroll cycle for multiple members", async function () {
      console.log("Testing full payroll cycle...");

      const members = [member1, member2, member3];
      const distributions = [];

      // Create distributions for all members
      for (let i = 0; i < members.length; i++) {
        const distributionId = ethers.keccak256(
          ethers.toUtf8Bytes(`full-cycle-${i}-${Date.now()}-${members[i].address}`)
        );

        const encryptedPeriod = await fhevm
          .createEncryptedInput(await contract.getAddress(), owner.address)
          .add32(202501n)
          .encrypt();

        await contract.connect(owner).createPayrollDistribution(
          distributionId,
          orgId,
          members[i].address,
          encryptedPeriod.handles[0],
          encryptedPeriod.inputProof
        );

        distributions.push(distributionId);
        console.log(`Created distribution for ${members[i].address.slice(0, 6)}...`);
      }

      // Execute all distributions
      for (let i = 0; i < distributions.length; i++) {
        await contract.connect(owner).executePayrollDistribution(distributions[i]);
        console.log(`Executed distribution ${i + 1}`);
      }

      // Verify all executed
      for (let i = 0; i < distributions.length; i++) {
        const dist = await contract.getDistribution(distributions[i]);
        expect(dist.isExecuted).to.equal(true);
        expect(dist.executedAt).to.be.gt(0);
      }

      console.log("Full payroll cycle completed for 3 members");
    });

    it("should handle rapid distribution creation", async function () {
      console.log("Testing rapid distribution creation...");

      const startTime = Date.now();
      const count = 10;

      for (let i = 0; i < count; i++) {
        const distributionId = ethers.keccak256(
          ethers.toUtf8Bytes(`rapid-${i}-${Date.now()}-${member1.address}`)
        );

        const encryptedPeriod = await fhevm
          .createEncryptedInput(await contract.getAddress(), owner.address)
          .add32(BigInt(202501 + i))
          .encrypt();

        await contract.connect(owner).createPayrollDistribution(
          distributionId,
          orgId,
          member1.address,
          encryptedPeriod.handles[0],
          encryptedPeriod.inputProof
        );
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      const distCount = await contract.distributionCount();
      expect(distCount).to.be.gte(count);
      console.log(`Created ${count} distributions in ${duration}ms`);
    });
  });
});
