# MultiStrategy









## Methods

### MAX_WEIGHT_UINT256

```solidity
function MAX_WEIGHT_UINT256() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### getStrategyAt

```solidity
function getStrategyAt(uint256 index) external view returns (struct IMultiStrategy.Strategy)
```

function returns strategy&#39;s params by index of array



#### Parameters

| Name | Type | Description |
|---|---|---|
| index | uint256 | index of array |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IMultiStrategy.Strategy | struct of strategy params |

### multiFactory

```solidity
function multiFactory() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### multipool

```solidity
function multipool() external view returns (contract IMultipool)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IMultipool | undefined |

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


### setMultipool

```solidity
function setMultipool(address _multipool) external nonpayable
```

function sets corresponding multipool address



#### Parameters

| Name | Type | Description |
|---|---|---|
| _multipool | address | address of corresponding multipool |

### setStrategy

```solidity
function setStrategy(IMultiStrategy.Strategy[] _currentStrategy) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _currentStrategy | IMultiStrategy.Strategy[] | undefined |

### strategySize

```solidity
function strategySize() external view returns (uint256)
```

function returns size of strategies array




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | size of strategies array |

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

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |



## Events

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

### SetMultipool

```solidity
event SetMultipool(address multipool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| multipool  | address | undefined |

### SetNewStrategy

```solidity
event SetNewStrategy(IMultiStrategy.Strategy[] strategy)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| strategy  | IMultiStrategy.Strategy[] | undefined |



## Errors

### InvalidFee

```solidity
error InvalidFee(uint24 fee)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| fee | uint24 | undefined |

### RevertErrorCode

```solidity
error RevertErrorCode(enum ErrLib.ErrorCode code)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| code | enum ErrLib.ErrorCode | undefined |


