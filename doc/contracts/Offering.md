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

### `addProposal(uint8 _minScoring, uint256 _capital, uint256 _interest, string _description)` (public)

Add a proposal


Add a proposal with the following information: minimum scoring `_minScoring`, amount `_capital` + `_interest`, description `_description`

### `closedProposal(uint256 _id)` (public)

Close a proposal


Close the proposal with the ID `_id`

### `proposalsCount() → uint256` (public)

Number of proposals


Return the number of proposals

### `lowBalanceOffering(address _phoneHash, string _ref, uint8 _score)` (public)

Manage the "low balances" received and generate an offer


Manage lowBalance (with reference `_ref`) of a customer (identified with `_phoneHash`) and generate an offer based on the score `_score`

### `createProduct(address _phoneHash, uint256 _acceptanceTimestamp, uint256 _idOffer, uint256 _idProposal) → uint256` (public)

Create a product


Create a product with the following information: a customer (identified with `_phoneHash`), an offer ID `_idOffer`, a proposal ID `_idProposal` and a timestamp `_acceptanceTimestamp`

### `getOfferProposals(uint8 _scoring) → uint256[]` (public)

Get the proposals corresponding to the scoring


Return the proposals that correspond to the given scoring `_scoring`

### `trimOfferProposals(uint256[] _offerProposals, uint8 _offerProposalsCount) → uint256[]` (public)

Create a trimmed table of the proposals


Return a proposals based on table `_offerProposals` with only the first `_offerProposalsCount` proposals


### `ProposalAdded(uint256 idProposal, uint8 minScoring, uint256 capital, uint256 interest, string description)`



Triggered when a proposal is added

### `ClosedProposal(uint256 idProposal)`



Triggered when a proposal is closed

### `ProductCreated(address phoneHash, uint256 timestamp, uint256 idOffer, uint256 idProposal)`



Triggered when a product is created

### `LowBalanceReceived(address phoneHash, string ref)`



Triggered when a lowBalance is received

### `OfferSent(uint256 idOffer, address phoneHash, uint256 timestamp, enum Offering.EligibilityReason reason, uint256[] proposals, uint256 scoring, string ref)`



Triggered when an offer has to be sent

### `AcceptanceReceived(address phoneHash, uint256 idOffer, uint256 idProposal)`



Triggered when an acceptance is received

### `ConfirmationSent(uint256 productId, uint256 idOffer, address phoneHash, uint256 timestamp)`



Triggered when a confirmation has to be sent

### `TopUpReceived(address phoneHash, uint256 productId, uint256 amount)`



Triggered when a topUp is received

### `AcknowledgeSent(address phoneHash, uint256 productId, uint256 amount)`



Triggered when an acknowledge has to be sent

