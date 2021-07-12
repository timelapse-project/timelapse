/*
 *    Title: Alyra Project - Timelapse - Watcher
 *    Description: This script manage the emitted events from the blockchain and send back to the Telecom Operator
 */
var Request = require("request");
const { web3 } = require("./getWeb3");
const OfferingContract = require("../client/src/contracts/Offering.json");

let LOG_LEVEL = 1;
let WS_SERVER = "http://httpbin.org/post";
let contract = null;
let proposalsCount = 0;
let proposalList = [];

runInit = async () => {
  //const accounts = await web3.eth.getAccounts();
  // console.log("Account: " + accounts[0]);
  // console.log("Account: " + accounts);

  const networkId = await web3.eth.net.getId();
  const deployedNetwork = OfferingContract.networks[networkId];
  contract = new web3.eth.Contract(
    OfferingContract.abi,
    deployedNetwork && deployedNetwork.address
  );

  contract.events
    .allEvents()
    .on("data", (event) => doWhenEvent(event))
    .on("error", console.error);

  getProposals();

  console.log("Watcher started...");
};

doWhenEvent = async (data) => {
  //console.log("==> doWhenEvent", data.event);

  switch (data.event) {
    case "ProposalAdded":
      addProposal(data.returnValues);
      break;
    case "LowBalanceReceived":
      LOG_LEVEL > 1 &&
        console.log(
          "==> Event LowBalanceReceived [" +
            data.returnValues.phoneHash +
            "][" +
            data.returnValues.ref +
            "]"
        );
      break;
    case "OfferSent":
      LOG_LEVEL > 1 &&
        console.log(
          "==> Event OfferSent [" +
            data.returnValues.id +
            "][" +
            data.returnValues.phoneHash +
            "][" +
            data.returnValues.timestamp +
            "][" +
            data.returnValues.reason +
            "][" +
            data.returnValues.proposals +
            "][" +
            data.returnValues.scoring +
            "]"
        );
      sendOffer(data.returnValues);
      break;
    case "AcceptanceReceived":
      LOG_LEVEL > 1 &&
        console.log(
          "==> Event AcceptanceReceived [" +
            data.returnValues.id +
            "][" +
            data.returnValues.phoneHash +
            "][" +
            data.returnValues.offerId +
            "][" +
            data.returnValues.phoneHash +
            "]"
        );
      break;
    case "ConfirmationSent":
      LOG_LEVEL > 1 &&
        console.log(
          "==> Event ConfirmationSent [" +
            data.returnValues.id +
            "][" +
            data.returnValues.offerId +
            "][" +
            data.returnValues.phoneHash +
            "][" +
            data.returnValues.timestamp +
            "]"
        );
      sendConfirmation(data.returnValues);
      break;
    case "TopUpReceived":
      LOG_LEVEL > 1 &&
        console.log(
          "==> Event TopUpReceived [" +
            data.returnValues.id +
            "][" +
            data.returnValues.phoneHash +
            "][" +
            data.returnValues.productId +
            "][" +
            data.returnValues.amount +
            "]"
        );
      break;
    case "AcknowledgeSent":
      LOG_LEVEL > 1 &&
        console.log(
          "==> Event AcknowledgeSent [" +
            data.returnValues.id +
            "][" +
            data.returnValues.phoneHash +
            "][" +
            data.returnValues.productId +
            "][" +
            data.returnValues.amount +
            "]"
        );
      sendAcknowledge(data.returnValues);
      break;
    default:
      console.log("Event not managed", data.event);
  }
};

getProposals = async () => {
  LOG_LEVEL > 0 && console.log("### getProposals");

  proposalsCount = await contract.methods.proposalsCount().call();

  proposalList = [];
  for (let proposalId = 0; proposalId < proposalsCount; proposalId++) {
    let proposalItem = await contract.methods.proposals(proposalId).call();
    proposalItem["id"] = proposalId;
    proposalList.push(proposalItem);
  }
};

addProposal = async (data) => {
  LOG_LEVEL > 0 && console.log("<-- addProposal");

  let proposalItem = [];
  proposalItem.id = parseInt(data.proposalId);
  proposalItem.minScoring = data.minScoring;
  proposalItem.capital = data.capital;
  proposalItem.interest = data.interest;
  proposalItem.description = data.description;

  proposalList.push(proposalItem);

  proposalsCount++;
};

sendOffer = async (data) => {
  LOG_LEVEL > 0 && console.log("<-- sendOffer");
  var responseBody = {
    type: 1,
    phoneHash: data.phoneHash,
    offerId: parseInt(data.offerId),
    timeStamp: data.timestamp,
    proposals: [],
  };
  switch (data.reason) {
    // case "0":
    //   responseBody["reason"] = "None";
    //   break;
    case "1":
      responseBody["reason"] = "UnknowUser";
      break;
    case "2":
      responseBody["reason"] = "LowUser";
      break;
    case "3":
      responseBody["reason"] = "DoubleSpent";
      break;
    case "4":
      responseBody["reason"] = "Other";
      break;
    // default:
    //   responseBody["reason"] = "None";
  }
  let proposalsCount = 0;
  for (let i = 0; i < data.proposals.length; i++) {
    if (data.proposals[i] != 0) {
      let proposal = {
        id: proposalList[data.proposals[i]]["id"],
        description: proposalList[data.proposals[i]]["description"],
      };
      responseBody["proposals"].push(proposal);
      proposalsCount++;
    }
  }
  responseBody["proposalsCount"] = proposalsCount;

  LOG_LEVEL > 0 && console.log(responseBody);

  Request.post(
    {
      headers: { "content-type": "application/json" },
      url: WS_SERVER,
      body: JSON.stringify(responseBody),
    },
    (error, response, body) => {
      if (error) {
        console.log("WS KO");
        return console.dir(error);
      }
    }
  );
};

sendConfirmation = async (data) => {
  LOG_LEVEL > 0 && console.log("<-- sendConfirmation");
  var responseBody = {
    type: 3,
    phoneHash: data.phoneHash,
    productId: parseInt(data.productId),
    offerId: parseInt(data.offerId),
    timestamp: data.timestamp,
  };

  LOG_LEVEL > 0 && console.log(responseBody);

  Request.post(
    {
      headers: { "content-type": "application/json" },
      url: WS_SERVER,
      body: JSON.stringify(responseBody),
    },
    (error, response, body) => {
      if (error) {
        console.log("WS KO");
        return console.dir(error);
      }
    }
  );
};

sendAcknowledge = async (data) => {
  LOG_LEVEL > 0 && console.log("<-- sendAcknowledge");
  var responseBody = {
    type: 5,
    phoneHash: data.phoneHash,
    productId: data.productId,
    amount: parseInt(data.amount),
  };

  LOG_LEVEL > 0 && console.log(responseBody);

  Request.post(
    {
      headers: { "content-type": "application/json" },
      url: WS_SERVER,
      body: JSON.stringify(responseBody),
    },
    (error, response, body) => {
      if (error) {
        console.log("WS KO");
        return console.dir(error);
      }
    }
  );
};

runInit();
