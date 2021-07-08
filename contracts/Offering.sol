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

    enum EligibilityReason {
        None,
        UnknowUser,
        LowUser,
        DoubleSpent,
        Other
    }

    struct Offer {
        address id;
        address phoneHash;
        uint256 timestamp;
        EligibilityReason reason;
        uint256[] proposals;
        OfferStatus status;
    }

    struct Product {
        address id;
        address phoneHash;
        uint256 timestamp;
        address offerId;
        address proposalId;
        uint256 topUpAmount;
        ProductStatus status;
    }

    struct Proposal {
        address id;
        uint8 minScoring;
        string description;
    }

    Offer[] public offers;
    Proposal[] public proposals;
    Product[] public products;

    mapping(address => uint256) public offerList;
    mapping(address => uint256) public proposalList;
    mapping(address => uint256) public productList;

    event ProposalAdded(address id, uint8 minScoring, string description);
    event LowBalanceReceived(address id, address phoneHash);

    event OfferSent(
        address id,
        address phoneHash,
        uint256 timestamp,
        EligibilityReason reason,
        uint256[] proposals,
        uint256 scoring
    );
    event AcceptanceReceived(
        address id,
        address phoneHash,
        address offerId,
        address proposalId
    );
    event ConfirmationSent(
        address id,
        address offerId,
        address phoneHash,
        uint256 timestamp
    );
    event TopUpReceived(
        address id,
        address phoneHash,
        address productId,
        uint256 amount
    );
    event AcknowledgeSent(
        address id,
        address phoneHash,
        address productId,
        uint256 amount
    );

    constructor() {
        // Init first (dummy) stake 0
        Proposal memory proposalData0;
        proposals.push(proposalData0);
    }

    function addProposal(
        address _id,
        uint8 _minScoring,
        string memory _description
    ) public {
        Proposal memory proposalData;
        proposalData.id = _id;
        proposalData.minScoring = _minScoring;
        proposalData.description = _description;
        proposals.push(proposalData);
        proposalList[proposalData.id] = (proposals.length - 1);
        emit ProposalAdded(
            proposalData.id,
            proposalData.minScoring,
            proposalData.description
        );
    }

    function updateProposal(
        address _id,
        uint8 _minScoring,
        string memory _description
    ) public {
        //TODO: manage update proposal
        proposals[proposalList[_id]].minScoring = _minScoring;
        proposals[proposalList[_id]].description = _description;
    }

    function deleteProposal(address _id) public {
        //TODO: manage delete proposal
    }

    function proposalsCount() public view returns (uint256) {
        return proposals.length;
    }

    function lowBalance(address _id, address _phoneHash) public {
        emit LowBalanceReceived(_id, _phoneHash);

        uint8 scoring;
        EligibilityReason eligibilityReason;
        (scoring, eligibilityReason) = eligibility(_phoneHash);

        //Register Offer
        Offer memory offerData;
        offerData.id = _id;
        offerData.phoneHash = _phoneHash;
        offerData.timestamp = block.timestamp;
        offerData.reason = eligibilityReason;
        offerData.status = OfferStatus.New;
        offerData.proposals = getOfferProposals(scoring);
        offers.push(offerData);
        offerList[offerData.id] = (offers.length - 1);

        emit OfferSent(
            offerData.id,
            offerData.phoneHash,
            offerData.timestamp,
            offerData.reason,
            offerData.proposals,
            scoring
        );
    }

    function acceptance(
        address _id,
        address _phoneHash,
        address _offerId,
        address _proposalId
    ) public {
        emit AcceptanceReceived(_id, _phoneHash, _offerId, _proposalId);
        offers[offerList[_offerId]].status = OfferStatus.Accepted;

        Product memory productData;
        productData.id = _id;
        productData.offerId = _offerId;
        productData.proposalId = _proposalId;
        productData.phoneHash = _phoneHash;
        productData.timestamp = block.timestamp;
        productData.status = ProductStatus.Active;
        products.push(productData);
        productList[productData.id] = (products.length - 1);

        emit ConfirmationSent(
            productData.id,
            productData.offerId,
            productData.phoneHash,
            productData.timestamp
        );
    }

    function topUp(
        address _id,
        address _phoneHash,
        address _productId,
        uint256 _amount
    ) public {
        emit TopUpReceived(_id, _phoneHash, _productId, _amount);

        products[productList[_productId]].status = ProductStatus.Closed;
        //TODO: Manage check topUpAmount
        products[productList[_productId]].topUpAmount = _amount;

        emit AcknowledgeSent(_id, _phoneHash, _productId, _amount);
    }

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
            if (_scoring >= proposals[i].minScoring) {
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
