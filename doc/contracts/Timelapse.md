## `Timelapse`

Communicate with API(server/watcher) part and dApp





### `constructor(address _billingAddress, address _offeringAddress)` (public)



Smart Contract constructor

### `addProposal(uint8 _minScoring, uint256 _capital, uint256 _interest, string _description)` (public)

Add a proposal


Add a proposal with the following information: minimum scoring `_minScoring`, amount `_capital` + `_interest`, description `_description`

### `closeProposal(uint256 _id)` (public)

Close a proposal


Close the proposal with the ID `_id`

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

### `getCustomerActivitiesLog(address _phoneHash, uint256 _startTimestamp, uint256 _endTimestamp) → struct Timelapse.CustomerActivity[]` (public)

Get customer activities log


Get activities log of a customer (identified with `_phoneHash`)

### `generateInvoicing(uint256 _startTimestamp, uint256 _endTimestamp) → struct Timelapse.Invoice[]` (public)

Generate invoicing for a given period


Generate invoicing for a given period (between _startTimestamp and _endTimestamp)

### `generateReporting(uint256 _startTimestamp, uint256 _endTimestamp) → struct Timelapse.Reporting[]` (public)

Generate reporting for a given period


Generate reporting for a given period (between _startTimestamp and _endTimestamp)


