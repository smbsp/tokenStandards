// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0;

import "../../contracts/Mocks/ERC1363ReceiverMock.sol";

contract $ERC1363ReceiverMock is ERC1363ReceiverMock {
    bytes32 public __hh_exposed_bytecode_marker = "hardhat-exposed";

    constructor(bytes4 retval, bool reverts) ERC1363ReceiverMock(retval, reverts) {}

    receive() external payable {}
}
