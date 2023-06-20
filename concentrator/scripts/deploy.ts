import hardhat, { ethers } from "hardhat";

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const [deployer] = await ethers.getSigners();

    // const USDT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';// DECIMALS 6
    // const WETH_ADDRESS = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619';// DECIMALS 18
    // const fee = 500;
    // const posWidth = 110;

    // const AltrecipeUniSwapV3 = await ethers.getContractFactory('AltrecipeUniSwapV3');
    // const altrecipeUniSwapV3 = await AltrecipeUniSwapV3.connect(deployer).deploy(USDT_ADDRESS, WETH_ADDRESS, fee, posWidth);
    // await altrecipeUniSwapV3.deployed();
    // console.log(
    //   `AltrecipeUniSwapV3  deployed to ${altrecipeUniSwapV3.address}`
    // );

    // await sleep(30000);

    // await hardhat.run('verify:verify', {
    //   address: altrecipeUniSwapV3.address,
    //   constructorArguments: [
    //     USDT_ADDRESS,
    //     WETH_ADDRESS,
    //     fee,
    //     posWidth
    //   ],
    // });

    //const contractAddress = "0x0Ff1b1c3b8099c45aF07da835B3B716D5db88C56";
    // const instance = await ethers.getContractAt('AltrecipeUniSwapV3', "0x0Ff1b1c3b8099c45aF07da835B3B716D5db88C56");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
