// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @dev A contract where a buyer can put an arbitrary ERC20 token into a contract and
 * a seller can withdraw it 3 days later.
 */
contract UntrustedEscrow {
    using SafeERC20 for IERC20;

    // Constants
    uint256 constant THREE_DAYS = 259200;

    // State variables
    // Enum for buyer and seller
    enum Role {
        BUYER,
        SELLER
    }
    // Address -> Sanctioned(True/False)

    mapping(address => Role) public roles; // Address -> Buyer/Seller

    struct TokenDetails {
        address token;
        uint256 timelock;
    }
    // Address -> TokenDetails

    mapping(address => TokenDetails) public tokenTimelock;

    // Events
    /**
     * @dev Emitted when a buyer deposits an arbitrary ERC20 token.
     */
    event Deposited(address indexed _address, uint256 amount);
    /**
     * @dev Emitted when a seller withdraws the token.
     */
    event Withdrawn(address indexed _address, uint256 amount);

    // Functions
    /**
     * @dev Buyer deposits ERC20 token.
     * Requirements:
     * - token address cannot be zero
     * - amount must be > 0
     * - deposit can only be done by buyer
     * - buyer cannot deposit until sold
     */
    function deposit(address _token, uint256 _amount, Role _role) external {
        require(_token != address(0), "invalid token address");
        require(_amount > 0, "invalid amount");
        require(_role == Role.BUYER, "only buyer can deposit token");
        require(tokenTimelock[msg.sender].timelock == 0, "buyer has a deposit that is not withdrawn");
        roles[msg.sender] = _role;
        tokenTimelock[msg.sender].token = _token;
        tokenTimelock[msg.sender].timelock = block.timestamp;
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        emit Deposited(msg.sender, _amount);
    }

    /**
     * @dev Withdraw sanction of an address.
     * Requirements:
     * - only seller can withdraw a sanction
     * - buyer address cannot be zero
     * - 3 days must have passed for seller to withdraw
     */
    function withdraw(address _buyer, Role _role) external {
        require(_role == Role.SELLER, "only seller can withdraw token");
        require(_buyer != address(0), "invalid buyer address");
        require(block.timestamp > tokenTimelock[_buyer].timelock + THREE_DAYS, "cannot withdraw before 3 days");
        roles[msg.sender] = _role;
        address token = tokenTimelock[_buyer].token;
        uint256 balance = IERC20(token).balanceOf(address(this));
        delete tokenTimelock[_buyer];
        IERC20(token).safeTransfer(msg.sender, balance);
        emit Withdrawn(msg.sender, balance);
    }
}
