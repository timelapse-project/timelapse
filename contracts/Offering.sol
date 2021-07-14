// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Offering is Ownable {
    uint256 private nonce = 0;

    enum OfferStatus {
        New,
        Accepted
    }

    enum ProductStatus {
        Active,
        Closed
    }

    enum ProposalStatus {
        Active,
        Closed
    }

    enum EligibilityReason {
        None,
        UnknowUser,
        LowUser,
        DoubleSpent,
        Other
    }

    struct Offer {
        address phoneHash;
        uint256 timestamp;
        EligibilityReason reason;
        uint256[] proposals;
        OfferStatus status;
        string ref;
    }

    struct Product {
        address phoneHash;
        uint256 timestamp;
        uint256 idOffer;
        uint256 idProposal;
        ProductStatus status;
    }

    struct Proposal {
        uint8 minScoring;
        uint256 capital;
        uint256 interest;
        uint256 validityPeriod;
        string description;
        ProposalStatus status;
    }

    Offer[] public offers;
    Proposal[] public proposals;
    Product[] public products;

    event ProposalAdded(
        uint256 idProposal,
        uint8 minScoring,
        uint256 capital,
        uint256 interest,
        string description
    );
    event LowBalanceReceived(address phoneHash, string ref);

    event OfferSent(
        uint256 idOffer,
        address phoneHash,
        uint256 timestamp,
        EligibilityReason reason,
        uint256[] proposals,
        uint256 scoring,
        string ref
    );

    event AcceptanceReceived(
        address phoneHash,
        uint256 idOffer,
        uint256 idProposal
    );

    event ConfirmationSent(
        uint256 productId,
        uint256 idOffer,
        address phoneHash,
        uint256 timestamp
    );
    
    event TopUpReceived(address phoneHash, uint256 productId, uint256 amount);
    event AcknowledgeSent(address phoneHash, uint256 productId, uint256 amount);

    modifier existProposal(uint256 id) {
        require(id < proposals.length, "Proposal doesn't exist");
        _;
    }

    modifier existOffer(uint256 id) {
        require(id < offers.length, "Offer doesn't exist");
        _;
    }

    modifier existProduct(uint256 id) {
        require(id < products.length, "Product doesn't exist");
        _;
    }

    constructor() {}

    //Proposal
    function addProposal(
        uint8 _minScoring,
        uint256 _capital,
        uint256 _interest,
        string memory _description
    ) public onlyOwner {
        Proposal memory proposalData;

        proposalData.minScoring = _minScoring;
        proposalData.capital = _capital;
        proposalData.interest = _interest;
        proposalData.description = _description;
        proposalData.status = ProposalStatus.Active;
        proposals.push(proposalData);

        emit ProposalAdded(
            (proposals.length - 1),
            proposalData.minScoring,
            proposalData.capital,
            proposalData.interest,
            proposalData.description
        );
    }

    function closedProposal(uint256 _id) public onlyOwner existProposal(_id) {
        proposals[_id].status = ProposalStatus.Closed;
    }

    function proposalsCount() public view returns (uint256) {
        return proposals.length;
    }

    //Offer

    //Product

    function createProduct(address _phoneHash, uint _acceptanceTimestamp, uint256 _idOffer, uint256 _idProposal) public onlyOwner returns(uint256) {
        Product memory product = Product(_phoneHash, _acceptanceTimestamp, _idOffer, _idProposal, ProductStatus.Active);
        products.push(product);
        return (products.length - 1);
    }

    //Function

    function lowBalanceOffering(address _phoneHash, string memory _ref, uint8 _score) public {
        emit LowBalanceReceived(_phoneHash, _ref);

        //Register Offer
        Offer memory offerData;
        offerData.phoneHash = _phoneHash;
        offerData.timestamp = block.timestamp;
        offerData.status = OfferStatus.New;
        offerData.proposals = getOfferProposals(_score);
        offerData.ref = _ref;
        offers.push(offerData);

        emit OfferSent(
            (offers.length - 1),
            offerData.phoneHash,
            offerData.timestamp,
            offerData.reason,
            offerData.proposals,
            _score,
            _ref
        );
    }

/*
    function eligibility(address _phoneHash)
        public
        pure
        returns (uint8, EligibilityReason)
    {
        //TODO: Manage eligibility (scoring)
        if (_phoneHash == 0x718CEA3706787aa03Bd936b76303fA00660C5f42) {
            return (3, EligibilityReason.None);
        } else if (_phoneHash == 0x3ad53d26D15A658A84Fe8cA9FFc8aA3a7240C1a0) {
            return (6, EligibilityReason.None);
        } else {
            return (0, EligibilityReason.DoubleSpent);
        }
    }
*/
    function getOfferProposals(uint8 _scoring)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] memory offerProposals = new uint256[](3);
        uint256 offerProposalsIndex = 0;

        if (_scoring == 0) {
            return offerProposals;
        }
        for (
            uint256 i = 1;
            (i < proposals.length && offerProposalsIndex < 3);
            i++
        ) {
            if (
                proposals[i].status == ProposalStatus.Active &&
                _scoring >= proposals[i].minScoring
            ) {
                offerProposals[offerProposalsIndex] = i;
                offerProposalsIndex++;
            }
        }
        return offerProposals;
    }

    function getUniqueId() public returns (address) {
        nonce++;
        return
            address(
                bytes20(
                    keccak256(
                        abi.encodePacked(block.timestamp, msg.sender, nonce)
                    )
                )
            );
    }
}
