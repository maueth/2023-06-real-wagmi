// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.18;

import "./Dispatcher.sol";

contract DispatcherCode {
    function getDispatcherCode() external pure returns (bytes memory bytecode) {
        bytecode = type(Dispatcher).creationCode;
    }
}
