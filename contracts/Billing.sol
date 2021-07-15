// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title This Smart Contract is responsible of the Billing.
 * @notice Manage all aspects related to billing (customers, accounting and billing management)
 * @author Keeymon, DavidRochus
 */
contract Billing is Ownable {
    /**
     * @dev Customer status
     */
    enum CustomerStatus {
        Active,
        Closed
    }

    /**
     * @dev History status
     */
    enum HistoryStatus {
        Active,
        Closed
    }

    /**
     * @dev Customer product history
     */
    struct History {
        string ref;
        uint acceptanceTimestamp;
        uint paidTimestamp;
        HistoryStatus status;
        uint256 idProduct; // Pas mieux d'avoir juste l'ID du produit du coup ? ya tout dedans
    }

    /**
     * @dev Customer information
     */
    struct Customer {
        CustomerStatus status;
        uint8 score;
        uint256 nbTopUp;
        uint256 amount;
        uint firstTopUp;
        History[] history;
    }

    /**
     * @dev Triggered when score of a customer has changed 
     */
    event ScoreChange(address phoneHash, uint8 score);
    /**
     * @dev Triggered when a customer has been deleted
     */
    event CustomerIsDeleted(address phoneHash);
    /**
     * @dev Triggered when an Acceptance is received
     */
    event AcceptanceReceived(address phoneHash, string ref, uint acceptanceTimestamp, uint256 idProduct);
    /**
     * @dev Triggered when confirmation has to be sent
     */
    event Confirmation(address phoneHash, string ref, uint acceptanceTimestamp, uint256 idProduct);
    /**
     * @dev Triggered when a topUp is received
     */
    event TopUpReceived(address phoneHash, string ref);
    /**
     * @dev Triggered when an acknowledge has to be sent
     */
    event Acknowledge(address phoneHash, string ref);   

    /**
     * @dev Mapping to access customer information with a phoneHash
     */
    mapping(address => Customer) public customers;

    /**
     * @dev Check that the customer is still active
     */
    modifier activeCustomer(address _phoneHash) {
        require(customers[_phoneHash].status == CustomerStatus.Active, "Blocked customer");
        _;
    }

    /**
     * @dev Smart Contract constructor
     */
    constructor() {}

    /**
      * @notice Inform if the customer is active
      * @param _phoneHash The address that identifies to the customer
      * @dev This function informs if the customer (identified with `_phoneHash`) is active
      */
    function isActiveCustomer(address _phoneHash) public view returns(bool) {
        return (customers[_phoneHash].status == CustomerStatus.Active ? true : false);
    }

    /**
      * @notice Change the score of a customer
      * @param _phoneHash The address that identifies to the customer
      * @dev This function informs if the customer (identified with `_phoneHash`) is active
      */
    function changeScore(address _phoneHash, uint8 _score) public onlyOwner {
        customers[_phoneHash].score = _score;
        emit ScoreChange(_phoneHash, customers[_phoneHash].score);
    }

    /**
      * @notice TopUp the last product of a customer
      * @param _phoneHash The address that identifies to the customer
      * @param _paidTimestamp Timestamp of the acceptance
      * @dev TopUp the last product of a customer (identified with `_phoneHash`) at timestamp `_paidTimestamp`
      */
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

    /**
      * @notice Add an acceptance in the customer history
      * @param _phoneHash The address that identifies to the customer
      * @param _ref Reference of the telecom provider
      * @param _acceptanceTimestamp Timestamp of the acceptance
      * @param _idProduct ID of the product
      * @dev Add a customer product history (using reference `_ref`, product `_idProduct`, timestamp `_acceptanceTimestamp`) for a customer (identified with `_phoneHash`)
      */
    function acceptanceBilling(address _phoneHash, string memory _ref, uint _acceptanceTimestamp, uint256 _idProduct) public activeCustomer(_phoneHash) {
        emit AcceptanceReceived(_phoneHash, _ref, _acceptanceTimestamp, _idProduct);
        customers[_phoneHash].history.push(History( _ref, _acceptanceTimestamp, 0, HistoryStatus.Active, _idProduct));
        emit Confirmation(_phoneHash, _ref, _acceptanceTimestamp, _idProduct);
     }
}