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
contract Timelapse is Ownable, Offering {

    /**
     * @dev Customer Activity
     */
     Billing billing;

    /**
     * @dev Customer Activity
     */
    struct CustomerActivity {
        string log;
        uint256 timestamp;
        string status;
    }

    /**
     * @dev Smart Contract constructor
     */
    constructor(address _billingAddress) {
        billing = Billing(_billingAddress);
        //billing = new Billing();
    }

    /**
      * @notice Increase scoring information of a customer
      * @param _phoneHash The address that identifies to the customer
      * @dev This function is directly called when API receives a topUp for a customer (identified with `_phoneHash`) with a target other than Timelapse
      */
    function addToScore(address _phoneHash) public onlyOwner {
        billing.addToScore(_phoneHash);
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
    //function acceptance(address _phoneHash, string memory _ref, uint _acceptanceTimestamp, uint256 _idOffer, uint256 _idProposal) public activeCustomer(_phoneHash) {
    function acceptance(address _phoneHash, string memory _ref, uint _acceptanceTimestamp, uint256 _idOffer, uint256 _idProposal) public {
        billing.acceptanceBilling(_phoneHash, _ref, _acceptanceTimestamp, createProduct(_phoneHash, _acceptanceTimestamp, _idOffer, _idProposal));
    }

     /**
      * @notice TopUp the last product of a customer
      * @param _phoneHash The address that identifies to the customer
      * @param _paidTimestamp Timestamp of the acceptance
      * @dev TopUp the last product of a customer (identified with `_phoneHash`) at timestamp `_paidTimestamp`
      */
    //function topUp(address _phoneHash, uint _paidTimestamp) public onlyOwner activeCustomer(_phoneHash) {
    function topUp(address _phoneHash, uint _paidTimestamp) public onlyOwner {
        billing.customers(_phoneHash);
        billing.getCustomer(_phoneHash).nbTopUp++;

        (,,,,,uint256 lastAcceptanceID) = billing.customers(_phoneHash);
        (,,,,uint256 idProduct) = billing.histories(_phoneHash, lastAcceptanceID);
        billing.addToCustomerAmount(_phoneHash, proposals[products[idProduct].idProposal].capital+proposals[products[idProduct].idProposal].interest);

        billing.histories(_phoneHash,0);
        billing.customers(_phoneHash);

        billing.addToScore(_phoneHash);
        billing.topUpBilling(_phoneHash, _paidTimestamp);
    }

    /**
      * @notice Manage the "low balances" received and generate an offer
      * @param _phoneHash The address that identifies to the customer
      * @param _ref Reference of the telecom provider
      * @dev Manage lowBalance (with reference `_ref`) of a customer (identified with `_phoneHash`)
      */
    function lowBalance(address _phoneHash, string memory _ref) public {
        lowBalanceOffering(_phoneHash, _ref, billing.getScore(_phoneHash));
    }

    /**
      * @notice Get customer activities log
      * @param _phoneHash The address that identifies to the customer
      * @param _startTimestamp Start of the search timeframe
      * @param _endTimestamp End of the search timeframe
      * @return Score The computed customer score 
      * @dev Get activities log of a customer (identified with `_phoneHash`)
      */
    function getCustomerActivitiesLog(address _phoneHash, uint256 _startTimestamp, uint256 _endTimestamp) public view returns(CustomerActivity[] memory) {
         uint256 customerActivitiesSize = 0;
         uint256 customerActivitiesIndex = 0;

        for (uint8 i = 0; i < billing.getHistorySize(_phoneHash); i++) {
            (,uint256 acceptanceTimestamp, uint256 paidTimestamp,,uint256 idProduct) = billing.histories(_phoneHash, i);
            
            if(offers[products[idProduct].idOffer].timestamp >= _startTimestamp && offers[products[idProduct].idOffer].timestamp <= _endTimestamp) {
                customerActivitiesSize++;
            }
            if(acceptanceTimestamp >= _startTimestamp && acceptanceTimestamp <= _endTimestamp) {
                customerActivitiesSize++;
            }
            if(paidTimestamp >= _startTimestamp && paidTimestamp <= _endTimestamp) {
                customerActivitiesSize++;
            }
        }
        CustomerActivity[] memory customerActivities = new CustomerActivity[](customerActivitiesSize);
        for (uint256 i = 0; i < billing.getHistorySize(_phoneHash); i++) {
            (,uint256 acceptanceTimestamp, uint256 paidTimestamp,,uint256 idProduct) = billing.histories(_phoneHash, i);
            if(offers[products[idProduct].idOffer].timestamp >= _startTimestamp && offers[products[idProduct].idOffer].timestamp <= _endTimestamp) {
                customerActivities[customerActivitiesIndex].log = "Offer: ";
                for (uint256 j = 0; j < offers[products[idProduct].idOffer].proposals.length; j++){
                    if(j == 0) { 
                        customerActivities[customerActivitiesIndex].log = string(abi.encodePacked(customerActivities[customerActivitiesIndex].log, proposals[offers[products[idProduct].idOffer].proposals[j]].description));
                    } else {
                        customerActivities[customerActivitiesIndex].log = string(abi.encodePacked(customerActivities[customerActivitiesIndex].log, " / ", proposals[offers[products[idProduct].idOffer].proposals[j]].description));
                    }
                }

                customerActivities[customerActivitiesIndex].timestamp = offers[products[idProduct].idOffer].timestamp;
                customerActivities[customerActivitiesIndex].status = "Offer";
                customerActivitiesIndex++;
            }

            if(acceptanceTimestamp >= _startTimestamp && acceptanceTimestamp <= _endTimestamp) {
                customerActivities[customerActivitiesIndex].log = string(abi.encodePacked("Accepted: ", proposals[products[idProduct].idProposal].description));
                customerActivities[customerActivitiesIndex].timestamp = acceptanceTimestamp;
                customerActivities[customerActivitiesIndex].status = "Accepted";
                customerActivitiesIndex++;
            }

            if(paidTimestamp >= _startTimestamp && paidTimestamp <= _endTimestamp) {
                customerActivities[customerActivitiesIndex].log = "Topup";
                customerActivities[customerActivitiesIndex].timestamp = paidTimestamp;
                customerActivities[customerActivitiesIndex].status = "Closed";
                customerActivitiesIndex++;
            }
        }
        return customerActivities;
    }
}