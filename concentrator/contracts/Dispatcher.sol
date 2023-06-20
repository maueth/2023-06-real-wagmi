// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v3-core/contracts/libraries/FixedPoint128.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { FullMath, LiquidityAmounts } from "./vendor0.8/uniswap/LiquidityAmounts.sol";
import "./interfaces/IMultipool.sol";

// import "hardhat/console.sol";

contract Dispatcher is Ownable {
    using SafeERC20 for IERC20;
    struct UserInfo {
        uint256 shares;
        uint256 feeDebt0;
        uint256 feeDebt1;
    }

    struct PoolInfo {
        address owner;
        address multipool;
        address strategy;
        address token0;
        address token1;
    }

    uint256 public constant MAX_DEVIATION = 1000;

    PoolInfo[] public poolInfo;
    ///         pid =>(userAddress=>UserInfo)
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;

    event AddNewPool(address _multipool);
    event Deposit(address user, uint256 pid, uint256 amount);
    event Withdraw(address user, uint256 pid, uint256 amount);

    modifier checkPid(uint256 pid) {
        require(pid < poolInfo.length, "invalid pid");
        _;
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    /**
     * @dev Add a new multipool to the list of supported pools.
     * @param _owner Address of the pool owner
     * @param _multipool Address of the multipool
     * @param _strategy Address of the strategy contract that manages the pool
     * @param _token0 Address of the first token in the pool
     * @param _token1 Address of the second token in the pool
     */
    function add(
        address _owner,
        address _multipool,
        address _strategy,
        address _token0,
        address _token1
    ) external onlyOwner {
        PoolInfo memory pInfo = PoolInfo({
            owner: _owner,
            multipool: _multipool,
            strategy: _strategy,
            token0: _token0,
            token1: _token1
        });

        poolInfo.push(pInfo);
        emit AddNewPool(_multipool);
    }

    function _pay(address token, address payer, address recipient, uint256 value) private {
        if (value > 0) {
            if (payer == address(this)) {
                IERC20(token).safeTransfer(recipient, value);
            } else {
                IERC20(token).safeTransferFrom(payer, recipient, value);
            }
        }
    }

    function _calcFees(
        IMultipool.FeeGrowth memory growth,
        UserInfo memory user
    ) private pure returns (uint256 amount0, uint256 amount1) {
        amount0 = FullMath.mulDiv(
            user.shares,
            growth.accPerShare0 - user.feeDebt0,
            FixedPoint128.Q128
        );
        amount1 = FullMath.mulDiv(
            user.shares,
            growth.accPerShare1 - user.feeDebt1,
            FixedPoint128.Q128
        );
    }

    /**
     * @dev Estimates the amount of tokens that can be claimed by a user, and the corresponding LP tokens
     *      that would need to be removed from the pool.
     *      The claimable amount is based on the user's shares in the pool and the accumulated fees.
     * @param pid The ID of the pool to query
     * @param userAddress The address of the user
     * @return lpAmountRemoved The estimated number of LP tokens that would need to be removed to withdraw the user's entire share
     * @return amount0 The estimated amount of token0 that can be claimed by the user
     * @return amount1 The estimated amount of token1 that can be claimed by the user
     */
    function estimateClaim(
        uint256 pid,
        address userAddress
    )
        external
        view
        checkPid(pid)
        returns (uint256 lpAmountRemoved, uint256 amount0, uint256 amount1)
    {
        PoolInfo memory pool = poolInfo[pid];
        UserInfo memory user = userInfo[pid][userAddress];
        if (user.shares > 0) {
            IMultipool.FeeGrowth memory feesGrow = IMultipool(pool.multipool)
                .feesGrowthInsideLastX128();
            (uint256 fee0, uint256 fee1) = _calcFees(feesGrow, user);
            (
                uint256 reserve0,
                uint256 reserve1,
                uint256 pendingFee0,
                uint256 pendingFee1
            ) = IMultipool(pool.multipool).getReserves();
            uint256 _totalSupply = IERC20(pool.multipool).totalSupply();
            fee0 += (pendingFee0 * user.shares) / _totalSupply;
            fee1 += (pendingFee1 * user.shares) / _totalSupply;
            lpAmountRemoved = _estimateWithdrawalLp(reserve0, reserve1, _totalSupply, fee0, fee1);
            amount0 = (reserve0 * lpAmountRemoved) / _totalSupply;
            amount1 = (reserve1 * lpAmountRemoved) / _totalSupply;
        }
    }

    function _estimateWithdrawalLp(
        uint256 reserve0,
        uint256 reserve1,
        uint256 _totalSupply,
        uint256 amount0,
        uint256 amount1
    ) private pure returns (uint256 shareAmount) {
        shareAmount =
            ((amount0 * _totalSupply) / reserve0 + (amount1 * _totalSupply) / reserve1) /
            2;
    }

    function _withdrawFee(
        PoolInfo memory pool,
        uint256 lpAmount,
        uint256 reserve0,
        uint256 reserve1,
        uint256 _totalSupply,
        uint256 deviationBP
    ) private {
        uint256 amount0OutMin = (reserve0 * lpAmount * deviationBP) /
            (_totalSupply * MAX_DEVIATION);
        uint256 amount1OutMin = (reserve1 * lpAmount * deviationBP) /
            (_totalSupply * MAX_DEVIATION);
        (uint256 withdrawnAmount0, uint256 withdrawnAmount1) = IMultipool(pool.multipool).withdraw(
            lpAmount,
            amount0OutMin,
            amount1OutMin
        );
        _pay(pool.token0, address(this), msg.sender, withdrawnAmount0);
        _pay(pool.token1, address(this), msg.sender, withdrawnAmount1);
    }

    /**
     * @dev Deposit multipools LP tokens to track fees and updates user's balance and fee debts.
     * calculation of the received fees goes on without taking into account losses during rebalancing.
     * @param pid Identifier of the pool
     * @param amount Amount of LP tokens to be deposited.If the amount is null, then will be just claimed  the fees
     * @param deviationBP The deviation basis points used for calculating withdrawal fees
     */
    function deposit(uint256 pid, uint256 amount, uint256 deviationBP) external checkPid(pid) {
        PoolInfo memory pool = poolInfo[pid];
        UserInfo storage user = userInfo[pid][msg.sender];
        (
            uint256 reserve0,
            uint256 reserve1,
            IMultipool.FeeGrowth memory feesGrow,
            uint256 _totalSupply
        ) = IMultipool(pool.multipool).snapshot();
        if (user.shares > 0) {
            uint256 lpAmount;
            {
                (uint256 fee0, uint256 fee1) = _calcFees(feesGrow, user);
                lpAmount = _estimateWithdrawalLp(reserve0, reserve1, _totalSupply, fee0, fee1);
            }
            user.shares -= lpAmount;
            _withdrawFee(pool, lpAmount, reserve0, reserve1, _totalSupply, deviationBP);
        }

        if (amount > 0) {
            _pay(pool.multipool, msg.sender, address(this), amount);
            user.shares += amount;
        }
        user.feeDebt0 = feesGrow.accPerShare0;
        user.feeDebt1 = feesGrow.accPerShare1;

        emit Deposit(msg.sender, pid, amount);
    }

    /**
     * @dev Allows a user to withdraw their Lp-share from a specific pool and receive their proportionate share of fees.
     * @param pid The ID of the Uniswap pool in which the user has invested
     * @param amount The amount of LP tokens to withdraw from the pool
     * @param deviationBP The deviation basis points used for calculating withdrawal fees
     */
    function withdraw(uint256 pid, uint256 amount, uint256 deviationBP) external checkPid(pid) {
        PoolInfo memory pool = poolInfo[pid];
        UserInfo storage user = userInfo[pid][msg.sender];
        (
            uint256 reserve0,
            uint256 reserve1,
            IMultipool.FeeGrowth memory feesGrow,
            uint256 _totalSupply
        ) = IMultipool(pool.multipool).snapshot();

        require(user.shares > 0, "user.shares is 0");
        require(_totalSupply > 0, "sharesTotal is 0");
        if (amount > user.shares) {
            // withdraw witout claiming
            amount = user.shares;
        } else if (amount < user.shares) {
            uint256 lpAmount;
            {
                (uint256 fee0, uint256 fee1) = _calcFees(feesGrow, user);
                lpAmount = _estimateWithdrawalLp(reserve0, reserve1, _totalSupply, fee0, fee1);
            }
            user.shares -= lpAmount;
            _withdrawFee(pool, lpAmount, reserve0, reserve1, _totalSupply, deviationBP);
        }

        uint256 sharesRemoved = amount > user.shares ? user.shares : amount;
        user.shares -= sharesRemoved;

        user.feeDebt0 = feesGrow.accPerShare0;
        user.feeDebt1 = feesGrow.accPerShare1;
        _pay(pool.multipool, address(this), msg.sender, sharesRemoved);

        emit Withdraw(msg.sender, pid, amount);
    }
}
