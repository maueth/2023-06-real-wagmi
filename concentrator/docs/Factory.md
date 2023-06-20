# Factory









## Methods

### MINIMUM_AMOUNT

```solidity
function MINIMUM_AMOUNT() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### createMultipool

```solidity
function createMultipool(address token0, address token1, address manager, uint24[] fees) external nonpayable returns (address multipool)
```



*Creates a new multipool for the given tokens and fees.      Throws if the multipool has already been created.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token0 | address | The address of the first token to be used in the multipool |
| token1 | address | The address of the second token to be used in the multipool |
| manager | address | : The address of the manager of the newly created Multipool. |
| fees | uint24[] | An array of three uint24 fee integers to be used by the UniswapV3 pools backing the multipool |

#### Returns

| Name | Type | Description |
|---|---|---|
| multipool | address | Returns the address of the newly created multipool contract |

### dispatcher

```solidity
function dispatcher() external view returns (contract IDispatcher)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IDispatcher | undefined |

### estimateDepositAmounts

```solidity
function estimateDepositAmounts(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired) external view returns (uint256 amountA, uint256 amountB)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenA | address | undefined |
| tokenB | address | undefined |
| amountADesired | uint256 | undefined |
| amountBDesired | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| amountA | uint256 | undefined |
| amountB | uint256 | undefined |

### estimateWithdrawalAmounts

```solidity
function estimateWithdrawalAmounts(address tokenA, address tokenB, uint256 lpAmount) external view returns (uint256 amount0, uint256 amount1)
```



*This function returns the estimated amounts of token0 and token1 that can be withdrawn from      the liquidity pool for the given LP amount.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenA | address | The address of token A |
| tokenB | address | The address of token B |
| lpAmount | uint256 | The amount of LP tokens being withdrawn |

#### Returns

| Name | Type | Description |
|---|---|---|
| amount0 | uint256 | Returns the estimated amount of token0 that can be withdrawn |
| amount1 | uint256 | Returns the estimated amount of token1 that can be withdrawn |

### getQuoteAtTick

```solidity
function getQuoteAtTick(uint24 poolFee, uint128 amountIn, address tokenIn, address tokenOut) external view returns (uint256 amountOut)
```



*This function returns &#39;amountOut&#39; after calculating the token swap rate between &#39;tokenIn&#39; and &#39;tokenOut&#39;.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| poolFee | uint24 | The pool fee of the Multipool contract |
| amountIn | uint128 | The input token amount to be swapped |
| tokenIn | address | The address of the input token |
| tokenOut | address | The address of the output token |

#### Returns

| Name | Type | Description |
|---|---|---|
| amountOut | uint256 | The output token amount after the swap |

### getmultipool

```solidity
function getmultipool(address token0, address token1) external view returns (address multipool)
```



*Retrieves the address of an existing multipool for the given token addresses. This function allows to query the mapping `multipools` to get the address of an existing multipool for a pair of tokens. The order of the token addresses does not matter, as the function swaps them to access the correct mapping value.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token0 | address | Address of the first token in the pair |
| token1 | address | Address of the second token in the pair |

#### Returns

| Name | Type | Description |
|---|---|---|
| multipool | address | Address of the existing multipool contract for the given token pair |

### multipoolCode

```solidity
function multipoolCode() external view returns (contract IMultiPoolCode)
```



*This contract provides the implementation for deploying multipool.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IMultiPoolCode | undefined |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

### underlyingV3Factory

```solidity
function underlyingV3Factory() external view returns (address)
```



*Immutable address of the Uniswap V3 Factory contract.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |



## Events

### CreateMultipool

```solidity
event CreateMultipool(address token0, address token1, address multipool, address manager, address strategy)
```



*Event emitted when a new Multipool contract is created. This event is emitted every time a new Multipool contract is deployed for a given token pair. It includes the addresses of both tokens in the pair, as well as the address of the newly created Multipool contract.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token0  | address | Address of the first token in the pair. |
| token1  | address | Address of the second token in the pair. |
| multipool  | address | Address of the newly created Multipool contract. |
| manager  | address | undefined |
| strategy  | address | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |



