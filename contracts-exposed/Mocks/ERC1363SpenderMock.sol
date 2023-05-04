// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0;

import "../../contracts/Mocks/ERC1363SpenderMock.sol";

contract $ERC1363SpenderMock is ERC1363SpenderMock {
    bytes32 public __hh_exposed_bytecode_marker = "hardhat-exposed";

    constructor(bytes4 retval, bool reverts) ERC1363SpenderMock(retval, reverts) {}

    receive() external payable {}
}
