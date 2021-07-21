import React, { Component } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker.js";

class Invoicing extends Component {
  state = {
    web3: null,
    accounts: null,
    timelapseInstance: null,
    startDate: null,
    endDate: null,
    generatedInvoicing: null,
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

    var date = new Date();
    var startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    var endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    this.setState({
      startDate: startDate,
      endDate: endDate,
    })
  };

  handeStartDateChange(date) {
    console.log("==> handeStartDateChange");

    this.setState({
      startDate: date,
    })
  }

  handeEndDateChange(date) {
    console.log("==> handeEndDateChange");

    this.setState({
      endDate: date,
    })
  }

  handleGenerateInvoicing = async () => {
    console.log("==> handleGenerateInvoicing");
    const { timelapseInstance, startDate, endDate } = this.state;

    let generatedInvoicing = await timelapseInstance.methods.generateInvoicing((parseInt(startDate.getTime()/1000)), (parseInt(endDate.getTime()/1000))).call();
    
    console.log("generatedInvoicing", generatedInvoicing);

    this.setState({
      generatedInvoicing: generatedInvoicing,
    })
  }

  renderInvoicingInfo() {
    console.log("==> renderCustomerCareInfo");
    return (
      <React.Fragment>
        <br></br>
        <div className="row">
          <div className="col-sm-12">
          <div className="card text-center bg-info text-white">
              <div className="card-header">
                <strong>Invoicing</strong>
              </div>
              <div className="card-body">
                <div className="row">
                  <p>Generate invoicing for a given period.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderInvoicingCriteria() {
    console.log("==> renderInvoicingCriteria");
    const {
      startDate,
      endDate,
    } = this.state;
 
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
                <label htmlFor="phoneHash" className="col-sm-2 offset-sm-3 col-form-label">Period:</label>
                  <div className="col-sm-2">
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => this.handeStartDateChange(date)}
                    dateFormat="MMMM d, yyyy"
                  />
                  <small id="startDateHelp" className="form-text text-muted">Start Date</small>
                  </div>
                  <div className="col-sm-2">
                  <DatePicker 
                    selected={endDate}
                    showTimeSelect
                    onChange={(date) => this.handeEndDateChange(date)}
                    dateFormat="MMMM d, yyyy"
                  />
                  <small id="endDateHelp" className="form-text text-muted">End Date</small>
                  </div>
                </div>
                <br></br>
                <div className="form-group row">
                  <div className="col-sm-2 offset-sm-5">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={this.handleGenerateInvoicing}
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

  renderInvoicingResult() {
    console.log("==> renderProposals");
    const { generatedInvoicing } = this.state;
    return (
      <React.Fragment>
        <br></br>
        <div className="row">
          <div className="col-sm-12">
            <div className="card text-center">
              <div className="card-header">
                <strong>Invoicing details</strong>
              </div>
              {generatedInvoicing != null && generatedInvoicing.length > 0 ? (
                <div className="card-body">
                  <div className="row">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th scope="col">Capital</th>
                          <th scope="col">Interests</th>
                          <th scope="col">To provider</th>
                          <th scope="col">To supplier</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedInvoicing !== null &&
                          generatedInvoicing.map((row, index) => (
                            <tr>
                              <td>{parseFloat(row["totalCapital"] / 100).toFixed(2)} $</td>
                              <td>{parseFloat(row["totalInterest"] / 100).toFixed(2)} $</td>

                              <td>{parseFloat((parseInt(row["totalCapital"]) + (parseInt(row["totalInterest"]) * 60 / 100))/ 100).toFixed(2)} $</td>
                              <td>{parseFloat(((parseInt(row["totalInterest"]) * 40 / 100))/ 100).toFixed(2)} $</td>
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
          {this.renderInvoicingInfo()}
          {this.renderInvoicingCriteria()}
          {this.renderInvoicingResult()}
        </div>
      </div>
    );
  }
}

export default Invoicing;
