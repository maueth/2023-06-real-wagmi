// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.18;

interface IDispatcher {
    function add(
        address _owner,
        address _multipool,
        address _strategy,
        address _token0,
        address _token1
    ) external;
}
