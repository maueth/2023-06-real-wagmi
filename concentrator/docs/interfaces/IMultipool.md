# IMultipool









## Methods

### earn

```solidity
function earn() external nonpayable returns (struct IMultipool.FeeGrowth)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IMultipool.FeeGrowth | undefined |

### feesGrowthInsideLastX128

```solidity
function feesGrowthInsideLastX128() external view returns (struct IMultipool.FeeGrowth)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IMultipool.FeeGrowth | undefined |

### getAmountOut

```solidity
function getAmountOut(bool zeroForOne, uint256 amountIn) external view returns (uint256 swappedOut)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| zeroForOne | bool | undefined |
| amountIn | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| swappedOut | uint256 | undefined |

### getReserves

```solidity
function getReserves() external view returns (uint256 reserve0, uint256 reserve1, uint256 pendingFee0, uint256 pendingFee1)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| reserve0 | uint256 | undefined |
| reserve1 | uint256 | undefined |
| pendingFee0 | uint256 | undefined |
| pendingFee1 | uint256 | undefined |

### snapshot

```solidity
function snapshot() external nonpayable returns (uint256 reserve0, uint256 reserve1, struct IMultipool.FeeGrowth feesGrow, uint256 _totalSupply)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| reserve0 | uint256 | undefined |
| reserve1 | uint256 | undefined |
| feesGrow | IMultipool.FeeGrowth | undefined |
| _totalSupply | uint256 | undefined |

### token0

```solidity
function token0() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### token1

```solidity
function token1() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### underlyingTrustedPools

```solidity
function underlyingTrustedPools(uint24 fee) external view returns (struct IMultipool.UnderlyingPool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| fee | uint24 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IMultipool.UnderlyingPool | undefined |

### withdraw

```solidity
function withdraw(uint256 lpAmount, uint256 amount0OutMin, uint256 amount1OutMin) external nonpayable returns (uint256 withdrawnAmount0, uint256 withdrawnAmount1)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| lpAmount | uint256 | undefined |
| amount0OutMin | uint256 | undefined |
| amount1OutMin | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| withdrawnAmount0 | uint256 | undefined |
| withdrawnAmount1 | uint256 | undefined |




