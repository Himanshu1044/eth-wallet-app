// const main = async () => {
//   const Transactions = await hre.ethers.getContractFactory("Transactions");

//   // If your constructor has no arguments, leave it empty
//   const transactions = await Transactions.deploy("Hello, Hardhat");

//   // Wait for deployment (Ethers v6 way)
//   await transactions.waitForDeployment();

//   console.log("Transactions deployed to:", await transactions.getAddress());
// };

// const runMain = async () => {
//   try {
//     await main();
//     process.exit(0);
//   } catch (error) {
//     console.error(error);
//     process.exit(1);
//   }
// };

// runMain();

const hre = require("hardhat");

const main = async () => {
  const Transactions = await hre.ethers.getContractFactory("Transactions");

  // ✅ deploy without constructor args
  const transactions = await Transactions.deploy();

  // ✅ wait for deployment
  await transactions.waitForDeployment();

  console.log("Transactions deployed to:", await transactions.getAddress());
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();
