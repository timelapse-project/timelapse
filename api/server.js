/*
 *    Title: Alyra Project - Timelapse - Server
 *    Description: This script manage the rest calls coming from Telecom Operator and send it to the blockchain
 */
var express = require("express");
const { web3 } = require("./getWeb3");
var app = express();
var fs = require("fs");

const TimelapseContract = require("../client/src/contracts/Timelapse.json");
const OfferingContract = require("../client/src/contracts/Offering.json");
const BillingContract = require("../client/src/contracts/Billing.json");

var LOG_LEVEL = 1;
var PARTNER_CODE = "TL";

/**
 * @dev Express server configuration
 */
app.use(
  express.urlencoded({
    extended: true,
  })
);

/**
 * @dev Express server configuration
 */
app.use(express.json());

/**
 * @notice Send a request to BlockChain in order to add a proposal
 * @param _data The content of the rest request
 * @dev Send a request to BlockChain to add a proposal using `_data` content
 */
addProposal = async (_data) => {
  const accounts = await web3.eth.getAccounts();
  const networkId = await web3.eth.net.getId();
  const timelapseNetwork = TimelapseContract.networks[networkId];
  const timelapseInstance = new web3.eth.Contract(
    TimelapseContract.abi,
    timelapseNetwork && timelapseNetwork.address
  );
  await timelapseInstance.methods
    .addProposal(
      _data.minScoring,
      _data.capital,
      _data.interest,
      _data.description
    )
    .send({
      from: accounts[0],
    });
};

/**
 * @notice Send a request to BlockChain in order to manage a lowBalance
 * @param _data The content of the rest request
 * @dev Send a request to BlockChain in order to manage a lowBalance using `_data` content
 */
lowBalance = async (_data) => {
  const accounts = await web3.eth.getAccounts();
  const networkId = await web3.eth.net.getId();
  const timelapseNetwork = TimelapseContract.networks[networkId];
  const timelapseInstance = new web3.eth.Contract(
    TimelapseContract.abi,
    timelapseNetwork && timelapseNetwork.address
  );
  await timelapseInstance.methods.lowBalance(_data.phoneHash, _data.ref).send({
    from: accounts[0],
  });
};

/**
 * @notice Send a request to BlockChain in order to manage an acceptance
 * @param _data The content of the rest request
 * @dev Send a request to BlockChain in order to manage an acceptance using `_data` content
 */
acceptance = async (_data) => {
  const accounts = await web3.eth.getAccounts();
  const networkId = await web3.eth.net.getId();
  const timelapseNetwork = TimelapseContract.networks[networkId];
  const timelapseInstance = new web3.eth.Contract(
    TimelapseContract.abi,
    timelapseNetwork && timelapseNetwork.address
  );
  await timelapseInstance.methods
    .acceptance(
      _data.phoneHash,
      _data.ref,
      _data.timestamp,
      _data.offerId,
      _data.proposalId
    )
    .send({
      from: accounts[0],
    });
};

/**
 * @notice Send a request to BlockChain in order to manage a topUp
 * @param _data The content of the rest request
 * @dev Send a request to BlockChain in order to manage a topUp using `_data` content
 */
topUp = async (_data) => {
  const accounts = await web3.eth.getAccounts();
  const networkId = await web3.eth.net.getId();
  const timelapseNetwork = TimelapseContract.networks[networkId];
  const timelapseInstance = new web3.eth.Contract(
    TimelapseContract.abi,
    timelapseNetwork && timelapseNetwork.address
  );
  if (_data.partner != null && _data.partner === PARTNER_CODE) {
    await timelapseInstance.methods
      .topUp(_data.phoneHash, _data.timestamp)
      .send({
        from: accounts[0],
      });
  } else {
    await timelapseInstance.methods.addToScore(_data.phoneHash).send({
      from: accounts[0],
    });
  }
};

/**
 * @notice Rest endpoint to manage an addProposal
 * @param _req The http request data
 * @param _res The http response data
 * @dev Rest endpoint to manage an addProposal using `_req`, `_res` data
 */
app.post("/addProposal", function (_req, _res) {
  LOG_LEVEL > 0 && console.log("--> addProposal");
  LOG_LEVEL > 0 && console.log(_req.body);
  this.addProposal(_req.body);
  _res.end(
    JSON.stringify({
      result: "OK",
    })
  );
});

/**
 * @notice Rest endpoint to manage a lowBalance
 * @param _req The http request data
 * @param _res The http response data
 * @dev Rest endpoint to manage a lowBalance using `_req`, `_res` data
 */
app.post("/lowBalance", function (_req, _res) {
  LOG_LEVEL > 0 && console.log("--> lowBalance");
  LOG_LEVEL > 0 && console.log(_req.body);
  this.lowBalance(_req.body);
  _res.end(
    JSON.stringify({
      result: "OK",
    })
  );
});

/**
 * @notice Rest endpoint to manage an acceptance
 * @param _req The http request data
 * @param _res The http response data
 * @dev Rest endpoint to manage an acceptance using `_req`, `_res` data
 */
app.post("/acceptance", function (_req, _res) {
  LOG_LEVEL > 0 && console.log("--> acceptance");
  LOG_LEVEL > 0 && console.log(_req.body);
  this.acceptance(_req.body);
  _res.end(
    JSON.stringify({
      result: "OK",
    })
  );
});

/**
 * @notice Rest endpoint to manage a topUp
 * @param _req The http request data
 * @param _res The http response data
 * @dev Rest endpoint to manage a topUp using `_req`, `_res` data
 */
app.post("/topUp", function (_req, _res) {
  LOG_LEVEL > 0 && console.log("--> topUp");
  LOG_LEVEL > 0 && console.log(_req.body);
  this.topUp(_req.body);
  _res.end(
    JSON.stringify({
      result: "OK",
    })
  );
});

/**
 * @notice Initialize Express server
 */
var server = app.listen(8081, function () {
  console.log("Server started...");
});
