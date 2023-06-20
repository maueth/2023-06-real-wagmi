// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.18;

interface IMultiPoolCode {
    function getMultipoolCode() external returns (bytes memory bytecode);
}

interface IDispatcherCode {
    function getDispatcherCode() external returns (bytes memory bytecode);
}
