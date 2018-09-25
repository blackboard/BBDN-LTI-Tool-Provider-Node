import React from "react";

class SetupView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    fetch('setupData')
      .then(result => result.json())
      .then((setupData) => {
        this.setState({
          privateKey: setupData.privateKey,
          tokenEndPoint: setupData.tokenEndPoint,
          issuer: setupData.issuer,
          applicationId: setupData.applicationId,
          devPortalHost: setupData.devPortalHost
        });
      });
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) {
    alert('Setup Parameters updated');
  }

  render() {

    return(
      <div>
        <div><h3>Setup Parameters</h3></div>

        <div>
          <p>Some words here</p>
          <form action="/saveSetup" method="post" encType="application/x-www-form-urlencoded" onSubmit={this.handleSubmit}>
            <table>
              <tbody>
              <tr><td className="ci">Issuer</td><td className="ci"><input className="ci" type="text" name="issuer" value={this.state.issuer} onChange={this.handleChange} /></td></tr>
              <tr><td className="ci">OAuth2 token<br/>End Point</td><td className="ci"><input className="ci" type="text" name="tokenEndPoint" value={this.state.tokenEndPoint} onChange={this.handleChange} /></td></tr>
              <tr><td className="ci">Application Id</td><td className="ci"><input className="ci" type="text" name="applicationId" value={this.state.applicationId} onChange={this.handleChange} /></td></tr>
              <tr><td className="ci">Dev Portal Host</td><td className="ci"><input className="ci" type="text" name="devPortalHost" value={this.state.devPortalHost} onChange={this.handleChange} /></td></tr>
              <tr><td className="ci">Private Key</td><td className="ci"><textarea className="ci" cols="80" rows="30" name="privateKey" value={this.state.privateKey} onChange={this.handleChange} /></td></tr>
              </tbody>
            </table>
            <input type="submit" value="Submit" />
          </form>
        </div>
      </div>
    )
  }
}

module.exports = SetupView;
