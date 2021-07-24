# Timelapse

> Timelapse is a solution that manages micro-credit offers for telecommunications operators.

## Features

- Proposals management
- Learn on customers based on network information
- Customer scoring
- Offering
- Billing

## Links

* Open Application: [https://timelapse-project.herokuapp.com/][heroku-url]
* [Documentation](#documentation)
* [Github](https://github.com/timelapse-project/timelapse) (this repository: code, issues, wiki)

## Architecture

Timelapse software is composed of 3 parts:
- **Timelapse Core**:  
The **Ethereum smart-contracts** deployed on the testnets. They are written in Solidity.
- **Timelapse Client** (DApp):  
A **ReactJS client app** written in ReactJS and deployed on Heroku. 
It  provides the User Interface to interact with the contracts.
- **Timelapse API**:  
The **Server/Watcher** written in NodeJS.

This Github **repository** gather the **back-end and**, the **front-end** and the **API** code.

### High Level Architecture
![High Level Architecture](doc/img/Timelapse_TechnicalArchitecture_HL.png)

### Low Level Architecture
![Low Level Architecture](doc/img/Timelapse_TechnicalArchitecture_LL.png)

### Timelapse Core

Timelapse Core is composed of the following Ethereum **smart-contracts**:

- [`Timelapse`](contracts/Timelapse.sol) The entry point of Timelapse application.
- [`Offering`](contracts/Offering.sol) Manage all aspects related to offering. The contract is in charge of:
    - proposals management
    - customers management
    - products management
- [`Billing`](contracts/Billing.sol) Manage all aspects related to billing. The contract is in charge of:
    - customers management
    - accounting management
    - billing management

### Timelapse Client

Our **DApp** is a **Front-End** application written in **ReactJS** and deployed on Heroku.

### Timelapse API

Our **Timelapse API** application, written in **NodeJS**, is responsible for the communication with Telecom Operator and is composed of the following parts:

- [`server.js`](server/server.js) Manage incoming Rest calls from Telecom Operator and call blockchain.
- [`watcher.js`](server/watcher.js) Listen to blockchain and initiate Rest calls to Telecom Operator.

# Installation

- Install [`nodejs` and `npm`](https://docs.npmjs.com/
downloading-and-installing-node-js-and-npm)
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

## Environment Parameters

To deploy the project, you need to create a **`.env`** file in the project's root folder. You can use the **`.env.template`** file to determine which variables can be set.
To deploy the project on Timelapse Private Blockchain, you can set the following information:

    GETH_IPC_HOST="timelapse.rocdasys.com"
    GETH_IPC_PORT=8545
    GETH_IPC_ID="1000"
    GETH_IPC_URL="http://timelapse.rocdasys.com:8545"
    GETH_IPC_WS="ws://timelapse.rocdasys.com:8546"

## Heroku Configuration

**Procedure:**

- [Download and install Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#download-and-install).  
  We use the Heroku Command Line Interface to change the Heroku configuration of our app or tune things up.  
  Once configured, the deployment occurs all by itself without manual intervention.
- **Configure Heroku CLI**  
- **Create** your **App** on Heroku  
    - **App Name**: To keep things simple give your Heroku app the same name as your Github project.
    - **Github**: When asked enter the Github user and repository names of your project
    - **Buildpacks**: Select **`mars/create-react-app`** and remove any other buildpack (Important: Remove NodeJs if present as `mars/create-react-app` already takes care of this)
- Configure Heroku in the **local git repository**
    ```
    # git clone git@github.com:timelapse-project/timelapse.git
    cd timelapse

    # Login (once) to Heroku via CLI if you have not already done
    heroku login

    # Declare the heroku git remote repository
    heroku git:remote --ssh-git -a timelapse-project

    # If not already configured
    #heroku buildpacks:clear
    #heroku buildpacks:set mars/create-react-app

    # Set config variables
    #heroku config:set USE_NPM_INSTALL=true
    heroku config:set NPM_CONFIG_PRODUCTION=true 
    ```

# Documentation

## General

- [avoiding_common_attacks.md](doc/avoiding_common_attacks.md) describes the measures we have taken to make our smart-contracts as resistant as possible to common attacks and potential hacks
- [deployed_addresses.md](doc/deployed_addresses.md) contains the addresses of smart-contracts deployed on the private network of `Timelapse`
- [design_pattern_decisions.md](doc/design_pattern_decisions.md) explains why we chose the design patterns we are using in the code. 
- [tests_explication.md](doc/tests_explication.md) explains for each test why we wrote it and  what it is aimed at.

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
Here are a few links to resources that we used while building bet-no-loss.
- Solidity
    - https://docs.soliditylang.org/en/v0.8.6
    - [@openzeppelin/contracts](https://docs.openzeppelin.com/contracts)
    - [Solidity Patterns](https://fravoll.github.io/solidity-patterns/)
- Security
    - [Security Hacks](https://solidity-by-example.org/)
- Private BlockcChain
    - [Geth](https://geth.ethereum.org/docs/)
- Test
    - [@openzeppelin/test-helpers](https://docs.openzeppelin.com/test-helpers/)
    - [Chai](https://www.chaijs.com/) TDD assertion library

<!-- Github Badges: Images and URLs -->

[timelapse-url]: https://github.com/timelapse-project/timelapse
[heroku-url]: https://timelapse-project.herokuapp.com/
[doc-url]: #documentation
[team-url]: #team
