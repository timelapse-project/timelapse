# Timelapse

> Timelapse is a solution that manages micro-credit offers (commonly called **_Airtime Advance_**) for telecommunications operators.

## Features

- Proposals management
- Learn on customers based on network information
- Customer scoring
- Offering
- Billing

## Links

- [White Paper](doc/Timelapse_Whitepaper.pdf)
- [Documentation](#documentation)
- [Github](https://github.com/timelapse-project/timelapse)
- dApp (deployed on Heroku): [https://timelapse-project.herokuapp.com/][heroku-url]

## Architecture

### Description

The Timelapse architecture is divided into 3 modules:

- **_Timelapse Core_**:
  This module is the heart of the solution which contains the different smart contracts (developed in **Solidity**) and which are responsible for all the logic.

  Each contract has its own responsibilities:

  - [`Timelapse.sol`](contracts/Timelapse.sol): It is the parent contract which acts as an entry point and will orchestrate all requests (LowBalalance, Acceptance, TopUp, Reporting, Billing, etc.)
  - [`Offering.sol`](contracts/Offering.sol): This contract will take care of the management of proposals and offers.
  - [`Billing.sol`](contracts/Billing.sol): This contract will take care of the historization of user data and the management of scoring.

- **_Timelapse API_**:
  This module is an interface between the blockchain and Telecom operators (who are outside the blockchain). Concretely, it will allow the establishment of asynchronous and transparent communication between these 2 worlds.

  It is composed of 2 parts, developed in **NodeJS**:

  - [`server.js`](api/server.js): This part is responsible for listening and handling calls (REST endpoint) from Telecom operators, interpreting the request and calling the corresponding functions of the smart contracts (**_Timelapse Core_**)
  - [`watcher.js`](api/watcher.js): This part is responsible for listening to the events emitted by smart contracts (**_Timelapse Core_**), interpreting them and calling the corresponding REST services of Telecom operators

  As result, REST calls sent by the **_Watcher_** are in fact the asynchronous responses of the REST calls received by the **_Server_** (See [Fig 3](#schema) below for more details of the communication flow).

- **_Timelapse Client_**:
  This module is a decentralized web interface (**dApp**), developed in **ReactJS**, which allows users to access and interact with our smart contracts but in a controlled manner.

This Github **repository** gather the **Timelapse Core**, the **Timelapse API** and the **Timelapse Client** code.

### Schema

| ![High Level Architecture](doc/img/Timelapse_TechnicalArchitecture_HL.png) |
| :------------------------------------------------------------------------: |
|                   <b>Fig 1 - High Level Architecture</b>                   |

| ![Low Level Architecture](doc/img/Timelapse_TechnicalArchitecture_LL.png) |
| :-----------------------------------------------------------------------: |
|                   <b>Fig 2 - Low Level Architecture</b>                   |

| ![Asynchronous Communication](doc/img/Timelapse_APIProcess_AsynchronousCommunication_EN.png) |
| :------------------------------------------------------------------------------------------: |
|                        <b>Fig 3 - Asynchronous Communication Flow</b>                        |

# Installation

- Install [`nodejs` and `npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- Install [`git`](https://git-scm.com/)
- Clone the Github repository

  ```
  # Clone the repository
  git clone git@github.com:timelapse-project/timelapse.git
  cd timelapse
  ```

- Install the `npm` packages for timelapse-core, timelapse-client and timelapse-api

  ```
  # Update npm to its latest version
  sudo npm install -g npm

  # Install the npm packages for timelapse-core
  npm install

  # Install the npm packages for timelapse-client
  npm --prefix client/ install

  # Install the npm packages for timelapse-api
  npm --prefix api/ install
  ```

# Configuration

## Timelapse Private Blockchain Configuration

This project was developped on **Solidity** and can be used on any Ethereum-like Network.
In the scope of the POC, private blockchain has been deployed and used.
Here is the connection configuration:

- Network Name: Timelapse
- RPC URL: http://timelapse.rocdasys.com:8545
- Network ID: 1000
- Symbol: ETH

**_Remark_**: For demo purpose, the contracts have also been deployed on Ropsten Network. See **[`deployed_addresses.md`](doc/deployed_addresses.md)**, for more details.

## Environment Parameters

To deploy the project, you need to create a **`.env`** file in the project's root folder. You can use the **`.env.template`** file to determine which variables can be set.
To deploy the project on Timelapse Private Blockchain, you can set the following information:

    GETH_IPC_HOST="timelapse.rocdasys.com"
    GETH_IPC_PORT=8545
    GETH_IPC_ID="1000"
    GETH_IPC_URL="http://timelapse.rocdasys.com:8545"
    GETH_IPC_WS="ws://timelapse.rocdasys.com:8546"

## Heroku Configuration

Here is the procedure to install and configure Heroku:

- Download and install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#download-and-install).
- Configure the Heroku **remote repository**

  ```
  # git clone git@github.com:timelapse-project/timelapse.git
  cd timelapse

  # Login (once) to Heroku via CLI if you have not already done
  heroku login

  # Option A: If not existing, create the heroku git remote repository
  heroku create --ssh-git --buildpack mars/create-react-app timelapse-project

  # Option B: If existing, declare the heroku git remote repository
  heroku git:remote --ssh-git -a timelapse-project
  ```

# Compile

## Timelapse Core

Here is the procedure to compile **Timelapse Core**:

- Compile contracts:
  ```
  export PATH=$PATH:node_modules/.bin
  truffle compile
  ```

# Test

## Timelapse Core

[This page](doc/tests_explication.md) explains the tests.

- Test contracts:
  ```
  export PATH=$PATH:node_modules/.bin
  truffle test
  ```

# Deploy

## Timelapse Core

Here is the procedure to deploy **Timelapse Core**:

- Deploy the contracts to Timelapse Private Blockchain:
  ```
  export PATH=$PATH:node_modules/.bin
  truffle deploy --network timelapse
  ```

**_Remark_**: This contracts deployment is not mandatory. In the file **[`deployed_addresses.md`](doc/deployed_addresses.md)**, you can always find the current **_Contracts Addresses_** that are published to the Timelapse Private Blockchain and Ropsten Network.

## Timelapse Client

There are 2 ways to deploy **Timelapse Client**:

- Local version:

  ```
  npm --prefix client/ run start
  ```

  **_Remark_**: If you meet a dependency issue, please remove the webpack module from the **_Timelapse Core_** node_modules and restart the previous command:

  ```
  rm -rf node_modules/webpack
  ```

- Heroku version
  ```
  git subtree push --prefix client/ heroku master
  ```

# Execution

## Timelapse Client

There are several way to execute **Timelapse Client**:

- Local version:
  Access the [Local version](http://localhost:3000/)

- Heroku version
  Access the [Heroku version][heroku-url]

## Timelapse API

There are several way to execute **Timelapse Core**:

- Local version:

  ```
  # git clone git@github.com:timelapse-project/timelapse.git
  cd timelapse/api

  # Execute the Server
  node server.js

  # Execute the Watcher
  node watcher.js

  # Execute the Telecom Operator Simulator
  ./simulator.sh
  ```

# Documentation

## General

- [avoiding_common_attacks.md](doc/avoiding_common_attacks.md) describes the measures we have taken to make our smart-contracts as resistant as possible to common attacks and potential hacks
- [deployed_addresses.md](doc/deployed_addresses.md) contains the addresses of smart-contracts deployed on the private network of `Timelapse` and on `Ropsten` (for demo purpose).
- [design_pattern_decisions.md](doc/design_pattern_decisions.md) explains why we chose the design patterns we are using in the code.
- [tests_explication.md](doc/tests_explication.md) explains for each test why we wrote it and what it is aimed at.

## Smart-Contracts

The smart-contracts documentation is available in the folder [doc/contracts](doc/contracts):

- [Timelapse.sol](doc/contracts/Timelapse.md)
- [Offering.sol](doc/contracts/Offering.md)
- [Billing.sol](doc/contracts/Billing.md)

# Team

- Project Managers
  - Laurent Besse
  - Stefan Hudyka
- Devs
  - [@DavidRochus](https://github.com/DavidRochus)
  - [@Keymon](https://github.com/Keeymon)

# License

_[Timelapse][timelapse-url]_ is released under the terms of the MIT license.  
See COPYING for more information or https://opensource.org/licenses/MIT .

# Sources

Here are a few links to resources that we used while building **Timelapse**.

- Solidity
  - https://docs.soliditylang.org/en/v0.8.6
  - [@openzeppelin/contracts](https://docs.openzeppelin.com/contracts)
  - [Solidity Patterns](https://fravoll.github.io/solidity-patterns/)
- Security
  - [Security Hacks](https://solidity-by-example.org/)
  - [Solidity known attacks (Consensys)](https://consensys.github.io/smart-contract-best-practices/known_attacks/)
- Private BlockcChain
  - [Geth](https://geth.ethereum.org/docs/)
- Test
  - [@openzeppelin/test-helpers](https://docs.openzeppelin.com/test-helpers/)
  - [Chai](https://www.chaijs.com/) TDD assertion library
  - [Mocha](https://mochajs.org/) Test Framework

<!-- Github Badges: Images and URLs -->

[timelapse-url]: https://github.com/timelapse-project/timelapse
[heroku-url]: https://timelapse-project.herokuapp.com/
[doc-url]: #documentation
[team-url]: #team
