import React, { Component } from "react";

class Proposals extends Component {
  state = {
    web3: null,
    accounts: null,
    timelapseInstance: null,
    offeringInstance: null,
    proposalsCount: null,
    proposalList: null,
  };

  componentWillMount = async () => {
    console.log("==> componentWillMount");
    const web3 = this.props.web3;
    const accounts = this.props.accounts;
    const timelapseInstance = this.props.timelapseInstance;
    const offeringInstance = this.props.offeringInstance;

    timelapseInstance.events
      .allEvents()
      .on("data", (event) => this.doWhenEvent(event))
      .on("error", console.error);

    offeringInstance.events
      .allEvents()
      .on("data", (event) => this.doWhenEvent(event))
      .on("error", console.error);

    this.setState({ web3, accounts, timelapseInstance, offeringInstance }, this.runInit);
  };

  runInit = async () => {
    console.log("==> runInit");

    const { offeringInstance } = this.state;
    const proposalsCount = await offeringInstance.methods.proposalsCount().call();

    let proposalList = [];
    for (let proposalId = 0; proposalId < proposalsCount; proposalId++) {
      let proposalItem = await offeringInstance.methods.proposals(proposalId).call();
      proposalList.push(proposalItem);
    }

    this.setState({
      proposalsCount: proposalsCount,
      proposalList: proposalList,
      proposalMinScoringError: null,
      proposalCapitalError: null,
      proposalInterestError: null,
      proposalDescriptionError: null,
    });
  };

  doWhenEvent = async (data) => {
    switch (data.event) {
      case "ProposalAdded":
        this.runInit();
        break;
      default:
        console.log("Event not managed");
    }
  };

  handleAddProposal = async () => {
    console.log("handleAddProposal");
    const { accounts, timelapseInstance } = this.state;
    var proposalMinScoringError = null;
    var proposalCapitalError = null;
    var proposalInterestError = null;
    var proposalDescriptionError = null;

    var proposalMinScoring = this.proposalMinScoring.value;
    var proposalCapital = this.proposalCapital.value;
    var proposalInterest = this.proposalInterest.value;
    var proposalDescription = this.proposalDescription.value;

    if (proposalMinScoring == null || parseInt(proposalMinScoring) === 0) {
      proposalMinScoringError = "Please, enter a minimum scoring";
    }
    if (proposalCapital == null || proposalCapital === "") {
      proposalCapitalError = "Please, enter a capital value";
    } else if (isNaN(proposalCapital)) {
      proposalCapitalError = "Please, enter a numeric value";
    } else {
      proposalCapital = parseInt(parseFloat(proposalCapital).toFixed(2) * 100);
    }
    if (proposalInterest == null || proposalInterest === "") {
      proposalInterestError = "Please, enter an interest value";
    } else if (isNaN(proposalInterest)) {
      proposalInterestError = "Please, enter a numeric value";
    } else {
      proposalInterest = parseInt(
        parseFloat(proposalInterest).toFixed(2) * 100
      );
    }
    if (proposalDescription == null || proposalDescription === "") {
      proposalDescriptionError = "Please, enter a description";
    }
    if (
      proposalMinScoringError != null ||
      proposalCapitalError != null ||
      proposalInterestError != null ||
      proposalDescriptionError != null
    ) {
      this.setState({
        proposalMinScoringError: proposalMinScoringError,
        proposalCapitalError: proposalCapitalError,
        proposalInterestError: proposalInterestError,
        proposalDescriptionError: proposalDescriptionError,
      });
      return;
    }
    await timelapseInstance.methods
      .addProposal(
        proposalMinScoring,
        proposalCapital,
        proposalInterest,
        proposalDescription
      )
      .send({
        from: accounts[0],
      });
    this.proposalMinScoring.value = 0;
    this.proposalCapital.value = null;
    this.proposalInterest.value = null;
    this.proposalDescription.value = null;
    this.runInit();
  };

  handleCloseProposal = async (index) => {
    console.log("==> handleCloseProposal", index);
    const { accounts, timelapseInstance } = this.state;
    await timelapseInstance.methods.closeProposal(index).send({
      from: accounts[0],
    });
    this.runInit();
  };

  renderProposalAdd() {
    console.log("==> renderProposalAdd");
    const {
      proposalMinScoringError,
      proposalCapitalError,
      proposalInterestError,
      proposalDescriptionError,
    } = this.state;
    const proposalMinScoringOptions = [];
    proposalMinScoringOptions.push({
      value: 0,
      label: "Select Min Scoring",
    });
    for (let i = 1; i <= 250; i++) {
      let proposalMinScoringOption = {};
      proposalMinScoringOption["value"] = i;
      proposalMinScoringOption["label"] = i;
      proposalMinScoringOptions.push(proposalMinScoringOption);
    }

    return (
      <React.Fragment>
        <br></br>
        <div className="row">
          <div className="col-sm-12">
            <div className="card text-center">
              <div className="card-header">
                <strong>Add Proposal</strong>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-sm-2">
                    <select
                      ref={(input) => {
                        this.proposalMinScoring = input;
                      }}
                      className={
                        "form-select form-select-sm" +
                        (proposalMinScoringError == null ? "" : " is-invalid")
                      }
                    >
                      {proposalMinScoringOptions.map(
                        ({ value, label }, index) => (
                          <option value={value}>{label}</option>
                        )
                      )}
                    </select>
                    <div className="invalid-feedback">
                      {proposalMinScoringError}
                    </div>
                  </div>
                  <div className="col-sm-2">
                    <input
                      type="text"
                      id="proposalCapital"
                      className={
                        "form-control" +
                        (proposalCapitalError == null ? "" : " is-invalid")
                      }
                      ref={(input) => {
                        this.proposalCapital = input;
                      }}
                      placeholder="Capital"
                    ></input>
                    <div className="invalid-feedback">
                      {proposalCapitalError}
                    </div>
                  </div>
                  <div className="col-sm-2">
                    <input
                      type="text"
                      id="proposalInterest"
                      className={
                        "form-control" +
                        (proposalInterestError == null ? "" : " is-invalid")
                      }
                      ref={(input) => {
                        this.proposalInterest = input;
                      }}
                      placeholder="Interest"
                    ></input>
                    <div className="invalid-feedback">
                      {proposalInterestError}
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <input
                      type="text"
                      id="proposalDescription"
                      className={
                        "form-control" +
                        (proposalDescriptionError == null ? "" : " is-invalid")
                      }
                      ref={(input) => {
                        this.proposalDescription = input;
                      }}
                      placeholder="Description"
                    ></input>
                    <div className="invalid-feedback">
                      {proposalDescriptionError}
                    </div>
                  </div>

                  <div className="col-sm-2">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={this.handleAddProposal}
                    >
                      <b>Add</b>
                    </button>
                  </div>

                  <br></br>
                </div>
              </div>
            </div>
          </div>
        </div>
        <br></br>
      </React.Fragment>
    );
  }

  renderProposalList() {
    console.log("==> renderProposals");
    const { proposalsCount, proposalList } = this.state;
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
                          <th scope="col">Capital</th>
                          <th scope="col">Interest</th>
                          <th scope="col">Description</th>
                          <th scope="col">Status</th>
                          <th scope="col"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {proposalList !== null &&
                          proposalList.map((row, index) => (
                            <tr>
                              <td>{row["minScoring"]}</td>
                              <td>
                                {parseFloat(row["capital"] / 100).toFixed(2)} $
                              </td>
                              <td>
                                {parseFloat(row["interest"] / 100).toFixed(2)} $
                              </td>
                              <td>{row["description"]}</td>
                              <td>
                                {parseInt(row["status"]) === 0
                                  ? "Active"
                                  : "Closed"}
                              </td>
                              {parseInt(row["status"]) === 0 ? (
                                <td>
                                  <div className="col-sm-3 offset-1">
                                    <button
                                      type="button"
                                      className="btn btn-danger"
                                      onClick={() =>
                                        this.handleCloseProposal(index)
                                      }
                                    >
                                      <b>Close</b>
                                    </button>
                                  </div>
                                </td>
                              ) : (
                                <td>&nbsp;</td>
                              )}
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

  render() {
    return (
      <div className="container">
        <div className="col-12 text-center">{this.renderProposalAdd()}</div>
        <div className="col-12 text-center">{this.renderProposalList()}</div>
      </div>
    );
  }
}

export default Proposals;
