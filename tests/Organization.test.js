const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("PayrollManager - Organization Management Tests", function () {
  let contract;
  let owner, user1, user2, user3;

  beforeEach(async function () {
    if (!fhevm.isMock) {
      throw new Error("This test must run in FHEVM mock environment");
    }

    await fhevm.initializeCLIApi();
    [owner, user1, user2, user3] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("PayrollManager");
    const deployed = await Factory.deploy();
    await deployed.waitForDeployment();
    contract = deployed;

    console.log(`PayrollManager deployed at: ${await contract.getAddress()}`);
  });

  describe("Organization Creation", function () {
    it("should create organization with valid parameters", async function () {
      const orgName = "Acme Corporation";
      const orgId = ethers.keccak256(
        ethers.toUtf8Bytes(`${orgName}-${Date.now()}-${owner.address}`)
      );

      const tx = await contract.connect(owner).createOrganization(orgId, orgName);
      const receipt = await tx.wait();

      // Check event emission
      const event = receipt.logs.find(log => {
        try {
          const decoded = contract.interface.parseLog(log);
          return decoded.name === 'OrganizationCreated';
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
      console.log("OrganizationCreated event emitted correctly");

      // Verify organization data
      const org = await contract.getOrganization(orgId);
      expect(org.organizationName).to.equal(orgName);
      expect(org.owner).to.equal(owner.address);
      expect(org.isActive).to.equal(true);
      expect(org.memberCount).to.equal(0);
      expect(org.createdAt).to.be.gt(0);
      console.log("Organization data stored correctly");
    });

    it("should increment organization count", async function () {
      const initialCount = await contract.organizationCount();

      for (let i = 0; i < 5; i++) {
        const orgId = ethers.keccak256(
          ethers.toUtf8Bytes(`Org-${i}-${Date.now()}-${owner.address}`)
        );
        await contract.connect(owner).createOrganization(orgId, `Organization ${i}`);
      }

      const finalCount = await contract.organizationCount();
      expect(finalCount).to.equal(initialCount + 5n);
      console.log(`Organization count incremented: ${initialCount} -> ${finalCount}`);
    });

    it("should allow different users to create organizations", async function () {
      const users = [owner, user1, user2];

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const orgId = ethers.keccak256(
          ethers.toUtf8Bytes(`User${i}Org-${Date.now()}-${user.address}`)
        );
        await contract.connect(user).createOrganization(orgId, `User ${i} Organization`);

        const org = await contract.getOrganization(orgId);
        expect(org.owner).to.equal(user.address);
      }
      console.log("Multiple users created organizations successfully");
    });

    it("should handle organization names with special characters", async function () {
      const specialNames = [
        "Acme & Partners",
        "Tech (Pty) Ltd",
        "Company-123",
        "Test_Org",
        "International Co.",
      ];

      for (let i = 0; i < specialNames.length; i++) {
        const orgId = ethers.keccak256(
          ethers.toUtf8Bytes(`${specialNames[i]}-${Date.now()}-${i}-${owner.address}`)
        );
        await contract.connect(owner).createOrganization(orgId, specialNames[i]);

        const org = await contract.getOrganization(orgId);
        expect(org.organizationName).to.equal(specialNames[i]);
      }
      console.log("Special characters in organization names handled correctly");
    });

    it("should handle long organization names", async function () {
      const longName = "A".repeat(200); // 200 character name
      const orgId = ethers.keccak256(
        ethers.toUtf8Bytes(`${longName}-${Date.now()}-${owner.address}`)
      );

      await contract.connect(owner).createOrganization(orgId, longName);

      const org = await contract.getOrganization(orgId);
      expect(org.organizationName).to.equal(longName);
      console.log("Long organization name (200 chars) handled correctly");
    });
  });

  describe("Organization Validation", function () {
    it("should reject organization with empty name", async function () {
      const orgId = ethers.keccak256(
        ethers.toUtf8Bytes(`empty-${Date.now()}-${owner.address}`)
      );

      await expect(
        contract.connect(owner).createOrganization(orgId, "")
      ).to.be.revertedWithCustomError(contract, "InvalidParameters");
      console.log("Empty organization name rejected");
    });

    it("should reject duplicate organization ID", async function () {
      const orgId = ethers.keccak256(
        ethers.toUtf8Bytes(`duplicate-test-${owner.address}`)
      );

      await contract.connect(owner).createOrganization(orgId, "First Org");

      await expect(
        contract.connect(owner).createOrganization(orgId, "Second Org")
      ).to.be.revertedWithCustomError(contract, "OrganizationAlreadyExists");
      console.log("Duplicate organization ID rejected");
    });

    it("should allow same name with different IDs", async function () {
      const sameName = "Same Name Corp";
      const orgId1 = ethers.keccak256(
        ethers.toUtf8Bytes(`${sameName}-1-${Date.now()}-${owner.address}`)
      );
      const orgId2 = ethers.keccak256(
        ethers.toUtf8Bytes(`${sameName}-2-${Date.now()}-${owner.address}`)
      );

      await contract.connect(owner).createOrganization(orgId1, sameName);
      await contract.connect(owner).createOrganization(orgId2, sameName);

      const org1 = await contract.getOrganization(orgId1);
      const org2 = await contract.getOrganization(orgId2);

      expect(org1.organizationName).to.equal(sameName);
      expect(org2.organizationName).to.equal(sameName);
      console.log("Organizations with same name but different IDs allowed");
    });
  });

  describe("Organization Queries", function () {
    let orgIds = [];

    beforeEach(async function () {
      orgIds = [];
      // Create 3 organizations for owner
      for (let i = 0; i < 3; i++) {
        const orgId = ethers.keccak256(
          ethers.toUtf8Bytes(`Owner-Org-${i}-${Date.now()}-${owner.address}`)
        );
        await contract.connect(owner).createOrganization(orgId, `Owner Org ${i}`);
        orgIds.push(orgId);
      }
    });

    it("should return all organizations owned by address", async function () {
      const ownerOrgs = await contract.getOwnerOrganizations(owner.address);
      expect(ownerOrgs.length).to.equal(3);

      for (let i = 0; i < orgIds.length; i++) {
        expect(ownerOrgs[i]).to.equal(orgIds[i]);
      }
      console.log("Owner organizations query returned correct data");
    });

    it("should return empty array for address with no organizations", async function () {
      const emptyOrgs = await contract.getOwnerOrganizations(user3.address);
      expect(emptyOrgs.length).to.equal(0);
      console.log("Empty array returned for address with no organizations");
    });

    it("should track organizations correctly across multiple users", async function () {
      // Create org for user1
      const user1OrgId = ethers.keccak256(
        ethers.toUtf8Bytes(`User1-Org-${Date.now()}-${user1.address}`)
      );
      await contract.connect(user1).createOrganization(user1OrgId, "User1 Org");

      // Create 2 orgs for user2
      for (let i = 0; i < 2; i++) {
        const orgId = ethers.keccak256(
          ethers.toUtf8Bytes(`User2-Org-${i}-${Date.now()}-${user2.address}`)
        );
        await contract.connect(user2).createOrganization(orgId, `User2 Org ${i}`);
      }

      const ownerOrgs = await contract.getOwnerOrganizations(owner.address);
      const user1Orgs = await contract.getOwnerOrganizations(user1.address);
      const user2Orgs = await contract.getOwnerOrganizations(user2.address);

      expect(ownerOrgs.length).to.equal(3);
      expect(user1Orgs.length).to.equal(1);
      expect(user2Orgs.length).to.equal(2);
      console.log("Organizations tracked correctly per user");
    });
  });

  describe("Organization Statistics", function () {
    it("should maintain accurate global organization count", async function () {
      const startCount = await contract.organizationCount();

      // Create organizations from different users
      const users = [owner, user1, user2];
      for (let i = 0; i < users.length; i++) {
        for (let j = 0; j < 2; j++) {
          const orgId = ethers.keccak256(
            ethers.toUtf8Bytes(`Stats-Org-${i}-${j}-${Date.now()}-${users[i].address}`)
          );
          await contract.connect(users[i]).createOrganization(orgId, `Stats Org ${i}-${j}`);
        }
      }

      const endCount = await contract.organizationCount();
      expect(endCount).to.equal(startCount + 6n);
      console.log(`Organization count: ${startCount} -> ${endCount} (+6)`);
    });

    it("should store correct creation timestamp", async function () {
      const beforeTime = (await ethers.provider.getBlock('latest')).timestamp;

      const orgId = ethers.keccak256(
        ethers.toUtf8Bytes(`Timestamp-Test-${Date.now()}-${owner.address}`)
      );
      await contract.connect(owner).createOrganization(orgId, "Timestamp Test Org");

      const afterTime = (await ethers.provider.getBlock('latest')).timestamp;

      const org = await contract.getOrganization(orgId);
      expect(org.createdAt).to.be.gte(beforeTime);
      expect(org.createdAt).to.be.lte(afterTime);
      console.log(`Organization created at timestamp: ${org.createdAt}`);
    });
  });

  describe("Edge Cases", function () {
    it("should handle rapid organization creation", async function () {
      const startTime = Date.now();
      const count = 20;

      for (let i = 0; i < count; i++) {
        const orgId = ethers.keccak256(
          ethers.toUtf8Bytes(`Rapid-${i}-${Date.now()}-${owner.address}`)
        );
        await contract.connect(owner).createOrganization(orgId, `Rapid Org ${i}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      const totalCount = await contract.organizationCount();
      expect(totalCount).to.be.gte(count);
      console.log(`Created ${count} organizations in ${duration}ms`);
    });

    it("should handle unicode organization names", async function () {
      const unicodeNames = [
        "测试公司",      // Chinese
        "テスト会社",    // Japanese
        "Компания",     // Russian
        "Entreprise",  // French accent-able
        "Unternehmen", // German
      ];

      for (let i = 0; i < unicodeNames.length; i++) {
        const orgId = ethers.keccak256(
          ethers.toUtf8Bytes(`Unicode-${i}-${Date.now()}-${owner.address}`)
        );
        await contract.connect(owner).createOrganization(orgId, unicodeNames[i]);

        const org = await contract.getOrganization(orgId);
        expect(org.organizationName).to.equal(unicodeNames[i]);
      }
      console.log("Unicode organization names handled correctly");
    });
  });
});
