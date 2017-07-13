import React from "react";
import JSONTree from "react-json-tree";
import {Button, ControlLabel, FormControl, FormGroup} from "react-bootstrap";
import Response from "./response";
const learnUrl = 'http://localhost:8543';

class LaunchEndpoint extends React.Component {
  constructor(props) {
    super(props);
    this.state = {request: {}};
    this.sendResult = this.sendResult.bind(this);
    this.getResult = this.getResult.bind(this);
  }

  componentDidMount() {
    fetch('launchendpointactivity')
      .then(result => result.json())
      .then((response) => {
        let registrationData = response.registrationData;
        let requestBody = response.requestBody;
        let launch_return_url = registrationData ? registrationData.TCProfileResponse.launch_presentation_return_url : 'unknown';

        this.setState({
          response: null,
          sourcedId: requestBody.lis_result_sourcedid,
          request: requestBody,
          toolProxy: response.toolProxy
        });
      })
  }

  handleResultChange(event) {
    this.setState({resultText: event.target.value});
  }

  getResult() {

    fetch(learnUrl + '/learn/api/v1/lti/external/result/' + this.state.sourcedId, {
      method: 'GET',

      headers: {
        'Accept': 'application/vnd.ims.lis.v2.result+json',
        'key': this.state.request.oauth_consumer_key,
        'secret': this.state.toolProxy.security_contract.shared_secret
      }
    })
      .then(res => {

          let preResponse = {status: res.status, message: res.statusText, body: ''};

          try {
            res.json().then((result) => {
                this.setState({
                  response: {
                    status: preResponse.status,
                    message: preResponse.message,
                    body: JSON.stringify(result)
                  }
                })
              }
            );
          }

          catch (error) {
            console.error(error);
          }
        });
  }


  sendResult() {
    try {

      if (!this.state.sourcedId) {
        return;
      }
      fetch(learnUrl + '/learn/api/v1/lti/external/result/' + this.state.sourcedId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/vnd.ims.lis.v2.result+json',
          'key': this.state.request.oauth_consumer_key,
          'secret': this.state.toolProxy.security_contract.shared_secret
        },
        body: JSON.stringify({
          "@context": "http://purl.imsglobal.org/ctx/lis/v2/Result",
          "@type": "Result",
          "result_score": this.state.resultText,
          "comment": "This is exceptional work."
        })
      })
        .then((res) => {

          this.setState({response: {status: res.status, body: 'N/A', message: res.statusText}});
        });
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="large-6 columns"><h2>LTI 2.0 Demo Tool Provider</h2></div>
        </div>

        <div className="row">
          <div className="large-9 columns">
            <b>Launch Request</b>
          </div>
        </div>

        <div className="row">
          <div className="large-9 columns"><JSONTree data={this.state.request} hideRoot={true}/></div>
        </div>

        <div className="row">
          <div className="large-9 columns">
            <b>Outcomes</b>
          </div>
        </div >
        <div className="row">
          <div className="large-9 columns">
            <FormGroup>

              <ControlLabel>Result (0 - 1)</ControlLabel>
              <FormControl type="text" onChange={(event)=>this.handleResultChange(event)}
                           placeholder="0.0"/>

              <Button onClick={this.sendResult}>Send Result</Button>
            </FormGroup>
            <FormGroup>

              <Button onClick={this.getResult}>Get Result</Button>
            </FormGroup>
          </div>
        </div>
        <div className="row">
          <div className="large-9 columns">
            <Response response={this.state.response}/>
          </div>
        </div>
      </div>
    )
  }
}

module.exports = LaunchEndpoint;