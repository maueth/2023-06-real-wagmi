// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.18;

library ErrLib {
    enum ErrorCode {
        INVALID_POSITIONS_RANGE, // 0
        SHOULD_BE_SORTED_BY_FEE, // 1
        INVALID_TICK_SPACING, // 2
        INVALID_WEIGHTS_SUM, // 3
        LOWER_SHOULD_BE_LESS_UPPER, // 4
        LOWER_TOO_SMALL, // 5
        UPPER_TOO_BIG, // 6
        TICKLOWER_IS_NOT_SPACED, // 7
        TICKUPPER_IS_NOT_SPACED, // 8
        INVALID_PID, // 9
        STRATEGY_DOES_NOT_EXIST, // 10
        CANT_MINT_ZERO_LIQUIDITY, // 11
        FIRST_DEPOSIT_SHOULD_BE_MAKE_BY_OWNER, // 12
        INSUFFICIENT_LIQUIDITY_MINTED, // 13
        INVALID_PCT, // 14
        PRICE_SLIPPAGE_CHECK, // 15
        FORBIDDEN, // 16
        INSUFFICIENT_AMOUNT, // 17
        INSUFFICIENT_LIQUIDITY, // 18
        INSUFFICIENT_0_AMOUNT, // 19
        INSUFFICIENT_1_AMOUNT, // 20
        ERC20_TRANSFER_DID_NOT_SUCCEED, // 21
        ERC20_TRANSFER_FROM_DID_NOT_SUCCEED, // 22
        ERC20_APPROVE_DID_NOT_SUCCEED, // 23
        PROTOCOL_FEE_TOO_BIG, // 24
        ERROR_SWAPPING_TOKENS, // 25
        INVALID_ADDRESS, // 26
        OPERATOR_NOT_APPROVED, // 27
        MAX_TOTAL_SUPPLY_REACHED, // 28
        SWAP_TARGET_NOT_APPROVED, // 29
        DEVIATION_TO_BIG, // 30
        AMOUNT_IN_TO_BIG, // 31
        AMOUNT_TOO_SMALL // 32
    }

    error RevertErrorCode(ErrorCode code);

    function requirement(bool condition, ErrorCode code) internal pure {
        if (!condition) {
            revert RevertErrorCode(code);
        }
    }
}
