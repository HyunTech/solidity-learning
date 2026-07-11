// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./MultiManagedAccess.sol";

contract MultiManagedAccessMock is MultiManagedAccess {
    uint256 public rewardPerBlock;

    constructor(
        address[5] memory _managers
    ) MultiManagedAccess(msg.sender, _managers) {}

    function setRewardPerBlock(uint256 _amount) external onlyAllConfirmed {
        rewardPerBlock = _amount;
    }
}
