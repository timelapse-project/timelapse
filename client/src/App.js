import React, { Component } from "react";
import TimelapseContract from "./contracts/Timelapse.json";
import OfferingContract from "./contracts/Offering.json";
import BillingContract from "./contracts/Billing.json";
import getWeb3 from "./getWeb3";

import "./App.css";
import NavBar from "./components/navbar";
import Home from "./components/home";
import Proposals from "./components/proposals";
import Events from "./components/events";
import Customers from "./components/customers";
import Reporting from "./components/reporting";
import Invoicing from "./components/invoicing";
import { BrowserRouter as Router, Route } from "react-router-dom";

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    timelapseInstance: null,
    offeringInstance: null,
    contractOwner: null,
    proposalsCount: null,
    proposalList: null,
    eventLog: [],
    proposalDescriptionError: null,
  };

  componentWillMount = async () => {
    console.log("==> componentWillMount");
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const timelapseNetwork = TimelapseContract.networks[networkId];
      const timelapseInstance = new web3.eth.Contract(
        TimelapseContract.abi,
        timelapseNetwork && timelapseNetwork.address
      );

      const offeringNetwork = OfferingContract.networks[networkId];
      const offeringInstance = new web3.eth.Contract(
        OfferingContract.abi,
        offeringNetwork && offeringNetwork.address
      );

      const billingNetwork = BillingContract.networks[networkId];
      const billingInstance = new web3.eth.Contract(
        BillingContract.abi,
        billingNetwork && billingNetwork.address
      );

      // Set a timer to refresh the page every 10 seconds
      this.updateTimer = setInterval(() => this.runInit(), 10000);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, timelapseInstance, offeringInstance, billingInstance }, this.runInit);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  runInit = async () => {
    console.log("==> runInit");

    const { timelapseInstance } = this.state;
    const contractOwner = await timelapseInstance.methods.owner().call();

    this.setState({
      contractOwner: contractOwner,
    });
  };

  render() {
    console.log("==> render");
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <React.Fragment>
        <Router>
          <NavBar
            contractOwner={this.state.contractOwner}
            userAccount={this.state.accounts[0]}
          />
          <Route path="/" exact>
            <Home
              web3={this.state.web3}
              accounts={this.state.accounts}
              timelapseInstance={this.state.timelapseInstance}
            />
          </Route>
          <Route path="/proposals" exact>
            <Proposals
              web3={this.state.web3}
              accounts={this.state.accounts}
              timelapseInstance={this.state.timelapseInstance}
              offeringInstance={this.state.offeringInstance}
            />
          </Route>
          <Route path="/events" exact>
            <Events
              web3={this.state.web3}
              accounts={this.state.accounts}
              timelapseInstance={this.state.timelapseInstance}
            />
          </Route>
          <Route path="/customers" exact>
            <Customers
              web3={this.state.web3}
              accounts={this.state.accounts}
              timelapseInstance={this.state.timelapseInstance}
            />
          </Route>
          <Route path="/reporting" exact>
            <Reporting
              web3={this.state.web3}
              accounts={this.state.accounts}
              timelapseInstance={this.state.timelapseInstance}
            />
          </Route>
          <Route path="/invoicing" exact>
            <Invoicing
              web3={this.state.web3}
              accounts={this.state.accounts}
              timelapseInstance={this.state.timelapseInstance}
            />
          </Route>
        </Router>
      </React.Fragment>
    );
  }
}

export default App;
