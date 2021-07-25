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
        New,
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
     * @dev Customer index information
     */
    struct CustomerInfo {
        uint256         idCustomer;
        CustomerStatus  status;
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
     * @dev Customer table
     */
    Customer[] public customers;

    /**
     * @dev Mapping to access customer information with a phoneHash
     */
    mapping(address => CustomerInfo) public customerList;
    
    /**
     * @dev History table
     */
    History[] public histories;

    /**
     * @dev Mapping to access history information with a phoneHash
     */
    mapping(address => uint256[]) public historyList;

    /**
     * @dev Check that the customer is still active
     */
    modifier activeCustomer(address _phoneHash) {
        require(customerList[_phoneHash].status == CustomerStatus.Active, "Blocked or Unknowed customer");
        _;
    }

    /**
     * @dev Smart Contract constructor
     */
    constructor() {}

    /**
      * @notice Get a Customer with phoneHash
      * @param _phoneHash The address that identifies to the customer
      * @dev This function get the customer (identified with `_phoneHash`)
      */
    function getCustomer(address _phoneHash) public view returns(Customer memory) {
        require(customerList[_phoneHash].status != CustomerStatus.New, "Unknow customer");
        return customers[customerList[_phoneHash].idCustomer];
    }

    /**
      * @notice Inform if the customer is active
      * @param _phoneHash The address that identifies to the customer
      * @dev This function informs if the customer (identified with `_phoneHash`) is active
      */
    function isActiveCustomer(address _phoneHash) public view returns(bool) {
        return (customerList[_phoneHash].status == CustomerStatus.Active ? true : false);
    }

    /**
      * @notice Change the customer status
      * @param _phoneHash The address that identifies to the customer
      * @param _status The new state for the customer
      * @dev This function change the customer's status (using CustomerStatus `_status`) ofr a customer (identified with `_phoneHash`)
      */
    function changeCustomerStatus(address _phoneHash, CustomerStatus _status) public onlyOwner {
        customerList[_phoneHash].status = _status;
        customers[customerList[_phoneHash].idCustomer].status = _status;
        emit CustomerStatusChange(_phoneHash, customerList[_phoneHash].status);
    }

    /**
      * @notice Increase scoring information of a customer
      * @param _phoneHash The address that identifies to the customer
      * @dev This function is directly called when API receives a topUp for a customer (identified with `_phoneHash`) with a target other than Timelapse
      */
    function getScore(address _phoneHash) external view onlyOwner activeCustomer(_phoneHash) returns(uint8) {
        return customers[customerList[_phoneHash].idCustomer].score;
    }

    /**
      * @notice Add customer if unknow and increase scoring information of a customer
      * @param _phoneHash The address that identifies to the customer
      * @dev This function is directly called when API receives a topUp for a customer (identified with `_phoneHash`) with a target other than Timelapse
      */
    function addToScore(address _phoneHash) public onlyOwner {
        if(customerList[_phoneHash].status == CustomerStatus.New) {
            customers.push(Customer(CustomerStatus.Active, 0,0,0,block.timestamp,0));
            customerList[_phoneHash].idCustomer = (customers.length - 1);
            customerList[_phoneHash].status = CustomerStatus.Active;
        }
        customers[customerList[_phoneHash].idCustomer].nbTopUp++;
        changeScore(_phoneHash, process(customers[customerList[_phoneHash].idCustomer]));
    }

    /**
      * @notice Change the score of a customer
      * @param _phoneHash The address that identifies to the customer
      * @dev This function informs if the customer (identified with `_phoneHash`) is active
      */
    function changeScore(address _phoneHash, uint8 _score) public onlyOwner {
        customers[customerList[_phoneHash].idCustomer].score = _score;
        emit ScoreChange(_phoneHash, customers[customerList[_phoneHash].idCustomer].score);
    }

    /**
      * @notice Get the size of the history of a customer
      * @param _phoneHash The address that identifies to the customer
      * @dev Get the size of the history of a customer (identified with `_phoneHash`)
      */
    function getHistorySize(address _phoneHash) public view onlyOwner returns (uint256) {
        return historyList[_phoneHash].length;
    }

    /**
      * @notice Get the size of all the histories
      * @dev Get the size of all the histories
      */
    function getHistoriesSize() public view onlyOwner returns (uint256) {
        return histories.length;
    }

    /**
      * @notice Add amount to customer total amount
      * @param _phoneHash The address that identifies to the customer
      * @dev Add amount to customer (identified with `_phoneHash`) total amount
      */
    function addToCustomerAmount(address _phoneHash, uint _amount) public onlyOwner activeCustomer(_phoneHash) {
        customers[customerList[_phoneHash].idCustomer].amount += _amount;
        customers[customerList[_phoneHash].idCustomer].nbTopUp++;
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
        histories.push(History( _ref, _acceptanceTimestamp, 0, HistoryStatus.Active, _idProduct));
        customers[customerList[_phoneHash].idCustomer].lastAcceptanceID = (histories.length - 1);
        Customer memory customer = customers[customerList[_phoneHash].idCustomer];
        historyList[_phoneHash].push(histories.length - 1);
        History memory lastAcceptance = histories[customer.lastAcceptanceID];
        emit Confirmation(_phoneHash, lastAcceptance.ref, lastAcceptance.acceptanceTimestamp, lastAcceptance.idProduct);
    }

    /**
      * @notice TopUp the last product of a customer
      * @param _phoneHash The address that identifies to the customer
      * @param _paidTimestamp Timestamp of the acceptance
      * @dev TopUp the last product of a customer (identified with `_phoneHash`) at timestamp `_paidTimestamp`
      */
    function topUpBilling(address _phoneHash, uint _paidTimestamp) public onlyOwner {
        require(historyList[_phoneHash].length > 0, "Phone is not registered");
        uint index = historyList[_phoneHash][(historyList[_phoneHash].length - 1)];
        require(histories[index].status == HistoryStatus.Active, "The customer has no product to refund");
        emit TopUpReceived(_phoneHash, histories[index].ref);
        if (customers[customerList[_phoneHash].idCustomer].firstTopUp == 0) {
            customers[customerList[_phoneHash].idCustomer].firstTopUp = block.timestamp;
        }
        histories[index].paidTimestamp = _paidTimestamp;
        histories[index].status = HistoryStatus.Closed;
        emit Acknowledge(_phoneHash, histories[index].ref);
    }

    /**
      * @notice Compute the score of a customer
      * @param _customer The customer
      * @return Score The computed customer score 
      * @dev Compute the score of a customer `_customer`
      */
    function process(Customer memory _customer) public view returns(uint8) {
        uint8 topupAmountPoints;
        uint8 firstTopUpAgePoints;
        uint8 nbTopUpPoints;
        if (_customer.amount >= 0 && _customer.amount <= 4000) {
            topupAmountPoints = 1;
        } else if (_customer.amount > 4000 && _customer.amount <= 15000) {
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
        return (topupAmountPoints * 4) +
            (firstTopUpAgePoints * 6) +
            (nbTopUpPoints * 8);
    }
}