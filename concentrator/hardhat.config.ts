import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-storage-layout";
import "hardhat-tracer";
import "@primitivefi/hardhat-dodoc";
import { config as dotEnvConfig } from "dotenv";

dotEnvConfig();

const POLYGON_FORK_BLOCK_NUMBER = 44220231;

const config: HardhatUserConfig = {
    dodoc: {
        runOnCompile: true,
        debugMode: false,
        freshOutput: true,
        include: ["Factory", "Multipool", "MultiStrategy", "Dispatcher"],
    },
    defaultNetwork: "hardhat",
    // gasReporter: {
    //     currency: "USD",
    //     coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    //     showTimeSpent: true,
    //     enabled: true,
    // },
    paths: {
        sources: "./contracts",
        tests: "./test",
        artifacts: "./artifacts",
        cache: "./cache",
    },
    solidity: {
        compilers: [
            {
                version: "0.8.18",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: "0.6.12",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        hardhat: {
            forking: {
                url: process.env.POLYGON_RPC,
                blockNumber: POLYGON_FORK_BLOCK_NUMBER,
            },
        },
    },
};

export default config;
