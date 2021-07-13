// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract Scoring {
    constructor() {}

    function process(uint _previousScore, uint _acceptanceTimestamp, uint _paidTimestamp) public view returns(uint) {
        uint score;
        // mettre les calculs et la logique pour scorer correctement
        return score;
    }
}