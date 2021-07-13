// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./Billing.sol";
import "./Scoring.sol"
import "./Offering.sol"
import "@openzeppelin/contracts/access/Ownable.sol";

contract Timelapse is Ownable {
    enum CustomerStatus {
        Active,
        Closed
    }

    enum HistoryStatus {
        Active,
        Closed
    }

    struct History {
        uint acceptanceTimestamp;
        uint paidTimestamp;
        HistoryStatus status;
        string reference;
    }

    struct Customer {
        CustomerStatus status;
        uint score;
        History[] history;
    }

    mapping(address => Customer) public customers;
    Scoring private scoringInstance;
    Offering private offeringInstance;
    Billing private billingInstance;

    modifier activeCustomer(address _phoneHash) {
        require(customers[_phoneHash].status == CustomerStatus.Active, "Blocked customer");
        _;
    }

    constructor() {
        scoringInstance = new Scoring();
        offeringInstance = new Offering();
        billingInstance = new Billing();
    }

    function addToScore(address _phoneHash, uint _acceptanceTimestamp, uint _paidTimestamp) public activeCustomer(_phoneHash) {
        customers[_phoneHash].score = scoringInstance.process(customers[_phoneHash].score, _acceptanceTimestamp, _paidTimestamp);
    }

    function topUp(address _phoneHash) public onlyOwner activeCustomer(_phoneHash, uint _paidTimestamp) {
        require(customers[_phoneHash].history.length > 0, "Phone is not registered");
        require(customers[_phoneHash].history[history.length - 1].status == HistoryStatus.Active, "The customer has no product to refund");
        customers[_phoneHash].paidTimestamp = _paidTimestamp;
        customers[_phoneHash].history[history.length - 1].status = HistoryStatus.Closed;
        customers[_phoneHash].score = scoringInstance.process(customers[_phoneHash].score, customers[_phoneHash].acceptanceTimestamp, customers[_phoneHash].paidTimestamp);
        if(customers[_phoneHash].score == 0)
            customers[_phoneHash].status = CustomerStatus.Closed;
    }
}