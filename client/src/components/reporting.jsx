import React, { Component } from "react";

class Reporting extends Component {
  state = {
    web3: null,
    accounts: null,
    timelapseInstance: null,
    proposalsCount: null,
    proposalList: null,
    proposalDescriptionError: null,
  };

  componentWillMount = async () => {
    console.log("==> componentWillMount");
    const web3 = this.props.web3;
    const accounts = this.props.accounts;
    const timelapseInstance = this.props.timelapseInstance;

    this.setState({ web3, accounts, timelapseInstance }, this.runInit);
  };

  runInit = async () => {
    console.log("==> runInit");
  };

  renderReportingInfo() {
    console.log("==> renderCustomerCareInfo");
    return (
      <React.Fragment>
        <br></br>
        <div className="row">
          <div className="col-sm-12">
            <div className="card text-center">
              <div className="card-header">
                <strong>Reporting</strong>
              </div>
              <div className="card-body">
                <div className="row">
                  <p>Under construction...</p>
                </div>
                <div className="row">
                  <div className="col-sm-12">
                    <img
                      src="https://4.bp.blogspot.com/-ieqvOMFsRlc/VzdghEH3kZI/AAAAAAAACns/eyr_Q7rgb_Yh0ZDEt7lsSmQUb1OduC0jgCLcB/s1600/work%2Bin%2Bprogress.png"
                      width="200"
                      className="img-responsive"
                      alt=""
                    />
                  </div>
                </div>
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
        <div className="col-12 text-center">{this.renderReportingInfo()}</div>
      </div>
    );
  }
}

export default Reporting;
