// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.18;

interface IMultiStrategy {
    /**
     *     ___positionRange____
     *    |                    |
     * tickLower            tickUpper
     *    |                    |
     *           current tick
     *               |
     *  __|__|__|__|__|__|__|__|__
     *             |  |  |
     *            -1  1  2
     *       tickSpacingOffset
     *
     * floorTick = (current tick / tickSpacing) * tickSpacing;
     * if tickSpacingOffset is negative => floorTick+tickSpacingOffset = upper tick
     * if tickSpacingOffset is positive => floorTick+tickSpacing+tickSpacingOffset = lower tick
     * */
    struct Strategy {
        int24 tickSpacingOffset;
        int24 positionRange;
        uint24 poolFeeAmt;
        uint256 weight;
    }

    /**
     * @notice function returns size of strategies array
     * @return size of strategies array
     */
    function strategySize() external view returns (uint256);

    /**
     * @notice function returns strategy's params by index of array
     * @param index  index of array
     * @return struct of strategy params
     */
    function getStrategyAt(uint256 index) external view returns (Strategy memory);
}
