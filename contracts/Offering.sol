// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title This Smart Contract is responsible to generate the offers for customers.
 * @notice Manage all aspects related to offering (proposals, customers and products management)
 * @author Keeymon, DavidRochus
 */
contract Offering is Ownable {
    /**
     * @dev Offer status
     */
    enum OfferStatus {
        New,
        Accepted
    }

    /**
     * @dev Product status
     */
    enum ProductStatus {
        Active,
        Closed
    }

    /**
     * @dev Proposal status
     */
    enum ProposalStatus {
        Active,
        Closed
    }

    /**
     * @dev Eligibility reasons
     */
    enum EligibilityReason {
        None,
        UnknowUser,
        LowUser,
        DoubleSpent,
        Other
    }

    /**
     * @dev Offer information
     */
    struct Offer {
        address phoneHash;
        uint256 timestamp;
        EligibilityReason reason;
        uint256[] proposals;
        OfferStatus status;
        string ref;
    }

    /**
     * @dev Product information
     */
    struct Product {
        address phoneHash;
        uint256 timestamp;
        uint256 offerId;
        uint256 proposalId;
        ProductStatus status;
    }

    /**
     * @dev Proposal information
     */
    struct Proposal {
        uint8 minScoring;
        uint256 capital;
        uint256 interest;
        uint256 validityPeriod;
        string description;
        ProposalStatus status;
    }

    /**
     * @dev Offers table
     */
    Offer[] public offers;

    /**
     * @dev Mapping to access offers related to a phoneHash
     */
    mapping(address => uint256[]) public offerList;

    /**
     * @dev Proposals table
     */
    Proposal[] public proposals;

    /**
     * @dev Products table
     */
    Product[] public products;

    /**
     * @dev Triggered when a proposal is added
     */
    event ProposalAdded(
        uint256 proposalId,
        uint8 minScoring,
        uint256 capital,
        uint256 interest,
        string description
    );
    /**
     * @dev Triggered when a proposal is closed
     */
    event ClosedProposal(uint256 proposalId);

    /**
     * @dev Triggered when a product is created
     */
    event ProductCreated(
        address phoneHash,
        uint256 timestamp,
        uint256 offerId,
        uint256 proposalId
    );

    /**
     * @dev Triggered when a lowBalance is received
     */
    event LowBalanceReceived(address phoneHash, string ref);

    /**
     * @dev Triggered when an offer has to be sent
     */
    event OfferSent(
        uint256 offerId,
        address phoneHash,
        uint256 timestamp,
        EligibilityReason reason,
        uint256[] proposals,
        uint256 scoring,
        string ref
    );

    /**
     * @dev Triggered when an acceptance is received
     */
    event AcceptanceReceived(
        address phoneHash,
        uint256 offerId,
        uint256 proposalId
    );
    /**
     * @dev Triggered when a confirmation has to be sent
     */
    event ConfirmationSent(
        uint256 productId,
        uint256 offerId,
        address phoneHash,
        uint256 timestamp
    );

    /**
     * @dev Triggered when a topUp is received
     */
    event TopUpReceived(address phoneHash, uint256 productId, uint256 amount);

    /**
     * @dev Triggered when an acknowledge has to be sent
     */
    event AcknowledgeSent(address phoneHash, uint256 productId, uint256 amount);

    /**
     * @dev Check if proposal exists
     */
    modifier existProposal(uint256 id) {
        require(id < proposals.length, "Proposal doesn't exist");
        _;
    }

    /**
     * @dev Check if offer exists
     */
    modifier existOffer(uint256 id) {
        require(id < offers.length, "Offer doesn't exist");
        _;
    }
    /**
     * @dev Check if product exists
     */
    modifier existProduct(uint256 id) {
        require(id < products.length, "Product doesn't exist");
        _;
    }

    /**
     * @dev Smart Contract constructor
     */
    constructor() {}

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
    ) external onlyOwner {
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

    /**
     * @notice Close a proposal
     * @param _id ID of the proposal to close
     * @dev Close the proposal with the ID `_id`
     */
    function closeProposal(uint256 _id) external onlyOwner existProposal(_id) {
        proposals[_id].status = ProposalStatus.Closed;
        emit ClosedProposal(_id);
    }

    /**
     * @notice Number of proposals
     * @dev Return the number of proposals
     */
    function proposalsCount() external view returns (uint256) {
        return proposals.length;
    }

    /**
     * @notice Number of proposal in an offer
     * @param _offerId The ID of the offer
     * @dev Return the number of proposal in an offer
     */
    function getProposalOfferSize(uint256 _offerId)
        external
        view
        existOffer(_offerId)
        returns (uint256)
    {
        return offers[_offerId].proposals.length;
    }

    /**
     * @notice Get the size of the Offers of a customer
     * @param _phoneHash The address that identifies to the customer
     * @dev Get the size of the Offers of a customer (identified with `_phoneHash`)
     */
    function getOfferSize(address _phoneHash) external view returns (uint256) {
        return offerList[_phoneHash].length;
    }

    /**
     * @notice Get the size of all the offers
     * @dev Get the size of all the offers
     */
    function getOffersSize() external view returns (uint256) {
        return offers.length;
    }

    /**
     * @notice Get the ID proposal in offer
     * @param _offerId The ID of the offer
     * @param _id The ID of the array proposal in an offer
     * @dev Return the ID proposal in offer
     */
    function getIndexProposalOffer(uint256 _offerId, uint256 _id)
        external
        view
        existOffer(_offerId)
        returns (uint256)
    {
        require(_id < offers[_offerId].proposals.length, "Invalid index");
        return offers[_offerId].proposals[_id];
    }

    /**
     * @notice Manage the "low balances" received and generate an offer
     * @param _phoneHash The address that identifies to the customer
     * @param _ref Reference of the telecom provider
     * @param _score score of the customer
     * @dev Manage lowBalance (with reference `_ref`) of a customer (identified with `_phoneHash`) and generate an offer based on the score `_score`
     */
    function lowBalanceOffering(
        address _phoneHash,
        string memory _ref,
        uint8 _score
    ) external onlyOwner {
        emit LowBalanceReceived(_phoneHash, _ref);
        Offer memory offerData;
        offerData.phoneHash = _phoneHash;
        offerData.timestamp = block.timestamp;
        offerData.status = OfferStatus.New;
        offerData.proposals = getOfferProposals(_score);
        offerData.ref = _ref;
        offers.push(offerData);
        offerList[_phoneHash].push(offers.length - 1);
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

    /**
     * @notice Create a product
     * @param _phoneHash The address that identifies to the customer
     * @param _acceptanceTimestamp Timestamp of the acceptance
     * @param _offerId ID of the offer
     * @param _proposalId ID of the proposal
     * @dev Create a product with the following information: a customer (identified with `_phoneHash`), an offer ID `_offerId`, a proposal ID `_proposalId` and a timestamp `_acceptanceTimestamp`
     */
    function createProduct(
        address _phoneHash,
        uint256 _acceptanceTimestamp,
        uint256 _offerId,
        uint256 _proposalId
    )
        external
        onlyOwner
        existProposal(_proposalId)
        existOffer(_offerId)
        returns (uint256)
    {
        offers[_offerId].status = OfferStatus.Accepted;
        Product memory product = Product(
            _phoneHash,
            _acceptanceTimestamp,
            _offerId,
            _proposalId,
            ProductStatus.Active
        );
        products.push(product);
        emit ProductCreated(
            _phoneHash,
            _acceptanceTimestamp,
            _offerId,
            _proposalId
        );
        return (products.length - 1);
    }

    /**
     * @notice Get the proposals corresponding to the scoring
     * @param _scoring score of the customer
     * @return Proposals
     * @dev Return the proposals that correspond to the given scoring `_scoring`
     */
    function getOfferProposals(uint8 _scoring)
        public
        view
        returns (uint256[] memory)
    {
        uint8 offerProposalsIndex = 0;
        uint8 offerProposalsSize = 0;
        if (_scoring == 0) {
            return (new uint256[](0));
        }
        for (
            uint8 i = 0;
            (i < proposals.length && offerProposalsSize < 3);
            i++
        ) {
            if (
                proposals[i].status == ProposalStatus.Active &&
                _scoring >= proposals[i].minScoring
            ) {
                offerProposalsSize++;
            }
        }
        uint256[] memory offerProposals = new uint256[](offerProposalsSize);
        for (
            uint8 i = 0;
            (i < proposals.length && offerProposalsIndex < offerProposalsSize);
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
}
