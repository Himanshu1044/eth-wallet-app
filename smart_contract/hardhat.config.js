// https://eth-sepolia.g.alchemy.com/v2/iPKdpOGRTEtKfnwIe8eJ8


require("@nomicfoundation/hardhat-toolbox");


module.exports = {
  solidity:'0.8.0',
  networks:{
    sepolia:{
      url:"https://eth-sepolia.g.alchemy.com/v2/iPKdpOGRTEtKfnwIe8eJ8",
      accounts:['2b75c4bddd5f96b0563ef31b69c8cf282ba6e25d24d69ffe4af9de5af1fa70ed']
    }
  }
}