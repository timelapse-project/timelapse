## `Billing`

Manage all aspects related to billing (customers, accounting and billing management)




### `activeCustomer(address _phoneHash)`



Check that the customer is still active


### `constructor()` (public)



Smart Contract constructor

### `isActiveCustomer(address _phoneHash) → bool` (public)

Inform if the customer is active


This function informs if the customer (identified with `_phoneHash`) is active

### `changeScore(address _phoneHash, uint8 _score)` (public)

Change the score of a customer


This function informs if the customer (identified with `_phoneHash`) is active

### `topUpBilling(address _phoneHash, uint256 _paidTimestamp)` (public)

TopUp the last product of a customer


TopUp the last product of a customer (identified with `_phoneHash`) at timestamp `_paidTimestamp`

### `acceptanceBilling(address _phoneHash, string _ref, uint256 _acceptanceTimestamp, uint256 _idProduct)` (public)

Add an acceptance in the customer history


Add a customer product history (using reference `_ref`, product `_idProduct`, timestamp `_acceptanceTimestamp`) for a customer (identified with `_phoneHash`)


### `ScoreChange(address phoneHash, uint8 score)`



Triggered when score of a customer has changed

### `CustomerIsDeleted(address phoneHash)`



Triggered when a customer has been deleted

### `AcceptanceReceived(address phoneHash, string ref, uint256 acceptanceTimestamp, uint256 idProduct)`



Triggered when an Acceptance is received

### `Confirmation(address phoneHash, string ref, uint256 acceptanceTimestamp, uint256 idProduct)`



Triggered when confirmation has to be sent

### `TopUpReceived(address phoneHash, string ref)`



Triggered when a topUp is received

### `Acknowledge(address phoneHash, string ref)`



Triggered when an acknowledge has to be sent
