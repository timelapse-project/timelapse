# Design Pattern Decisions

This section explains why we chose the design patterns we are using in the code.

[Reference](https://fravoll.github.io/solidity-patterns/)

## Security Patterns

### Access Restriction

We restrict access to key functions(storage write functions) of our smart-contracts where only the owner can run them.

- For `Timelapse` smart-contract, the owner is the one who deployed it
- For `Offering` smart-contract, the owner is `Timelapse` smart-contract
- For `Billing` smart-contract, the owner is `Timelapse` smart-contract

We use a **Guard Check Pattern** via `onlyOwner` of [Openzeppelin's `Ownable` contract](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.0.0/contracts/access/Ownable.sol) for this purpose.

[Reference](https://fravoll.github.io/solidity-patterns/access_restriction.html)

## Tech

### Solidity version 0.8.6

We use the the latest Solidity version (0.8+) since:

- it was a requirement of the project
- OpenZeppelin supports it  
  This version brings in native handling of arithmetic overflow and underflow and reverts the transaction in this case.

### Repository and Source Code

We have a single GitHub repository to store our **front-end, back-end, API** source code.

### Deployment

The ReactJS **front-end** (DApp) is **[deployed on Heroku](../README.md#deploy-front-end)**
