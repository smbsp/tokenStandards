# SafeERC20

The SafeERC20 program provides wrappers around ERC20 operations that throw on failure (when the token contract returns false). Tokens that return no value (and instead revert or throw on failure) are also supported, non-reverting calls are assumed to be successful. To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract which allows you to call the safe operations as `token.safeTransfer(...)`, etc.. Some of the most commonly used functions provided by SafeERC20 include:

```shell
safeTransfer
safeTransferFrom
safeApprove
safeIncreaseAllowance
safeDecreaseAllowance
safePermit
```

The library performs a low level call here, to bypass Solidity's return data size checking mechanism. It uses {Address-functionCall} to perform this call, which verifies that the target address contains contract code and also asserts for success in the low-level call.
