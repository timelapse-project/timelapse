// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Billing is Ownable {
    enum CustomerStatus {
        Active,
        Closed
    }

    enum HistoryStatus {
        Active,
        Closed
    }

    struct History {
        string ref;
        uint acceptanceTimestamp;
        uint paidTimestamp;
        HistoryStatus status;
        uint256 idProduct; // Pas mieux d'avoir juste l'ID du produit du coup ? ya tout dedans
    }

    struct Customer {
        CustomerStatus status;
        uint8 score;
        uint256 nbTopUp;
        uint256 amount;
        uint firstTopUp;
        History[] history;
    }

    event ScoreChange(address phoneHash, uint8 score);
    event CustomerIsDeleted(address phoneHash);
    event AcceptanceReceived(address phoneHash, string ref, uint acceptanceTimestamp, uint256 idProduct);
    event Confirmation(address phoneHash, string ref, uint acceptanceTimestamp, uint256 idProduct);
    event TopUpReceived(address phoneHash, string ref);
    event Acknowledge(address phoneHash, string ref);   

    mapping(address => Customer) public customers;

    modifier activeCustomer(address _phoneHash) {
        require(customers[_phoneHash].status == CustomerStatus.Active, "Blocked customer");
        _;
    }

    constructor() {}

    function isActiveCustomer(address _phoneHash) public view returns(bool) {
        return (customers[_phoneHash].status == CustomerStatus.Active ? true : false);
    }

    function changeScore(address _phoneHash, uint8 _score) public onlyOwner {
        customers[_phoneHash].score = _score;
        emit ScoreChange(_phoneHash, customers[_phoneHash].score);
    }

    function topUpBilling(address _phoneHash, uint _paidTimestamp) public onlyOwner activeCustomer(_phoneHash) {
        uint index = customers[_phoneHash].history.length - 1;
        require(customers[_phoneHash].history.length > 0, "Phone is not registered");
        require(customers[_phoneHash].history[index].status == HistoryStatus.Active, "The customer has no product to refund");

        emit TopUpReceived(_phoneHash, customers[_phoneHash].history[index].ref);
        customers[_phoneHash].history[index].paidTimestamp = _paidTimestamp;
        customers[_phoneHash].history[index].status = HistoryStatus.Closed;
        if(customers[_phoneHash].score == 0) { // On mettra ca ailleur
            customers[_phoneHash].status = CustomerStatus.Closed;
            emit CustomerIsDeleted(_phoneHash);
        }
        emit Acknowledge(_phoneHash, customers[_phoneHash].history[index].ref);
    }

    function acceptanceBilling(address _phoneHash, string memory _ref, uint _acceptanceTimestamp, uint256 idProduct) public activeCustomer(_phoneHash) {
        emit AcceptanceReceived(_phoneHash, _ref, _acceptanceTimestamp, idProduct);
        customers[_phoneHash].history.push(History( _ref, _acceptanceTimestamp, 0, HistoryStatus.Active, idProduct));
        emit Confirmation(_phoneHash, _ref, _acceptanceTimestamp, idProduct);
     }
}