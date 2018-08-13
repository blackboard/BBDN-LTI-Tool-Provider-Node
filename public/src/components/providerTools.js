import React from 'react';
import ReactDOM from 'react-dom';
import Response from './response'
import {Button, ButtonToolbar, FormGroup, FormControl, ControlLabel} from 'react-bootstrap';
import ToolProxyList from './toolProxyList'

const learnUrl = 'http://localhost:8543';

class ProviderTools extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      responseMessage: '',
      selectedToolProxy: null,
      textArea: ''
    };

    // This binding is necessary to make `this` work in the callback
    this.putToolSettings = this.putToolSettings.bind(this);
    this.getToolSettings = this.getToolSettings.bind(this);
  }

  handleTextAreaChange(event) {
    this.setState({textArea: event.target.value});
  }

  onSelectToolProxy(selected) {
    this.setState({selectedToolProxy: selected});
  }

  getToolSettings() {

    fetch(learnUrl + '/learn/api/v1/lti/external/toolsettings/toolproxy/' + this.state.selectedToolProxy.tool_proxy_guid, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.ims.lti.v2.toolsettings.simple+json',
        'key': this.state.selectedToolProxy.tool_proxy_guid,
        'secret': this.state.selectedToolProxy.security_contract.shared_secret
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

  putToolSettings() {
    try {
      fetch(learnUrl + '/learn/api/v1/lti/external/toolsettings/toolproxy/' + this.state.selectedToolProxy.tool_proxy_guid, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/vnd.ims.lti.v2.toolsettings.simple+json',
          'key': this.state.selectedToolProxy.tool_proxy_guid,
          'secret': this.state.selectedToolProxy.security_contract.shared_secret
        },
        body: this.state.textArea
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
      <div >
        <div className="row">
          <div className="large-6 columns"><h2>LTI Demo Tool Provider</h2></div>
        </div>

        <div className="row">
          <div className="large-4 columns">Provider Tools</div>
        </div>

        <div className="row">
          <div className="large-4 columns">

            <FormGroup>
              <ToolProxyList onSelect={(selected)=>this.onSelectToolProxy(selected)}/>
            </FormGroup>
            <FormGroup>

              <ControlLabel>Body to send with PUT</ControlLabel>
              <FormControl componentClass="textarea" onChange={(event)=>this.handleTextAreaChange(event)}
                           placeholder="textarea"/>

            </FormGroup>
            <FormGroup>
              <ButtonToolbar>
                <Button onClick={this.putToolSettings}>PUT ToolSettings</Button>

                <Button onClick={this.getToolSettings}>GET ToolSettings</Button>
              </ButtonToolbar>
            </FormGroup>
            <FormGroup>
              <ControlLabel>Response</ControlLabel>
              <Response response={this.state.response}/>
            </FormGroup>
          </div>
        </div>
      </div>

    );
  }
}


module.exports = ProviderTools;