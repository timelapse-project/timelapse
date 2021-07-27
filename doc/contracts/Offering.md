## `Offering`

Manage all aspects related to offering (proposals, customers and products management)




### `existProposal(uint256 id)`



Check if proposal exists

### `existOffer(uint256 id)`



Check if offer exists

### `existProduct(uint256 id)`



Check if product exists


### `constructor()` (public)



Smart Contract constructor

### `addProposal(uint8 _minScoring, uint256 _capital, uint256 _interest, string _description)` (external)

Add a proposal


Add a proposal with the following information: minimum scoring `_minScoring`, amount `_capital` + `_interest`, description `_description`

### `closeProposal(uint256 _id)` (external)

Close a proposal


Close the proposal with the ID `_id`

### `proposalsCount() → uint256` (external)

Number of proposals


Return the number of proposals

### `getProposalOfferSize(uint256 _offerId) → uint256` (external)

Number of proposal in an offer


Return the number of proposal in an offer

### `getOfferSize(address _phoneHash) → uint256` (external)

Get the size of the Offers of a customer


Get the size of the Offers of a customer (identified with `_phoneHash`)

### `getOffersSize() → uint256` (external)

Get the size of all the offers


Get the size of all the offers

### `getIndexProposalOffer(uint256 _offerId, uint256 _id) → uint256` (external)

Get the ID proposal in offer


Return the ID proposal in offer

### `lowBalanceOffering(address _phoneHash, string _ref, uint8 _score)` (external)

Manage the "low balances" received and generate an offer


Manage lowBalance (with reference `_ref`) of a customer (identified with `_phoneHash`) and generate an offer based on the score `_score`

### `createProduct(address _phoneHash, uint256 _acceptanceTimestamp, uint256 _offerId, uint256 _proposalId) → uint256` (external)

Create a product


Create a product with the following information: a customer (identified with `_phoneHash`), an offer ID `_offerId`, a proposal ID `_proposalId` and a timestamp `_acceptanceTimestamp`

### `getOfferProposals(uint8 _scoring) → uint256[]` (public)

Get the proposals corresponding to the scoring


Return the proposals that correspond to the given scoring `_scoring`


### `ProposalAdded(uint256 proposalId, uint8 minScoring, uint256 capital, uint256 interest, string description)`



Triggered when a proposal is added

### `ProposalClosed(uint256 proposalId)`



Triggered when a proposal is closed

### `ProductCreated(address phoneHash, uint256 timestamp, uint256 offerId, uint256 proposalId)`



Triggered when a product is created

### `LowBalanceReceived(address phoneHash, string ref)`



Triggered when a lowBalance is received

### `OfferSent(uint256 offerId, address phoneHash, uint256 timestamp, enum Offering.EligibilityReason reason, uint256[] proposals, uint256 scoring, string ref)`



Triggered when an offer has to be sent

