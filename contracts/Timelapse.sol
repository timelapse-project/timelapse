// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./Billing.sol";
import "./Offering.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title This Smart Contract is the entry point of Timelapse.
 * @notice Communicate with API(server/watcher) part and dApp
 * @author Keeymon, DavidRochus
 */
contract Timelapse is Ownable, Billing, Offering {

    /**
     * @dev Smart Contract constructor
     */
    constructor() {}

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
      * @notice Accept the offer
      * @param _phoneHash The address that identifies to the customer
      * @param _ref Reference of the telecom provider
      * @param _acceptanceTimestamp Timestamp of the acceptance
      * @param _idOffer ID of the offer
      * @param _idProposal ID of the proposal
      * @dev Accept the offer `_idOffer` (By choosing proposal `_idProposal`) of a customer (identified with `_phoneHash`) with reference `_ref` at timestamp `_acceptanceTimestamp`
      */
    function acceptance(address _phoneHash, string memory _ref, uint _acceptanceTimestamp, uint256 _idOffer, uint256 _idProposal) public activeCustomer(_phoneHash) {
        acceptanceBilling(_phoneHash, _ref, _acceptanceTimestamp, createProduct(_phoneHash, _acceptanceTimestamp, _idOffer, _idProposal));
    }

     /**
      * @notice TopUp the last product of a customer
      * @param _phoneHash The address that identifies to the customer
      * @param _paidTimestamp Timestamp of the acceptance
      * @dev TopUp the last product of a customer (identified with `_phoneHash`) at timestamp `_paidTimestamp`
      */
    function topUp(address _phoneHash, uint _paidTimestamp) public onlyOwner activeCustomer(_phoneHash) {
        customers[_phoneHash].nbTopUp++;
        customers[_phoneHash].amount += proposals[products[customers[_phoneHash].history[customers[_phoneHash].history.length - 1].idProduct].idProposal].capital +
                                        proposals[products[customers[_phoneHash].history[customers[_phoneHash].history.length - 1].idProduct].idProposal].interest;
        addToScore(_phoneHash);
        topUpBilling(_phoneHash, _paidTimestamp);
    }

    /**
      * @notice Manage the "low balances" received and generate an offer
      * @param _phoneHash The address that identifies to the customer
      * @param _ref Reference of the telecom provider
      * @dev Manage lowBalance (with reference `_ref`) of a customer (identified with `_phoneHash`)
      */
    function lowBalance(address _phoneHash, string memory _ref) public {
        lowBalanceOffering(_phoneHash, _ref, customers[_phoneHash].score);
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