// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract MultiManagedAccess {
    uint256 public constant MANAGER_NUMBERS = 5;
    address public owner;
    address[5] public managers;
    bool[5] public confirmed;

    constructor(address _owner, address[5] memory _managers) {
        owner = _owner;

        for (uint256 i = 0; i < MANAGER_NUMBERS; i++) {
            managers[i] = _managers[i];
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not authorized");
        _;
    }

    modifier onlyManager() {
        require(isManager(msg.sender), "You are not a manager");
        _;
    }

    modifier onlyAllConfirmed() {
        require(isManager(msg.sender), "You are not a manager");
        require(allConfirmed(), "Not all confirmed yet");
        _;
        reset();
    }

    function isManager(address account) public view returns (bool) {
        for (uint256 i = 0; i < MANAGER_NUMBERS; i++) {
            if (account == managers[i]) {
                return true;
            }
        }

        return false;
    }

    function allConfirmed() public view returns (bool) {
        for (uint256 i = 0; i < MANAGER_NUMBERS; i++) {
            if (!confirmed[i]) {
                return false;
            }
        }

        return true;
    }

    function reset() internal {
        for (uint256 i = 0; i < MANAGER_NUMBERS; i++) {
            confirmed[i] = false;
        }
    }

    function confirm() external onlyManager {
        for (uint256 i = 0; i < MANAGER_NUMBERS; i++) {
            if (msg.sender == managers[i]) {
                confirmed[i] = true;
                break;
            }
        }
    }
}
