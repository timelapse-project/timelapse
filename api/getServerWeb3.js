const Web3 = require("web3");
const net = require("net");
const os = require("os");
require("dotenv").config({ path: __dirname + "/../.env" });
const HDWalletProvider = require("@truffle/hdwallet-provider");

let web3;

if (typeof web3 === "undefined") {
  console.log("Initializing Web3 instance...");
  if (process.env.GETH_IPC_PATH != null && process.env.GETH_IPC_PATH !== "") {
    new Web3.providers.IpcProvider(process.env.GETH_IPC_PATH, net);
    console.log("WEB3 (GETH_IPC_PATH) loaded");
  } else if (
    process.env.INFURA_API_KEY != null &&
    process.env.INFURA_API_KEY !== ""
  ) {
    web3 = new Web3(
      new HDWalletProvider(
        process.env.MNEMONIC,
        `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`
      )
    );
    console.log("WEB3 (INFURA_API_KEY) loaded");
  } else if (
    process.env.GETH_IPC_WS != null &&
    process.env.GETH_IPC_WS !== ""
  ) {
    web3 = new Web3(
      new Web3.providers.WebsocketProvider(process.env.GETH_IPC_WS)
    );
    console.log("WEB3 (GETH_IPC_WS) loaded");
  } else if (
    process.env.GETH_IPC_URL != null &&
    process.env.GETH_IPC_URL !== ""
  ) {
    web3 = new Web3(new Web3.providers.HttpProvider(process.env.GETH_IPC_URL));
    console.log("WEB3 (GETH_IPC_URL) loaded");
  }

  // Extend web3js with the txpool RPC methods
  web3.eth.extend({
    property: "txpool",
    methods: [
      {
        name: "content",
        call: "txpool_content",
      },
      {
        name: "inspect",
        call: "txpool_inspect",
      },
      {
        name: "status",
        call: "txpool_status",
      },
    ],
  });
}

exports.web3 = web3;
