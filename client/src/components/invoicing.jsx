import React, { Component } from "react";

class Invoicing extends Component {
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

    this.setState({ web3, accounts, contract }, this.runInit);
  };

  runInit = async () => {
    console.log("==> runInit");
  };

  renderInvoicingInfo() {
    console.log("==> renderCustomerCareInfo");
    return (
      <React.Fragment>
        <br></br>
        <div className="row">
          <div className="col-sm-12">
            <div className="card text-center">
              <div className="card-header">
                <strong>Inovicing</strong>
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
        <div className="col-12 text-center">{this.renderInvoicingInfo()}</div>
      </div>
    );
  }
}

export default Invoicing;
