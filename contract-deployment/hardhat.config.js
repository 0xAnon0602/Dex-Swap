require("@nomiclabs/hardhat-waffle");
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 5000,
        details: { yul: false },
      },
    }
  },
  defaultNetwork: "localhost",
  networks: {
    fantom:{
      url: `https://rpc.testnet.fantom.network`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 4002,
   }
 },
};