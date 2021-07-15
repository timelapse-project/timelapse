## `Timelapse`

Communicate with API(server/watcher) part and dApp





### `constructor()` (public)



Smart Contract constructor

### `addToScore(address _phoneHash)` (public)

Increase scoring information of a customer


This function is directly called when API receives a topUp for a customer (identified with `_phoneHash`) with a target other than Timelapse

### `acceptance(address _phoneHash, string _ref, uint256 _acceptanceTimestamp, uint256 _idOffer, uint256 _idProposal)` (public)

Accept the offer


Accept the offer `_idOffer` (By choosing proposal `_idProposal`) of a customer (identified with `_phoneHash`) with reference `_ref` at timestamp `_acceptanceTimestamp`

### `topUp(address _phoneHash, uint256 _paidTimestamp)` (public)

TopUp the last product of a customer


TopUp the last product of a customer (identified with `_phoneHash`) at timestamp `_paidTimestamp`

### `lowBalance(address _phoneHash, string _ref)` (public)

Manage the "low balances" received and generate an offer


Manage lowBalance (with reference `_ref`) of a customer (identified with `_phoneHash`)

### `process(struct Billing.Customer _customer) → uint8` (public)

Compute the score of a customer


Compute the score of a customer `_customer`


