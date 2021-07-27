/*
 *    Title: Alyra Project - Timelapse - Watcher
 *    Description: This script manage the emitted events from the blockchain and send back to the Telecom Operator
 */
var Request = require("request");
const { web3 } = require("./getWatcherWeb3");
const TimelapseContract = require("../client/src/contracts/Timelapse.json");
const BillingContract = require("../client/src/contracts/Billing.json");
const OfferingContract = require("../client/src/contracts/Offering.json");

var LOG_LEVEL = 1;
var WS_SERVER = "http://httpbin.org/post";
var timelapseInstance = null;
var billingInstance = null;
var proposalsCount = 0;
var proposalList = [];

/**
 * @notice Initialize application
 */
runInit = async () => {
  const networkId = await web3.eth.net.getId();
  const timelapseNetwork = TimelapseContract.networks[networkId];
  const billingNetwork = BillingContract.networks[networkId];
  const offeringNetwork = OfferingContract.networks[networkId];

  timelapseInstance = new web3.eth.Contract(
    TimelapseContract.abi,
    timelapseNetwork && timelapseNetwork.address
  );

  billingInstance = new web3.eth.Contract(
    BillingContract.abi,
    billingNetwork && billingNetwork.address
  );

  offeringInstance = new web3.eth.Contract(
    OfferingContract.abi,
    offeringNetwork && offeringNetwork.address
  );

  timelapseInstance.events
    .allEvents()
    .on("data", (event) => doWhenEvent(event))
    .on("error", console.error);

  billingInstance.events
    .allEvents()
    .on("data", (event) => doWhenEvent(event))
    .on("error", console.error);

  offeringInstance.events
    .allEvents()
    .on("data", (event) => doWhenEvent(event))
    .on("error", console.error);

  getProposals();

  console.log("Watcher started...");
};

/**
 * @notice Manage emitted events
 * @param _data The content of the rest request
 * @dev Send a request to BlockChain in order to manage a topUp using `_data` content
 */
doWhenEvent = async (data) => {
  LOG_LEVEL > 1 &&
    console.log(
      "==> doWhenEvent - ",
      data.event + " - " + JSON.stringify(data.returnValues)
    );

  switch (data.event) {
    case "ProposalAdded":
      getProposal(data.returnValues);
      break;
    case "LowBalanceReceived":
      break;
    case "OfferSent":
      sendOffer(data.returnValues);
      break;
    case "AcceptanceReceived":
      break;
    case "ConfirmationSent":
      sendConfirmation(data.returnValues);
      break;
    case "TopUpReceived":
      break;
    case "AcknowledgeSent":
      sendAcknowledge(data.returnValues);
      break;
    default:
      LOG_LEVEL > 1 && console.log("Event not managed", data.event);
  }
};

/**
 * @notice Get all the proposals
 */
getProposals = async () => {
  LOG_LEVEL > 0 && console.log("### getProposals");

  proposalsCount = await offeringInstance.methods.proposalsCount().call();

  proposalList = [];
  for (let proposalId = 0; proposalId < proposalsCount; proposalId++) {
    let proposalItem = await offeringInstance.methods
      .proposals(proposalId)
      .call();
    proposalItem["id"] = proposalId;
    proposalList.push(proposalItem);
  }

  LOG_LEVEL > 1 && console.log("proposalList", JSON.stringify(proposalList));
};

/**
 * @notice Get a proposal
 * @param _data The content of the rest request
 * @dev Get a proposal and add it to the proposal list using `_data` content
 */
getProposal = async (data) => {
  LOG_LEVEL > 0 && console.log("<-- getProposal");

  let proposalItem = [];
  proposalItem.id = parseInt(data.proposalId);
  proposalItem.minScoring = data.minScoring;
  proposalItem.capital = data.capital;
  proposalItem.interest = data.interest;
  proposalItem.description = data.description;

  proposalList.push(proposalItem);

  proposalsCount++;
};

/**
 * @notice Send Offer to Telecom Operator
 * @param _data The content of the rest request
 * @dev Send Offer to Telecom Operator using `_data` content
 */
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
    let proposal = {
      id: proposalList[data.proposals[i]]["id"],
      description: proposalList[data.proposals[i]]["description"],
    };
    responseBody["proposals"].push(proposal);
    proposalsCount++;
  }
  responseBody["proposalsCount"] = proposalsCount;
  if (proposalsCount === 0) {
    return;
  }
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

/**
 * @notice Send Confirmation to Telecom Operator
 * @param _data The content of the rest request
 * @dev Send COnfirmation to Telecom Operator using `_data` content
 */
sendConfirmation = async (data) => {
  LOG_LEVEL > 0 && console.log("<-- sendConfirmation");
  var responseBody = {
    type: 3,
    phoneHash: data.phoneHash,
    productId: parseInt(data.productId),
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

/**
 * @notice Send Acknowledge to Telecom Operator
 * @param _data The content of the rest request
 * @dev Send Acknowledge to Telecom Operator using `_data` content
 */
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
