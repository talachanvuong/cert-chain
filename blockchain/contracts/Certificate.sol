// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Certificate {
    address public owner;

    constructor() {
        owner = msg.sender;
    }
}
