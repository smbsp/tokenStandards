// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0;

import "../../contracts/Mocks/ERC1363PayableMock.sol";

contract $ERC1363PayableMock is ERC1363PayableMock {
    bytes32 public __hh_exposed_bytecode_marker = "hardhat-exposed";

    constructor(IERC1363 acceptedToken) ERC1363PayableMock(acceptedToken) {}

    function $_transferReceived(address spender,address sender,uint256 amount,bytes calldata data) external {
        super._transferReceived(spender,sender,amount,data);
    }

    function $_approvalReceived(address sender,uint256 amount,bytes calldata data) external {
        super._approvalReceived(sender,amount,data);
    }

    function $_msgSender() external view returns (address ret0) {
        (ret0) = super._msgSender();
    }

    function $_msgData() external view returns (bytes memory ret0) {
        (ret0) = super._msgData();
    }

    receive() external payable {}
}
