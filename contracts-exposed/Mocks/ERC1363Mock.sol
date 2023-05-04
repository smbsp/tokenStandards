// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0;

import "../../contracts/Mocks/ERC1363Mock.sol";

contract $ERC1363Mock is ERC1363Mock {
    bytes32 public __hh_exposed_bytecode_marker = "hardhat-exposed";

    event return$_checkOnTransferReceived(bool ret0);

    event return$_checkOnApprovalReceived(bool ret0);

    constructor(string memory name, string memory symbol, address initialAccount, uint256 initialBalance) ERC1363Mock(name, symbol, initialAccount, initialBalance) {}

    function $_checkOnTransferReceived(address sender,address recipient,uint256 amount,bytes calldata data) external returns (bool ret0) {
        (ret0) = super._checkOnTransferReceived(sender,recipient,amount,data);
        emit return$_checkOnTransferReceived(ret0);
    }

    function $_checkOnApprovalReceived(address spender,uint256 amount,bytes calldata data) external returns (bool ret0) {
        (ret0) = super._checkOnApprovalReceived(spender,amount,data);
        emit return$_checkOnApprovalReceived(ret0);
    }

    function $_transfer(address from,address to,uint256 amount) external {
        super._transfer(from,to,amount);
    }

    function $_mint(address account,uint256 amount) external {
        super._mint(account,amount);
    }

    function $_burn(address account,uint256 amount) external {
        super._burn(account,amount);
    }

    function $_approve(address owner,address spender,uint256 amount) external {
        super._approve(owner,spender,amount);
    }

    function $_spendAllowance(address owner,address spender,uint256 amount) external {
        super._spendAllowance(owner,spender,amount);
    }

    function $_beforeTokenTransfer(address from,address to,uint256 amount) external {
        super._beforeTokenTransfer(from,to,amount);
    }

    function $_afterTokenTransfer(address from,address to,uint256 amount) external {
        super._afterTokenTransfer(from,to,amount);
    }

    function $_msgSender() external view returns (address ret0) {
        (ret0) = super._msgSender();
    }

    function $_msgData() external view returns (bytes memory ret0) {
        (ret0) = super._msgData();
    }

    receive() external payable {}
}
