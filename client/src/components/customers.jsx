import React, { Component } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker.js";

class Customers extends Component {
  state = {
    web3: null,
    accounts: null,
    timelapseInstance: null,
    startDate: null,
    endDate: null,
    customerActivities: null,
    phoneHashError: null,
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
      phoneHashError: null,
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

  handleSearchCustomerActivitiesLog = async () => {
    console.log("==> handleSearchCustomerActivitiesLog");
    const { timelapseInstance, startDate, endDate } = this.state;

    var phoneHashError = null;

    var phoneHash = this.phoneHash.value;

    if (phoneHash == null || phoneHash === "") {
      phoneHashError = "Please, enter a Phone Hash";
    } else if (!(/0[xX][0-9a-fA-F]{40}/.test(phoneHash))){
      phoneHashError = "Wrong Phone Hash format";
    }

    if (phoneHashError != null) {
      this.setState({
        phoneHashError: phoneHashError,
      });
      return;
    }

    let customerActivities = await timelapseInstance.methods.getCustomerActivitiesLog(phoneHash,(parseInt(startDate.getTime()/1000)), (parseInt(endDate.getTime()/1000))).call();
    console.log("Before sort", customerActivities);
    customerActivities = customerActivities.sort(function(x, y){
      return x.timestamp - y.timestamp;
    });
    console.log("After sort", customerActivities);

    for (let i = 0; i < customerActivities.length; i++)
    {
      customerActivities[i].time = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(new Date((customerActivities[i].timestamp)*1000));
    }

    this.setState({
      customerActivities: customerActivities,
      phoneHashError: phoneHashError,
    })
  }

  renderCustomerCareInfo() {
    console.log("==> renderCustomerCareInfo");
    return (
      <React.Fragment>
        <br></br>
        <div className="row">
          <div className="col-sm-12">
            <div className="card text-center bg-info text-white">
              <div className="card-header">
                <strong>Customer Care</strong>
              </div>
              <div className="card-body">
                <div className="row">
                  <p>Search the activities log for a customer in a given period.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderCustomerCareSearch() {
    console.log("==> renderCustomerCareSearch");
    const {
      startDate,
      endDate,
      phoneHashError,
    } = this.state;

    return (
      <React.Fragment>
        <br></br>
        <div className="row">
          <div className="col-sm-12">
            <div className="card text-center">
              <div className="card-header">
                <strong>Search criteria</strong>
              </div>
              <div className="card-body">
                <div className="form-group row">
                  <label htmlFor="phoneHash" className="col-sm-2 offset-sm-3 col-form-label">Phone Hash:</label>
                  <div className="col-sm-5">
                    <input
                      type="text"
                      id="phoneHash"
                      className={
                        "form-control" +
                        (phoneHashError == null ? "" : " is-invalid")
                      }
                      ref={(input) => {
                        this.phoneHash = input;
                      }}
                      placeholder="Phone Hash"
                    ></input>
                    <div className="invalid-feedback">
                      {phoneHashError}
                    </div>
                  </div>
                </div>
                <br></br>
                <div className="form-group row">
                <label htmlFor="phoneHash" className="col-sm-2 offset-sm-3 col-form-label">Period:</label>
                  <div className="col-sm-2">
                  <DatePicker
                    selected={startDate}
                    showTimeSelect
                    onChange={(date) => this.handeStartDateChange(date)}
                    dateFormat="MMMM d, yyyy h:mm aa"
                  />
                  <small id="startDateHelp" className="form-text text-muted">Start Date</small>
                  </div>
                  <div className="col-sm-2">
                  <DatePicker
                    selected={endDate}
                    showTimeSelect
                    onChange={(date) => this.handeEndDateChange(date)}
                    dateFormat="MMMM d, yyyy h:mm aa"
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
                      onClick={this.handleSearchCustomerActivitiesLog}
                    >
                      <b>Search</b>
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

  renderCustomerCareResult() {
    console.log("==> renderProposals");
    const { customerActivities } = this.state;
    return (
      <React.Fragment>
        <br></br>
        <div className="row">
          <div className="col-sm-12">
            <div className="card text-center">
              <div className="card-header">
                <strong>Search Results</strong>
              </div>
              {customerActivities != null && customerActivities.length > 0 ? (
                <div className="card-body">
                  <div className="row">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th scope="col">ID</th>
                          <th scope="col">Log</th>
                          <th scope="col">Date</th>
                          <th scope="col">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerActivities !== null &&
                          customerActivities.map((row, index) => (
                            <tr>
                              <td>{index}</td>
                              <td>{row["log"]}</td>
                              <td>{row["time"]}</td>
                              <td>{row["status"]}</td>
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
          {this.renderCustomerCareInfo()}
          {this.renderCustomerCareSearch()}
          {this.renderCustomerCareResult()}
        </div>
      </div>
    );
  }
}

export default Customers;
