// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";

/**
 * @dev A fungible token that allows an admin to ban specified addresses
 * from sending and receiving tokens.
 */
contract TokenWithSanctions is ERC20, AccessControl {
    // State variables

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    // Address -> Sanctioned(True/False)
    mapping(address => bool) public sanctions;

    // Events

    /**
     * @dev Emitted when an address is sanctioned by admin.
     */
    event Sanction(address indexed _address);
    /**
     * @dev Emitted when an address is unsanctioned by admin
     */
    event UnSanction(address indexed _address);

    /**
     * @dev Sets the values for {name} and {symbol} and mark the msg.sender as admin.
     * The default value of {decimals} is 18.
     */
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    // Functions

    /**
     * @dev See Openzeppelin Access Control.
     * This adds an admin to the contract.
     */
    function addAdmin(address user) external onlyRole(ADMIN_ROLE) {
        console.log(user);
        console.logBytes32(ADMIN_ROLE);
        grantRole(ADMIN_ROLE, user);
    }

    /**
     * @dev See Openzeppelin Access Control.
     * This removes an admin from the contract.
     */
    function removeAdmin(address user) external onlyRole(ADMIN_ROLE) {
        revokeRole(ADMIN_ROLE, user);
    }

    /**
     * @dev Imposes sanction to an address.
     * Requirements:
     * - only admin can impose a sanction
     */
    function sanctionAddress(address _address) external onlyRole(ADMIN_ROLE) {
        sanctions[_address] = true;
    }

    /**
     * @dev Withdraw sanction of an address.
     * Requirements:
     * - only admin can withdraw a sanction
     */
    function unsanctionAddress(address _address) external onlyRole(ADMIN_ROLE) {
        require(sanctions[_address], "address not sanctioned");
        sanctions[_address] = false;
    }

    /**
     * @dev 'transfer' prohibited for sanctioned addresses.
     * Requirements:
     * - sender is not sanctioned
     * - receiver is not sanctioned
     */
    function transfer(
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        require(!sanctions[msg.sender], "sender sanctioned");
        require(!sanctions[to], "receiver sanctioned");
        return super.transfer(to, amount);
    }

    /**
     * @dev 'transferFrom' prohibited for sanctioned addresses.
     * Requirements:
     * - sender is not sanctioned
     * - receiver is not sanctioned
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        require(!sanctions[from], "sender sanctioned");
        require(!sanctions[to], "receiver sanctioned");
        return super.transferFrom(from, to, amount);
    }

    /**
     * @dev Returns if an address is sanctioned.
     */
    function isSanctioned(address _address) external view returns (bool) {
        return sanctions[_address];
    }
}
