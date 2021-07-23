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
contract Timelapse is Ownable {

    /**
      * @dev Customer Billing Activity
      */
    Billing public billing;

    /**
      * @dev Customer Offering Activity
      */
    Offering offering;

    /**
     * @dev Customer Activity
     */
    struct CustomerActivity {
        string log;
        uint256 timestamp;
        string status;
    }

    /**
     * @dev Invoice information
     */
    struct Invoice {
        uint256 totalCapital;
        uint256 totalInterest;
    }

    /**
     * @dev Reporting information
     */
    struct Reporting {
        uint256 offersCount;
        uint256 acceptedOffersCount;
        uint256 totalCapitalLoans;
        uint256 totalInterestLoans;
        uint256 closedTopupsCount;
        uint256 totalCapitalGain;
        uint256 totalInterestGain;
        uint256 acceptanceTimestamp;
        uint256 paidTimestamp;
    }

    /**
     * @dev Smart Contract constructor
     */
    constructor(address _billingAddress, address _offeringAddress) {
        billing = Billing(_billingAddress);
        offering = Offering(_offeringAddress);
    }

    /**
      * @notice Add a proposal
      * @param _minScoring The minimum score needed by customer to receive this proposal
      * @param _capital Capital part of the proposal amount
      * @param _interest Interest part of the proposal amount
      * @param _description A description of the proposal
      * @dev Add a proposal with the following information: minimum scoring `_minScoring`, amount `_capital` + `_interest`, description `_description`
      */
    function addProposal(
        uint8 _minScoring,
        uint256 _capital,
        uint256 _interest,
        string memory _description
    ) public onlyOwner {
        offering.addProposal(_minScoring, _capital, _interest, _description);
    }

    /**
      * @notice Close a proposal
      * @param _id ID of the proposal to close
      * @dev Close the proposal with the ID `_id`
      */
    function closedProposal(uint256 _id) public onlyOwner {
        offering.closedProposal(_id);
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
        billing.acceptanceBilling(_phoneHash, _ref, _acceptanceTimestamp, offering.createProduct(_phoneHash, _acceptanceTimestamp, _idOffer, _idProposal));
    }

     /**
      * @notice TopUp the last product of a customer
      * @param _phoneHash The address that identifies to the customer
      * @param _paidTimestamp Timestamp of the acceptance
      * @dev TopUp the last product of a customer (identified with `_phoneHash`) at timestamp `_paidTimestamp`
      */
    //function topUp(address _phoneHash, uint _paidTimestamp) public onlyOwner activeCustomer(_phoneHash) {
    function topUp(address _phoneHash, uint _paidTimestamp) public onlyOwner {
        (,,,,uint256 idProduct) = billing.histories(billing.getCustomer(_phoneHash).lastAcceptanceID);
        (,,,uint256 idProposal,) = offering.products(idProduct);
        (,uint256 capital,uint256 interest,,,) = offering.proposals(idProposal);
        billing.addToCustomerAmount(_phoneHash, capital + interest);

        billing.addToScore(_phoneHash);
        billing.topUpBilling(_phoneHash, _paidTimestamp);
    }

    /**
      * @notice Manage the "low balances" received and generate an offer
      * @param _phoneHash The address that identifies to the customer
      * @param _ref Reference of the telecom provider
      * @dev Manage lowBalance (with reference `_ref`) of a customer (identified with `_phoneHash`)
      */
    function lowBalance(address _phoneHash, string memory _ref) public onlyOwner {
        offering.lowBalanceOffering(_phoneHash, _ref, billing.getScore(_phoneHash));
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
         uint256 customerActivitiesSize;
         uint256 customerActivitiesIndex;

        for (uint8 i = 0; i < offering.getOfferSize(_phoneHash); i++) {
            uint256 offeringIndex = offering.offerList(_phoneHash, i);
            (,uint256 timestamp,,,) = offering.offers(offeringIndex);   
            if(timestamp >= _startTimestamp && timestamp <= _endTimestamp) {
                customerActivitiesSize++;
            }
        }
        for (uint8 i = 0; i < billing.getHistorySize(_phoneHash); i++) {
            uint256 historyIndex = billing.historyList(_phoneHash, i);
            (,uint256 acceptanceTimestamp, uint256 paidTimestamp,,) = billing.histories(historyIndex);
            if(acceptanceTimestamp >= _startTimestamp && acceptanceTimestamp <= _endTimestamp) {
                customerActivitiesSize++;
            }
            if(paidTimestamp >= _startTimestamp && paidTimestamp <= _endTimestamp) {
                customerActivitiesSize++;
            }
        }
        CustomerActivity[] memory customerActivities = new CustomerActivity[](customerActivitiesSize);
        for (uint8 i = 0; i < offering.getOfferSize(_phoneHash); i++) {
            uint256 offeringIndex = offering.offerList(_phoneHash, i);
            (,uint256 timestamp,,,) = offering.offers(offeringIndex);
            if(timestamp >= _startTimestamp && timestamp <= _endTimestamp) {
                customerActivities[customerActivitiesIndex].log = "Offer: ";
                uint256 numberProposal = offering.getSizeProposalOffer(offeringIndex);
                for (uint256 j = 0; j < numberProposal; j++) {
                    (,,,,string memory description,) = offering.proposals(offering.getIndexProposalOffer(offeringIndex, j));
                    if(j == 0) { 
                        customerActivities[customerActivitiesIndex].log = string(abi.encodePacked(customerActivities[customerActivitiesIndex].log, description));
                    } else {
                        customerActivities[customerActivitiesIndex].log = string(abi.encodePacked(customerActivities[customerActivitiesIndex].log, " / ", description));
                    }
                }

                customerActivities[customerActivitiesIndex].timestamp = timestamp;
                customerActivities[customerActivitiesIndex].status = "Offer";
                customerActivitiesIndex++;
            }
        }
        for (uint256 i = 0; i < billing.getHistorySize(_phoneHash); i++) {
            uint256 historyIndex = billing.historyList(_phoneHash, i);
            (,uint256 acceptanceTimestamp, uint256 paidTimestamp,,uint256 idProduct) = billing.histories(historyIndex);
            (,,,uint256 idProposal,) = offering.products(idProduct);
            (,,,,string memory descriptionProposal,) = offering.proposals(idProposal);

            if(acceptanceTimestamp >= _startTimestamp && acceptanceTimestamp <= _endTimestamp) {
                customerActivities[customerActivitiesIndex].log = string(abi.encodePacked("Accepted: ", descriptionProposal));
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

    /**
      * @notice Generate invoicing for a given period
      * @param _startTimestamp Start of the invoicing period
      * @param _endTimestamp End of the invoicing period
      * @return The invoice 
      * @dev Generate invoicing for a given period (between _startTimestamp and _endTimestamp)
      */
    function generateInvoicing(uint256 _startTimestamp, uint256 _endTimestamp) public view returns(Invoice[] memory) {
        uint256 invoiceSize;
        uint256 invoiceIndex;
        bool outOfInvoicingWindow;
        // In POC context, we will only use 1 global invoice. In the next phases, splitted invoice could be returned for a given period
        invoiceSize = 1;
        Invoice[] memory invoice = new Invoice[](invoiceSize);

        for (uint256 i = billing.getHistoriesSize(); i > 0 && !(outOfInvoicingWindow); i--) {
            (,, uint256 paidTimestamp, Billing.HistoryStatus status, uint256 idProduct) = billing.histories(i-1);
            
            if(paidTimestamp < _startTimestamp){
                outOfInvoicingWindow = true;
            }
            if(paidTimestamp >= _startTimestamp && paidTimestamp <= _endTimestamp && status == Billing.HistoryStatus.Closed){
                (,,,uint256 idProposal,) = offering.products(idProduct);
                (,uint256 capital,uint256 interest,,,) = offering.proposals(idProposal);
                invoice[invoiceIndex].totalCapital += capital;
                invoice[invoiceIndex].totalInterest += interest;
            }
        }

        return invoice;
    }

    /**
      * @notice Generate reporting for a given period
      * @param _startTimestamp Start of the reporting period
      * @param _endTimestamp End of the reporting period
      * @return The reporting 
      * @dev Generate reporting for a given period (between _startTimestamp and _endTimestamp)
      */
    function generateReporting(uint256 _startTimestamp, uint256 _endTimestamp) public view returns(Reporting[] memory) {
        uint256 reportingSize;
        uint256 reportingIndex;
        bool outOfReportingWindow1;
        bool outOfReportingWindow2;
        bool outOfReportingWindow3;
        // In POC context, we will only use 1 global reporting. In the next phases, splitted reporting could be returned for a given period
        reportingSize = 1;
        Reporting[] memory reporting = new Reporting[](reportingSize);

        for (uint256 i = offering.getOffersSize(); i > 0 && !(outOfReportingWindow1); i--) {
            (,uint timestamp,,Offering.OfferStatus status,) = offering.offers(i-1);
            if(timestamp < _startTimestamp){
                outOfReportingWindow1 = true;
            }
            if(timestamp >= _startTimestamp && timestamp <= _endTimestamp){
                reporting[reportingIndex].offersCount += 1;
                if(status == Offering.OfferStatus.Accepted){
                    reporting[reportingIndex].acceptedOffersCount += 1;
                }
            }
        }

        for (uint256 i = billing.getHistoriesSize(); i > 0 && (!(outOfReportingWindow2) || !(outOfReportingWindow3)); i--) {
            (,uint256 acceptanceTimestamp, uint256 paidTimestamp, Billing.HistoryStatus status, uint256 idProduct) = billing.histories(i-1);

            reporting[reportingIndex].acceptanceTimestamp = acceptanceTimestamp;
            reporting[reportingIndex].paidTimestamp = paidTimestamp;

            if(acceptanceTimestamp < _startTimestamp){
                outOfReportingWindow2 = true;
            } else {
                if(acceptanceTimestamp >= _startTimestamp && acceptanceTimestamp <= _endTimestamp && status == Billing.HistoryStatus.Active){
                    (,,,uint256 idProposal,) = offering.products(idProduct);
                    (,uint256 capital,uint256 interest,,,) = offering.proposals(idProposal);
                    reporting[reportingIndex].totalCapitalLoans += capital;
                    reporting[reportingIndex].totalInterestLoans += interest;
                }
            }
            if(paidTimestamp < _startTimestamp){
                outOfReportingWindow3 = true;
            } else {
                if(paidTimestamp >= _startTimestamp && paidTimestamp <= _endTimestamp && status == Billing.HistoryStatus.Closed){
                    (,,,uint256 idProposal,) = offering.products(idProduct);
                    (,uint256 capital,uint256 interest,,,) = offering.proposals(idProposal);
                    reporting[reportingIndex].closedTopupsCount += 1;
                    reporting[reportingIndex].totalCapitalGain += capital;
                    reporting[reportingIndex].totalInterestGain += interest;
                }
            }
        }

        return reporting;
    }
}