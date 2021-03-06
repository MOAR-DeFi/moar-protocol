require('dotenv').config()
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');
require('hardhat-contract-sizer');

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.5.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.4.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: "https://rpc-mumbai.maticvigil.com",
      },
      allowUnlimitedContractSize: false,
      timeout: 999999999,
      blockGasLimit: 100_000_000,
      gas: 100_000_000,
      gasMultiplier: 1,
      gasPrice: 50_000_000_000, // 50 gwei
      accounts: {
        mnemonic: process.env.WALLET_MNEMONIC
      }
    },
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: {
        mnemonic: process.env.WALLET_MNEMONIC
      }
    },
    ropsten: {
      url: "https://ropsten.infura.io/v3/"+process.env.INFURA_KEY,
      gas: 5500000,
      accounts: {
        mnemonic: process.env.WALLET_MNEMONIC
      }
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/"+process.env.INFURA_KEY,
      gas: 5500000,
      accounts: {
        mnemonic: process.env.WALLET_MNEMONIC
      }
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      gas: 2_100_000,
      accounts: {
        mnemonic: process.env.WALLET_MNEMONIC
      }
    },
    kovan: {
      url: "https://kovan.infura.io/v3/"+process.env.INFURA_KEY,
      gas: 12500000,
      gasPrice: 10000000000,
      accounts: {
        mnemonic: process.env.WALLET_MNEMONIC
      }
    },
    main: {
      url: "https://mainnet.infura.io/v3/"+process.env.INFURA_KEY
    }
  },
  gasReporter: {
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_KEY
  },
  mocha: {
    timeout: 60000
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false,
    strict: true,
    only: [],
  }
};
