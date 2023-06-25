const { expect } = require("chai");

describe("Multipool", async () => {
    let owner;

    beforeEach(async () => {
        [owner] = await ethers.getSigners();
        const DAI_ADDRESS = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"; // decimals 1e18
        const USDC_ADDRESS = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"; // decimals 1e6
        const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

        // Setup tokens
        this.dai = await ethers.getContractAt(
            "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
            DAI_ADDRESS
        );
        this.usdc = await ethers.getContractAt(
            "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
            USDC_ADDRESS
        );

        // Setup Whale
        const WHALE = "0xf977814e90da44bfa03b6295a0616a897441acec";
        const whaleSigner = await ethers.getImpersonatedSigner(WHALE);
        console.log("\n");
        console.log("WHALE dai  balance ", (await this.dai.balanceOf(whaleSigner.address)) / 1e18);
        console.log("WHALE usdc balance ", (await this.usdc.balanceOf(whaleSigner.address)) / 1e6);

        // Transfer dai and usd to owner
        await this.dai
            .connect(whaleSigner)
            .transfer(owner.address, ethers.utils.parseUnits("1000", 18));
        await this.usdc
            .connect(whaleSigner)
            .transfer(owner.address, ethers.utils.parseUnits("1000", 6));
        console.log("\n");
        console.log("OWNER dai  balance ", (await this.dai.balanceOf(owner.address)) / 1e18);
        console.log("OWNER usdc balance ", (await this.usdc.balanceOf(owner.address)) / 1e6);

        // Setup MultiStrategy
        const multiStrategyFactory = await ethers.getContractFactory(
            "contracts/MultiStrategy.sol:MultiStrategy"
        );
        this.multiStrategy = await multiStrategyFactory.deploy(
            DAI_ADDRESS,
            USDC_ADDRESS,
            owner.address
        );

        // Setup MultiPool
        const multipoolFactory = await ethers.getContractFactory(
            "contracts/Multipool.sol:Multipool"
        );
        this.multipool = await multipoolFactory.deploy(
            DAI_ADDRESS,
            USDC_ADDRESS,
            owner.address,
            UNISWAP_V3_FACTORY,
            this.multiStrategy.address,
            "DAI/USDC",
            "DAI/USDC",
            [500, 3000, 10000]
        );

        // Setup MultiStrategy
        await strategySetup(this.multiStrategy, this.multipool.address);
    });

    it.only("finding 1", async () => {
        // maxTotalSupply 1e20
        const amount0Desired = ethers.utils.parseUnits("1.1", 6);
        const amount1Desired = ethers.utils.parseUnits("1.1", 6);

        const amount0Min = 0;
        const amount1Min = 0;

        await this.dai.approve(this.multipool.address, amount0Desired);
        await this.usdc.approve(this.multipool.address, amount1Desired);

        await this.multipool.deposit(amount0Desired, amount1Desired, amount0Min, amount1Min);
    });
});

const strategySetup = async (multistrategy, multipoolAddress) => {
    const strategy500 = {
        tickSpacingOffset: 0,
        positionRange: 50,
        poolFeeAmt: 500,
        weight: 5000,
    }; // tickSpacing = 10
    const strategy3000 = {
        tickSpacingOffset: 0,
        positionRange: 420,
        poolFeeAmt: 3000,
        weight: 3000,
    }; // tickSpacing = 60
    const strategy10000_left = {
        tickSpacingOffset: -200,
        positionRange: 800,
        poolFeeAmt: 10000,
        weight: 1000,
    }; // tickSpacing = 200
    const strategy10000_right = {
        tickSpacingOffset: 200,
        positionRange: 800,
        poolFeeAmt: 10000,
        weight: 1000,
    }; // tickSpacing = 200

    const strategy = [strategy500, strategy3000, strategy10000_left, strategy10000_right];

    await multistrategy.setMultipool(multipoolAddress);
    await multistrategy.setStrategy(strategy);
};
