# Token Standards

A high level summary of the various token standards. Check the following files for details:

_ERC777.md_ - What problems ERC777 and ERC1363 solves? Why was ERC1363 introduced, and what issues are there with ERC777?

_SafeERC20.md_ - Why does the SafeERC20 program exist and when should it be used?

_TokenWithSanctions.sol & TokenWithSanctions.js_ - A fungible token that allows an admin to ban specified addresses from sending and receiving tokens.

_TokenWithGodMode.sol & TokenWithGodMode.js_ - A special address is able to transfer tokens between addresses at will.

_UntrustedEscrow.sol & UntrustedEscrow.js_ - A contract where a buyer can put an arbitrary ERC20 token into a contract and a seller can withdraw it 3 days later. This uses the SafeERC20 wrapper. This helps safely wrap several operations around ERC20.

_UntrustedEscrowERC1363.sol & UntrustedEscrowERC1363.js_ - An attempt to create untrusted escrow using ERC1363. The idea is that a seller with his/her ERC1367 tokens will be able to withdraw ERC20 tokens deposited by a buyer. The buyer shall recieve ERC1613 tokens and the seller shall recieve the ERC20 tokens. The benefit is that this makes the tokens payable. This helps to make the token payable. It also uses SafeERC20 wrappers.

```shell
npx hardhat compile
npx hardhat test
REPORT_GAS=true npx hardhat test
```
