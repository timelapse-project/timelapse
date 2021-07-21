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

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

addProposal = async (data) => {
  const accounts = await web3.eth.getAccounts();
  const networkId = await web3.eth.net.getId();
  const timelapseNetwork = TimelapseContract.networks[networkId];
  const timelapseInstance = new web3.eth.Contract(
    TimelapseContract.abi,
    timelapseNetwork && timelapseNetwork.address
  );

  await timelapseInstance.methods
    .addProposal(data.minScoring, data.capital, data.interest, data.description)
    .send({
      from: accounts[0],
    });
};

lowBalance = async (data) => {
  const accounts = await web3.eth.getAccounts();
  const networkId = await web3.eth.net.getId();
  const timelapseNetwork = TimelapseContract.networks[networkId];
  const timelapseInstance = new web3.eth.Contract(
    TimelapseContract.abi,
    timelapseNetwork && timelapseNetwork.address
  );

  await timelapseInstance.methods.lowBalance(data.phoneHash, data.ref).send({
    from: accounts[0],
  });
};

acceptance = async (data) => {
  const accounts = await web3.eth.getAccounts();
  const networkId = await web3.eth.net.getId();
  const timelapseNetwork = TimelapseContract.networks[networkId];
  const timelapseInstance = new web3.eth.Contract(
    TimelapseContract.abi,
    timelapseNetwork && timelapseNetwork.address
  );

  await timelapseInstance.methods
    .acceptance(data.phoneHash, data.ref, data.timestamp, data.offerId, data.proposalId)
    .send({
      from: accounts[0],
    });
};

topUp = async (data) => {
  const accounts = await web3.eth.getAccounts();
  const networkId = await web3.eth.net.getId();
  const timelapseNetwork = TimelapseContract.networks[networkId];
  const timelapseInstance = new web3.eth.Contract(
    TimelapseContract.abi,
    timelapseNetwork && timelapseNetwork.address
  );

  if (data.partner != null && data.partner === PARTNER_CODE) {
    await timelapseInstance.methods.topUp(data.phoneHash, data.timestamp).send({
      from: accounts[0],
    });
  } else {
    await timelapseInstance.methods.addToScore(data.phoneHash).send({
      from: accounts[0],
    });
  }
};

app.post("/addProposal", function (req, res) {
  LOG_LEVEL > 0 && console.log("--> addProposal");
  LOG_LEVEL > 0 && console.log(req.body);
  this.addProposal(req.body);
  res.end(
    JSON.stringify({
      result: "OK",
    })
  );
});

app.post("/lowBalance", function (req, res) {
  LOG_LEVEL > 0 && console.log("--> lowBalance");
  LOG_LEVEL > 0 && console.log(req.body);
  this.lowBalance(req.body);
  res.end(
    JSON.stringify({
      result: "OK",
    })
  );
});

app.post("/acceptance", function (req, res) {
  LOG_LEVEL > 0 && console.log("--> acceptance");
  LOG_LEVEL > 0 && console.log(req.body);
  this.acceptance(req.body);
  res.end(
    JSON.stringify({
      result: "OK",
    })
  );
});

app.post("/topUp", function (req, res) {
  LOG_LEVEL > 0 && console.log("--> topUp");
  LOG_LEVEL > 0 && console.log(req.body);
  this.topUp(req.body);
  res.end(
    JSON.stringify({
      result: "OK",
    })
  );
});

var server = app.listen(8081, function () {
  var host = server.address().address;
  var port = server.address().port;
  //console.log("Example app listening at http://%s:%s", host, port);
  console.log("Server started...");
});
