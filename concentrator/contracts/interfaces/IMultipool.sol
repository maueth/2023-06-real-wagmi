// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.18;

interface IMultipool {
    struct UnderlyingPool {
        int24 tickSpacing;
        address poolAddress;
    }
    struct FeeGrowth {
        uint256 accPerShare0;
        uint256 accPerShare1;
        uint256 gmiAccPerShare0;
        uint256 gmiAccPerShare1;
    }

    function snapshot()
        external
        returns (
            uint256 reserve0,
            uint256 reserve1,
            FeeGrowth memory feesGrow,
            uint256 _totalSupply
        );

    function earn() external returns (FeeGrowth memory);

    function getAmountOut(
        bool zeroForOne,
        uint256 amountIn
    ) external view returns (uint256 swappedOut);

    function feesGrowthInsideLastX128() external view returns (FeeGrowth memory);

    function underlyingTrustedPools(uint24 fee) external view returns (UnderlyingPool memory);

    function getReserves()
        external
        view
        returns (uint256 reserve0, uint256 reserve1, uint256 pendingFee0, uint256 pendingFee1);

    function token0() external view returns (address);

    function token1() external view returns (address);

    function withdraw(
        uint256 lpAmount,
        uint256 amount0OutMin,
        uint256 amount1OutMin
    ) external returns (uint256 withdrawnAmount0, uint256 withdrawnAmount1);
}
