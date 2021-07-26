import React, { Component } from "react";

import { Link } from "react-router-dom";

class NavBar extends Component {
  //state = {  }

  renderUserAccount() {
    if (this.props.userAccount === this.props.contractOwner) {
      return (
        <span className="badge rounded-pill bg-danger">
          {this.props.userAccount.substring(0, 5) +
            "..." +
            this.props.userAccount.substring(
              this.props.userAccount.length - 3,
              this.props.userAccount.length
            )}
        </span>
      );
    } else {
      return (
        <span className="badge rounded-pill bg-primary">
          {this.props.userAccount.substring(0, 5) +
            "..." +
            this.props.userAccount.substring(
              this.props.userAccount.length - 3,
              this.props.userAccount.length
            )}
        </span>
      );
    }
  }

  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            <img
              src="/images/timelapse_logo100.png"
              width="30"
              height="30"
              className="d-inline-block align-top"
              style={{ marginRight: 10 }}
              alt=""
            />
            Timelapse dApp
          </Link>
          {this.renderUserAccount()}
        </div>
      </nav>
    );
  }
}

export default NavBar;
