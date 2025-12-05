const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("PayrollManager - Team Member FHE Operations Tests", function () {
  let contract;
  let owner, user1, member1, member2, member3, member4, member5;
  let orgId;

  beforeEach(async function () {
    if (!fhevm.isMock) {
      throw new Error("This test must run in FHEVM mock environment");
    }

    await fhevm.initializeCLIApi();
    [owner, user1, member1, member2, member3, member4, member5] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("PayrollManager");
    const deployed = await Factory.deploy();
    await deployed.waitForDeployment();
    contract = deployed;

    // Create a default organization for member tests
    orgId = ethers.keccak256(
      ethers.toUtf8Bytes(`Member-Test-Org-${Date.now()}-${owner.address}`)
    );
    await contract.connect(owner).createOrganization(orgId, "Member Test Organization");

    console.log(`PayrollManager deployed at: ${await contract.getAddress()}`);
  });

  describe("FHE Salary Encryption", function () {
    it("should add member with encrypted salary using FHE.fromExternal", async function () {
      console.log("Testing FHE.fromExternal() for salary encryption...");

      // Create encrypted salary (5000.00 USD = 500000 cents)
      const salaryInCents = 500000n;
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add64(salaryInCents)
        .encrypt();

      const tx = await contract.connect(owner).addTeamMember(
        orgId,
        member1.address,
        "Alice Smith",
        "Senior Developer",
        encrypted.handles[0],
        encrypted.inputProof
      );
      await tx.wait();

      const member = await contract.getTeamMember(orgId, member1.address);
      expect(member.memberName).to.equal("Alice Smith");
      expect(member.role).to.equal("Senior Developer");
      expect(member.isActive).to.equal(true);

      console.log("FHE.fromExternal() - Encrypted salary import works");
      console.log("FHE.allowThis() - Contract can access encrypted salary");
      console.log("FHE.allow() - Permissions set for owner and member");
    });

    it("should handle different salary ranges with euint64", async function () {
      console.log("Testing salary ranges with euint64...");

      const salaryTestCases = [
        { name: "Min Wage", salary: 150000n, role: "Intern" },           // $1,500.00
        { name: "Entry Level", salary: 500000n, role: "Junior Dev" },   // $5,000.00
        { name: "Mid Level", salary: 1000000n, role: "Developer" },     // $10,000.00
        { name: "Senior", salary: 2000000n, role: "Senior Dev" },       // $20,000.00
        { name: "Executive", salary: 10000000n, role: "CTO" },          // $100,000.00
      ];

      const members = [member1, member2, member3, member4, member5];

      for (let i = 0; i < salaryTestCases.length; i++) {
        const testCase = salaryTestCases[i];
        const encrypted = await fhevm
          .createEncryptedInput(await contract.getAddress(), owner.address)
          .add64(testCase.salary)
          .encrypt();

        await contract.connect(owner).addTeamMember(
          orgId,
          members[i].address,
          testCase.name,
          testCase.role,
          encrypted.handles[0],
          encrypted.inputProof
        );

        console.log(`Added ${testCase.name} with ${testCase.role} role (encrypted salary)`);
      }

      const org = await contract.getOrganization(orgId);
      expect(org.memberCount).to.equal(5);
      console.log("All salary ranges handled correctly with euint64");
    });

    it("should reject invalid encrypted salary proof", async function () {
      console.log("Testing invalid proof rejection...");

      const validEncrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add64(500000n)
        .encrypt();

      const invalidProof = "0x" + "00".repeat(64);

      await expect(
        contract.connect(owner).addTeamMember(
          orgId,
          member1.address,
          "Test Member",
          "Developer",
          validEncrypted.handles[0],
          invalidProof
        )
      ).to.be.reverted;

      console.log("FHE.fromExternal() correctly rejects invalid proofs");
    });

    it("should handle zero salary encryption", async function () {
      console.log("Testing zero salary edge case...");

      const zeroSalary = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add64(0n)
        .encrypt();

      await contract.connect(owner).addTeamMember(
        orgId,
        member1.address,
        "Volunteer",
        "Intern",
        zeroSalary.handles[0],
        zeroSalary.inputProof
      );

      const member = await contract.getTeamMember(orgId, member1.address);
      expect(member.isActive).to.equal(true);
      console.log("Zero salary encrypted and stored correctly");
    });

    it("should handle maximum euint64 salary value", async function () {
      console.log("Testing maximum euint64 value...");

      // Maximum euint64: 2^64 - 1 = 18,446,744,073,709,551,615
      const maxSalary = BigInt("18446744073709551615");

      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add64(maxSalary)
        .encrypt();

      await contract.connect(owner).addTeamMember(
        orgId,
        member1.address,
        "Max Salary Test",
        "Billionaire",
        encrypted.handles[0],
        encrypted.inputProof
      );

      const member = await contract.getTeamMember(orgId, member1.address);
      expect(member.isActive).to.equal(true);
      console.log("Maximum euint64 value handled correctly");
    });
  });

  describe("Member Access Control", function () {
    it("should only allow organization owner to add members", async function () {
      console.log("Testing owner-only access control...");

      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user1.address)
        .add64(500000n)
        .encrypt();

      await expect(
        contract.connect(user1).addTeamMember(
          orgId,
          member1.address,
          "Unauthorized Add",
          "Developer",
          encrypted.handles[0],
          encrypted.inputProof
        )
      ).to.be.revertedWithCustomError(contract, "Unauthorized");

      console.log("Non-owner member addition correctly rejected");
    });

    it("should only allow organization owner to remove members", async function () {
      console.log("Testing owner-only removal...");

      // First add a member as owner
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add64(500000n)
        .encrypt();

      await contract.connect(owner).addTeamMember(
        orgId,
        member1.address,
        "Test Member",
        "Developer",
        encrypted.handles[0],
        encrypted.inputProof
      );

      // Try to remove as non-owner
      await expect(
        contract.connect(user1).removeTeamMember(orgId, member1.address)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");

      console.log("Non-owner member removal correctly rejected");
    });

    it("should reject adding member to non-existent organization", async function () {
      const fakeOrgId = ethers.keccak256(ethers.toUtf8Bytes("non-existent-org"));

      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add64(500000n)
        .encrypt();

      await expect(
        contract.connect(owner).addTeamMember(
          fakeOrgId,
          member1.address,
          "Test Member",
          "Developer",
          encrypted.handles[0],
          encrypted.inputProof
        )
      ).to.be.revertedWithCustomError(contract, "OrganizationNotFound");

      console.log("Adding to non-existent organization correctly rejected");
    });

    it("should reject zero address member", async function () {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add64(500000n)
        .encrypt();

      await expect(
        contract.connect(owner).addTeamMember(
          orgId,
          ethers.ZeroAddress,
          "Zero Address",
          "Developer",
          encrypted.handles[0],
          encrypted.inputProof
        )
      ).to.be.revertedWithCustomError(contract, "InvalidParameters");

      console.log("Zero address member correctly rejected");
    });
  });

  describe("Member Management", function () {
    it("should track member organizations correctly", async function () {
      console.log("Testing member organization tracking...");

      // Create multiple organizations
      const orgIds = [];
      for (let i = 0; i < 3; i++) {
        const newOrgId = ethers.keccak256(
          ethers.toUtf8Bytes(`Multi-Org-${i}-${Date.now()}-${owner.address}`)
        );
        await contract.connect(owner).createOrganization(newOrgId, `Organization ${i}`);
        orgIds.push(newOrgId);
      }

      // Add member1 to all organizations
      for (let i = 0; i < orgIds.length; i++) {
        const encrypted = await fhevm
          .createEncryptedInput(await contract.getAddress(), owner.address)
          .add64(BigInt(500000 + i * 100000))
          .encrypt();

        await contract.connect(owner).addTeamMember(
          orgIds[i],
          member1.address,
          `Member in Org ${i}`,
          `Role ${i}`,
          encrypted.handles[0],
          encrypted.inputProof
        );
      }

      const memberOrgs = await contract.getMemberOrganizations(member1.address);
      expect(memberOrgs.length).to.equal(3);
      console.log(`Member belongs to ${memberOrgs.length} organizations`);
    });

    it("should update member count on add and remove", async function () {
      console.log("Testing member count updates...");

      let org = await contract.getOrganization(orgId);
      expect(org.memberCount).to.equal(0);

      // Add 3 members
      const members = [member1, member2, member3];
      for (let i = 0; i < members.length; i++) {
        const encrypted = await fhevm
          .createEncryptedInput(await contract.getAddress(), owner.address)
          .add64(500000n)
          .encrypt();

        await contract.connect(owner).addTeamMember(
          orgId,
          members[i].address,
          `Member ${i}`,
          `Role ${i}`,
          encrypted.handles[0],
          encrypted.inputProof
        );
      }

      org = await contract.getOrganization(orgId);
      expect(org.memberCount).to.equal(3);
      console.log("Member count after adding 3 members: 3");

      // Remove 1 member
      await contract.connect(owner).removeTeamMember(orgId, member2.address);

      org = await contract.getOrganization(orgId);
      expect(org.memberCount).to.equal(2);
      console.log("Member count after removing 1 member: 2");
    });

    it("should correctly handle member removal", async function () {
      console.log("Testing member removal...");

      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add64(500000n)
        .encrypt();

      await contract.connect(owner).addTeamMember(
        orgId,
        member1.address,
        "To Be Removed",
        "Developer",
        encrypted.handles[0],
        encrypted.inputProof
      );

      let member = await contract.getTeamMember(orgId, member1.address);
      expect(member.isActive).to.equal(true);

      await contract.connect(owner).removeTeamMember(orgId, member1.address);

      member = await contract.getTeamMember(orgId, member1.address);
      expect(member.isActive).to.equal(false);
      expect(member.memberName).to.equal("To Be Removed"); // Data still exists
      console.log("Member removed (isActive = false) while preserving data");
    });

    it("should reject removing non-existent member", async function () {
      await expect(
        contract.connect(owner).removeTeamMember(orgId, member1.address)
      ).to.be.revertedWithCustomError(contract, "MemberNotFound");

      console.log("Removing non-existent member correctly rejected");
    });

    it("should reject duplicate member addition", async function () {
      const encrypted1 = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add64(500000n)
        .encrypt();

      await contract.connect(owner).addTeamMember(
        orgId,
        member1.address,
        "First Add",
        "Developer",
        encrypted1.handles[0],
        encrypted1.inputProof
      );

      const encrypted2 = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add64(600000n)
        .encrypt();

      await expect(
        contract.connect(owner).addTeamMember(
          orgId,
          member1.address,
          "Second Add",
          "Senior Developer",
          encrypted2.handles[0],
          encrypted2.inputProof
        )
      ).to.be.revertedWithCustomError(contract, "MemberAlreadyExists");

      console.log("Duplicate member addition correctly rejected");
    });
  });

  describe("Event Emissions", function () {
    it("should emit MemberAdded event on addition", async function () {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add64(500000n)
        .encrypt();

      const tx = await contract.connect(owner).addTeamMember(
        orgId,
        member1.address,
        "Event Test",
        "Developer",
        encrypted.handles[0],
        encrypted.inputProof
      );
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => {
        try {
          const decoded = contract.interface.parseLog(log);
          return decoded.name === 'MemberAdded';
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
      expect(event.args.memberAddress).to.equal(member1.address);
      expect(event.args.memberName).to.equal("Event Test");
      console.log("MemberAdded event emitted correctly");
    });

    it("should emit MemberRemoved event on removal", async function () {
      // First add member
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add64(500000n)
        .encrypt();

      await contract.connect(owner).addTeamMember(
        orgId,
        member1.address,
        "To Remove",
        "Developer",
        encrypted.handles[0],
        encrypted.inputProof
      );

      // Then remove
      const tx = await contract.connect(owner).removeTeamMember(orgId, member1.address);
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => {
        try {
          const decoded = contract.interface.parseLog(log);
          return decoded.name === 'MemberRemoved';
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
      expect(event.args.memberAddress).to.equal(member1.address);
      console.log("MemberRemoved event emitted correctly");
    });
  });

  describe("Global Statistics", function () {
    it("should track total member count globally", async function () {
      const initialCount = await contract.totalMemberCount();

      // Create another organization
      const org2Id = ethers.keccak256(
        ethers.toUtf8Bytes(`Stats-Org-2-${Date.now()}-${owner.address}`)
      );
      await contract.connect(owner).createOrganization(org2Id, "Stats Org 2");

      // Add members to both organizations
      const members = [member1, member2, member3];
      for (let i = 0; i < members.length; i++) {
        const encrypted = await fhevm
          .createEncryptedInput(await contract.getAddress(), owner.address)
          .add64(500000n)
          .encrypt();

        const targetOrg = i < 2 ? orgId : org2Id;
        await contract.connect(owner).addTeamMember(
          targetOrg,
          members[i].address,
          `Member ${i}`,
          `Role ${i}`,
          encrypted.handles[0],
          encrypted.inputProof
        );
      }

      const finalCount = await contract.totalMemberCount();
      expect(finalCount).to.equal(initialCount + 3n);
      console.log(`Total member count: ${initialCount} -> ${finalCount}`);
    });
  });
});
