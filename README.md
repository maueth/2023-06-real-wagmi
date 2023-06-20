
# RealWagmi contest details

- Join [Sherlock Discord](https://discord.gg/MABEWyASkp)
- Submit findings using the issue page in your private contest repo (label issues as med or high)
- [Read for more details](https://docs.sherlock.xyz/audits/watsons)

# Q&A

### Q: On what chains are the smart contracts going to be deployed?
Fantom, Arbitrum, ZKera, Polygon, Binance Smart Chain, KAVA
___

### Q: Which ERC20 tokens do you expect will interact with the smart contracts? 
USDC,USDT,WBTC,WETH, other wrapped native tokens, and general ERC20 standart with no deflation/inflation model
___

### Q: Which ERC721 tokens do you expect will interact with the smart contracts? 
none
___

### Q: Which ERC777 tokens do you expect will interact with the smart contracts? 
none
___

### Q: Are there any FEE-ON-TRANSFER tokens interacting with the smart contracts?

none
___

### Q: Are there any REBASING tokens interacting with the smart contracts?

none
___

### Q: Are the admins of the protocols your contracts integrate with (if any) TRUSTED or RESTRICTED?
TRUSTED
___

### Q: Is the admin/owner of the protocol/contracts TRUSTED or RESTRICTED?
TRUSTED
___

### Q: Are there any additional protocol roles? If yes, please explain in detail:
Operator runs rebalance function. 
___

### Q: Is the code/contract expected to comply with any EIPs? Are there specific assumptions around adhering to those EIPs that Watsons should be aware of?
No
___

### Q: Please list any known issues/acceptable risks that should not result in a valid finding.
no
___

### Q: Please provide links to previous audits (if any).
no
___

### Q: Are there any off-chain mechanisms or off-chain procedures for the protocol (keeper bots, input validation expectations, etc)?
no. 
___

### Q: In case of external protocol integrations, are the risks of external contracts pausing or executing an emergency withdrawal acceptable? If not, Watsons will submit issues related to these situations that can harm your protocol's functionality.
There is no emergency withdrawal at all. 
___



# Audit scope


[concentrator @ dcff15564d079f5ff32686ad738873f274de48fd](https://github.com/RealWagmi/concentrator/tree/dcff15564d079f5ff32686ad738873f274de48fd)
- [concentrator/contracts/Dispatcher.sol](concentrator/contracts/Dispatcher.sol)
- [concentrator/contracts/DispatcherCode.sol](concentrator/contracts/DispatcherCode.sol)
- [concentrator/contracts/Factory.sol](concentrator/contracts/Factory.sol)
- [concentrator/contracts/MultiStrategy.sol](concentrator/contracts/MultiStrategy.sol)
- [concentrator/contracts/Multipool.sol](concentrator/contracts/Multipool.sol)
- [concentrator/contracts/MultipoolCode.sol](concentrator/contracts/MultipoolCode.sol)
- [concentrator/contracts/interfaces/ICode.sol](concentrator/contracts/interfaces/ICode.sol)
- [concentrator/contracts/interfaces/IDispatcher.sol](concentrator/contracts/interfaces/IDispatcher.sol)
- [concentrator/contracts/interfaces/IFactory.sol](concentrator/contracts/interfaces/IFactory.sol)
- [concentrator/contracts/interfaces/IMultiStrategy.sol](concentrator/contracts/interfaces/IMultiStrategy.sol)
- [concentrator/contracts/interfaces/IMultipool.sol](concentrator/contracts/interfaces/IMultipool.sol)


