# IFactory









## Methods

### createMultipool

```solidity
function createMultipool(address token0, address token1, address manager, uint24[] fees) external nonpayable returns (address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token0 | address | undefined |
| token1 | address | undefined |
| manager | address | undefined |
| fees | uint24[] | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### estimateWithdrawalAmounts

```solidity
function estimateWithdrawalAmounts(address tokenA, address tokenB, uint256 lpAmount) external view returns (uint256 amount0, uint256 amount1)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenA | address | undefined |
| tokenB | address | undefined |
| lpAmount | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| amount0 | uint256 | undefined |
| amount1 | uint256 | undefined |

### getQuoteAtTick

```solidity
function getQuoteAtTick(uint24 poolFee, uint128 amountIn, address tokenIn, address tokenOut) external view returns (uint256 amountOut)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| poolFee | uint24 | undefined |
| amountIn | uint128 | undefined |
| tokenIn | address | undefined |
| tokenOut | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| amountOut | uint256 | undefined |

### getmultipool

```solidity
function getmultipool(address token0, address token1) external view returns (address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token0 | address | undefined |
| token1 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### underlyingV3Factory

```solidity
function underlyingV3Factory() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |




