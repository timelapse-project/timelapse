/*
 *    Title: Alyra Project - Timelapse - Watcher
 *    Description: This script manage the emitted events from the blockchain and send back to the Telecom Operator
 */
var Request = require("request");
const { web3 } = require("./getWeb3");
const TimelapseContract = require("../client/src/contracts/Timelapse.json");

let LOG_LEVEL = 1;
let WS_SERVER = "http://httpbin.org/post";
let contract = null;
let proposalsCount = 0;
let proposalList = [];

runInit = async () => {
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = TimelapseContract.networks[networkId];
  contract = new web3.eth.Contract(
    TimelapseContract.abi,
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
  LOG_LEVEL > 1 &&
    console.log(
      "==> doWhenEvent - ",
      data.event + " - " + JSON.stringify(data.returnValues)
    );

  switch (data.event) {
    case "ProposalAdded":
      addProposal(data.returnValues);
      break;
    case "LowBalanceReceived":
      break;
    case "OfferSent":
      sendOffer(data.returnValues);
      break;
    case "AcceptanceReceived":
      break;
    case "Confirmation":
      sendConfirmation(data.returnValues);
      break;
    case "TopUpReceived":
      break;
    case "Acknowledge":
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

  LOG_LEVEL > 1 && console.log("proposalList", JSON.stringify(proposalList));
};

addProposal = async (data) => {
  LOG_LEVEL > 0 && console.log("<-- addProposal");

  let proposalItem = [];
  proposalItem.id = parseInt(data.idProposal);
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
    offerId: parseInt(data.idOffer),
    timeStamp: data.timestamp,
    proposals: [],
  };
  switch (data.reason) {
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
    productId: parseInt(data.idProduct),
    timestamp: data.acceptanceTimestamp,
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
