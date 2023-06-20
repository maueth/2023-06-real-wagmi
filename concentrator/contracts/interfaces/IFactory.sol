// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.18;

interface IFactory {
    function underlyingV3Factory() external view returns (address);

    function createMultipool(
        address token0,
        address token1,
        address manager,
        uint24[] memory fees
    ) external returns (address);

    function getmultipool(address token0, address token1) external view returns (address);

    function getQuoteAtTick(
        uint24 poolFee,
        uint128 amountIn,
        address tokenIn,
        address tokenOut
    ) external view returns (uint256 amountOut);

    function estimateWithdrawalAmounts(
        address tokenA,
        address tokenB,
        uint256 lpAmount
    ) external view returns (uint256 amount0, uint256 amount1);
}
