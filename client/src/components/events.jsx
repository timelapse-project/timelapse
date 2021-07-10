import React, { Component } from "react";

class Events extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
    eventLog: [],
  };

  componentWillMount = async () => {
    console.log("==> componentWillMount");
    const web3 = this.props.web3;
    const accounts = this.props.accounts;
    const contract = this.props.contract;

    contract.events
      .allEvents()
      .on("data", (event) => this.doWhenEvent(event))
      .on("error", console.error);

    this.setState({ web3, accounts, contract }, this.runInit);
  };

  runInit = async () => {
    console.log("==> runInit");
  };

  addEventLog(log) {
    console.log("==> addEventLog");
    const { eventLog } = this.state;

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

  doWhenEvent = async (data) => {
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
        toBlock: "latest",
      })
      .then((events) => console.log(events))
      .catch((err) => console.error(err));
  };

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
    return (
      <div className="container">
        <div className="col-12 text-center">{this.renderEventLogs()}</div>
      </div>
    );
  }
}

export default Events;
