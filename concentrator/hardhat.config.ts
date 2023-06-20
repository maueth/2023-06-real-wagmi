import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-storage-layout";
import "hardhat-tracer";
import "@primitivefi/hardhat-dodoc";
import { config as dotEnvConfig } from 'dotenv';

dotEnvConfig();


const config: HardhatUserConfig = {
  dodoc: {
    runOnCompile: true,
    debugMode: false,
    freshOutput: true,
    include: ["Factory", "Multipool", "MultiStrategy", "Dispatcher"]
  },
  defaultNetwork: 'hardhat',
  gasReporter: {
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    showTimeSpent: true,
    enabled: true
  },
  paths: {
    sources: './contracts',
    tests: './test',
    artifacts: './artifacts',
    cache: './cache',
  },
  solidity: {
    compilers: [
      {
        version: '0.8.18',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }

        }
      },
      {
        version: '0.6.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }

        }
      }
    ]
  },
  networks: {
    hardhat: {
      //hardfork: "istanbul",
      forking: {
        url: `${process.env.ARCHIVE_NODE_RPC_URL}`,
        blockNumber: 17329500,
      },
      allowUnlimitedContractSize: false,
      blockGasLimit: 40000000,
      gas: 40000000,
      gasPrice: 'auto',
      loggingEnabled: false,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 5,
        accountsBalance: '1000000000000000000000000000000000',
        passphrase: "",
      },
    },
    polygon: {
      url: `${process.env.MAIN_POLYGON_RPC_URL}`,
      accounts: [`${process.env.PRIVATE_KEY_POLYGON}`],
      chainId: 137,
      gas: 10000000,
      gasPrice: 170000000000,
      // maxFeePerGas: 70000000000,
      // maxPriorityFeePerGas: 40000000000,
      loggingEnabled: true,
    },
  },
  mocha: {
    timeout: 100000,
  },
  etherscan: {
    apiKey: {
      polygon: `${process.env.POLIGONSCAN_API_KEY}`
    },
  }
};

export default config;
