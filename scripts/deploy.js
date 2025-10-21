const hre = require("hardhat");

async function main() {
  console.log("Deploying PayrollManager contract to Sepolia...");

  const PayrollManager = await hre.ethers.getContractFactory("PayrollManager");
  const payrollManager = await PayrollManager.deploy();

  await payrollManager.waitForDeployment();

  const address = await payrollManager.getAddress();

  console.log("\n✅ PayrollManager deployed to:", address);
  console.log("\nUpdate your frontend CONTRACT_ADDRESS to:", address);
  console.log("\nVerify on Etherscan:");
  console.log(`npx hardhat verify --network sepolia ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
