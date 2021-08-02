// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

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
        string ref;
        uint256 acceptanceTimestamp;
        uint256 paidTimestamp;
        uint256 productId;
        HistoryStatus status;
    }

    /**
     * @dev Customer information
     */
    struct Customer {
        uint8 score;
        uint256 nbTopUp;
        uint256 amount;
        uint256 firstTopUp;
        uint256 lastAcceptanceID;
        CustomerStatus status;
    }

    /**
     * @dev Customer index information
     */
    struct CustomerInfo {
        uint256 customerId;
        CustomerStatus status;
    }

    /**
     * @dev Triggered when status of a customer has changed
     */
    event CustomerStatusChange(address phoneHash, CustomerStatus status);

    /**
     * @dev Triggered when score of a customer has changed
     */
    event ScoreChanged(address phoneHash, uint8 score);

    /**
     * @dev Triggered when a customer has been deleted
     */
    event CustomerIsDeleted(address phoneHash);

    /**
     * @dev Triggered when an Acceptance is received
     */
    event AcceptanceReceived(
        address phoneHash,
        string ref,
        uint256 acceptanceTimestamp,
        uint256 productId
    );

    /**
     * @dev Triggered when confirmation has to be sent
     */
    event ConfirmationSent(
        address phoneHash,
        string ref,
        uint256 acceptanceTimestamp,
        uint256 productId
    );

    /**
     * @dev Triggered when a topUp is received
     */
    event TopUpReceived(address phoneHash, string ref);

    /**
     * @dev Triggered when an acknowledge has to be sent
     */
    event AcknowledgeSent(address phoneHash, string ref);

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
        require(
            customerList[_phoneHash].status == CustomerStatus.Active,
            "Blocked or Unknowed customer"
        );
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
    function getCustomer(address _phoneHash)
        external
        view
        returns (Customer memory)
    {
        require(
            customerList[_phoneHash].status != CustomerStatus.New,
            "Unknow customer"
        );
        return customers[customerList[_phoneHash].customerId];
    }

    /**
     * @notice Inform if the customer is active
     * @param _phoneHash The address that identifies to the customer
     * @dev This function informs if the customer (identified with `_phoneHash`) is active
     */
    function isActiveCustomer(address _phoneHash) external view returns (bool) {
        return (
            customerList[_phoneHash].status == CustomerStatus.Active
                ? true
                : false
        );
    }

    /**
     * @notice Change the customer status
     * @param _phoneHash The address that identifies to the customer
     * @param _status The new state for the customer
     * @dev This function change the customer's status (using CustomerStatus `_status`) ofr a customer (identified with `_phoneHash`)
     */
    function changeCustomerStatus(address _phoneHash, CustomerStatus _status)
        external
        onlyOwner
    {
        customerList[_phoneHash].status = _status;
        customers[customerList[_phoneHash].customerId].status = _status;
        emit CustomerStatusChange(_phoneHash, customerList[_phoneHash].status);
    }

    /**
     * @notice Increase scoring information of a customer
     * @param _phoneHash The address that identifies to the customer
     * @dev This function is directly called when API receives a topUp for a customer (identified with `_phoneHash`) with a target other than Timelapse
     */
    function getScore(address _phoneHash)
        external
        view
        onlyOwner
        activeCustomer(_phoneHash)
        returns (uint8)
    {
        return customers[customerList[_phoneHash].customerId].score;
    }

    /**
     * @notice Add customer if unknow and increase scoring information of a customer
     * @param _phoneHash The address that identifies to the customer
     * @dev This function is directly called when API receives a topUp for a customer (identified with `_phoneHash`) with a target other than Timelapse
     */
    function addToScore(address _phoneHash) external onlyOwner {
        if (customerList[_phoneHash].status == CustomerStatus.New) {
            customers.push(
                Customer(0, 0, 0, block.timestamp, 0, CustomerStatus.Active)
            );
            customerList[_phoneHash].customerId = (customers.length - 1);
            customerList[_phoneHash].status = CustomerStatus.Active;
        }
        customers[customerList[_phoneHash].customerId].nbTopUp++;
        changeScore(
            _phoneHash,
            scoring(customers[customerList[_phoneHash].customerId])
        );
    }

    /**
     * @notice Change the score of a customer
     * @param _phoneHash The address that identifies to the customer
     * @dev This function informs if the customer (identified with `_phoneHash`) is active
     */
    function changeScore(address _phoneHash, uint8 _score) public onlyOwner {
        customers[customerList[_phoneHash].customerId].score = _score;
        emit ScoreChanged(
            _phoneHash,
            customers[customerList[_phoneHash].customerId].score
        );
    }

    /**
     * @notice Get the size of the history of a customer
     * @param _phoneHash The address that identifies to the customer
     * @dev Get the size of the history of a customer (identified with `_phoneHash`)
     */
    function getHistorySize(address _phoneHash)
        external
        view
        onlyOwner
        returns (uint256)
    {
        return historyList[_phoneHash].length;
    }

    /**
     * @notice Get the size of all the histories
     * @dev Get the size of all the histories
     */
    function getHistoriesSize() external view onlyOwner returns (uint256) {
        return histories.length;
    }

    /**
     * @notice Add amount to customer total amount
     * @param _phoneHash The address that identifies to the customer
     * @dev Add amount to customer (identified with `_phoneHash`) total amount
     */
    function addToCustomerAmount(address _phoneHash, uint256 _amount)
        external
        onlyOwner
        activeCustomer(_phoneHash)
    {
        customers[customerList[_phoneHash].customerId].amount += _amount;
        customers[customerList[_phoneHash].customerId].nbTopUp++;
    }

    /**
     * @notice Add an acceptance in the customer history
     * @param _phoneHash The address that identifies to the customer
     * @param _ref Reference of the telecom provider
     * @param _acceptanceTimestamp Timestamp of the acceptance
     * @param _productId ID of the product
     * @dev Add a customer product history (using reference `_ref`, product `_productId`, timestamp `_acceptanceTimestamp`) for a customer (identified with `_phoneHash`)
     */
    function acceptanceBilling(
        address _phoneHash,
        string memory _ref,
        uint256 _acceptanceTimestamp,
        uint256 _productId
    ) external onlyOwner activeCustomer(_phoneHash) {
        emit AcceptanceReceived(
            _phoneHash,
            _ref,
            _acceptanceTimestamp,
            _productId
        );
        histories.push(
            History(
                _ref,
                _acceptanceTimestamp,
                0,
                _productId,
                HistoryStatus.Active
            )
        );
        customers[customerList[_phoneHash].customerId]
            .lastAcceptanceID = (histories.length - 1);
        Customer memory customer = customers[
            customerList[_phoneHash].customerId
        ];
        historyList[_phoneHash].push(histories.length - 1);
        History memory lastAcceptance = histories[customer.lastAcceptanceID];
        emit ConfirmationSent(
            _phoneHash,
            lastAcceptance.ref,
            lastAcceptance.acceptanceTimestamp,
            lastAcceptance.productId
        );
    }

    /**
     * @notice TopUp the last product of a customer
     * @param _phoneHash The address that identifies to the customer
     * @param _paidTimestamp Timestamp of the acceptance
     * @dev TopUp the last product of a customer (identified with `_phoneHash`) at timestamp `_paidTimestamp`
     */
    function topUpBilling(address _phoneHash, uint256 _paidTimestamp)
        external
        onlyOwner
    {
        require(historyList[_phoneHash].length > 0, "Phone is not registered");
        uint256 index = historyList[_phoneHash][
            (historyList[_phoneHash].length - 1)
        ];
        require(
            histories[index].status == HistoryStatus.Active,
            "The customer has no product to refund"
        );
        emit TopUpReceived(_phoneHash, histories[index].ref);
        if (customers[customerList[_phoneHash].customerId].firstTopUp == 0) {
            customers[customerList[_phoneHash].customerId].firstTopUp = block
                .timestamp;
        }
        histories[index].paidTimestamp = _paidTimestamp;
        histories[index].status = HistoryStatus.Closed;
        emit AcknowledgeSent(_phoneHash, histories[index].ref);
    }

    /**
     * @notice Compute the score of a customer
     * @param _customer The customer
     * @return Score The computed customer score
     * @dev Compute the score of a customer `_customer`
     */
    function scoring(Customer memory _customer) public view returns (uint8) {
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
        return
            (topupAmountPoints * 4) +
            (firstTopUpAgePoints * 6) +
            (nbTopUpPoints * 8);
    }
}
