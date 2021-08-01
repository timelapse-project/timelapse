# Tests

> This document explains the goal of each test.

## Test Environment

We are using:

- [OpenZeppelin test-helpers](https://docs.openzeppelin.com/test-helpers)
- truffle test as a test runner engine
- [chai](https://www.npmjs.com/package/chai) for our TDD assertions

We use the **`expect`**, **`expectEvent`**, **`expectRevert`** variants in our tests.

## Test Struture

We chose to use exclusively **javascript tests** instead of Solidity unit tests.  
They are **located** beneath the **`test`** folder.  
Each one tests a smart-contract with unit tests and integration tests when interacting with others.  
Inside the test, functions are grouped (using `describe`) by feature, or state or whatever is meaningfull for the reader of the test output depending on the contract.

## `test/billing.test.js`

Test the `Billing.sol` smart-contract

- `Function: getCustomer`
  - `getCustomer` makes sur that `.getCustomer()` reverts if called for a unknow customer
- `Function: isActiveCustomer`
  - `isActiveCustomer` makes sure that `.isActiveCustomer()` reverts if called for an unknown customer
- `Function: addToScore`
  - `Revert: addToScore is onlyOwner` makes sure that `.addToScore()` reverts if not called by the contract owner
  - `addToScore` makes sure that `.addToScore()` updates correctly the customer(s) information
  - `Event: ScoreChanged for addToScore` makes sure that `.addToScore()` generates the event `ScoreChanged`
- `Function: changeCustomerStatus`
  - `Revert: changeCustomerStatus is onlyOwner` makes sure that `.changeCustomerStatus()` reverts if not called by the contract owner
  - `changeCustomerStatus` makes sure that `.changeCustomerStatus()` updates correctly the customer(s) status
  - `Event: CustomerStatusChange for changeCustomerStatus` makes sure that `.changeCustomerStatus()` generates the event `CustomerStatusChange`
- `Function: changeScore`
  - `Revert: changeScore is onlyOwner` makes sure that `.changeScore()` reverts if not called by the contract owner
  - `changeScore` makes sure that `.changeScore()` updates correctly the customer(s) score
  - `Event: ScoreChanged for changeScore` makes sure that `.changeCustomerStatus()` generates the event `ScoreChanged`
- `Function: getScore`
  - `Revert: getScore is onlyOwner` makes sure that `.getScore()` reverts if not called by the owner
  - `Revert: getScore is for activeCustomer` makes sure that `.getScore()` reverts if customer is not active
- `Function: acceptanceBilling`
  - `Revert: acceptanceBilling is onlyOwner` makes sure that `.acceptanceBilling()` reverts if not called by the contract owner
  - `Revert: acceptanceBilling is activeCustomer` makes sure that `.acceptanceBilling()` reverts if called for an unknown customer
  - `acceptanceBilling` makes sure that `.acceptanceBilling()` updates correctly the customer(s) history
  - `Event: AcceptanceReceived for acceptanceBilling` makes sure that `.acceptanceBilling()` generates the event `AcceptanceReceived`
  - `Event: ConfirmationSent for acceptanceBilling` makes sure that `.acceptanceBilling()` generates the event `ConfirmationSent`
- `Function: topUpBilling`
  - `Revert: topUpBilling is onlyOwner` makes sure that `.topUpBilling()` reverts if not called by the contract owner
  - `Revert: topUpBilling is for registered phone` makes sure that `.topUpBilling()` reverts if called for an unknown customer
  - `Revert: topUpBilling is for actived product` makes sure that `.topUpBilling()` reverts if called for an unknown product
  - `topUpBilling` makes sure that `.topUpBilling()` updates correctly the customer(s) history
  - `Event: TopUpReceived for topUpBilling` makes sure that `.topUpBilling()` generates the event `TopUpReceived`
  - `Event: AcknowledgeSent for topUpBilling` makes sure that `.topUpBilling()` generates the event `AcknowledgeSent`

## `test/offering.test.js`

Test the `Offering.sol` smart-contract

- `Function: addProposal`
  - `Revert: addProposal is onlyOwner` makes sure that `.addProposal()` reverts if not called by the contract owner
  - `addProposal` makes sure that `.addProposal()` adds correctly new proposal(s)
  - `Event: ProposalAdded` makes sure that `.addProposal()` generates the event `ProposalAdded`
- `Function: closeProposal`
  - `Revert: closeProposal is onlyOwner` makes sure that `.closeProposal()` reverts if not called by the contract owner
  - `Revert: closeProposal for existing proposal` makes sure that `.closeProposal()` reverts if called for an unknown proposal
  - `closeProposal` makes sure that `.closeProposal()` closes correctly proposal(s)
  - `Event: ProposalClosed for closeProposal` makes sure that `.closeProposal()` generates the event `ProposalClosed`
- `Function: proposalsCount`
  - `proposalsCount` makes sure that `.proposalsCount()` returns the correct number of proposal(s)
- `Function: getProposalOfferSize`
  - `Revert: getProposalOfferSize is for existOffer` makes sure taht `.getProposalOfferSize()` reverts if offer doesn't exist
  - `getProposalOfferSize` makes sure that `.getProposalOfferSize()` return the correct size
- `Function: getIndexProposalOffer`
  - `Revert: getIndexProposalOffer is for existOffer` makes sure that `.getIndexProposalOffer()` reverts if offer doesn't exist
  - `Revert: getIndexProposalOffer is for existing proposal ID` make sure that `.getIndexProposalOffer()` reverts if invalid index
- `Function: lowBalanceOffering`
  - `Revert: lowBalanceOffering is onlyOwner` makes sure that `.lowBalanceOffering()` reverts if not called by the contract owner
  - `lowBalanceOffering` makes sure that `.lowBalanceOffering()` generates a new offer
  - `Event: LowBalanceReceived for lowBalanceOffering` makes sure that `.lowBalanceOffering()` generates the event `LowBalanceReceived`
  - `Event: OfferSent for lowBalanceOffering` makes sure that `.lowBalanceOffering()` generates the event `OfferSent`
- `Function: createProduct`
  - `Revert: createProduct is onlyOwner` makes sure that `.createProduct()` reverts if not called by the contract owner
  - `Revert: createProduct for existing Proposal` makes sure that `.createProduct()` reverts if called for an unknown proposal
  - `Revert: createProduct for existing Offer` makes sure that `.createProduct()` reverts if called for an unknown offer
  - `createProduct` makes sure that `.createProduct()` generates a product with the correct information
  - `Event: ProductCreated for createProduct` makes sure that `.createProduct()` generates the event `ProductCreated`

## `test/timelapse.test.js`

Test the `Timelapse.sol` smart-contract

- `Test Billing.sol, Owner = Timelapse`
  - `Function: isActiveCustomer`
    - `isActiveCustomer` makes sure that `.isActiveCustomer()` reverts if called for an unknown customer
  - `Function: addToScore`
    - `Revert: addToScore is onlyOwner` makes sure that `.addToScore()` reverts if not called by the contract owner
    - `addToScore` makes sure that `.addToScore()` updates correctly the customer(s) information
    - `Event: ScoreChanged for addToScore` makes sure that `.addToScore()` generates the event `ScoreChanged`
  - `Function: changeCustomerStatus`
    - `Revert: changeCustomerStatus is onlyOwner` makes sure that `.changeCustomerStatus()` reverts if not called by the contract owner
    - `changeCustomerStatus` makes sure that `.changeCustomerStatus()` updates correctly the customer(s) status
    - `Event: CustomerStatusChange for changeCustomerStatus` makes sure that `.changeCustomerStatus()` generates the event `CustomerStatusChange`
  - `Function: changeScore`
    - `Revert: changeScore is onlyOwner` makes sure that `.changeScore()` reverts if not called by the contract owner
    - `changeScore` makes sure that `.changeScore()` updates correctly the customer(s) score
    - `Event: ScoreChanged for changeScore` makes sure that `.changeCustomerStatus()` generates the event `ScoreChanged`
  - `Function: acceptanceBilling`
    - `Revert: acceptanceBilling is onlyOwner` makes sure that `.acceptanceBilling()` reverts if not called by the contract owner
    - `Revert: acceptanceBilling is activeCustomer` makes sure that `.acceptanceBilling()` reverts if called for an unknown customer
    - `acceptanceBilling` makes sure that `.acceptanceBilling()` updates correctly the customer(s) history
    - `Event: AcceptanceReceived for acceptanceBilling` makes sure that `.acceptanceBilling()` generates the event `AcceptanceReceived`
    - `Event: ConfirmationSent for acceptanceBilling` makes sure that `.acceptanceBilling()` generates the event `ConfirmationSent`
  - `Function: topUpBilling`
    - `Revert: topUpBilling is onlyOwner` makes sure that `.topUpBilling()` reverts if not called by the contract owner
    - `Revert: topUpBilling is for registered phone` makes sure that `.topUpBilling()` reverts if called for an unknown customer
    - `Revert: topUpBilling is for actived product` makes sure that `.topUpBilling()` reverts if called for an unknown product
    - `topUpBilling` makes sure that `.topUpBilling()` updates correctly the customer(s) history
    - `Event: TopUpReceived for topUpBilling` makes sure that `.topUpBilling()` generates the event `TopUpReceived`
    - `Event: AcknowledgeSent for topUpBilling` makes sure that `.topUpBilling()` generates the event `AcknowledgeSent`
- `Test Offering.sol, Owner = Timelapse`
  - `Function: addProposal`
    - `Revert: addProposal is onlyOwner` makes sure that `.addProposal()` reverts if not called by the contract owner
    - `addProposal` makes sure that `.addProposal()` adds correctly new proposal(s)
    - `Event: ProposalAdded` makes sure that `.addProposal()` generates the event `ProposalAdded`
  - `Function: closeProposal`
    - `Revert: closeProposal is onlyOwner` makes sure that `.closeProposal()` reverts if not called by the contract owner
    - `Revert: closeProposal for existing proposal` makes sure that `.closeProposal()` reverts if called for an unknown proposal
    - `closeProposal` makes sure that `.closeProposal()` closes correctly proposal(s)
    - `Event: ProposalClosed for closeProposal` makes sure that `.closeProposal()` generates the event `ProposalClosed`
  - `Function: lowBalanceOffering`
    - `Revert: lowBalanceOffering is onlyOwner` makes sure that `.lowBalanceOffering()` reverts if not called by the contract owner
    - `lowBalanceOffering` makes sure that `.lowBalanceOffering()` generates a new offer
    - `Event: LowBalanceReceived for lowBalanceOffering` makes sure that `.lowBalanceOffering()` generates the event `LowBalanceReceived`
    - `Event: OfferSent for lowBalanceOffering` makes sure that `.lowBalanceOffering()` generates the event `OfferSent`
  - `Function: createProduct`
    - `Revert: createProduct is onlyOwner` makes sure that `.createProduct()` reverts if not called by the contract owner
    - `Revert: createProduct for existing Proposal` makes sure that `.createProduct()` reverts if called for an unknown proposal
    - `Revert: createProduct for existing Offer` makes sure that `.createProduct()` reverts if called for an unknown offer
    - `createProduct` makes sure that `.createProduct()` generates a product with the correct information
    - `Event: ProductCreated for createProduct` makes sure that `.createProduct()` generates the event `ProductCreated`
- `Test Timelapse.sol`
  - `Function: addProposal`
    - `Revert: addProposal is onlyOwner` makes sure that `.addProposal()` reverts if not called by the contract owner
    - `addProposal` makes sure that `.addProposal()` adds correctly new proposal(s)
    - `Event: ProposalAdded` makes sure that `.addProposal()` generates the event `ProposalAdded`
  - `Function: closeProposal`
    - `Revert: closeProposal is onlyOwner` makes sure that `.closeProposal()` reverts if not called by the contract owner
    - `Revert: closeProposal for existing proposal` makes sure that `.closeProposal()` reverts if called for an unknown proposal
    - `closeProposal` makes sure that `.closeProposal()` closes correctly proposal(s)
    - `Event: ProposalClosed for closeProposal` makes sure that `.closeProposal()` generates the event `ProposalClosed`
  - `Function: addToScore`
    - `Revert: addToScore is onlyOwner` makes sure that `.addToScore()` reverts if not called by the contract owner
    - `addToScore` makes sure that `.addToScore()` updates correctly the customer(s) information
    - `Event: ScoreChanged for addToScore` makes sure that `.addToScore()` generates the event `ScoreChanged`
  - `Function: lowBalance`
    - `Revert: lowBalance is onlyOwner` makes sure that `.lowBalance()` reverts if not called by the contract owner
    - `lowBalance` makes sure that `.lowBalance()` generates a new offer
    - `Event: LowBalanceReceived for lowBalance` makes sure that `.lowBalance()` generates the event `LowBalanceReceived`
    - `Event: OfferSent for lowBalance` makes sure that `.lowBalance()` generates the event `OfferSent`
  - `Function: acceptance`
    - `Revert: acceptance is onlyOwner` makes sure that `.acceptance()` reverts if not called by the contract owner
    - `acceptance` makes sure that `.acceptance()` updates correctly the customer(s) history
    - `Event: AcceptanceReceived for acceptance` makes sure that `.acceptance()` generates the event `AcceptanceReceived`
    - `Event: ConfirmationSent for acceptance` makes sure that `.acceptance()` generates the event `ConfirmationSent`
  - `Function: topUp`
    - `Revert: topUp is onlyOwner` makes sure that `.topUp()` reverts if not called by the contract owner
    - `topUp` makes sure that `.topUp()` updates correctly the customer(s) history
    - `Event: TopUpReceived for topUp` makes sure that `.topUp()` generates the event `TopUpReceived`
    - `Event: AcknowledgeSent for topUp` makes sure that `.topUp()` generates the event `AcknowledgeSent`
  - `Function: getCustomerActivitiesLog`
    - `getCustomerActivitiesLog` makes sure that `.getCustomerActivitiesLog()` returns the correct Activities Logs
  - `Function: generateInvoicing`
    - `generateInvoicing` makes sure that `.generateInvoicing()` returns the correct invoicing values
  - `Function: getOfferSize`
    - `getOfferSize` makes sure that `.getOfferSize()` returns the correct amount of offers for a give customer
  - `Function: getOffersSize`
    - `getOffersSize` makes sure that `.getOfferSize()` returns the correct amount of offers (globally)
  - `Function: generateReporting`
    - `generateReporting` makes sure that `.generateReporting()` returns the correct reporting values
  - `Function: getSizeProposalOffer`
    - `getSizeProposalOffer` makes sure that `.getSizeProposalOffer()` returns the correct amount of proposals in an offer
  - `Function: getIndexProposalOffer`
    - `getIndexProposalOffer` makes sure that `.getIndexProposalOffer()` returns the correct proposal index in an offer
