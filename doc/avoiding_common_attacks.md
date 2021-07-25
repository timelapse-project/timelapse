# Avoiding Common Attacks

Here are the measures we have taken to make our smart-contracts as resistant as possible to common attacks and potential hacks.

[Reference](https://solidity-by-example.org)

## Access Control

We use `Ownable` from _@openzeppelin_ to ensure that:

- Only owner can call key functions(storage write functions) of the Timelapse smart-contract
- Only Timelapse smart-contract can call key functions(storage write functions) of the sub smart-contract (Offering, Billing)

[Reference](https://docs.openzeppelin.com/contracts/4.x/access-control)

## Arithmetic Overflow and Underflow

We don't use `SaFeMath` from _@openzeppelin_ since we are using [Solidity 0.8.6](https://docs.soliditylang.org/en/v0.8.6/080-breaking-changes.html) which handles this natively.

[Reference](https://solidity-by-example.org/hacks/overflow/)

## Accessing Private Data

We do not store any sensitive data of the customer in order to be GDPR compliant and avoid malicious users to use private data.

[Reference](https://solidity-by-example.org/hacks/accessing-private-data/)
[Reference](https://gdpr.eu/)

## Phishing with tx.origin

We do not use directly `tx.origin` in our contracts but only `msg.sender`(via Ownable).

[Reference](https://solidity-by-example.org/hacks/phishing-with-tx-origin/)
