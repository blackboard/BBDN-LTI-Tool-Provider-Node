import Button from "@material-ui/core/Button/index";
import TextField from "@material-ui/core/TextField/index";
import Typography from "@material-ui/core/Typography/index";
import React, { Component } from "react";
import { openSnackbar } from "../page_objects/snackbar";

class SetupView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultAppKey: '',
      defaultAppSecret: '',
      defaultPrivateKey: '',
      defaultPublicKey: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    fetch("setupData")
      .then(result => result.json())
      .then(setupData => {
        this.setState(setupData);
      });
  }

  handleSubmit() {
    const data = new URLSearchParams(this.state);
    let setupData = JSON.stringify(this.state);
    //console.log("body", setupData);
    fetch("/saveSetup", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: data
    }).then(result => {
      if (result.status === 200) openSnackbar({ message: "Settings saved!" });
    });
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  render() {
    return (
      <div>
        <Typography variant="h4" gutterBottom component="h2">
          LTI Advantage Settings
        </Typography>
        <br />
        <form id={"setupForm"}>
          <TextField
            required
            label="Developer Portal URL"
            variant="outlined"
            fullWidth={true}
            InputLabelProps={{
              shrink: true
            }}
            name={"devPortalHost"}
            value={this.state.devPortalHost || ""}
            onInput={this.handleChange}
          />
          <br />
          <br />
          <TextField
            required
            label="Application ID"
            variant="outlined"
            fullWidth={true}
            InputLabelProps={{
              shrink: true
            }}
            name={"applicationId"}
            value={this.state.applicationId || ""}
            onInput={this.handleChange}
          />
          <br />
          <br />
          <TextField
            required
            label="OAuth2 Token End Point"
            variant="outlined"
            fullWidth={true}
            InputLabelProps={{
              shrink: true
            }}
            name={"tokenEndPoint"}
            value={this.state.tokenEndPoint || ""}
            onInput={this.handleChange}
          />
          <br />
          <br />
          <TextField
            required
            label="OIDC Auth URL"
            variant="outlined"
            fullWidth={true}
            InputLabelProps={{
              shrink: true
            }}
            name={"oidcAuthUrl"}
            value={this.state.oidcAuthUrl || ""}
            onInput={this.handleChange}
          />
          <br />
          <br />
          <TextField
            required
            label="Issuer"
            variant="outlined"
            fullWidth={true}
            InputLabelProps={{
              shrink: true
            }}
            name={"issuer"}
            value={this.state.issuer || ""}
            onInput={this.handleChange}
          />
          <br />
          <br />
          <Button
            id={"save_button"}
            variant="contained"
            color="secondary"
            onClick={this.handleSubmit}>
            Save
          </Button>
        </form>

        <div>
          <p>
          Your cookies: {JSON.stringify(this.state.cookies)}
          </p>
          <p>
          Your external host: {this.state.host}
          </p>
        </div>
      </div>
    );
  }
}

export default SetupView;
