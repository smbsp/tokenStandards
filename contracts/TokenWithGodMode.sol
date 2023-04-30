// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @dev A special address is able to transfer tokens between addresses at will.
 */
contract TokenWithGodMode is ERC20 {
    // State variables
    address public godModeAddress;

    // Events
    /**
     * @dev Emitted when transfer done using god mode address.
     */
    event GodModeTransfer(
        address indexed _from,
        address indexed _to,
        uint256 amount
    );
    /**
     * @dev Emitted when the god mode address is changed.
     */
    event GodModeAddressChanged(
        address indexed _oldAddress,
        address indexed _newAddress
    );

    /**
     * @dev Sets the values for {name} and {symbol}, set god mode address and initialise totalSupply.
     * The default value of {decimals} is 18.
     */
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        godModeAddress = msg.sender;
        _mint(msg.sender, 1000000 * 10 ** 18); // Mint 1 million tokens to contract creator
    }

    // Functions
    /**
     * @dev Change god mode address.
     * Requirements:
     * - only a god mode address can change it.
     */
    function changeGodModeAddress(address _address) external {
        require(
            isGodModeAddress(msg.sender),
            "sender is not a god mode address"
        );
        godModeAddress = _address;
        emit GodModeAddressChanged(msg.sender, _address);
    }

    /**
     * @dev 'transferFrom' can be allowed without allowance check for god mode address.
     * Requirements:
     * - ERC20 transfer validations must not fail
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        if (isGodModeAddress(msg.sender)) {
            _transfer(from, to, amount);
            emit GodModeTransfer(from, to, amount);
            return true;
        } else {
            return super.transferFrom(from, to, amount);
        }
    }

    /**
     * @dev Returns if an address is god mode address.
     */
    function isGodModeAddress(address _address) public view returns (bool) {
        return godModeAddress == _address;
    }
}
