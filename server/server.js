/*
 *    Title: Alyra Project - Timelapse - Server
 *    Description: This script manage the rest calls coming from Telecom Operator and send it to the blockchain
 */
var express = require("express");
const { web3 } = require("./getWeb3");
var app = express();
var fs = require("fs");

const OfferingContract = require("../client/src/contracts/Offering.json");

let LOG_LEVEL = 1;

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

addPackage = async (data) => {
  const accounts = await web3.eth.getAccounts();
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = OfferingContract.networks[networkId];
  const contract = new web3.eth.Contract(
    OfferingContract.abi,
    deployedNetwork && deployedNetwork.address
  );

  await contract.methods
    .addPackage(data.id, data.minScoring, data.description)
    .send({
      from: accounts[0],
    });
};

lowBalance = async (data) => {
  const accounts = await web3.eth.getAccounts();
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = OfferingContract.networks[networkId];
  const contract = new web3.eth.Contract(
    OfferingContract.abi,
    deployedNetwork && deployedNetwork.address
  );

  await contract.methods.lowBalance(data.id, data.phoneHash).send({
    from: accounts[0],
  });
};

acceptance = async (data) => {
  const accounts = await web3.eth.getAccounts();
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = OfferingContract.networks[networkId];
  const contract = new web3.eth.Contract(
    OfferingContract.abi,
    deployedNetwork && deployedNetwork.address
  );
  await contract.methods
    .acceptance(data.id, data.phoneHash, data.offerId, data.proposalId)
    .send({
      from: accounts[0],
    });
};

topUp = async (data) => {
  const accounts = await web3.eth.getAccounts();
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = OfferingContract.networks[networkId];
  const contract = new web3.eth.Contract(
    OfferingContract.abi,
    deployedNetwork && deployedNetwork.address
  );
  await contract.methods
    .topUp(data.id, data.phoneHash, data.productId, data.amount)
    .send({
      from: accounts[0],
    });
};

app.post("/addPackage", function (req, res) {
  LOG_LEVEL > 0 && console.log("### addPackage");
  this.addPackage(req.body);
  res.end(
    JSON.stringify({
      result: "OK",
    })
  );
});

app.post("/lowBalance", function (req, res) {
  LOG_LEVEL > 0 && console.log("### lowBalance");
  LOG_LEVEL > 0 && console.log(req.body);
  this.lowBalance(req.body);
  res.end(
    JSON.stringify({
      result: "OK",
    })
  );
});

app.post("/acceptance", function (req, res) {
  LOG_LEVEL > 0 && console.log("### acceptance");
  LOG_LEVEL > 0 && console.log(req.body);
  this.acceptance(req.body);
  res.end(
    JSON.stringify({
      result: "OK",
    })
  );
});

app.post("/topUp", function (req, res) {
  LOG_LEVEL > 0 && console.log("### topUp");
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
