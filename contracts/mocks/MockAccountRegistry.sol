// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MockAccountRegistry is Ownable {
    mapping(address => mapping(uint256 => mapping(uint256 => address))) public accounts;
    mapping(address => bool) public accountExists;

    event AccountCreated(
        address indexed account,
        address indexed tokenContract,
        uint256 indexed tokenId,
        uint256 salt
    );

    constructor() Ownable(msg.sender) {}

    function createAccount(
        address tokenContract,
        uint256 tokenId,
        uint256 salt,
        address implementation
    ) external returns (address account) {
        account = computeAccount(tokenContract, tokenId, salt);
        accounts[tokenContract][tokenId][salt] = account;
        accountExists[account] = true;
        
        emit AccountCreated(account, tokenContract, tokenId, salt);
        return account;
    }

    function getAccount(
        address tokenContract,
        uint256 tokenId,
        uint256 salt
    ) external view returns (address account) {
        return accounts[tokenContract][tokenId][salt];
    }

    function computeAccount(
        address tokenContract,
        uint256 tokenId,
        uint256 salt
    ) public pure returns (address account) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(0), // factory address
                keccak256(abi.encodePacked(tokenContract, tokenId, salt)),
                keccak256(type(MockAccountRegistry).creationCode)
            )
        );
        return address(uint160(uint256(hash)));
    }

    function accountExists(address account) external view returns (bool) {
        return accountExists[account];
    }

    function getAccountsByToken(
        address tokenContract,
        uint256 tokenId
    ) external view returns (address[] memory) {
        // This is a simplified implementation for testing
        // In a real scenario, you'd need to track all salts for a given token
        address[] memory foundAccounts = new address[](1);
        foundAccounts[0] = accounts[tokenContract][tokenId][0]; // Assuming salt 0
        return foundAccounts;
    }
}


