// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0;

import "../contracts/LinearBondingCurve.sol";

contract $LinearBondingCurve is LinearBondingCurve {
    bytes32 public __hh_exposed_bytecode_marker = "hardhat-exposed";

    constructor(address wallet_, IERC20 token_, IERC1363 acceptedToken_) LinearBondingCurve(wallet_, token_, acceptedToken_) {}

    function $_transferReceived(address operator,address sender,uint256 amount,bytes calldata data) external {
        super._transferReceived(operator,sender,amount,data);
    }

    function $_approvalReceived(address sender,uint256 amount,bytes calldata data) external {
        super._approvalReceived(sender,amount,data);
    }

    function $_buyTokens(address operator,address sender,uint256 amount,bytes calldata data) external {
        super._buyTokens(operator,sender,amount,data);
    }

    function $_preValidatePurchase(uint256 sentTokenAmount) external pure {
        super._preValidatePurchase(sentTokenAmount);
    }

    function $_postValidatePurchase(address beneficiary,uint256 sentTokenAmount) external {
        super._postValidatePurchase(beneficiary,sentTokenAmount);
    }

    function $_deliverTokens(address beneficiary,uint256 tokenAmount) external {
        super._deliverTokens(beneficiary,tokenAmount);
    }

    function $_processPurchase(address beneficiary,uint256 tokenAmount) external {
        super._processPurchase(beneficiary,tokenAmount);
    }

    function $_updatePurchasingState(address beneficiary,uint256 sentTokenAmount,bytes calldata data) external {
        super._updatePurchasingState(beneficiary,sentTokenAmount,data);
    }

    function $_forwardFunds(uint256 sentTokenAmount) external {
        super._forwardFunds(sentTokenAmount);
    }

    function $_msgSender() external view returns (address ret0) {
        (ret0) = super._msgSender();
    }

    function $_msgData() external view returns (bytes memory ret0) {
        (ret0) = super._msgData();
    }

    receive() external payable {}
}
