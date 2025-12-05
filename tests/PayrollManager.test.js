const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("PayrollManager - Basic Functionality Tests", function () {
  let contract;
  let owner, user1, user2, member1, member2;

  beforeEach(async function () {
    if (!fhevm.isMock) {
      throw new Error("This test must run in FHEVM mock environment");
    }

    await fhevm.initializeCLIApi();
    [owner, user1, user2, member1, member2] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("PayrollManager");
    const deployed = await Factory.deploy();
    await deployed.waitForDeployment();
    contract = deployed;
  });

  it("should deploy contract successfully", async function () {
    expect(await contract.getAddress()).to.be.properAddress;
    console.log("Contract deployed at:", await contract.getAddress());
  });

  it("should have correct initial statistics", async function () {
    const orgCount = await contract.organizationCount();
    const memberCount = await contract.totalMemberCount();
    const distCount = await contract.distributionCount();

    expect(orgCount).to.equal(0);
    expect(memberCount).to.equal(0);
    expect(distCount).to.equal(0);
    console.log("Initial statistics verified: 0 organizations, 0 members, 0 distributions");
  });

  it("should create organization successfully", async function () {
    const orgName = "Test Company";
    const orgId = ethers.keccak256(
      ethers.toUtf8Bytes(`${orgName}-${Date.now()}-${owner.address}`)
    );

    await contract.connect(owner).createOrganization(orgId, orgName);

    const org = await contract.getOrganization(orgId);
    expect(org.organizationName).to.equal(orgName);
    expect(org.owner).to.equal(owner.address);
    expect(org.isActive).to.equal(true);
    expect(org.memberCount).to.equal(0);
    console.log("Organization created successfully:", orgName);
  });

  it("should reject duplicate organization ID", async function () {
    const orgName = "Test Company";
    const orgId = ethers.keccak256(
      ethers.toUtf8Bytes(`${orgName}-fixed-${owner.address}`)
    );

    await contract.connect(owner).createOrganization(orgId, orgName);

    await expect(
      contract.connect(owner).createOrganization(orgId, "Another Name")
    ).to.be.revertedWithCustomError(contract, "OrganizationAlreadyExists");
    console.log("Duplicate organization ID correctly rejected");
  });

  it("should reject empty organization name", async function () {
    const orgId = ethers.keccak256(
      ethers.toUtf8Bytes(`empty-${Date.now()}-${owner.address}`)
    );

    await expect(
      contract.connect(owner).createOrganization(orgId, "")
    ).to.be.revertedWithCustomError(contract, "InvalidParameters");
    console.log("Empty organization name correctly rejected");
  });

  it("should add team member with encrypted salary", async function () {
    // Create organization first
    const orgName = "Tech Corp";
    const orgId = ethers.keccak256(
      ethers.toUtf8Bytes(`${orgName}-${Date.now()}-${owner.address}`)
    );
    await contract.connect(owner).createOrganization(orgId, orgName);

    // Create encrypted salary (5000.00 USD = 500000 cents)
    const salaryInCents = 500000n;
    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), owner.address)
      .add64(salaryInCents)
      .encrypt();

    // Add member
    await contract.connect(owner).addTeamMember(
      orgId,
      member1.address,
      "John Doe",
      "Developer",
      encrypted.handles[0],
      encrypted.inputProof
    );

    const member = await contract.getTeamMember(orgId, member1.address);
    expect(member.memberName).to.equal("John Doe");
    expect(member.role).to.equal("Developer");
    expect(member.isActive).to.equal(true);
    console.log("Team member added with encrypted salary");
  });

  it("should update organization member count after adding member", async function () {
    // Create organization
    const orgName = "Member Count Test";
    const orgId = ethers.keccak256(
      ethers.toUtf8Bytes(`${orgName}-${Date.now()}-${owner.address}`)
    );
    await contract.connect(owner).createOrganization(orgId, orgName);

    // Add first member
    const encrypted1 = await fhevm
      .createEncryptedInput(await contract.getAddress(), owner.address)
      .add64(300000n)
      .encrypt();

    await contract.connect(owner).addTeamMember(
      orgId,
      member1.address,
      "Member One",
      "Engineer",
      encrypted1.handles[0],
      encrypted1.inputProof
    );

    let org = await contract.getOrganization(orgId);
    expect(org.memberCount).to.equal(1);

    // Add second member
    const encrypted2 = await fhevm
      .createEncryptedInput(await contract.getAddress(), owner.address)
      .add64(400000n)
      .encrypt();

    await contract.connect(owner).addTeamMember(
      orgId,
      member2.address,
      "Member Two",
      "Designer",
      encrypted2.handles[0],
      encrypted2.inputProof
    );

    org = await contract.getOrganization(orgId);
    expect(org.memberCount).to.equal(2);
    console.log("Organization member count updated correctly: 2 members");
  });

  it("should reject adding member to non-existent organization", async function () {
    const fakeOrgId = ethers.keccak256(ethers.toUtf8Bytes("non-existent"));

    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), owner.address)
      .add64(300000n)
      .encrypt();

    await expect(
      contract.connect(owner).addTeamMember(
        fakeOrgId,
        member1.address,
        "Test Member",
        "Role",
        encrypted.handles[0],
        encrypted.inputProof
      )
    ).to.be.revertedWithCustomError(contract, "OrganizationNotFound");
    console.log("Adding member to non-existent organization correctly rejected");
  });

  it("should reject non-owner adding member", async function () {
    // Create organization with owner
    const orgName = "Owner Test";
    const orgId = ethers.keccak256(
      ethers.toUtf8Bytes(`${orgName}-${Date.now()}-${owner.address}`)
    );
    await contract.connect(owner).createOrganization(orgId, orgName);

    // Try to add member from non-owner account
    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add64(300000n)
      .encrypt();

    await expect(
      contract.connect(user1).addTeamMember(
        orgId,
        member1.address,
        "Test Member",
        "Role",
        encrypted.handles[0],
        encrypted.inputProof
      )
    ).to.be.revertedWithCustomError(contract, "Unauthorized");
    console.log("Non-owner adding member correctly rejected");
  });

  it("should reject duplicate member", async function () {
    // Create organization
    const orgName = "Duplicate Test";
    const orgId = ethers.keccak256(
      ethers.toUtf8Bytes(`${orgName}-${Date.now()}-${owner.address}`)
    );
    await contract.connect(owner).createOrganization(orgId, orgName);

    // Add member first time
    const encrypted1 = await fhevm
      .createEncryptedInput(await contract.getAddress(), owner.address)
      .add64(300000n)
      .encrypt();

    await contract.connect(owner).addTeamMember(
      orgId,
      member1.address,
      "John Doe",
      "Developer",
      encrypted1.handles[0],
      encrypted1.inputProof
    );

    // Try to add same member again
    const encrypted2 = await fhevm
      .createEncryptedInput(await contract.getAddress(), owner.address)
      .add64(400000n)
      .encrypt();

    await expect(
      contract.connect(owner).addTeamMember(
        orgId,
        member1.address,
        "John Doe Again",
        "Senior Developer",
        encrypted2.handles[0],
        encrypted2.inputProof
      )
    ).to.be.revertedWithCustomError(contract, "MemberAlreadyExists");
    console.log("Duplicate member correctly rejected");
  });

  it("should remove team member successfully", async function () {
    // Create organization and add member
    const orgName = "Remove Test";
    const orgId = ethers.keccak256(
      ethers.toUtf8Bytes(`${orgName}-${Date.now()}-${owner.address}`)
    );
    await contract.connect(owner).createOrganization(orgId, orgName);

    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), owner.address)
      .add64(300000n)
      .encrypt();

    await contract.connect(owner).addTeamMember(
      orgId,
      member1.address,
      "John Doe",
      "Developer",
      encrypted.handles[0],
      encrypted.inputProof
    );

    // Verify member is active
    let member = await contract.getTeamMember(orgId, member1.address);
    expect(member.isActive).to.equal(true);

    // Remove member
    await contract.connect(owner).removeTeamMember(orgId, member1.address);

    // Verify member is inactive
    member = await contract.getTeamMember(orgId, member1.address);
    expect(member.isActive).to.equal(false);

    // Verify member count decreased
    const org = await contract.getOrganization(orgId);
    expect(org.memberCount).to.equal(0);
    console.log("Team member removed successfully");
  });

  it("should get all organizations owned by an address", async function () {
    // Create multiple organizations
    const orgIds = [];
    for (let i = 0; i < 3; i++) {
      const orgName = `Company ${i}`;
      const orgId = ethers.keccak256(
        ethers.toUtf8Bytes(`${orgName}-${Date.now()}-${i}-${owner.address}`)
      );
      await contract.connect(owner).createOrganization(orgId, orgName);
      orgIds.push(orgId);
    }

    const ownerOrgs = await contract.getOwnerOrganizations(owner.address);
    expect(ownerOrgs.length).to.equal(3);
    console.log("Retrieved 3 organizations owned by address");
  });

  it("should get all members of an organization", async function () {
    // Create organization
    const orgName = "Members List Test";
    const orgId = ethers.keccak256(
      ethers.toUtf8Bytes(`${orgName}-${Date.now()}-${owner.address}`)
    );
    await contract.connect(owner).createOrganization(orgId, orgName);

    // Add multiple members
    const members = [member1, member2];
    for (let i = 0; i < members.length; i++) {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), owner.address)
        .add64(BigInt(300000 + i * 50000))
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

    const memberList = await contract.getOrganizationMembers(orgId);
    expect(memberList.length).to.equal(2);
    expect(memberList[0]).to.equal(member1.address);
    expect(memberList[1]).to.equal(member2.address);
    console.log("Retrieved all organization members");
  });
});
