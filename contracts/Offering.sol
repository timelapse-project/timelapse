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
        uint256 offerId;
        uint256 proposalId;
        uint256 topUpAmount;
        ProductStatus status;
    }

    struct Proposal {
        uint8 minScoring;
        string description;
        ProposalStatus status;
    }

    Offer[] public offers;
    Proposal[] public proposals;
    Product[] public products;

    event ProposalAdded(uint256 id, uint8 minScoring, string description);
    event LowBalanceReceived(address phoneHash, string ref);

    event OfferSent(
        uint256 id,
        address phoneHash,
        uint256 timestamp,
        EligibilityReason reason,
        uint256[] proposals,
        uint256 scoring,
        string ref
    );
    event AcceptanceReceived(
        address phoneHash,
        uint256 offerId,
        uint256 proposalId
    );
    event ConfirmationSent(
        uint256 id,
        uint256 offerId,
        address phoneHash,
        uint256 timestamp
    );
    event TopUpReceived(
        address phoneHash,
        uint256 productId,
        uint256 amount
    );
    event AcknowledgeSent(
        address phoneHash,
        uint256 productId,
        uint256 amount
    );

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

    function addProposal(
        uint8 _minScoring,
        string memory _description
    ) public onlyOwner {
        Proposal memory proposalData;

        proposalData.minScoring = _minScoring;
        proposalData.description = _description;
        proposalData.status = ProposalStatus.Active;
        proposals.push(proposalData);

        emit ProposalAdded(
            (proposals.length - 1),
            proposalData.minScoring,
            proposalData.description
        );
    }

    function closedProposal(uint256 _id) public onlyOwner existProposal(_id) {
        proposals[_id].status = ProposalStatus.Closed;
    }

    function proposalsCount() public view returns (uint256) {
        return proposals.length;
    }

    function lowBalance(address _phoneHash, string memory ref) public {
        emit LowBalanceReceived(_phoneHash, _ref);

        uint8 scoring;
        EligibilityReason eligibilityReason;
        (scoring, eligibilityReason) = eligibility(_phoneHash);

        //Register Offer
        Offer memory offerData;
        offerData.phoneHash = _phoneHash;
        offerData.timestamp = block.timestamp;
        offerData.reason = eligibilityReason;
        offerData.status = OfferStatus.New;
        offerData.proposals = getOfferProposals(scoring);
        offerData.ref = _ref;
        offers.push(offerData);

        emit OfferSent(
            (offers.length - 1),
            offerData.phoneHash,
            offerData.timestamp,
            offerData.reason,
            offerData.proposals,
            scoring,
            _ref
        );
    }

    function acceptance(
        address _phoneHash,
        uint256 _offerId,
        uint256 _proposalId
    ) public {
        emit AcceptanceReceived(_phoneHash, _offerId, _proposalId);
        offers[_offerId].status = OfferStatus.Accepted;

        Product memory productData;
        productData.offerId = _offerId;
        productData.proposalId = _proposalId;
        productData.phoneHash = _phoneHash;
        productData.timestamp = block.timestamp;
        productData.status = ProductStatus.Active;
        products.push(productData);

        emit ConfirmationSent(
            (products.length - 1),
            productData.offerId,
            productData.phoneHash,
            productData.timestamp
        );
    }

    function topUp(
        address _phoneHash,
        uint256 _productId,
        uint256 _amount
    ) public {
        emit TopUpReceived(_phoneHash, _productId, _amount);

        products[_productId].status = ProductStatus.Closed;
        //TODO: Manage check topUpAmount
        products[_productId].topUpAmount = _amount;

        emit AcknowledgeSent(_phoneHash, _productId, _amount);
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
            if (proposals[i].status == ProposalStatus.Active && _scoring >= proposals[i].minScoring) {
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
