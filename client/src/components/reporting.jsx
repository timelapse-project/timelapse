import React, { Component } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker.js";

class Reporting extends Component {
  state = {
    web3: null,
    accounts: null,
    timelapseInstance: null,
    startDate: null,
    endDate: null,
    generatedReporting: null,
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
    var date = new Date();
    var startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    var endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.setState({
      startDate: startDate,
      endDate: endDate,
    });
  };

  handeStartDateChange(date) {
    console.log("==> handeStartDateChange");
    this.setState({
      startDate: date,
    });
  }

  handeEndDateChange(date) {
    console.log("==> handeEndDateChange");
    this.setState({
      endDate: date,
    });
  }

  handleGenerateReporting = async () => {
    console.log("==> handleGenerateReporting");
    const { timelapseInstance, startDate, endDate } = this.state;
    let generatedReporting = await timelapseInstance.methods
      .generateReporting(
        parseInt(startDate.getTime() / 1000),
        parseInt(endDate.getTime() / 1000)
      )
      .call();
    this.setState({
      generatedReporting: generatedReporting,
    });
  };

  renderReportingInfo() {
    console.log("==> renderCustomerCareInfo");
    return (
      <React.Fragment>
        <br></br>
        <div className="row">
          <div className="col-sm-12">
            <div className="card text-center bg-info text-white">
              <div className="card-header">
                <strong>Reporting</strong>
              </div>
              <div className="card-body">
                <div className="row">
                  <p>Generate reporting for a given period.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderReportingCriteria() {
    console.log("==> renderReportingCriteria");
    const { startDate, endDate } = this.state;
    return (
      <React.Fragment>
        <br></br>
        <div className="row">
          <div className="col-sm-12">
            <div className="card text-center">
              <div className="card-header">
                <strong>Criteria</strong>
              </div>
              <div className="card-body">
                <div className="form-group row">
                  <label
                    htmlFor="phoneHash"
                    className="col-sm-2 offset-sm-3 col-form-label"
                  >
                    Period:
                  </label>
                  <div className="col-sm-2">
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => this.handeStartDateChange(date)}
                      dateFormat="MMMM d, yyyy"
                    />
                    <small id="startDateHelp" className="form-text text-muted">
                      Start Date
                    </small>
                  </div>
                  <div className="col-sm-2">
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => this.handeEndDateChange(date)}
                      dateFormat="MMMM d, yyyy"
                    />
                    <small id="endDateHelp" className="form-text text-muted">
                      End Date
                    </small>
                  </div>
                </div>
                <br></br>
                <div className="form-group row">
                  <div className="col-sm-2 offset-sm-5">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={this.handleGenerateReporting}
                    >
                      <b>Generate</b>
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

  renderConvestionReportingResult() {
    console.log("==> renderConvestionReportingResult");
    const { generatedReporting } = this.state;
    return (
      <React.Fragment>
        <br></br>
        <div className="row">
          <div className="col-sm-12">
            <div className="card text-center">
              <div className="card-header">
                <strong>Conversion details</strong>
              </div>
              {generatedReporting != null && generatedReporting.length > 0 ? (
                <div className="card-body">
                  <div className="row">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th scope="col">Proposed offers</th>
                          <th scope="col">Accepted offers</th>
                          <th scope="col">% of conversions</th>
                          <th scope="col">Loans (Capital)</th>
                          <th scope="col">Loans (Interests)</th>
                          <th scope="col">Loans (Total)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedReporting !== null &&
                          generatedReporting.map((row, index) => (
                            <tr>
                              <td>{row["offersCount"]}</td>
                              <td>{row["acceptedOffersCount"]}</td>
                              <td>
                                {parseInt(row["offersCount"]) === 0
                                  ? "N/A"
                                  : parseFloat(
                                      (parseInt(row["acceptedOffersCount"]) /
                                        parseInt(row["offersCount"])) *
                                        100
                                    ).toFixed(2)}{" "}
                                %
                              </td>
                              <td>
                                {parseFloat(
                                  row["totalCapitalLoans"] / 100
                                ).toFixed(2)}{" "}
                                $
                              </td>
                              <td>
                                {parseFloat(
                                  row["totalInterestLoans"] / 100
                                ).toFixed(2)}{" "}
                                $
                              </td>
                              <td>
                                {parseFloat(
                                  (parseInt(row["totalCapitalLoans"]) +
                                    parseInt(row["totalInterestLoans"])) /
                                    100
                                ).toFixed(2)}{" "}
                                $
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="card-body">
                  <p>No Results</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderRepaymentReportingResult() {
    console.log("==> renderRepaymentReportingResult");
    const { generatedReporting } = this.state;
    return (
      <React.Fragment>
        <br></br>
        <div className="row">
          <div className="col-sm-12">
            <div className="card text-center">
              <div className="card-header">
                <strong>Repayment details</strong>
              </div>
              {generatedReporting != null && generatedReporting.length > 0 ? (
                <div className="card-body">
                  <div className="row">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th scope="col">Closed Topups</th>
                          <th scope="col">Gain (Capital)</th>
                          <th scope="col">Gain (Interests)</th>
                          <th scope="col">Gain (Total)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedReporting !== null &&
                          generatedReporting.map((row, index) => (
                            <tr>
                              <td>{row["closedTopupsCount"]}</td>
                              <td>
                                {parseFloat(
                                  row["totalCapitalGain"] / 100
                                ).toFixed(2)}{" "}
                                $
                              </td>
                              <td>
                                {parseFloat(
                                  row["totalInterestGain"] / 100
                                ).toFixed(2)}{" "}
                                $
                              </td>
                              <td>
                                {parseFloat(
                                  (parseInt(row["totalCapitalGain"]) +
                                    parseInt(row["totalInterestGain"])) /
                                    100
                                ).toFixed(2)}{" "}
                                $
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="card-body">
                  <p>No Results</p>
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
        <div className="col-12 text-center">
          {this.renderReportingInfo()}
          {this.renderReportingCriteria()}
          {this.renderConvestionReportingResult()}
          {this.renderRepaymentReportingResult()}
        </div>
      </div>
    );
  }
}

export default Reporting;
