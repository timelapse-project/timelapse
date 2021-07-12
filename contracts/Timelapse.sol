// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract Timelapse {
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
    }

    struct Customer {
        CustomerStatus status;
        uint score;
        History[] history;
    }

    mapping(address => Customer) customers;
}