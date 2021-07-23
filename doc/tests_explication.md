# Tests

> This document explains the goal of each test.

## Test Environment

We are using:
- [OpenZeppelin test-helpers](https://docs.openzeppelin.com/test-helpers)
- truffle test as a test runner engine
- [chai](https://www.npmjs.com/package/chai) for our TDD assertions

We use the **`expect`**, **`expectEvent`**, **`expectRevert`**  variants in our tests.

## Test Struture

We chose to use exclusively **javascript tests** instead of Solidity unit tests.  
They are **located** beneath the **`test`** folder.  
Each one tests a smart-contract with unit tests and integration tests when interacting with others.  
Inside the test, functions are grouped (using `describe`) by feature, or state or whatever is meaningfull for the reader of the test output depending on the contract.

## `test/billing.test.js`

Test the `Billing.sol` smart-contract 
- `Function: isActiveCustomer`
    - `isActiveCustomer` makes sure that `.isActiveCustomer()` reverts if called for an unknown customer
- `Function: addToScore`
    - `Revert: addToScore is onlyOwner` makes sure that `.addToScore()` reverts if not called by the contract owner
    - `addToScore` makes sure that `.addToScore()` updates correctly the customer(s) information 
- `Function: changeCustomerStatus`
    - `Revert: changeCustomerStatus is onlyOwner` makes sure that `.changeCustomerStatus()` reverts if not called by the contract owner
    - `changeCustomerStatus` makes sure that `.changeCustomerStatus()` updates correctly the customer(s) status 
    - `Event: CustomerStatusChange for changeCustomerStatus` makes sure that `.changeCustomerStatus()` generates the event `CustomerStatusChange`
- `Function: changeScore`
    - `Revert: changeScore is onlyOwner` makes sure that `.changeScore()` reverts if not called by the contract owner
    - `changeScore` makes sure that `.changeScore()` updates correctly the customer(s) score 
    - `Event: ScoreChange for changeScore` makes sure that `.changeCustomerStatus()` generates the event `ScoreChange`
- `Function: acceptanceBilling`
    - `Revert: acceptanceBilling is onlyOwner` makes sure that `.acceptanceBilling()` reverts if not called by the contract owner
    - `Revert: acceptanceBilling is activeCustomer` makes sure that `.acceptanceBilling()` reverts if called for an unknown customer
    - `acceptanceBilling` makes sure that `.acceptanceBilling()` updates correctly the customer(s) history 
    - `Event: AcceptanceReceived for acceptanceBilling` makes sure that `.acceptanceBilling()` generates the event `AcceptanceReceived`
    - `Event: Confirmation for acceptanceBilling` makes sure that `.acceptanceBilling()` generates the event `Confirmation`
- `Function: topUpBilling`
    - `Revert: topUpBilling is onlyOwner` makes sure that `.topUpBilling()` reverts if not called by the contract owner
    - `Revert: topUpBilling is for registered phone` makes sure that `.topUpBilling()` reverts if called for an unknown customer
    - `Revert: topUpBilling is for actived product` makes sure that `.topUpBilling()` reverts if called for an unknown product
    - `topUpBilling` makes sure that `.topUpBilling()` updates correctly the customer(s) history 
    - `Event: TopUpReceived for topUpBilling` makes sure that `.topUpBilling()` generates the event `TopUpReceived`
    - `Event: Acknowledge for topUpBilling` makes sure that `.topUpBilling()` generates the event `Acknowledge`

## `test/offering.test.js`

Test the `Offering.sol` smart-contract 
- `Function: addProposal`
    - `Revert: addProposal is onlyOwner` makes sure that `.addProposal()` reverts if not called by the contract owner
    - `addProposal` makes sure that `.addProposal()` adds correctly new proposal(s) 
    - `Event: ProposalAdded` makes sure that `.addProposal()` generates the event `ProposalAdded`
- `Function: closedProposal`
    - `Revert: closedProposal is onlyOwner` makes sure that `.closedProposal()` reverts if not called by the contract owner
    - `Revert: closedProposal for existing proposal` makes sure that `.closedProposal()` reverts if called for an unknown proposal
    - `closedProposal` makes sure that `.closedProposal()` closes correctly proposal(s) 
    - `Event: ClosedProposal for closedProposal` makes sure that `.closedProposal()` generates the event `ClosedProposal`
- `Function: proposalsCount`
    - `proposalsCount` makes sure that `.proposalsCount()` returns the correct number of proposal(s) 
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
- `Test Offering.sol, Owner = Timelapse`
    - `Function: isActiveCustomer`
        - `isActiveCustomer` makes sure that `.isActiveCustomer()` reverts if called for an unknown customer
    - `Function: addToScore`
        - `Revert: addToScore is onlyOwner` makes sure that `.addToScore()` reverts if not called by the contract owner
        - `addToScore` makes sure that `.addToScore()` updates correctly the customer(s) information 
    - `Function: changeCustomerStatus`
        - `Revert: changeCustomerStatus is onlyOwner` makes sure that `.changeCustomerStatus()` reverts if not called by the contract owner
        - `changeCustomerStatus` makes sure that `.changeCustomerStatus()` updates correctly the customer(s) status 
        - `Event: CustomerStatusChange for changeCustomerStatus` makes sure that `.changeCustomerStatus()` generates the event `CustomerStatusChange`
    - `Function: changeScore`
        - `Revert: changeScore is onlyOwner` makes sure that `.changeScore()` reverts if not called by the contract owner
        - `changeScore` makes sure that `.changeScore()` updates correctly the customer(s) score 
        - `Event: ScoreChange for changeScore` makes sure that `.changeCustomerStatus()` generates the event `ScoreChange`
    - `Function: acceptanceBilling`
        - `Revert: acceptanceBilling is onlyOwner` makes sure that `.acceptanceBilling()` reverts if not called by the contract owner
        - `Revert: acceptanceBilling is activeCustomer` makes sure that `.acceptanceBilling()` reverts if called for an unknown customer
        - `acceptanceBilling` makes sure that `.acceptanceBilling()` updates correctly the customer(s) history 
        - `Event: AcceptanceReceived for acceptanceBilling` makes sure that `.acceptanceBilling()` generates the event `AcceptanceReceived`
        - `Event: Confirmation for acceptanceBilling` makes sure that `.acceptanceBilling()` generates the event `Confirmation`
    - `Function: topUpBilling`
        - `Revert: topUpBilling is onlyOwner` makes sure that `.topUpBilling()` reverts if not called by the contract owner
        - `Revert: topUpBilling is for registered phone` makes sure that `.topUpBilling()` reverts if called for an unknown customer
        - `Revert: topUpBilling is for actived product` makes sure that `.topUpBilling()` reverts if called for an unknown product
        - `topUpBilling` makes sure that `.topUpBilling()` updates correctly the customer(s) history 
        - `Event: TopUpReceived for topUpBilling` makes sure that `.topUpBilling()` generates the event `TopUpReceived`
        - `Event: Acknowledge for topUpBilling` makes sure that `.topUpBilling()` generates the event `Acknowledge`
- `Test Billing.sol, Owner = Timelapse`
    - `Function: addProposal`
        - `Revert: addProposal is onlyOwner` makes sure that `.addProposal()` reverts if not called by the contract owner
        - `addProposal` makes sure that `.addProposal()` adds correctly new proposal(s) 
        - `Event: ProposalAdded` makes sure that `.addProposal()` generates the event `ProposalAdded`
    - `Function: closedProposal`
        - `Revert: closedProposal is onlyOwner` makes sure that `.closedProposal()` reverts if not called by the contract owner
        - `Revert: closedProposal for existing proposal` makes sure that `.closedProposal()` reverts if called for an unknown proposal
        - `closedProposal` makes sure that `.closedProposal()` closes correctly proposal(s) 
        - `Event: ClosedProposal for closedProposal` makes sure that `.closedProposal()` generates the event `ClosedProposal`
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