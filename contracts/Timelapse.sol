// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./Billing.sol";
import "./Offering.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Timelapse is Ownable, Billing, Offering {

    constructor() {}

    function addToScore(address _phoneHash) public onlyOwner activeCustomer(_phoneHash) {
        if (customers[_phoneHash].firstTopUp == 0)
            customers[_phoneHash].firstTopUp = block.timestamp;
        customers[_phoneHash].nbTopUp++;
        changeScore(_phoneHash, process(customers[_phoneHash]));
    }

    function acceptance(address _phoneHash, string memory _ref, uint _acceptanceTimestamp, uint256 _idOffer, uint256 _idProposal) public activeCustomer(_phoneHash) {
        acceptanceBilling(_phoneHash, _ref, _acceptanceTimestamp, createProduct(_phoneHash, _acceptanceTimestamp, _idOffer, _idProposal));
    }

    function topUp(address _phoneHash, uint _paidTimestamp) public onlyOwner activeCustomer(_phoneHash) {
        customers[_phoneHash].nbTopUp++;
        customers[_phoneHash].amount += proposals[products[customers[_phoneHash].history[customers[_phoneHash].history.length - 1].idProduct].idProposal].capital +
                                        proposals[products[customers[_phoneHash].history[customers[_phoneHash].history.length - 1].idProduct].idProposal].interest;
        addToScore(_phoneHash);
        topUpBilling(_phoneHash, _paidTimestamp);
    }

    function lowBalance(address _phoneHash, string memory _ref) public {
        lowBalanceOffering(_phoneHash, _ref, customers[_phoneHash].score);
    }

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