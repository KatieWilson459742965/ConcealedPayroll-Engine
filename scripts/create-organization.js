const { ethers } = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0xd13Af84D1399e22aBe6258E31AC3dD4b33f8D618";

  const [deployer] = await ethers.getSigners();
  console.log("Creating organization with account:", deployer.address);

  const PayrollManager = await ethers.getContractAt("PayrollManager", CONTRACT_ADDRESS);

  // Create organization
  const orgName = "Demo Company";
  const timestamp = Date.now();
  const orgId = ethers.keccak256(
    ethers.toUtf8Bytes(`${orgName}-${timestamp}-${deployer.address}`)
  );

  console.log("Organization ID:", orgId);
  console.log("Organization Name:", orgName);

  const tx = await PayrollManager.createOrganization(orgId, orgName);
  console.log("Transaction hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);
  console.log("Organization created successfully!");

  // Verify
  const org = await PayrollManager.getOrganization(orgId);
  console.log("\nOrganization Details:");
  console.log("- Name:", org.organizationName);
  console.log("- Owner:", org.owner);
  console.log("- Created At:", new Date(Number(org.createdAt) * 1000).toISOString());
  console.log("- Member Count:", org.memberCount.toString());
  console.log("- Is Active:", org.isActive);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
