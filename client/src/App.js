import React, { Component } from "react";
import OfferingContract from "./contracts/Offering.json";
import getWeb3 from "./getWeb3";

import "./App.css";
import NavBar from "./components/navbar";

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
    contractOwner: null,
    proposalsCount: null,
    proposalList: null,
    eventLog: [],
    proposalDescriptionError: null,
  };

  componentWillMount = async () => {
    console.log("==> componentWillMount");
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = OfferingContract.networks[networkId];
      const instance = new web3.eth.Contract(
        OfferingContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Subscribe to events
      // instance.events
      //   .ValueSet()
      //   .on("data", (event) => this.doWhenEvent(event))
      //   .on("error", console.error);

      // Set a timer to refresh the page every 10 seconds
      this.updateTimer = setInterval(() => this.runInit(), 10000);

      instance.events
        .allEvents()
        .on("data", (event) => this.doWhenEvent(event))
        .on("error", console.error);

      // instance.events
      //   .LowBalanceReceived()
      //   .on("data", (event) => this.doWhenEvent(event))
      //   .on("error", console.error);
      // instance.events
      //   .AcceptanceReceived()
      //   .on("data", (event) => this.doWhenEvent(event))
      //   .on("error", console.error);
      // instance.events
      //   .TopUpReceived()
      //   .on("data", (event) => this.doWhenEvent(event))
      //   .on("error", console.error);
      // instance.events
      //   .OfferSent()
      //   .on("data", (event) => this.doWhenEvent(event))
      //   .on("error", console.error);
      // instance.events
      //   .ConfirmationSent()
      //   .on("data", (event) => this.doWhenEvent(event))
      //   .on("error", console.error);
      // instance.events
      //   .AcknowledgeSent()
      //   .on("data", (event) => this.doWhenEvent(event))
      //   .on("error", console.error);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runInit);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  addEventLog(log) {
    console.log("==> addEventLog");
    const { eventLog } = this.state;

    //var eventLog = []; // empty array
    // object literal notation to create your structures

    let date = new Date();
    let formatedTimestamp =
      date.getDate() +
      "/" +
      (date.getMonth() + 1) +
      "/" +
      date.getFullYear() +
      " " +
      date.getHours() +
      ":" +
      date.getMinutes() +
      ":" +
      date.getSeconds();

    eventLog.push({ timestamp: formatedTimestamp, log: log });

    this.setState({ eventLog: eventLog });
  }

  runInit = async () => {
    console.log("==> runInit");

    const { contract } = this.state;
    const contractOwner = await contract.methods.owner().call();
    const proposalsCount = await contract.methods.proposalsCount().call();

    let proposalList = [];
    for (let proposalId = 1; proposalId < proposalsCount; proposalId++) {
      let proposalItem = await contract.methods.proposals(proposalId).call();
      //proposalItem["id"] = proposalId;
      console.log("proposal", proposalItem);
      proposalList.push(proposalItem);
    }

    //const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    //await contract.methods.set(8).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    //const response = await contract.methods.get().call();

    // Update state with the result.
    //this.setState({ storageValue: response });

    //this.addEventLog("Initializing Dapp...");
    //this.addEventLog("Test log 2");

    this.setState({
      contractOwner: contractOwner,
      proposalsCount: proposalsCount,
      proposalList: proposalList,
      proposalDescriptionError: null,
    });
  };

  doWhenEvent = async (data) => {
    //console.log("==> doWhenEvent", data.event);

    switch (data.event) {
      case "LowBalanceReceived":
        this.addEventLog(
          "Event LowBalanceReceived [" +
            data.returnValues.phoneHash +
            "][" +
            data.returnValues.ref +
            "]"
        );
        break;
      case "OfferSent":
        this.addEventLog(
          "Event OfferSent [" +
            data.returnValues.offerId +
            "][" +
            data.returnValues.phoneHash +
            "][" +
            data.returnValues.timestamp +
            "][" +
            data.returnValues.reason +
            "][" +
            data.returnValues.proposals +
            "]"
        );
        break;
      case "AcceptanceReceived":
        this.addEventLog(
          "Event AcceptanceReceived [" +
            data.returnValues.phoneHash +
            "][" +
            data.returnValues.offerId +
            "][" +
            data.returnValues.proposalId +
            "]"
        );
        break;
      case "ConfirmationSent":
        this.addEventLog(
          "Event ConfirmationSent [" +
            data.returnValues.productId +
            "][" +
            data.returnValues.offerId +
            "][" +
            data.returnValues.phoneHash +
            "][" +
            data.returnValues.timestamp +
            "]"
        );
        break;
      case "TopUpReceived":
        this.addEventLog(
          "Event TopUpReceived [" +
            data.returnValues.phoneHash +
            "][" +
            data.returnValues.productId +
            "][" +
            data.returnValues.amount +
            "]"
        );
        break;
      case "AcknowledgeSent":
        this.addEventLog(
          "Event AcknowledgeSent [" +
            data.returnValues.phoneHash +
            "][" +
            data.returnValues.productId +
            "][" +
            data.returnValues.amount +
            "]"
        );
        break;
      default:
        console.log("Event not managed");
    }
  };

  getPastEvents = async () => {
    console.log("handleAddProposal");
    const { contract } = this.state;
    contract
      .getPastEvents("allEvents", {
        fromBlock: 0,
        toBlock: "latest", // You can also specify 'latest'
      })
      .then((events) => console.log(events))
      .catch((err) => console.error(err));
  };

  handleAddProposal = async () => {
    console.log("handleAddProposal");
    const { accounts, contract } = this.state;
    const proposalMinScoring = this.proposalMinScoring.value;
    const proposalDescription = this.proposalDescription.value;

    if (proposalDescription == null || proposalDescription === "") {
      this.setState({
        proposalDescriptionError: "Please, enter a description",
      });
      return;
    }
    await contract.methods
      .addProposal(proposalMinScoring, proposalDescription)
      .send({
        from: accounts[0],
      });
    this.runInit();
  };

  renderDappInfo() {
    console.log("==> renderStakingInfo");
    return (
      <React.Fragment>
        <br></br>
        <div className="row">
          <div className="col-sm-12">
            <div className="card text-center bg-info text-white">
              <div className="card-header">
                <strong>Timelapse0 Dapp Information</strong>
              </div>
              <div className="card-body">
                <div className="row">
                  <p>Manage Contracts and see Event Logs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderProposalAdmin() {
    console.log("==> renderProposals");
    const { proposalsCount, proposalList } =
      this.state;
    return (
      <React.Fragment>
        <br></br>
        <div className="row">
          <div className="col-sm-12">
            <div className="card text-center">
              <div className="card-header">
                <strong>Proposals</strong>
              </div>
              {proposalsCount > 0 ? (
                <div className="card-body">
                  <div className="row">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th scope="col">Min Scoring</th>
                          <th scope="col">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proposalList !== null &&
                          proposalList.map((a) => (
                            <tr>
                              <td>{a["minScoring"]}</td>
                              <td>{a["description"]}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="card-body">
                  <p>No Proposal</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderEventLogs() {
    console.log("==> renderStakingStatus");
    const { eventLog } = this.state;
    return (
      <React.Fragment>
        <br></br>
        <div className="row">
          <div className="col-sm-12">
            <div className="card text-center">
              <div className="card-header">
                <strong>Real Time Event Logs</strong>
              </div>
              <div className="card-body">
                <pre>
                  <code>
                    {eventLog.map((item) => (
                      <div className="row bg-dark text-white">
                        <div className="col-sm-2 text-left">
                          [{item.timestamp}]
                        </div>
                        <div className="col-sm-10 text-left">{item.log}</div>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  render() {
    console.log("==> render");
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <React.Fragment>
        <NavBar
          contractOwner={this.state.contractOwner}
          userAccount={this.state.accounts[0]}
        />
        <main className="container">
          <div className="row">
            <div className="col-8 offset-2 text-center">
              {this.renderDappInfo()}
            </div>
          </div>

          <div className="row">
            <div className="col-8 offset-2 text-center">
              {this.renderProposalAdmin()}
            </div>
          </div>
          <div className="row">
            <div className="col-12 text-center">{this.renderEventLogs()}</div>
          </div>
        </main>
      </React.Fragment>
    );
  }
}

export default App;
