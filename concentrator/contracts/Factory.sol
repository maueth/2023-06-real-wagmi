// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { IUniswapV3Pool } from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import { FullMath } from "./vendor0.8/uniswap/FullMath.sol";
import "./interfaces/IFactory.sol";
import "./interfaces/IMultipool.sol";
import "./interfaces/IDispatcher.sol";
import "./interfaces/ICode.sol";
import { MultiStrategy } from "./MultiStrategy.sol";

contract Factory is Ownable, IFactory {
    uint256 public constant MINIMUM_AMOUNT = 1000_000;
    /**
     * @dev Immutable address of the Uniswap V3 Factory contract.
     */
    address public immutable underlyingV3Factory;

    IDispatcher public immutable dispatcher;

    /**
     * @dev This contract provides the implementation for deploying multipool.
     */
    IMultiPoolCode public immutable multipoolCode;
    /**
     * @dev Mapping of token pairs to associated Multipool contracts.
     */
    mapping(address => mapping(address => address)) private multipools;
    /**
     * @dev Event emitted when a new Multipool contract is created.
     *
     * This event is emitted every time a new Multipool contract is deployed for a given
     * token pair. It includes the addresses of both tokens in the pair, as well as the
     * address of the newly created Multipool contract.
     *
     * @param token0 Address of the first token in the pair.
     * @param token1 Address of the second token in the pair.
     * @param multipool Address of the newly created Multipool contract.
     */
    event CreateMultipool(
        address token0,
        address token1,
        address multipool,
        address manager,
        address strategy
    );

    constructor(address _underlyingV3Factory, address _multipoolCode, address _dispatcherCode) {
        underlyingV3Factory = _underlyingV3Factory;
        multipoolCode = IMultiPoolCode(_multipoolCode);
        bytes32 salt = keccak256(abi.encode(block.timestamp, address(this)));
        bytes memory bytecode = IDispatcherCode(_dispatcherCode).getDispatcherCode();
        dispatcher = IDispatcher(deploy(salt, bytecode));
    }

    function deploy(bytes32 salt, bytes memory bytecode) private returns (address contractAddress) {
        assembly {
            contractAddress := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        require(contractAddress != address(0), "Failed on deploy");
    }

    /**
     * @dev Creates a new multipool for the given tokens and fees.
     *      Throws if the multipool has already been created.
     *
     * @param token0 The address of the first token to be used in the multipool
     * @param token1 The address of the second token to be used in the multipool
     * @param manager: The address of the manager of the newly created Multipool.
     * @param fees An array of three uint24 fee integers to be used by the UniswapV3 pools backing the multipool
     *
     * @return multipool Returns the address of the newly created multipool contract
     */
    function createMultipool(
        address token0,
        address token1,
        address manager,
        uint24[] memory fees
    ) external onlyOwner returns (address multipool) {
        require(manager != address(0), "manager is zero address");
        require(getmultipool(token0, token1) == address(0), "already created");
        (token0, token1) = _validateTokens(token0, token1);

        string memory tokens = string.concat(
            IERC20Metadata(token0).symbol(),
            "/",
            IERC20Metadata(token1).symbol()
        );

        string memory _name = string.concat("Wagmi LP ", tokens);
        string memory _symbol = string.concat(tokens, " WLP");
        bytes32 salt = keccak256(abi.encode(token0, token1));

        MultiStrategy strategy = new MultiStrategy{ salt: salt }(token0, token1, manager);
        bytes memory bytecode = multipoolCode.getMultipoolCode();

        bytecode = abi.encodePacked(
            bytecode,
            abi.encode(
                token0,
                token1,
                manager,
                underlyingV3Factory,
                address(strategy),
                _name,
                _symbol,
                fees
            )
        );

        multipool = deploy(salt, bytecode);

        multipools[token0][token1] = multipool;

        MultiStrategy(strategy).setMultipool(multipool);

        dispatcher.add(manager, multipool, address(strategy), token0, token1);

        emit CreateMultipool(token0, token1, multipool, manager, address(strategy));
    }

    function _validateTokens(
        address tokenA,
        address tokenB
    ) private pure returns (address token0, address token1) {
        require(tokenA != tokenB, "identical tokens");
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "zero address");
    }

    /**
     * @dev Retrieves the address of an existing multipool for the given token addresses.
     *
     * This function allows to query the mapping `multipools` to get the address of an existing
     * multipool for a pair of tokens. The order of the token addresses does not matter, as
     * the function swaps them to access the correct mapping value.
     *
     * @param token0 Address of the first token in the pair
     * @param token1 Address of the second token in the pair
     *
     * @return multipool Address of the existing multipool contract for the given token pair
     */
    function getmultipool(address token0, address token1) public view returns (address multipool) {
        multipool = token0 < token1 ? multipools[token0][token1] : multipools[token1][token0];
    }

    /**
     * @dev This function returns 'amountOut' after calculating the token swap rate between 'tokenIn' and 'tokenOut'.
     * @param poolFee The pool fee of the Multipool contract
     * @param amountIn The input token amount to be swapped
     * @param tokenIn The address of the input token
     * @param tokenOut The address of the output token
     * @return amountOut The output token amount after the swap
     */
    function getQuoteAtTick(
        uint24 poolFee,
        uint128 amountIn,
        address tokenIn,
        address tokenOut
    ) external view returns (uint256 amountOut) {
        address multipool = getmultipool(tokenIn, tokenOut);
        require(multipool != address(0), "pool not found");
        address underlyingPool = IMultipool(multipool).underlyingTrustedPools(poolFee).poolAddress;

        (uint160 sqrtPriceX96, , , , , , ) = IUniswapV3Pool(underlyingPool).slot0();

        if (sqrtPriceX96 <= type(uint128).max) {
            uint256 ratioX192 = uint256(sqrtPriceX96) * sqrtPriceX96;
            amountOut = tokenIn < tokenOut
                ? FullMath.mulDiv(ratioX192, amountIn, 1 << 192)
                : FullMath.mulDiv(1 << 192, amountIn, ratioX192);
        } else {
            uint256 ratioX128 = FullMath.mulDiv(sqrtPriceX96, sqrtPriceX96, 1 << 64);
            amountOut = tokenIn < tokenOut
                ? FullMath.mulDiv(ratioX128, amountIn, 1 << 128)
                : FullMath.mulDiv(1 << 128, amountIn, ratioX128);
        }
    }

    /**
     * @dev This function returns the estimated amounts of token0 and token1 that can be withdrawn from
     *      the liquidity pool for the given LP amount.
     * @param tokenA The address of token A
     * @param tokenB The address of token B
     * @param lpAmount The amount of LP tokens being withdrawn
     * @return amount0 Returns the estimated amount of token0 that can be withdrawn
     * @return amount1 Returns the estimated amount of token1 that can be withdrawn
     */
    function estimateWithdrawalAmounts(
        address tokenA,
        address tokenB,
        uint256 lpAmount
    ) external view returns (uint256 amount0, uint256 amount1) {
        address multipool = getmultipool(tokenA, tokenB);
        require(multipool != address(0), "pool not found");
        uint256 _totalSupply = IERC20(multipool).totalSupply();
        (uint256 reserve0, uint256 reserve1, , ) = IMultipool(multipool).getReserves();
        amount0 = (reserve0 * lpAmount) / _totalSupply;
        amount1 = (reserve1 * lpAmount) / _totalSupply;
    }

    function _quote(
        uint256 amountA,
        uint256 reserveA,
        uint256 reserveB
    ) private pure returns (uint256 amountB) {
        require(amountA > 0, "INSUFFICIENT_AMOUNT");
        require(reserveA > 0 && reserveB > 0, "INSUFFICIENT_LIQUIDITY");
        amountB = (amountA * reserveB) / reserveA;
    }

    function estimateDepositAmounts(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired
    ) external view returns (uint256 amountA, uint256 amountB) {
        address multipool = getmultipool(tokenA, tokenB);
        require(multipool != address(0), "pool not found");
        (uint256 reserve0, uint256 reserve1, , ) = IMultipool(multipool).getReserves();

        if (reserve0 == 0 && reserve1 == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            bool aZero = tokenA == IMultipool(multipool).token0();
            if (!aZero) {
                (amountADesired, amountBDesired) = (amountBDesired, amountADesired);
            }
            if (amountADesired == 0) {
                amountADesired = _quote(amountBDesired, reserve1, reserve0);
            }

            uint256 amountBOptimal = _quote(amountADesired, reserve0, reserve1);
            if (amountBOptimal <= amountBDesired || amountBDesired == 0) {
                (amountA, amountB) = aZero
                    ? (amountADesired, amountBOptimal)
                    : (amountBOptimal, amountADesired);
            } else {
                uint256 amountAOptimal = _quote(amountBDesired, reserve1, reserve0);
                (amountA, amountB) = aZero
                    ? (amountAOptimal, amountBDesired)
                    : (amountBDesired, amountAOptimal);
            }
        }
        require(amountA > MINIMUM_AMOUNT && amountB > MINIMUM_AMOUNT, "amount too small");
    }
}
