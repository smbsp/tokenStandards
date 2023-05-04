// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev A fungible token that allows an admin to ban specified addresses
 * from sending and receiving tokens.
 */
contract TokenWithSanctions is ERC20, Ownable {
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
    constructor(
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        _mint(msg.sender, 1000000 * 10 ** 18); // Mint 1 million tokens to contract creator
    }

    // Functions
    /**
     * @dev Imposes sanction to an address.
     * Requirements:
     * - only admin can impose a sanction
     */
    function sanctionAddress(address _address) external onlyOwner {
        require(!sanctions[_address], "address already sanctioned");
        sanctions[_address] = true;
        emit Sanction(_address);
    }

    /**
     * @dev Withdraw sanction of an address.
     * Requirements:
     * - only admin can withdraw a sanction
     */
    function unsanctionAddress(address _address) external onlyOwner {
        require(sanctions[_address], "address not sanctioned");
        sanctions[_address] = false;
        emit UnSanction(_address);
    }

    /**
     * @dev Returns if an address is sanctioned.
     */
    function isSanctioned(address _address) external view returns (bool) {
        return sanctions[_address];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(!sanctions[msg.sender], "sender sanctioned");
        require(!sanctions[from], "from sanctioned");
        require(!sanctions[to], "receiver sanctioned");
        return super._beforeTokenTransfer(from, to, amount);
    }
}
