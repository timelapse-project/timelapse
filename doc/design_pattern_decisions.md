# Design Pattern Decisions

Here are the design patterns we are using in the code:

- Behavioral Patterns
  - [x] **_Guard Check_**: Ensure that the behavior of a smart contract and its input parameters are as expected.
  - [ ] State Machine: Enable a contract to go through different stages with different corresponding functionality exposed.
  - [ ] Oracle: Gain access to data stored outside of the blockchain.
  - [ ] Randomness: Generate a random number of a predefined interval in the deterministic environment of a blockchain.
- Security Patterns
  - [x] **_Access Restriction_**: Restrict the access to contract functionality according to suitable criteria.
  - [ ] Checks Effects Interactions: Reduce the attack surface for malicious contracts trying to hijack control flow after an external call.
  - [ ] Secure Ether Transfer: Secure transfer of ether from a contract to another address.
  - [ ] Pull over Push: Shift the risk associated with transferring ether to the user.
  - [ ] Emergency Stop: Add an option to disable critical contract functionality in case of an emergency.
- Upgradeability Patterns
  - [ ] Proxy Delegate: Introduce the possibility to upgrade smart contracts without breaking any dependencies.
  - [ ] Eternal Storage: Keep contract storage after a smart contract upgrade.
- Economic Patterns
  - [ ] String Equality Comparison: Check for the equality of two provided strings in a way that minimizes average gas consumption for a large number of different inputs.
  - [x] **_Tight Variable Packing_**: Optimize gas consumption when storing or loading statically-sized variables.
  - [x] **_Memory Array Building_**: Aggregate and retrieve data from contract storage in a gas efficient way.

[Reference](https://fravoll.github.io/solidity-patterns/)

## Behavioral Patterns

### **_Guard Check_**

To validate user inputs and rule out conditions that should not be possible, we use several `require()`.

[Reference](https://fravoll.github.io/solidity-patterns/guard_check.html)

## Security Patterns

### **_Access Restriction_**

We restrict access to key functions(storage write functions) of our smart-contracts where only the owner can run them.

- For `Timelapse` smart-contract, the owner is the one who deployed it
- For `Offering` smart-contract, the owner is `Timelapse` smart-contract
- For `Billing` smart-contract, the owner is `Timelapse` smart-contract

We use a **Guard Check Pattern** via `onlyOwner` of [Openzeppelin's `Ownable` contract](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.0.0/contracts/access/Ownable.sol) for this purpose.

[Reference](https://fravoll.github.io/solidity-patterns/access_restriction.html)

## Economic Patterns

### **_Tight Variable Packing_**

In order to reduce contract interaction costs, we are using each time the smallest possible data type and we group the data types together.

[Reference](https://fravoll.github.io/solidity-patterns/tight_variable_packing.html)

### **_Memory Array Building_**

To aggregate and retrieve data from our contracts storage in a gas efficient way, we used Memory arrays for several functions.

[Reference](https://fravoll.github.io/solidity-patterns/memory_array_building.html)
