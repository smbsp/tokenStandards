// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0;

import "../contracts/UntrustedEscrow.sol";

contract $UntrustedEscrow is UntrustedEscrow {
    bytes32 public __hh_exposed_bytecode_marker = "hardhat-exposed";

    constructor() {}

    function $THREE_DAYS() external pure returns (uint256) {
        return THREE_DAYS;
    }

    receive() external payable {}
}
