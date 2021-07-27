import React, { Component } from "react";
import { Link } from "react-router-dom";

class Home extends Component {
  state = {
    web3: null,
    accounts: null,
    timelapseInstance: null,
    proposalsCount: null,
    proposalList: null,
    proposalDescriptionError: null,
  };

  componentDidMount = async () => {
    console.log("==> componentDidMount");
    const web3 = this.props.web3;
    const accounts = this.props.accounts;
    const timelapseInstance = this.props.timelapseInstance;
    this.setState({ web3, accounts, timelapseInstance }, this.runInit);
  };

  runInit = async () => {
    console.log("==> runInit");
  };

  renderDappInfo() {
    console.log("==> renderDappInfo");
    return (
      <React.Fragment>
        <br></br>
        <div className="row">
          <div className="col-sm-12">
            <div className="card text-center bg-info text-white">
              <div className="card-header">
                <strong>Timelapse dApp Information</strong>
              </div>
              <div className="card-body">
                <div className="row">
                  <p>Welcome to Timelapse !</p>
                </div>
                <div className="row">
                  <div className="col-sm-12">
                    <img
                      src="/images/timelapse_logo100.png"
                      width="100"
                      height="100"
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

  renderCustomerActions() {
    console.log("==> renderCustomerActions");
    return (
      <React.Fragment>
        <br></br>
        <div className="row">
          <div className="col-sm-12">
            <div className="card text-center">
              <div className="card-header">
                <strong>Customer Actions</strong>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-sm-3">
                    <Link className="nav-link" to="/customers">
                      <button type="button" className="btn btn-outline-primary">
                        Customer Care
                      </button>
                    </Link>
                  </div>
                  <div className="col-sm-3">
                    <Link className="nav-link" to="/reporting">
                      <button type="button" className="btn btn-outline-primary">
                        Reporting
                      </button>
                    </Link>
                  </div>
                  <div className="col-sm-3">
                    <Link className="nav-link" to="/invoicing">
                      <button type="button" className="btn btn-outline-primary">
                        Invoicing
                      </button>
                    </Link>
                  </div>
                  <div className="col-sm-3">
                    <Link className="nav-link" to="/proposals">
                      <button type="button" className="btn btn-outline-primary">
                        Proposal Mgt
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderToolboxActions() {
    console.log("==> renderToolboxActions");
    return (
      <React.Fragment>
        <br></br>
        <div className="row">
          <div className="col-sm-12">
            <div className="card text-center">
              <div className="card-header">
                <strong>Toolbox</strong>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-sm-4 offset-sm-4">
                    <Link className="nav-link" to="/events">
                      <button type="button" className="btn btn-outline-primary">
                        Events listener
                      </button>
                    </Link>
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
        <div className="col-12 text-center">{this.renderDappInfo()}</div>
        <div className="col-12 text-center">{this.renderCustomerActions()}</div>
        <div className="col-12 text-center">{this.renderToolboxActions()}</div>
      </div>
    );
  }
}

export default Home;
