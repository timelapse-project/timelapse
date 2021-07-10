import React, { Component } from "react";

class Proposals extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
    proposalsCount: null,
    proposalList: null,
    proposalDescriptionError: null,
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

    const { contract } = this.state;
    const proposalsCount = await contract.methods.proposalsCount().call();

    let proposalList = [];
    for (let proposalId = 1; proposalId < proposalsCount; proposalId++) {
      let proposalItem = await contract.methods.proposals(proposalId).call();
      proposalList.push(proposalItem);
    }

    this.setState({
      proposalsCount: proposalsCount,
      proposalList: proposalList,
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

  renderProposalAdmin() {
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
                          <th scope="col">Description</th>
                          <th scope="col">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proposalList !== null &&
                          proposalList.map((a) => (
                            <tr>
                              <td>{a["minScoring"]}</td>
                              <td>{a["description"]}</td>
                              <td>
                                {parseInt(a["status"]) === 0
                                  ? "Actve"
                                  : "Closed"}
                              </td>
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
        <div className="col-12 text-center">{this.renderProposalAdmin()}</div>
      </div>
    );
  }
}

export default Proposals;
