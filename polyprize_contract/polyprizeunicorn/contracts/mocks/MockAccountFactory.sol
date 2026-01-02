// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockAccountFactory
 * @dev Mock implementation of Thirdweb's AccountFactory for testing
 */
contract MockAccountFactory {
    mapping(address => bool) private _registered;

    event AccountRegistered(address indexed account);

    /**
     * @dev Check if an address is registered as a smart account
     */
    function isRegistered(address account) external view returns (bool) {
        return _registered[account];
    }

    /**
     * @dev Register an address as a smart account (for testing only)
     */
    function registerAccount(address account) external {
        _registered[account] = true;
        emit AccountRegistered(account);
    }

    /**
     * @dev Unregister an address (for testing only)
     */
    function unregisterAccount(address account) external {
        _registered[account] = false;
    }
}
