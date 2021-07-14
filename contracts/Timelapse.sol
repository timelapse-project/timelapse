// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./Billing.sol";
import "./Offering.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Timelapse is Ownable, Billing, Offering {

    constructor() {}

    function addToScore(address _phoneHash) public onlyOwner activeCustomer(_phoneHash) {
        Customer memory customer = customers[_phoneHash];
        if(customer.firstTopUp == 0)
            customer.firstTopUp = block.timestamp;
        customer.nbTopUp++;
        changeScore(_phoneHash, process(customer));
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
        // mettre les calculs et la logique pour scorer correctement
        // 
        score = 3;
        return score;
    }
}