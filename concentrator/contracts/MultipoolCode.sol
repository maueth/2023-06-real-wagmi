// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.18;

import "./Multipool.sol";

contract MultiPoolCode {
    function getMultipoolCode() external pure returns (bytes memory bytecode) {
        bytecode = type(Multipool).creationCode;
    }
}
