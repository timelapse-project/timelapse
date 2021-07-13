// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./Billing.sol";
import "./Offering.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Timelapse is Ownable, Billing, Offering {

    constructor() {}

    function addToScore(address _phoneHash, uint _acceptanceTimestamp, uint _paidTimestamp) public onlyOwner activeCustomer(_phoneHash) {
        changeScore(_phoneHash, process(customers[_phoneHash].score, _acceptanceTimestamp, _paidTimestamp));
    }

    function topUp(address _phoneHash, uint _paidTimestamp) public onlyOwner {
        addToScore(_phoneHash, customers[_phoneHash].history[customers[_phoneHash].history.length - 1].acceptanceTimestamp, _paidTimestamp);
        topUpBilling(_phoneHash, _paidTimestamp);
    }

    function lowBalance() public {

    }
}