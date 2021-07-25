import React, { Component } from "react";

class Events extends Component {
  state = {
    web3: null,
    accounts: null,
    timelapseInstance: null,
    offeringInstance: null,
    eventLog: [],
  };

  componentWillMount = async () => {
    console.log("==> componentWillMount");
    const web3 = this.props.web3;
    const accounts = this.props.accounts;
    const timelapseInstance = this.props.timelapseInstance;
    const offeringInstance = this.props.offeringInstance;
    const billingInstance = this.props.billingInstance;
    offeringInstance.events
      .allEvents()
      .on("data", (event) => this.doWhenEvent(event))
      .on("error", console.error);
    billingInstance.events
      .allEvents()
      .on("data", (event) => this.doWhenEvent(event))
      .on("error", console.error);
    this.setState(
      { web3, accounts, timelapseInstance, offeringInstance, billingInstance },
      this.runInit
    );
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

  formatJSONLog(JSONLog) {
    for (let i = 0; i < 10; i++) {
      delete JSONLog[i];
    }
    return JSON.stringify(JSONLog, null, 4);
  }

  doWhenEvent = async (data) => {
    console.log("==> doWhenEvent");
    switch (data.event) {
      case "LowBalanceReceived":
      case "OfferSent":
      case "AcceptanceReceived":
      case "ConfirmationSent":
      case "TopUpReceived":
      case "AcknowledgeSent":
        this.addEventLog(
          "### " + data.event + " ###\n" + this.formatJSONLog(data.returnValues)
        );
        break;
      default:
        console.log("Event not managed");
    }
  };

  getPastEvents = async () => {
    console.log("handleAddProposal");
    const { timelapseInstance } = this.state;
    timelapseInstance
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
            <div className="card">
              <div className="card-header text-center">
                <strong>Real Time Event Logs</strong>
              </div>
              <div className="card-body text-left">
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
        <div className="col-12">{this.renderEventLogs()}</div>
      </div>
    );
  }
}

export default Events;
