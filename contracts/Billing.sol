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
        string          ref;
        uint            acceptanceTimestamp;
        uint            paidTimestamp;
        HistoryStatus   status;
        uint256         idProduct;
    }

    /**
     * @dev Customer information
     */
    struct Customer {
        CustomerStatus  status;
        uint8           score;
        uint256         nbTopUp;
        uint256         amount;
        uint            firstTopUp;
        uint256         lastAcceptanceID;
    }

    /**
     * @dev Activity log
     */
    struct ActivityLog {
        string log;
        uint256 timestamp;
        string status;
    }

    /**
     * @dev Triggered when status of a customer has changed
     */
    event CustomerStatusChange(address phoneHash, CustomerStatus status);
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
     * @dev Mapping to access history information with a phoneHash
     */
    mapping(address => History[]) public histories;

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
      * @notice Change the customer status
      * @param _phoneHash The address that identifies to the customer
      * @param _status The new state for the customer
      * @dev This function change the customer's status (using CustomerStatus `_status`) ofr a customer (identified with `_phoneHash`)
      */
    function changeCustomerStatus(address _phoneHash, CustomerStatus _status) public onlyOwner {
        customers[_phoneHash].status = _status;
        emit CustomerStatusChange(_phoneHash, customers[_phoneHash].status);
    }

    /**
      * @notice Increase scoring information of a customer
      * @param _phoneHash The address that identifies to the customer
      * @dev This function is directly called when API receives a topUp for a customer (identified with `_phoneHash`) with a target other than Timelapse
      */
    function getScore(address _phoneHash) external view onlyOwner activeCustomer(_phoneHash) returns(uint8) {
        return customers[_phoneHash].score;
    }

    /**
      * @notice Increase scoring information of a customer
      * @param _phoneHash The address that identifies to the customer
      * @dev This function is directly called when API receives a topUp for a customer (identified with `_phoneHash`) with a target other than Timelapse
      */
    function addToScore(address _phoneHash) public onlyOwner activeCustomer(_phoneHash) {
            if (customers[_phoneHash].firstTopUp == 0)
            customers[_phoneHash].firstTopUp = block.timestamp;
        customers[_phoneHash].nbTopUp++;
        changeScore(_phoneHash, process(customers[_phoneHash]));
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
      * @notice Get the size of the history of a customer
      * @param _phoneHash The address that identifies to the customer
      * @dev Get the size of the history of a customer (identified with `_phoneHash`)
      */
    function getHistorySize(address _phoneHash) public view onlyOwner returns (uint256) {
        return histories[_phoneHash].length;
    }

    /**
      * @notice Add amount to customer total amount
      * @param _phoneHash The address that identifies to the customer
      * @dev Add amount to customer (identified with `_phoneHash`) total amount
      */
    function addToCustomerAmount(address _phoneHash, uint _amount) public onlyOwner activeCustomer(_phoneHash) {
        customers[_phoneHash].amount += _amount;
        customers[_phoneHash].nbTopUp++;
    }

    /**
      * @notice Add an acceptance in the customer history
      * @param _phoneHash The address that identifies to the customer
      * @param _ref Reference of the telecom provider
      * @param _acceptanceTimestamp Timestamp of the acceptance
      * @param _idProduct ID of the product
      * @dev Add a customer product history (using reference `_ref`, product `_idProduct`, timestamp `_acceptanceTimestamp`) for a customer (identified with `_phoneHash`)
      */
    function acceptanceBilling(address _phoneHash, string memory _ref, uint _acceptanceTimestamp, uint256 _idProduct) public onlyOwner activeCustomer(_phoneHash) {
        emit AcceptanceReceived(_phoneHash, _ref, _acceptanceTimestamp, _idProduct);
        histories[_phoneHash].push(History( _ref, _acceptanceTimestamp, 0, HistoryStatus.Active, _idProduct));
        Customer memory customer = customers[_phoneHash];
        customer.lastAcceptanceID = (histories[_phoneHash].length - 1);
        History memory lastAcceptance = histories[_phoneHash][customer.lastAcceptanceID];
        emit Confirmation(_phoneHash, lastAcceptance.ref, lastAcceptance.acceptanceTimestamp, lastAcceptance.idProduct);
    }

    /**
      * @notice TopUp the last product of a customer
      * @param _phoneHash The address that identifies to the customer
      * @param _paidTimestamp Timestamp of the acceptance
      * @dev TopUp the last product of a customer (identified with `_phoneHash`) at timestamp `_paidTimestamp`
      */
    function topUpBilling(address _phoneHash, uint _paidTimestamp) public onlyOwner {
        require(histories[_phoneHash].length > 0, "Phone is not registered");
        uint index = (histories[_phoneHash].length - 1);
        require(histories[_phoneHash][index].status == HistoryStatus.Active, "The customer has no product to refund");

        emit TopUpReceived(_phoneHash, histories[_phoneHash][index].ref);
        histories[_phoneHash][index].paidTimestamp = _paidTimestamp;
        histories[_phoneHash][index].status = HistoryStatus.Closed;
        /*
        if(customers[_phoneHash].score == 0) { // On mettra ca ailleur
            customers[_phoneHash].status = CustomerStatus.Closed;
            emit CustomerIsDeleted(_phoneHash);
        }
        */
        emit Acknowledge(_phoneHash, histories[_phoneHash][index].ref);
    }

    /**
      * @notice Compute the score of a customer
      * @param _customer The customer
      * @return Score The computed customer score 
      * @dev Compute the score of a customer `_customer`
      */
    function process(Customer memory _customer) public view returns(uint8) {
        uint8 score;
        uint8 topupAmountPoints;
        uint8 firstTopUpAgePoints;
        uint8 nbTopUpPoints;
        if (_customer.amount >= 0 && _customer.amount <= 40) {
            topupAmountPoints = 1;
        } else if (_customer.amount > 40 && _customer.amount <= 150) {
            topupAmountPoints = 2;
        } else {
            topupAmountPoints = 3;
        }
        if (_customer.firstTopUp >= (block.timestamp - 90 days)) {
            firstTopUpAgePoints = 0;
        } else if (
            _customer.firstTopUp < (block.timestamp - 90 days) &&
            _customer.firstTopUp >= (block.timestamp - 180 days)
        ) {
            firstTopUpAgePoints = 2;
        } else if (
            _customer.firstTopUp < (block.timestamp - 180 days) &&
            _customer.firstTopUp >= (block.timestamp - 330 days)
        ) {
            firstTopUpAgePoints = 6;
        } else {
            firstTopUpAgePoints = 15;
        }
        if (_customer.nbTopUp == 0) {
            nbTopUpPoints = 0;
        } else if (_customer.nbTopUp > 0 && _customer.nbTopUp <= 10) {
            nbTopUpPoints = 1;
        } else if (_customer.nbTopUp > 10 && _customer.nbTopUp <= 20) {
            nbTopUpPoints = 5;
        } else {
            nbTopUpPoints = 15;
        }

        score =
            (topupAmountPoints * 4) +
            (firstTopUpAgePoints * 6) +
            (nbTopUpPoints * 8);
        return score;
    }
}