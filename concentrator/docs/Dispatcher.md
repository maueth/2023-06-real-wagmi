# Dispatcher









## Methods

### MAX_DEVIATION

```solidity
function MAX_DEVIATION() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### add

```solidity
function add(address _owner, address _multipool, address _strategy, address _token0, address _token1) external nonpayable
```



*Add a new multipool to the list of supported pools.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner | address | Address of the pool owner |
| _multipool | address | Address of the multipool |
| _strategy | address | Address of the strategy contract that manages the pool |
| _token0 | address | Address of the first token in the pool |
| _token1 | address | Address of the second token in the pool |

### deposit

```solidity
function deposit(uint256 pid, uint256 amount, uint256 deviationBP) external nonpayable
```



*Deposit multipools LP tokens to track fees and updates user&#39;s balance and fee debts. calculation of the received fees goes on without taking into account losses during rebalancing.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| pid | uint256 | Identifier of the pool |
| amount | uint256 | Amount of LP tokens to be deposited.If the amount is null, then will be just claimed  the fees |
| deviationBP | uint256 | The deviation basis points used for calculating withdrawal fees |

### estimateClaim

```solidity
function estimateClaim(uint256 pid, address userAddress) external view returns (uint256 lpAmountRemoved, uint256 amount0, uint256 amount1)
```



*Estimates the amount of tokens that can be claimed by a user, and the corresponding LP tokens      that would need to be removed from the pool.      The claimable amount is based on the user&#39;s shares in the pool and the accumulated fees.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| pid | uint256 | The ID of the pool to query |
| userAddress | address | The address of the user |

#### Returns

| Name | Type | Description |
|---|---|---|
| lpAmountRemoved | uint256 | The estimated number of LP tokens that would need to be removed to withdraw the user&#39;s entire share |
| amount0 | uint256 | The estimated amount of token0 that can be claimed by the user |
| amount1 | uint256 | The estimated amount of token1 that can be claimed by the user |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### poolInfo

```solidity
function poolInfo(uint256) external view returns (address owner, address multipool, address strategy, address token0, address token1)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |
| multipool | address | undefined |
| strategy | address | undefined |
| token0 | address | undefined |
| token1 | address | undefined |

### poolLength

```solidity
function poolLength() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

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

### userInfo

```solidity
function userInfo(uint256, address) external view returns (uint256 shares, uint256 feeDebt0, uint256 feeDebt1)
```

pid =&gt;(userAddress=&gt;UserInfo)



#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |
| _1 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| shares | uint256 | undefined |
| feeDebt0 | uint256 | undefined |
| feeDebt1 | uint256 | undefined |

### withdraw

```solidity
function withdraw(uint256 pid, uint256 amount, uint256 deviationBP) external nonpayable
```



*Allows a user to withdraw their Lp-share from a specific pool and receive their proportionate share of fees.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| pid | uint256 | The ID of the Uniswap pool in which the user has invested |
| amount | uint256 | The amount of LP tokens to withdraw from the pool |
| deviationBP | uint256 | The deviation basis points used for calculating withdrawal fees |



## Events

### AddNewPool

```solidity
event AddNewPool(address _multipool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _multipool  | address | undefined |

### Deposit

```solidity
event Deposit(address user, uint256 pid, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| user  | address | undefined |
| pid  | uint256 | undefined |
| amount  | uint256 | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

### Withdraw

```solidity
event Withdraw(address user, uint256 pid, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| user  | address | undefined |
| pid  | uint256 | undefined |
| amount  | uint256 | undefined |



