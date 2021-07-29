# Avoiding Common Attacks

Here are the measures we have taken to make our smart-contracts as resistant as possible to common attacks and potential hacks.

References

- [Security Hacks](https://solidity-by-example.org/)
- [Solidity known attacks (Consensys)](https://consensys.github.io/smart-contract-best-practices/known_attacks/)

## Re-Entrancy

Not applicable because we don't call any unknow contracts/addresses.

[Reference](https://solidity-by-example.org/hacks/re-entrancy)

## Arithmetic Overflow and Underflow

We are use [Solidity 0.8.6](https://docs.soliditylang.org/en/v0.8.6/080-breaking-changes.html) that handles this problematic natively so, we don't need to use `SaFeMath` from _@openzeppelin_.

[Reference](https://solidity-by-example.org/hacks/overflow)

## Self Destruct

Not applicable because we don't handle any value (ETH).

[Reference](https://solidity-by-example.org/hacks/self-destruct)

## Accessing Private Data

Thanks to Timelapse solution architecture, we do not store/handle any sensitive data of the customer in order to avoid malicious users to use private data (and be GDPR compliant).

[Reference](https://solidity-by-example.org/hacks/accessing-private-data)

## Delegatecall

Not applicable because we don't need to use any delegate calls.

[Reference](https://solidity-by-example.org/hacks/delegatecall)

## Source of Randomness

Thanks to Timelapse solution architecture, we don't use any source of randomness.

[Reference](https://solidity-by-example.org/hacks/randomness)

## Denial of Service (revert)

Not applicable because we don't handle any value (ETH) and because we don't call any unknow contracts/addresses.

[Reference](https://solidity-by-example.org/hacks/denial-of-service)

## Denial of Service (Block Gas Limit)

Not applicable because we don't call any unknow contracts/addresses, we don't loop ulimited array (instead, we access array values via indexes, stored in mappings).

[Reference](https://consensys.github.io/smart-contract-best-practices/known_attacks/#dos-with-block-gas-limit)

## Phishing with tx.origin

We do not use `tx.origin` in our contracts but only `msg.sender`(via Ownable from _@openzeppelin_).

[Reference](https://solidity-by-example.org/hacks/phishing-with-tx-origin)

## Hiding Malicious Code with External Contract

The addresses of the 2 sub-contracts are public so that the code of these contracts can be checked and reviewed.

[Reference](https://solidity-by-example.org/hacks/hiding-malicious-code-with-external-contract)

## Honeypot

Not applicable (See [Re-Entrancy](#re-entrancy) and [Hiding Malicious Code with External Contract](#hiding-malicious-code-with-external-contract))

[Reference](https://solidity-by-example.org/hacks/honeypot)

## Front Running

Front running can be used (or at least, will be useless) because all functions that can impact (update) the smart contracts are protected by Ownable from _@openzeppelin_.

[Reference](https://solidity-by-example.org/hacks/front-running)

## Block Timestamp Manipulation

Thanks to Timelapse solution architecture, `block.timestamp` is only used to log the timestamp of some actions (for logging/auditing purpose) and has no impact on the behaviour of the solution.

[Reference](https://solidity-by-example.org/hacks/block-timestamp-manipulation)

## Signature Replay

Not applicable because we don't use off-chain signing messages.

[Reference](https://solidity-by-example.org/hacks/signature-replay)

## Bypass Contract Size Check

Not applicable because we don't need to test if `msg.sender` is a contract or not.

[Reference](https://solidity-by-example.org/hacks/contract-size)
