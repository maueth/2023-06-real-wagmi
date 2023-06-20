import {
    time,
    mine,
    mineUpTo,
    takeSnapshot,
    SnapshotRestorer,
    impersonateAccount,
} from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { tracer, ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
    IERC20,
    IUniswapV3Pool,
    Factory,
    Multipool,
    MultiPoolCode,
    ISwapRouter,
    IMultiStrategy,
    MultiStrategy,
    AggregatorMock,
    DispatcherCode,
    Dispatcher,
} from "../typechain-types";
import { BigNumber } from "@ethersproject/bignumber";
import { encodePath } from "./testsHelpers/path";
const { constants } = ethers;

describe("Concentrator", () => {
    const DONOR_ADDRESS = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46";
    const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // DECIMALS 6
    const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // DECIMALS 18
    const WETH_USDT_500_POOL_ADDRESS = "0x11b815efB8f581194ae79006d24E0d814B7697F6";
    const WETH_USDT_3000_POOL_ADDRESS = "0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36";
    const WETH_USDT_10000_POOL_ADDRESS = "0xC5aF84701f98Fa483eCe78aF83F11b6C38ACA71D";
    const SWAP_ROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
    // Mainnet, Goerli, Arbitrum, Optimism, Polygon
    const UNISWAP_FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
    const deviationBP = 990;//0.1 %

    let USDT: IERC20;
    let WETH: IERC20;
    let amountUSDT: BigNumber;
    let amountWETH: BigNumber;
    let factory: Factory;
    let multipool: Multipool;
    let multipoolCode: MultiPoolCode;
    let dispatcherCode: DispatcherCode;
    let dispatcher: Dispatcher;
    let multipoolERC20: IERC20;
    let multistrategy: MultiStrategy;
    let aggregatorMock: AggregatorMock;
    let pool500: IUniswapV3Pool;
    let pool3000: IUniswapV3Pool;
    let pool10000: IUniswapV3Pool;
    let owner: SignerWithAddress;
    let alice: SignerWithAddress;
    let bob: SignerWithAddress;
    let manager: SignerWithAddress;
    let trader: SignerWithAddress;
    let snapshot_before: SnapshotRestorer;
    let snapshot_strategy: SnapshotRestorer;
    let snapshot_deposit: SnapshotRestorer;
    let snapshot_swapTarget: SnapshotRestorer;
    let router: ISwapRouter;

    before(async () => {
        [owner, alice, bob, manager, trader] = await ethers.getSigners();

        const MultiPoolCode = await ethers.getContractFactory("MultiPoolCode");
        multipoolCode = await MultiPoolCode.deploy();
        const DispatcherCode = await ethers.getContractFactory("DispatcherCode");
        dispatcherCode = await DispatcherCode.deploy();

        const Factory = await ethers.getContractFactory("Factory");
        factory = await Factory.deploy(
            UNISWAP_FACTORY_ADDRESS,
            multipoolCode.address,
            dispatcherCode.address
        );
        await factory.deployed();
        const Dispatcher = await ethers.getContractFactory("Dispatcher");
        dispatcher = Dispatcher.attach(await factory.dispatcher());
        const AggregatorMockFactory = await ethers.getContractFactory("AggregatorMock");
        aggregatorMock = await AggregatorMockFactory.deploy();
        await aggregatorMock.deployed();
        amountUSDT = ethers.utils.parseUnits("10000", 6);
        amountWETH = ethers.utils.parseUnits("100", 18);
        router = await ethers.getContractAt("ISwapRouter", SWAP_ROUTER_ADDRESS);
        USDT = await ethers.getContractAt("IERC20", USDT_ADDRESS);
        WETH = await ethers.getContractAt("IERC20", WETH_ADDRESS);
        pool500 = await ethers.getContractAt("IUniswapV3Pool", WETH_USDT_500_POOL_ADDRESS);
        pool3000 = await ethers.getContractAt("IUniswapV3Pool", WETH_USDT_3000_POOL_ADDRESS);
        pool10000 = await ethers.getContractAt("IUniswapV3Pool", WETH_USDT_10000_POOL_ADDRESS);

        const ForceSend = await ethers.getContractFactory("ForceSend");
        let forceSend = await ForceSend.deploy();
        await forceSend.go(DONOR_ADDRESS, { value: ethers.utils.parseUnits("100", "ether") });
        await impersonateAccount(DONOR_ADDRESS);

        let donor = ethers.provider.getSigner(DONOR_ADDRESS);

        await WETH.connect(donor).transfer(owner.address, amountWETH);
        await WETH.connect(donor).transfer(alice.address, amountWETH);
        await WETH.connect(donor).transfer(bob.address, amountWETH);
        await WETH.connect(donor).transfer(manager.address, amountWETH);
        await WETH.connect(donor).transfer(trader.address, amountWETH);
        await WETH.connect(donor).transfer(aggregatorMock.address, amountWETH);

        await USDT.connect(donor).transfer(owner.address, amountUSDT);
        await USDT.connect(donor).transfer(alice.address, amountUSDT);
        await USDT.connect(donor).transfer(bob.address, amountUSDT);
        await USDT.connect(donor).transfer(manager.address, amountUSDT);
        await USDT.connect(donor).transfer(trader.address, amountUSDT);
        await USDT.connect(donor).transfer(aggregatorMock.address, amountUSDT);

        await USDT.connect(trader).approve(router.address, ethers.utils.parseUnits("1000000", 6));
        await WETH.connect(trader).approve(router.address, ethers.utils.parseUnits("100000", 18));

        snapshot_before = await takeSnapshot();
    });

    it("should deploy factory correctly", async () => {
        expect(factory.address).not.to.be.undefined;
    });

    it("should deploy dispatcher correctly", async () => {
        expect(dispatcher.address).not.to.be.undefined;
    });

    it("create multipool fails if token a == token b", async () => {
        const fees = [500, 3000, 10000];
        await expect(factory.createMultipool(USDT_ADDRESS, USDT_ADDRESS, manager.address, fees)).to
            .be.reverted;
    });

    it("create multipool fails if token a is 0 or token b is 0", async () => {
        const fees = [500, 3000, 10000];
        await expect(
            factory.createMultipool(USDT_ADDRESS, constants.AddressZero, manager.address, fees)
        ).to.be.reverted;
    });

    it("create multipool fails if invalid pool fee", async () => {
        const fees = [200, 500, 3000, 10000];
        await expect(factory.createMultipool(USDT_ADDRESS, WETH_ADDRESS, manager.address, fees)).to
            .be.reverted;
    });

    async function createMultipool(
        tokens: [string, string],
        fees: number[],
        menagerAddress: string = manager.address
    ) {
        await factory.createMultipool(tokens[0], tokens[1], menagerAddress, fees);

        const multipoolAddress = await factory.getmultipool(USDT_ADDRESS, WETH_ADDRESS);

        multipool = await ethers.getContractAt("Multipool", multipoolAddress);
        multipoolERC20 = await ethers.getContractAt("IERC20", multipool.address);

        multistrategy = await ethers.getContractAt("MultiStrategy", await multipool.strategy());

        expect(await multipool.token0()).to.be.equal(WETH_ADDRESS);
        expect(await multipool.token1()).to.be.equal(USDT_ADDRESS);
        expect(await multipool.owner()).to.be.equal(manager.address);

        expect((await multipool.underlyingTrustedPools(500)).poolAddress).to.be.equal(
            pool500.address
        );
        expect((await multipool.underlyingTrustedPools(3000)).poolAddress).to.be.equal(
            pool3000.address
        );
        expect((await multipool.underlyingTrustedPools(10000)).poolAddress).to.be.equal(
            pool10000.address
        );

        await USDT.connect(owner).approve(multipool.address, amountUSDT);
        await USDT.connect(manager).approve(multipool.address, amountUSDT);
        await USDT.connect(alice).approve(multipool.address, amountUSDT);
        await USDT.connect(bob).approve(multipool.address, amountUSDT);
        await WETH.connect(owner).approve(multipool.address, amountWETH);
        await WETH.connect(manager).approve(multipool.address, amountWETH);
        await WETH.connect(alice).approve(multipool.address, amountWETH);
        await WETH.connect(bob).approve(multipool.address, amountWETH);
    }

    async function simulateSwap(fee: number, swapAmountInUSDT: BigNumber) {
        let swapAmountInWETH = await factory.getQuoteAtTick(
            500,
            swapAmountInUSDT,
            USDT.address,
            WETH.address
        );
        const timestamp = await time.latest();

        // accmuluate token0 fees
        await router.connect(trader).exactInput({
            recipient: trader.address,
            deadline: timestamp + 10,
            path: encodePath([WETH.address, USDT.address], [fee]),
            amountIn: swapAmountInWETH,
            amountOutMinimum: 0,
        });

        // accmuluate token1 fees
        await router.connect(trader).exactInput({
            recipient: trader.address,
            deadline: timestamp + 10,
            path: encodePath([USDT.address, WETH.address], [fee]),
            amountIn: swapAmountInUSDT,
            amountOutMinimum: 0,
        });
    }

    it("should create multipool correctly", async () => {
        await createMultipool([USDT_ADDRESS, WETH_ADDRESS], [500, 3000, 10000], manager.address);
    });

    it("should add pool to dispatcher correctly", async () => {
        expect((await dispatcher.poolInfo(0)).multipool).to.be.equal(multipool.address);
        expect(await dispatcher.poolLength()).to.be.equal(1);
    });

    it("emits event CreateMultipool", async () => {
        await snapshot_before.restore();

        const fees = [500, 3000, 10000];

        await expect(factory.createMultipool(WETH_ADDRESS, USDT_ADDRESS, manager.address, fees))
            .to.emit(factory, "CreateMultipool")
            .withArgs(
                WETH_ADDRESS,
                USDT_ADDRESS,
                multipool.address,
                manager.address,
                await multipool.strategy()
            );
    });

    it("create multipool succeeds if tokens are passed in reverse", async () => {
        await snapshot_before.restore();

        await createMultipool([WETH_ADDRESS, USDT_ADDRESS], [500, 3000, 10000], manager.address);
    });

    it("create the same pool should fail", async () => {
        const fees = [500, 3000, 10000];
        await expect(factory.createMultipool(WETH_ADDRESS, USDT_ADDRESS, manager.address, fees)).to
            .be.reverted;
    });

    it("should set a strategy successfully for manager only", async () => {
        const strategy500: IMultiStrategy.StrategyStruct = {
            tickSpacingOffset: 0,
            positionRange: 50,
            poolFeeAmt: 500,
            weight: 5000,
        }; // tickSpacing = 10
        const strategy3000: IMultiStrategy.StrategyStruct = {
            tickSpacingOffset: 0,
            positionRange: 420,
            poolFeeAmt: 3000,
            weight: 3000,
        }; // tickSpacing = 60
        const strategy10000_left: IMultiStrategy.StrategyStruct = {
            tickSpacingOffset: -200,
            positionRange: 800,
            poolFeeAmt: 10000,
            weight: 1000,
        }; // tickSpacing = 200
        const strategy10000_right: IMultiStrategy.StrategyStruct = {
            tickSpacingOffset: 200,
            positionRange: 800,
            poolFeeAmt: 10000,
            weight: 1000,
        }; // tickSpacing = 200
        const strategy = [strategy500, strategy3000, strategy10000_left, strategy10000_right];

        await expect(multistrategy.connect(bob).setStrategy(strategy)).to.be.reverted;
        await expect(multistrategy.connect(alice).setStrategy(strategy)).to.be.reverted;
        await multistrategy.connect(manager).setStrategy(strategy);

        snapshot_strategy = await takeSnapshot();
    });

    it("should set a protocol FeeBP successfully for manager only", async () => {
        const protocolFeeBP = 1000; //10%
        const protocolFeeParamIndex = 1;
        await expect(multipool.connect(alice).setParam(protocolFeeParamIndex, protocolFeeBP)).to.be
            .reverted;
        await multipool.connect(manager).setParam(protocolFeeParamIndex, protocolFeeBP);
        const protocolFeeBP_INVALID = 15000; //150%
        await expect(
            multipool.connect(manager).setParam(protocolFeeParamIndex, protocolFeeBP_INVALID)
        ).to.be.reverted;
        await multipool.connect(manager).setParam(protocolFeeParamIndex, 0);
        const protocolFeeBP_DEFAULT = 2000; //20%
        await multipool.connect(manager).setParam(protocolFeeParamIndex, protocolFeeBP_DEFAULT);
    });

    it("a firs deposit fail if caller is not manager", async () => {
        const usdtAmountToDeposit = ethers.utils.parseUnits("1000", 6);
        const wethAmountToDeposit = await factory.getQuoteAtTick(
            500,
            usdtAmountToDeposit,
            USDT.address,
            WETH.address
        );

        await expect(multipool.deposit(wethAmountToDeposit, usdtAmountToDeposit, 0, 0)).to.be
            .reverted;
    });

    it("should make a deposit successfully", async () => {
        let usdtAmountToDeposit = ethers.utils.parseUnits("1000", 6);
        let wethAmountToDeposit = await factory.getQuoteAtTick(
            500,
            usdtAmountToDeposit,
            USDT.address,
            WETH.address
        );

        //                        token0 ==weth        token1 ==usdt
        await multipool.connect(manager).deposit(wethAmountToDeposit, usdtAmountToDeposit, 0, 0);

        [usdtAmountToDeposit, wethAmountToDeposit] = await factory.estimateDepositAmounts(
            USDT.address,
            WETH.address,
            usdtAmountToDeposit,
            0
        );
        await multipool.connect(alice).deposit(wethAmountToDeposit, usdtAmountToDeposit, 0, 0);
    });

    it("emits event Deposit", async () => {
        let usdtAmountToDeposit = ethers.utils.parseUnits("1000", 6);
        let wethAmountToDeposit: BigNumber;

        [usdtAmountToDeposit, wethAmountToDeposit] = await factory.estimateDepositAmounts(
            USDT.address,
            WETH.address,
            usdtAmountToDeposit,
            0
        );

        await expect(multipool.connect(bob).deposit(wethAmountToDeposit, usdtAmountToDeposit, 0, 0))
            .to.emit(multipool, "Deposit")
            .withArgs(bob.address, wethAmountToDeposit, usdtAmountToDeposit, 23570929945072);
        snapshot_deposit = await takeSnapshot();
    });

    it("dispatcher:should make a deposit successfully", async () => {
        let lpAmount = await multipoolERC20.balanceOf(bob.address);
        await multipoolERC20.connect(bob).approve(dispatcher.address, lpAmount);
        await dispatcher.connect(bob).deposit(0, lpAmount, deviationBP);
        expect(await multipoolERC20.balanceOf(dispatcher.address)).to.equal(lpAmount);
        expect((await dispatcher.userInfo(0, bob.address)).shares).to.equal(lpAmount);
    });

    it("dispatcher:should make a claim successfully", async () => {
        const lpAmountBefore = await multipoolERC20.balanceOf(dispatcher.address);
        // fees ==0
        await dispatcher.connect(bob).deposit(0, 0, deviationBP);

        const fees = [500, 3000, 10000];
        for (let i = 0; i < 3; i++) {
            await simulateSwap(fees[i], ethers.utils.parseUnits("500", 6));
        }

        let lpAmountRemoved;
        [lpAmountRemoved, ,] = await dispatcher.estimateClaim(0, bob.address);
        // claim
        await dispatcher.connect(bob).deposit(0, 0, deviationBP);

        expect((await dispatcher.userInfo(0, bob.address)).shares).to.equal(
            await multipoolERC20.balanceOf(dispatcher.address)
        );

        expect((await dispatcher.userInfo(0, bob.address)).shares).to.equal(
            lpAmountBefore.sub(lpAmountRemoved)
        );
    });

    it("dispatcher:should make a withdraw successfully", async () => {
        let lpAmountBob = await multipoolERC20.balanceOf(bob.address);
        let lpAmountDispatcher = await multipoolERC20.balanceOf(dispatcher.address);
        await dispatcher.connect(bob).withdraw(0, lpAmountDispatcher, deviationBP);
        expect(await multipoolERC20.balanceOf(dispatcher.address)).to.equal(0);
        expect((await dispatcher.userInfo(0, bob.address)).shares).to.equal(0);
        expect(await multipoolERC20.balanceOf(bob.address)).to.equal(
            lpAmountBob.add(lpAmountDispatcher)
        );
    });

    it("should set swap target successfully for manager only", async () => {
        await expect(
            multipool.connect(alice).manageSwapTarget(aggregatorMock.address, true)
        ).to.be.revertedWith("Ownable: caller is not the owner");
        await expect(
            multipool.connect(manager).manageSwapTarget(ethers.constants.AddressZero, true)
        ).to.be.reverted; // RevertErrorCode(26)
        await multipool.connect(manager).manageSwapTarget(aggregatorMock.address, true);
        snapshot_swapTarget = await takeSnapshot();
    });

    it("should fail if rebalance swapTarget Or operator not approved", async () => {
        const rebalanceParams: Multipool.RebalanceParamsStruct = {
            zeroForOne: true,
            swapTarget: bob.address,
            amountIn: BigNumber.from("10"),
            swapData: ethers.constants.HashZero,
        };

        await expect(multipool.connect(alice).rebalanceAll(rebalanceParams)).to.be.reverted; // RevertErrorCode(27)
        await expect(multipool.connect(manager).rebalanceAll(rebalanceParams)).to.be.reverted; // RevertErrorCode(29)
    });

    it("should fail if rebalance bad swap params successfully", async () => {
        await snapshot_swapTarget.restore();
        const amountIn = BigNumber.from("10");
        const swapParams = ethers.utils.defaultAbiCoder.encode(
            ["address", "address", "uint256", "uint256"],
            [USDT.address, USDT.address, amountIn, BigNumber.from("1")]
        );
        const tx = await aggregatorMock.populateTransaction.swap(swapParams);
        let swapData: string = "";
        if (tx.data !== undefined) swapData = tx.data.toString();
        const rebalanceParams: Multipool.RebalanceParamsStruct = {
            zeroForOne: true,
            swapTarget: aggregatorMock.address,
            amountIn: amountIn,
            swapData: swapData,
        };
        await expect(multipool.connect(manager).rebalanceAll(rebalanceParams)).to.be.reverted; // RevertErrorCode(25)
    });

    it("should rebalance successfully", async () => {
        await snapshot_swapTarget.restore();
        const amountIn = BigNumber.from("100000000000000000"); //0.1 eth
        const tokenIn = WETH.address;
        const tokenOut = USDT.address;
        const swappedOut = await factory.getQuoteAtTick(500, amountIn, tokenIn, tokenOut);
        const swappedOutLessTwoPercents = swappedOut.sub(swappedOut.mul(2).div(100));
        let swapParams = ethers.utils.defaultAbiCoder.encode(
            ["address", "address", "uint256", "uint256"],
            [tokenIn, tokenOut, amountIn, swappedOutLessTwoPercents]
        );
        let tx = await aggregatorMock.populateTransaction.swap(swapParams);
        let swapData: string = "";
        if (tx.data !== undefined) swapData = tx.data.toString();
        let rebalanceParams: Multipool.RebalanceParamsStruct = {
            zeroForOne: true,
            swapTarget: aggregatorMock.address,
            amountIn: amountIn,
            swapData: swapData,
        };
        await expect(multipool.connect(manager).rebalanceAll(rebalanceParams)).to.be.reverted; // RevertErrorCode(15)

        tx = await WETH.populateTransaction.transfer(tokenIn, amountIn.mul(2));
        await multipool.connect(manager).manageSwapTarget(WETH.address, true);
        if (tx.data !== undefined) swapData = tx.data.toString();
        rebalanceParams = {
            zeroForOne: true,
            swapTarget: WETH.address,
            amountIn: amountIn,
            swapData: swapData,
        };
        await expect(multipool.connect(manager).rebalanceAll(rebalanceParams)).to.be.reverted; // RevertErrorCode(31)

        swapParams = ethers.utils.defaultAbiCoder.encode(
            ["address", "address", "uint256", "uint256"],
            [tokenIn, tokenOut, amountIn, swappedOut]
        );
        tx = await aggregatorMock.populateTransaction.swap(swapParams);
        if (tx.data !== undefined) swapData = tx.data.toString();
        rebalanceParams = {
            zeroForOne: true,
            swapTarget: aggregatorMock.address,
            amountIn: amountIn,
            swapData: swapData,
        };
        await multipool.connect(manager).rebalanceAll(rebalanceParams);
    });

    it("should make a withdrawal successfully", async () => {
        await snapshot_deposit.restore();
        const lpBalanceAlice = await multipoolERC20.balanceOf(alice.address);
        const lpBalanceBob = await multipoolERC20.balanceOf(bob.address);
        const lpBalanceMenager = await multipoolERC20.balanceOf(manager.address);
        let amount0Min: BigNumber;
        let amount1Min: BigNumber;

        [amount0Min, amount1Min] = await factory.estimateWithdrawalAmounts(
            USDT.address,
            WETH.address,
            lpBalanceAlice
        );
        // 0.1% slippage
        amount0Min = amount0Min.mul(9990).div(10000);
        amount1Min = amount1Min.mul(9990).div(10000);

        await multipool.connect(alice).withdraw(lpBalanceAlice, amount0Min, amount1Min);

        [amount0Min, amount1Min] = await factory.estimateWithdrawalAmounts(
            USDT.address,
            WETH.address,
            lpBalanceBob
        );
        // 0.1% slippage
        amount0Min = amount0Min.mul(9990).div(10000);
        amount1Min = amount1Min.mul(9990).div(10000);

        await multipool.connect(bob).withdraw(lpBalanceBob, amount0Min, amount1Min);

        [amount0Min, amount1Min] = await factory.estimateWithdrawalAmounts(
            USDT.address,
            WETH.address,
            lpBalanceMenager
        );
        // 0.1% slippage
        amount0Min = amount0Min.mul(9990).div(10000);
        amount1Min = amount1Min.mul(9990).div(10000);
        await multipool.connect(manager).withdraw(lpBalanceMenager, amount0Min, amount1Min);

        expect(await multipoolERC20.balanceOf(bob.address)).to.equal(
            await multipoolERC20.balanceOf(alice.address)
        );
        const TOLERANCE_USDT = ethers.BigNumber.from(100);
        const TOLERANCE_WETH = ethers.BigNumber.from(100000000000);
        const bobUSDT = await USDT.balanceOf(bob.address);
        const aliceUSDT = await USDT.balanceOf(alice.address);
        const bobWETH = await WETH.balanceOf(bob.address);
        const aliceWETH = await WETH.balanceOf(alice.address);
        expect(bobUSDT).to.be.within(aliceUSDT.sub(TOLERANCE_USDT), aliceUSDT.add(TOLERANCE_USDT));
        expect(bobWETH).to.be.within(aliceWETH.sub(TOLERANCE_WETH), aliceWETH.add(TOLERANCE_WETH));
    });

    it("should mint the lpTokens and distribute the fee fairly", async () => {
        await snapshot_deposit.restore();
        snapshot_deposit = await takeSnapshot();

        const aliceLpAmount = await multipoolERC20.balanceOf(alice.address);
        const bobLpAmount = await multipoolERC20.balanceOf(bob.address);
        const menagerLpAmount = await multipoolERC20.balanceOf(manager.address);

        await snapshot_strategy.restore();

        let usdtAmountToDeposit = ethers.utils.parseUnits("1000", 6);
        let wethAmountToDeposit = await factory.getQuoteAtTick(
            500,
            usdtAmountToDeposit,
            USDT.address,
            WETH.address
        );

        //                        token0 ==weth        token1 ==usdt
        await multipool.connect(manager).deposit(wethAmountToDeposit, usdtAmountToDeposit, 0, 0);

        const fees = [500, 3000, 10000];
        for (let i = 0; i < 3; i++) {
            await simulateSwap(fees[i], ethers.utils.parseUnits("500", 6));
        }

        [usdtAmountToDeposit, wethAmountToDeposit] = await factory.estimateDepositAmounts(
            USDT.address,
            WETH.address,
            usdtAmountToDeposit,
            0
        );

        await multipool.connect(alice).deposit(wethAmountToDeposit, usdtAmountToDeposit, 0, 0);

        for (let i = 0; i < 3; i++) {
            await simulateSwap(fees[i], ethers.utils.parseUnits("500", 6));
        }

        [usdtAmountToDeposit, wethAmountToDeposit] = await factory.estimateDepositAmounts(
            USDT.address,
            WETH.address,
            usdtAmountToDeposit,
            0
        );

        await multipool.connect(bob).deposit(wethAmountToDeposit, usdtAmountToDeposit, 0, 0);

        for (let i = 0; i < 3; i++) {
            await simulateSwap(fees[i], ethers.utils.parseUnits("500", 6));
        }

        const lpBalanceAlice = await multipoolERC20.balanceOf(alice.address);
        const lpBalanceBob = await multipoolERC20.balanceOf(bob.address);
        const lpBalanceMenager = await multipoolERC20.balanceOf(manager.address);

        expect(lpBalanceMenager).to.be.equal(menagerLpAmount);
        expect(aliceLpAmount).to.be.above(lpBalanceAlice);
        expect(lpBalanceAlice).to.be.below(lpBalanceMenager);
        expect(bobLpAmount).to.be.above(lpBalanceBob);
        expect(lpBalanceBob).to.be.below(lpBalanceAlice);

        let amount0Min: BigNumber;
        let amount1Min: BigNumber;

        [amount0Min, amount1Min] = await factory.estimateWithdrawalAmounts(
            USDT.address,
            WETH.address,
            lpBalanceAlice
        );
        // 0.1% slippage
        amount0Min = amount0Min.mul(9990).div(10000);
        amount1Min = amount1Min.mul(9990).div(10000);

        await multipool.connect(alice).withdraw(lpBalanceAlice, amount0Min, amount1Min);

        [amount0Min, amount1Min] = await factory.estimateWithdrawalAmounts(
            USDT.address,
            WETH.address,
            lpBalanceBob
        );
        // 0.1% slippage
        amount0Min = amount0Min.mul(9990).div(10000);
        amount1Min = amount1Min.mul(9990).div(10000);

        await multipool.connect(bob).withdraw(lpBalanceBob, amount0Min, amount1Min);

        [amount0Min, amount1Min] = await factory.estimateWithdrawalAmounts(
            USDT.address,
            WETH.address,
            lpBalanceMenager
        );
        // 0.1% slippage
        amount0Min = amount0Min.mul(9990).div(10000);
        amount1Min = amount1Min.mul(9990).div(10000);
        await multipool.connect(manager).withdraw(lpBalanceMenager, amount0Min, amount1Min);

        expect(await multipoolERC20.balanceOf(bob.address)).to.equal(
            await multipoolERC20.balanceOf(alice.address)
        );

        const managerUSDTWithFee = await USDT.balanceOf(manager.address);
        const bobUSDTWithFee = await USDT.balanceOf(bob.address);
        const aliceUSDTWithFee = await USDT.balanceOf(alice.address);
        const managerWETHWithFee = await WETH.balanceOf(manager.address);
        const bobWETHWithFee = await WETH.balanceOf(bob.address);
        const aliceWETHWithFee = await WETH.balanceOf(alice.address);

        expect(managerUSDTWithFee).to.be.above(amountUSDT);
        expect(managerWETHWithFee).to.be.above(amountWETH);
        expect(managerUSDTWithFee).to.be.above(aliceUSDTWithFee);
        expect(managerWETHWithFee).to.be.above(aliceWETHWithFee);

        expect(aliceUSDTWithFee).to.be.above(amountUSDT);
        expect(aliceWETHWithFee).to.be.above(amountWETH);
        expect(aliceUSDTWithFee).to.be.above(bobUSDTWithFee);
        expect(aliceWETHWithFee).to.be.above(bobWETHWithFee);

        expect(bobUSDTWithFee).to.be.above(amountUSDT);
        expect(bobWETHWithFee).to.be.above(amountWETH);
    });
});
