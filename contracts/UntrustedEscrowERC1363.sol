// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "erc-payable-token/contracts/payment/ERC1363Payable.sol";

/**
 * @dev A contract where a buyer can put an arbitrary ERC20 token into a contract and
 * a seller can withdraw it 3 days later using ERC1363 token.
 */
contract UntrustedEscrowERC1363 is ERC1363Payable {
    using SafeERC20 for IERC20;

    // Constants
    uint256 constant THREE_DAYS = 259200;

    // State Variables
    // The token being deposited by buyer/withdrawn by seller
    IERC20 public token;
    address public buyer;
    address public seller;
    uint256 public timelock;

    // Events
    /**
     * @dev Emitted when a buyer deposits an arbitrary ERC20 token.
     */
    event Deposited(address indexed _address, address indexed _token, uint256 amount);
    /**
     * @dev Emitted when a seller withdraws the token.
     */
    event Withdrawn(address indexed operator, address indexed beneficiary, uint256 value, uint256 amount, bytes data);

    constructor(address _buyer, address _seller, IERC1363 _acceptedToken) ERC1363Payable(_acceptedToken) {
        require(_buyer != address(0), "invalid buyer");
        require(_seller != address(0), "invalid seller");
        require(address(_acceptedToken) != address(0), "invalid erc1363 token");

        buyer = _buyer;
        seller = _seller;
    }

    // Functions
    /**
     * @dev Buyer deposits ERC20 token.
     * Requirements:
     * - msg.sender must be a designated buyer
     * - _token must not be a zero address
     * - amount must be > 0
     */
    function deposit(address _token, uint256 _amount) external {
        require(msg.sender == buyer, "not buyer");
        require(_token != address(0), "invalid token address");
        require(_amount > 0, "invalid amount");
        token = IERC20(_token);
        timelock = block.timestamp + THREE_DAYS;
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        emit Deposited(msg.sender, _token, _amount);
    }

    /**
     * @dev This method is called after `onTransferReceived`.
     * Note: remember that the token contract address is always the message sender.
     * @param operator The address which called `transferAndCall` or `transferFromAndCall` function
     * @param sender Address performing the token purchase
     * @param amount The amount of tokens transferred
     * @param data Additional data with no specified format
     */
    function _transferReceived(address operator, address sender, uint256 amount, bytes memory data) internal override {
        _withdrawTokens(operator, sender, amount, data);
    }

    /**
     * @dev This method is called after `onApprovalReceived`.
     * Note: remember that the token contract address is always the message sender.
     * @param sender address The address which called `approveAndCall` function
     * @param amount uint256 The amount of tokens to be spent
     * @param data bytes Additional data with no specified format
     */
    function _approvalReceived(address sender, uint256 amount, bytes memory data) internal override {
        IERC20(acceptedToken()).transferFrom(sender, address(this), amount);
        _withdrawTokens(sender, sender, amount, data);
    }

    /**
     * @dev low level ERC20 token withdrawal.
     * @param operator The address which called `transferAndCall`, `transferFromAndCall` or `approveAndCall` function
     * @param sender Address performing the ERC20 token withdrawal
     * @param amount The amount of tokens transferred
     * @param data Additional data with no specified format
     */
    function _withdrawTokens(address operator, address sender, uint256 amount, bytes memory data) internal {
        uint256 tokens = token.balanceOf(address(this));
        require(amount == tokens);
        require(block.timestamp > timelock, "cannot withdraw before 3 days");
        token.safeTransfer(sender, tokens);
        emit Withdrawn(operator, sender, amount, tokens, data);
        IERC20(acceptedToken()).safeTransfer(buyer, tokens); // Assuming 1 ERC20 token = 1 ERC1363 token
    }
}
