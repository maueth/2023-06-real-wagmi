// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.18;

import { IMultiStrategy } from "./interfaces/IMultiStrategy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import { ErrLib } from "./libraries/ErrLib.sol";
import { IUniswapV3Pool } from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import { IMultipool } from "./interfaces/IMultipool.sol";

contract MultiStrategy is IMultiStrategy, Ownable {
    event SetNewStrategy(Strategy[] strategy);
    event SetMultipool(address multipool);

    error InvalidFee(uint24 fee);

    Strategy[] private currentStrategy;

    address public immutable token0;
    address public immutable token1;

    address public immutable multiFactory;
    IMultipool public multipool;

    uint256 public constant MAX_WEIGHT_UINT256 = 10000;

    constructor(address _token0, address _token1, address _manager) {
        token0 = _token0;
        token1 = _token1;
        multiFactory = msg.sender;
        _transferOwnership(_manager);
    }

    /**
     * @notice function sets corresponding multipool address
     * @param _multipool  address of corresponding multipool
     */
    function setMultipool(address _multipool) external {
        ErrLib.requirement(multiFactory == msg.sender, ErrLib.ErrorCode.FORBIDDEN);
        multipool = IMultipool(_multipool);
    }

    /// @inheritdoc IMultiStrategy
    function strategySize() external view returns (uint256) {
        return currentStrategy.length;
    }

    /// @inheritdoc IMultiStrategy
    function getStrategyAt(uint256 index) external view returns (Strategy memory) {
        return currentStrategy[index];
    }

    /**
     * @notice Sets a new strategy for the contract
     * @dev This function can only be called by the owner of the contract
     * @param _currentStrategy A list of Strategy structs representing the new strategy
     */
    function setStrategy(Strategy[] calldata _currentStrategy) external onlyOwner {
        delete currentStrategy;
        uint256 weightSum;
        uint24 checkSortedFee;
        for (uint256 i = 0; i < _currentStrategy.length; ) {
            Strategy memory sPosition = _currentStrategy[i];
            ErrLib.requirement(
                checkSortedFee <= sPosition.poolFeeAmt,
                ErrLib.ErrorCode.SHOULD_BE_SORTED_BY_FEE
            );
            checkSortedFee = sPosition.poolFeeAmt;
            IMultipool.UnderlyingPool memory uPool = multipool.underlyingTrustedPools(
                sPosition.poolFeeAmt
            );
            if (uPool.poolAddress == address(0)) {
                revert InvalidFee(sPosition.poolFeeAmt);
            }
            _checkpositionsRange(
                sPosition.positionRange,
                uPool.tickSpacing,
                sPosition.tickSpacingOffset
            );
            ErrLib.requirement(
                sPosition.tickSpacingOffset % uPool.tickSpacing == 0,
                ErrLib.ErrorCode.INVALID_TICK_SPACING
            );
            weightSum += sPosition.weight;
            currentStrategy.push(_currentStrategy[i]);
            unchecked {
                ++i;
            }
        }
        ErrLib.requirement(weightSum == MAX_WEIGHT_UINT256, ErrLib.ErrorCode.INVALID_WEIGHTS_SUM);
        emit SetNewStrategy(_currentStrategy);
    }

    function _checkpositionsRange(
        int24 _range,
        int24 _tickSpacing,
        int24 tickSpacingOffset
    ) private pure {
        ErrLib.requirement(
            (_range > _tickSpacing) &&
                (_range % _tickSpacing == 0) &&
                (((_range / 2) % _tickSpacing != 0) || tickSpacingOffset != 0),
            ErrLib.ErrorCode.INVALID_POSITIONS_RANGE
        );
    }
}
